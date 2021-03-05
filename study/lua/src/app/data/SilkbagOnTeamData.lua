--
-- Author: Liangxu
-- Date: 2018-3-1 17:07:09
-- 上阵锦囊数据
local BaseData = require("app.data.BaseData")
local SilkbagOnTeamData = class("SilkbagOnTeamData", BaseData)
local SilkbagOnTeamUnitData = require("app.data.SilkbagOnTeamUnitData")

local schema = {}
SilkbagOnTeamData.schema = schema

function SilkbagOnTeamData:ctor(properties)
	SilkbagOnTeamData.super.ctor(self, properties)
	self._silkbagPosTable = {} --定位表
	self._silkbagOnTeamList = {} 

	self._recvGetEquipSilkbag = G_NetworkManager:add(MessageIDConst.ID_S2C_GetEquipSilkbag, handler(self, self._s2cGetEquipSilkbag))
end

function SilkbagOnTeamData:clear()
	self._recvGetEquipSilkbag:remove()
	self._recvGetEquipSilkbag = nil
end

function SilkbagOnTeamData:reset()
	self._silkbagPosTable = {}
	self._silkbagOnTeamList = {}
end

function SilkbagOnTeamData:_s2cGetEquipSilkbag(id, message)
	local silkbagOnTeamList = rawget(message, "equip_silkbag") or {}
	self._silkbagOnTeamList = {}
	for i, data in ipairs(silkbagOnTeamList) do
		self:_setSilkbagOnTeamData(data)
	end
end

function SilkbagOnTeamData:_setSilkbagOnTeamData(data)
	local unitData = SilkbagOnTeamUnitData.new()
	unitData:updateData(data)
	local pos = unitData:getPos()
	local index = unitData:getIndex()
	local silkbagId = unitData:getSilkbag_id()

	if self._silkbagPosTable[pos] == nil then
		self._silkbagPosTable[pos] = {}
	end
	self._silkbagPosTable[pos][index] = silkbagId
	self._silkbagOnTeamList["k_"..tostring(silkbagId)] = unitData
end

function SilkbagOnTeamData:getUnitDataWithId(id)
	local unitData = self._silkbagOnTeamList["k_"..tostring(id)]

	return unitData
end

function SilkbagOnTeamData:getIdsOnTeamWithPos(pos)
	local result = {}
	local posTable = self._silkbagPosTable[pos] or {}
	for k, silkbagId in pairs(posTable) do
		if silkbagId > 0 then
			table.insert(result, silkbagId)
		end
	end

	return result
end

function SilkbagOnTeamData:getIdWithPosAndIndex(pos, index)
	if self._silkbagPosTable[pos] == nil then
		return 0
	end

	local silkbagId = self._silkbagPosTable[pos][index] or 0
	return silkbagId
end

return SilkbagOnTeamData