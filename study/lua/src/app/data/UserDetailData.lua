--
-- Author: Liangxu
-- Date: 2017-9-12 16:07:35
-- 查看玩家数据
local BaseData = require("app.data.BaseData")
local UserDetailData = class("UserDetailData", BaseData)
local HeroUnitData = require("app.data.HeroUnitData")
local EquipmentUnitData = require("app.data.EquipmentUnitData")
local TreasureUnitData = require("app.data.TreasureUnitData")
local InstrumentUnitData = require("app.data.InstrumentUnitData")
local HorseUnitData = require("app.data.HorseUnitData")
local AvatarUnitData = require("app.data.AvatarUnitData")
local TeamConst = require("app.const.TeamConst")
local PetUnitData = require("app.data.PetUnitData")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")
local ActivePhotoData = require("app.data.ActivePhotoData")
local SilkbagUnitData = require("app.data.SilkbagUnitData")
local SilkbagOnTeamUnitData = require("app.data.SilkbagOnTeamUnitData")
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local HorseEquipmentUnitData = require("app.data.HorseEquipmentUnitData")
local HistoryHeroUnit = require("app.data.HistoryHeroUnit")
local TacticsUnitData = require("app.data.TacticsUnitData")
local TacticsConst = require("app.const.TacticsConst")
local BoutUnit = require("app.data.BoutUnit")

local schema = {}
UserDetailData.schema = schema

local JADE_TYPE_EQUIPMENT = 0
local JADE_TYPE_TREASURE = 1

function UserDetailData:ctor(properties)
	UserDetailData.super.ctor(self, properties)

	self._baseId = 0
	self._avatarId = 0
	self._avatarBaseId = 0
	self._name = ""
	self._level = 0
	self._officeLevel = 0
	self._destiny = {}
	self._heroList = {}
	self._formation = {}
	self._secondFormation = {}
	self._equipmentList = {}
	self._treasureList = {}
	self._instrumentList = {}
	self._avatarList = {}
	self._petList = {}
	self._onTeamPetId = 0
	self._protectPetIds = {}
	self._handbookList = {}
	self._activePhoto = {}
	self._silkbags = {}
	self._silkbagPosTable = {}
	self._horseList = {}
	self._horseEquipList = {}
	self._historyHeroIds = {}
	self._historyHeroList = {}
	self._tacticsList = {}
    self._tacticsUnlockList = {}
    self._boutUnlockList = {}
end

function UserDetailData:clear()
end

function UserDetailData:reset()
	self._baseId = 0
	self._avatarId = 0
	self._avatarBaseId = 0
	self._name = ""
	self._level = 0
	self._officeLevel = 0
	self._destiny = {}
	self._heroList = {}
	self._formation = {}
	self._secondFormation = {}
	self._equipmentList = {}
	self._treasureList = {}
	self._resourcePosTable = {}
	self._instrumentList = {}
	self._avatarList = {}
	self._petList = {}
	self._onTeamPetId = 0
	self._protectPetIds = {}
	self._handbookList = {}
	self._activePhoto = {}
	self._silkbags = {}
	self._silkbagPosTable = {}
	self._horseList = {}
	self._horseEquipList = {}
	self._historyHeroIds = {}
	self._historyHeroList = {}
	self._tacticsList = {}
    self._tacticsUnlockList = {}
    self._boutUnlockList = {}
end

