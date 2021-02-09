
local BaseData = require("app.data.BaseData")
local SingleRacePlayerRankData = class("SingleRacePlayerRankData", BaseData)
local schema = {}
schema["server_id"] = {"number", 0}
schema["server_name"] = {"string", ""}
schema["sorce"] = {"number", 0}
schema["rank"] = {"number", 0}
schema["user_id"] = {"number", 0}
schema["user_name"] = {"string", ""}
SingleRacePlayerRankData.schema = schema

function SingleRacePlayerRankData:ctor(properties)
	SingleRacePlayerRankData.super.ctor(self, properties)
end

function SingleRacePlayerRankData:clear()
	
end

function SingleRacePlayerRankData:reset()
	
end

function SingleRacePlayerRankData:updateData(data)
	self:setProperties(data)
end

return SingleRacePlayerRankData