-- 玩家拥有的所有武将数据
-- Author: Liangxu
-- Date: 2017-02-15 15:35:23
--
local BaseData = require("app.data.BaseData")
local HeroData = class("HeroData", BaseData)
local HeroUnitData = require("app.data.HeroUnitData")
local UserDataHelper = require("app.utils.UserDataHelper")

local schema = {}
schema["curHeroId"] = {"number", 0} --当前选中的武将Id
schema["listDataDirty"] = {"boolean", false} --武将排序数据是否为脏
schema["rangeDataDirty"] = {"boolean", false} --武将切换排序结果是否为脏
schema["replaceDataDirty"] = {"boolean", false} --武将替换排序数据是否为脏
schema["replaceReinforcementDataDirty"] = {"boolean", false} --援军替换排序数据是否为脏
schema["recoveryDataDirty"] = {"boolean", false} --武将回收数据是否为脏
schema["recoveryAutoDataDirty"] = {"boolean", false} --武将回收自动添加数据是否为脏
schema["rebornDataDirty"] = {"boolean", false} --武将重生数据是否为脏
schema["fragmentDataDirty"] = {"boolean", false} --武将碎片排序数据是否为脏
schema["limitUpWithHero"] = {"boolean", false} -- 武将界限突破是否使用武将胚子
HeroData.schema = schema

function HeroData:ctor(properties)
	HeroData.super.ctor(self, properties)

	self._heroList = {}
	self._tempList = nil
	self._cacheListData = nil --武将排序结果缓存
	self._cacheRangeData = nil --武将切换排序结果缓存
	self._cacheReplaceData = nil --武将替换排序结果缓存
	-- self._cacheReplaceReinforcementData = nil --援军替换排序结果缓存
	self._cacheRecoveryList = nil --武将回收列表结果缓存
	self._cacheRecoveryAutoList = nil --武将回收自动添加列表缓存
	self._cacheRebornList = nil --武将重生列表结果缓存

	self._heroFateMap = {} --武将对应的和他相关的羁绊表
	self._equipFateMap = {} --装备对应的和他相关的羁绊表
	self._treasureFateMap = {} --宝物对应的和他相关的羁绊表
	self._instrumentFateMap = {} --神兵对应的和他相关的羁绊表

	self._recvGetHero = G_NetworkManager:add(MessageIDConst.ID_S2C_GetHero, handler(self, self._s2cGetHero))
	self._recvHeroLevelUp = G_NetworkManager:add(MessageIDConst.ID_S2C_HeroLevelUp, handler(self, self._s2cHeroLevelUp))
	self._recvHeroRankUp = G_NetworkManager:add(MessageIDConst.ID_S2C_HeroRankUp, handler(self, self._s2cHeroRankUp))
	self._recvHeroRecycle = G_NetworkManager:add(MessageIDConst.ID_S2C_HeroRecycle, handler(self, self._s2cHeroRecycle))
	self._recvHeroReborn = G_NetworkManager:add(MessageIDConst.ID_S2C_HeroReborn, handler(self, self._s2cHeroReborn))
	self._recvHeroEquipAwaken =
		G_NetworkManager:add(MessageIDConst.ID_S2C_HeroEquipAwaken, handler(self, self._s2cHeroEquipAwaken))
	self._recvHeroAwaken = G_NetworkManager:add(MessageIDConst.ID_S2C_HeroAwaken, handler(self, self._s2cHeroAwaken))
	self._recvHeroTransform =
		G_NetworkManager:add(MessageIDConst.ID_S2C_HeroTransform, handler(self, self._s2cHeroTransform))
	self._recvHeroLimitLvPutRes =
		G_NetworkManager:add(MessageIDConst.ID_S2C_HeroLimitLvPutRes, handler(self, self._s2cHeroLimitLvPutRes))
	self._recvHeroLimitLvUp =
		G_NetworkManager:add(MessageIDConst.ID_S2C_HeroLimitLvUp, handler(self, self._s2cHeroLimitLvUp))

	self._recvHeroGoldRankLvUp =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GoldHeroRankUp, handler(self, self._s2cGoldHeroRankUp))
	self._recvHeroGoldResource =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GoldHeroResource, handler(self, self._s2cGoldHeroResource))
	self:_createFateMap()
