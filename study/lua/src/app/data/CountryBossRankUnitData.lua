-- Author: nieming
-- Date:2018-05-09 17:45:01
-- Describle：

local BaseData = require("app.data.BaseData")
local CountryBossRankUnitData = class("CountryBossRankUnitData", BaseData)

local schema = {}
--schema
schema["guild_id"] = {"number", 0}
schema["hurt_rate"] = {"number", 0}
schema["guild_name"] = {"string", 0}
schema["rank"] = {"number", 0}
CountryBossRankUnitData.schema = schema

function CountryBossRankUnitData:ctor(properties)
	CountryBossRankUnitData.super.ctor(self, properties)
end



function CountryBossRankUnitData:clear()

end

function CountryBossRankUnitData:reset()

end



return CountryBossRankUnitData
