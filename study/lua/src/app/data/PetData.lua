-- Author: hedili
-- Date:2018-01-25 10:16:30
-- Describle：

local BaseData = require("app.data.BaseData")
local PetData = class("PetData", BaseData)
local PetUnitData = require("app.data.PetUnitData")
local schema = {}
--schema

schema["listDataDirty"] = {"boolean", false} --神兽排序数据是否为脏
schema["rangeDataDirty"] = {"boolean", false} --神兽切换排序结果是否为脏
schema["fragmentDataDirty"] = {"boolean", false} --神兽碎片排序数据是否为脏
schema["recoveryDataDirty"] = {"boolean", false} --神兽回收数据是否为脏
schema["recoveryAutoDataDirty"] = {"boolean", false} --神兽回收自动添加数据是否为脏
schema["rebornDataDirty"] = {"boolean", false} --神兽重生数据是否为脏
PetData.schema = schema

function PetData:ctor(properties)
	PetData.super.ctor(self, properties)

	self._signalRecvGetPet = G_NetworkManager:add(MessageIDConst.ID_S2C_GetPet, handler(self, self._s2cGetPet))

	self._signalRecvPetRecycle = G_NetworkManager:add(MessageIDConst.ID_S2C_PetRecycle, handler(self, self._s2cPetRecycle))

	self._signalRecvPetOnTeam = G_NetworkManager:add(MessageIDConst.ID_S2C_PetOnTeam, handler(self, self._s2cPetOnTeam))

	self._signalRecvPetReborn = G_NetworkManager:add(MessageIDConst.ID_S2C_PetReborn, handler(self, self._s2cPetReborn))

	self._signalRecvPetStarUp = G_NetworkManager:add(MessageIDConst.ID_S2C_PetStarUp, handler(self, self._s2cPetStarUp))

	self._signalRecvPetLevelUp = G_NetworkManager:add(MessageIDConst.ID_S2C_PetLevelUp, handler(self, self._s2cPetLevelUp))

	self._signalRecvActivePetPhoto =
		G_NetworkManager:add(MessageIDConst.ID_S2C_ActivePetPhoto, handler(self, self._s2cActivePetPhoto))

	self._signalRecvGetActivePetPhoto =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetActivePetPhoto, handler(self, self._s2cGetActivePetPhoto))

	self._signalRecvPetRankUp = G_NetworkManager:add(MessageIDConst.ID_S2C_PetRankUp, handler(self, self._s2cPetRankUp))

	self._signalRecvPostRankUpMaterial =
		G_NetworkManager:add(MessageIDConst.ID_S2C_PetPostRankUpMaterial, handler(self, self._s2cPetPostRankUpMaterial))
	self._petList = {}
	self._petHandBookList = {}
end

function PetData:clear()
	self._signalRecvGetPet:remove()
	self._signalRecvGetPet = nil

	self._signalRecvPetRecycle:remove()
	self._signalRecvPetRecycle = nil

	self._signalRecvPetOnTeam:remove()
	self._signalRecvPetOnTeam = nil

	self._signalRecvPetReborn:remove()
	self._signalRecvPetReborn = nil

	self._signalRecvPetStarUp:remove()
	self._signalRecvPetStarUp = nil

	self._signalRecvPetLevelUp:remove()
	self._signalRecvPetLevelUp = nil

	self._signalRecvActivePetPhoto:remove()
	self._signalRecvActivePetPhoto = nil

	self._signalRecvPetRankUp:remove()
	self._signalRecvPetRankUp = nil
	self._signalRecvPostRankUpMaterial:remove()
	self._signalRecvPostRankUpMaterial = nil
end

function PetData:reset()
end

--创建临时神兽数据
function PetData:createTempPetUnitData(data)
	assert(data and type(data) == "table", "PetData:createTempPetUnitData data must be table")

	local config = require("app.config.pet").get(data.baseId or 1)

	local baseData = {}
	baseData.id = data.id or 1
	baseData.base_id = data.baseId or 1
	baseData.level = data.level or 1
	baseData.exp = data.exp or 1
	baseData.star = data.star or config.initial_star
	baseData.materials = data.materials or {}
	baseData.recycle_materials = data.recycle_materials or {}

	local unitData = PetUnitData.new()
	unitData:updateData(baseData)
	unitData:setUserPet(false)
	return unitData
