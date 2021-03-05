-- Author: nieming
-- Date:2018-01-30 15:46:41
-- Describle：

local BaseData = require("app.data.BaseData")
local GuildAnswerRankUnitData = class("GuildAnswerRankUnitData", BaseData)

local schema = {}
schema["guild_id"] = {"number", 0}  --
schema["name"] = {"string", ""} --
schema["rank"] = {"number", 0} --
schema["point"] = {"number", 0} --
--schema
GuildAnswerRankUnitData.schema = schema


function GuildAnswerRankUnitData:ctor(properties)
	GuildAnswerRankUnitData.super.ctor(self, properties)

end

function GuildAnswerRankUnitData:clear()

end

function GuildAnswerRankUnitData:reset()

end



return GuildAnswerRankUnitData
