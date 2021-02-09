--
-- Author: Liangxu
-- Date: 2017-06-29 19:48:53
-- 军团援助数据
local BaseData = require("app.data.BaseData")
local GuildHelpBaseData = class("GuildHelpBaseData", BaseData)

local schema = {}
schema["help_no"] = {"number", 0} --编号
schema["help_id"] = {"number", 0} --id
schema["limit_max"] = {"number", 0} --最大上线
schema["already_help"] = {"number", 0} --已经捐献
schema["already_get"] = {"number", 0} --已经领取
schema["time"] = {"number", 0} --时间
GuildHelpBaseData.schema = schema

function GuildHelpBaseData:ctor(properties)
	GuildHelpBaseData.super.ctor(self, properties)
end

function GuildHelpBaseData:clear()
	
end

function GuildHelpBaseData:reset()
	
end

return GuildHelpBaseData