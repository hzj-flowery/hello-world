local BaseData = require("app.data.BaseData")
local GatewayData = class("GatewayData", BaseData)

--
local schema    = {}
schema["ip"]    = {"string", ""}
schema["port"] 	= {"number", 0}
GatewayData.schema = schema

--
function GatewayData:ctor(properties)
	GatewayData.super.ctor(self, properties)
end

return GatewayData