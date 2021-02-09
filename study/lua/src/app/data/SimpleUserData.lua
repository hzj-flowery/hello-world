
local BaseData = import(".BaseData")
local SimpleUserData = class("SimpleUserData", BaseData)

local schema = {}
schema["user_id"] = {"number", 0}
schema["name"] = {"string", ""}
schema["officer_level"] = {"number", 0}
schema["leader"] = {"number", 0}
schema["avatar_base_id"] = {"number", 0}
schema["title"] = {"number", 0}
schema["level"] = {"number", 0}
SimpleUserData.schema = schema

function SimpleUserData:ctor(properties)
	SimpleUserData.super.ctor(self, properties)
end

function SimpleUserData:clear()

end

function SimpleUserData:reset()
	
end

return SimpleUserData