
local BaseData = require("app.data.BaseData")
local GuildWarWatch = class("GuildWarWatch", BaseData)

local schema = {}
schema["city_id"] = {"number", 0} --城池id
schema["point_id"] = {"number", 0} --据点id
schema["watch_value"] = {"number", 0} --建筑物血量

GuildWarWatch.schema = schema

function GuildWarWatch:ctor()
	GuildWarWatch.super.ctor(self)
end

-- 清除
function GuildWarWatch:clear()
end

-- 重置
function GuildWarWatch:reset()
end

function GuildWarWatch:initData(data)
    self:setProperties(data)
end

return GuildWarWatch





