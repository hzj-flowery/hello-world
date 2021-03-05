--
-- Author: Liangxu
-- Date: 2017-9-11 15:40:53
-- 神兵模块数据封装类
local InstrumentDataHelper = {}
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local HeroConst = require("app.const.HeroConst")
local InstrumentConst = require("app.const.InstrumentConst")

function InstrumentDataHelper.getInstrumentConfig(baseId)
	local info = require("app.config.instrument").get(baseId)
	assert(info, string.format("instrument config can not find id = %d", baseId))
	return info
end

function InstrumentDataHelper.getInstrumentRankConfig(rankId, limitLevel)
	local info = require("app.config.instrument_rank").get(rankId, limitLevel)
	assert(info, string.format("instrument_rank config can not find rank_id = %d, instrument_id = %d", rankId, limitLevel))
	return info
end

--获取强化属性
function InstrumentDataHelper.getInstrumentAttrInfo(data, addLevel)
	local result = {}
	local tempLevel = addLevel or 0
	local config = data:getConfig()
	local level = data:getLevel() + tempLevel
	local templet = data:getAdvacneTemplateId()

	local maxLevel = config.level_max
	if level > config.level_max then --等级超过了最大等级，返回空
		return nil
	end

	result = InstrumentDataHelper.getInstrumentLevelAttr(level, templet)
	if data:isUnlockSecond() then
		local attrType = config.talent_attr_1
		local attrValue = config.talent_value_1
		AttrDataHelper.formatAttr(result, attrType, attrValue)
	end
	return result
end

--
function InstrumentDataHelper.getInstrumentLevelAttr(level, templet)
	local result = {}
	for i = 0, level do
		local info = require("app.config.instrument_level").get(i, templet)
		assert(info, string.format("instrument_level can't find level = %d, rank_type = %d", i, templet))
		for j = 1, 4 do
			local attrType = info["rank"..j.."_type"]
			local attrValue = info["rank"..j.."_size"]
			AttrDataHelper.formatAttr(result, attrType, attrValue)
		end
	end
	return result
end

--根据神兵id获取所在阵位武将的静态Id
function InstrumentDataHelper.getHeroBaseIdWithInstrumentId(id)
	local heroUnitData = InstrumentDataHelper.getHeroDataWithInstrumentId(id)
	if heroUnitData == nil then
		return nil
	end
	
	local heroBaseId = heroUnitData:getBase_id()
	return heroBaseId
end

--根据神兵id获取所在阵位武将的data
function InstrumentDataHelper.getHeroDataWithInstrumentId(id)
	local data = G_UserData:getBattleResource():getInstrumentDataWithId(id)
	if data == nil then
		return nil
	end
	
	local heroId = G_UserData:getTeam():getHeroIdWithPos(data:getPos())
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	return heroUnitData
end

--根据神兵id获取对应的羁绊Id
function InstrumentDataHelper.getYokeIdWithInstrumentId(id)
	local heroId = G_UserData:getInstrument():getHeroBaseId(id)
	local info = require("app.config.hero").get(heroId)
	assert(info, string.format("hero config can not find id = %d", heroId))

	for i = 1, HeroConst.HERO_YOKE_MAX do
		local fateId = info["fate_"..i]
		if fateId > 0 then
			local fateInfo = require("app.config.hero_fate").get(fateId)
			assert(fateInfo, string.format("hero_fate config can not find id = %d", fateId))
			local fateType = fateInfo.fate_type
			if fateType == 4 then --4为 神兵羁绊
				return fateId	
			end
		end
	end
	assert(false, string.format("can not find fateId with instrumentId = %d", id))
end

--根据神兵Id获取对应羁绊的属性
function InstrumentDataHelper.getYokeAttrWithInstrumentId(id)
	local fateId = InstrumentDataHelper.getYokeIdWithInstrumentId(id)
	local info = require("app.config.hero_fate").get(fateId)
	assert(info, string.format("hero_fate config can not find id = %d", fateId))

	local attrInfo = {}
	for i = 1, 2 do
		local attrId = info["talent_attr_"..i]
		if attrId > 0 then
			local attrValue = info["talent_value_"..i]
			local one = {attrId = attrId, attrValue = attrValue}
			table.insert(attrInfo, one)
		end
	end
	return attrInfo