function UserDetailData:updateData(message)
	self._baseId = message.base_id or 0
	self._avatarId = message.avatar_id or 0
	self._avatarBaseId = message.avatar_base_id or 0
	self._name = message.name or ""
	self._level = message.level or 0
	self._officeLevel = message.office_level or 0
	self._destiny = message.destiny or {}
	local heros = rawget(message, "heros") or {}
	local formation = rawget(message, "formation") or {}
	local secondFormation = rawget(message, "second_formation") or {}
	local equipments = rawget(message, "equipments") or {}
	local treasures = rawget(message, "treasures") or {}
	local teamResource = rawget(message, "team_resource") or {}
	local instruments = rawget(message, "instruments") or {}
	local avatars = rawget(message, "avatars") or {}
	local pets = rawget(message, "pets") or {}
	self._onTeamPetId = message.on_team_pet_id or 0
	local protectPetIds = rawget(message, "protect_pet_ids") or {}
	local resPhoto = rawget(message, "res_photo") or {}
	local activePhoto = rawget(message, "active_photo") or {}
	local silkbags = rawget(message, "silkbags") or {}
	local silkbagOnTeam = rawget(message, "silkbag_team") or {}
	local homeTree = rawget(message, "home_tree") or {}
	local horses = rawget(message, "war_horses") or {}
	local horseEquips = rawget(message, "war_horse_equip") or {}
	local jadeList = rawget(message, "jade") or {}
	local historyHeroIds = rawget(message, "star_formation") or {}
	local historyHeros = rawget(message, "stars") or {}
	local tacticsInfo = rawget(message, "tacticsInfo") or {}
    local tacticsUnlockInfo = rawget(message, "tactics_unlock") or {}
    local boutUnlockInfo = rawget(message, "bout")  or {}
    

	self._baseId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(self._avatarBaseId, self._baseId)

	self._heroList = {}
	for i, data in ipairs(heros) do
		local unitData = HeroUnitData.new()
		unitData:updateData(data)
		self._heroList["k_" .. tostring(data.id)] = unitData
	end

	self._formation = formation
	self._secondFormation = secondFormation

	self._equipmentList = {}
	for i, data in ipairs(equipments) do
		local unitData = EquipmentUnitData.new()
		unitData:updateData(data)
		self._equipmentList["k_" .. tostring(data.id)] = unitData
	end

	self._treasureList = {}
	for i, data in ipairs(treasures) do
		local unitData = TreasureUnitData.new()
		unitData:updateData(data)
		self._treasureList["k_" .. tostring(data.id)] = unitData
	end

	self._instrumentList = {}
	for i, data in ipairs(instruments) do
		local unitData = InstrumentUnitData.new()
		unitData:updateData(data)
		self._instrumentList["k_" .. tostring(data.id)] = unitData
	end

	self._avatarList = {}
	for i, data in ipairs(avatars) do
		local unitData = AvatarUnitData.new()
		unitData:updateData(data)
		self._avatarList["k_" .. tostring(data.id)] = unitData
	end

	self._resourcePosTable = {}
	for i, data in ipairs(teamResource) do
		if data.id > 0 then
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
	end

	self._petList = {}
	for i, data in ipairs(pets) do
		local unitData = PetUnitData.new()
		unitData:updateData(data)
		self._petList["k_" .. tostring(data.id)] = unitData
	end

	self._protectPetIds = protectPetIds

	self._handbookList = {}
	for i, data in ipairs(resPhoto) do
		self._handbookList["k" .. data.res_type] = self._handbookList["k" .. data.res_type] or {}
		self._handbookList["k" .. data.res_type]["k" .. data.res_id] = true
	end

	self._activePhoto = {}
	for i, data in ipairs(activePhoto) do
		local unitData = ActivePhotoData.new(data)
		local type = unitData:getActive_type()
		local id = unitData:getActive_id()
		self._activePhoto["k" .. type] = self._activePhoto["k" .. type] or {}
		table.insert(self._activePhoto["k" .. type], id)
	end

	self._silkbags = {}
	for i, data in ipairs(silkbags) do
		local unitData = SilkbagUnitData.new(data)
		self._silkbags["k_" .. tostring(data.id)] = unitData
	end

	self._silkbagPosTable = {}
	for i, data in ipairs(silkbagOnTeam) do
		local unitData = SilkbagOnTeamUnitData.new(data)
		local pos = unitData:getPos()
		local index = unitData:getIndex()
		local silkbagId = unitData:getSilkbag_id()
		if self._silkbagPosTable[pos] == nil then
			self._silkbagPosTable[pos] = {}
		end
		self._silkbagPosTable[pos][index] = silkbagId
	end

	self._homeTree = {}
	self._homeTree = homeTree

	self._horseList = {}
	for i, data in ipairs(horses) do
		local unitData = HorseUnitData.new()
		unitData:updateData(data)
		self._horseList["k_" .. tostring(data.id)] = unitData
	end

	self._horseEquipList = {}
	for i, data in ipairs(horseEquips) do
		local unitData = HorseEquipmentUnitData.new()
		unitData:updateData(data)
		self._horseEquipList["k_" .. tostring(data.id)] = unitData
	end

	self._historyHeroIds = historyHeroIds

	self._historyHeroList = {}
	for i, data in ipairs(historyHeros) do
		local unitData = HistoryHeroUnit.new()
		unitData:updateData(data)
		self._historyHeroList["k_" .. tostring(data.id)] = unitData
	end

	self._tacticsList = {}
	for i, data in ipairs(tacticsInfo) do
		local unitData = TacticsUnitData.new()
		unitData:updateData(data)
		self._tacticsList["k_" .. tostring(data.tactics_id)] = unitData
	end

	self._tacticsUnlockList = {}
	for i, data in ipairs(tacticsUnlockInfo) do
		local pos = rawget(data, "pos")
		if pos ~= nil and pos ~= 0 then
			self._tacticsUnlockList[pos] = data.slots
		end
    end
    
    self._boutUnlockList = {}
    for i, value in ipairs(boutUnlockInfo) do
        if not self._boutUnlockList[value.id] then
            self._boutUnlockList[value.id] = {}
        end
        local boutUnit = BoutUnit.new(value)
        self._boutUnlockList[value.id][value.pos] = boutUnit
    end


	self:_constructUserEquipmentJadeData(jadeList)
