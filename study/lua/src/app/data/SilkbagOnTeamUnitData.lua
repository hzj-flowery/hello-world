--
-- Author: Liangxu
-- Date: 2018-3-1 17:07:09
-- 上阵锦囊单元数据
local BaseData = require("app.data.BaseData")
local SilkbagOnTeamUnitData = class("SilkbagOnTeamUnitData", BaseData)

local schema = {}
schema["pos"] 			= {"number", 0}
schema["index"] 		= {"number", 0}
schema["silkbag_id"]	= {"number", 0}
SilkbagOnTeamUnitData.schema = schema

function SilkbagOnTeamUnitData:ctor(properties)
	SilkbagOnTeamUnitData.super.ctor(self, properties)
end

function SilkbagOnTeamUnitData:clear()
	
end

function SilkbagOnTeamUnitData:reset()
	
end

function SilkbagOnTeamUnitData:updateData(data)
	self:setProperties(data)
end

return SilkbagOnTeamUnitData