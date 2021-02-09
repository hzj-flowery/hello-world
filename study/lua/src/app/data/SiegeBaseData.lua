local BaseData = require("app.data.BaseData")
local SiegeBaseData = class("SiegeBaseData", BaseData)

local schema = {}
schema["uid"] 			                = {"number", 0}		--发现者id
schema["user_name"] 			        = {"string", ""}
schema["officer_level"] 			    = {"number", 0}
schema["id"] 			                = {"number", 0}
schema["end_time"]                      = {"number", 0}
schema["hp_now"] 			            = {"number", 0}
schema["hp_max"]                        = {"number", 0}
schema["killer_id"]                     = {"number", 0}
schema["killer_name"]                   = {"string", ""}
schema["killer_officer_level"]          = {"number", 0}
schema["public"]						= {"boolean", false}
schema["boss_level"]					= {"number", 0}
schema["boxEmpty"]						= {"boolean", false}

schema["notExist"]                         = {"boolean", false} --标记 新的数据中没有该数据
SiegeBaseData.schema = schema

function SiegeBaseData:ctor(properties)
    SiegeBaseData.super.ctor(self, properties)
end

function SiegeBaseData:clear()
end

function SiegeBaseData:reset()
end

function SiegeBaseData:updateData(data)
	self:setProperties(data)
end

return SiegeBaseData
