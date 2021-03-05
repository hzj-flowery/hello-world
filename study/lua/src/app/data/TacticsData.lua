--
-- Author: Wangyu
-- Date: 2020年2月10日18:11:21
-- 战法数据
local BaseData = require("app.data.BaseData")
local TacticsData = class("TacticsData", BaseData)
local TacticsUnitData = require("app.data.TacticsUnitData")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")
local TacticsConst = require("app.const.TacticsConst")
local FunctionCheck = require("app.utils.logic.FunctionCheck")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

local schema = {}
TacticsData.schema = schema

function TacticsData:ctor(properties)
	TacticsData.super.ctor(self, properties)
	self._suitInfo = {} 				-- 适用武将信息 key为baseId，vaue为适用武将id列表、适用武将描述信息和适用类型
	self._tacticsUnits = {} 			-- 战法数据列表 列表项为TacticsUnitData，tactics表的limit字段，定义了此战法被激活和装备的次数，所以同样baseId可能有多个TacticsUnitData
	self._tacticsIdMap = {} 			-- 战法Id映射关系表 key为战法uid，value为战法数据列表的索引
	self._tacticsUnlockInfo = {} 		-- 战法解锁信息

	self._recvGetTacticsList = G_NetworkManager:add(MessageIDConst.ID_S2C_GetTacticsInfo, handler(self, self._s2cGetTacticsList)) 					-- 获取战法列表
	self._recvUnlockTacticsPos = G_NetworkManager:add(MessageIDConst.ID_S2C_UnlockHeroTacticsPos, handler(self, self._s2cUnlockTacticsPos)) 		-- 武将战法位激活
	self._recvCreateTactics = G_NetworkManager:add(MessageIDConst.ID_S2C_CreateTactics, handler(self, self._s2cCreateTactics)) 						-- 战法解锁
	self._recvPutOnTactics = G_NetworkManager:add(MessageIDConst.ID_S2C_AddHeroTactics, handler(self, self._s2cPutOnTactics)) 						-- 武将装备战法
	self._recvPutDownTactics = G_NetworkManager:add(MessageIDConst.ID_S2C_ClearHeroTactics, handler(self, self._s2cPutDownTactics)) 				-- 武将卸载战法
	self._recvAddTacticsPro = G_NetworkManager:add(MessageIDConst.ID_S2C_AddTracticsProficiency, handler(self, self._s2cAddTacticsPro)) 			-- 增加战法熟练度
	self._recvGetFromationTactics = G_NetworkManager:add(MessageIDConst.ID_S2C_GetFormationTactics, handler(self, self._s2cGetFromationTactics)) 	-- 获取阵容英雄战法详情

	self:_initData()
end

function TacticsData:clear()
	self._recvGetTacticsList:remove()
	self._recvGetTacticsList = nil
	self._recvUnlockTacticsPos:remove()
	self._recvUnlockTacticsPos = nil
	self._recvCreateTactics:remove()
	self._recvCreateTactics = nil
	self._recvPutOnTactics:remove()
	self._recvPutOnTactics = nil
	self._recvPutDownTactics:remove()
	self._recvPutDownTactics = nil
	self._recvAddTacticsPro:remove()
	self._recvAddTacticsPro = nil
	self._recvGetFromationTactics:remove()
	self._recvGetFromationTactics = nil
end

function TacticsData:reset()
	self._suitInfo = {}
	self._tacticsUnits = {}
	self._tacticsIdMap = {}
end

function TacticsData:_initData()
	self:_initSuitableHeroIds()
	self:_initUnitData()
end

-- 初始化适用武将列表
function TacticsData:_initSuitableHeroIds()
	local suitInfo = TacticsDataHelper.getTacticsSuitInfo()
	self._suitInfo = suitInfo
end

-- 初始化战法数据列表和战法id映射关系表
function TacticsData:_initUnitData()
	self._tacticsUnits = {}
	local tacticsConfig = require("app.config.tactics")
	local len = tacticsConfig.length()
	for i = 1, len do
		local tacticsInfo = tacticsConfig.indexOf(i)
		if tacticsInfo.gm>0 then
			local baseId = tacticsInfo.id
			for j = 1, tacticsInfo.limit do
				local unitData = TacticsUnitData.new()
				unitData:resetWithDefault(baseId)
				table.insert(self._tacticsUnits, unitData)
			end
		end
	end

	self._tacticsIdMap = {}
