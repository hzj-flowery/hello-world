--
-- Author: Liangxu
-- Date: 2017-05-08 17:14:41
-- 宝物模块数据封装类
local TreasureDataHelper = {}
local DataConst = require("app.const.DataConst")
local MasterConst = require("app.const.MasterConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local YokeConst = require("app.const.YokeConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local HeroConst = require("app.const.HeroConst")
local TreasureConst = require("app.const.TreasureConst")

function TreasureDataHelper.getTreasureConfig(id)
	local info = require("app.config.treasure").get(id)
	assert(info, string.format("treasure config can not find id = %d", id))
	return info
end

function TreasureDataHelper.getLimitCostConfig(limitLevel)
	local info = require("app.config.treasure_limit_cost").get(limitLevel)
	assert(info, string.format("treasure_limit_cost config can not find limit_level = %d", limitLevel))
	return info
end

function TreasureDataHelper.getLimitOpenLv(limitLevel)
	local info = TreasureDataHelper.getLimitCostConfig(limitLevel)
	local funcInfo = require("app.config.function_level").get(info.function_id)
	if funcInfo then
		return funcInfo.level
	else
		return 0
	end
end

function TreasureDataHelper.getLimitShowLv(limitLevel)
	local info = TreasureDataHelper.getLimitCostConfig(limitLevel)
	local funcInfo = require("app.config.function_level").get(info.function_id)
	if funcInfo then
		return funcInfo.show_level
	else
		return 0
	end
end

-- 根据模板获取强化最高级
function TreasureDataHelper.getTreasureStrengthenMaxLevelWithTemplet(templet)
	local treasureLevelUp = require("app.config.treasure_levelup")
	local res = 0
	for i=1,treasureLevelUp.length() do
		local item = treasureLevelUp.indexOf(i)
		if item.templet==templet and item.level>res then
			res = item.level
		end
	end
	return res
end

--获取强化属性
function TreasureDataHelper.getTreasureStrengthenAttr(data, addLevel)
	local tempLevel = addLevel or 0
	local config = data:getConfig()
	local level = data:getLevel() + tempLevel
	
	return TreasureDataHelper.getTreasureStrAttrWithConfigAndLevel(config, level)
end

--获取强化属性，用config和Level
function TreasureDataHelper.getTreasureStrAttrWithConfigAndLevel(config, level)
	local result = {}

	local initLevel = config.initial_level
	local templet = config.levelup_templet
	local typeLevelup1 = config.levelup_type_1
	local typeLevelup2 = config.levelup_type_2

	-- local topLevel = TreasureDataHelper.getTreasureStrengthenMaxLevelWithTemplet(templet)
	-- if topLevel<level then
	-- 	level = topLevel
	-- end
	local levelupConfig = require("app.config.treasure_levelup").get(level, templet)
	-- assert(levelupConfig, string.format("treasure_levelup can't find level = %d, templet = %d", level, templet))
	if levelupConfig == nil then
		return nil --表示超出顶级了
	end

	for i = 1, 2 do
		local luType = levelupConfig["levelup_type_"..i]
		if luType == typeLevelup1 or luType == typeLevelup2 then
			local luValue = TreasureDataHelper.getTreasureLevelupAttrValue(initLevel, level, templet, i)
			AttrDataHelper.formatAttr(result, luType, luValue)
		end
	end

	return result
end

-- 根据模板获取精炼最高级
function TreasureDataHelper.getTreasureRefineMaxLevelWithTemplet(templet)
	local treasureRefine = require("app.config.treasure_refine")
	local res = 0
	for i=1,treasureRefine.length() do
		local item = treasureRefine.indexOf(i)
		if item.templet==templet and item.level>res then
			res = item.level
		end
	end
	return res
end

--获取精炼属性
function TreasureDataHelper.getTreasureRefineAttr(data, addLevel)
	local result = {}
	local tempLevel = addLevel or 0

	local config = data:getConfig()
	local rLevel = data:getRefine_level() + tempLevel
	local result = TreasureDataHelper.getTreasureRefineAttrWithConfigAndRLevel(config, rLevel)
	return result
end

function TreasureDataHelper.getTreasureRefineAttrWithConfigAndRLevel(configInfo, rLevel)
	local result = {}

	local initRlevel = configInfo.initial_refine
	local templetRefine = configInfo.refine_templet
	local typeRefine1 = configInfo.refine_type_1
	local typeRefine2 = configInfo.refine_type_2
	local typeRefine3 = configInfo.refine_type_3

	-- local topLevel = TreasureDataHelper.getTreasureRefineMaxLevelWithTemplet(templetRefine)
	-- if topLevel<rLevel then
	-- 	rLevel = topLevel
	-- end
	local refineConfig = require("app.config.treasure_refine").get(rLevel, templetRefine)
	-- assert(refineConfig, string.format("treasure_refine can't find level = %d, templet = %d", rLevel, templetRefine))
	if refineConfig == nil then
		return nil --到最到等级了
	end

	for i = 1, 6 do
		local rType = refineConfig["refine_type_"..i]
		if rType == typeRefine1 or rType == typeRefine2 or rType == typeRefine3 then
			local rValue = TreasureDataHelper.getTreasureRefineAttrValue(initRlevel, rLevel, templetRefine, i)
			AttrDataHelper.formatAttr(result, rType, rValue)
		end
	end

	return result
end

--获取宝物的属性信息
function TreasureDataHelper.getTreasureAttrInfo(data)
	local result = {}

	local sAttr = TreasureDataHelper.getTreasureStrengthenAttr(data)
	local rAttr = TreasureDataHelper.getTreasureRefineAttr(data)
	AttrDataHelper.appendAttr(result, sAttr)
	AttrDataHelper.appendAttr(result, rAttr)

	return result
end

--根据等级获取升级到此等级所需的经验
function TreasureDataHelper.getTreasureNeedExpWithLevel(templet, level)
	local needExp = 0
	for i = 1, level - 1 do
		local exp = TreasureDataHelper.getTreasureLevelUpExp(i, templet)
		needExp = needExp + exp
	end

	return needExp
end

--根据经验获取对应可以升到的等级
function TreasureDataHelper.getCanReachTreasureLevelWithExp(totalExp, templet)
	local level = 1
	local exp = 0
	while exp < totalExp do
		local temp = TreasureDataHelper.getTreasureLevelUpExp(level, templet)
		exp = exp + temp
		level = level + 1
	end
	return level - 1
end

--获取升当前等级所需经验
function TreasureDataHelper.getTreasureLevelUpExp(level, templet)
	local config = require("app.config.treasure_levelup").get(level, templet)
	assert(config, string.format("treasure_levelup can not find level = %d, templet = %d", level, templet))
	
	return config.exp
end

--获取强化属性值
--initLevel-初始等级，level-等级，templet-模板，index-属性类型索引
function TreasureDataHelper.getTreasureLevelupAttrValue(initLevel, level, templet, index)
	local totalValue = 0
	for i = initLevel, level do
		local config = require("app.config.treasure_levelup").get(i, templet)
		assert(config, string.format("treasure_levelup can't find level = %d, templet = %d", i, templet))
		local value = config["levelup_value_"..index]
		totalValue = totalValue + value
	end

	return totalValue
end

--获取精炼属性值
--initLevel-初始等级，level-等级，templet-模板，index-属性类型索引
function TreasureDataHelper.getTreasureRefineAttrValue(initLevel, level, templet, index)
	local totalValue = 0
	for i = initLevel, level do
		local config = require("app.config.treasure_refine").get(i, templet)
		assert(config, string.format("treasure_refine can't find level = %d, templet = %d", i, templet))
		local value = config["refine_value_"..index]
		totalValue = totalValue + value
	end

	return totalValue
end

--根据宝物id获取所在阵位武将的静态Id
function TreasureDataHelper.getHeroBaseIdWithTreasureId(id)
	local heroUnitData = TreasureDataHelper.getHeroDataWithTreasureId(id)
	if heroUnitData == nil then
		return nil
	end

	local heroBaseId = heroUnitData:getBase_id()
	local convertHeroBaseId = heroUnitData:getAvatarToHeroBaseId()
	return heroBaseId, convertHeroBaseId
end

--根据宝物id获取所在阵位武将的data
function TreasureDataHelper.getHeroDataWithTreasureId(id)
	local data = G_UserData:getBattleResource():getTreasureDataWithId(id)
	if data == nil then
		return nil
	end

	local heroId = G_UserData:getTeam():getHeroIdWithPos(data:getPos())
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	return heroUnitData
end

--根据宝物静态Id获取相应的羁绊信息
function TreasureDataHelper.getTreasureYokeInfo(baseId)
	local result = {}
	local heroFataConfig = require("app.config.hero_fate")
	local len = heroFataConfig.length()
	for i = 1, len do
		local info = heroFataConfig.indexOf(i)
		local fateType = info.fate_type
		if fateType == 3 then --是宝物羁绊
			for j = 1, 4 do
				local treasureId = info["hero_id_"..j]
				if treasureId > 0 and treasureId == baseId then
					local temp = TreasureDataHelper._createYokeBasicInfo(info)
					table.insert(result, temp)
					break
				end
			end
		end
	end

	return result
end

--创建羁绊基础信息
function TreasureDataHelper._createYokeBasicInfo(info)
	local result = {}
	result.id = info.fate_id
	result.fateType = info.fate_type
	result.name = info.fate_name
	local attrInfo = {}
	for i = 1, 2 do
		local attrId = info["talent_attr_"..i]
		if attrId > 0 then
			local attrValue = info["talent_value_"..i]
			local info = {attrId = attrId, attrValue = attrValue}
			table.insert(attrInfo, info)
		end
	end
	result.attrInfo = attrInfo

	local heroIds = {}
	local heroConfig = require("app.config.hero")
	local len = heroConfig.length()
	local userId = nil
	for i = 1, len do
		local heroInfo = heroConfig.indexOf(i)
		for j = 1, HeroConst.HERO_YOKE_MAX do
			local fateId = heroInfo["fate_"..j]
			if fateId > 0 and fateId == info.fate_id then
				if heroInfo.type == 1 then
					if userId == nil then --如果是主角，只记录一个
						userId = heroInfo.id
						table.insert(heroIds, userId)
					end
				else
					table.insert(heroIds, heroInfo.id)
				end
				break
			end
		end
	end
	result.heroIds = heroIds

	return result
end

--判断宝物和武将是否有羁绊关系
function TreasureDataHelper.isHaveYokeBetweenHeroAndTreasured(heroBaseId, treasureBaseId)
	local HeroDataHelper = require("app.utils.data.HeroDataHelper")
	local fateIds = HeroDataHelper.getHeroYokeIdsByConfig(heroBaseId)
	for i, fateId in ipairs(fateIds) do
		local info = HeroDataHelper.getHeroYokeConfig(fateId)
		local fateType = info.fate_type
		if fateType == YokeConst.TYPE_TREASURE then
			for j = 1, 4 do
				local treasureId = info["hero_id_"..j]
				if treasureId == treasureBaseId then
					return true
				end
			end
		end
	end
	return false
end

--根据宝物Id判断是否由某武将装备上了
function TreasureDataHelper.checkIsEquipInHero(treasureId, heroBaseId)
	local data = G_UserData:getBattleResource():getTreasureDataWithId(treasureId)
	if data == nil then
		return false
	end

	local pos = data:getPos()
	local heroIds = G_UserData:getTeam():getHeroIds()
	local heroId = heroIds[pos]
	if heroId and heroId > 0 then
		local heroData = G_UserData:getHero():getUnitDataWithId(heroId)
		local baseId = heroData:getBase_id()
		if pos == 1 then --如果是主角，还要判断官衔
			if baseId >= heroBaseId then --baseId较大的说明官衔较高，宝物羁绊一定会激活
				return true
			end
		else
			if baseId == heroBaseId then
				return true
			end
		end
	end

	return false
end

--获取宝物精炼消耗材料
function TreasureDataHelper.getTreasureRefineMaterial(data)
	local result = {}

	local rLevel = data:getRefine_level()
	local templet = data:getConfig().refine_templet
	local config = require("app.config.treasure_refine").get(rLevel, templet)
	assert(config, string.format("treasure_refine can't find level = %d, templet = %d", rLevel, templet))

	local treasureCount = config.treasure
	if treasureCount > 0 then
		local material1 = {
			type = TypeConvertHelper.TYPE_TREASURE,
			value = data:getSameCardId(),
			size = treasureCount,
		}
		table.insert(result, material1)
	end

	local material2 = {
		type = config.cost_type_1,
		value = config.cost_value_1,
		size = config.cost_size_1,
	}
	table.insert(result, material2)

	return result
end

--获取宝物精炼消耗银两
function TreasureDataHelper.getTreasureRefineMoney(data)
	local result = {}

	local rLevel = data:getRefine_level()
	local templet = data:getConfig().refine_templet
	local config = require("app.config.treasure_refine").get(rLevel, templet)
	assert(config, string.format("treasure_refine can't find level = %d, templet = %d", rLevel, templet))

	local result = {
		type = config.cost_type_2,
		value = config.cost_value_2,
		size = config.cost_size_2,
	}

	return result
end

--获取强化大师信息
--pos:阵位索引
--返回大师等级、强化等级
function TreasureDataHelper.getMasterTreasureUpgradeInfo(pos)
	local result = {}
	local curMasterLevel = 0
	local nextMasterLevel = 0
	local needLevel = 0
	local curAttr = {}
	local nextAttr = {}

	local treasureIds = G_UserData:getBattleResource():getTreasureInfoWithPos(pos)
	local minLevel = nil
	for i = 1, 2 do
		local treasureId = treasureIds[i]
		local level = nil
		if treasureId then
			local treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
			level = treasureData:getLevel()
		else
			level = 0
		end
		if minLevel == nil then
			minLevel = level
		end
		if level < minLevel then
			minLevel = level
		end
	end
	
	local masterConfig = require("app.config.equipment_master")
	for i = 1, masterConfig.length() do
		local info = masterConfig.indexOf(i)
		if info.equip_type == MasterConst.MASTER_TYPE_3 then
			if minLevel >= info.equip_value then
				for j = 1, 4 do
					local attrType = info["master_type"..j]
					local attrValue = info["master_value"..j]
					AttrDataHelper.formatAttr(curAttr, attrType, attrValue)
					AttrDataHelper.formatAttr(nextAttr, attrType, attrValue)
				end
				curMasterLevel = info.level
			else
				for j = 1, 4 do
					local attrType = info["master_type"..j]
					local attrValue = info["master_value"..j]
					AttrDataHelper.formatAttr(nextAttr, attrType, attrValue)
				end
				nextMasterLevel = info.level
				needLevel = info.equip_value
				break
			end
		end
	end

	result.curMasterLevel = curMasterLevel
	result.nextMasterLevel = nextMasterLevel
	result.needLevel = needLevel
	result.curAttr = curAttr
	result.nextAttr = nextAttr

	return result
end

--获取精炼大师信息
--返回大师等级、精炼等级
function TreasureDataHelper.getMasterTreasureRefineInfo(pos)
	local result = {}
	local curMasterLevel = 0
	local nextMasterLevel = 0
	local needLevel = 0
	local curAttr = {}
	local nextAttr = {}

	local treasureIds = G_UserData:getBattleResource():getTreasureInfoWithPos(pos)
	local minLevel = nil
	for i = 1, 2 do
		local treasureId = treasureIds[i]
		local level = nil
		if treasureId then
			local treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
			level = treasureData:getRefine_level()
		else
			level = 0
		end
		if minLevel == nil then
			minLevel = level
		end
		if level < minLevel then
			minLevel = level
		end
	end
	
	local masterConfig = require("app.config.equipment_master")
	for i = 1, masterConfig.length() do
		local info = masterConfig.indexOf(i)
		if info.equip_type == MasterConst.MASTER_TYPE_4 then
			if minLevel >= info.equip_value then
				for j = 1, 4 do
					local attrType = info["master_type"..j]
					local attrValue = info["master_value"..j]
					AttrDataHelper.formatAttr(curAttr, attrType, attrValue)
					AttrDataHelper.formatAttr(nextAttr, attrType, attrValue)
				end
				curMasterLevel = info.level
			else
				for j = 1, 4 do
					local attrType = info["master_type"..j]
					local attrValue = info["master_value"..j]
					AttrDataHelper.formatAttr(nextAttr, attrType, attrValue)
				end
				nextMasterLevel = info.level
				needLevel = info.equip_value
				break
			end
		end
	end

	result.curMasterLevel = curMasterLevel
	result.nextMasterLevel = nextMasterLevel
	result.needLevel = needLevel
	result.curAttr = curAttr
	result.nextAttr = nextAttr

	return result
end

--========================================回收部分======================================================
--获取宝物强化的总消耗
function TreasureDataHelper.getTreasureStrengAllCost(unitData)
	local result = {}

	local itemExp1 = require("app.config.item").get(DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_1).item_value
	local itemExp2 = require("app.config.item").get(DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_2).item_value
	local itemExp3 = require("app.config.item").get(DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_3).item_value
	local itemExp4 = require("app.config.item").get(DataConst.ITEM_TREASURE_LEVELUP_MATERIAL_4).item_value
	local expItem = {
		count1 = 0,
		count2 = 0,
		count3 = 0,
		count4 = 0,
	}

	local expCount = unitData:getExp()
	while expCount >= itemExp1 do
		if expCount >= itemExp4 then
			expCount = expCount - itemExp4
			expItem.count4 = expItem.count4 + 1
		elseif expCount >= itemExp3 then
			expCount = expCount - itemExp3
			expItem.count3 = expItem.count3 + 1
		elseif expCount >= itemExp2 then
			expCount = expCount - itemExp2
			expItem.count2 = expItem.count2 + 1
		elseif expCount >= itemExp1 then
			expCount = expCount - itemExp1
			expItem.count1 = expItem.count1 + 1
		end
	end
	for i = 1, 4 do
		local count = expItem["count"..i]
		if count > 0 then
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_ITEM, DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_"..i], count)
		end
	end

	return result
end

--获取宝物精炼的总消耗
function TreasureDataHelper.getTreasureRefineAllCost(unitData)
	local result = {}
	local rank = unitData:getRefine_level()
	local rTemplet = unitData:getConfig().refine_templet
	for i = 0, rank - 1 do
		local info = require("app.config.treasure_refine").get(i, rTemplet)
		assert(info, string.format("treasure_refine can not find rank = %d, templet = %d", i, rTemplet))
		local cardCount = info.treasure
		if cardCount > 0 then
			local baseId = unitData:getSameCardId()
			RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_TREASURE, baseId, cardCount)
		end
		for j = 1, 2 do
			local size = info["cost_size_"..j]
			if size > 0 then
				local type = info["cost_type_"..j]
				local value = info["cost_value_"..j]
				RecoveryDataHelper.formatRecoveryCost(result, type, value, size)
			end
		end
	end

	return result
