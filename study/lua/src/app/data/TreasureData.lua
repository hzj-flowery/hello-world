--
-- Author: Liangxu
-- Date: 2017-05-05 15:33:03
-- 宝物数据
local BaseData = require("app.data.BaseData")
local TreasureData = class("TreasureData", BaseData)
local TreasureUnitData = require("app.data.TreasureUnitData")
local UserDataHelper = require("app.utils.UserDataHelper")

local schema = {}
schema["curTreasureId"] = {"number", 0} --当前选中的宝物Id
TreasureData.schema = schema

function TreasureData:ctor(properties)
	TreasureData.super.ctor(self, properties)

	self._treasureList = {}

	self._recvGetTreasure = G_NetworkManager:add(MessageIDConst.ID_S2C_GetTreasure, handler(self, self._s2cGetTreasure))
	self._recvEquipTreasure = G_NetworkManager:add(MessageIDConst.ID_S2C_EquipTreasure, handler(self, self._s2cEquipTreasure))
	self._recvRemoveTreasure = G_NetworkManager:add(MessageIDConst.ID_S2C_RemoveTreasure, handler(self, self._s2cRemoveTreasure))
	self._recvUpgradeTreasure = G_NetworkManager:add(MessageIDConst.ID_S2C_UpgradeTreasure, handler(self, self._s2cUpgradeTreasure))
	self._recvRefineTreasure = G_NetworkManager:add(MessageIDConst.ID_S2C_RefineTreasure, handler(self, self._s2cRefineTreasure))
	self._recvRecoveryTreasure = G_NetworkManager:add(MessageIDConst.ID_S2C_TreasureRecycle, handler(self, self._s2cRecoveryTreasure))
	self._recvRebornTreasure = G_NetworkManager:add(MessageIDConst.ID_S2C_RebornTreasure, handler(self, self._s2cRebornTreasure))
	self._recvTreasureTransform = G_NetworkManager:add(MessageIDConst.ID_S2C_TreasureTransform, handler(self, self._s2cTreasureTransform))
	self._recvTreasureLimitCost = G_NetworkManager:add(MessageIDConst.ID_S2C_TreasureLimitCost, handler(self, self._s2cTreasureLimitCost))

	self:_initLimitRelationMap()
end

function TreasureData:clear()
	self._recvGetTreasure:remove()
	self._recvGetTreasure = nil
	self._recvEquipTreasure:remove()
	self._recvEquipTreasure = nil
	self._recvRemoveTreasure:remove()
	self._recvRemoveTreasure = nil
	self._recvUpgradeTreasure:remove()
	self._recvUpgradeTreasure = nil
	self._recvRefineTreasure:remove()
	self._recvRefineTreasure = nil
	self._recvRecoveryTreasure:remove()
	self._recvRecoveryTreasure = nil
	self._recvRebornTreasure:remove()
	self._recvRebornTreasure = nil
	self._recvTreasureTransform:remove()
	self._recvTreasureTransform = nil
	self._recvTreasureLimitCost:remove()
	self._recvTreasureLimitCost = nil
end

function TreasureData:_initLimitRelationMap()
	self._limitRelationMap = {} --界限突破关系表
	self._limitOrgRelationMap = {}
	local Config = require("app.config.treasure")
	for i = 1, Config.length() do
		local info = Config.indexOf(i)
		local id = info.id
		local limitUpId = info.limit_up_id
		if limitUpId > 0 then
			if self._limitRelationMap[id] then
				self._limitRelationMap[limitUpId] = self._limitRelationMap[id]
			else
				self._limitRelationMap[limitUpId] = id
			end
			self._limitOrgRelationMap[limitUpId] = id
		end
	end
end

--获取界限突破的源Id
--例如：橙升红红升金，根据金色id，获取橙色Id
function TreasureData:getLimitSrcId(id)
	local srcId = self._limitRelationMap[id]
	assert(srcId, string.format("treasure config can not find limit_up_id = %d", id))
	return srcId
end

-- 获取界限突破的最初源Id
--例如：橙升红红升金，根据金色id，获取红色Id
function TreasureData:getLimitOrgSrcId(id)
	local srcId = self._limitOrgRelationMap[id]
	assert(srcId, string.format("treasure config can not find limit_up_id = %d", id))
	return srcId
