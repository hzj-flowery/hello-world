local BaseData = require("app.data.BaseData")
local SiegeGuildRankBaseData = class("SiegeGuildRankBaseData", BaseData)

local schema = {}
schema["rank"] 			                = {"number", 0}
schema["name"] 			                = {"string", ""}
schema["hurt"] 			                = {"number", 0}
schema["guild_id"] 			            = {"number", 0}
SiegeGuildRankBaseData.schema = schema

function SiegeGuildRankBaseData:ctor(properties)
    SiegeGuildRankBaseData.super.ctor(self, properties)
end

function SiegeGuildRankBaseData:clear()
end

function SiegeGuildRankBaseData:reset()	
end

function SiegeGuildRankBaseData:updateData(data)
end

return SiegeGuildRankBaseData