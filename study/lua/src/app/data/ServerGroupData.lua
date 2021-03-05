
local BaseData = require("app.data.BaseData")
local ServerGroupData = class("ServerGroupData", BaseData)

local schema = {}

schema["groupid"] 	= {"number", 0}
schema["groupname"] = {"string", ""}
schema["servers"] 	= {"string", ""}
ServerGroupData.schema = schema

--
function ServerGroupData:ctor(properties)
	ServerGroupData.super.ctor(self, properties)
end

function ServerGroupData:getServerIds()
	local strServers = self:getServers()
	local serverIds = string.split(strServers, ",")
	return serverIds
end

return ServerGroupData