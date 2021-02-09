local BaseData = require("app.data.BaseData")
local TowerSurpriseData = class("TowerSurpriseData", BaseData)

local schema = {}
schema["surprise_id"] 			        = {"number", 0}
schema["win"] 			                = {"boolean", false}
TowerSurpriseData.schema = schema

function TowerSurpriseData:ctor(properties)
    TowerSurpriseData.super.ctor(self, properties)
end

function TowerSurpriseData:clear()

end

function TowerSurpriseData:reset()	
end

function TowerSurpriseData:updateData(data)

end

return TowerSurpriseData