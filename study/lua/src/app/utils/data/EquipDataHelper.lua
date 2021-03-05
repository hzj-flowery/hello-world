--
-- Author: Liangxu
-- Date: 2017-04-06 19:56:34
-- 装备模块数据封装类

local EquipDataHelper = {}
local DataConst = require("app.const.DataConst")
local MasterConst = require("app.const.MasterConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TeamDataHelper = require("app.utils.data.TeamDataHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")
local RecoveryDataHelper = require("app.utils.data.RecoveryDataHelper")
local YokeConst = require("app.const.YokeConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local EquipConst = require("app.const.EquipConst")

--获取强化属性
function EquipDataHelper.getEquipStrengthenAttr(data, addLevel)
	local result = {}
	local tempLevel = addLevel or 0

	local config = data:getConfig()
	local level = data:getLevel() + tempLevel
	local initLevel = config.initial_level
	local templetLevelup = config.levelup_templet
	local typeLevelup = config.levelup_type

	local levelupConfig = require("app.config.equipment_levelup").get(level, templetLevelup)
	-- assert(levelupConfig, string.format("equipment_levelup can't find level = %d, templet = %d", level, templetLevelup))
	if levelupConfig == nil then
		return nil --表示超出顶级了
	end

	for i = 1, 4 do
		local luType = levelupConfig["levelup_type_" .. i]
		if luType == typeLevelup then
			local luValue = EquipDataHelper.getEquipLevelupAttrValue(initLevel, level, templetLevelup, i)
			AttrDataHelper.formatAttr(result, luType, luValue)
			break
		end
	end

	return result
end

--获取精炼属性
function EquipDataHelper.getEquipRefineAttr(data, addLevel)
	local tempLevel = addLevel or 0
	local config = data:getConfig()
	local rLevel = data:getR_level() + tempLevel
	local result = EquipDataHelper.getEquipRefineAttrWithConfig(config, rLevel)

	return result
end

--获取精炼属性
function EquipDataHelper.getEquipRefineAttrWithConfig(config, rLevel)
	local result = {}

	local initRlevel = config.initial_refine
	local templetRefine = config.refine_templet
	local typeRefine1 = config.refine_type_1
	local typeRefine2 = config.refine_type_2

	local refineConfig = require("app.config.equipment_refine").get(rLevel, templetRefine)
	-- assert(refineConfig, string.format("equipment_refine can't find level = %d, templet = %d", rLevel, templetRefine))
	if refineConfig == nil then
		return nil --到顶级了
	end

	for i = 1, 8 do
		local rType = refineConfig["refine_type_" .. i]
		if rType == typeRefine1 or rType == typeRefine2 then
			local rValue = EquipDataHelper.getEquipRefineAttrValue(initRlevel, rLevel, templetRefine, i)
			AttrDataHelper.formatAttr(result, rType, rValue)
		end
	end

	return result
end

--获取装备的属性信息
function EquipDataHelper.getEquipAttrInfo(data)
	local result = {}

	local sAttr = EquipDataHelper.getEquipStrengthenAttr(data)
	local rAttr = EquipDataHelper.getEquipRefineAttr(data)

	AttrDataHelper.appendAttr(result, sAttr)
	AttrDataHelper.appendAttr(result, rAttr)

	return result
end

function EquipDataHelper.getEquipJadeAttrInfo(data, level, isPower)
	local jades = data:getJades()
	local result = {}
	local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
	local AttributeConst = require("app.const.AttributeConst")
	local power = 0
	for i = 1, #jades do
		if jades[i] > 0 then
			local jadeUnitData = G_UserData:getJade():getJadeDataById(jades[i])
			local UserDataHelper = require("app.utils.UserDataHelper")
			local _, heroBaseId = UserDataHelper.getHeroBaseIdWithEquipId(data:getId())
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

--获取强化消耗
function EquipDataHelper.getLevelupCostValue(data)
	local config = data:getConfig()
	local level = data:getLevel()
	local templet = config.levelup_templet

	return EquipDataHelper.getLevelupCostWithLevelAndTemplet(level, templet)
end

--获取强化消耗根据level和templet
function EquipDataHelper.getLevelupCostWithLevelAndTemplet(level, templet)
	local levelupConfig = require("app.config.equipment_levelup").get(level, templet)
	assert(levelupConfig, string.format("equipment_levelup can't find level = %d, templet = %d", level, templet))

	return levelupConfig.silver
end

--获取一键强化装备所消耗的银两
function EquipDataHelper.getOneKeyStrengCost(pos)
	local equipIds = G_UserData:getBattleResource():getEquipIdsWithPos(pos)
	if #equipIds == 0 then
		return -1 --没装备
	end

	local equipsInfo = {}
	for i, equipId in ipairs(equipIds) do
		local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
		local equipLevel = clone(equipData:getLevel())
		local templet = equipData:getConfig().levelup_templet
		table.insert(equipsInfo, {level = equipLevel, templet = templet, slot = equipData:getSlot()})
	end

	local ratio = require("app.config.parameter").get(ParameterIDConst.MAX_EQUIPMENT_LEVEL).content / 1000
	local limitLevel = math.ceil(G_UserData:getBase():getLevel() * ratio) --最高限制等级
	local cost = 0 --花费
	local indexs = {} --记录哪几个装备需要强化
	local needMoney = 0
	local masterInfo = EquipDataHelper.getMasterEquipStrengthenInfo(pos)
	local masterLevel = masterInfo.curMasterLevel + 1 --当前已达成大师等级的下一级
	local targetLevel = EquipDataHelper.getNeedLevelWithMasterTypeAndLevel(MasterConst.MASTER_TYPE_1, masterLevel)

	local function formatInfo(equipsInfo)
		local isAllLimit = true --是否所有都达到最高等级限制了
		for i, info in ipairs(equipsInfo) do
			isAllLimit = isAllLimit and info.level >= limitLevel
			while info.level < targetLevel and info.level < limitLevel do
				needMoney = needMoney + EquipDataHelper.getLevelupCostWithLevelAndTemplet(info.level, info.templet)
				local LogicCheckHelper = require("app.utils.LogicCheckHelper")
				local isOk = LogicCheckHelper.enoughMoney(needMoney) --钱是否够
				if isOk then
					info.level = info.level + 1
					cost = needMoney
					if indexs[info.slot] == nil then
						indexs[info.slot] = true
					end
				else
					return -1 --钱不够了
				end
			end
		end

		if isAllLimit then
			return -2 --所有都到最高等级了
		end
		return 0
	end

	local ret = formatInfo(equipsInfo)
	if ret == -2 then
		return -2 --所有都已经到了最高等级
	end

	while ret == 0 do
		masterLevel = masterLevel + 1
		targetLevel = EquipDataHelper.getNeedLevelWithMasterTypeAndLevel(MasterConst.MASTER_TYPE_1, masterLevel)
		ret = formatInfo(equipsInfo)
	end

	return cost, indexs
end

--根据大师类型和等级，获取达到改等级需要的强化等级
function EquipDataHelper.getNeedLevelWithMasterTypeAndLevel(type, level)
	local Config = require("app.config.equipment_master")
	for i = 1, Config.length() do
		local info = Config.indexOf(i)
		if info.equip_type == type and info.level == level then
			return info.equip_value
		end
	end
	assert(false, string.format("equipment_master config can not find type = %d, level = %d", type, level))
end

--获取强化属性值
--initLevel-初始等级，level-等级，templet-模板，index-属性类型索引
function EquipDataHelper.getEquipLevelupAttrValue(initLevel, level, templet, index)
	local totalValue = 0
	for i = initLevel, level do
		local config = require("app.config.equipment_levelup").get(i, templet)
		assert(config, string.format("equipment_levelup can't find level = %d, templet = %d", i, templet))
		local value = config["levelup_value_" .. index]
		totalValue = totalValue + value
	end

	return totalValue
end

--获取精炼属性值
--initLevel-初始等级，level-等级，templet-模板，index-属性类型索引
function EquipDataHelper.getEquipRefineAttrValue(initLevel, level, templet, index)
	local totalValue = 0
	for i = initLevel, level do
		local config = require("app.config.equipment_refine").get(i, templet)
		assert(config, string.format("equipment_refine can't find level = %d, templet = %d", i, templet))
		local value = config["refine_value_" .. index]
		totalValue = totalValue + value
	end

	return totalValue
end

--根据装备id获取所在阵位武将的静态Id
function EquipDataHelper.getHeroBaseIdWithEquipId(id)
	local heroUnitData = EquipDataHelper.getHeroDataWithEquipId(id)
	if heroUnitData == nil then
		return nil
	end
	local heroBaseId = heroUnitData:getBase_id()
	local convertHeroBaseId = heroUnitData:getAvatarToHeroBaseId()
	return heroBaseId, convertHeroBaseId
end

--根据装备id获取所在阵位武将的data
function EquipDataHelper.getHeroDataWithEquipId(id)
	local data = G_UserData:getBattleResource():getEquipDataWithId(id)
	if data == nil then
		return nil
	end

	local heroId = G_UserData:getTeam():getHeroIdWithPos(data:getPos())
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	return heroUnitData
end

--获取套装名称
function EquipDataHelper.getSuitName(suitId)
	local config = require("app.config.equipment_suit").get(suitId)
	assert(config, "equipment_suit config can not find id = " .. suitId)

	local name = config.name
	return name
end

--获取套装部件的Id列表
function EquipDataHelper.getSuitComponentIds(suitId)
	local result = {}

	local config = require("app.config.equipment")
	local length = config.length()
	for i = 1, length do
		local info = config.indexOf(i)
		if info.suit_id == suitId then
			table.insert(result, info.id)
		end
	end

	return result
end

--获取套装属性显示信息
function EquipDataHelper.getSuitAttrShowInfo(suitId)
	local config = require("app.config.equipment_suit").get(suitId)
	assert(config, "equipment_suit config can not find id = " .. suitId)

	local result = {}

	for i = 1, 2 do
		local count = config["quantity_" .. i]
		local info = {}
		for j = 1, 2 do
			local sType = config["suit_" .. i .. "_type_" .. j]
			local sValue = config["suit_" .. i .. "_value_" .. j]
			if sType > 0 and sValue > 0 then
				table.insert(info, {type = sType, value = sValue})
			end
		end

		table.insert(result, {count = count, info = info})
	end

	local count = config["quantity_3"]
	local info3 = {}
	for j = 1, 4 do
		local sType = config["suit_3_type_" .. j]
		local sValue = config["suit_3_value_" .. j]
		if sType > 0 and sValue > 0 then
			table.insert(info3, {type = sType, value = sValue})
		end
	end

	table.insert(result, {count = count, info = info3})

	return result
end

--获取套装属性,计算属性用
function EquipDataHelper.getEquipSuitAttr(equipIds, pos)
	local temp = {}

	for i, equipId in ipairs(equipIds) do
		local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
		local equipConfig = equipData:getConfig()
		local suitId = equipConfig.suit_id

		if suitId > 0 and temp[suitId] == nil then --有套装配置，还没计算过此套装Id对应的属性，避免重复计算
			local componentCount = 0
			local componentIds = EquipDataHelper.getSuitComponentIds(suitId)
			for j, id in ipairs(componentIds) do
				local isHave = TeamDataHelper.isHaveEquipInPos(id, pos)
				if isHave then
					componentCount = componentCount + 1
				end
			end

			local attrInfo = EquipDataHelper.getSuitAttrShowInfo(suitId)
			for j, one in ipairs(attrInfo) do
				local count = one.count
				if componentCount >= count then
					if temp[suitId] == nil then
						temp[suitId] = {}
					end
					local info = one.info
					for j, data in ipairs(info) do
						if temp[suitId][data.type] == nil then
							temp[suitId][data.type] = 0
						end
						temp[suitId][data.type] = temp[suitId][data.type] + data.value
					end
				end
			end
		end
	end

	local result = {}
	for k, one in pairs(temp) do
		for type, value in pairs(one) do
			if result[type] == nil then
				result[type] = 0
			end
			result[type] = result[type] + value
		end
	end

	return result
end

--获取所有阵位上的武将装备信息
function EquipDataHelper.getAllEquipInfoInBattle()
	local result = {}
	local heroIds = G_UserData:getTeam():getHeroIds()
	for i, heroId in ipairs(heroIds) do
		if heroId > 0 then
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId = heroUnitData:getBase_id()
			local equipInfo = G_UserData:getBattleResource():getEquipInfoWithPos(i)

			local one = {
				heroBaseId = heroBaseId,
				equipInfo = equipInfo
			}

			table.insert(result, one)
		end
	end
	return result
end

--获取不同等级之间强化属性差值
function EquipDataHelper.getEquipStrengthenAttrDiff(data, level1, level2)
	local result = {}
	local level = data:getLevel()
	local config = data:getConfig()
	local templetLevelup = config.levelup_templet
	local typeLevelup = config.levelup_type

	local levelupConfig = require("app.config.equipment_levelup").get(level, templetLevelup)
	assert(levelupConfig, string.format("equipment_levelup can't find level = %d, templet = %d", level, templetLevelup))

	for i = 1, 4 do
		local luType = levelupConfig["levelup_type_" .. i]
		if luType == typeLevelup then
			local luValue = EquipDataHelper.getEquipLevelupAttrValue(level1 + 1, level2, templetLevelup, i)
			AttrDataHelper.formatAttr(result, luType, luValue)
			break
		end
	end

	return result
end

--获取装备当前精炼等级的经验
function EquipDataHelper.getCurRefineLevelExp(templet, level)
	local refineConfig = require("app.config.equipment_refine").get(level, templet)
	assert(refineConfig, string.format("equipment_refine config can't find level = %d, templet = %d", level, templet))

	return refineConfig.exp
end

--根据等级获取升级到此等级所需的经验
function EquipDataHelper.getEquipNeedExpWithLevel(templet, level)
	local needExp = 0
	for i = 0, level - 1 do
		local exp = EquipDataHelper.getCurRefineLevelExp(templet, i)
		needExp = needExp + exp
	end

	return needExp
end

--根据经验获取对应可以升到的等级
function EquipDataHelper.getCanReachRefineLevelWithExp(totalExp, templet)
	local level = 0
	local exp = 0
	while exp < totalExp do
		local temp = EquipDataHelper.getCurRefineLevelExp(templet, level)
		exp = exp + temp
		level = level + 1
	end
	return level - 1
end

--获取装备总经验
function EquipDataHelper.getEquipTotalExp(templet, curExp, level)
	local tempExp = EquipDataHelper.getEquipNeedExpWithLevel(templet, level)
	local totalExp = tempExp + curExp
	return totalExp
end

--获取装备当前经验
function EquipDataHelper.getEquipCurExp(templet, totalExp, level)
	local tempExp = EquipDataHelper.getEquipNeedExpWithLevel(templet, level)
	local curExp = totalExp - tempExp
	return curExp
end

--获取不同等级之间精炼属性差值
function EquipDataHelper.getEquipRefineAttrDiff(data, level1, level2)
	local result = {}

	local config = data:getConfig()
	local rLevel = data:getR_level()
	local templetRefine = config.refine_templet
	local typeRefine1 = config.refine_type_1
	local typeRefine2 = config.refine_type_2

	local refineConfig = require("app.config.equipment_refine").get(rLevel, templetRefine)
	assert(refineConfig, string.format("equipment_refine can't find level = %d, templet = %d", rLevel, templetRefine))

	for i = 1, 8 do
		local rType = refineConfig["refine_type_" .. i]
		if rType == typeRefine1 or rType == typeRefine2 then
			local rValue = EquipDataHelper.getEquipRefineAttrValue(level1 + 1, level2, templetRefine, i)
			AttrDataHelper.formatAttr(result, rType, rValue)
		end
	end

	return result
end

--获取强化大师信息
--pos:阵位索引
--返回大师等级、强化等级
function EquipDataHelper.getMasterEquipStrengthenInfo(pos)
	local result = {}
	local curMasterLevel = 0
	local nextMasterLevel = 0
	local needLevel = 0
	local curAttr = {}
	local nextAttr = {}

	local equipIds = G_UserData:getBattleResource():getEquipInfoWithPos(pos)
	local minLevel = nil
	for i = 1, 4 do
		local equipId = equipIds[i]
		local level = nil
		if equipId then
			local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
			level = equipData:getLevel()
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
		if info.equip_type == MasterConst.MASTER_TYPE_1 then
			if minLevel >= info.equip_value then
				for j = 1, 4 do
					local attrType = info["master_type" .. j]
					local attrValue = info["master_value" .. j]
					AttrDataHelper.formatAttr(curAttr, attrType, attrValue)
					AttrDataHelper.formatAttr(nextAttr, attrType, attrValue)
				end
				curMasterLevel = info.level
			else
				for j = 1, 4 do
					local attrType = info["master_type" .. j]
					local attrValue = info["master_value" .. j]
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
function EquipDataHelper.getMasterEquipRefineInfo(pos)
	local result = {}
	local curMasterLevel = 0
	local nextMasterLevel = 0
	local needLevel = 0
	local curAttr = {}
	local nextAttr = {}

	local equipIds = G_UserData:getBattleResource():getEquipInfoWithPos(pos)
	local minLevel = nil
	for i = 1, 4 do
		local equipId = equipIds[i]
		local level = nil
		if equipId then
			local equipData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
			level = equipData:getR_level()
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
		if info.equip_type == MasterConst.MASTER_TYPE_2 then
			if minLevel >= info.equip_value then
				for j = 1, 4 do
					local attrType = info["master_type" .. j]
					local attrValue = info["master_value" .. j]
					AttrDataHelper.formatAttr(curAttr, attrType, attrValue)
					AttrDataHelper.formatAttr(nextAttr, attrType, attrValue)
				end
				curMasterLevel = info.level
			else
				for j = 1, 4 do
					local attrType = info["master_type" .. j]
					local attrValue = info["master_value" .. j]
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

--===========================回收部分=============================================================================
--获取装备强化的总消耗
function EquipDataHelper.getEquipStrengAllCost(unitData)
	local result = {}
	local moneyCount = unitData:getMoney()
	if moneyCount > 0 then
		RecoveryDataHelper.formatRecoveryCost(result, TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, moneyCount)
	end

	return result
end

--获取装备精炼的总消耗
function EquipDataHelper.getEquipRefineAllCost(unitData)
	local result = {}

	local itemExp1 = require("app.config.item").get(DataConst.ITEM_REFINE_STONE_1).item_value
	local itemExp2 = require("app.config.item").get(DataConst.ITEM_REFINE_STONE_2).item_value
	local itemExp3 = require("app.config.item").get(DataConst.ITEM_REFINE_STONE_3).item_value
	local itemExp4 = require("app.config.item").get(DataConst.ITEM_REFINE_STONE_4).item_value
	local expItem = {
		count1 = 0,
		count2 = 0,
		count3 = 0,
		count4 = 0
	}

	local allExp = unitData:getAll_exp()
	while allExp >= itemExp1 do
		if allExp >= itemExp4 then
			allExp = allExp - itemExp4
			expItem.count4 = expItem.count4 + 1
		elseif allExp >= itemExp3 then
			allExp = allExp - itemExp3
			expItem.count3 = expItem.count3 + 1
		elseif allExp >= itemExp2 then
			allExp = allExp - itemExp2
			expItem.count2 = expItem.count2 + 1
		elseif allExp >= itemExp1 then
			allExp = allExp - itemExp1
			expItem.count1 = expItem.count1 + 1
		end
	end

	for i = 1, 4 do
		local count = expItem["count" .. i]
		if count > 0 then
			RecoveryDataHelper.formatRecoveryCost(
				result,
				TypeConvertHelper.TYPE_ITEM,
				DataConst["ITEM_REFINE_STONE_" .. i],
				count
			)
		end
	end
	return result
end

--获取装备回收预览信息
function EquipDataHelper.getEquipRecoveryPreviewInfo(datas)
	local result = {}
	local info = {}
	for k, unitData in pairs(datas) do
		local cost1 = EquipDataHelper.getEquipStrengAllCost(unitData)
		local cost2 = EquipDataHelper.getEquipRefineAllCost(unitData)
		-- dump(cost1)
		local limitUpDatas = unitData:getRecycle_materials()
		for k, v in pairs(limitUpDatas) do
			if v.type ~= TypeConvertHelper.TYPE_EQUIPMENT then
				RecoveryDataHelper.formatRecoveryCost(info, v.type, v.value, v.size)
			end
		end
		local baseId = unitData:getBase_id()
		local materials = unitData:getMaterials()
		if materials[2] > 0 then
			RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_EQUIPMENT, baseId, materials[2]) --本卡
		end
		RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_EQUIPMENT, baseId, 1) --本卡
		RecoveryDataHelper.mergeRecoveryCost(info, cost1)
		RecoveryDataHelper.mergeRecoveryCost(info, cost2)
	end

	--将同名卡转化为代币
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_EQUIPMENT then
			for value, size in pairs(unit) do
				local temp = RecoveryDataHelper.convertSameCard(type, value, size, 1)
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