end

--获取神兵天赋信息
function InstrumentDataHelper.getInstrumentTalentInfo(templet)
	local result = {}

	local Config = require("app.config.instrument_level")
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		local rankType = info.rank_type
		local unlock = info.unlock
		local name = info.name
		if rankType == templet and unlock > 0 then
			local temp = {level = info.level, des = info.description, name = name}
			table.insert(result, temp)
		end
	end

	return result
end

--获取神兵进阶消耗材料
function InstrumentDataHelper.getInstrumentAdvanceMaterial(data)
	local result = {}

	local level = data:getLevel()
	local templet = data:getAdvacneTemplateId()
	local config = require("app.config.instrument_level").get(level, templet)
	assert(config, string.format("instrument_level can't find level = %d, templet = %d", level, templet))

	local instrumentCount = config.cost_instrument
	if instrumentCount > 0 then
		local material1 = {
			type = TypeConvertHelper.TYPE_INSTRUMENT,
			value = data:getBase_id(),
			size = instrumentCount,
		}
		table.insert(result, material1)
	end

	local material2 = {
		type = config.cost_type,
		value = config.cost_id,
		size = config.cost_size,
	}
	table.insert(result, material2)

	return result
end

--获取神兵进阶消耗银两
function InstrumentDataHelper.getInstrumentAdvanceMoney(data)
	local result = {}

	local level = data:getLevel()
	local templet = data:getAdvacneTemplateId()
	local config = require("app.config.instrument_level").get(level, templet)
	assert(config, string.format("instrument_level can't find level = %d, templet = %d", level, templet))

	local result = {
		type = TypeConvertHelper.TYPE_RESOURCE,
		value = DataConst.RES_GOLD,
		size = config.cost_silver,
	}

	return result
end

--============================回收部分==========================================
--获取神兵进阶总消耗
function InstrumentDataHelper.getInstrumentAdvanceAllCost(unitData)
	local result = {}
	local level = unitData:getLevel()
	local templet = unitData:getAdvacneTemplateId()
	for i = 0, level - 1 do
		local info = require("app.config.instrument_level").get(i, templet)
		assert(info, string.format("instrument_level can't find level = %d, templet = %d", i, templet))

		if info.cost_size > 0 then
			RecoveryDataHelper.formatRecoveryCost(result, info.cost_type, info.cost_id, info.cost_size)
		end
		if info.cost_silver > 0 then
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, info.cost_silver)
		end
		if info.cost_instrument > 0 then
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_INSTRUMENT, unitData:getBase_id(), info.cost_instrument)
		end
	end

	return result
end

--获取界限突破的消耗
function InstrumentDataHelper.getInstrumentAllLimitCost(unitData)
	local result = {}
	if unitData:isCanLimitBreak() == false then
		return result
	end

	local templateId = unitData:getLimitTemplateId()
	local limitLevel = unitData:getLimit_level()

	for key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1, InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2 do
		local info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel)
		local type = info["type_"..key]
		local value = info["value_"..key]
		local size = unitData:getLimitCostCountWithKey(key)
		--此处可能出现type value = 0 的情况，@梁旭
		if size > 0 and type ~= 0 and value ~= 0 then
			RecoveryDataHelper.formatRecoveryCost(result, type, value, size)	
		end
	end

	for i = 0, limitLevel-1 do
		local config = InstrumentDataHelper.getInstrumentRankConfig(templateId, i)

		for j = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1, InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2 do
			local type = config["type_"..j]
			local value = config["value_"..j]
			local size = config["size_"..j]
			if size > 0 then
				RecoveryDataHelper.formatRecoveryCost(result, type, value, size)
			end
		end

		RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, config.cost_silver)
	end

	return result
end

