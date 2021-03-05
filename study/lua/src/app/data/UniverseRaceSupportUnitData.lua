--真武战神支持数据
local BaseData = require("app.data.BaseData")
local UniverseRaceSupportUnitData = class("UniverseRaceSupportUnitData", BaseData)

local schema = {}
schema["user_id"] = {"number", 0} --自己的userId(没用)
schema["position"] = {"number", 0}
schema["support"] = {"number", 0} --所支持的userId
schema["series"] = {"number", 0} --0表示单场  >0表示串联分组
UniverseRaceSupportUnitData.schema = schema

function UniverseRaceSupportUnitData:ctor(properties)
	UniverseRaceSupportUnitData.super.ctor(self, properties)
end

function UniverseRaceSupportUnitData:clear()
	
end

function UniverseRaceSupportUnitData:reset()
	
end

function UniverseRaceSupportUnitData:updateData(data)
	self:setProperties(data)
end

--是否单场竞猜
function UniverseRaceSupportUnitData:isSingle()
	local series = self:getSeries()
	return series == 0
end

return UniverseRaceSupportUnitData