end

function HeroData:clear()
	self._recvGetHero:remove()
	self._recvGetHero = nil
	self._recvHeroLevelUp:remove()
	self._recvHeroLevelUp = nil
	self._recvHeroRankUp:remove()
	self._recvHeroRankUp = nil
	self._recvHeroRecycle:remove()
	self._recvHeroRecycle = nil
	self._recvHeroReborn:remove()
	self._recvHeroReborn = nil
	self._recvHeroEquipAwaken:remove()
	self._recvHeroEquipAwaken = nil
	self._recvHeroAwaken:remove()
	self._recvHeroAwaken = nil
	self._recvHeroTransform:remove()
	self._recvHeroTransform = nil
	self._recvHeroLimitLvPutRes:remove()
	self._recvHeroLimitLvPutRes = nil
	self._recvHeroLimitLvUp:remove()
	self._recvHeroLimitLvUp = nil
	self._recvHeroGoldRankLvUp:remove()
	self._recvHeroGoldRankLvUp = nil
	self._recvHeroGoldResource:remove()
	self._recvHeroGoldResource = nil
end

function HeroData:reset()
	self._heroList = {}
	self._tempList = nil
	self._cacheListData = nil --武将排序结果缓存
	self._cacheRangeData = nil --武将切换排序结果缓存
	self._cacheReplaceData = nil --武将替换排序结果缓存
	-- self._cacheReplaceReinforcementData = nil --援军替换排序结果缓存
	self._cacheRecoveryList = nil --武将回收列表结果缓存
	self._cacheRecoveryAutoList = nil --武将回收自动添加列表缓存
	self._cacheRebornList = nil --武将重生列表结果缓存
end

--创建对应的羁绊表
function HeroData:_createFateMap()
	local function formatMap(map, info)
		local fateId = info.fate_id
		local heroId = info.hero_id
		if heroId > 0 then
			if map[heroId] == nil then
				map[heroId] = {}
			end
			table.insert(map[heroId], fateId)
		end
		for j = 1, 4 do
			local id = info["hero_id_" .. j]
			if id > 0 then
				if map[id] == nil then
					map[id] = {}
				end
				table.insert(map[id], fateId)
			end
		end
	end

	local Config = require("app.config.hero_fate")
	local len = Config.length()
	for i = 1, len do
		local info = Config.indexOf(i)
		local fateType = info.fate_type
		if fateType == 1 then --武将羁绊
			formatMap(self._heroFateMap, info)
		elseif fateType == 2 then --装备羁绊
			formatMap(self._equipFateMap, info)
		elseif fateType == 3 then --宝物羁绊
			formatMap(self._treasureFateMap, info)
		elseif fateType == 4 then --神兵羁绊
			formatMap(self._instrumentFateMap, info)
		end
	end
end

function HeroData:getHeroFateMap()
	return self._heroFateMap
end

function HeroData:getEquipFateMap()
	return self._equipFateMap
end

function HeroData:getTreasureFateMap()
	return self._treasureFateMap
end

function HeroData:getInstrumentFateMap()
	return self._instrumentFateMap
end

--创建临时英雄数据
function HeroData:createTempHeroUnitData(data)
	assert(data and type(data) == "table", "HeroData:createTempHeroUnitData data must be table")

	local baseData = {}
	baseData.id = data.id or 1
	baseData.base_id = data.baseId or 1
	baseData.level = data.level or 1
	baseData.exp = data.exp or 1
	baseData.quality = data.quality or 1
	baseData.rank_lv = data.rank_lv or 0
	baseData.instrument_lv = data.instrument_lv or 1
	baseData.instrument_rank = data.instrument_rank or 1
	baseData.instrument_exp = data.instrument_exp or 1
	baseData.awaken_level = data.awaken_level or 0
	baseData.limit_level = data.limit_level or 0
	baseData.association = data.association or {}

	local unitData = HeroUnitData.new()
	unitData:updateData(baseData)
	unitData:setUserHero(false)

	return unitData