--获取神兵回收预览信息
function InstrumentDataHelper.getInstrumentRecoveryPreviewInfo(datas)
	local result = {}
	local info = {}
	for k, unitData in pairs(datas) do
		local cost1 = InstrumentDataHelper.getInstrumentAdvanceAllCost(unitData)
		local cost2 = InstrumentDataHelper.getInstrumentAllLimitCost(unitData)
		local baseId = unitData:getBase_id()
		RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_INSTRUMENT, baseId, 1) --本卡
		RecoveryDataHelper.mergeRecoveryCost(info, cost1)
		RecoveryDataHelper.mergeRecoveryCost(info, cost2)
	end
	--将同名卡转化为代币
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_INSTRUMENT then
			for value, size in pairs(unit) do
				local temp = RecoveryDataHelper.convertSameCard(type, value ,size, 1)
				RecoveryDataHelper.mergeRecoveryCost(currency, temp)
			end
			info[type] = nil --清除同名卡
		end
	end
	RecoveryDataHelper.mergeRecoveryCost(info, currency)

	for type, unit in pairs(info) do
		for value, size in pairs(unit) do
			table.insert(result, {type = type, value = value, size = size})
		end
	end
	RecoveryDataHelper.sortAward(result)
	return result
end

--获取神兵重生预览信息
function InstrumentDataHelper.getInstrumentRebornPreviewInfo(data)
	local result = {}
	local info = {}
	
	local cost1 = InstrumentDataHelper.getInstrumentAdvanceAllCost(data)
	local cost2 = InstrumentDataHelper.getInstrumentAllLimitCost(data)
	local baseId = data:getBase_id()
	RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_INSTRUMENT, baseId, 1) --本卡
	RecoveryDataHelper.mergeRecoveryCost(info, cost1)
	RecoveryDataHelper.mergeRecoveryCost(info, cost2)
	
	--将同名卡转化为代币
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_INSTRUMENT then
			for value, size in pairs(unit) do
				local temp = RecoveryDataHelper.convertSameCard(type, value ,size, 2)
				RecoveryDataHelper.mergeRecoveryCost(currency, temp)
			end
			info[type] = nil --清除同名卡
		end
	end
	RecoveryDataHelper.mergeRecoveryCost(info, currency)

	for type, unit in pairs(info) do
		for value, size in pairs(unit) do
			table.insert(result, {type = type, value = value, size = size})
		end
	end
	RecoveryDataHelper.sortAward(result)
	return result
end

--获取神兵列表上限
function InstrumentDataHelper.getInstrumentListLimitCount()
	local level = G_UserData:getBase():getLevel()
	local info = require("app.config.role").get(level)
	assert(info, string.format("role config can not find level = %d", level))

	return info.instrument_limit
end

--判断是否要提示神兵进阶
function InstrumentDataHelper.isPromptInstrumentAdvance(instrumentData)
	local isLevelLimit = instrumentData:isLevelLimit()
	if isLevelLimit then
		return false --达到最大级了
	end

	local userLevel = G_UserData:getBase():getLevel()
	local roleInfo = require("app.config.role").get(userLevel)
	assert(roleInfo, string.format("role config can not find level = %d", userLevel))
	local recommendLevel = roleInfo.recommend_instrument_refine_lv
	local level = instrumentData:getLevel()
	if level >= recommendLevel then --已经达到了推荐等级
		return false
	end

	local materialInfo = InstrumentDataHelper.getInstrumentAdvanceMaterial(instrumentData)
	if #materialInfo == 0 then --没有任何材料要求，表示到了顶级，不需要提示
		return false
	end

	if instrumentData:isCanLimitBreak() then --如果能界限突破，先要判断当前界限突破等级下能达到的最大等级，是否已经达到了
		local curLevel = instrumentData:getLevel()
		local templateId = instrumentData:getLimitTemplateId()
		local limitLevel = instrumentData:getLimit_level()
		local markLevel = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel).level
		if limitLevel >= instrumentData:getMaxLimitLevel() then
			markLevel = instrumentData:getConfig().level_max
		end
		if curLevel >= markLevel then
			return false
		end
	end
	

	local canAdvance = true
	for i, info in ipairs(materialInfo) do
		local myCount = require("app.utils.UserDataHelper").getSameCardCount(info.type, info.value)
		if info.type == TypeConvertHelper.TYPE_INSTRUMENT then --如果是同名卡，要计算万能神兵的数量
			local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
			local commonId, commonCount = InstrumentDataHelper.getCommonInstrumentIdAndCount(info.value)
			local myCommonCount = G_UserData:getItems():getItemNum(commonId)
			myCount = myCount + math.floor(myCommonCount / commonCount)
		end
		
		local needCount = info.size

		local isReachCondition = myCount >= needCount
		canAdvance = canAdvance and isReachCondition
	end

	local moneyInfo = InstrumentDataHelper.getInstrumentAdvanceMoney(instrumentData)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOk = LogicCheckHelper.enoughMoney(moneyInfo.size)
	canAdvance = canAdvance and isOk

	return canAdvance
