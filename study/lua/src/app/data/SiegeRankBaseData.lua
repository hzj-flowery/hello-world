local BaseData = require("app.data.BaseData")
local SiegeRankBaseData = class("SiegeRankBaseData", BaseData)

local schema = {}
schema["rank"] 			                = {"number", 0}
schema["name"] 			                = {"string", ""}
schema["hurt"] 			                = {"number", 0}
schema["user_id"] 			            = {"number", 0}
schema["level"]                         = {"number", 0}
schema["officer_level"] 			    = {"number", 0}
SiegeRankBaseData.schema = schema

function SiegeRankBaseData:ctor(properties)
    SiegeRankBaseData.super.ctor(self, properties)
end

function SiegeRankBaseData:clear()
end

function SiegeRankBaseData:reset()	
end

function SiegeRankBaseData:updateData(data)
end

return SiegeRankBaseData