end
function HeroData:_setHeroData(data)
	self._heroList["k_" .. tostring(data.id)] = nil
	local unitData = HeroUnitData.new()
	unitData:updateData(data)
	self._heroList["k_" .. tostring(data.id)] = unitData
end

function HeroData:_s2cGetHero(id, message)
	local heroList = rawget(message, "heros") or {}
	local isEnd = rawget(message, "end")
	
	if self._tempList == nil then
		self._heroList = {}
		self._tempList = {}
	end
	table.insertto(self._tempList, heroList)
	if isEnd == true then
		for i, data in ipairs(self._tempList) do
			self:_setHeroData(data)
		end
		self._tempList = nil
	end
end

function HeroData:updateData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._heroList == nil then
		return
	end
	for i = 1, #data do
		self:_setHeroData(data[i])
	end
end

function HeroData:insertData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._heroList == nil then
		return
	end
	for i = 1, #data do
		self:_setHeroData(data[i])
		G_UserData:getKarma():insertData(data[i])
	end

	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TEAM)
end

function HeroData:deleteData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._heroList == nil then
		return
	end
	for i = 1, #data do
		local id = data[i]
		self._heroList["k_" .. tostring(id)] = nil
	end
	self:setSortDataDirty(true)
end

function HeroData:getAllHeros()
	return self._heroList
end

--获取武将总数
function HeroData:getHeroTotalCount()
	local count = 0
	for k, v in pairs(self._heroList) do
		count = count + 1
	end
	return count
end

function HeroData:getUnitDataWithId(id)
	local unitData = self._heroList["k_" .. tostring(id)]
	assert(unitData, string.format("HeroData:getUnitDataWithId is Wrong, id = %d", id))

	return unitData
end

--根据baseId获取拥有相同名字武将的数量
function HeroData:getHeroCountWithBaseId(baseId)
	local count = 0
	for k, data in pairs(self._heroList) do
		if data:getBase_id() == baseId then
			count = count + 1
		end
	end
	return count
end

--根据baseId获取同名卡的表
--同名卡：无升级、无突破、无觉醒、无界限过的卡
function HeroData:getSameCardCountWithBaseId(baseId, filterId)
	local result = {}
	for k, data in pairs(self._heroList) do
		local isFilter = false
		if filterId and data:getId() == filterId then
			isFilter = true
		end
		if
			data:getBase_id() == baseId and not data:isInBattle() and not data:isInReinforcements() and not data:isDidUpgrade() and
				not data:isDidBreak() and
				not data:isDidAwake() and
				not data:isDidLimit() and
				not data:isDidGoldRankLv() and
				not isFilter
		 then
			table.insert(result, data)
		end
	end
	return result
end

function HeroData:setSortDataDirty(dirty)
	self:setListDataDirty(dirty)
	self:setRangeDataDirty(dirty)
	self:setReplaceDataDirty(dirty)
	self:setReplaceReinforcementDataDirty(dirty)
	self:setRecoveryDataDirty(dirty)
	self:setRecoveryAutoDataDirty(dirty)
	self:setRebornDataDirty(dirty)
	self:setFragmentDataDirty(dirty)
end

