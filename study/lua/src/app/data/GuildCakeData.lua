-- Author: Liangxu
-- Date: 2019-5-5
-- 蛋糕活动军团蛋糕信息

local BaseData = require("app.data.BaseData")
local GuildCakeData = class("GuildCakeData", BaseData)

local schema = {}
schema["guild_id"] = {"number", 0}
schema["guild_name"] = {"string", ""}
schema["cake_level"] = {"number", 0}
schema["cake_exp"] = {"number", 0}
schema["guild_icon"] = {"number", 0}
schema["guild_noraml_end_rank"] = {"number", 0}
GuildCakeData.schema = schema

function GuildCakeData:ctor(properties)
	GuildCakeData.super.ctor(self, properties)

end

function GuildCakeData:reset()
	
end

function GuildCakeData:clear()

end

function GuildCakeData:updateData(data)
	self:backupProperties()
	self:setProperties(data)
end

--是否升级了
function GuildCakeData:isLevelUp()
	local lastLevel = self:getLastCake_level()
	local curLevel = self:getCake_level()
	return curLevel > lastLevel
end

return GuildCakeData