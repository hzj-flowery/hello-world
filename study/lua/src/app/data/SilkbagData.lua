--
-- Author: Liangxu
-- Date: 2018-3-1 17:07:09
-- 锦囊数据
local BaseData = require("app.data.BaseData")
local SilkbagData = class("SilkbagData", BaseData)
local SilkbagUnitData = require("app.data.SilkbagUnitData")
local SilkbagDataHelper = require("app.utils.data.SilkbagDataHelper")
local SilkbagConst = require("app.const.SilkbagConst")

local schema = {}
SilkbagData.schema = schema

function SilkbagData:ctor(properties)
	SilkbagData.super.ctor(self, properties)
	self._silkbagList = {}
	self._applicableHeros = {} --适用武将 表

	self._recvGetSilkbag = G_NetworkManager:add(MessageIDConst.ID_S2C_GetSilkbag, handler(self, self._s2cGetSilkbag))
	self._recvEquipSilkbag = G_NetworkManager:add(MessageIDConst.ID_S2C_EquipSilkbag, handler(self, self._s2cEquipSilkbag))

	self:_initApplicableHeroIds()
end

function SilkbagData:clear()
	self._recvGetSilkbag:remove()
	self._recvGetSilkbag = nil
	self._recvEquipSilkbag:remove()
	self._recvEquipSilkbag = nil
end

function SilkbagData:reset()
	self._silkbagList = {}
	self._applicableHeros = {}
end

function SilkbagData:_initApplicableHeroIds()
	local silkbagConfig = require("app.config.silkbag")
	local len = silkbagConfig.length()
	for i = 1, len do
		local silkbagInfo = silkbagConfig.indexOf(i)
		local strHero = silkbagInfo.hero
		local heroIds = {}
		local suitType = SilkbagConst.SUIT_TYPE_NONE
		if strHero ~= "0" and strHero ~= "" then
			if strHero == tostring(SilkbagConst.ALL_HERO_ID) then --全武将
				suitType = SilkbagConst.SUIT_TYPE_ALL
				local heroConfig = require("app.config.hero")
				local len = heroConfig.length()
				for i = 1, len do
					local info = heroConfig.indexOf(i)
					if info.type == 1 then --主角
						table.insert(heroIds, info.id)
					elseif info.type == 2 and info.color >= 4 then --品质筛选武将
						table.insert(heroIds, info.id)
					end
				end
			elseif strHero == tostring(SilkbagConst.ALL_MALE_ID) then --男武将
				suitType = SilkbagConst.SUIT_TYPE_MALE
				local heroConfig = require("app.config.hero")
				local len = heroConfig.length()
				for i = 1, len do
					local info = heroConfig.indexOf(i)
					if info.type == 1 and info.gender == 1 then --男主角
						table.insert(heroIds, info.id)
					elseif info.type == 2 and info.gender == 1 and info.color >= 4 then --品质筛选男武将
						table.insert(heroIds, info.id)
					end
				end
			elseif strHero == tostring(SilkbagConst.ALL_FEMALE_ID) then --男武将
				suitType = SilkbagConst.SUIT_TYPE_FEMALE
				local heroConfig = require("app.config.hero")
				local len = heroConfig.length()
				for i = 1, len do
					local info = heroConfig.indexOf(i)
					if info.type == 1 and info.gender == 2 then --女主角
						table.insert(heroIds, info.id)
					elseif info.type == 2 and info.gender == 2 and info.color >= 4 then --品质筛选女武将
						table.insert(heroIds, info.id)
					end
				end
			else
				suitType = SilkbagConst.SUIT_TYPE_NONE
				local ids = string.split(strHero, "|")
				for i, id in ipairs(ids) do
					table.insert(heroIds, tonumber(id))
				end
			end
		end
		self._applicableHeros[silkbagInfo.id] = {heroIds = heroIds, suitType = suitType}
	end
end

function SilkbagData:getHeroIdsWithSilkbagId(silkbagId)
	local heroIds = {}
	local suitType = SilkbagConst.SUIT_TYPE_NONE
	local info = self._applicableHeros[silkbagId]
	if info then
		heroIds = info.heroIds
		suitType = info.suitType
	end
	return heroIds, suitType
end

function SilkbagData:_s2cGetSilkbag(id, message)
	self._silkbagList = {}
	local silkbagList = rawget(message, "silkbags") or {}

	for i, data in ipairs(silkbagList) do
		self:_setSilkbagData(data)
	end
end

function SilkbagData:_setSilkbagData(data)
	self._silkbagList["k_"..tostring(data.id)] = nil
	local unitData = SilkbagUnitData.new()
	unitData:updateData(data)
	self._silkbagList["k_"..tostring(data.id)] = unitData
end

function SilkbagData:updateData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._silkbagList == nil then
        return
    end
    for i = 1, #data do
    	self:_setSilkbagData(data[i])
    end
end

function SilkbagData:insertData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._silkbagList == nil then
        return
    end
    for i = 1, #data do
    	self:_setSilkbagData(data[i])
    end
end

function SilkbagData:deleteData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
	if self._silkbagList == nil then
        return
    end
    for i = 1, #data do
    	local id = data[i]
    	self._silkbagList["k_"..tostring(id)] = nil
    end