end

--创建临时宝物数据
function TreasureData:createTempTreasureUnitData(baseId)
	-- assert(data and type(data) == "table", "TreasureData:createTempHeroUnitData data must be table")
	local baseData = {}
	baseData.id = 0
	baseData.base_id = baseId or 1
	baseData.user_id = 1
	baseData.level = 1
	baseData.exp = 1
	baseData.refine_level = 0
	if baseId and type(baseId) == "table" then
		local data = baseId
		baseData.base_id = data.baseId or 1
		baseData.level = data.level or 1
		baseData.refine_level = data.refine_level or 0
	end
	local unitData = TreasureUnitData.new()
	unitData:updateData(baseData)

	return unitData
end

-- --创建临时英雄数据
-- function TreasureData:createTempHeroUnitData(data)
-- 	assert(data and type(data) == "table", "HeroData:createTempHeroUnitData data must be table")

-- 	local baseData = {}
-- 	baseData.id = data.id or 1
-- 	baseData.base_id = data.baseId or 1
-- 	baseData.level = data.level or 1
-- 	baseData.exp = data.exp or 1
-- 	baseData.quality = data.quality or 1
-- 	baseData.rank_lv = data.rank_lv or 0
-- 	baseData.instrument_lv = data.instrument_lv or 1
-- 	baseData.instrument_rank = data.instrument_rank or 1
-- 	baseData.instrument_exp = data.instrument_exp or 1
-- 	baseData.awaken_level = data.awaken_level or 0
-- 	baseData.association = data.association or {}

-- 	local unitData = HeroUnitData.new()
-- 	unitData:updateData(baseData)
-- 	unitData:setUserHero(false)

-- 	return unitData
-- end

function TreasureData:reset()
	self._treasureList = {}
end

function TreasureData:_setTreasureData(data)
	self._treasureList["k_"..tostring(data.id)] = nil
	local unitData = TreasureUnitData.new()
	unitData:updateData(data)
	self._treasureList["k_"..tostring(data.id)] = unitData
end

function TreasureData:_s2cGetTreasure(id, message)
	self._treasureList = {}
	local treasureList = rawget(message, "treasures") or {}
	for i, data in ipairs(treasureList) do
		self:_setTreasureData(data)
	end
end

function TreasureData:getTreasureDataWithId(id)
	return self._treasureList["k_"..tostring(id)]
end

function TreasureData:updateData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._treasureList == nil then
		return
	end
	for i = 1, #data do
		self:_setTreasureData(data[i])
	end
end

function TreasureData:insertData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._treasureList == nil then 
        return 
    end
    for i = 1, #data do
    	self:_setTreasureData(data[i])
    end
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE)
    -- G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE_TRAIN_TYPE1)
end

function TreasureData:deleteData(data)
	if data == nil or type(data) ~= "table" then 
		return 
	end
	if self._treasureList == nil then 
        return 
    end
    for i = 1, #data do
    	local id = data[i]
    	self._treasureList["k_"..tostring(id)] = nil
    end
end

function TreasureData:getTreasureTotalCount()
	local count = 0
	for k, v in pairs(self._treasureList) do
		count = count + 1
	end
	return count
end

function TreasureData:getTreasureCountWithBaseId(baseId)
	local count = 0
	for k, data in pairs(self._treasureList) do
		if data:getBase_id() == baseId then
			count = count + 1
		end
	end
	return count
end

function TreasureData:getTreasureIdWithBaseId(baseId)
	for k, data in pairs(self._treasureList) do
		if data:getBase_id() == baseId then
			return data:getId()
		end
	end
	return nil
end