end

function UserDetailData:getUnitDataListWithPos(pos)
	local list = {}
	local heroId = self._formation[pos]
	for k,data in pairs(self._tacticsList) do
		if data:getHero_id()==heroId then
			table.insert(list, data)
		end
	end
	return list
end

function UserDetailData:getBoutAttr()
    -- body
    return G_UserData:getBout():getAttrSingleInfo(self._boutUnlockList)
end

function UserDetailData:getBoutPower()
    -- body
    return G_UserData:getBout():getPowerSingleInfo(self._boutUnlockList)
end

function UserDetailData:_constructUserEquipmentJadeData(jadeList)
	for i, data in ipairs(jadeList) do
		if data.equiped_type == JADE_TYPE_EQUIPMENT then
			local unitData = self._equipmentList["k_" .. tostring(data.equipment_id)]
			if unitData then
				local jades = unitData:getJades()
				for i = 1, #jades do
					if data.id == jades[i] then
						unitData:setUserDetailJades(i, data.sys_id)
					end
				end
			end
		elseif data.equiped_type == JADE_TYPE_TREASURE then
			local unitData = self._treasureList["k_" .. tostring(data.equipment_id)]
			if unitData then
				local jades = unitData:getJades()
				for i = 1, #jades do
					if data.id == jades[i] then
						unitData:setUserDetailJades(i, data.sys_id)
					end
				end
			end
		end
	end
end

function UserDetailData:isShowEquipJade()
	local funcLevelInfo = require("app.config.function_level").get(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)
	local isShow = self:getLevel() >= funcLevelInfo.level
	return isShow
end

function UserDetailData:isShowTreasureJade()
	local funcLevelInfo = require("app.config.function_level").get(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3)
	local isShow = self:getLevel() >= funcLevelInfo.level
	return isShow
end

function UserDetailData:getFormation()
	return self._formation
end

function UserDetailData:getHeroDataWithId(id)
	local data = self._heroList["k_" .. id]
	return data
end

