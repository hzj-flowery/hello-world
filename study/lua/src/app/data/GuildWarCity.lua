local BaseData = require("app.data.BaseData")
local GuildWarCity = class("GuildWarCity", BaseData)

local schema = {}
schema["city_id"] = {"number", 0} --城池id
schema["own_guild_id"] = {"number", 0} --占领的公会id
schema["own_guild_name"] = {"string", ""} --占领的公会name
schema["own_guild_icon"] = {"number", 0} --占领的公会旗子
schema["is_declare"] = {"boolean", false} --是否已经宣战
schema["declare_guild_num"] = {"number", 0} --已经宣战数量

GuildWarCity.schema = schema

function GuildWarCity:ctor()
	GuildWarCity.super.ctor(self)
end

-- 清除
function GuildWarCity:clear()
end

-- 重置
function GuildWarCity:reset()
end

function GuildWarCity:initData(data)
    self:setProperties(data)
end

return GuildWarCity