--获取排序后的宝物列表数据
function TreasureData:getListDataBySort()
	local result = {}
	local wear = {} --已穿戴
	local noWear = {} --未穿戴
	local expTreasure = {} --经验宝物

	local function sortFun1(a, b)
		local configA = a:getConfig()
		local configB = b:getConfig()
		if configA.color ~= configB.color then
			return configA.color > configB.color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRefine_level() ~= b:getRefine_level() then
			return a:getRefine_level() > b:getRefine_level()
		else
			return configA.id < configB.id
		end
	end

	local function sortFun2(a, b)
		if a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			return a:getConfig().id < b:getConfig().id
		end
	end

	for k, unit in pairs(self._treasureList) do
		if unit:getConfig().treasure_type ~= 0 then
			local isInBattle = unit:isInBattle()
			if isInBattle then
				table.insert(wear, unit)
			else
				table.insert(noWear, unit)
			end
		else
			table.insert(expTreasure, unit)
		end
	end

	table.sort(wear, sortFun1)
	table.sort(noWear, sortFun1)
	table.sort(expTreasure, sortFun2)

	for i, unit in ipairs(wear) do
		table.insert(result, unit:getId())
	end

	for i, unit in ipairs(noWear) do
		table.insert(result, unit:getId())
	end

	for i, unit in ipairs(expTreasure) do
		table.insert(result, unit:getId())
	end

	return result
end

--获取排序后的宝物列表数据
function TreasureData:getRangeDataBySort()
	local result = {}
	local wear = {} --已穿戴
	local noWear = {} --未穿戴

	local function sortFun1(a, b)
		local configA = a:getConfig()
		local configB = b:getConfig()
		if configA.color ~= configB.color then
			return configA.color > configB.color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRefine_level() ~= b:getRefine_level() then
			return a:getRefine_level() > b:getRefine_level()
		else
			return configA.id < configB.id
		end
	end

	for k, unit in pairs(self._treasureList) do
		if unit:getConfig().treasure_type ~= 0 then
			local isInBattle = unit:isInBattle()
			if isInBattle then
				table.insert(wear, unit)
			else
				table.insert(noWear, unit)
			end
		end
	end

	table.sort(wear, sortFun1)
	table.sort(noWear, sortFun1)

	for i, unit in ipairs(wear) do
		table.insert(result, unit:getId())
	end

	for i, unit in ipairs(noWear) do
		table.insert(result, unit:getId())
	end

	return result
end

--根据宝物位置获取更换宝物列表
function TreasureData:getReplaceTreasureListWithSlot(pos, slot)
	local result = {}
	local wear = {}
	local noWear = {}

	local function sortFun(a, b)
		local configA = a:getConfig()
		local configB = b:getConfig()
		local yokeA = a:isYokeRelation() == true and 1 or 0
		local yokeB = b:isYokeRelation() == true and 1 or 0
		if yokeA ~= yokeB then
			return yokeA > yokeB
		elseif configA.color ~= configB.color then
			return configA.color > configB.color
		elseif configA.potential ~= configB.potential then
			return configA.potential > configB.potential
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRefine_level() ~= b:getRefine_level() then
			return a:getRefine_level() > b:getRefine_level()
		else
			return configA.id < configB.id
		end
	end

	local heroBaseId = UserDataHelper.getHeroBaseIdWithPos(pos)
	for k, data in pairs(self._treasureList) do
		if data:getConfig().treasure_type == slot then
			local isYoke = UserDataHelper.isHaveYokeBetweenHeroAndTreasured(heroBaseId, data:getBase_id())
			data:setYokeRelation(isYoke)
			local battleData = G_UserData:getBattleResource():getTreasureDataWithId(data:getId())
			if battleData then
				if battleData:getPos() ~= pos then
					table.insert(wear, data)
				end
			else
				table.insert(noWear, data)
			end
		end
	end

	table.sort(wear, sortFun)
	table.sort(noWear, sortFun)

	for i, data in ipairs(noWear) do
		table.insert(result, data)
	end
	for i, data in ipairs(wear) do
		table.insert(result, data)
	end

	return result, noWear, wear
end

--获取宝物强化选择界面排序数据
function TreasureData:getStrengthenFoodListBySort(filterId)
	local result = {}

	local sortFun = function(a, b)
		local typeA = a:getConfig().treasure_type
		local typeB = b:getConfig().treasure_type
		local expA = a:getConfig().treasure_exp + a:getExp()
		local expB = b:getConfig().treasure_exp + b:getExp()
		if typeA ~= typeB then
			return typeA < typeB
		elseif expA ~= expB then
			return expA < expB
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, unit in pairs(self._treasureList) do
		local treasureId = unit:getId()
		local isDidRefine = unit:isDidRefine()
		local isInBattle = unit:isInBattle()
		if not isDidRefine and treasureId ~= filterId and not isInBattle then
			table.insert(result, unit)
		end
	end

	table.sort(result, sortFun)

	return result
