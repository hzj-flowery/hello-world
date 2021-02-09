local BaseData = require("app.data.BaseData")
local GuildWarNotice = class("GuildWarNotice", BaseData)

local schema = {}
schema["guild_name"] = {"string", ""}
schema["user_name"] = {"string", ""} 
schema["point_id"] = {"number", 0} 
schema["id"] = {"number", 0} 

GuildWarNotice.schema = schema

function GuildWarNotice:ctor()
    self._map = {}
    self._map2 = {}
	GuildWarNotice.super.ctor(self)
end

-- 清除
function GuildWarNotice:clear()
end

-- 重置
function GuildWarNotice:reset()
end

function GuildWarNotice:initData(data)
    self:setProperties(data)
end

function GuildWarNotice:setValue(key,value)
    table.insert(self._map, {key  = key,value = tostring(value)} )
    self._map2[key] = tostring(value) 
end

function GuildWarNotice:getMap()
    return self._map
end

function GuildWarNotice:getMap2()
    return self._map2
end

return GuildWarNotice




