-- 阵容数据
-- Author: Liangxu
-- Date: 2017-02-15 16:28:26
--
local BaseData = require("app.data.BaseData")
local TeamData = class("TeamData", BaseData)
local FunctionLevelConfig = require("app.config.function_level")
local TeamConst = require("app.const.TeamConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

local schema = {}
schema["heroIds"] = {"table", {}}
schema["petIds"] = {"table", {}}
schema["embattle"] = {"table", {}}
schema["secondHeroIds"] = {"table", {}}
--schema["historyHeroIds"] = {"table", {}}
schema["curPos"] = {"number", 0}
TeamData.schema = schema

function TeamData:ctor(properties)
	TeamData.super.ctor(self, properties)

	self._recvGetFormation = G_NetworkManager:add(MessageIDConst.ID_S2C_GetFormation, handler(self, self._s2cGetFormation))

	self._recvGetPetFormation =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetPetFormation, handler(self, self._s2cGetPetFormation))

	self._recvChangeEmbattle =
		G_NetworkManager:add(MessageIDConst.ID_S2C_ChangeEmbattle, handler(self, self._s2cChangeEmbattle))
	self._recvChangeHeroFormation =
		G_NetworkManager:add(MessageIDConst.ID_S2C_ChangeHeroFormation, handler(self, self._s2cChangeHeroFormation))
	self._recvChangeHeroSecondFormation =
		G_NetworkManager:add(
		MessageIDConst.ID_S2C_ChangeHeroSecondFormation,
		handler(self, self._s2cChangeHeroSecondFormation)
	)
end

function TeamData:clear()
	self._recvGetPetFormation:remove()
	self._recvGetPetFormation = nil

	self._recvGetFormation:remove()
	self._recvGetFormation = nil
	self._recvChangeEmbattle:remove()
	self._recvChangeEmbattle = nil
	self._recvChangeHeroFormation:remove()
	self._recvChangeHeroFormation = nil
	self._recvChangeHeroSecondFormation:remove()
	self._recvChangeHeroSecondFormation = nil
end

function TeamData:reset()
end

function TeamData:_s2cGetPetFormation(id, message)
	-- body
	local petIds = rawget(message, "pet_ids") or {}
	self:setPetIds(petIds)
end

function TeamData:_s2cGetFormation(id, message)
	local heroIds = rawget(message, "hero_ids") or {}
	self:setHeroIds(heroIds)

	local embattle = rawget(message, "embattle") or {}
	self:setEmbattle(embattle)

	local secondHeroIds = rawget(message, "second_hero_ids") or {}
	self:setSecondHeroIds(secondHeroIds)

	--local historyHeroIds = rawget(message, "stars") or {}
	--self:setHistoryHeroIds(historyHeroIds)
end

--获取上阵的神兽Id列表,无空位置
function TeamData:getPetIdsInHelp()
	local result = {}
	local petIds = self:getPetIds()
	for i, id in ipairs(petIds) do
		if id > 0 then
			table.insert(result, id)
		end
	end
	return result
end

--获取上阵的神兽Id列表, 有空位置
function TeamData:getPetIdsInHelpWithZero()
	local result = {}
	local petIds = self:getPetIds()
	for i, id in ipairs(petIds) do
		table.insert(result, id)
	end
	return result
end

--获取上阵的神兽Id列表
function TeamData:getPetIdsInBattle()
	local result = {}
	local id = G_UserData:getBase():getOn_team_pet_id()
	if id and id > 0 then
		table.insert(result, id)
	end
	return result
end

--获取上阵的武将Id列表
function TeamData:getHeroIdsInBattle()
	local result = {}
	local heroIds = self:getHeroIds()
	for i, id in ipairs(heroIds) do
		if id > 0 then
			table.insert(result, id)
		end
	end
	return result
end

--获取上阵的武将baseId列表
function TeamData:getHeroBaseIdsInBattle()
	local result = {}
	local heroIds = self:getHeroIds()
	for i, id in ipairs(heroIds) do
		if id > 0 then
			local unit = G_UserData:getHero():getUnitDataWithId(id)
			table.insert(result, unit:getBase_id())
		end
	end
	return result
end

--获取上阵的武将数量
function TeamData:getHeroCountInBattle()
	local count = 0
	local heroIds = self:getHeroIds()
	for i, id in ipairs(heroIds) do
		if id > 0 then
			count = count + 1
		end
	end
	return count
end

