
local BaseData = require("app.data.BaseData")
local SingleRaceServerRankData = class("SingleRaceServerRankData", BaseData)
local schema = {}
schema["server_id"] = {"number", 0}
schema["server_name"] = {"string", ""}
schema["sorce"] = {"number", 0}
schema["rank"] = {"number", 0}
SingleRaceServerRankData.schema = schema

function SingleRaceServerRankData:ctor(properties)
	SingleRaceServerRankData.super.ctor(self, properties)
end

function SingleRaceServerRankData:clear()
	
end

function SingleRaceServerRankData:reset()
	
end

function SingleRaceServerRankData:updateData(data)
	self:setProperties(data)
end

return SingleRaceServerRankData