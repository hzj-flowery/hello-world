--
-- Author: Liangxu
-- Date: 2017-04-07 14:14:25
-- 上阵装备数据
local BaseData = require("app.data.BaseData")
local EquipConst = require("app.const.EquipConst")
local BattleResourceUnitData = require("app.data.BattleResourceUnitData")
local HorseConst = require("app.const.HorseConst")

----------------------------------------------------------------------------
--上阵装备数据集合
local BattleResourceData = class("BattleResourceData", BaseData)
function BattleResourceData:ctor(properties)
	BattleResourceData.super.ctor(self, properties)

	self._equipList = {} --阵位上的装备
	self._treasureList = {} --阵位上的宝物
	self._instrumentList = {} --阵位上的神兵
	self._horseList = {} --阵位上的战马
	self._tacticsList = {} --阵位上的战法

	self._resourcePosTable = {} --装备定位表
	self._recvGetBattleResource = G_NetworkManager:add(MessageIDConst.ID_S2C_GetBattleResource, handler(self, self._s2cGetBattleResource))
end

function BattleResourceData:clear()
	self._recvGetBattleResource:remove()
	self._recvGetBattleResource = nil
end

function BattleResourceData:reset()
	self._equipList = {} --阵位上的装备
	self._treasureList = {} --阵位上的宝物
	self._instrumentList = {} --阵位上的神兵
	self._horseList = {} --阵位上的战马
	self._tacticsList = {} --阵位上的战法
	self._resourcePosTable = {} --装备定位表
end

function BattleResourceData:_setResourceData(data)
	if data.id == 0 then
		return
	end

	local baseData = BattleResourceUnitData.new()
	baseData:initData(data)
	if data.flag == 1 then --装备
		self._equipList["k_"..tostring(data.id)] = baseData
	elseif data.flag == 2 then --宝物
		self._treasureList["k_"..tostring(data.id)] = baseData
	elseif data.flag == 3 then --神兵
		self._instrumentList["k_"..tostring(data.id)] = baseData
	elseif data.flag == 4 then --战马
		self._horseList["k_"..tostring(data.id)] = baseData
	elseif data.flag == 5 then --战法
		self._tacticsList["k_"..tostring(data.id)] = baseData
	end

	local pos = data.pos
	local flag = data.flag
	local slot = data.slot
	if self._resourcePosTable[pos] == nil then
		self._resourcePosTable[pos] = {}
	end
	if self._resourcePosTable[pos][flag] == nil then
		self._resourcePosTable[pos][flag] = {}
	end
	self._resourcePosTable[pos][flag][slot] = data.id
end

function BattleResourceData:_s2cGetBattleResource(id, message)
	self._equipList = {} --阵位上的装备
	self._treasureList = {} --阵位上的宝物
	self._instrumentList = {} --阵位上的神兵
	self._horseList = {}
	self._tacticsList = {} --阵位上的战法
	self._resourcePosTable = {} --装备定位表
	local resourceList = rawget(message, "battle_resource") or {}
	for i, data in ipairs(resourceList) do
		self:_setResourceData(data)
	end
end

function BattleResourceData:getAllEquipData()
	return self._equipList
end

function BattleResourceData:getAllTreasureData()
	return self._treasureList
end

function BattleResourceData:getAllInstrumentData()
	return self._instrumentList
end

function BattleResourceData:getAllHorseData()
	return self._horseList
end

function BattleResourceData:getAllTacticsData()
	return self._tacticsList
end

function BattleResourceData:getEquipDataWithId(id)
	return self._equipList["k_"..tostring(id)]
end

function BattleResourceData:getTreasureDataWithId(id)
	return self._treasureList["k_"..tostring(id)]
end

function BattleResourceData:getInstrumentDataWithId(id)
	return self._instrumentList["k_"..tostring(id)]
end

function BattleResourceData:getHorseDataWithId(id)
	return self._horseList["k_"..tostring(id)]
end

function BattleResourceData:getTactcisDataWithId(id)
	return self._tacticsList["k"..tostring(id)]
end

function BattleResourceData:getResourceId(pos, flag, slot)
	if self._resourcePosTable[pos] == nil then
		return nil
	end
	if self._resourcePosTable[pos][flag] == nil then
		return nil
	end
	return self._resourcePosTable[pos][flag][slot]
end