end

--获取宝物强化自动添加所需的数据
function TreasureData:getStrengthenFoodeAutoListBySort(addedFoodsData, filterId)
	local result = {}

	local isAdded = function(foodData)
		for k, food in pairs(addedFoodsData) do
			if food:getId() == foodData:getId() then
				return true
			end
		end
		return false
	end

	local sortFun = function(a, b)
		local typeA = a:getConfig().treasure_type
		local typeB = b:getConfig().treasure_type
		local expA = a:getConfig().treasure_exp + a:getExp()
		local expB = b:getConfig().treasure_exp + b:getExp()
		if typeA ~= typeB then
			return typeA < typeB
		elseif expA ~= expB then
			return expA < expB
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, unit in pairs(self._treasureList) do
		local treasureId = unit:getId()
		local isDidRefine = unit:isDidRefine()
		local isInBattle = unit:isInBattle()
		if not isDidRefine and treasureId ~= filterId and not isInBattle then
			table.insert(result, unit)
		end
	end

	table.sort(result, sortFun)

	return result
end

--根据baseId获取同名卡的表
function TreasureData:getSameCardsWithBaseId(baseId)
	local result = {}
	for k, data in pairs(self._treasureList) do
		if data:getBase_id() == baseId 
			and not data:isInBattle()
			and not data:isDidStrengthen() 
			and not data:isDidRefine() then
			table.insert(result, data)
		end
	end
	return result
end

--获取宝物回收列表
function TreasureData:getRecoveryList()
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getRefine_level() ~= b:getRefine_level() then
			return a:getRefine_level() < b:getRefine_level()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local result = {}
	for k, unit in pairs(self._treasureList) do
		local treasureConfig = unit:getConfig()
		local treasureType = treasureConfig.treasure_type

		local isInBattle = unit:isInBattle()
		if not isInBattle then
			table.insert(result, unit)
		end
	end

	table.sort(result, sortFun)

	return result
end

--获取宝物可以重置列表
function TreasureData:getTransformList()
	local function sortFun(a, b)
		local configA = a:getConfig()
		local configB = b:getConfig()
		if configA.color ~= configB.color then
			return configA.color > configB.color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRefine_level() ~= b:getRefine_level() then
			return a:getRefine_level() > b:getRefine_level()
		else
			return configA.id < configB.id
		end
	end

	local result = {}
	local wear = {} --已穿戴
	local noWear = {} --未穿戴
	for k, unit in pairs(self._treasureList) do
		local treasureConfig = unit:getConfig()
		local treasureType = treasureConfig.treasure_type
		local color = treasureConfig.color

		-- if treasureType ~= 0 then
		-- 	local pos = unit:getPos()
		-- 	local isInBattle = unit:isInBattle()
		-- 	if not pos and color == 5 then
		-- 		table.insert(result, unit)
		-- 	end
		-- end
		if treasureType ~= 0 then
			local pos = unit:getPos()
			if not pos and (color >= 5 and color <= 7) then --橙色\红色\金色，过滤已穿戴
				local isInBattle = unit:isInBattle()
				if isInBattle then
					table.insert(wear, unit)
				else
					table.insert(noWear, unit)
				end
			end
		end
	end

	table.sort(wear, sortFun)
	table.sort(noWear, sortFun)

	for i, unit in ipairs(wear) do
		table.insert(result, unit)
	end

	for i, unit in ipairs(noWear) do
		table.insert(result, unit)
	end

	return result
end

-- --获取所有重置宝物列表
-- function TreasureData:getAllTransformList()
-- 	local sortFun = function(a, b)
-- 		local colorA = a:getConfig().color
-- 		local colorB = b:getConfig().color
-- 		local isTrainA = a:isDidTrain() and 1 or 0
-- 		local isTrainB = b:isDidTrain() and 1 or 0