--获取排序后的武将列表数据
function HeroData:getListDataBySort()
	--品质排序，上阵位排序
	local sortFun1 = function(a, b)
		if a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() > b:getRank_lv()
		else
			return a:getPos() < b:getPos()
		end
	end

	local sortFun2 = function(a, b)
		if a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() > b:getRank_lv()
		else
			return a:getSecondPos() < b:getSecondPos()
		end
	end

	local sortFun3 = function(a, b)
		local yokeCountA = a:getWillActivateYokeCount()
		local yokeCountB = b:getWillActivateYokeCount()
		if yokeCountA ~= yokeCountB then
			return yokeCountA > yokeCountB
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() > b:getRank_lv()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	if self._cacheListData == nil or self:isListDataDirty() then
		local result = {}
		local inBattleData = {} --已出战的武将
		local reinforcementsData = {} --已上援军位的武将
		local remainderData = {} --剩余的武将

		for k, unit in pairs(self._heroList) do
			local isInBattle = unit:isInBattle()
			local isInReinforcements = unit:isInReinforcements()
			if isInBattle then
				if unit:getConfig().type == 1 then
					table.insert(result, unit:getId()) --主角固定为第一位
				else
					table.insert(inBattleData, unit)
				end
			elseif isInReinforcements then
				table.insert(reinforcementsData, unit)
			else
				local yokeCount = UserDataHelper.getWillActivateYokeCount(unit:getBase_id())
				unit:setWillActivateYokeCount(yokeCount)
				table.insert(remainderData, unit)
			end
		end

		table.sort(inBattleData, sortFun1)
		table.sort(reinforcementsData, sortFun2)
		table.sort(remainderData, sortFun3)

		for i, unit in ipairs(inBattleData) do
			table.insert(result, unit:getId())
		end

		for i, unit in ipairs(reinforcementsData) do
			table.insert(result, unit:getId())
		end

		for i, unit in ipairs(remainderData) do
			table.insert(result, unit:getId())
		end

		self._cacheListData = result
		self:setListDataDirty(false)
	end
	return self._cacheListData
end

--获取武将切换的数据
function HeroData:getRangeDataBySort()
	--品质排序，上阵位排序
	local sortFun1 = function(a, b)
		if a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() > b:getRank_lv()
		else
			return a:getPos() < b:getPos()
		end
	end

	local sortFun2 = function(a, b)
		if a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() > b:getRank_lv()
		else
			return a:getSecondPos() < b:getSecondPos()
		end
	end

	local sortFun3 = function(a, b)
		local yokeCountA = a:getWillActivateYokeCount()
		local yokeCountB = b:getWillActivateYokeCount()
		if yokeCountA ~= yokeCountB then
			return yokeCountA > yokeCountB
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() > b:getRank_lv()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	if self._cacheRangeData == nil or self:isRangeDataDirty() then
		local result = {}
		local inBattleData = {} --已出战的武将
		local reinforcementsData = {} --已上援军位的武将
		local remainderData = {} --剩余的武将

		for k, unit in pairs(self._heroList) do
			if unit:getConfig().type ~= 3 then --排除狗粮卡
				local isInBattle = unit:isInBattle()
				local isInReinforcements = unit:isInReinforcements()
				if isInBattle then
					if unit:getConfig().type == 1 then
						table.insert(result, unit:getId())
					else
						table.insert(inBattleData, unit)
					end
				elseif isInReinforcements then
					table.insert(reinforcementsData, unit)
				else
					local yokeCount = UserDataHelper.getWillActivateYokeCount(unit:getBase_id())
					unit:setWillActivateYokeCount(yokeCount)
					table.insert(remainderData, unit)
				end
			end
		end

		table.sort(inBattleData, sortFun1)
		table.sort(reinforcementsData, sortFun2)
		table.sort(remainderData, sortFun3)

		for i, unit in ipairs(inBattleData) do
			table.insert(result, unit:getId())
		end

		for i, unit in ipairs(reinforcementsData) do
			table.insert(result, unit:getId())
		end

		for i, unit in ipairs(remainderData) do
			table.insert(result, unit:getId())
		end

		self._cacheRangeData = result
		self:setRangeDataDirty(false)
	end
	return self._cacheRangeData
end