end

function PetData:_setPetData(data)
	self._petList["k_" .. tostring(data.id)] = nil
	local unitData = PetUnitData.new()
	unitData:updateData(data)
	self._petList["k_" .. tostring(data.id)] = unitData
end

function PetData:updateData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._petList == nil then
		return
	end
	for i = 1, #data do
		self:_setPetData(data[i])
	end
end

function PetData:insertData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._petList == nil then
		return
	end
	for i = 1, #data do
		self:_setPetData(data[i])
	end

	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TEAM)
end

function PetData:deleteData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._petList == nil then
		return
	end
	for i = 1, #data do
		local id = data[i]
		self._petList["k_" .. tostring(id)] = nil
	end
	self:setSortDataDirty(true)
end

function PetData:setSortDataDirty(dirty)
	self:setListDataDirty(dirty)
	self:setRangeDataDirty(dirty)
	self:setFragmentDataDirty(dirty)
	self:setRecoveryDataDirty(dirty)
	self:setRecoveryAutoDataDirty(dirty)
	self:setRebornDataDirty(dirty)
end

function PetData:isPetBless(id)
	-- body
	local unitData = self:getUnitDataWithId(id)
	return unitData:isPetBless()
end

function PetData:isPetInBattle(id)
	-- body
	local unitData = self:getUnitDataWithId(id)
	return unitData:isInBattle()
end

--图鉴是否显示
function PetData:isPetMapShow(petMapId)
	-- body

	local function isPetMapShowTest(...)
		local config = require("app.config.pet_map").get(petMapId)
		assert(config, "pet_map config can't find petMapId = " .. tostring(petMapId))
		local petIdList = {}
		for i = 1, 3 do
			local petId = config["pet" .. i]
			if petId > 0 then
				table.insert(petIdList, petId)
			end
		end
		for i, value in ipairs(petIdList) do
			if G_UserData:getPet():isPetHave(value) == true then
				return true
			end
		end
		return false
	end

	if isPetMapShowTest(petMapId) == true then
		return true
	end

	local config = require("app.config.pet_map").get(petMapId)
	assert(config, "pet_map config can't find petMapId = " .. tostring(petMapId))

	local UserCheck = require("app.utils.logic.UserCheck")
	if UserCheck.enoughOpenDay(config.show_day) == true then
		return true
	end

	return false
end

function PetData:isPetHave(petBaseId)
	-- body
	local isHave1 = G_UserData:getHandBook():isPetHave(petBaseId)
	local isHave2 = self:getPetCountWithBaseId(petBaseId) > 0
	return isHave1 or isHave2
end
function PetData:getUnitDataWithId(id)
	if id == 0 then
		return nil
	end
	local unitData = self._petList["k_" .. tostring(id)]
	assert(unitData, string.format("PetData:getUnitDataWithId is Wrong, id = %d", id))

	return unitData
end

--获取排序后的神兽列表数据
function PetData:getListDataBySort()
	--品质排序，上阵位排序
	local sortFun1 = function(a, b)
		if a:isInBattle() ~= b:isInBattle() then
			return a:isInBattle()
		end
		if a:isPetBless() ~= b:isPetBless() then
			return a:isPetBless()
		end
		if a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getStar() ~= b:getStar() then
			return a:getStar() > b:getStar()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getConfig().id ~= b:getConfig().id then
			return a:getConfig().id < b:getConfig().id
		end
	end

	if self._cacheListData == nil or self:isListDataDirty() then
		local result = {}
		local petList = {} --

		for k, unit in pairs(self._petList) do
			table.insert(petList, unit)
		end

		table.sort(petList, sortFun1)

		for i, unit in ipairs(petList) do
			table.insert(result, unit:getId())
		end

		self._cacheListData = result
		self:setListDataDirty(false)
	end
	return self._cacheListData
end

function PetData:getRangeDataBySort(...)
	-- body
	local petList = {}
	for key, value in pairs(self._petList) do
		table.insert(petList, value:getId())
	end
	return petList
end

function PetData:getAllPets()
	return self._petList
end