-- 		if colorA ~= colorB then
-- 			return colorA < colorB
-- 		elseif isTrainA ~= isTrainB then
-- 			return isTrainA < isTrainB
-- 		elseif a:getRefine_level() ~= b:getRefine_level() then
-- 			return a:getRefine_level() < b:getRefine_level()
-- 		elseif a:getLevel() ~= b:getLevel() then
-- 			return a:getLevel() < b:getLevel()
-- 		else
-- 			return a:getBase_id() < b:getBase_id()
-- 		end
-- 	end

-- 	local result = {}
-- 	for k, unit in pairs(self._treasureList) do
-- 		local treasureConfig = unit:getConfig()
-- 		local treasureType = treasureConfig.treasure_type
-- 		local color = treasureConfig.color

-- 		if treasureType ~= 0 then
-- 			local pos = unit:getPos()
-- 			local isInBattle = unit:isInBattle()
-- 			-- if not isInBattle and color == 5 then
-- 			if color == 5 then
-- 				table.insert(result, unit)
-- 			end
-- 		end
-- 	end

-- 	table.sort(result, sortFun)

-- 	return result
-- end


--获取宝物回收自动添加列表
function TreasureData:getRecoveryAutoList()
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getRefine_level() ~= b:getRefine_level() then
			return a:getRefine_level() < b:getRefine_level()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local result = {}
	for k, unit in pairs(self._treasureList) do
		local treasureConfig = unit:getConfig()
		local treasureType = treasureConfig.treasure_type
		local color = treasureConfig.color

		if treasureType ~= 0 then
			local isInBattle = unit:isInBattle()
			if not isInBattle and color < 5 then
				table.insert(result, unit)
			end
		end
	end

	table.sort(result, sortFun)

	return result
end

--获取武将重生列表
function TreasureData:getRebornList()
	local result = {}

	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getRefine_level() ~= b:getRefine_level() then
			return a:getRefine_level() < b:getRefine_level()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, unit in pairs(self._treasureList) do
		local treasureConfig = unit:getConfig()
		local treasureType = treasureConfig.treasure_type
		local color = treasureConfig.color

		if treasureType ~= 0 then
			local isDidTrain = unit:isDidTrain()
			if isDidTrain then
				local isInBattle = unit:isInBattle()
				if not isInBattle then
					table.insert(result, unit)
				end
			end
		end
	end

	table.sort(result, sortFun)

	return result
end

--判断是否有没穿戴的宝物，且宝物slot符合要求
function TreasureData:isHaveTreasureNotInPos(slot)
	for k, unit in pairs(self._treasureList) do
		local pos = unit:getPos()
		if pos == nil and unit:getConfig().treasure_type == slot then
			 return true
		end
	end
	return false
end

--判断是否有更好的宝物（红点机制）
function TreasureData:isHaveBetterTreasure(pos, slot)
	local function isBetter(a, b, heroBaseId) --retrun true: a比b好
		local isYokeA = UserDataHelper.isHaveYokeBetweenHeroAndTreasured(heroBaseId, a:getBase_id())
		local isYokeB = UserDataHelper.isHaveYokeBetweenHeroAndTreasured(heroBaseId, b:getBase_id())
		local yokeA = isYokeA and 1 or 0
		local yokeB = isYokeB and 1 or 0
		local colorA = a:getConfig().color
		local potentialA = a:getConfig().potential
		local levelA = a:getLevel()
		local rLevelA = a:getRefine_level()

		local colorB = b:getConfig().color
		local potentialB = b:getConfig().potential
		local levelB = b:getLevel()
		local rLevelB = b:getRefine_level()

		if yokeA ~= yokeB then
			return yokeA > yokeB
		elseif colorA ~= colorB then
			return colorA > colorB
		elseif potentialA ~= potentialB then
			return potentialA > potentialB
		elseif levelA ~= levelB then
			return levelA > levelB
		elseif rLevelA ~= rLevelB then
			return rLevelA > rLevelB
		end
	end

	local treasureId = G_UserData:getBattleResource():getResourceId(pos, 2, slot)
	if not treasureId then
		return false
	end

	local treasureData = G_UserData:getTreasure():getTreasureDataWithId(treasureId)
	if not treasureData then
		return false
	end

	local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
	local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local heroBaseId = unitData:getBase_id()

	for k, unit in pairs(self._treasureList) do
		local pos = unit:getPos()
		if pos == nil and unit:getConfig().treasure_type == slot then
			if isBetter(unit, treasureData, heroBaseId) then
				return true
			end
		end
	end
	return false