--获取排序后的更换武将数据
function HeroData:getReplaceDataBySort(filterId)
	local sortFun = function(a, b)
		local jointA = a:isActiveJoint(filterId) and 1 or 0
		local jointB = b:isActiveJoint(filterId) and 1 or 0
		if jointA ~= jointB then
			return jointA > jointB
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			local yokeCountA = a:getWillActivateYokeCount()
			local yokeCountB = b:getWillActivateYokeCount()
			if yokeCountA ~= yokeCountB then
				return yokeCountA > yokeCountB
			elseif a:getLevel() ~= b:getLevel() then
				return a:getLevel() > b:getLevel()
			elseif a:getRank_lv() ~= b:getRank_lv() then
				return a:getRank_lv() > b:getRank_lv()
			else
				return a:getBase_id() < b:getBase_id()
			end
		end
	end

	-- if self._cacheReplaceData == nil or self:isReplaceDataDirty() or filterId then
	local result = {}

	for k, unit in pairs(self._heroList) do
		local isInBattle = unit:isInBattle()
		local isInReinforcements = unit:isInReinforcements()
		local same = G_UserData:getTeam():isHaveSameName(unit:getBase_id(), filterId)
		local heroType = unit:getConfig().type
		if not isInBattle and not isInReinforcements and not same and heroType ~= 3 then
			local yokeCount = UserDataHelper.getWillActivateYokeCount(unit:getBase_id())
			unit:setWillActivateYokeCount(yokeCount)
			table.insert(result, unit)
		end
	end

	table.sort(result, sortFun)
	self._cacheReplaceData = result
	self:setReplaceDataDirty(false)
	-- end

	return self._cacheReplaceData
end

--获取排序后的更换援军数据
function HeroData:getReplaceReinforcementsDataBySort(heroId, beReplacedId)
	local sortFun = function(a, b)
		local countA = a:getWillActivateYokeCount()
		local countB = b:getWillActivateYokeCount()
		if countA ~= countB then
			return countA > countB
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() > b:getRank_lv()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	-- if self._cacheReplaceReinforcementData == nil or self:isReplaceReinforcementDataDirty() then
	local result = {}
	for k, unit in pairs(self._heroList) do
		local isInBattle = unit:isInBattle()
		local isInReinforcements = unit:isInReinforcements()
		local same = G_UserData:getTeam():isHaveSameName(unit:getBase_id())
		local heroType = unit:getConfig().type

		if not isInBattle and not isInReinforcements and not same and heroType ~= 3 then
			local yokeCount = UserDataHelper.getWillActivateYokeCount(unit:getBase_id(), beReplacedId, true)
			unit:setWillActivateYokeCount(yokeCount)
			table.insert(result, unit)
		end
	end

	table.sort(result, sortFun)

	if heroId then
		local unit = self:getUnitDataWithId(heroId)
		table.insert(result, 1, unit)
	end
	-- self._cacheReplaceReinforcementData = result
	-- self:setReplaceReinforcementDataDirty(false)
	-- end

	return result
end

-- 获取解锁战法位的武将列表
function HeroData:getHeroByTacticsPosUnlock(slot)
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color

		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() < b:getRank_lv()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local needColor, needNum = require("app.utils.data.TacticsDataHelper").getTacticsPosUnlockParam(slot)
	
	local result = {}
	for k, unit in pairs(self._heroList) do
		local heroConfig = unit:getConfig()
		local heroType = heroConfig.type
		local color = heroConfig.color
		local country = heroConfig.country

		if heroType == 2 and color == needColor then
			local isInBattle = unit:isInBattle()
			local isInReinforcements = unit:isInReinforcements()
			local isLimitRedGold = unit:isDidLitmitRedWithGold()
			local isTrained = unit:isDidTrain()
			if not isInBattle and not isInReinforcements and not isLimitRedGold and not isTrained then
				table.insert(result, unit)
			end
		end
	end

	table.sort(result, sortFun)

	return result
end

