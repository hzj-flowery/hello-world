-- Author: nieming
-- Date:2018-01-30 15:46:41
-- Describle：

local BaseData = require("app.data.BaseData")
local GuildAnswerMyGuildRankUnitData = class("GuildAnswerMyGuildRankUnitData", BaseData)

local schema = {}
schema["user_id"] = {"number", 0}  --
schema["name"] = {"string", ""} --
schema["point"] = {"number", 0} --
schema["rank"] = {"number", 0} --
--schema
GuildAnswerMyGuildRankUnitData.schema = schema


function GuildAnswerMyGuildRankUnitData:ctor(properties)
	GuildAnswerMyGuildRankUnitData.super.ctor(self, properties)

end

function GuildAnswerMyGuildRankUnitData:clear()

end

function GuildAnswerMyGuildRankUnitData:reset()

end



return GuildAnswerMyGuildRankUnitData