function UserDetailData:getHeroCount()
	local count = 0
	for i, id in ipairs(self._formation) do
		if id > 0 then
			count = count + 1
		end
	end
	return count
end

function UserDetailData:getHeroDataWithPos(pos)
	local heroId = self._formation[pos]
	if heroId > 0 then
		local data = self._heroList["k_" .. heroId]
		return data
	end
	return nil
end

-- 获取战法位状态
function UserDetailData:getTacticsPosState(pos, slot)
	local isOpen = self:funcIsOpened(FunctionConst["FUNC_TACTICS_POS" .. slot])
	if not isOpen then
		return TacticsConst.STATE_LOCK_LEVEL
	end

	local heroUnitData = self:getHeroDataWithPos(pos)
	local slotList = self._tacticsUnlockList[pos] or {}

	local find = false
	for _,v in pairs(slotList) do
		if slot==v then
			find = true
			break
		end
	end
	if not find and slot ~= 1 then
		return TacticsConst.STATE_LOCK
	end

	local heroId = heroUnitData:getId()
	local tacticsUnitData = nil
	for _,unitData in pairs(self._tacticsList) do
		if unitData:getHero_id()==heroId and unitData:getPos()==slot then
			tacticsUnitData = unitData
			break
		end
	end
	if tacticsUnitData then
		return TacticsConst.STATE_WEARED, tacticsUnitData
	else
		return TacticsConst.STATE_EMPTY
	end
end

function UserDetailData:getPosState(pos)
	local count = self:getHeroCount()
	if pos <= count then
		return TeamConst.STATE_HERO
	else
		return TeamConst.STATE_LOCK
	end
end

function UserDetailData:getEquipDataWithId(id)
	return self._equipmentList["k_" .. tostring(id)]
end

function UserDetailData:getEquipData(pos, slot)
	if self._resourcePosTable[pos] == nil then
		return nil
	end
	if self._resourcePosTable[pos][1] == nil then
		return nil
	end
	local equipId = self._resourcePosTable[pos][1][slot]
	if equipId then
		return self._equipmentList["k_" .. tostring(equipId)]
	end
end

function UserDetailData:getTreasureDataWithId(id)
	return self._treasureList["k_" .. tostring(id)]
end

function UserDetailData:getTreasureData(pos, slot)
	if self._resourcePosTable[pos] == nil then
		return nil
	end
	if self._resourcePosTable[pos][2] == nil then
		return nil
	end
	local treasureId = self._resourcePosTable[pos][2][slot]
	if treasureId then
		return self._treasureList["k_" .. tostring(treasureId)]
	end
end

function UserDetailData:getInstrumentDataWithId(id)
	return self._instrumentList["k_" .. tostring(id)]
end

function UserDetailData:getInstrumentData(pos, slot)
	if self._resourcePosTable[pos] == nil then
		return nil
	end
	if self._resourcePosTable[pos][3] == nil then
		return nil
	end
	local instrumentId = self._resourcePosTable[pos][3][slot]
	if instrumentId then
		return self._instrumentList["k_" .. tostring(instrumentId)]
	end
end

function UserDetailData:getHorseDataWithId(id)
	return self._horseList["k_" .. tostring(id)]
end

function UserDetailData:getHorseData(pos, slot)
	if self._resourcePosTable[pos] == nil then
		return nil
	end
	if self._resourcePosTable[pos][4] == nil then
		return nil
	end
	local horseId = self._resourcePosTable[pos][4][slot]
	if horseId then
		return self._horseList["k_" .. tostring(horseId)]
	end
end

function UserDetailData:getHorseEquipData()
	return self._horseEquipList
end

function UserDetailData:getHistoryHeroData(pos)
	if self._historyHeroIds[pos] == nil then
		return nil
	end
	local historyHeroId = self._historyHeroIds[pos]
	if historyHeroId then
		return self._historyHeroList["k_" .. tostring(historyHeroId)]
	end
end

function UserDetailData:getSecondFormation()
	return self._secondFormation
