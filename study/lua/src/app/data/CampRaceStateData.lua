local BaseData = require("app.data.BaseData")
local CampRaceStateData = class("CampRaceStateData", BaseData)

local schema = {}
schema["camp"] = {"number", 0}
schema["final_status"] = {"number", 0}
schema["round"] = {"number", 0}
schema["start_time"] = {"number", 0}
CampRaceStateData.schema = schema

function CampRaceStateData:ctor(properties)
    CampRaceStateData.super.ctor(self, properties)
end

function CampRaceStateData:clear()
	
end

function CampRaceStateData:reset()
	
end

function CampRaceStateData:updateData(data)
	self:backupProperties()
	self:setProperties(data)
end

function CampRaceStateData:isChangeFinalStatus()
	local lastFinalStatus = self:getLastFinal_status()
	local curFinalStatus = self:getFinal_status()
	if lastFinalStatus ~= curFinalStatus then
		return true
	else
		return false
	end
end

return CampRaceStateData