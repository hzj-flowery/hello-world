--
-- Author: Liangxu
-- Date: 2018-1-15 14:14:28
-- 属性数据

local BaseData = require("app.data.BaseData")
local AttrData = class("AttrData", BaseData)
local AttrRecordUnitData = require("app.data.AttrRecordUnitData")

local schema = {}
schema["curPower"] = {"number", 0}
schema["lastPower"] = {"number", 0}
AttrData.schema = schema

function AttrData:ctor(properties)
	AttrData.super.ctor(self, properties)

	self._recordData = {}
	self._key2Power = {}
end

function AttrData:reset()
	self._recordData = {}
	self._key2Power = {}
end

function AttrData:clear()

end

function AttrData:createRecordData(id)
	local unitData = self:getRecordUnitData(id)
	if unitData == nil then
		local properties = {id = id}
		unitData = AttrRecordUnitData.new(properties)
		self._recordData["k_"..id] = unitData
	end
	
	return unitData
end

function AttrData:getRecordUnitData(id)
	return self._recordData["k_"..id]
end

function AttrData:recordPower(value)
	value = value or G_UserData:getBase():getPower() --默认记录总战力
	local curValue = self:getCurPower()
	self:setLastPower(curValue)
	self:setCurPower(value)
end

function AttrData:getPowerDiffValue()
	local curPower = self:getCurPower()
	local lastPower = self:getLastPower()
	local diffPower = curPower - lastPower
	return diffPower
end

function AttrData:recordPowerWithKey(key, value)
	assert(key, "recordPowerWithKey, key can not be nil")
	value = value or G_UserData:getBase():getPower() --默认记录总战力
	local powerInfo = self._key2Power[key] or {}
	local curValue = powerInfo.curPower or 0
	self._key2Power[key] = powerInfo
	self._key2Power[key].lastPower = curValue
	self._key2Power[key].curPower = value
end

function AttrData:getCurPowerWithKey(key)
	local powerInfo = self._key2Power[key] or {}
	local curPower = powerInfo.curPower or 0
	return curPower
end

function AttrData:getPowerDiffValueWithKey(key)
	local powerInfo = self._key2Power[key] or {}
	local curPower = powerInfo.curPower or 0
	local lastPower = powerInfo.lastPower or 0
	local diffPower = curPower - lastPower
	return diffPower
end

return AttrData