function PetData:getCurPetId(...)
	-- body
	return self._curPetId
end

function PetData:setCurPetId(petId)
	-- body
	self._curPetId = petId
end

--获取神兽总数
function PetData:getPetTotalCount()
	local count = 0
	for k, v in pairs(self._petList) do
		count = count + 1
	end
	return count
end

--获取排序后的更换神兽数据
function PetData:getReplaceDataBySort(filterId)
	local sortFun = function(a, b)
		if a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			if a:getLevel() ~= b:getLevel() then
				return a:getLevel() > b:getLevel()
			elseif a:getStar() ~= b:getStar() then
				return a:getStar() > b:getStar()
			else
				return a:getBase_id() < b:getBase_id()
			end
		end
	end

	local result = {}

	for k, unit in pairs(self._petList) do
		local isInBattle = unit:isInBattle()
		local isPetBless = unit:isPetBless()
		--		dump(unit:getBase_id())
		--		dump(filterId)
		local same = G_UserData:getTeam():isHaveSamePet(unit:getBase_id(), filterId)

		logWarn("TeamData:isHaveSamePet " .. tostring(same))
		if not isInBattle and not isPetBless and not same then
			table.insert(result, unit)
		end
	end

	table.sort(result, sortFun)

	return result
end

--===================协议部分===================================================================

-- Describle：
function PetData:_s2cGetPet(id, message)
	--check data
	local pets = rawget(message, "pets")
	if not pets then
		return
	end

	for i, data in ipairs(pets) do
		self:_setPetData(data)
	end
	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_GET_PET_SUCCESS)
end
-- Describle：
-- Param:
--	pet_ids
function PetData:c2sPetRecycle(pet_ids)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_PetRecycle,
		{
			pet_ids = pet_ids
		}
	)
end

function PetData:c2sActivePetPhoto(id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_ActivePetPhoto,
		{
			id = id
		}
	)
end

-- Describle：
function PetData:_s2cPetRecycle(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local awards = rawget(message, "awards")
	if not awards then
	end
	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_PET_RECOVERY_SUCCESS, awards)
end

-- Describle：
-- Param:
--	pet_id   上阵神兽id 下阵填0
-- 	on_team_type 1:上阵位 2:上护佑位
--  pos 	 上护佑位位置,从0开始
function PetData:c2sPetOnTeam(pet_id, on_team_type, pos)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_PetOnTeam,
		{
			pet_id = pet_id,
			on_team_type = on_team_type or 1,
			pos = pos
		}
	)
end

-- Describle：
-- on_team_type
-- pet_id
function PetData:_s2cPetOnTeam(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local pet_id = rawget(message, "pet_id")
	if not pet_id then
		return
	end

	self:setSortDataDirty(true)

	G_SignalManager:dispatch(SignalConst.EVENT_PET_ON_TEAM_SUCCESS, pet_id)
end
-- Describle：
-- Param:
--	pet_id
function PetData:c2sPetReborn(pet_id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_PetReborn,
		{
			pet_id = pet_id
		}
	)
end
-- Describle：
function PetData:_s2cPetReborn(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local awards = rawget(message, "awards")
	if not awards then
	end
	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_PET_REBORN_SUCCESS, awards)
end

-- Describle：
-- Param:
--	pet_id
--	cost_pet_id  消耗同名卡
function PetData:c2sPetStarUp(pet_id, cost_pet_id, cost_base_pet_id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_PetStarUp,
		{
			pet_id = pet_id,
			cost_pet_id = cost_pet_id,
			cost_base_pet_id = cost_base_pet_id
		}
	)
end

-- Describle：
function PetData:_s2cPetStarUp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	logWarn(" PetData:_s2cPetStarUp")
	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_PET_STAR_UP_SUCCESS)
end

-- Describle：
-- Param:
--	pet_id
--	materials  升级材料
function PetData:c2sPetLevelUp(pet_id, materials)
	dump(pet_id)
	dump(materials)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_PetLevelUp,
		{
			pet_id = pet_id,
			materials = materials
		}
	)
end

-- Describle：
function PetData:_s2cPetLevelUp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data

	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_PET_LEVEL_UP_SUCCESS, message)
end

