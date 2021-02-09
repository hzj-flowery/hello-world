--用户数据帮助类
--主要是转换一些用户数据格式，方便UI更新

local UserDataHelper = {}

local attribute = require("app.config.attribute")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local ShopInfo = require("app.config.shop")
local TextHelper = require("app.utils.TextHelper")

local function addFunctions(functions)
	-- 添加check
	for k, v in pairs(functions) do
		assert(not UserDataHelper[k], "There is an another check named: " .. tostring(k))
		UserDataHelper[k] = v
	end
end

addFunctions(import(".data.ShopDataHelper"))
addFunctions(import(".data.VipDataHelper"))
addFunctions(import(".data.HeroDataHelper"))
addFunctions(import(".data.EquipDataHelper"))
addFunctions(import(".data.TreasureDataHelper"))
addFunctions(import(".data.TeamDataHelper"))
addFunctions(import(".data.GuildDataHelper"))
addFunctions(import(".data.InstrumentDataHelper"))
addFunctions(import(".data.UserDetailDataHelper"))
addFunctions(import(".data.MailDataHelper"))

addFunctions(import(".data.PetDataHelper"))
addFunctions(import(".data.GuildDungeonDataHelper"))
addFunctions(import(".data.ActivityDataHelper"))
addFunctions(import(".data.ChatDataHelper"))
addFunctions(import(".data.ActivityGuildSprintDataHelper"))
addFunctions(import(".data.TimeLimitActivityDataHelper"))
addFunctions(import(".data.HistoryHeroDataHelper"))

--[[
local parameter = {
	[1] = "hp",
	[2] = "mp"
}
function UserDataHelper.getAttrList()

end
]]
--获取英雄可变数据
function UserDataHelper.getHeroChangeData(heroId)
	local heroMgr = G_UserData:getHero()
	local hero = heroMgr:getUnitDataWithId(heroId)

	local changeList = {}

	assert(hero, "can't find hero data by hero id = " .. heroId)

	local function findIdByKey(keyName)
		for i = 1, attribute.length() do
			local data = attribute.indexOf(i)
			if data.en_name == keyName then
				return data
			end
		end
		return nil
	end

	local function saveChangeData(key, newValue, oldValue)
		--新旧数据有变化

		--logDebug(" getHeroChangeData key to chinese "..key)
		local attrData = findIdByKey(key)

		if attrData then
			local changeData = {
				key = key,
				attrId = attrData.id,
				desc = attrData.cn_name,
				heroId = heroId,
				oldValue = oldValue,
				newValue = newValue
			}
			table.insert(changeList, changeData)
		end
	end

	for key, value in pairs(hero.class.schema) do
		local newValue = checknumber(hero["get" .. key:ucfirst()](hero))
		local oldValue = checknumber(hero["getLast" .. key:ucfirst()](hero))

		--logDebug("key = "..key.." curr = "..newValue.." old = "..oldValue)
		if type(newValue) == "number" and type(oldValue) == "number" then
			if newValue ~= oldValue then
				saveChangeData(key, newValue, oldValue)
			end
		end
	end

	return changeList
end