end

function UserDetailData:getHeroDataInBattle()
	local result = {}
	for i, id in ipairs(self._formation) do
		if id > 0 then
			local data = self._heroList["k_" .. tostring(id)]
			table.insert(result, data)
		end
	end
	return result
end

function UserDetailData:getHeroDataInReinforcements()
	local result = {}
	for i, id in ipairs(self._secondFormation) do
		if id > 0 then
			local data = self._heroList["k_" .. tostring(id)]
			result[i] = data
		end
	end
	return result
end

function UserDetailData:getBaseId()
	return self._baseId
end

function UserDetailData:getAvatarToHeroBaseId(heroUnitData)
	local heroBaseId = heroUnitData:getBase_id()
	if heroUnitData:isLeader() and self._avatarBaseId > 0 then
		heroBaseId = require("app.utils.data.AvatarDataHelper").getAvatarConfig(self._avatarBaseId).hero_id
	end
	return heroBaseId
end

function UserDetailData:getUserLeaderLimitLevel(heroUnitData)
	if heroUnitData:isLeader() and self._avatarBaseId > 0 then --是主角并且穿了变身卡
		local limit = AvatarDataHelper.getAvatarConfig(self._avatarBaseId).limit
		if limit == 1 then
			return require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
		end
	end
	return heroUnitData:getLimit_level()
end

-- TODO
function UserDetailData:getUserLeaderRedLimitLevel(heroUnitData)
	return 0
	-- if heroUnitData:isLeader() and self._avatarBaseId > 0 then --是主角并且穿了变身卡
	-- 	local limit = AvatarDataHelper.getAvatarConfig(self._avatarBaseId).limit
	-- 	if limit == 1 then
	-- 		return require("app.const.HeroConst").HERO_LIMIT_RED_MAX_LEVEL
	-- 	end
	-- end
	-- return heroUnitData:getLimit_level()
end

function UserDetailData:getAvatarId()
	return self._avatarId
end

function UserDetailData:getAvatarBaseId()
	return self._avatarBaseId
end

function UserDetailData:getName()
	return self._name
end

function UserDetailData:getLevel()
	return self._level
end

function UserDetailData:getOfficeLevel()
	return self._officeLevel
end

function UserDetailData:isKarmaActivated(karmaId)
	for i, id in ipairs(self._destiny) do
		if id == karmaId then
			return true
		end
	end
	return false
end

function UserDetailData:getHeroPos(unitData)
	local heroId = unitData:getId()
	for i, id in ipairs(self._formation) do
		if id == heroId then
			return i
		end
	end
	return nil
end

function UserDetailData:getEquipDatasWithPos(pos)
	local result = {}

	for i = 1, 4 do
		local data = self:getEquipData(pos, i)
		if data then
			table.insert(result, data)
		end
	end

	return result
end

function UserDetailData:getEquipInfoWithPos(pos)
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

function UserDetailData:isHaveEquipInPos(baseId, pos)
	local datas = self:getEquipDatasWithPos(pos)
	for i, data in ipairs(datas) do
		if data:getBase_id() == baseId then
			return true
		end
	end
	return false
end

function UserDetailData:getTreasureDatasWithPos(pos)
	local result = {}

	for i = 1, 2 do
		local data = self:getTreasureData(pos, i)
		if data then
			table.insert(result, data)
		end
	end

	return result
end

function UserDetailData:getTreasureInfoWithPos(pos)
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

function UserDetailData:getInstrumentDatasWithPos(pos)
	local result = {}

	for i = 1, 1 do
		local data = self:getInstrumentData(pos, i)
		if data then
			table.insert(result, data)
		end
	end

	return result
end

function UserDetailData:getInstrumentInfoWithPos(pos)
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

function UserDetailData:getHorseDatasWithPos(pos)
	local result = {}

	for i = 1, 1 do
		local data = self:getHorseData(pos, i)
		if data then
			table.insert(result, data)
		end
	end

	return result