--设置装备的定位表
function BattleResourceData:setEquipPosTable(pos, slot, id, oldId, oldPos, oldSlot)
	local data = {id = id, pos = pos, flag = 1, slot = slot}
	self:_setResourceData(data)

	if oldId > 0 then
		self._equipList["k_"..tostring(oldId)] = nil
	end

	if oldPos > 0 and oldSlot > 0 then
		self._resourcePosTable[oldPos][1][oldSlot] = nil
	end
end

--清除装备的定位表
function BattleResourceData:clearEquipPosTable(pos, slot, oldId)
	self._equipList["k_"..tostring(oldId)] = nil
	self._resourcePosTable[pos][1][slot] = nil
end

--根据阵位获取此阵位上的装备Id集合
function BattleResourceData:getEquipIdsWithPos(pos)
	if self._resourcePosTable[pos] == nil then
		return {}
	end
	if self._resourcePosTable[pos][1] == nil then
		return {}
	end

	local result = {}
	for k, id in pairs(self._resourcePosTable[pos][1]) do
		table.insert(result, id)
	end
	return result
end

--根据阵位获取此阵位上的装备数据合集
function BattleResourceData:getEquipInfoWithPos(pos)
	if self._resourcePosTable[pos] == nil then
		return {}
	end
	if self._resourcePosTable[pos][1] == nil then
		return {}
	end

	local result = {}
	for k, id in pairs(self._resourcePosTable[pos][1]) do
		result[k] = id
	end
	return result
end

--根据装备静态Id获取它是否在第一阵位
--用于判断装备羁绊是否激活
function BattleResourceData:isInFirstPosWithEquipBaseId(equipBaseId)
	if self._resourcePosTable[1] == nil then
		return false
	end
	if self._resourcePosTable[1][1] == nil then
		return false
	end

	for k, equipId in pairs(self._resourcePosTable[1][1]) do
		local equipUnitData = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
		if equipUnitData:getBase_id() == equipBaseId then
			return true
		end
	end
	return false
end

--根据宝物静态Id获取它是否在第一阵位
--用于判断宝物羁绊是否激活
function BattleResourceData:isInFirstPosWithTreasureBaseId(treasureBaseId)
	if self._resourcePosTable[1] == nil then
		return false
	end
	if self._resourcePosTable[1][2] == nil then
		return false
	end

	for k, treasureId in pairs(self._resourcePosTable[1][2]) do
		local treasureUnitData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
		if treasureUnitData:getBase_id() == treasureBaseId then
			return true
		end
	end
	return false
end

--根据神兵静态Id获取它是否在第一阵位
--用于判断神兵羁绊是否激活
function BattleResourceData:isInFirstPosWithInstrumentBaseId(instrumentBaseId)
	if self._resourcePosTable[1] == nil then
		return false
	end
	if self._resourcePosTable[1][3] == nil then
		return false
	end

	for k, instrumentId in pairs(self._resourcePosTable[1][3]) do
		local instrumentUnitData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
		if instrumentUnitData:getBase_id() == instrumentBaseId then
			return true
		end
	end
	return false
end

--根据战法静态Id获取它是否在第一阵位
--用于判断战法羁绊是否激活，暂时无用
function BattleResourceData:isInFirstPosWithTacticsBaseId(tacticsBaseId)
	if self._resourcePosTable[1] == nil then
		return false
	end
	if self._resourcePosTable[1][5] == nil then
		return false
	end

	for k, tacticsId in pairs(self._resourcePosTable[1][5]) do
		local tacticsUnitData = G_UserData:getTactics():getUnitDataWithId(tacticsId)
		if tacticsUnitData:getBase_id() == tacticsBaseId then
			return true
		end
	end
	return false
end

--按照阵位顺序找到第一件装备的Id
function BattleResourceData:getFirstEquipId()
	for k, one in pairs(self._resourcePosTable) do
		local temp = one[1]
		if temp then
			for j, id in pairs(temp) do
				return id
			end
		end
	end
	return nil
end

--设置宝物的定位表
function BattleResourceData:setTreasurePosTable(pos, slot, id, oldId, oldPos, oldSlot)
	local data = {id = id, pos = pos, flag = 2, slot = slot}
	self:_setResourceData(data)

	if oldId > 0 then
		self._treasureList["k_"..tostring(oldId)] = nil
	end

	if oldPos > 0 and oldSlot > 0 then
		self._resourcePosTable[oldPos][2][oldSlot] = nil
	end
end

--清除装备的定位表
function BattleResourceData:clearTreasurePosTable(pos, slot, oldId)
	self._treasureList["k_"..tostring(oldId)] = nil
	self._resourcePosTable[pos][2][slot] = nil
