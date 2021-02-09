-- Author: nieming
-- Date:2018-05-11 15:20:06
-- Describle：

local BaseData = require("app.data.BaseData")
local CountryBossInterceptUnitData = class("CountryBossInterceptUnitData", BaseData)

local schema = {}
--schema
schema["user_id"] = {"number", 0}
schema["name"] = {"string", ""}
schema["power"] = {"number", 0}
schema["office_level"] = {"number", 0}
schema["guild_name"] = {"string", ""}
schema["base_id"] = {"number", 0}
schema["hero_base_id"] = {"table", {}}
schema["title"] = {"number", 0}
schema["avatar_base_id"] = {"number", 0}
CountryBossInterceptUnitData.schema = schema

function CountryBossInterceptUnitData:ctor(properties)
	CountryBossInterceptUnitData.super.ctor(self, properties)



end

function CountryBossInterceptUnitData:clear()

end

function CountryBossInterceptUnitData:reset()

end



return CountryBossInterceptUnitData