end

--根据baseId判断是否有合适上阵武将穿的
function InstrumentDataHelper.isInBattleHeroWithBaseId(baseId)
	local heroIds = G_UserData:getTeam():getHeroIdsInBattle()
	for i, heroId in ipairs(heroIds) do
		local data = G_UserData:getHero():getUnitDataWithId(heroId)
		local instrumentId = data:getConfig().instrument_id
		if instrumentId == baseId then
			local pos = data:getPos()
			local id = G_UserData:getBattleResource():getInstrumentIdsWithPos(pos)[1]
			if id then
				local unitData = G_UserData:getInstrument():getInstrumentDataWithId(id)
				local level = unitData:getLevel()
				local maxLevel = unitData:getConfig().level_max
				if level < maxLevel then --没达到满级才提示
					return true
				end
			else
				return true
			end
		end
	end
	return false
end

--获取万能神兵道具ID
function InstrumentDataHelper.getCommonInstrumentIdAndCount(baseId)
	local info = require("app.config.instrument").get(baseId)
	assert(info, string.format("instrument config can not find id = %d", baseId))
	return info.item_id, info.universal
end

--找到下一个天赋
function InstrumentDataHelper.findNextInstrumentTalent(level, templet, maxLevel)
	for i = level+1, maxLevel do
		local info = require("app.config.instrument_level").get(i, templet)
		assert(info, string.format("instrument_level config can not find i = %d, rank_type = %d", i, templet))

		if info.unlock > 0 then
			return i, info.name, info.description
		end
	end
	return nil
end

function InstrumentDataHelper.getInstrumentCountWithHeroIds(heroIds)
	local heroBaseIds = {}
	for i, heroId in ipairs(heroIds) do
		local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
		local heroBaseId = unitData:getBase_id()
		table.insert(heroBaseIds, heroBaseId)
	end

	local count = 0
	local uniqueBaseIds = table.unique(heroBaseIds, true)
	for i, baseId in ipairs(uniqueBaseIds) do
		local info = require("app.utils.data.HeroDataHelper").getHeroConfig(baseId)
		local instrumentId = info.instrument_id
		local instrumentCount = G_UserData:getInstrument():getInstrumentCountWithBaseId(instrumentId)
		count = count + instrumentCount
	end
	return count
end

--所有已穿戴神兵的平均进阶等级
function InstrumentDataHelper.getInstrumentInBattleAverageAdvance()
	local average = 0
	local totalLevel = 0
	
	local datas = G_UserData:getBattleResource():getAllInstrumentData()
	for k, data in pairs(datas) do
		local unitData = G_UserData:getInstrument():getInstrumentDataWithId(data:getId())
		local level = unitData:getLevel()
		totalLevel = totalLevel + level
	end
	local heroCount = require("app.utils.UserDataHelper").getTeamOpenCount()
	local count = heroCount * 1

	if count > 0 then
		average = math.floor(totalLevel / count)
	end
	return average
end

--
function InstrumentDataHelper.getInstrumentBaseIdByCheckAvatar(unitData)
	local baseId = unitData:getBase_id()
	if not unitData:isInBattle() then
		return baseId
	end

	local pos = unitData:getPos()
	if pos ~= 1 then --不是主角
		return baseId
	end
	
	if not G_UserData:getBase():isEquipAvatar() then
		return baseId
	end

	local avatarBaseId = G_UserData:getBase():getAvatar_base_id()
	local heroConfig = AvatarDataHelper.getAvatarHeroConfig(avatarBaseId)
	return heroConfig.instrument_id