end

--获取界限突破的消耗
function TreasureDataHelper.getTreasureLimitCost(unitData)
	local result = {}

	local materials = unitData:getRecycle_materials()
	for i, material in ipairs(materials) do
		RecoveryDataHelper.formatRecoveryCost(result, material.type, material.value, material.size)
	end

	return result
end

--获取宝物回收预览信息
function TreasureDataHelper.getTreasureRecoveryPreviewInfo(datas)
	local result = {}
	local info = {}
	for k, unitData in pairs(datas) do
		local cost1 = TreasureDataHelper.getTreasureStrengAllCost(unitData)
		local cost2 = TreasureDataHelper.getTreasureRefineAllCost(unitData)
		local cost3 = TreasureDataHelper.getTreasureLimitCost(unitData)

		local baseId = unitData:getBase_id()
		RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_TREASURE, baseId, 1) --本卡
		RecoveryDataHelper.mergeRecoveryCost(info, cost1)
		RecoveryDataHelper.mergeRecoveryCost(info, cost2)
		RecoveryDataHelper.mergeRecoveryCost(info, cost3)
	end
	--将同名卡转化为代币
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_TREASURE then
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

--获取宝物重生预览信息
function TreasureDataHelper.getTreasureRebornPreviewInfo(data)
	local result = {}
	local info = {}
	
	local cost1 = TreasureDataHelper.getTreasureStrengAllCost(data)
	local cost2 = TreasureDataHelper.getTreasureRefineAllCost(data)
	local cost3 = TreasureDataHelper.getTreasureLimitCost(data)
	local baseId = data:getBase_id()
	RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_TREASURE, baseId, 1) --本卡
	RecoveryDataHelper.mergeRecoveryCost(info, cost1)
	RecoveryDataHelper.mergeRecoveryCost(info, cost2)
	RecoveryDataHelper.mergeRecoveryCost(info, cost3)
	
	--将同名卡转化为代币
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_TREASURE then
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