end


-- 判断战法是否适用武将
function TacticsData:isSuitTacticsToHero(tacticsId, heroBaseId)
	local suitInfo = self._suitInfo[tacticsId]
	if suitInfo.suitType==TacticsConst.SUIT_TYPE_NONE then
		for i,heroId in ipairs(suitInfo.heroIds) do
			if heroId==heroBaseId then
				return true
			end
		end
	else
		local heroInfo = HeroDataHelper.getHeroConfig(heroBaseId)
		if suitInfo.suitType == TacticsConst.SUIT_TYPE_ALL then --全武将
			return true
		elseif suitInfo.suitType == TacticsConst.SUIT_TYPE_MALE then --男武将
			if heroInfo.gender==1 and (heroInfo.type==1 or heroInfo.color>=4) then
				return true
			end
		elseif suitInfo.suitType == TacticsConst.SUIT_TYPE_FEMALE then --女武将
			if heroInfo.gender==2 and (heroInfo.type==1 or heroInfo.color>=4) then
				return true
			end
		elseif suitInfo.suitType == TacticsConst.SUIT_TYPE_JOINT then 	-- 合击武将
			if heroInfo.type==2 and heroInfo.skill_3_type~=0 and heroInfo.color>=4 then
				return true
			end
		end
	end
	return false
end

--判断是否有没穿戴的战法，且装备pos符合要求（红点机制）
function TacticsData:isHaveTacticsNotInPos(pos, slot)
	local heroUID = G_UserData:getTeam():getHeroIdWithPos(pos)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroUID)

	for uid,index in pairs(self._tacticsIdMap) do
		local unitData = self._tacticsUnits[index]
		if unitData:isCanWear() and unitData:getHero_id()==0 then
			-- 适合武将
			local isSuitHero = self:isSuitTacticsToHero(unitData:getBase_id(), heroUnitData:getAvatarToHeroBaseId())
			if isSuitHero and unitData:isCanWearWithPos(pos) then
				return true
			end
		end
	end
	return false
end

--判断是否有更好的战法（红点机制）
function TacticsData:isHaveBetterTactics(pos, slot)
    local function isBetter(a, b) --retrun true: a比b好
        local colorA = a:getConfig().color
        local colorB = b:getConfig().color

        if colorA ~= colorB then
            return colorA > colorB
        end
    end

    local tacticsId = G_UserData:getBattleResource():getResourceId(pos, 5, slot)
    if not tacticsId then
        return false
    end

    local unitData = self:getUnitDataWithId(tacticsId)
    if not unitData then
        return false
    end

    for k, unit in pairs(self._tacticsUnits) do
		-- 未装备
		if unit:isCanWear() and isBetter(unit, unitData) and unit:getHero_id()==0 then
			-- 适合武将
			local heroUID = G_UserData:getTeam():getHeroIdWithPos(pos)
			local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroUID)
			local isSuitHero = self:isSuitTacticsToHero(unit:getBase_id(), heroUnitData:getAvatarToHeroBaseId())
			if isSuitHero then
				if unit:isCanWearWithPos(pos, slot) then
					return true
				end
			end
		end
    end
    return false
end

-- 根据id获取适用武将信息
function TacticsData:getSuitInfoWithTacticsId(tacticsId)
	local heroIds = {}
	local limitStrs = {}
	local suitType = TacticsConst.SUIT_TYPE_NONE
	local info = self._suitInfo[tacticsId]
	if info then
		heroIds = info.heroIds
		limitStrs = info.limitStrs
		suitType = info.suitType
	end
	return heroIds, limitStrs, suitType
end