--获取资源最大使用上限
--例如体力丹， 一个 增加25点， 则最大上限是500
function UserDataHelper.getResItemMaxUseNum(itemId)
	local function filterItem(itemId)
		if itemId == DataConst.ITEM_VIT or itemId == DataConst.ITEM_SPIRIT or itemId == DataConst.ITEM_TOKEN then
			return true
		end

		-- 粮草令
		--[[if itemId == DataConst.ITEM_ARMY_FOOD then
            return true
        end]]
		return false
	end

	if filterItem(itemId) == false then
		local itemData = require("app.config.item").get(itemId)
		if itemData == nil then
			return 0
		end
		--成对物品，例如黄金宝箱使用，需要消耗黄金钥匙
		if itemData.item_type == 8 or itemData.item_type == 14 then
			local itemNum1 = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemData.id)
			local itemNum2 = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, tonumber(itemData.key_value))

			return math.min(itemNum1, itemNum2)
		elseif itemData.item_type == 9 then -- 秦皇陵上中下物品合成
			local itemNum1 = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemData.id)
			local valueList = string.split(itemData.key_value, "|") or {}
			for i, value in ipairs(valueList) do
				local itemNum2 = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, tonumber(value))
				itemNum1 = math.min(itemNum1, itemNum2)
			end
			return itemNum1
		end

		local DataConst = require("app.const.DataConst")
		if DataConst.JADE_STONE_BOX[itemId] then -- 原石最大使用数量
			return require("app.const.JadeStoneConst").MAX_USER_NUM
		end

		return -1
	end

	local itemData = require("app.config.item").get(itemId)
	if itemData == nil then
		return -1
	end

	local dropData = require("app.config.drop").get(itemData.item_value)
	if dropData == nil then
		return -1
	end

	local recoverData = require("app.config.recover").get(dropData.value_1)
	if recoverData == nil then
		return -1
	end

	local oneSize = dropData.size_1 or 1
	local currSize = UserDataHelper.getNumByTypeAndValue(dropData.type_1, dropData.value_1)
	local maxLimit = recoverData.client_limit

	local useNum = math.ceil((maxLimit - currSize) / oneSize)

	return useNum
end

function UserDataHelper.checkResourceLimit(goodId)
	local recoverData = require("app.config.recover").get(goodId)
	if recoverData == nil then
		return 0
	end
	return recoverData.client_limit
end

--根据物品Type，Value， 返回物品数量
function UserDataHelper.getNumByTypeAndValue(type, value)
	local baseMgr = G_UserData:getBase()

	--战力类型比较特殊
	if type == TypeConvertHelper.TYPE_POWER then
		return baseMgr:getPower()
	end

	if type == TypeConvertHelper.TYPE_ITEM then
		local itemMgr = G_UserData:getItems()
		local itemNum = itemMgr:getItemNum(value)
		return itemNum
	end
	if type == TypeConvertHelper.TYPE_FRAGMENT then
		local fragMgr = G_UserData:getFragments()
		local itemNum = fragMgr:getFragNumByID(value)
		return itemNum
	end

	if type == TypeConvertHelper.TYPE_HERO then
		local heroMgr = G_UserData:getHero()
		--local itemNum = heroMgr:getFragNumByID(value)
		local heroNum = G_UserData:getHero():getHeroCountWithBaseId(value)
		return heroNum
	end

	if type == TypeConvertHelper.TYPE_TREASURE then
		local treasureNum = G_UserData:getTreasure():getTreasureCountWithBaseId(value)
		return treasureNum
	end

	if type == TypeConvertHelper.TYPE_PET then
		local petNum = G_UserData:getPet():getPetCountWithBaseId(value)
		return petNum
	end

	--资源类型
	if type == TypeConvertHelper.TYPE_RESOURCE then
		local size = baseMgr:getResValue(value)
		return size
	end

	if type == TypeConvertHelper.TYPE_GEMSTONE then
		local unitData = G_UserData:getGemstone():getUnitDataWithId(value)
		local num = unitData and unitData:getNum() or 0
		return num
	end

	if type == TypeConvertHelper.TYPE_HORSE then
		local num = G_UserData:getHorse():getHorseCountWithBaseId(value)
		return num
	end

	if type == TypeConvertHelper.TYPE_SILKBAG then
		return G_UserData:getSilkbag():getCountWithBaseId(value)
	end

	if type == TypeConvertHelper.TYPE_EQUIPMENT then
		local ids = G_UserData:getEquipment():getEquipmentIdsWithBaseId(value)
		local count = #ids
		for i = 1, count do
			local data = G_UserData:getEquipment():getEquipmentDataWithId(ids[i])
			if data:isInBattle() or not data:isBlackPlat() then
				count = count - 1
			end
		end
		return count
	end

	return 0
end

function UserDataHelper.getServerRecoverNum(resId)
	local baseMgr = G_UserData:getBase()
	local recoverData = baseMgr:getServerRecoverData(resId)

	if recoverData then
		return recoverData.num
	end

	return 0
end

