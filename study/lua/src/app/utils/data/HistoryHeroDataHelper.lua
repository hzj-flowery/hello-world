local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local AttributeConst = require("app.const.AttributeConst")

local HistoryHeroDataHelper = {}

HistoryHeroDataHelper.MAX_SLOT_COUNT = 4 --最大坑数
--历代名将阵位显示数量
function HistoryHeroDataHelper.getHistoryHeroPosShowNum()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local showPosNum = 0
	for index = FunctionConst.FUNC_HISTORY_HERO_TEAM_SLOT1, FunctionConst.FUNC_HISTORY_HERO_TEAM_SLOT4 do
		local isShow = LogicCheckHelper.funcIsShow( index )
		if isShow == true then
			showPosNum = showPosNum + 1
		end
	end
	return showPosNum
end


--根据阵位索引获取历代名将状态
function HistoryHeroDataHelper.getHistoryHeroStateWithPos(pos)
	local TeamConst = require("app.const.TeamConst")
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_HISTORY_HERO_TEAM_SLOT"..pos])

	if isOpen then
		local historyHeroIds = G_UserData:getHistoryHero():getHistoryHeroIds()
		if historyHeroIds == nil or historyHeroIds[pos] == nil then
			return TeamConst.STATE_OPEN
		end
		if historyHeroIds[pos] == 0 then
			return TeamConst.STATE_OPEN
		end
		if historyHeroIds[pos] > 0 then
			return TeamConst.STATE_HERO
		end

	else
		return TeamConst.STATE_LOCK
	end
end

-- @Export 		获取历代名将信息
-- @Param		baseId
function HistoryHeroDataHelper.getHistoryHeroInfo(baseId)
	local info = require("app.config.historical_hero").get(baseId)
	assert(info, string.format("historical_hero config can not find id = %d", baseId))
	return info
end

-- @Export 		获取历代名将武器信息
-- @Param		baseId
function HistoryHeroDataHelper.getHistoryWeaponInfo(baseId)
	local info = require("app.config.historical_hero_equipment").get(baseId)
	assert(info, string.format("historical_hero_equipment config can not find id = %d", baseId))
	return info
end

-- @Export 		获取历代名将基础特效
-- @Param		baseId
function HistoryHeroDataHelper.getHistoryHeroEffectWithBaseId(baseId)
	local result = nil
	local info = require("app.config.historical_hero").get(baseId)
	assert(info, string.format("historical_hero config can not find id = %d", baseId))

	if rawget(info, "moving") == nil then
		return nil
	end

	local moving = info.moving
	if moving ~= "0" then
		result = string.split(moving,"|")
	end
	return result
end

-- @Export 		获取历代名将图鉴（历代系统中的
function HistoryHeroDataHelper.getHistoryHeroBookInfo()
	local mapData = {}
	local UserCheck = require("app.utils.logic.UserCheck")
	local length = require("app.config.historical_hero_map").length()
	for index = 1, length do
		local info = require("app.config.historical_hero_map").indexOf(index)
		if tonumber(info.show) == 1 and UserCheck.enoughOpenDay(tonumber(info.show_day)) then
			table.insert(mapData, info)
		end
	end

	table.sort(mapData, function(item1, item2)
		return item1.id < item2.id
	end)
	return mapData
end

-- @Export 		获得突破觉醒信息
-- @Param 	    heroId 名将Id
-- @Param 	    step 突破界限
function HistoryHeroDataHelper.getHistoryHeroStepByHeroId(heroId, step)
	local info = require("app.config.historical_hero_step").get(heroId, step)
	assert(info, string.format("historical_hero_step config can not find id = %d", heroId))
	return info
end

-- @Export 		根据BaseId获取技能ID
-- @Param 		baseId 名将ID
function HistoryHeroDataHelper.getHistoricalSkills(baseId)
	local skillList = {}
	local HeroInfoCfg = HistoryHeroDataHelper.getHistoryHeroInfo(baseId)
	local skillNums = HeroInfoCfg.is_step == 1 and 3 or 2		-- 根据突破获取技能数量
	for index = 1, skillNums do
		table.insert(skillList, HistoryHeroDataHelper.getHistoryHeroStepByHeroId(baseId, index).skill_id)
	end
	return skillList
end

--获取觉醒材料
function HistoryHeroDataHelper.getHistoricalAwakenCostList(baseId)
	local awakenList = {}
	local heroStepInfo = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(baseId, 2)
	for index = 1, 3 do
		table.insert(awakenList, heroStepInfo['value_' .. index])
	end
	return awakenList
end