--获取装备重生预览信息
function EquipDataHelper.getEquipRebornPreviewInfo(data)
	local result = {}
	local info = {}

	local cost1 = EquipDataHelper.getEquipStrengAllCost(data)
	local cost2 = EquipDataHelper.getEquipRefineAllCost(data)
	local limitUpDatas = data:getRecycle_materials()
	-- logWarn("EquipDataHelper.getEquipRecoveryPreviewInfo " .. TypeConvertHelper.TYPE_EQUIPMENT)
	-- dump(limitUpDatas)
	for k, v in pairs(limitUpDatas) do
		if v.type ~= TypeConvertHelper.TYPE_EQUIPMENT then
			RecoveryDataHelper.formatRecoveryCost(info, v.type, v.value, v.size)
		end
	end
	local baseId = data:getBase_id()
	local materials = data:getMaterials()
	if materials[2] > 0 then
		RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_EQUIPMENT, baseId, materials[2]) --本卡
	end
	RecoveryDataHelper.formatRecoveryCost(info, TypeConvertHelper.TYPE_EQUIPMENT, baseId, 1) --本卡
	RecoveryDataHelper.mergeRecoveryCost(info, cost1)
	RecoveryDataHelper.mergeRecoveryCost(info, cost2)

	--将同名卡转化为碎片
	local currency = {}
	for type, unit in pairs(info) do
		if type == TypeConvertHelper.TYPE_EQUIPMENT then
			for value, size in pairs(unit) do
				local temp = RecoveryDataHelper.convertSameCard(type, value, size, 2)
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

