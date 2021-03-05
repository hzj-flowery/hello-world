local BaseData = require("app.data.BaseData")
local TowerRankBaseData = class("TowerRankBaseData", BaseData)

local schema = {}
schema["rank"] 			                = {"number", 0}
schema["avatar_base_id"]				= {"number", 0}
schema["name"] 			                = {"string", ""}
schema["star"] 			                = {"number", 0}
schema["user_id"] 			            = {"number", 0}
schema["level"]                         = {"number", 0}
schema["officer_level"] 			    = {"number", 0}
schema["layer"]                         = {"number", 0}
TowerRankBaseData.schema = schema

function TowerRankBaseData:ctor(properties)
    TowerRankBaseData.super.ctor(self, properties)
end

function TowerRankBaseData:clear()
end

function TowerRankBaseData:reset()	
end

function TowerRankBaseData:updateData(data)

end

return TowerRankBaseData