local BaseData = require("app.data.BaseData")
local DailyDungeonBaseData = class("DailyDungeonBaseData", BaseData)

local schema = {}
schema["type"] 			                    = {"number", 0}
schema["remain_count"] 			            = {"number", 0}
schema["last_battle_time"] 			        = {"number", 0}
schema["first_enter_max_id"]                = {"number", 0}
schema["max_id"] 			                = {"number", 0}
DailyDungeonBaseData.schema = schema

function DailyDungeonBaseData:ctor(properties)
    DailyDungeonBaseData.super.ctor(self, properties)
end

function DailyDungeonBaseData:clear()
	
end

function DailyDungeonBaseData:reset()
	
end

function DailyDungeonBaseData:updateData(properties)
	self:backupProperties()
	self:setProperties(properties)
end

return DailyDungeonBaseData