-- 获取战法列表
-- @param pos 武将阵位
-- @param isWeared 是否穿戴
-- @return unitData列表
function TacticsData:getTacticsListByPos(heroPos, pos)
	local function sortFunc(a, b)
		if a.wearedSort ~= b.wearedSort then
			return a.wearedSort > b.wearedSort
		elseif a.suitSort ~= b.suitSort then
			return a.suitSort > b.suitSort
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getBase_id() ~= b:getBase_id() then
			return a:getBase_id() < b:getBase_id()
		else
			return a:getId() < b:getId()
		end
	end

	local heroId = G_UserData:getTeam():getHeroIdWithPos(heroPos)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
	local tmp = self:getTacticsList(TacticsConst.GET_LIST_TYPE_STUDIED)
	local list = {}
	for i, data in ipairs(tmp) do
		local baseId = data:getBase_id()
		local isEffect = self:isSuitTacticsToHero(baseId, heroBaseId)
		local isCanWear = data:isCanWearWithPos(heroPos, pos)
		local isEffective = require("app.utils.data.TacticsDataHelper").isEffectiveTacticsToHero(baseId, heroPos)
		local isWeared = data:getHero_id()==heroUnitData:getId() 		-- 是否已经装配了，主角更换变身卡可能导致已装备的战法失效
		local isSuit = isEffect and isCanWear and isEffective
		if isSuit or isWeared then
			local cloneData = clone(data)
			cloneData.suitSort = isSuit and 1 or 0
			if data:getHero_id()==heroId then
				cloneData.wearedSort = 1
			else
				cloneData.wearedSort = data:getHero_id()>0 and -1 or 0
			end
			table.insert(list, cloneData)
		end
	end

	table.sort(list, sortFunc)

	local result = {}
	for i, data in ipairs(list) do
		table.insert(result, data:getId())
	end

	return result
end

-- 获取战法列表
-- @param getType 获取类型 color 颜色
-- @return unitData列表
function TacticsData:getTacticsList(getType, color)
	local function sortFunc(a, b)
		if a.suitSort ~= b.suitSort then
			return a.suitSort > b.suitSort
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		elseif a:getBase_id() ~= b:getBase_id() then
			return a:getBase_id() < b:getBase_id()
		else
			return a:getId() < b:getId()
		end
	end

	local list = {}
	if getType==TacticsConst.GET_LIST_TYPE_STUDIED then 		-- 研习满了可以穿戴的
		for uid,index in pairs(self._tacticsIdMap) do
			local unitData = self._tacticsUnits[index]
			if unitData:isCanWear() then
				table.insert(list, unitData)
			end
		end
	elseif getType==TacticsConst.GET_LIST_TYPE_UNLCOK then 		-- 已解锁的
		for uid,index in pairs(self._tacticsIdMap) do
			local unitData = self._tacticsUnits[index]
			table.insert(list, unitData)
		end
	else
		for index,unitData in pairs(self._tacticsUnits) do 		-- 所有可以显示的
			if unitData:isShow() then
				table.insert(list, unitData)
			end
		end
	end

	local res = {}
	if color~=nil then
		for i,v in ipairs(list) do
			if color==v:getConfig().color then
				table.insert(res, v)
			end
		end
	else
		res = list
	end
	
	table.sort(res, sortFunc)
	return res
end

function TacticsData:getUnlockInfoByPos(pos)
	local result = self._tacticsUnlockInfo[pos] or {}
	return result
end

-- 获取武将战法位状态
-- @param heroId
-- @return 列表项 是否开放，是否激活，穿戴的战法数据
function TacticsData:getHeroTacticsPosState(heroId)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local pos = heroUnitData:getPos()
	local posList = self:getUnlockInfoByPos(pos)
	local list = {}
	for slot = 1, TacticsConst.MAX_POSITION do
		local isOpen = FunctionCheck.funcIsOpened(FunctionConst["FUNC_TACTICS_POS"..slot])
		local item = {isOpen=isOpen, isUnlocked=false, tacticsUnitData=nil}
		table.insert(list, item)
	end
	for uid,index in pairs(self._tacticsIdMap) do
		local unitData = self._tacticsUnits[index]
		local heroData = unitData:getHeroDataOfWeared()
		if heroData:getId()==heroUnitData:getId() then
			local pos = unitData:getPos()
			list[pos].tacticsUnitData = unitData
			list[pos].isUnlocked = true
		end
	end
	for _,pos in pairs(posList) do
		list[pos].isUnlocked = true
	end
	return list
end