function PetData:_s2cActivePetPhoto(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data

	G_SignalManager:dispatch(SignalConst.EVENT_ACTIVE_PET_PHOTO_SUCCESS, message)
end

function PetData:_s2cGetActivePetPhoto(id, message)
	--check data
	self._petHandBookList = {}
	local petHandBookList = rawget(message, "pet_photo") or {}
	self._petHandBookList = petHandBookList

	G_SignalManager:dispatch(SignalConst.EVENT_GET_ACTIVE_PET_PHOTO_SUCCESS, message)
end

-- #begin 神兽界限突破
-- message C2S_PetRankUp{
-- 	required uint64 pet_id = 1;
-- }
function PetData:c2sPetRankUp(petId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_PetRankUp, {pet_id = petId})
end

-- message S2C_PetRankUp {
-- 	required uint32 ret = 1;
-- }
function PetData:_s2cPetRankUp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local new_pet_id = rawget(message, "new_pet_id")
	self:setCurPetId(new_pet_id)
	G_SignalManager:dispatch(SignalConst.EVENT_PET_LIMITUP_MATERIAL_SUCCESS, 0)
	G_SignalManager:dispatch(SignalConst.EVENT_PET_LIMITUP_SUCCESS)
end

--[[ message C2S_PetPostRankUpMaterial{
	required uint64 pet_id = 1;
	optional Item materials = 2; //升级材料
	optional uint32 idx = 3;    // 升级材料的位置
}]]
function PetData:c2sPetPostRankUpMaterial(petId, item, index)
	G_NetworkManager:send(MessageIDConst.ID_C2S_PetPostRankUpMaterial, 
		{pet_id = petId, materials = item, idx = index})
end

-- message S2C_PetPostRankUpMaterial{
-- 	required uint32 ret = 1;
-- }
function PetData:_s2cPetPostRankUpMaterial(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local idx = rawget(message, "idx") or 0
	G_SignalManager:dispatch(SignalConst.EVENT_PET_LIMITUP_MATERIAL_SUCCESS, idx)
end
-- #end 神兽界限突破

--根据baseId获取拥有相同名字神兽的数量
function PetData:getPetCountWithBaseId(baseId)
	local count = 0
	for k, data in pairs(self._petList) do
		if data:getBase_id() == baseId then
			count = count + 1
		end
	end
	return count
end

--根据baseId获取同名卡的表
--同名卡：无升级、无突破的卡
function PetData:getSameCardCountWithBaseId(baseId, filterId)
	local result = {}
	for k, data in pairs(self._petList) do
		local isFilter = false
		if filterId and data:getId() == filterId then
			isFilter = true
		end
		if
			data:getBase_id() == baseId and not data:isInBattle() and not data:isPetBless() and not data:isDidUpgrade() and
				not data:isDidBreak() and not isFilter
		 then
			table.insert(result, data)
		end
	end
	return result
end

--判断是否有未护佑神兽
function PetData:isHavePetNotInBattle()
	for k, unit in pairs(self._petList) do
		local isInBattle = unit:isInBattle()
		local inInBless = unit:isPetBless()
		local same = G_UserData:getTeam():isHaveSamePet(unit:getBase_id())
		--未在阵容位，未在护佑位，和阵位上已有的神兽不同名
		if not isInBattle and not inInBless and not same then
			return true
		end
	end
	return false
end

--获取神兽回收列表
function PetData:getRecoveryList()
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color

		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getStar() ~= b:getStar() then
			return a:getStar() < b:getStar()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	if self._cacheRecoveryList == nil or self:isRecoveryDataDirty() then
		local result = {}
		for k, unit in pairs(self._petList) do
			local heroConfig = unit:getConfig()
			local color = heroConfig.color
			local initial_star = unit:getInitial_star()
			if color > 1 and initial_star == 0 then
				local isInBattle = unit:isInBattle()
				local isInHelp = unit:isPetBless()
				if not isInBattle and not isInHelp then
					table.insert(result, unit)
				end
			end
		end

		table.sort(result, sortFun)
		self._cacheRecoveryList = result
		self:setRecoveryDataDirty(false)
	end

	return self._cacheRecoveryList
end

--获取神兽回收自动添加列表
function PetData:getRecoveryAutoList()
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0
		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getStar() ~= b:getStar() then
			return a:getStar() < b:getStar()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	if self._cacheRecoveryAutoList == nil or self:isRecoveryAutoDataDirty() then
		local result = {}
		for k, unit in pairs(self._petList) do
			local petConfig = unit:getConfig()
			local color = petConfig.color

			local isInBattle = unit:isInBattle()
			local isInHelp = unit:isPetBless()
			if color > 1 and color < 5 then
				if not isInBattle and not isInHelp then
					table.insert(result, unit)
				end
			end
		end

		table.sort(result, sortFun)
		self._cacheRecoveryAutoList = result
		self:setRecoveryAutoDataDirty(false)
	end

	return self._cacheRecoveryAutoList
end

--获取神兽重生列表
function PetData:getRebornList()
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getStar() ~= b:getStar() then
			return a:getStar() < b:getStar()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	if self._cacheRebornList == nil or self:isRebornDataDirty() then
		local result = {}
		for k, unit in pairs(self._petList) do
			local petConfig = unit:getConfig()
			local color = petConfig.color
			if color > 1 then
				local isDidTrain = unit:isDidTrain()
				if isDidTrain then
					local isInBattle = unit:isInBattle()
					local isInHelp = unit:isPetBless()
					if not isInBattle and not isInHelp then
						table.insert(result, unit)
					end
				end
			end
		end

		table.sort(result, sortFun)
		self._cacheRebornList = result
		self:setRebornDataDirty(false)
	end

	return self._cacheRebornList
end

function PetData:isPetMapRedPoint(...)
	-- body
	local pet_map = require("app.config.pet_map")
	local result = {}

	local attrList = {}
	for loop = 1, pet_map.length() do
		local petMapData = pet_map.indexOf(loop)

		if self:getPetMapState(petMapData.id) == 1 then
			return true
		end
	end
	return false
end
-- 1可激活，0未激活，2已激活, -1敬请期待
--神兽图鉴
function PetData:getPetMapState(petMapId)
	-- body
	if self:isPetMapShow(petMapId) == false then
		return -1
	end

	for i, actId in ipairs(self._petHandBookList) do
		if petMapId == actId then
			return 2 --2已激活
		end
	end

	if self:isPetMapActive(petMapId) == false then
		return 1
	--1可激活
	end

	return 0
	--未激活
end

function PetData:getAllPetMapId(...)
	-- body
	local petIdList = {}
	local pet_map = require("app.config.pet_map")

	for loop = 1, pet_map.length() do
		local petMapData = pet_map.indexOf(loop)
		if self:getPetMapState(petMapData.id) ~= -1 then
			for i = 1, 3 do
				local petId = petMapData["pet" .. i]
				if petId > 0 then
					table.insert(petIdList, petId)
				end
			end
		end
	end

	return petIdList
end

--获取开启神兽数量
function PetData:getShowPetNum(...)
	-- body
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local FunctionConst = require("app.const.FunctionConst")
	local countShowNum = 0
	local countOpenNum = 0
	local PetConst = require("app.const.PetConst")

	if PetConst.SHOW_PET_NUM and PetConst.SHOW_PET_NUM > 0 then
		return PetConst.SHOW_PET_NUM
	end

	for index = FunctionConst.FUNC_PET_HELP_SLOT1, FunctionConst.FUNC_PET_HELP_SLOT7 do
		local isOpen = LogicCheckHelper.funcIsOpened(index)
		local isShow = LogicCheckHelper.funcIsShow(index)
		if isShow == true then
			countShowNum = countShowNum + 1
		end
		if isOpen == true then
			countOpenNum = countOpenNum + 1
		end
	end
	return countShowNum, countOpenNum
end

function PetData:isPetMapActive(petMapId)
	-- body
	local config = require("app.config.pet_map").get(petMapId)
	assert(config, "pet_map config can't find petMapId = " .. tostring(petMapId))
	local petIdList = {}
	for i = 1, 3 do
		local petId = config["pet" .. i]
		if petId > 0 then
			table.insert(petIdList, petId)
		end
	end

	for i, value in ipairs(petIdList) do
		if G_UserData:getPet():isPetHave(value) == false then
			return true
		end
	end

	return false
end
return PetData