--根据资源ID，返回该资源的刷新时间
function UserDataHelper.getRefreshTime(resId)
	--资源类型
	local baseMgr = G_UserData:getBase()
	local name = DataConst.getResName(resId)
	local recoverData = baseMgr:getRecoverData(resId)

	if recoverData then
		return recoverData.time
	end

	return 0
end

--根据资源Id，更新回复后的数据
function UserDataHelper.updateRecorverNum(resId, value)
	--资源类型

	local baseMgr = G_UserData:getBase()

	local recoverData = require("app.config.recover").get(resId)
	if recoverData == nil then
		return 0
	end

	--到达最高上限
	if value > recoverData.client_limit then
		value = recoverData.client_limit
	end

	baseMgr:setRecoverData(resId, value)
	--local resName = DataConst.getResName(resId)

	--logDebug( string.format( "DataConst.getResName: %s", resName) )

	--	local funcName = "set"..resName:ucfirst()

	--	baseMgr[funcName](baseMgr, value)

	--logDebug( string.format( funcName.." DataConst.setValue:  %d", value) )

	return 0
end

--判断物品id是否可以合成
function UserDataHelper.isFragmentCanMerage(fragmentId)
	local number = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local config = itemParam.cfg

	if number >= config.fragment_num then
		return true, config
	end

	return false, config
end

--是否显示弹出一次对话框
function UserDataHelper.getPopModuleShow(moduleDataName)
	local isShow = G_UserData:getPopModuleShow(moduleDataName)

	return isShow
end

function UserDataHelper.setPopModuleShow(moduleDataName, needShow)
	G_UserData:setPopModuleShow(moduleDataName, needShow)
end

--获取在线时间描述
function UserDataHelper.getOnlineText(time)
	local text = ""
	local color = nil
	if time == 0 then
		text = Lang.get("guild_txt_online")
		color = Colors.BRIGHT_BG_GREEN
	else
		local sec = G_ServerTime:getTime() - time
		text = Lang.get("guild_txt_offline", {time = G_ServerTime:getDayOrHourOrMinFormat(sec)})
		color = Colors.BRIGHT_BG_TWO
	end

	return text, color
end

--@originalPrice:原始价格
--@discountPrice：折扣价格
function UserDataHelper.calcDiscount(originalPrice, discountPrice)
	if originalPrice == 0 then
		return 0
	end
	return math.floor((discountPrice / originalPrice) * 10 + 0.5)
end

--拆分数字成4位数
function UserDataHelper.splitNumber(num)
	local arrNum = 4
	local arr = {}
	for i = 1, arrNum, 1 do
		local num1 = num % 10
		num = math.floor((num - num1) / 10)
		table.insert(arr, num1)
	end
	return arr
end

function UserDataHelper.makeRewards(cfg, maxNum, prefix)
	prefix = prefix or ""
	local rewardList = {}
	maxNum = maxNum or 4
	for i = 1, maxNum, 1 do
		if cfg[prefix .. "type_" .. i] ~= 0 then
			local reward = {
				type = cfg[prefix .. "type_" .. i],
				value = cfg[prefix .. "value_" .. i],
				size = cfg[prefix .. "size_" .. i]
			}

			table.insert(rewardList, reward)
		end
	end
	return rewardList
end

function UserDataHelper.makePreviewBossRewards(cfg, maxNum, prefix, bossInfo)
	prefix = prefix or "reward_type_"
	local rewardTypeList = {}
	maxNum = maxNum or 4
	for i = 1, maxNum, 1 do
		if cfg[prefix .. i] ~= 0 then
			table.insert(rewardTypeList, cfg[prefix .. i])
		end
	end
	--1-代表普通道具
	--2-代表随机到的boss整将
	--3-代表随机到的boss碎片
	--4-代表随机到的boss对应的神兵整件
	--5-代表随机到的boss对应的橙品质锦囊
	--101-代表随机到的boss对应的橙锦囊1
	--102-代表随机到的boss对应的橙锦囊2

	local bossHeroId = bossInfo.hero_id
	local heroConfig = require("app.config.hero").get(bossHeroId)
	assert(heroConfig, string.format("hero config can not find id = %d", bossHeroId))
	local rewardList = {}
	for k, v in ipairs(rewardTypeList) do
		if v == 1 then
		elseif v == 2 then
			--插入Boss整将
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_HERO, value = bossHeroId, size = 1})
		elseif v == 3 then
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_FRAGMENT, value = heroConfig.fragment_id, size = 1}) --插入Boss碎片
		elseif v == 4 then
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_INSTRUMENT, value = heroConfig.instrument_id, size = 1}) --插入神兵整件
		elseif v == 5 then
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_SILKBAG, value = bossInfo.silk_bag, size = 1}) --紫色品质锦囊
		elseif v == 101 then
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_SILKBAG, value = bossInfo.silk_bag101, size = 1}) --对应橙锦囊1
		elseif v == 102 then
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_SILKBAG, value = bossInfo.silk_bag102, size = 1}) --对应橙锦囊2
		end
	end
	return rewardList
