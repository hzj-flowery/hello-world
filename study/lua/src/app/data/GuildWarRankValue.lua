local BaseData = require("app.data.BaseData")
local GuildWarRankValue = class("GuildWarRankValue", BaseData)

local schema = {}
schema["city_id"] = {"number", 0} --城池id
schema["guild_id"] = {"number", 0} --
schema["guild_name"] = {"string", ""} --
schema["hurt"] = {"number", 0} --伤害

GuildWarRankValue.schema = schema

function GuildWarRankValue:ctor()
	GuildWarRankValue.super.ctor(self)
end

-- 清除
function GuildWarRankValue:clear()
end

-- 重置
function GuildWarRankValue:reset()
end

function GuildWarRankValue:initData(data)
    self:setProperties(data)
end

return GuildWarRankValue