function TacticsData:_setTacticsData(data)
	local id = data.tactics_id
	local baseId = data.tactics_type
	local index = 0
	if self._tacticsIdMap[id] then
		index = self._tacticsIdMap[id]
	else
		for i, unitData in ipairs(self._tacticsUnits) do
			if unitData:getBase_id()==baseId then 	-- baseId相同
				if unitData:getId()>0 and unitData:getId()~=id then 		-- 相同baseId只会有一个数据，有数据再下发不处理
					return
				end
				index = i
				break
			end
		end
	end
	if index~=0 then 	-- 未找到不处理
		self._tacticsIdMap[id] = index
		self._tacticsUnits[index]:updateData(data)
	end
end

function TacticsData:_updateUnlockInfo(info)
	local list = {}
	for i,v in ipairs(info) do
		local pos = rawget(v, "pos")
		local slots = rawget(v, "slots")
		if pos then
			list[pos] = slots
		end
	end
	self._tacticsUnlockInfo = list
end

function TacticsData:_insertUnlockInfo(pos, slot)
	if pos ~= 0 then
		local list = self._tacticsUnlockInfo[pos] or {}
		table.insert( list, slot )
		self._tacticsUnlockInfo[pos] = list
	end
end

function TacticsData:updateData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
    for i = 1, #data do
    	self:_setTacticsData(data[i])
    end
end

function TacticsData:insertData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
    for i = 1, #data do
    	self:_setTacticsData(data[i])
    end
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TACTICS)
end

function TacticsData:deleteData(data)
	if data == nil or type(data) ~= "table" then
		return
	end
    for i = 1, #data do
		local id = data[i]
		local index = self._tacticsIdMap[id]
		local unitData = self._tacticsUnits[index]
		if unitData ~= nil then
			unitData:resetWithDefault(unitData:getBase_id())
		end
		self._tacticsIdMap[id] = nil
    end
end

function TacticsData:getUnitDataWithId(id)
	local index = self._tacticsIdMap[id]
	assert(index, string.format("TacticsData:getUnitDataWithId is Wrong, index, id = %d", id))
	local unitData = self._tacticsUnits[index]
	assert(unitData, string.format("TacticsData:getUnitDataWithId is Wrong, unitData, id = %d", id))
	return unitData
end

function TacticsData:getUnitDataWithBaseId(baseId)
	for i,unitData in ipairs(self._tacticsUnits) do
		if unitData:getBase_id()==baseId then
			return unitData
		end
	end
	return nil
end

function TacticsData:getTacticsCount()
	local count = table.nums(self._tacticsIdMap)
	return count
end

function TacticsData:getCountWithBaseId(baseId)
	local count = 0
	for i, unitData in pairs(self._tacticsUnits) do
		if unitData:getBase_id() == baseId then
			count = count + 1
		end
	end
	return count
end

function TacticsData:getListNoWeared()
	local result = {}
	for _, index in pairs(self._tacticsIdMap) do
		local unitData = self._tacticsUnits[index]
		if unitData:isCanWear() and not unitData:isWeared() then
			table.insert(result, unitData)
		end
	end
	return result
end

-- 根据阵位获取unitData列表
function TacticsData:getUnitDataListWithPos(pos)
	local result = {}
	if pos == nil or pos == 0 then
		return result
	end
	local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
	for _, index in pairs(self._tacticsIdMap) do
		local unitData = self._tacticsUnits[index]
		if unitData:getHero_id()==heroId then
			table.insert(result, unitData)
		end
	end
	return result
end

-- 获取可解锁的列表
function TacticsData:getCanUnlockList(color)
	local result = {}
	for _, unitData in pairs(self._tacticsUnits) do
		if (color==nil or color==unitData:getConfig().color) and unitData:isCanUnlock() then
			table.insert(result, unitData)
		end
	end
	return result
end

--=========================================================================================
-- 获取战法列表
function TacticsData:c2sGetTacticsList()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetTacticsInfo, {})
end

