--真武战神竞猜
local BaseData = require("app.data.BaseData")
local UniverseRaceChipInData = class("UniverseRaceChipInData", BaseData)

local schema = {}
schema["pos"] = {"number", 0}
schema["userId"] = {"number", 0}
schema["add_num"] = {"number", 0}
UniverseRaceChipInData.schema = schema

function UniverseRaceChipInData:ctor(properties)
	UniverseRaceChipInData.super.ctor(self, properties)
end

function UniverseRaceChipInData:clear()
	
end

function UniverseRaceChipInData:reset()
	
end

function UniverseRaceChipInData:updateData(data)
	self:setProperties(data)
end

return UniverseRaceChipInData