-- @Export 	重生返还
function HistoryHeroDataHelper.getHistoricalHeroRebornPreviewInfo(data)
	local HistoryHeroConst = require("app.const.HistoryHeroConst")
	local heroCfg = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data:getSystem_id(), data:getBreak_through() - 1)
	if heroCfg == nil then
		return
	end

	local result = {}
	--本身
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	table.insert(result, {type = TypeConvertHelper.TYPE_HISTORY_HERO, value = data:getSystem_id(), size = 1})
	
	if data:getBreak_through() >= 2 then
		--武器
		local heroCfg = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data:getSystem_id(), 1)
		for index = 1, HistoryHeroConst.MAX_STEP_MATERIAL do
			if heroCfg["type_"..index] > 0 then
				table.insert(result, {type = heroCfg["type_"..index], value = heroCfg["value_"..index], size = heroCfg["size_"..index]})	
			end
		end

		--肚子里的
		for k, v in pairs(data:getMaterials()) do
			table.insert(result, {type = v["type"], value = v["value"], size = v["size"]})	
		end
	end

	if data:getBreak_through() == 3 then
		--肚子里的
		local heroCfg = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(data:getSystem_id(), 2)
		for index = 1, HistoryHeroConst.MAX_STEP_MATERIAL do
			if heroCfg["type_"..index] > 0 then
				table.insert(result, {type = heroCfg["type_"..index], value = heroCfg["value_"..index], size = heroCfg["size_"..index]})	
			end
		end
	end
	return result
end

--[[
   name: 获取历代名将解锁情况
   param nil
   return: slotList = 
			{isopen = isOpen, info = funcLevelInfo},
		   unlockCount
]]
function HistoryHeroDataHelper.getHistoricalHeroSlotList()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local slotList = {}
	local unlockCount = 0
	local isOpen, des, funcLevelInfo = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO_TEAM_SLOT1)
	for i = 1, 6 do
		table.insert(slotList, {isopen = isOpen, info = funcLevelInfo})
		unlockCount = isOpen and unlockCount + 1 or unlockCount
	end
	return slotList, unlockCount
end



function HistoryHeroDataHelper.sortList(unitDataList, weightData)
	local tmpList = {}
	local historyHeroIds = G_UserData:getHistoryHero():getHistoryHeroIds()--阵上的id
	local getIndex = function(data)
		for i, v in ipairs(historyHeroIds) do
			if v == data:getId() then
				return i
			end
		end
		return 999
	end

	for i, v in pairs(unitDataList) do
		if weightData and weightData:getId() == v:getId() then
			table.insert(tmpList, {data = v, weight = 100, index = getIndex(v)})--weight权重
		else
			table.insert(tmpList, {data = v, weight = 0, index = getIndex(v)})
		end
	end
	local sortFunc = function(a, b)
		-- if a.index ~= b.index then
		-- 	return a.index < b.index --装备的排在前面
		if a.data:isEquiped() ~= b.data:isEquiped() then
			return a.data:isEquiped() == true --装备的排在前面
		elseif a.data:getConfig().color ~= b.data:getConfig().color then
			return a.data:getConfig().color > b.data:getConfig().color --橙色排前面
		elseif a.data:getBreak_through() ~= b.data:getBreak_through() then
			return a.data:getBreak_through() > b.data:getBreak_through() --等级高
		else
			return a.data:getId() < b.data:getId()
		end
	end
	
	table.sort(tmpList, sortFunc)

	local result = {}
	for type, data in pairs(tmpList) do
		table.insert(result, data.data)
	end

	return result
end

function HistoryHeroDataHelper.sortWeaponList(list)
	local sortFunc = function(a, b)
		return a:getId() > b:getId()
	end
	
	local tmpList = {}
	for i, v in pairs(list) do
		table.insert(tmpList, v)
	end
	table.sort(tmpList, sortFunc)

	local result = {}
	for type, data in pairs(tmpList) do
		table.insert(result, data)
	end

	return result
end

function HistoryHeroDataHelper.getAttrSingleInfo(unitData)
	local info = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(unitData:getConfig().id, unitData:getBreak_through())
	local result = {}

	AttrDataHelper.formatAttr(result, AttributeConst.ATK, info.atk)
	AttrDataHelper.formatAttr(result, AttributeConst.PD, info.pdef)
	AttrDataHelper.formatAttr(result, AttributeConst.MD, info.mdef)
	AttrDataHelper.formatAttr(result, AttributeConst.HP, info.hp)
	AttrDataHelper.formatAttr(result, info.skill_type1, info.skill_size1)

	return result
end

function HistoryHeroDataHelper.getPowerSingleInfo(unitData)
	local info = HistoryHeroDataHelper.getHistoryHeroStepByHeroId(unitData:getConfig().id, unitData:getBreak_through())
	local result = {}

	AttrDataHelper.formatAttr(result, AttributeConst.HISTORICAL_HERO_POWER, info.power)

	return result
end

return HistoryHeroDataHelper