-- 获取战法研习武将列表
function HeroData:getStudyHeroList(tacticsId)
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color

		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() < b:getRank_lv()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local unitData = G_UserData:getTactics():getUnitDataWithId(tacticsId)
	local camp = unitData:getStudyConfig().camp
	local colorMap = {}
	for i=1,3 do
		local needColor = unitData:getStudyConfig()["color"..i]
		colorMap[needColor] = true
	end

	
	local result = {}
	for k, unit in pairs(self._heroList) do
		local heroConfig = unit:getConfig()
		local heroType = heroConfig.type
		local color = heroConfig.color
		local country = heroConfig.country

		if heroType == 2 and colorMap[color] and country == camp then
			local isInBattle = unit:isInBattle()
			local isInReinforcements = unit:isInReinforcements()
			local isLimitRedGold = unit:isDidLitmitRedWithGold()
			local isTrained = unit:isDidTrain()
			if not isInBattle and not isInReinforcements and not isLimitRedGold and not isTrained then
				table.insert(result, unit)
			end
		end
	end

	table.sort(result, sortFun)

	return result
end

--获取武将回收列表
function HeroData:getRecoveryList()
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color

		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() < b:getRank_lv()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	if self._cacheRecoveryList == nil or self:isRecoveryDataDirty() then
		local result = {}
		for k, unit in pairs(self._heroList) do
			local heroConfig = unit:getConfig()
			local heroType = heroConfig.type
			local color = heroConfig.color

			if heroType == 2 and color > 1 and color < 7 then
				local isInBattle = unit:isInBattle()
				local isInReinforcements = unit:isInReinforcements()
				local isLimitRedGold = unit:isDidLitmitRedWithGold()
				if not isInBattle and not isInReinforcements and not isLimitRedGold then
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

--获取武将回收自动添加列表
function HeroData:getRecoveryAutoList()
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0
		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() < b:getRank_lv()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	if self._cacheRecoveryAutoList == nil or self:isRecoveryAutoDataDirty() then
		local result = {}
		for k, unit in pairs(self._heroList) do
			local heroConfig = unit:getConfig()
			local heroType = heroConfig.type
			local color = heroConfig.color
			local isYoke = UserDataHelper.isHaveYokeWithHeroBaseId(unit:getBase_id())
			if heroType == 2 and color > 1 and color < 5 and not isYoke then --自动添加，不加橙色、红色，没有羁绊关系
				local isInBattle = unit:isInBattle()
				local isInReinforcements = unit:isInReinforcements()
				if not isInBattle and not isInReinforcements then
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

--获取武将重生列表
function HeroData:getRebornList()
	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isDidTrain() and 1 or 0
		local isTrainB = b:isDidTrain() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() < b:getRank_lv()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	if self._cacheRebornList == nil or self:isRebornDataDirty() then
		local result = {}
		for k, unit in pairs(self._heroList) do
			local heroConfig = unit:getConfig()
			local heroType = heroConfig.type
			local color = heroConfig.color

			if heroType == 2 and color > 1 then
				local isDidTrain = unit:isDidTrain()
				if isDidTrain then
					local isInBattle = unit:isInBattle()
					local isInReinforcements = unit:isInReinforcements()
					if not isInBattle and not isInReinforcements then
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

function HeroData:getTransformSrcList()
	local sortFun = function(a, b)
		local trainA = a:isDidTrain() and 1 or 0
		local trainB = b:isDidTrain() and 1 or 0
		local yokeCountA = a:getWillActivateYokeCount()
		local yokeCountB = b:getWillActivateYokeCount()

		if trainA ~= trainB then
			return trainA > trainB
		elseif yokeCountA ~= yokeCountB then
			return yokeCountA > yokeCountB
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getRank_lv() ~= b:getRank_lv() then
			return a:getRank_lv() > b:getRank_lv()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local result = {
		[1] = {}, --魏
		[2] = {}, --蜀
		[3] = {}, --吴
		[4] = {} --群雄
	}
	for k, unit in pairs(self._heroList) do
		local isInBattle = unit:isInBattle()
		local isInReinforcements = unit:isInReinforcements()
		local isSrc = unit:isCanBeTransformSrc() --是否能是置换者
		local color = unit:getConfig().color
		if not isInBattle and not isInReinforcements and isSrc and color >= 5 and color <= 7 then --橙、红、金将
			local country = unit:getConfig().country
			local yokeCount = UserDataHelper.getWillActivateYokeCount(unit:getBase_id())
			unit:setWillActivateYokeCount(yokeCount)
			if result[country] then
				table.insert(result[country], unit)
			end
		end
	end

	for i = 1, 4 do
		table.sort(result[i], sortFun)
	end

	return result
