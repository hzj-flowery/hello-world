
local ActivityGuildSprintDataHelper = {}

function ActivityGuildSprintDataHelper.getGuildSprintRankRewardList(rankDataList)
	local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")
	local SevenDaySprintAward = require("app.config.seven_day_sprint_award")
	local len = SevenDaySprintAward.length()
	local dataList = {}
	for i = 1,len,1 do
		local config = SevenDaySprintAward.indexOf(i)
		if config.type == TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT then
			local k = tostring(config.rank_min).."_"..tostring(config.rank_max)
			if not dataList[k]   then
				 dataList[k] = {rank_min = config.rank_min,rank_max = config.rank_max ,config1 = nil,config2 = nil,config3 = nil,rankData = nil}
			end
			dataList[k]["config"..tostring(config.value)] = config
			if config.rank_min == config.rank_max then
				dataList[k].rankData = rankDataList[config.rank_min]
			end
			
		end
		
	end
	local newDataList = {}
	for k,v in pairs(dataList) do
		table.insert( newDataList, v )
	end
	local sortFunc = function(obj1,obj2)
		return obj1.rank_min < obj2.rank_min
	end
	table.sort(newDataList,sortFunc)

	

	return newDataList
end

function ActivityGuildSprintDataHelper.isGuildSprintActEnd()
	return true
end

return ActivityGuildSprintDataHelper