end

function SilkbagData:getUnitDataWithId(id)
	local unitData = self._silkbagList["k_"..tostring(id)]
	assert(unitData, string.format("SilkbagData:getUnitDataWithId is Wrong, id = %d", id))

	return unitData
end

function SilkbagData:getSilkbagCount()
	local count = 0
	for k, data in pairs(self._silkbagList) do
		count = count + 1
	end
	return count
end

function SilkbagData:getCountWithBaseId(baseId)
	local count = 0
	for k, data in pairs(self._silkbagList) do
		if data:getBase_id() == baseId then
			count = count + 1
		end
	end
	return count
end

function SilkbagData:getListBySort(heroBaseId, heroRank, isInstrumentMaxLevel, curPos, isWeard, heroLimit, heroRedLimit)
	local function sortFunc(a, b)
		if a.suitSort ~= b.suitSort then
			return a.suitSort > b.suitSort
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local temp = {}
	for k, data in pairs(self._silkbagList) do
		local cloneData = clone(data)
		if isWeard == cloneData:isWeared() then
			if not cloneData:isWearedInPos(curPos) then
				local baseId = cloneData:getBase_id()
				local isEffect = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank,
					isInstrumentMaxLevel, heroLimit, heroRedLimit)
				local isCanWear = cloneData:isCanWearWithPos(curPos)
				local isSuit = isEffect and isCanWear
				cloneData.suitSort = isSuit and 1 or 0
				table.insert(temp, cloneData)
			end
		end
	end
	table.sort(temp, sortFunc)

	local result = {}
	for i, data in ipairs(temp) do
		table.insert(result, data:getId())
	end

	return result
end

function SilkbagData:getListDataOfSell()
	local function sortFuncForSell(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		if colorA ~= colorB then
			return colorA < colorB
		else
			return a:getBase_id() < b:getBase_id()
		end
	end
	local result = {}
	for k, data in pairs(self._silkbagList) do

		if  data:canBeSold() then
			table.insert(result, data)
		end
	end
	table.sort(result, sortFuncForSell)
	return result
end

function SilkbagData:getListDataOfPackage(isSortForSell)
	local function sortFunc(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		if a.wearedSort ~= b.wearedSort then
			return a.wearedSort > b.wearedSort
		elseif colorA ~= colorB then
			return colorA > colorB
		elseif a:getConfig().order ~= b:getConfig().order then
			return a:getConfig().order < b:getConfig().order
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local result = {}
	for k, data in pairs(self._silkbagList) do
		local wearedSort = data:isWeared() and 1 or 0
		data.wearedSort = wearedSort
		table.insert(result, data)
	end
	table.sort(result, sortFunc)
	return result
end

function SilkbagData:getListNoWeared()
	local result = {}
	for k, data in pairs(self._silkbagList) do
		if not data:isWeared() then
			table.insert(result, data)
		end
	end
	return result
end

--是否有锦囊
function SilkbagData:isHaveSilkbag()
	local count = 0
	for k, data in pairs(self._silkbagList) do
		count = count + 1
	end
	return count > 0
end

function SilkbagData:isHaveRedPoint(pos, slot)
	local isOpen = require("app.utils.logic.FunctionCheck").funcIsOpened(FunctionConst["FUNC_SILKBAG_SLOT"..slot])
    if not isOpen then
        return false
    end

    if pos < 1 or pos > 6 then --非武将位
    	return false
    end

	local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
	local heroRank = heroUnitData:getRank_lv()
	local isInstrumentMaxLevel = G_UserData:getInstrument():isInstrumentLevelMaxWithPos(pos)
	local heroLimit = heroUnitData:getLeaderLimitLevel()
	local heroRedLimit = heroUnitData:getLeaderLimitRedLevel()
	local unitData = nil
	local silkbagId = G_UserData:getSilkbagOnTeam():getIdWithPosAndIndex(pos, slot)
	if silkbagId > 0 then
		unitData = self:getUnitDataWithId(silkbagId)
	end
	for k, data in pairs(self._silkbagList) do
		if not data:isWeared() and data:isCanWearWithPos(pos) then
			local isEffective = SilkbagDataHelper.isEffectiveSilkBagToHero(data:getBase_id(), heroBaseId, heroRank,
				isInstrumentMaxLevel, heroLimit, heroRedLimit)
			if not unitData then --位置上没有锦囊
				if isEffective then
					return true
				end
			else
				if isEffective and data:getConfig().color > unitData:getConfig().color then --位置上有锦囊，有效的且更好品质的，提示红点
					return true
				end
			end
		end
	end
	return false
end

--=========================================================================================
--穿戴锦囊
function SilkbagData:c2sEquipSilkbag(pos, index, silkbagId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_EquipSilkbag, {
		pos = pos,
		index = index,
		silkbag_id = silkbagId,
	})
end

function SilkbagData:_s2cEquipSilkbag(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local pos = rawget(message, "pos")
	local index = rawget(message, "index")
	local silkbagId = rawget(message, "silkbag_id")
	G_SignalManager:dispatch(SignalConst.EVENT_SILKBAG_EQUIP_SUCCESS, pos, index, silkbagId)
end

return SilkbagData
