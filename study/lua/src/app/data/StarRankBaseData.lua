local BaseData = require("app.data.BaseData")
local StarRankBaseData = class("StarRankBaseData", BaseData)

local schema = {}
schema["rank"] 			                = {"number", 0}
schema["avatar_base_id"]				= {"number", 0}
schema["name"] 			                = {"string", ""}
schema["star"] 			                = {"number", 0}
schema["user_id"] 			            = {"number", 0}
schema["level"]                         = {"number", 0}
schema["officer_level"] 			    = {"number", 0}
schema["chapter"]                       = {"number", 0}
StarRankBaseData.schema = schema

function StarRankBaseData:ctor(properties)
    StarRankBaseData.super.ctor(self, properties)
end

function StarRankBaseData:clear()
	
end

function StarRankBaseData:reset()	
end

function StarRankBaseData:updateData(data)

end

return StarRankBaseData