--判断是否要提示宝物升级
function TreasureDataHelper.isPromptTreasureUpgrade(treasureData)
	local userLevel = G_UserData:getBase():getLevel()
	local roleInfo = require("app.config.role").get(userLevel)
	assert(roleInfo, string.format("role config can not find level = %d", userLevel))

	local recommendLevel = roleInfo.recommend_treasure_lv
	local level = treasureData:getLevel()
	if level >= recommendLevel then --已经达到了推荐等级
		return false
	end
	if level >= treasureData:getMaxStrLevel() then --到了最大等级
		return false
	end

	--判断材料
	local ownExp = 0
	for i = 1, 4 do
		local itemId = DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_"..i]
		local count = require("app.utils.UserDataHelper").getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId)
		if count > 0 then
			local itemExp = require("app.config.item").get(itemId).item_value
			ownExp = ownExp + itemExp * count
		end
	end
	local templet = treasureData:getConfig().levelup_templet
	local nowExp = treasureData:getExp() - TreasureDataHelper.getTreasureNeedExpWithLevel(templet, level) 
	local curLevelExp = TreasureDataHelper.getTreasureLevelUpExp(level, templet)
	local needExp = curLevelExp - nowExp
	if ownExp >= needExp then --满足升级
		return true
	end

	return false