end

--获取主角静态Id
function HeroData:getRoleBaseId()
	for k, data in pairs(self._heroList) do
		local config = data:getConfig()
		if config.type == 1 then
			return config.id
		end
	end
	-- 建号之前，对话需求判断baseid，所以去掉assert
	-- assert(false, "can not find role baseId")
end

--获取筛选掉相同baseId后的武将列表信息
function HeroData:getHeroListByFiltSameBaseId()
	local result = {}
	local temp = {}

	local heroIdList = self:getListDataBySort()
	for i, heroId in ipairs(heroIdList) do
		local unitData = self:getUnitDataWithId(heroId)
		local baseId = unitData:getBase_id()
		if temp[baseId] ~= true then --排除baseId重复的情况
			table.insert(result, unitData)
		end
		if temp[baseId] == nil then
			temp[baseId] = true
		end
	end

	return result
end

--判断是否在武将列表中，根据baseId
function HeroData:isInListWithBaseId(baseId)
	for k, data in pairs(self._heroList) do
		local id = data:getBase_id()
		if id == baseId then
			return true
		end
	end
	return false
end

--判断是否有未上阵武将
function HeroData:isHaveHeroNotInBattle()
	for k, unit in pairs(self._heroList) do
		if unit:getConfig().type == 2 then
			local isInBattle = unit:isInBattle()
			local isInReinforcements = unit:isInReinforcements()
			local same = G_UserData:getTeam():isHaveSameName(unit:getBase_id())
			--未在阵容位，未在援军位，品质绿色及以上，和阵位上已有的武将不同名
			if not isInBattle and not isInReinforcements and unit:getConfig().color >= 2 and not same then
				return true
			end
		end
	end
	return false
end

--判断是否有可激活羁绊的武将
function HeroData:isHaveActiveYokeHeroNotInBattle()
	for k, unit in pairs(self._heroList) do
		if unit:getConfig().type == 2 then
			local isInBattle = unit:isInBattle()
			local isInReinforcements = unit:isInReinforcements()
			local same = G_UserData:getTeam():isHaveSameName(unit:getBase_id())
			local count = UserDataHelper.getWillActivateYokeCount(unit:getBase_id())
			--未在阵容位，未在援军位，可激活羁绊， 排除重名的
			if not isInBattle and not isInReinforcements and not same and count > 0 then
				return true
			end
		end
	end
	return false
end

--判断是否显示武将回收的红点
function HeroData:isShowRedPointOfHeroRecovery()
	local paramId = require("app.const.ParameterIDConst").DISPLAY_NUMBER
	local limit = require("app.config.parameter").get(paramId).content
	local count = 0
	for k, data in pairs(self._heroList) do
		local type = data:getConfig().type
		local color = data:getConfig().color
		local isYoke = UserDataHelper.isHaveYokeWithHeroBaseId(data:getBase_id())
		local isInBattle = data:isInBattle()
		local isInReinforcements = data:isInReinforcements()
		if type == 2 and (color == 2 or color == 3) and not isYoke and not isInBattle and not isInReinforcements then --武将，蓝将或绿将
			count = count + 1
		end
	end

	return count >= tonumber(limit)
end

--===================协议部分===================================================================

--武将升级
function HeroData:c2sHeroLevelUp(heroId, materials)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_HeroLevelUp,
		{
			id = heroId,
			materials = materials
		}
	)
end

function HeroData:_s2cHeroLevelUp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_HERO_LEVELUP)
end