end

--根据阵位获取此阵位上的宝物Id集合
function BattleResourceData:getTreasureIdsWithPos(pos)
	if self._resourcePosTable[pos] == nil then
		return {}
	end
	if self._resourcePosTable[pos][2] == nil then
		return {}
	end

	local result = {}
	for k, id in pairs(self._resourcePosTable[pos][2]) do
		table.insert(result, id)
	end
	return result
end

--根据阵位获取此阵位上的宝物数据合集
function BattleResourceData:getTreasureInfoWithPos(pos)
	if self._resourcePosTable[pos] == nil then
		return {}
	end
	if self._resourcePosTable[pos][2] == nil then
		return {}
	end

	local result = {}
	for k, id in pairs(self._resourcePosTable[pos][2]) do
		result[k] = id
	end
	return result
end

--设置战法的定位表
function BattleResourceData:setTacticsPosTable(pos, slot, id, oldId, oldPos, oldSlot)
	local data = {id = id, pos = pos, flag = 5, slot = slot}
	self:_setResourceData(data)

	if oldId > 0 then
		self._tacticsList["k_"..tostring(oldId)] = nil
	end

	if oldPos > 0 and oldSlot > 0 then
		self._resourcePosTable[oldPos][5][oldSlot] = nil
	end
end

--清除战法的定位表
function BattleResourceData:clearTacticsPosTable(pos, slot, oldId)
	self._tacticsList["k_"..tostring(oldId)] = nil
	self._resourcePosTable[pos][5][slot] = nil
end

--根据阵位获取此阵位上的战法Id集合
function BattleResourceData:getTacticsIdsWithPos(pos)
	if self._resourcePosTable[pos] == nil then
		return {}
	end
	if self._resourcePosTable[pos][5] == nil then
		return {}
	end

	local result = {}
	for k, id in pairs(self._resourcePosTable[pos][5]) do
		table.insert(result, id)
	end
	return result
end

--根据阵位获取此阵位上的战法数据合集
function BattleResourceData:getTacticsInfoWithPos(pos)
	if self._resourcePosTable[pos] == nil then
		return {}
	end
	if self._resourcePosTable[pos][5] == nil then
		return {}
	end

	local result = {}
	for k, id in pairs(self._resourcePosTable[pos][5]) do
		result[k] = id
	end
	return result
end


function BattleResourceData:isEquipInBattleWithBaseId(baseId)
	for k, data in pairs(self._equipList) do
		local id = data:getId()
		local equip = G_UserData:getEquipment():getEquipmentDataWithId(id)
		local tempBaseId = equip:getBase_id()
		if baseId == tempBaseId then
			return true
		end
	end
	return false
end

function BattleResourceData:isTreasureInBattleWithBaseId(baseId)
	for k, data in pairs(self._treasureList) do
		local id = data:getId()
		local treasure = G_UserData:getTreasure():getTreasureDataWithId(id)
		local tempBaseId = treasure:getBase_id()
		if baseId == tempBaseId then
			return true
		end
	end
	return false
end

function BattleResourceData:isTacticsInBattleWithBaseId(baseId)
	for k, data in pairs(self._tacticsList) do
		local id = data:getId()
		local unitData = G_UserData:getTactics():getUnitDataWithId(id)
		local tempBaseId = unitData:getBase_id()
		if baseId == tempBaseId then
			return true
		end
	end
	return false
end

function BattleResourceData:isInstrumentInBattleWithBaseId(baseId)
	for k, data in pairs(self._instrumentList) do
		local id = data:getId()
		local instrument = G_UserData:getInstrument():getInstrumentDataWithId(id)
		local tempBaseId = instrument:getBase_id()
		if baseId == tempBaseId then
			return true
		end
	end
	return false
end

--设置神兵的定位表
function BattleResourceData:setInstrumentPosTable(pos, id, oldId, oldPos, oldSlot)
	local data = {id = id, pos = pos, flag = 3, slot = 1}
	self:_setResourceData(data)

	if oldId > 0 then
		self._instrumentList["k_"..tostring(oldId)] = nil
	end
end

--清除装备的定位表
function BattleResourceData:clearInstrumentPosTable(pos, oldId)
	self._instrumentList["k_"..tostring(oldId)] = nil
	self._resourcePosTable[pos][3][1] = nil
end

