--真武战神排行数据
local BaseData = require("app.data.BaseData")
local UniverseRacePlayerRankData = class("UniverseRacePlayerRankData", BaseData)

local schema = {}
schema["user_id"] = {"number", 0}
schema["user_name"] = {"string", ""}
schema["server_id"] = {"number", 0}
schema["server_name"] = {"string", ""}
schema["source"] = {"number", 0}
schema["officer_lv"] = {"number", 0}
schema["rank"] = {"number", 0}
UniverseRacePlayerRankData.schema = schema

function UniverseRacePlayerRankData:ctor(properties)
	UniverseRacePlayerRankData.super.ctor(self, properties)
end

function UniverseRacePlayerRankData:clear()
	
end

function UniverseRacePlayerRankData:reset()
	
end

function UniverseRacePlayerRankData:updateData(data)
	self:setProperties(data)
end

return UniverseRacePlayerRankData