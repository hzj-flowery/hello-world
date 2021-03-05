
--跨服个人竞技比赛数据
local BaseData = require("app.data.BaseData")
local SingleRaceMatchData = class("SingleRaceMatchData", BaseData)

local schema = {}
schema["user_id"] = {"number", 0}
schema["position"] = {"number", 0}
schema["atk_user_support"] = {"number", 0}
schema["def_user_support"] = {"number", 0}
SingleRaceMatchData.schema = schema

function SingleRaceMatchData:ctor(properties)
	SingleRaceMatchData.super.ctor(self, properties)
end

function SingleRaceMatchData:clear()
	
end

function SingleRaceMatchData:reset()
	
end

function SingleRaceMatchData:updateData(data)
	self:setProperties(data)
end

return SingleRaceMatchData