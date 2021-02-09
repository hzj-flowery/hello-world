
local BaseData = require("app.data.BaseData")
local GuildOpenRedBagUserData = class("GuildOpenRedBagUserData", BaseData)
local schema = {}
schema["user_id"] 			= {"number", 0} --玩家id
schema["user_name"] 		= {"string", ""} --玩家name
schema["get_money"] 		= {"number", 0} --抢到的钱
schema["is_best"] 		= {"boolean", false} --是否手气最佳

GuildOpenRedBagUserData.schema = schema
function GuildOpenRedBagUserData:ctor(properties)
	GuildOpenRedBagUserData.super.ctor(self, properties)
end

function GuildOpenRedBagUserData:clear()
end

function GuildOpenRedBagUserData:reset()
end

return GuildOpenRedBagUserData	
    
