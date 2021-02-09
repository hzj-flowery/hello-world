--矿战user数据
local BaseData = require("app.data.BaseData")
local MineUserData = class("MineUserData", BaseData)

local schema = {}
schema["user_id"] = {"number", 0}
schema["user_name"] = {"string", ""}
schema["guild_id"] = {"number", 0}
schema["guild_name"] = {"string", ""}
schema["army_value"] = {"number", 0}
schema["tired_value"] = {"number", 0}
schema["officer_level"] = {"number", 0}
schema["base_id"] = {"number", 0}
schema["power"] = {"number", 0}
schema["guild_level"] = {"number", 0}
schema["guild_exp"] = {"number", 0}
schema["buff_id"] = {"table", 0}
schema["avatar_base_id"] = {"number", 0}
schema["guild_icon"] = {"number", 0}
schema["title"] = {"number", 0}
schema["privilege_time"] = {"number", 0}
schema["infam_value"] = {"number", 0}
schema["refresh_time"] = {"number", 0}
MineUserData.schema = schema

function MineUserData:ctor(properties)
    MineUserData.super.ctor(self, properties)
end

function MineUserData:clear()
end

function MineUserData:reset()
end

return MineUserData