end

--====================协议部分=============================================
--穿戴宝物
function TreasureData:c2sEquipTreasure(pos, slot, id)
	
	G_NetworkManager:send(MessageIDConst.ID_C2S_EquipTreasure, {
		id = id,
		pos = pos,
		slot = slot,
	})
end

function TreasureData:_s2cEquipTreasure(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local id = rawget(message, "id")
	assert(id, "_s2cEquipTreasure, message.id = nil")

	local pos = rawget(message, "pos")
	assert(pos, "_s2cEquipTreasure, message.pos = nil")

	local slot = rawget(message, "slot")
	assert(slot, "_s2cEquipTreasure, message.slot = nil")

	local oldId = rawget(message, "old_id") or 0
	local oldPos = rawget(message, "old_pos") or 0
	local oldSlot = rawget(message, "old_slot") or 0

	G_UserData:getBattleResource():setTreasurePosTable(pos, slot, id, oldId, oldPos, oldSlot)

	G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_ADD_SUCCESS, oldId, pos, slot)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE)
end

--脱宝物
function TreasureData:c2sRemoveTreasure(pos, slot)
	G_NetworkManager:send(MessageIDConst.ID_C2S_RemoveTreasure, {
		pos = pos,
		slot = slot,
	})
end

function TreasureData:_s2cRemoveTreasure(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local pos = rawget(message, "pos")
	local slot = rawget(message, "slot")
	local oldId = rawget(message, "old_id")

	G_UserData:getBattleResource():clearTreasurePosTable(pos, slot, oldId)

	G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_REMOVE_SUCCESS, slot)
	-- G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE)
end

--宝物强化
function TreasureData:c2sUpgradeTreasure(id, materials)
	G_NetworkManager:send(MessageIDConst.ID_C2S_UpgradeTreasure, {
		id = id,
		materials = materials,
	})
end

function TreasureData:_s2cUpgradeTreasure(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_UPGRADE_SUCCESS)
end

--宝物精炼
function TreasureData:c2sRefineTreasure(id, materials)
	if #materials == 0 then
		G_NetworkManager:send(MessageIDConst.ID_C2S_RefineTreasure, {
			id = id,
		})
	else
		G_NetworkManager:send(MessageIDConst.ID_C2S_RefineTreasure, {
			id = id,
			materials = materials,
		})
	end
end

function TreasureData:_s2cRefineTreasure(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_REFINE_SUCCESS)
end

--宝物回收
function TreasureData:c2sRecoveryTreasure(treasureId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_TreasureRecycle, {
		treasure_id = treasureId,
	})
end


function TreasureData:_s2cRecoveryTreasure(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_RECOVERY_SUCCESS, awards)
end

--宝物重生
function TreasureData:c2sRebornTreasure(treasureId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_RebornTreasure, {
		treasure_id = treasureId,
	})
end

function TreasureData:_s2cRebornTreasure(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_REBORN_SUCCESS, awards)
end

--宝物置换
function TreasureData:c2sTreasureTransform(srcIds, toId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_TreasureTransform, {
		to_id = toId,
		src_ids = srcIds,
	})
end

function TreasureData:_s2cTreasureTransform(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_TRANSFORM_SUCCESS)
end

function TreasureData:c2sTreasureLimitCost(treasureId, idx, materials)
	G_NetworkManager:send(MessageIDConst.ID_C2S_TreasureLimitCost, {
		treasure_id = treasureId,
		idx = idx,
		materials = materials
	})
end

function TreasureData:_s2cTreasureLimitCost(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local idx = rawget(message, "idx") or 0
	if idx > 0 then
		G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_LIMIT_LV_PUT_RES, idx)
	else
		G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_LIMIT_SUCCESS)
	end
end

return TreasureData