end

function UserDetailData:isInBattle(unitData)
	for i, id in ipairs(self._formation) do
		if id == unitData:getId() then
			return true
		end
	end
	return false
end

function UserDetailData:isEquipAvatar()
	local avatarId = self:getAvatarId()
	return avatarId > 0
end

function UserDetailData:getAvatarUnitDataWithId(avatarId)
	local unitData = self._avatarList["k_" .. tostring(avatarId)]
	return unitData
end

function UserDetailData:isHaveAvatarWithBaseId(baseId)
	for k, unit in pairs(self._avatarList) do
		if unit:getBase_id() == baseId then
			return true
		end
	end
	return false
end

function UserDetailData:getOnTeamPetId()
	return self._onTeamPetId
end

function UserDetailData:getPetUnitDataWithId(id)
	local unitData = self._petList["k_" .. tostring(id)]
	return unitData
end

function UserDetailData:getProtectPetIds()
	local result = {}
	for i, petId in ipairs(self._protectPetIds) do
		if petId > 0 then
			table.insert(result, petId)
		end
	end
	return result
end

function UserDetailData:isPetHave(baseId)
	local avatarPhoto = self._activePhoto["k" .. ActivePhotoData.PET_TYPE] or {}
	for i, id in ipairs(avatarPhoto) do
		if id == baseId then
			return true
		end
	end
	return false
end

function UserDetailData:getHorseKarmaInfo()
	return self._activePhoto["k" .. ActivePhotoData.HORSE_TYPE] or {}
end

function UserDetailData:funcIsShow(funcId)
	local funcLevelInfo = require("app.config.function_level").get(funcId)
	assert(funcLevelInfo, "Invalid function_level can not find funcId " .. funcId)
	local UserCheck = require("app.utils.logic.UserCheck")
	if funcLevelInfo.show_level <= self._level then
		return true
	end
	return false
end

function UserDetailData:getAllOwnAvatarShowInfo()
	local result = {}
	local avatarPhoto = self._activePhoto["k" .. ActivePhotoData.AVATAR_TYPE] or {}
	for i, id in ipairs(avatarPhoto) do
		local info = AvatarDataHelper.getAvatarShowConfig(id)
		table.insert(result, info)
	end

	return result
end

function UserDetailData:getSilkbagIdWithPosAndIndex(pos, index)
	if self._silkbagPosTable[pos] == nil then
		return 0
	end

	local silkbagId = self._silkbagPosTable[pos][index] or 0
	return silkbagId
end

function UserDetailData:getSilkbagIdsOnTeamWithPos(pos)
	local result = {}
	local posTable = self._silkbagPosTable[pos] or {}
	for k, silkbagId in pairs(posTable) do
		if silkbagId > 0 then
			table.insert(result, silkbagId)
		end
	end

	return result
end

function UserDetailData:getSilkbagUnitDataWithId(id)
	local unitData = self._silkbags["k_" .. tostring(id)]

	return unitData
end

function UserDetailData:isInstrumentLevelMaxWithPos(pos)
	local datas = self:getInstrumentDatasWithPos(pos)
	local unitData = datas[1]

	if unitData then
		local level = unitData:getLevel()
		local maxLevel = unitData:getConfig().level_max
		if level >= maxLevel then
			return true
		end
	end

	return false
end

function UserDetailData:getHomeTree()
	return self._homeTree
end

function UserDetailData:funcIsOpened(funcId)
	local funcLevelInfo = require("app.config.function_level").get(funcId)
	assert(funcLevelInfo, "Invalid function_level can not find funcId " .. funcId)

	return self._level >= funcLevelInfo.level
end

function UserDetailData:funcIsShow(funcId)
	local funcLevelInfo = require("app.config.function_level").get(funcId)
	assert(funcLevelInfo, "Invalid function_level can not find funcId " .. funcId)

	return self._level >= funcLevelInfo.show_level
end

return UserDetailData
