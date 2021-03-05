local BaseData = require("app.data.BaseData")
local ServerListRoleUnitData = class("ServerListRoleUnitData", BaseData)

local schema = {}
schema["uid"] 		= {"number", 0}
schema["uuid"] 	= {"string", ""}
schema["server_id"] 	= {"number", 0}
schema["role_name"] 	= {"string", ""}
schema["role_lv"]		= {"number", 0}
schema["ip"]		= {"string", ""}
schema["create_time"] 		= {"number", 0}
schema["update_time"] 		= {"number", 0}
ServerListRoleUnitData.schema = schema

--
function ServerListRoleUnitData:ctor(properties)
	ServerListRoleUnitData.super.ctor(self, properties)
end

return ServerListRoleUnitData