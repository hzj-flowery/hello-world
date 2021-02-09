local BaseData = require("app.data.BaseData")
local GuildWarMemberData = class("GuildWarMemberData", BaseData)

local schema = {}
schema["user_id"] = {"number", 0} 
schema["user_name"] = {"string", ""}
schema["officer_level"] = {"number", 0} 

--1:击杀次数 2:死亡次数 3:军团战功

GuildWarMemberData.KEY_KILL = 1
GuildWarMemberData.KEY_ATTACK = 2
GuildWarMemberData.KEY_CONTRIBUTION = 3

GuildWarMemberData.schema = schema

function GuildWarMemberData:ctor()
    self._map = {}
	GuildWarMemberData.super.ctor(self)
end

-- 清除
function GuildWarMemberData:clear()
end

-- 重置
function GuildWarMemberData:reset()
end

function GuildWarMemberData:initData(data)
    self:setProperties(data)

    local map = {}
    local warData = rawget(data,"war_data") or {} 
     dump(warData)
    for k,v in ipairs(warData) do
        map[v.Key] = v.Value 
    end
    self._map = map
    dump(map)
end

function GuildWarMemberData:getValue(key)
    return  self._map[key] or 0
end

return GuildWarMemberData