end

function UserDataHelper.makePreviewCrossBossRewards(cfg, maxNum, prefix, bossInfo)
	prefix = prefix or "reward_type_"
	local rewardTypeList = {}
	maxNum = maxNum or 4
	for i = 1, maxNum, 1 do
		if cfg[prefix .. i] ~= 0 then
			table.insert(rewardTypeList, cfg[prefix .. i])
		end
	end

	--2-代表随机到boss对应红将整将
	--3-代表随机到boss对应红将碎片
	--4-代表随机到boss对应红将的神兵整件
	--5-代表随机到boss对应金将整将
	--6-代表随机到的boss对应金将碎片
	--7-代表随机到的boss对应金将神兵整件

	local goldBossHeroId = bossInfo.hero_id
	local goldHeroConfig = require("app.config.hero").get(goldBossHeroId)
	assert(goldHeroConfig, string.format("hero config can not find id = %d", goldBossHeroId))

	local redBossHeroId = bossInfo.red_hero_id
	local redHeroConfig = require("app.config.hero").get(redBossHeroId)
	assert(redHeroConfig, string.format("hero config can not find id = %d", redBossHeroId))

	local rewardList = {}
	for k, v in ipairs(rewardTypeList) do
		if v == 1 then
		elseif v == 2 then
			--插入红将Boss整将
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_HERO, value = redBossHeroId, size = 1})
		elseif v == 3 then
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_FRAGMENT, value = redHeroConfig.fragment_id, size = 1}) --插入红将Boss碎片
		elseif v == 4 then
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_INSTRUMENT, value = redHeroConfig.instrument_id, size = 1}) --插入红神兵整件
		elseif v == 5 then
			--插入金将Boss整将
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_HERO, value = goldBossHeroId, size = 1})
		elseif v == 6 then
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_FRAGMENT, value = goldHeroConfig.fragment_id, size = 1}) --插入金将Boss碎片
		elseif v == 7 then
			table.insert(rewardList, {type = TypeConvertHelper.TYPE_INSTRUMENT, value = goldHeroConfig.instrument_id, size = 1}) --插入金神兵整件
		end
	end
	return rewardList
end

function UserDataHelper.getUpgradeAttrData(lastLevel, currLevel)
	local Role = require("app.config.role")
	local attr = {lvup_power = 0, lvup_energy = 0}
	for i = lastLevel, currLevel - 1, 1 do
		local roleCfgData = Role.get(i)
		assert(roleCfgData, "role can not find by level is" .. i)
		attr.lvup_power = attr.lvup_power + roleCfgData.lvup_power
		attr.lvup_energy = attr.lvup_energy + roleCfgData.lvup_energy
	end
	return attr
end

--更新英雄右上角图片
function UserDataHelper.getHeroTopImage(baseId)
	local CommonConst = require("app.const.CommonConst")
	--上阵
	local needShow = G_UserData:getTeam():isInBattleWithBaseId(baseId)
	if needShow then
		local res = Path.getTextSignet("img_iconsign_shangzhen")

		return res, CommonConst.HERO_TOP_IMAGE_TYPE_INBATTLE
	end

	--缘分
	needShow = UserDataHelper.isHaveKarmaWithHeroBaseId(baseId)
	if needShow then
		local res = Path.getTextSignet("img_iconsign_mingjiangce")

		return res, CommonConst.HERO_TOP_IMAGE_TYPE_KARMA
	end

	--羁绊
	needShow = UserDataHelper.isShowYokeMark(baseId)
	if needShow then
		local res = Path.getTextSignet("img_iconsign_jiban")

		return res, CommonConst.HERO_TOP_IMAGE_TYPE_YOKE
	end
	return nil
