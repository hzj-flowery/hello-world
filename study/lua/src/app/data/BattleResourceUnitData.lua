--每个阵位上的装备（单项数据）
local BaseData = require("app.data.BaseData")
local BattleResourceUnitData = class("BattleResourceUnitData", BaseData)
local schema = {}
schema["pos"] 	= {"number", 0} --阵位
schema["id"] 	= {"number", 0} --装备id
schema["flag"] 	= {"number", 0} --装备类型
schema["slot"] 	= {"number", 0} --阵位上的第几个装备
BattleResourceUnitData.schema = schema

function BattleResourceUnitData:ctor(properties)
	BattleResourceUnitData.super.ctor(self, properties)
end

function BattleResourceUnitData:clear()
	
end

function BattleResourceUnitData:reset()
	
end

function BattleResourceUnitData:initData(data)
	self:setProperties(data)
end

return BattleResourceUnitData