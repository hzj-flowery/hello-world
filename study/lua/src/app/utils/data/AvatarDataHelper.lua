-- 
-- Author: Liangxu
-- Date: 2017-02-15 15:35:23
-- 变身卡数据帮助类
local AvatarDataHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local DataConst = require("app.const.DataConst")
local FunctionConst = require("app.const.FunctionConst")
local ServerRecordConst = require("app.const.ServerRecordConst")

function AvatarDataHelper.getAvatarConfig(id)
	local info = require("app.config.avatar").get(id)
	assert(info, string.format("avatar config can not find id = %d", id))
	return info
end

-- function AvatarDataHelper.getAvatarLevelConfig(level, templet)
-- 	local info = require("app.config.avatar_level").get(level, templet)
-- 	assert(info, string.format("avatar_level config can not find level = %d, templet = %d", level, templet))
-- 	return info
-- end

function AvatarDataHelper.getAvatarShowConfig(id)
	local info = require("app.config.avatar_show").get(id)
	assert(info, string.format("avatar_show config can not find id = %d", id))
	return info
end

function AvatarDataHelper.getAvatarHeroConfig(id)
	local info = AvatarDataHelper.getAvatarConfig(id)
	local heroId = info.hero_id
	local heroInfo = require("app.utils.data.HeroDataHelper").getHeroConfig(heroId)
	return heroInfo
end

function AvatarDataHelper.getAvatarMappingConfig(id)
	local info = require("app.config.avatar_mapping").get(id)
	assert(info, string.format("avatar_mapping config can not find id = %d", id))
	return info
end

--获取当前变身卡批次
function AvatarDataHelper.getCurAvatarBatch()
	local batch = G_UserData:getServerRecord():getRecordById(ServerRecordConst.KEY_ACTIVE_AVATAR_BATCH)
	if batch <= 0 then
		batch = 1 --最低要有1批
	end
	logDebug("getCurAvatarBatch = "..batch)
	return batch
end

function AvatarDataHelper.getAllAvatarIds()
	local function sortFun(a, b)
		local selfA = a:isSelf() and 1 or 0
		local selfB = b:isSelf() and 1 or 0
		local equipA = a:isEquiped() and 1 or 0
		local equipB = b:isEquiped() and 1 or 0
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local ownA = a:isOwned() and 1 or 0
		local ownB = b:isOwned() and 1 or 0
		if selfA ~= selfB then
			return selfA > selfB
		elseif equipA ~= equipB then
			return equipA > equipB
		elseif ownA ~= ownB then
			return ownA > ownB
		elseif colorA ~= colorB then
			return colorA > colorB
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		else
			return a:getConfig().id < b:getConfig().id
		end
	end

	local avatarBatch = AvatarDataHelper.getCurAvatarBatch()
	local datas = {}
	local len = require("app.config.avatar").length()
	for i = 1, len do
		local info = require("app.config.avatar").indexOf(i)
		local batch = info.batch
		if avatarBatch >= batch or G_UserData:getAvatar():getUnitDataWithBaseId(info.id) then --批次符合条件，或者拥有此变身卡
			local baseId = info.id
			local data = nil
			local unitData = G_UserData:getAvatar():getUnitDataWithBaseId(baseId)
			if unitData then
				data = unitData
			else
				local tempData = {base_id = baseId}
				data = G_UserData:getAvatar():createTempAvatarUnitData(tempData)
			end
			table.insert(datas, data)
		end
	end

	table.sort(datas, sortFun)

	local result = {}
	for i, data in ipairs(datas) do
		table.insert(result, data:getBase_id())
	end

	return result
end

function AvatarDataHelper.getAllOwnAvatarIds()
	local result = {}
	local len = require("app.config.avatar").length()
	for i = 1, len do
		local info = require("app.config.avatar").indexOf(i)
		local avatarId = info.id
		local isOwn = G_UserData:getAvatar():isHaveWithBaseId(avatarId)
		if isOwn then
			table.insert(result, avatarId)
		end
	end
	return result
end

function AvatarDataHelper.getAvatarBaseAttr(id)
	local result = {}
	local info = AvatarDataHelper.getAvatarConfig(id)
	for i = 1, 2 do
		local attrType = info["fashion_attr_"..i]
		local attrValue = info["fashion_value_"..i]
		AttrDataHelper.formatAttr(result, attrType, attrValue)
	end
	return result
end

-- function AvatarDataHelper.getAvatarSingleLevelAttr(level, templet)
-- 	local result = {}
-- 	local info = AvatarDataHelper.getAvatarLevelConfig(level, templet)
-- 	for i = 1, 4 do
-- 		local attrType = info["levelup_type_"..i]
-- 		local attrValue = info["levelup_value_"..i]
-- 		AttrDataHelper.formatAttr(result, attrType, attrValue)
-- 	end
-- 	return result
-- end

