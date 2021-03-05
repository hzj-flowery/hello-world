
-- Author: hedili
-- Date:2018-01-09 16:11:00
-- Describle：


local StrongerHelper = {}

function StrongerHelper.getFuncLevelList()
	--为了分析开服时间，从FunctionCheck搬过来的函数
	local function getFunctionUpdateTime(timeStr)
		if not timeStr or timeStr == "" then
			return
		end
		local timeStrArr = string.split(timeStr, "|")
		assert( #timeStrArr == 2, "function_level config update_time  format error")
		local hour = tonumber(timeStrArr[1]) or 0
		local min = tonumber(timeStrArr[2]) or 0
		return hour * 3600 + min * 60
	end

	local UserCheck = require("app.utils.logic.UserCheck")
	local retList = {}
	local playerLevel = G_UserData:getBase():getLevel()
	local function_level = require("app.config.function_level")
	for i = 1, function_level.length() do
		
		local cfgData = function_level.indexOf(i)
		if cfgData.preview_show == 1 and G_UserData:getBase():getLevel() >= cfgData.preview_level then
			local saveTable = {}
			saveTable.funcData = cfgData
			saveTable.isOpen = true
			saveTable.limitDes = ""
			local resetTime = getFunctionUpdateTime(cfgData.update_time)
			if not UserCheck.enoughOpenDay(cfgData.day, resetTime) then
				saveTable.isOpen = false
				saveTable.limitDes = Lang.get("lang_stronger_open_day", {day = cfgData.day})
			elseif not UserCheck.enoughLevel(cfgData.level) then
				saveTable.isOpen = false
				saveTable.limitDes = Lang.get("lang_stronger_level", {level = cfgData.level})
			end
			
			table.insert( retList, saveTable )
		end

	end

	table.sort(retList, function(a, b) 
		if a.isOpen ~= b.isOpen then
			return b.isOpen
		end
		return a.funcData.preview_rank < b.funcData.preview_rank
	end)

	return retList
end

function StrongerHelper.getBubbleList( ... )
	-- body
	local retList = {}


	local function filterFunc(cfgData)
		if cfgData.id == 0 then
			return false
		end
		local playerLevel = G_UserData:getBase():getLevel()
		local FunctionCheck = require("app.utils.logic.FunctionCheck")
		if cfgData.function_level_id > 0 then
			if FunctionCheck.funcIsOpened(cfgData.function_level_id) == true 
				and cfgData.upgrade_level <= playerLevel  then

					local percent =  StrongerHelper.getPercent( cfgData )
					if percent < 100 then
						return false
					end
			end
		end
		return true
	end

	local recommend_upgrade = require("app.config.recommend_upgrade")
	for i = 1, recommend_upgrade.length() do
		local cfgData = recommend_upgrade.indexOf(i)
		if filterFunc(cfgData) == false then
			table.insert(retList, cfgData.bubble_id)
		end
	end
	return retList
end

function StrongerHelper.getRecommendUpgradeList()
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local retList = {}
	local playerLevel = G_UserData:getBase():getLevel()
	local recommend_upgrade = require("app.config.recommend_upgrade")
	for i = 1, recommend_upgrade.length() do
		local saveTable = {}
		local cfgData = recommend_upgrade.indexOf(i)
		if cfgData.function_level_id > 0 then
			if FunctionCheck.funcIsOpened(cfgData.function_level_id) == true and 
				cfgData.upgrade_level <= playerLevel  then
					saveTable.cfgData = cfgData
					saveTable.funcData = require("app.config.function_level").get(cfgData.function_level_id)
					saveTable.percent = StrongerHelper.getPercent( cfgData )
					table.insert( retList, saveTable )
			end
		end

	end
	return retList
end

function StrongerHelper.getPercent( cfgData )
	-- body
	local avgLevel = StrongerHelper["getAvgLevel"..cfgData.id]()
	if avgLevel == nil or avgLevel == "nan" then
		avgLevel = 0
	end
	local playerLevel = G_UserData:getBase():getLevel()

	local calculateFuncName = ""

	if playerLevel >= cfgData.percent_1_Lower and playerLevel <= cfgData.percent_1_upper then
		calculateFuncName = cfgData.upgrade_percent
	elseif playerLevel >= cfgData.percent_2_Lower and playerLevel <= cfgData.percent_2_upper then
		calculateFuncName = cfgData.upgrade_percent_2
	elseif playerLevel >= cfgData.percent_3_Lower then
		calculateFuncName = cfgData.upgrade_percent_3
	else
		calculateFuncName = cfgData.upgrade_percent
	end

	local str = Lang.getTxt(calculateFuncName, {LEVEL = playerLevel})
	local func1 = loadstring("return "..str)
	local percent = math.floor( func1() )

	local result = math.min((avgLevel / percent) * 100, 100)

	return math.floor( result )
end



--上阵武将（不含主角）等级平均值
function StrongerHelper.getAvgLevel1( ... )
	-- body
	local UserDataHepler = require("app.utils.UserDataHelper")
	return UserDataHepler.getHeroInBattleAverageLevel()

end


--上阵武将（含主角）突破等级平均值
function StrongerHelper.getAvgLevel2( ... )
	-- body
	local UserDataHepler = require("app.utils.UserDataHelper")
	return UserDataHepler.getHeroInBattleAverageRank()

end


--上阵武将（含主角）觉醒等级平均值
function StrongerHelper.getAvgLevel3( ... )
	-- body
	local UserDataHepler = require("app.utils.UserDataHelper")
	return UserDataHepler.getHeroInBattleAverageAwakeLevel()
end


--所有已穿戴装备的平均强化等级
function StrongerHelper.getAvgLevel4( ... )
	-- body
	local UserDataHepler = require("app.utils.UserDataHelper")
	return UserDataHepler.getEquipInBattleAverageStr()
end


--所有已穿戴装备的平均精炼等级
function StrongerHelper.getAvgLevel5( ... )
	-- body
	local UserDataHepler = require("app.utils.UserDataHelper")
	return UserDataHepler.getEquipInBattleAverageRefine()
end

--所有已穿戴宝物的平均强化等级
function StrongerHelper.getAvgLevel6( ... )
	-- body
	local UserDataHepler = require("app.utils.UserDataHelper")
	return UserDataHepler.getTreasureInBattleAverageStr()
end

--所有已穿戴宝物的平均精炼等级
function StrongerHelper.getAvgLevel7( ... )
	-- body
	local UserDataHepler = require("app.utils.UserDataHelper")
	return UserDataHepler.getTreasureInBattleAverageRefine()
end


--所有已穿戴神兵的平均进阶等级
function StrongerHelper.getAvgLevel8( ... )
	-- body
	local UserDataHepler = require("app.utils.UserDataHelper")
	return UserDataHepler.getInstrumentInBattleAverageAdvance()
end

return StrongerHelper