function TacticsData:_s2cGetTacticsList(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:updateData(message.tacticsInfo)
	self:_updateUnlockInfo(message.tactics_pos)
	G_SignalManager:dispatch(SignalConst.EVENT_TACTICS_GETLIST, message)
end

-- 战法解锁
function TacticsData:c2sCreateTactics(tacticsId, materials)
	G_NetworkManager:send(MessageIDConst.ID_C2S_CreateTactics, {
		tactics_type = tacticsId,
		materials_id = materials
	})
end

function TacticsData:_s2cCreateTactics(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	for i,v in ipairs(message.tacticsInfo) do
		self:_setTacticsData(v)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_TACTICS_CREATE, message)
end

-- 增加战法熟练度
function TacticsData:c2sAddTacticsPro(tacticsUId, materials)
	G_NetworkManager:send(MessageIDConst.ID_C2S_AddTracticsProficiency, {
		tactics_id = tacticsUId,
		materials_id = materials
	})
end

function TacticsData:_s2cAddTacticsPro(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	for i,v in ipairs(message.tacticsInfo) do
		self:_setTacticsData(v)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_TACTICS_ADD_PROFICIENCY, message)
end

-- 武将战法位激活
function TacticsData:c2sUnlockTacticsPos(pos, slot, materials)
	G_NetworkManager:send(MessageIDConst.ID_C2S_UnlockHeroTacticsPos, {
		format_pos = pos,
		pos = slot,
		materials_id = materials
	})
end

function TacticsData:_s2cUnlockTacticsPos(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local pos = rawget(message, "format_pos") or 0
	local slot = rawget(message, "pos")
	self:_insertUnlockInfo(pos, slot)
	G_SignalManager:dispatch(SignalConst.EVENT_TACTICS_UNLOCK_POSITION, pos, slot)
end

-- 武将装备战法
function TacticsData:c2sPutOnTactics(tacticsUId, heroId, pos)
	G_NetworkManager:send(MessageIDConst.ID_C2S_AddHeroTactics, {
		tactics_id = tacticsUId,
		hero_id = heroId,
		pos = pos
	})
end

function TacticsData:_s2cPutOnTactics(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local id = rawget(message, "new_tactics_id")
	assert(id, "_s2cPutOnTactics, message.id = nil")

	local heroId = rawget(message, "hero_id")
	assert(heroId, "_s2cPutOnTactics, message.hero_id = nil")
	local pos = G_UserData:getHero():getUnitDataWithId(heroId):getPos()

	local slot = rawget(message, "pos")
	assert(slot, "_s2cPutOnTactics, message.pos = nil")

	local oldId = rawget(message, "old_tactics_id") or 0
	local oldHeroId = rawget(message, "old_hero_id") or 0
	local oldPos = 0
	if oldHeroId>0 then
		oldPos = G_UserData:getHero():getUnitDataWithId(oldHeroId):getPos()
	end
	local oldSlot = rawget(message, "old_pos") or 0

	local tacticsUnitData = G_UserData:getTactics():getUnitDataWithId(id)
	tacticsUnitData:setHero_id(heroId)
	tacticsUnitData:setPos(slot)

	G_UserData:getBattleResource():setTacticsPosTable(pos, slot, id, oldId, oldPos, oldSlot)

	G_SignalManager:dispatch(SignalConst.EVENT_TACTICS_ADD_SUCCESS, id, pos, slot)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TACTICS)
end

-- 武将卸载战法
function TacticsData:c2sPutDownTactics(tacticsUId, heroId, pos)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ClearHeroTactics, {
		tactics_id = tacticsUId,
		hero_id = heroId,
		pos = pos
	})
end

function TacticsData:_s2cPutDownTactics(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local heroId = rawget(message, "hero_id") or 0
	local pos = 0
	if heroId>0 then
		pos = G_UserData:getHero():getUnitDataWithId(heroId):getPos()
	end

	local slot = rawget(message, "pos") or 0
	local oldId = rawget(message, "tactics_id") or 0
	
	local tacticsUnitData = G_UserData:getTactics():getUnitDataWithId(oldId)
	tacticsUnitData:setHero_id(0)
	tacticsUnitData:setPos(0)

	G_UserData:getBattleResource():clearTacticsPosTable(pos, slot, oldId)

	G_SignalManager:dispatch(SignalConst.EVENT_TACTICS_REMOVE_SUCCESS, oldId, pos, slot)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TACTICS)
end

-- 获取阵容英雄战法详情
function TacticsData:c2sGetFromationTactics()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetFormationTactics, {})
end

function TacticsData:_s2cGetFromationTactics(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local formationTactics = rawget(message, "formation_tactics")
	G_SignalManager:dispatch(SignalConst.EVENT_TACTICS_GET_FORMATION, message)
end

return TacticsData
