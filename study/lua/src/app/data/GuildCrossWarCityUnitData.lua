-- @Author  panhoa
-- @Date  7.11.2019
-- @Role 

local BaseData = require("app.data.BaseData")
local GuildCrossWarCityUnitData = class("GuildCrossWarCityUnitData", BaseData)


local schema = {}
schema["key_point_id"]   = {"number", 0}     --城池id
schema["guild_id"]       = {"number", 0}     --占据公会id
schema["guild_name"]     = {"string", ""}    --占据公会名称
schema["guild_level"]    = {"number", 1}     --军团等级
schema["sid"]            = {"number", 0}     --服务器id
schema["sname"]          = {"string", ""}    --占据服务器名称
schema["hp"]             = {"number", 0}     --城池当前血量
schema["max_hp"]         = {"number", 0}     --城池总血量
schema["attack_lists"]   = {"table", {}}     --攻击城池列表
schema["action"]         = {"action", 0}     --304-击杀守卫  302-占领(空城) 303-抢夺(成功)  0-攻击城池


GuildCrossWarCityUnitData.schema = schema
function GuildCrossWarCityUnitData:ctor(properties)
    GuildCrossWarCityUnitData.super.ctor(self, properties)
end

function GuildCrossWarCityUnitData:clear()
end

function GuildCrossWarCityUnitData:reset()
end

-- @Role    Update Data
function GuildCrossWarCityUnitData:updateData(data)
    self:setProperties(data)
end

-- @Role    Is Self Occupy
function GuildCrossWarCityUnitData:isSelfGuild()
    local guildId = G_UserData:getGuildCrossWar():getObserverGuildId()
    return self:getGuild_id() == (guildId > 0 and guildId or G_UserData:getGuild():getMyGuildId())
end


return GuildCrossWarCityUnitData