--根据阵位获取此阵位上的神兵Id集合
function BattleResourceData:getInstrumentIdsWithPos(pos)
	if self._resourcePosTable[pos] == nil then
		return {}
	end
	if self._resourcePosTable[pos][3] == nil then
		return {}
	end

	local result = {}
	for k, id in pairs(self._resourcePosTable[pos][3]) do
		table.insert(result, id)
	end
	return result
end

--根据阵位获取此阵位上的装备数据合集
function BattleResourceData:getInstrumentInfoWithPos(pos)
	if self._resourcePosTable[pos] == nil then
		return {}
	end
	if self._resourcePosTable[pos][3] == nil then
		return {}
	end

	local result = {}
	for k, id in pairs(self._resourcePosTable[pos][3]) do
		result[k] = id
	end
	return result
end

--根据神兵静态Id获取它是否在第一阵位
--用于判断神兵羁绊是否激活
function BattleResourceData:isInFirstPosWithInstrumentBaseId(instrumentBaseId)
	if self._resourcePosTable[1] == nil then
		return false
	end
	if self._resourcePosTable[1][3] == nil then
		return false
	end

	for k, instrumentId in pairs(self._resourcePosTable[1][3]) do
		local instrumentUnitData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
		if instrumentUnitData:getBase_id() == instrumentBaseId then
			return true
		end
	end
	return false
end

--设置战马的定位表
function BattleResourceData:setHorsePosTable(pos, id, oldId, oldPos, oldSlot)
	local data = {id = id, pos = pos, flag = HorseConst.FLAG, slot = 1}
	self:_setResourceData(data)

	if oldId > 0 then
		self._horseList["k_"..tostring(oldId)] = nil
	end
end

--清除战马的定位表
function BattleResourceData:clearHorsePosTable(pos, oldId)
	self._horseList["k_"..tostring(oldId)] = nil
	self._resourcePosTable[pos][HorseConst.FLAG][1] = nil
end

--根据阵位获取此阵位上的战马Id集合
function BattleResourceData:getHorseIdsWithPos(pos)
	if self._resourcePosTable[pos] == nil then
		return {}
	end
	if self._resourcePosTable[pos][HorseConst.FLAG] == nil then
		return {}
	end

	local result = {}
	for k, id in pairs(self._resourcePosTable[pos][HorseConst.FLAG]) do
		table.insert(result, id)
	end
	return result
end

--是否有空装备位
function BattleResourceData:isHaveEmptyEquipPos(pos, slot)
	local id = self:getResourceId(pos, 1, slot)
	return id == nil
end

--是否有空宝物位
function BattleResourceData:isHaveEmptyTreasurePos(pos, slot)
	local id = self:getResourceId(pos, 2, slot)
	return id == nil
end

--是否有空战法位
function BattleResourceData:isHaveEmptyTacticsPos(pos, slot)
	local id = self:getResourceId(pos, 5, slot)
	return id == nil
end

--是否有空神兵位
function BattleResourceData:isHaveEmptyInstrumentPos(pos, slot)
	local id = self:getResourceId(pos, 3, slot)
	return id == nil
end

--是否有空战马位
function BattleResourceData:isHaveEmptyHorsePos(pos, slot)
	local id = self:getResourceId(pos, 4, slot)
	return id == nil
end

--是否所有位置都有装备
function BattleResourceData:isFullEquip(pos)
	for i = 1, 4 do
		local isEmpty = self:isHaveEmptyEquipPos(pos, i)
		if isEmpty then
			return false
		end
	end
	return true
end

--是否所有位置都有宝物
function BattleResourceData:isFullTreasure(pos)
	for i = 1, 2 do
		local isEmpty = self:isHaveEmptyTreasurePos(pos, i)
		if isEmpty then
			return false
		end
	end
	return true
end

--是否所有位置都有战法
function BattleResourceData:isFullTactics(pos)
	for i = 1, 2 do
		local isEmpty = self:isHaveEmptyTacticsPos(pos, i)
		if isEmpty then
			return false
		end
	end
	return true
end

--是否所有位置都有神兵
function BattleResourceData:isFullInstrument(pos)
	local isEmpty = self:isHaveEmptyInstrumentPos(pos, 1)
	if isEmpty then
		return false
	end
	return true
end

--是否所有位置都有战马
function BattleResourceData:isFullHorse(pos)
	local isEmpty = self:isHaveEmptyHorsePos(pos, 1)
	if isEmpty then
		return false
	end
	return true
end

return BattleResourceData