-- function AvatarDataHelper.getAvatarLevelAttr(level, templet)
-- 	local result = {}
-- 	for i = 1, level do
-- 		local attr = AvatarDataHelper.getAvatarSingleLevelAttr(i, templet)
-- 		AttrDataHelper.appendAttr(result, attr)
-- 	end
	
-- 	return result
-- end

function AvatarDataHelper.getAvatarTotalAttr(avatarId, level, templet)
	local result = {}
	local baseAttr = AvatarDataHelper.getAvatarBaseAttr(avatarId)
	-- local levelAttr = AvatarDataHelper.getAvatarLevelAttr(level, templet)
	AttrDataHelper.appendAttr(result, baseAttr)
	-- AttrDataHelper.appendAttr(result, levelAttr)

	return result
end

-- function AvatarDataHelper.getAvatarSingleCost(level, templet)
-- 	local result = {}
-- 	local info = AvatarDataHelper.getAvatarLevelConfig(level, templet)
-- 	local type1 = TypeConvertHelper.TYPE_RESOURCE
-- 	local value1 = DataConst.RES_GOLD
-- 	local size1 = info.silver
-- 	local type2 = TypeConvertHelper.TYPE_ITEM
-- 	local value2 = info.item_id
-- 	local size2 = info.item_num
	
-- 	RecoveryDataHelper.formatRecoveryCost(result, type1, value1, size1)
-- 	RecoveryDataHelper.formatRecoveryCost(result, type2, value2, size2)
	
-- 	return result
-- end

-- function AvatarDataHelper.getAvatarCost(level, templet)
-- 	local result = {}
-- 	for i = 1, level - 1 do
-- 		local cost = AvatarDataHelper.getAvatarSingleCost(i, templet)
-- 		RecoveryDataHelper.mergeRecoveryCost(result, cost)
-- 	end
	
-- 	return result
-- end

-- function AvatarDataHelper.getAvatarRebornPreviewInfo(data)
-- 	local result = {}
-- 	local info = {}
	
-- 	local level = data:getLevel()
-- 	local templet = data:getConfig().levelup_cost
-- 	local cost1 = AvatarDataHelper.getAvatarCost(level, templet)
-- 	local baseId = data:getBase_id()
-- 	RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_AVATAR, baseId, 1) --本卡
-- 	RecoveryDataHelper.mergeRecoveryCost(info, cost1)

-- 	for type, unit in pairs(info) do
-- 		for value, size in pairs(unit) do
-- 			table.insert(result, {type = type, value = value, size = size})
-- 		end
-- 	end

-- 	RecoveryDataHelper.sortAward(result)
-- 	return result
-- end

-- function AvatarDataHelper.getAllTalentInfo(templet)
-- 	local result = {}
-- 	local templet2MaxLevel = G_UserData:getAvatar():getTemplet2MaxLevel()
-- 	local maxLevel = templet2MaxLevel[templet]
-- 	for i = 1, maxLevel do
-- 		local info = AvatarDataHelper.getAvatarLevelConfig(i, templet)
-- 		if info.unlock == 1 then
-- 			table.insert(result, info)
-- 		end
-- 	end
-- 	return result
-- end

function AvatarDataHelper.getAllOwnAvatarShowInfo()
	local result = {}
	local avatarPhoto = G_UserData:getAvatarPhoto():getAvatar_photo()
	for i, id in ipairs(avatarPhoto) do
		local info = AvatarDataHelper.getAvatarShowConfig(id)
		table.insert(result, info)
	end
	
	return result
end

function AvatarDataHelper.isHaveAvatarShow(avatarShowId)
	local info = AvatarDataHelper.getAvatarShowConfig(avatarShowId)
	local avatarId1 = info.avatar_id1
	local avatarId2 = info.avatar_id2
	local isHave1 = G_UserData:getAvatar():isHaveWithBaseId(avatarId1)
	local isHave2 = G_UserData:getAvatar():isHaveWithBaseId(avatarId2)
	return isHave1 and isHave2
end

function AvatarDataHelper.getShowAttr(avatarShowId)
	local result = {}
	local info = AvatarDataHelper.getAvatarShowConfig(avatarShowId)
	for i = 1, 4 do
		local attrId = info["talent_attr_"..i]
		local attrValue = info["talent_value_"..i]
		if attrId > 0 then
			table.insert(result, {attrId = attrId, attrValue = attrValue})
		end
	end

	return result