end

--判断是否要提示宝物精炼
function TreasureDataHelper.isPromptTreasureRefine(treasureData)
	local userLevel = G_UserData:getBase():getLevel()
	local roleInfo = require("app.config.role").get(userLevel)
	assert(roleInfo, string.format("role config can not find level = %d", userLevel))

	local recommendLevel = roleInfo.recommend_treasure_refine_lv
	local level = treasureData:getRefine_level()
	if level >= recommendLevel then --已经达到了推荐等级
		return false
	end
	if level >= treasureData:getMaxRefineLevel() then --到了最大等级
		return false
	end

	local canRefine = true
	local materialInfo = TreasureDataHelper.getTreasureRefineMaterial(treasureData)
	for i, info in ipairs(materialInfo) do
		local myCount = 0
		if info.type == TypeConvertHelper.TYPE_TREASURE then
			myCount = #G_UserData:getTreasure():getSameCardsWithBaseId(info.value)
		elseif info.type == TypeConvertHelper.TYPE_ITEM then
			myCount = G_UserData:getItems():getItemNum(info.value)
		end
		local needCount = info.size

		local isReachCondition = myCount >= needCount
		canRefine = canRefine and isReachCondition
	end

	local moneyInfo = TreasureDataHelper.getTreasureRefineMoney(treasureData)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOk = LogicCheckHelper.enoughMoney(moneyInfo.size)
	canRefine = canRefine and isOk

	return canRefine