end

-- 更新宝物右上角图片
function UserDataHelper.getTreasureTopImage(treasureId)
	local HeroDataHelper = require("app.utils.data.HeroDataHelper")
	local CommonConst = require("app.const.CommonConst")
	local needShow = HeroDataHelper.isHaveYokeToBattleWarriorByTreasureId(treasureId)
	if needShow then
		local res = Path.getTextSignet("img_iconsign_jiban")

		return res, CommonConst.TREASURE_TOP_IMAGE_TYPE_YOKE
	else
		return nil
	end
end

function UserDataHelper.getParameter(id)
	--local ParameterIDConst = require("app.const.ParameterIDConst")
	local Parameter = require("app.config.parameter")
	local config = Parameter.get(id)
	assert(config, "parameter can't find id:" .. tostring(id))
	if tonumber(config.content) then
		return tonumber(config.content)
	end
	return config.content
end

--获取同名卡的数量
function UserDataHelper.getSameCardCount(type, value, filterId)
	local count = 0
	if type == TypeConvertHelper.TYPE_HERO then
		count = #G_UserData:getHero():getSameCardCountWithBaseId(value, filterId)
	elseif type == TypeConvertHelper.TYPE_TREASURE then
		count = #G_UserData:getTreasure():getSameCardsWithBaseId(value)
	elseif type == TypeConvertHelper.TYPE_INSTRUMENT then
		count = #G_UserData:getInstrument():getSameCardsWithBaseId(value)
	elseif type == TypeConvertHelper.TYPE_ITEM then
		count = G_UserData:getItems():getItemNum(value)
	elseif type == TypeConvertHelper.TYPE_PET then
		count = #G_UserData:getPet():getSameCardCountWithBaseId(value, filterId)
	elseif type == TypeConvertHelper.TYPE_HORSE then
		count = #G_UserData:getHorse():getSameCardsWithBaseId(value, filterId)
	end
	return count
end

function UserDataHelper.convertAvatarId(serverData)
	-- body
	local table = UserDataHelper._convertServerData(serverData)
	return table.covertId, table
end

--根据avatarBaseId转换为用于显示的heroBaseId
function UserDataHelper.convertToBaseIdByAvatarBaseId(avatarBaseId, heroBaseId)
	local baseId = heroBaseId
	local limit = 0
	if avatarBaseId and avatarBaseId > 0 then
		local avatarConfig = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarBaseId)
		local isRed = avatarConfig.limit
		if isRed == 1 then
			limit = 3
		end
		baseId = avatarConfig.hero_id
	end
	return baseId, limit
end