end

-- function AvatarDataHelper.getNextTalentDes(level, templet)
-- 	local allInfo = AvatarDataHelper.getAllTalentInfo(templet)
-- 	for i, info in ipairs(allInfo) do
-- 		if info.level > level then
-- 			return info
-- 		end
-- 	end
-- 	return nil
-- end

function AvatarDataHelper.getSkillInfo(data)
	local result = {}
	local avatarId = data:getBase_id()
	local avatarConfig = AvatarDataHelper.getAvatarConfig(avatarId)
	local heroId = avatarConfig.hero_id
	local limitLevel = 0
	if avatarConfig.limit == 1 then
		limitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
	end
	local heroRankConfig = require("app.utils.data.HeroDataHelper").getHeroRankConfig(heroId, 0, limitLevel)
	for i = 1, 3 do
		local skillId = heroRankConfig["rank_skill_"..i]
		if skillId ~= 0 then
			local unit = {id = skillId}
			if i == 3 then --合击
				unit.unlock = avatarConfig.skill_3_unlock
				unit.isActiveJoint = data:getLevel() >= avatarConfig.skill_3_unlock
			end
			table.insert(result, unit)
		end
	end

	return result
end

function AvatarDataHelper.getAllBookIds()
	local avatarBatch = AvatarDataHelper.getCurAvatarBatch()
	local result = {}
	local len = require("app.config.avatar_show").length()
	for i = 1, len do
		local info = require("app.config.avatar_show").indexOf(i)
		local batch = info.batch
		if avatarBatch >= batch then
			local country = info.country
			if result[country] == nil then
				result[country] = {}
			end
			table.insert(result[country], info.id)
		end
	end

	return result
end

function AvatarDataHelper.getBookIdsBySort(bookIds)
	local function sortFunc(a, b)
		local activeA = a.isActive and 1 or 0
		local activeB = b.isActive and 1 or 0
		local canActiveA = (not a.isActive and a.isHave) and 1 or 0
		local canActiveB = (not b.isActive and b.isHave) and 1 or 0
		if canActiveA ~= canActiveB then
			return canActiveA > canActiveB
		elseif activeA ~= activeB then
			return activeA > activeB
		elseif a.sort ~= b.sort then
			return a.sort < b.sort
		else
			return a.id < b.id
		end
	end

	local result = {}
	local temp = {}
	for i, bookId in ipairs(bookIds) do
		local info = AvatarDataHelper.getAvatarShowConfig(bookId)
		local showId = info.id
		local sort = info.sort
		local country = info.country
		local one = {
			isActive = G_UserData:getAvatarPhoto():isActiveWithId(showId),
			isHave = AvatarDataHelper.isHaveAvatarShow(showId),
			id = showId,
			sort = sort,
		}
		table.insert(temp, one)
	end
	table.sort(temp, sortFunc)
	for k, one in ipairs(temp) do
		table.insert(result, one.id)
	end

	return result
end

--通过检查是否穿了变身卡，返回用于显示的heroBaseId
function AvatarDataHelper.getShowHeroBaseIdByCheck(unitData)
	local heroBaseId = 0
	local isEquipAvatar = false
	local avatarLimitLevel = nil
	if unitData:isLeader() and unitData:isUserHero() and G_UserData:getBase():isEquipAvatar() then
		local avatarBaseId = G_UserData:getBase():getAvatar_base_id()
		local info = AvatarDataHelper.getAvatarConfig(avatarBaseId)
		heroBaseId = info.hero_id
		isEquipAvatar = true
		if info.limit == 1 then
			avatarLimitLevel = require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
		end
	else
		heroBaseId = unitData:getBase_id()
		isEquipAvatar = false
	end
	-- 添加红升金界限突破等级
	local avatarRedLimitLevel = nil
	return heroBaseId, isEquipAvatar, avatarLimitLevel, avatarRedLimitLevel
end

--通过检查是否穿了变身卡，返回用于显示的SkillIds
function AvatarDataHelper.getShowSkillIdsByCheck(unitData)
	local skillIds = {}
	if unitData:isLeader() and unitData:isUserHero() and G_UserData:getBase():isEquipAvatar() then
		local avatarBaseId = G_UserData:getBase():getAvatar_base_id()
		local heroBaseId = AvatarDataHelper.getAvatarConfig(avatarBaseId).hero_id
		local limitLevel = unitData:getLimit_level()
		local limitRedLevel = unitData:getLimit_rtg()
		skillIds = require("app.utils.data.HeroDataHelper").getSkillIdsWithBaseIdAndRank(heroBaseId, 0, limitLevel, limitRedLevel)
	else
		skillIds = require("app.utils.data.HeroDataHelper").getSkillIdsWithHeroData(unitData)
	end
	return skillIds