end

--判断是否要提示宝物界限
function TreasureDataHelper.isPromptTreasureLimit(treasureData)
	-- 判断等级是否到了
	local limitLevel = treasureData:getLimit_cost()
	local lv = TreasureDataHelper.getLimitOpenLv(limitLevel)
	local gameUserLevel = G_UserData:getBase():getLevel()
	if gameUserLevel<lv then
		return false
	end

	local isAllFull = true

	for key = TreasureConst.TREASURE_LIMIT_COST_KEY_1, TreasureConst.TREASURE_LIMIT_COST_KEY_4 do
		local isOk, isFull = TreasureDataHelper.isPromptTreasureLimitWithCostKey(treasureData, key)
		isAllFull = isAllFull and isFull
		if isOk then
			return true
		end
	end
	if isAllFull then
		local limitLevel = treasureData:getLimit_cost()
		local info = TreasureDataHelper.getLimitCostConfig(limitLevel)
		local isOk = require("app.utils.LogicCheckHelper").enoughMoney(info.break_size)
		if isOk then
			return true
		end
	end

	return false
end

--判断是否要提示宝物界限红点（某个材料）
function TreasureDataHelper.isPromptTreasureLimitWithCostKey(treasureData, key)
	if require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4) == false then
		return false
	end
		
	local isCanLimitBreak = treasureData:isCanLimitBreak()
	if not isCanLimitBreak then
		return false
	end

	local limitLevel = treasureData:getLimit_cost()
	if limitLevel >= TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL then
		return false
	end

	local rLevel = treasureData:getRefine_level()
	local isReach = TreasureDataHelper.isReachTreasureLimitRank(limitLevel, rLevel)
	if not isReach then
		return false
	end

	local info = TreasureDataHelper.getLimitCostConfig(limitLevel)
	local curCount = treasureData:getLimitCostCountWithKey(key)
	local maxSize = 0
	if key == TreasureConst.TREASURE_LIMIT_COST_KEY_1 then
		maxSize = info.exp
	else
		maxSize = info["size_"..key]
	end
	
	local isFull = curCount >= maxSize
	if not isFull then
		if key == TreasureConst.TREASURE_LIMIT_COST_KEY_1 then
			local ownExp = curCount
			for j = 1, 4 do
				local count = require("app.utils.UserDataHelper").getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_"..j])
				local itemValue = require("app.config.item").get(DataConst["ITEM_TREASURE_LEVELUP_MATERIAL_"..j]).item_value
				local itemExp = count * itemValue
				ownExp = ownExp + itemExp
				if ownExp >= maxSize then
					return true, isFull
				end
			end
		else
			local count = require("app.utils.UserDataHelper").getNumByTypeAndValue(info["type_"..key], info["value_"..key]) + curCount
			if count >= maxSize then
				return true, isFull
			end
		end
	end
	return false, isFull
