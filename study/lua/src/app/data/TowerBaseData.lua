local BaseData = require("app.data.BaseData")
local TowerBaseData = class("TowerBaseData", BaseData)

local schema = {}
schema["id"] 			        = {"number", 0}
schema["star"] 			        = {"number", 0}
schema["now_star"] 				= {"number", 0}
schema["receive_box"] 	        = {"boolean", false}
TowerBaseData.schema = schema

function TowerBaseData:ctor(properties)
    TowerBaseData.super.ctor(self, properties)
end

function TowerBaseData:clear()
	
end

function TowerBaseData:reset()
	
end

function TowerBaseData:updateData(data)
	self:backupProperties()
	self:setProperties(data)
end

return TowerBaseData