--根据阵位索引获取神兽状态
function TeamData:getPetStateWithPos(pos)
	--是否开启
	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_PET_HELP_SLOT" .. pos])
	--是否有上阵神兽
	local petIds = self:getPetIds()
	if petIds[pos] == nil then
		return TeamConst.STATE_LOCK
	end
	local isPet = petIds[pos] > 0

	local state = TeamConst.STATE_LOCK
	if isOpen then
		if isPet then
			state = TeamConst.STATE_HERO
		else
			state = TeamConst.STATE_OPEN
		end
	else
		state = TeamConst.STATE_LOCK
	end

	return state
end

--根据阵位索引获取状态
function TeamData:getStateWithPos(pos)
	--是否开启
	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_TEAM_SLOT" .. pos])
	--是否有上阵武将
	local heroIds = self:getHeroIds()
	local isHero = heroIds[pos] > 0

	local state = TeamConst.STATE_LOCK
	if isOpen then
		if isHero then
			state = TeamConst.STATE_HERO
		else
			state = TeamConst.STATE_OPEN
		end
	else
		state = TeamConst.STATE_LOCK
	end

	return state
end

function TeamData:getPetState()
	local isOpen, comment, funcLevelInfo = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_HOME)
	local petId = G_UserData:getBase():getOn_team_pet_id()
	local isPet = petId > 0

	local state = TeamConst.STATE_LOCK
	if isOpen then
		if isPet then
			state = TeamConst.STATE_HERO
		else
			state = TeamConst.STATE_OPEN
		end
	else
		state = TeamConst.STATE_LOCK
	end

	return state, funcLevelInfo
end

--根据护佑索引获取神兽Id
function TeamData:getPetIdWithPos(pos)
	local petIds = self:getPetIds()
	local petId = petIds[pos]
	assert(petId, string.format("TeamData:getHeroIdWithPos is Wrong, pos = %d", pos))
	return petId
end

--根据阵位索引获取武将Id
function TeamData:getHeroIdWithPos(pos)
	local heroIds = self:getHeroIds()
	local heroId = heroIds[pos]
	assert(heroId, string.format("TeamData:getHeroIdWithPos is Wrong, pos = %d", pos))
	return heroId
end

--根据援军位索引获取武将id
function TeamData:getHeroIdInReinforcementsWithPos(pos)
	local heroIds = self:getSecondHeroIds()
	local heroId = heroIds[pos]
	assert(heroId, string.format("TeamData:getHeroIdInReinforcementsWithPos is Wrong, pos = %d", pos))
	return heroId
end

--根据神兽静态Id判断是否出战状态
function TeamData:isInBattleWithPetBaseId(petBaseId)
	local petIdList = self:getPetIdsInBattle()
	for i, petId in ipairs(petIdList) do
		if petId > 0 then
			local petUnit = G_UserData:getPet():getUnitDataWithId(petId)
			local baseId = petUnit:getBase_id()
			if baseId == petBaseId then
				return true
			end
		end
	end
	return false
end

--根据神兽静态Id判断是否出护佑态
function TeamData:isInHelpWithPetBaseId(petBaseId)
	local petIdList = self:getPetIdsInHelp()
	for i, petId in ipairs(petIdList) do
		if petId > 0 then
			local petUnit = G_UserData:getPet():getUnitDataWithId(petId)
			local baseId = petUnit:getBase_id()
			if baseId == petBaseId then
				return true
			end
		end
	end
	return false
end

--根据武将静态Id判断是否出战状态
function TeamData:isInBattleWithBaseId(baseId)
	local heroIds = self:getHeroIds()
	for i, heroId in ipairs(heroIds) do
		if heroId > 0 then
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId = heroUnitData:getBase_id()
			if heroBaseId == baseId then
				return true
			end
		end
	end
	return false
end

--根据武将静态Id判断是否援军位上
function TeamData:isInReinforcementsWithBaseId(baseId)
	local heroIds = self:getSecondHeroIds()
	for i, heroId in ipairs(heroIds) do
		if heroId > 0 then
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
			local heroBaseId = heroUnitData:getBase_id()
			if heroBaseId == baseId then
				return true
			end
		end
	end
	return false
end