end

--获取宝物列表上限
function TreasureDataHelper.getTreasureListLimitCount()
	local level = G_UserData:getBase():getLevel()
	local info = require("app.config.role").get(level)
	assert(info, string.format("role config can not find level = %d", level))

	return info.treasure_limit
end

--所有已穿戴宝物的平均强化等级
function TreasureDataHelper.getTreasureInBattleAverageStr()
	local average = 0
	local totalLevel = 0
	
	local datas = G_UserData:getBattleResource():getAllTreasureData()
	for k, data in pairs(datas) do
		local unitData = G_UserData:getTreasure():getTreasureDataWithId(data:getId())
		local level = unitData:getLevel()
		totalLevel = totalLevel + level
	end
	local heroCount = require("app.utils.UserDataHelper").getTeamOpenCount()
	local count = heroCount * 2

	if count > 0 then
		average = math.floor(totalLevel / count)
	end
	return average
end

--所有已穿戴宝物的平均精炼等级
function TreasureDataHelper.getTreasureInBattleAverageRefine()
	local average = 0
	local totalLevel = 0
	
	local datas = G_UserData:getBattleResource():getAllTreasureData()
	for k, data in pairs(datas) do
		local unitData = G_UserData:getTreasure():getTreasureDataWithId(data:getId())
		local level = unitData:getRefine_level()
		totalLevel = totalLevel + level
	end
	local heroCount = require("app.utils.UserDataHelper").getTeamOpenCount()
	local count = heroCount * 2

	if count > 0 then
		average = math.floor(totalLevel / count)
	end
	return average