--判断是否要提示装备强化
function EquipDataHelper.isPromptEquipStrengthen(equipUnitData)
	local userLevel = G_UserData:getBase():getLevel()
	local roleInfo = require("app.config.role").get(userLevel)
	assert(roleInfo, string.format("role config can not find level = %d", userLevel))

	local recommendLevel = roleInfo.recommend_equipment_lv
	local level = equipUnitData:getLevel()
	if level >= recommendLevel then --已经达到了推荐等级
		return false
	end

	local ratio = require("app.config.parameter").get(ParameterIDConst.MAX_EQUIPMENT_LEVEL).content / 1000
	local maxLevel = math.ceil(G_UserData:getBase():getLevel() * ratio)
	if level >= maxLevel then
		return false
	end

	local costValue = EquipDataHelper.getLevelupCostValue(equipUnitData)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOk, func = LogicCheckHelper.enoughMoney(costValue)
	if not isOk then --不够钱
		return false
	end

	return true
end

--判断是否要提示装备精炼
function EquipDataHelper.isPromptEquipRefine(equipUnitData)
	local userLevel = G_UserData:getBase():getLevel()
	local roleInfo = require("app.config.role").get(userLevel)
	assert(roleInfo, string.format("role config can not find level = %d", userLevel))

	local recommendLevel = roleInfo.recommend_equipment_refine_lv
	local level = equipUnitData:getR_level()
	if level >= recommendLevel then --已经达到了推荐等级
		return false
	end

	local ratio = require("app.config.parameter").get(ParameterIDConst.MAX_EQUIPMENT_REFINE_LEVEL).content / 1000
	local maxLevel = math.ceil(G_UserData:getBase():getLevel() * ratio)
	if level >= maxLevel then
		return false
	end

	local UserDataHelper = require("app.utils.UserDataHelper")
	local DataConst = require("app.const.DataConst")
	local ownExp = 0
	for i = 1, 4 do
		local itemId = DataConst["ITEM_REFINE_STONE_" .. i]
		local count = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemId)
		if count > 0 then
			local itemExp = require("app.config.item").get(itemId).item_value
			ownExp = ownExp + itemExp * count
		end
	end
	local templet = equipUnitData:getConfig().refine_templet
	local curLevelExp = EquipDataHelper.getCurRefineLevelExp(templet, level)
	local needExp = curLevelExp - equipUnitData:getR_exp()
	if ownExp >= needExp then --满足升级
		return true
	end

	return false