end

function InstrumentDataHelper.isReachInstrumentLimitRank(templateId, limitLevel, curLevel)
	local info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel)
	local needLevel = info.level
	if curLevel == needLevel then
		return true, needLevel
	else
		return false, needLevel
	end
end

--判断是否要提示神兵突界
function InstrumentDataHelper.isPromptInstrumentLimit(instrumentData)
	local isAllFull = true
	
	for key = InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_1, InstrumentConst.INSTRUMENT_LIMIT_COST_KEY_2 do
		local isOk, isFull = InstrumentDataHelper.isPromptInstrumentLimitWithCostKey(instrumentData, key)
		isAllFull = isAllFull and isFull
		if isOk then
			return true
		end
	end
	if isAllFull then
		local limitLevel = instrumentData:getLimit_level()
		local templateId = instrumentData:getLimitTemplateId()
		local info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel)
		local isOk = require("app.utils.LogicCheckHelper").enoughMoney(info.cost_silver)
		if isOk then
			return true
		end
	end

	return false
end

function InstrumentDataHelper.isPromptInstrumentLimitWithCostKey(instrumentData, key)
	local open = instrumentData:getLimitFuncRealOpened()
	if not open then
		return false
	end
	
	if require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE2) == false then
		return false
	end
		
	local isCanLimitBreak = instrumentData:isCanLimitBreak()
	if not isCanLimitBreak then
		return false
	end

	local limitLevel = instrumentData:getLimit_level()
	if limitLevel >= instrumentData:getMaxLimitLevel() then
		return false
	end

	local templateId = instrumentData:getLimitTemplateId()
	local curLevel = instrumentData:getLevel()
	local isReach = InstrumentDataHelper.isReachInstrumentLimitRank(templateId, limitLevel, curLevel)
	if not isReach then
		return false
	end

	local info = InstrumentDataHelper.getInstrumentRankConfig(templateId, limitLevel)
	local curCount = instrumentData:getLimitCostCountWithKey(key)
	local maxSize = info["size_"..key]
	local isFull = curCount >= maxSize
	if not isFull then
		local count = require("app.utils.UserDataHelper").getNumByTypeAndValue(info["type_"..key], info["value_"..key]) + curCount
		if count >= maxSize then
			return true, isFull
		end
	end
	return false, isFull
end

--置换目标武将排序列表
function InstrumentDataHelper.getInstrumentTransformTarList(filterIds, tempData)
	local sortFun = function(a, b)
		if a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local isInFilter = function(unit)
		for i, filterId in ipairs(filterIds) do
			if filterId == unit:getBase_id() then
				return true
			end
		end
		return false
	end

	--检查界限突破的条件，如果待置换的武将是已经界限培养过的，则目标武将只能是开放界限突破的武将
	local checkLimitCondition = function(isDidLimit, unit)
		if isDidLimit == false then
			return true
		else
			if unit:isCanLimitBreak() then
				return true
			else
				return false
			end
		end
	end

	local result = {}
	local filterColor = tempData.color
	local isDidLimit = tempData.isDidLimit --是否培养过界限突破
	local InstrumentConfig = require("app.config.instrument")
	local len = InstrumentConfig.length()
	for i = 1, len do
		local info = InstrumentConfig.indexOf(i)
		local data = clone(tempData)
		data.baseId = info.id
		local unit = G_UserData:getInstrument():createTempInstrumentUnitData(data)
		local isTar = unit:isCanBeTranformTar() --是否能成为目标者
		local country = unit:getCountry()
		local color = unit:getConfig().color
		if result[country] == nil then
			result[country] = {}
		end
		if isTar and color == filterColor and not isInFilter(unit) and checkLimitCondition(isDidLimit, unit) then --同阵营，同品质色，过滤Id，判断界限突破的条件
			table.insert(result[country], unit)
		end
	end
	for k, temp in pairs(result) do
		table.sort(temp, sortFun)
	end

	return result
end

return InstrumentDataHelper