--
-- Author: Liangxu
-- Date: 2017-06-28 10:34:52
-- 军团日志数据
local BaseData = require("app.data.BaseData")
local GuildSystemNotifyData = class("GuildSystemNotifyData", BaseData)


local schema = {}
schema["sn_type"] = {"number", 0}
schema["content"] = {"table", {}}
schema["time"]	  = {"number", 0}	
GuildSystemNotifyData.schema = schema

function GuildSystemNotifyData:ctor(properties)
	GuildSystemNotifyData.super.ctor(self, properties)
end

function GuildSystemNotifyData:clear()
	
end

function GuildSystemNotifyData:reset()
	
end

return GuildSystemNotifyData