end

--获取装备列表上限
function EquipDataHelper.getEquipListLimitCount()
	local level = G_UserData:getBase():getLevel()
	local info = require("app.config.role").get(level)
	assert(info, string.format("role config can not find level = %d", level))

	return info.equipment_limit
end

--获取装备播放的Effect
function EquipDataHelper.getEquipEffectWithBaseId(baseId)
	local result = nil
	local info = require("app.config.equipment").get(baseId)
	assert(info, string.format("equipment config can not find id = %d", baseId))
	local moving = info.moving
	if moving ~= "0" then
		result = string.split(moving, "|")
	end
	return result
end

--判断装备和武将是否有羁绊关系
function EquipDataHelper.isHaveYokeBetweenHeroAndEquip(heroBaseId, equipBaseId)
	local HeroDataHelper = require("app.utils.data.HeroDataHelper")
	local fateIds = HeroDataHelper.getHeroYokeIdsByConfig(heroBaseId)
	for i, fateId in ipairs(fateIds) do
		local info = HeroDataHelper.getHeroYokeConfig(fateId)
		local fateType = info.fate_type
		if fateType == YokeConst.TYPE_EQUIP then
			for j = 1, 4 do
				local equipId = info["hero_id_" .. j]
				if equipId == equipBaseId then
					return true
				end
			end
		end
	end
	return false
