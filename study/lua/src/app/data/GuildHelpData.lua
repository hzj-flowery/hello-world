--
-- Author: Liangxu
-- Date: 2017-06-29 20:34:03
-- 军团援助数据
local BaseData = require("app.data.BaseData")
local GuildHelpData = class("GuildHelpData", BaseData)

local schema = {}
schema["member"] = {"table", {}}
schema["help_base"] = {"table", {}}
GuildHelpData.schema = schema

function GuildHelpData:ctor(properties)
	GuildHelpData.super.ctor(self, properties)
end

function GuildHelpData:clear()
	
end

function GuildHelpData:reset()
	
end

return GuildHelpData