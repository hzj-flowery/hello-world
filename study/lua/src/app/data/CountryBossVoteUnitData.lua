-- Author: nieming
-- Date:2018-05-10 16:26:34
-- Describle：

local BaseData = require("app.data.BaseData")
local CountryBossVoteUnitData = class("CountryBossVoteUnitData", BaseData)

local schema = {}
schema["boss_id"] = {"number", 0}
schema["is_kill"] = {"boolean", false}
schema["vote"] = {"number", 0}
--schema
CountryBossVoteUnitData.schema = schema


function CountryBossVoteUnitData:ctor(properties)
	CountryBossVoteUnitData.super.ctor(self, properties)



end

function CountryBossVoteUnitData:clear()

end

function CountryBossVoteUnitData:reset()

end



return CountryBossVoteUnitData
