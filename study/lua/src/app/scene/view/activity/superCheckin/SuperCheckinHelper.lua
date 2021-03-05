local SuperCheckinHelper = {}

function SuperCheckinHelper.getAwardList()
	local list = {}
	local curLevel = G_UserData:getBase():getLevel()
	local ActCheckinSuperConfig = require("app.config.act_checkin_super")
	local curAwardsConfig = ActCheckinSuperConfig.get(curLevel)
	assert(curAwardsConfig ~= nil, "act_checkin_super can not find level = "..curLevel)
	local maxConfig = (#curAwardsConfig._raw - 1)/3
	local awards = {}
	for i = 1, maxConfig do
		if curAwardsConfig["type_"..i] and curAwardsConfig["type_"..i] ~= 0 then
			local award = {}
			award.type = curAwardsConfig["type_"..i]
			award.value = curAwardsConfig["value_"..i]
			award.size = curAwardsConfig["size_"..i]
			table.insert(awards, award)
		end
	end
	return awards
end

function SuperCheckinHelper.getMaxSelectNum()
	local ParamConfig = require("app.config.parameter")
	local config = ParamConfig.get(200)
	assert(config ~= nil, "can not find ParamConfig id = 200")
	return tonumber(config.content)
end


return SuperCheckinHelper