function TeamData:isHaveSamePet(baseId, filterId)
	local function isHave(id, petIds)
		for i, petId in ipairs(petIds) do
			if petId > 0 then
				local petUnitData = G_UserData:getPet():getUnitDataWithId(petId)
				local baseId = petUnitData:getBase_id()
				local config = petUnitData:getConfig()
				if baseId == id and config.potential_before == id and config.potential_after == id then
					return true
				end
			end
		end
		return false
	end

	if filterId and filterId == baseId then
		logWarn("TeamData:isHaveSamePet false")
		return false
	end

	local petIdsInBattle = self:getPetIdsInBattle()
	local petIdsInHelp = self:getPetIdsInHelp()

	return isHave(baseId, petIdsInHelp) or isHave(baseId, petIdsInBattle)
end

--判断上阵位和援军位中的武将是否有和baseId相同的武将
--filterId：需要排除的Id，即需要判断的baseId=filterId，则认为是没有相同的武将
function TeamData:isHaveSameName(baseId, filterId)
	local function isHave(id, heroIds)
		for i, heroId in ipairs(heroIds) do
			if heroId > 0 then
				local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
				local heroBaseId = heroUnitData:getBase_id()
				if heroBaseId == id then
					return true
				end
			end
		end
		return false
	end

	if filterId and filterId == baseId then
		return false
	end

	local heroIds = self:getHeroIds()
	local secondHeroIds = self:getSecondHeroIds()

	return isHave(baseId, heroIds) or isHave(baseId, secondHeroIds)
end

function TeamData:getHeroDataInBattle()
	local result = {}
	local heroIds = self:getHeroIds()
	for i, heroId in ipairs(heroIds) do
		if heroId > 0 then
			local data = G_UserData:getHero():getUnitDataWithId(heroId)
			table.insert(result, data)
		end
	end
	return result
end

function TeamData:getPetDataInBattle(...)
	-- body
	local result = {}
	local petIds = self:getPetIds()
	for i, petId in ipairs(petIds) do
		if petId > 0 then
			local data = G_UserData:getPet():getUnitDataWithId(petId)
			table.insert(result, data)
		end
	end
	return result
end

function TeamData:getHeroDataInReinforcements()
	local result = {}
	local heroIds = self:getSecondHeroIds()
	for i, heroId in ipairs(heroIds) do
		if heroId > 0 then
			local data = G_UserData:getHero():getUnitDataWithId(heroId)
			result[i] = data
		end
	end
	return result
end

--=========================协议部分=============================================
--布阵
function TeamData:c2sChangeEmbattle(data)
	self._backupEmbattle = data
	G_NetworkManager:send(MessageIDConst.ID_C2S_ChangeEmbattle, {positions = data})
end

function TeamData:_s2cChangeEmbattle(id, message)
	if message.ret == MessageErrorConst.RET_OK then
		self:setEmbattle(self._backupEmbattle)
	end
end

--阵容更换
function TeamData:c2sChangeHeroFormation(pos, heroId)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_ChangeHeroFormation,
		{
			pos = pos,
			hero_id = heroId
		}
	)
end

function TeamData:_s2cChangeHeroFormation(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_UserData:getHero():setSortDataDirty(true)
	local pos = rawget(message, "pos")
	local heroId = rawget(message, "hero_id")
	local oldHeroId = rawget(message, "old_hero_id")

	G_SignalManager:dispatch(SignalConst.EVENT_CHANGE_HERO_FORMATION_SUCCESS, pos, oldHeroId)
end

--援军更换
function TeamData:c2sChangeHeroSecondFormaion(pos, heroId)
	if heroId then
		G_NetworkManager:send(
			MessageIDConst.ID_C2S_ChangeHeroSecondFormation,
			{
				pos = pos,
				hero_id = heroId
			}
		)
	else
		G_NetworkManager:send(
			MessageIDConst.ID_C2S_ChangeHeroSecondFormation,
			{
				pos = pos
			}
		)
	end
end

function TeamData:_s2cChangeHeroSecondFormation(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_UserData:getHero():setSortDataDirty(true)
	local pos = rawget(message, "pos")
	local heroId = rawget(message, "hero_id")
	local oldHeroId = rawget(message, "old_hero_id")

	local secondHeroIds = self:getSecondHeroIds()
	if heroId and heroId > 0 then
		secondHeroIds[pos] = heroId
	else
		secondHeroIds[pos] = 0
	end
	self:setSecondHeroIds(secondHeroIds)

	G_SignalManager:dispatch(SignalConst.EVENT_CHANGE_HERO_SECOND_FORMATION, heroId, oldHeroId)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TEAM)
end

return TeamData
