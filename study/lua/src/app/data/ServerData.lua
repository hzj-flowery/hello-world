local BaseData = require("app.data.BaseData")
local ServerData = class("ServerData", BaseData)
local ServerConst = require("app.const.ServerConst")

local schema = {}

schema["name"] 		= {"string", ""}
schema["status"] 	= {"number", 0}
schema["server"] 	= {"number", 0}
schema["opentime"] 	= {"string", ""}
schema["backserver"] = {"boolean", false}
schema["hide"]		= {"boolean", false}

ServerData.schema = schema

--
function ServerData:ctor(properties)
	ServerData.super.ctor(self, properties)
end

--开启时间文字描述
function ServerData:getOpentimeStr()
	local time = tonumber(self:getOpentime())
	if time then
		local strTime = G_ServerTime:getRefreshTimeStringYMD(time, 1)
		return strTime
	end
	return ""
end

--开启时间文字描述 第2种
function ServerData:getOpentimeStr2()
	local time = tonumber(self:getOpentime())
	if time then
		local strTime = G_ServerTime:getRefreshTimeString(time)
		return strTime
	end
	return ""
end

--是否是未开启状态
function ServerData:isUnopen()
	local status = self:getStatus()
	if status == ServerConst.SERVER_STATUS_COMING_CLIENT then
		return true
	end
	return false
end

return ServerData