--武将突破
function HeroData:c2sHeroRankUp(id, heroIds)
	dump(id)
	dump(heroIds)
	if #heroIds == 0 then
		G_NetworkManager:send(
			MessageIDConst.ID_C2S_HeroRankUp,
			{
				id = id
			}
		)
	else
		G_NetworkManager:send(
			MessageIDConst.ID_C2S_HeroRankUp,
			{
				id = id,
				hero_id = heroIds
			}
		)
	end
end

function HeroData:_s2cHeroRankUp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_HERO_RANKUP)
end

--武将回收
function HeroData:c2sHeroRecycle(heroIds)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_HeroRecycle,
		{
			hero_id = heroIds
		}
	)
end

function HeroData:_s2cHeroRecycle(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setSortDataDirty(true)
	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_HERO_RECOVERY_SUCCESS, awards)
end

--武将重生
function HeroData:c2sHeroReborn(heroId)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_HeroReborn,
		{
			hero_id = heroId
		}
	)
end

function HeroData:_s2cHeroReborn(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setSortDataDirty(true)
	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_HERO_REBORN_SUCCESS, awards)
end

--武将觉醒
function HeroData:c2sHeroAwaken(heroId, costHeros)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_HeroAwaken,
		{
			hero_id = heroId,
			cost_heros = costHeros
		}
	)
end

function HeroData:_s2cHeroAwaken(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_HERO_AWAKE_SUCCESS)
end

--武将装备觉醒材料
function HeroData:c2sHeroEquipAwaken(heroId, slot)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_HeroEquipAwaken,
		{
			hero_id = heroId,
			slot = slot
		}
	)
end

function HeroData:_s2cHeroEquipAwaken(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local slot = rawget(message, "slot") or {}

	G_SignalManager:dispatch(SignalConst.EVENT_HERO_EQUIP_AWAKE_SUCCESS, slot)
end

--武将置换
function HeroData:c2sHeroTransform(srcIds, toId, withInstrument)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_HeroTransform,
		{
			to_id = toId,
			src_ids = srcIds,
			with_instrument = withInstrument
		}
	)
end

function HeroData:_s2cHeroTransform(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_HERO_TRANSFORM_SUCCESS)
end

--武将界限突破放材料
function HeroData:c2sHeroLimitLvPutRes(heroId, pos, subItems, op, costHeroIds)
	if #costHeroIds>0 then
		self:setLimitUpWithHero(true)
	end
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_HeroLimitLvPutRes,
		{
			hero_id = heroId,
			pos = pos,
			sub_item = subItems,
			op = op,
			cost_hero_ids = costHeroIds
		}
	)
end

function HeroData:_s2cHeroLimitLvPutRes(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local pos = rawget(message, "pos") or 0
	
	self:setSortDataDirty(true)
	if self:isLimitUpWithHero() then
		self:setLimitUpWithHero(false)
		G_SignalManager:dispatch(SignalConst.EVENT_HERO_LIMIT_LV_PUT_RES_WITH_HERO)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_HERO_LIMIT_LV_PUT_RES, pos)
end

--武将界限突破
function HeroData:c2sHeroLimitLvUp(heroId, op)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_HeroLimitLvUp,
		{
			hero_id = heroId,
			op = op
		}
	)
end

function HeroData:_s2cHeroLimitLvUp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self:setSortDataDirty(true)
	G_SignalManager:dispatch(SignalConst.EVENT_HERO_LIMIT_LV_UP_SUCCESS)
end

function HeroData:c2sGoldHeroRankUp(heroId)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_GoldHeroRankUp,
		{
			id = heroId
		}
	)
end

function HeroData:c2sGoldHeroResource(heroId, resType, heroIds, items)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_GoldHeroResource,
		{
			id = heroId,
			res_type = resType,
			hero_ids = heroIds,
			awards = items
		}
	)
end

function HeroData:_s2cGoldHeroRankUp(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GOLD_HERO_RESOURCE_SUCCESS)
end

function HeroData:_s2cGoldHeroResource(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GOLD_HERO_RESOURCE_SUCCESS)
end

return HeroData