end

--判断是否需要此装备
function EquipDataHelper.isNeedEquipWithBaseId(baseId)
	local info = require("app.config.equipment").get(baseId)
	assert(info, string.format("equipment config can not find id = %d", baseId))
	local slot = info.type
	local color = info.color

	local heroIds = G_UserData:getTeam():getHeroIds()
	for pos, heroId in ipairs(heroIds) do
		if heroId > 0 then
			local equipId = G_UserData:getBattleResource():getResourceId(pos, EquipConst.FLAG, slot)
			if equipId and equipId > 0 then
				local unitData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
				local equipColor = unitData:getConfig().color
				if color > equipColor then
					return true
				end
			else
				return true
			end
		end
	end
	return false
end

--所有已穿戴装备的平均强化等级
function EquipDataHelper.getEquipInBattleAverageStr()
	local average = 0
	local totalLevel = 0

	local datas = G_UserData:getBattleResource():getAllEquipData()
	for k, data in pairs(datas) do
		local unitData = G_UserData:getEquipment():getEquipmentDataWithId(data:getId())
		local level = unitData:getLevel()
		totalLevel = totalLevel + level
	end
	local heroCount = require("app.utils.UserDataHelper").getTeamOpenCount()
	local count = heroCount * 4

	if count > 0 then
		average = math.floor(totalLevel / count)
	end
	return average
end

--所有已穿戴装备的平均精炼等级
function EquipDataHelper.getEquipInBattleAverageRefine()
	local average = 0
	local totalLevel = 0

	local datas = G_UserData:getBattleResource():getAllEquipData()
	for k, data in pairs(datas) do
		local unitData = G_UserData:getEquipment():getEquipmentDataWithId(data:getId())
		local level = unitData:getR_level()
		totalLevel = totalLevel + level
	end
	local heroCount = require("app.utils.UserDataHelper").getTeamOpenCount()
	local count = heroCount * 4

	if count > 0 then
		average = math.floor(totalLevel / count)
	end
	return average
end

return EquipDataHelper
