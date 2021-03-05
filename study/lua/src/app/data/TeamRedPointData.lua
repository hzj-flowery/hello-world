--
-- Author: Liangxu
-- Date: 2017-08-10 09:34:39
-- 阵容红点数据
local BaseData = require("app.data.BaseData")
local TeamRedPointData = class("TeamRedPointData", BaseData)

local schema = {}
TeamRedPointData.schema = schema

function TeamRedPointData:ctor(properties)
	TeamRedPointData.super.ctor(self, properties)
	self:_initData()
end

function TeamRedPointData:clear()
	
end

function TeamRedPointData:reset()
	
end

function TeamRedPointData:_initData()
	self._info = {}
	local posRP = {}
	local reinforcementRP = {}
	local equipRP = {}
	local treasureRP = {}
	for i = 1, 6 do
		posRP[i] = nil
		equipRP[i] = {}
		treasureRP[i] = {}
		for j = 1, 4 do
			equipRP[i][j] = nil
		end
		for k = 1, 2 do
			treasureRP[i][k] = nil
		end
	end

	for i = 1, 8 do
		reinforcementRP[i] = nil
	end

	self._info["posRP"] = posRP
	self._info["equipRP"] = equipRP
	self._info["treasureRP"] = treasureRP
	self._info["reinforcementRP"] = reinforcementRP
end

function TeamRedPointData:setPosRP(pos, show)
	self._info["posRP"][pos] = show
end

function TeamRedPointData:getPosRP(pos)
	return self._info["posRP"][pos]
end

function TeamRedPointData:setEquipRP(pos, slot, show)
	self._info["equipRP"][pos][slot] = show
end

function TeamRedPointData:getEquipRP(pos, slot)
	return self._info["equipRP"][pos][slot]
end

function TeamRedPointData:setTreasureRP(pos, slot, show)
	self._info["treasureRP"][pos][slot] = show
end

function TeamRedPointData:geTreasureRP(pos, slot)
	return self._info["treasureRP"][pos][slot]
end

function TeamRedPointData:setReinforcementRP(pos, show)
	self._info["reinforcementRP"][pos] = show
end

function TeamRedPointData:getReinforcementRP(pos)
	return self._info["reinforcementRP"][pos]
end

return TeamRedPointData