end


--置换目标宝物排序列表
function TreasureDataHelper.getTreasureTransformTarList(filterIds, tempData)

	local function sortFun(a, b)
		local configA = a:getConfig()
		local configB = b:getConfig()
		if configA.color ~= configB.color then
			return configA.color > configB.color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRefine_level() ~= b:getRefine_level() then
			return a:getRefine_level() > b:getRefine_level()
		else
			return configA.id < configB.id
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
	-- logWarn("-----------------TreasureDataHelper   getTreasureTransformTarList----------------------------")
	-- dump(filterIds)
	-- dump(tempData)
	-- logWarn("-----------------TreasureDataHelper   getTreasureTransformTarList----------------------------")
	
	local result = {}
	local filterColor = tempData.color
	local wear = {} --已穿戴
	local noWear = {} --未穿戴
	local TreasureConfig = require("app.config.treasure")
	local len = TreasureConfig.length()
	for i = 1, len do
		local info = TreasureConfig.indexOf(i)
		local data = clone(tempData)
		data.baseId = info.id
		local unit = G_UserData:getTreasure():createTempTreasureUnitData(data)
		local color = unit:getConfig().color

		if color == filterColor and not isInFilter(unit) then --橙色，过滤Id
			local isInBattle = unit:isInBattle()
			if isInBattle then
				table.insert(wear, unit)
			else
				table.insert(noWear, unit)
			end
		end
	end

	table.sort(wear, sortFun)
	table.sort(noWear, sortFun)

	for i, unit in ipairs(wear) do
		table.insert(result, unit)
	end

	for i, unit in ipairs(noWear) do
		table.insert(result, unit)
	end
	return result