end

--通过检查主角是否穿了变身卡，返回用于显示的baseId
function AvatarDataHelper.getShowPlayerBaseIdByCheck()
	local playerBaseId = 0
	if G_UserData:getBase():isEquipAvatar() then
		local avatarBaseId = G_UserData:getBase():getAvatar_base_id()
		playerBaseId = AvatarDataHelper.getAvatarConfig(avatarBaseId).hero_id
	else
		playerBaseId = G_UserData:getBase():getPlayerBaseId()
	end
	return playerBaseId
end

--是否提示培养
-- function AvatarDataHelper.isPromptTrain()
-- 	local unitData = G_UserData:getAvatar():getCurEquipedUnitData()
-- 	if unitData == nil then
-- 		return false
-- 	end

-- 	local isEquiped = unitData:isEquiped() 
-- 	if not isEquiped then
-- 		return false --不是已穿戴的
-- 	end

-- 	local level = unitData:getLevel()
-- 	local templet = unitData:getConfig().levelup_cost
-- 	local templet2MaxLevel = G_UserData:getAvatar():getTemplet2MaxLevel()
-- 	local maxLevel = templet2MaxLevel[templet]
-- 	if level >= maxLevel then
-- 		return false --已达最大等级
-- 	end

-- 	local cost = AvatarDataHelper.getAvatarSingleCost(level, templet)
-- 	local costList = RecoveryDataHelper.convertToList(cost)
-- 	for i, info in ipairs(costList) do
-- 		if info.type == TypeConvertHelper.TYPE_RESOURCE then
-- 			local enough = require("app.utils.LogicCheckHelper").enoughMoney(info.size) --此处保证是银币，直接检测银币
-- 			if not enough then
-- 				return false
-- 			end
-- 		elseif info.type == TypeConvertHelper.TYPE_ITEM then
-- 			local itemNum = G_UserData:getItems():getItemNum(info.value)
-- 			if info.size > itemNum then
-- 				return false
-- 			end
-- 		end
-- 	end

-- 	return true
-- end

--是否提示更换
function AvatarDataHelper.isPromptChange()
	local unitData = G_UserData:getAvatar():getCurEquipedUnitData()
	if unitData == nil then --当前没穿变身卡
		local count = G_UserData:getAvatar():getAvatarCount()
		return count > 0
	end

	local ParameterIDConst = require("app.const.ParameterIDConst")
	local tempLevel = require("app.config.parameter").get(ParameterIDConst.AVATAR_HINT_CLOSE).content
	local openLevel = require("app.config.function_level").get(FunctionConst.FUNC_AVATAR).level
	local limitLevel = openLevel + tempLevel
	local userLevel = G_UserData:getBase():getLevel()
	if userLevel >= limitLevel then
		return false
	end

	local color = unitData:getConfig().color
	local datas = G_UserData:getAvatar():getAllDatas()
	for k, data in pairs(datas) do
		local isEquip = data:isEquiped()
		local tempColor = data:getConfig().color
		if not isEquip and tempColor > color then
			return true
		end
	end
	return false
end

--是否比当前穿的更好
function AvatarDataHelper.isBetterThanCurEquiped(unitData)
	local curData = G_UserData:getAvatar():getCurEquipedUnitData()
	if curData == nil then
		return true
	end

	local curColor = curData:getConfig().color
	local color = unitData:getConfig().color
	return color > curColor
end

--图鉴是否可激活
function AvatarDataHelper.isCanActiveBookWithId(bookId)
	local isActive = G_UserData:getAvatarPhoto():isActiveWithId(bookId)
	local isHave = AvatarDataHelper.isHaveAvatarShow(bookId)
	local isCanActive = not isActive and isHave
	return isCanActive
end

function AvatarDataHelper.isCanActiveBook()
	local avatarBatch = AvatarDataHelper.getCurAvatarBatch()
	local len = require("app.config.avatar_show").length()
	for i = 1, len do
		local info = require("app.config.avatar_show").indexOf(i)
		if avatarBatch >= info.batch then
			local showId = info.id
			local isCanActive = AvatarDataHelper.isCanActiveBookWithId(showId)
			if isCanActive == true then
				return true
			end
		end
	end
	return false
end

function AvatarDataHelper.isCanActiveInBookIds(bookIds)
	for i, bookId in ipairs(bookIds) do
		local isCan = AvatarDataHelper.isCanActiveBookWithId(bookId)
		if isCan then
			return true
		end
	end
	return false
end

return AvatarDataHelper