--转换服务器数据
function UserDataHelper._convertServerData(serverData)
	--换算变身卡数据
	local table = {}

	--因为服务器名称不对,这个函数就是将返回数据统一
	--需要各个模块负责人自己添加需要的
	local function getBaseId(serverData)
		-- body

		if rawget(serverData, "base_id") then
			return rawget(serverData, "base_id")
		end

		if rawget(serverData, "sender_base_id") then
			return rawget(serverData, "sender_base_id")
		end

		if rawget(serverData, "recive_base_id") then
			return rawget(serverData, "recive_base_id")
		end

		if rawget(serverData, "leader_base_id") then
			return rawget(serverData, "leader_base_id")
		end

		if rawget(serverData, "leader") then
			return rawget(serverData, "leader")
		end

		if rawget(serverData, "base_id_") then
			return rawget(serverData, "base_id_")
		end

		if rawget(serverData, "baseId") then
			return rawget(serverData, "baseId")
		end

		return 0
	end
	--因为服务器名称不对,这个函数就是将返回数据统一
	--需要各个模块负责人自己添加需要的
	local function getAvataId(serverData)
		-- body
		if rawget(serverData, "avatar_base_id") then
			return rawget(serverData, "avatar_base_id")
		end

		if rawget(serverData, "recive_avatar_base_id") then
			return rawget(serverData, "recive_avatar_base_id")
		end

		if rawget(serverData, "sender_avatar_base_id") then
			return rawget(serverData, "sender_avatar_base_id")
		end

		if rawget(serverData, "leader_avater_base_id") then
			return rawget(serverData, "leader_avater_base_id")
		end

		if rawget(serverData, "avatar") then
			return rawget(serverData, "avatar")
		end

		if rawget(serverData, "avatar_base_id_") then
			return rawget(serverData, "avatar_base_id_")
		end

		if rawget(serverData, "avatarBaseId") then
			return rawget(serverData, "avatarBaseId")
		end

		return 0
	end

	table.baseId = getBaseId(serverData)
	table.avatarBaseId = getAvataId(serverData)
	table.covertId, table.limitLevel = UserDataHelper.convertToBaseIdByAvatarBaseId(table.avatarBaseId, table.baseId)
	table.isHasAvatar = table.avatarBaseId and table.avatarBaseId > 0

	return table
end

--根据key返回parameter表的值
function UserDataHelper.getParameterValue(keyIndex)
	local parameter = require("app.config.parameter")
	for i = 1, parameter.length() do
		local value = parameter.indexOf(i)
		if value.key == keyIndex then
			return tonumber(value.content)
		end
	end
	assert(false, " can't find key index in parameter " .. keyIndex)
end

-- 是否到达背包合并等级
-- 当到达80级之后装备、宝物、神兵内容合入背包
function UserDataHelper.isEnoughBagMergeLevel()
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local FunctionConst = require("app.const.FunctionConst")
	return FunctionCheck.funcIsOpened(FunctionConst.FUNC_ICON_MERGE)
end

--[[data = {
mouduleName 模块名称
titleId = 称号id
--}]]
function UserDataHelper.appendNodeTitle(node, titleId, moduleName)
	if not node or not titleId or not moduleName then
		return
	end
	local HonorTitleConst = require("app.const.HonorTitleConst")
	local config = HonorTitleConst.TITLE_CONFIG
	local pos = config[moduleName][HonorTitleConst.CONFIG_INDEX_POS]
	local scale = config[moduleName][HonorTitleConst.CONFIG_INDEX_SCALE]
	local isEffect = config[moduleName][HonorTitleConst.CONFIG_INDEX_EFFECT]
	local isOffset = config[moduleName][HonorTitleConst.CONFIG_INDEX_OFFSET]
	UserDataHelper._showNodeTitle(node, titleId > 0, titleId, pos, scale, isEffect, isOffset)
end

--
-- 显示玩家模型头上称号
-- node 显示节点
-- isShow 是否显示
-- titleId 称号id
-- pos 显示位置
-- scale 缩放
-- isEffect 特效
--
function UserDataHelper._showNodeTitle(node, isShow, titleId, pos, scale, isEffect, isOffset)
	local titleImg = node:getChildByName("titleImg")
	local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
	if not titleImg then
		titleImg = ccui.ImageView:create()
		titleImg:ignoreContentAdaptWithSize(true)
		titleImg:setName("titleImg")
		node:addChild(titleImg)
	end
	if not isShow then
		titleImg:setVisible(isShow)
		return
	end
	local config = PopupHonorTitleHelper.getConfigByTitleId(titleId)
	pos = isOffset and cc.p(pos.x + config.offset_x, pos.y + config.offset_y) or pos
	titleImg:setPosition(pos)
	titleImg:setScale(scale)
	local res = PopupHonorTitleHelper.getTitleImg(titleId)
	--titleImg:loadTexture(res)
	titleImg:setVisible(isShow)
	titleImg:removeAllChildren()
	if isEffect and config.moving ~= "" then
		titleImg:loadTexture("")
		G_EffectGfxMgr:createPlayGfx(titleImg, config.moving)
	else
		titleImg:loadTexture(res)
	end
end

return UserDataHelper