end

function TreasureDataHelper.isReachTreasureLimitRank(limitLevel, curLevel)
	local info = TreasureDataHelper.getLimitCostConfig(limitLevel)
	local needLevel = info.refine
	if curLevel >= needLevel then
		return true, needLevel
	else
		return false, needLevel
	end
end

function TreasureDataHelper.getTreasureJadeAttrInfo(data, level, isPower)
	local jades = data:getJades()
	local result = {}
	local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
	local AttributeConst = require("app.const.AttributeConst")
	local power = 0
	for i = 1, #jades do
		if jades[i] > 0 then
			local jadeUnitData = G_UserData:getJade():getJadeDataById(jades[i])
			local UserDataHelper = require("app.utils.UserDataHelper")
			local _, heroBaseId = UserDataHelper.getHeroBaseIdWithTreasureId(data:getId())
			if jadeUnitData and jadeUnitData:isSuitableHero(heroBaseId) then
				local cfg = jadeUnitData:getConfig()
				if not isPower then
					local size = EquipJadeHelper.getRealAttrValue(cfg, level)
					if cfg.type ~= 0 then
						AttrDataHelper.formatAttr(result, cfg.type, size)
					end
				else
					AttrDataHelper.formatAttr(result, AttributeConst.JADE_POWER, cfg.fake)
				end
			end
		end
	end
	return result
end

return TreasureDataHelper