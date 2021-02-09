-- Author: conley
-- Date:2018-11-23 17:08:13
-- Rebuilt By Panhoa

local BaseData = require("app.data.BaseData")
local HistoryHeroData = class("HistoryHeroData", BaseData)
local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")

local schema = {}
schema["heroList"]				= {"table", {} }	-- 名将列表Id
schema["systemIdList"]			= {"table", {} }	-- 名将列表system_Id
schema["historyHeroIds"] 		= {"table", {} }	-- 名将阵容
schema["activatedBookIds"]		= {"table", {} }	-- 已经激活的图鉴ID
schema["weaponList"]			= {"table", {} }	-- 武器列表
schema["heroBook"]				= {"table", {} }	-- 名将图鉴

HistoryHeroData.schema = schema
function HistoryHeroData:ctor(properties)
	HistoryHeroData.super.ctor(self, properties)
	self._typeTab = 1
	self._s2cGetStarsListener 			= G_NetworkManager:add(MessageIDConst.ID_S2C_GetStars, handler(self, self._s2cGetStars))					-- 名将
	self._s2cGetWeaponListener 			= G_NetworkManager:add(MessageIDConst.ID_S2C_GetStarWeapon, handler(self, self._s2cGetWeapon))				-- 武器
	self._s2cStarBreakThroughListener 	= G_NetworkManager:add(MessageIDConst.ID_S2C_StarBreakThrough, handler(self, self._s2cStarBreakThrough))	-- 突破
	self._s2cStarEquipListener 			= G_NetworkManager:add(MessageIDConst.ID_S2C_StarEquip, handler(self, self._s2cStarEquip))					-- 装备/更换/卸下
	self._s2cStarRebornListener 		= G_NetworkManager:add(MessageIDConst.ID_S2C_StarReborn, handler(self, self._s2cStarReborn))				-- 重生
	self._s2cStarCollectionListener 	= G_NetworkManager:add(MessageIDConst.ID_S2C_StarCollection, handler(self, self._s2cStarCollection))		-- 激活图鉴
	self._s2cGetStarCollectionListener 	= G_NetworkManager:add(MessageIDConst.ID_S2C_GetStarCollection, handler(self, self._s2cGetStarCollection))	-- 获取图鉴信息
	self._s2cGetStarFormationListener 	= G_NetworkManager:add(MessageIDConst.ID_S2C_GetStarFormation, handler(self, self._s2cGetStarFormation))	-- 名将阵容
	self._s2cStarBreakDowncListener 	= G_NetworkManager:add(MessageIDConst.ID_S2C_StarBreakDown, handler(self, self._s2cStarBreakDown))			-- 名将降级
end

function HistoryHeroData:reset()
end

--------------------------------------------------------------------
-- @Role 	获取历代名将
function HistoryHeroData:_s2cGetStars(id, message)
	self:resetTime()
	local stars = rawget(message,"stars") or {}
	
	local data = {}
	self:setHeroList(data)
    for k,v in ipairs(stars) do
        self:_createHeroUnitData(v)
	end
	
	local formationList = {}
	local formationIdList = self:getHistoryHeroIds()
	for k, v in pairs(formationIdList) do
		if v and v ~= 0 then
			formationList["k"..v] = self:getHisoricalHeroValueById(v)
		else
			formationList["k"..v] = nil
		end
	end

	self:setHeroBook(HistoryHeroDataHelper.getHistoryHeroBookInfo())
end

-- @Role
function HistoryHeroData:_createHeroUnitData(v)
	local HistoryHeroUnit = require("app.data.HistoryHeroUnit")
	local unit = HistoryHeroUnit.new()
	unit:initData(v)
	unit:updateSystemId(v.system_id)
	local list = self:getHeroList()
	local idx = self:getHisoricalHeroKeyById(unit:getId())
	if idx > 0 then
		list[idx] = unit
	elseif idx == 0 then
		table.insert(list, unit)
	end

	table.sort(list, function(item1, item2)
		if item1:getSystem_id() == item2:getSystem_id() then
			return item1:getBreak_through() > item2:getBreak_through()
		else
			return item1:getSystem_id() < item2:getSystem_id()
		end
	end)
	return unit
end

---------------------------------------------------------------------
-- @Role 	获取名将阵容
function HistoryHeroData:_s2cGetStarFormation(id, message)
	local formationList = {}
	for k, v in pairs(message.id) do
		formationList["k"..v] = self:getHisoricalHeroValueById(v)
	end
	self:setHistoryHeroIds(rawget(message, "id") or {})
	self:getSystemIds()
	G_SignalManager:dispatch(SignalConst.EVENT_HISTORY_HERO_FORMATIONUPDATE, message)
end

---------------------------------------------------------------------
-- @Role 	Require awake/break 觉醒/突破
-- id:名将
-- idx:装备坑位123 0表示觉醒 或者 突破
-- star_id：消耗材料id
function HistoryHeroData:c2sStarBreakThrough(id, idx, star_id)
	  G_NetworkManager:send(MessageIDConst.ID_C2S_StarBreakThrough,  {id = id, idx = idx, star_id = star_id})	
end

-- @Role 	Response BreakThrough
function HistoryHeroData:_s2cStarBreakThrough(id, message)
  	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    G_SignalManager:dispatch(SignalConst.EVENT_HISTORY_HERO_BREAK_THROUGH_SUCCESS, message)
end

---------------------------------------------------------------------
-- @Role 	名将降级
-- id:名将
-- idx:0：装备卸下，名将坑位123卸下
function HistoryHeroData:c2sStarBreakDown(id, idx)
	G_NetworkManager:send(MessageIDConst.ID_C2S_StarBreakDown,  {id = id, idx = idx})	
end

-- @Role 	名将降级
function HistoryHeroData:_s2cStarBreakDown(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    G_SignalManager:dispatch(SignalConst.EVENT_HISTORY_HERO_DOWN_SUCCESS, message)
end

----------------------------------------------------------------------
-- @Role 	Require Eqiup 装备
-- @Param	id  	下阵id传0
-- @Param	idx  	从0开始
function HistoryHeroData:c2sStarEquip(id,idx)
	  G_NetworkManager:send(MessageIDConst.ID_C2S_StarEquip,  {id = id,idx = idx})
end

-- @Role 	Response Equip
function HistoryHeroData:_s2cStarEquip(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_HISTORY_HERO_EQUIP_SUCCESS, message)
end

------------------------------------------------------------------------
-- @Role 	Require Reborn 重生
function HistoryHeroData:c2sStarReborn(id)
	  G_NetworkManager:send(MessageIDConst.ID_C2S_StarReborn,  {id = id})
end

-- @Rolee 	Response Reborn
function HistoryHeroData:_s2cStarReborn(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_HISTORY_HERO_REBORN_SUCCESS, awards)
end

-----------------------------------------------------------------------
-- @Role 	Require active 激活图鉴
function HistoryHeroData:c2sStarCollection(id)
	  G_NetworkManager:send(MessageIDConst.ID_C2S_StarCollection,  {id = id})
end

-- @Role 	Response active
function HistoryHeroData:_s2cStarCollection(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
end

-------------------------------------------------------------------------
-- @Role 	Response 获取已激活图鉴信息
function HistoryHeroData:_s2cGetStarCollection(id, message)
	local ids = rawget(message,"ids") or {}
	local idList = {}
	for k,v in ipairs(ids) do
		table.insert(idList,v)
	end
	self:setActivatedBookIds(idList)
	G_SignalManager:dispatch(SignalConst.EVENT_HISTORY_HERO_ACTIVATE_BOOK_SUCCESS)
end

-------------------------------------------------------------------------
function HistoryHeroData:setDetailTabType(type)
	self._typeTab = type
end

function HistoryHeroData:getDetailTabType()
	return self._typeTab
end

-------------------------------------------------------------------------
-- 名将
-- @Export 		Update Obj
function HistoryHeroData:updateData(v)
	if v == nil or type(v) ~= "table" then
		return
	end
	for key, value in pairs(v) do
		self:_createHeroUnitData(value)
	end
end

-- @Export 		Create/Insert Obj
function HistoryHeroData:insertData(v)
	if v == nil or type(v) ~= "table" then
		return
	end
	for key, value in pairs(v) do
		self:_createHeroUnitData(value)
	end
end

-- @Role
function HistoryHeroData:_getHeroUnitData(id)
	return self:getHisoricalHeroValueById(id)
end

-- @Export 		Del删除
function HistoryHeroData:deleteData(v)
	if v == nil then
		return
	end
	for key, value in pairs(v) do
		local oldUnitKey = self:getHisoricalHeroKeyById(value)
		table.remove(self:getHeroList(), oldUnitKey)
	end
end

-------------------------------------------------------------------------
-- 武器
-- @Role 	服务器推送
function HistoryHeroData:_s2cGetWeapon(id, message)
	local starsWeapon = rawget(message,"star_weapons") or {}
	for k,v in ipairs(starsWeapon) do
        self:_createHeroWeaponUnitData(v)
	end
end

-- @Role 	Create 创建武器
function HistoryHeroData:_createHeroWeaponUnitData(v)
	local HistoryHeroWeaponUnit = require("app.data.HistoryHeroWeaponUnit")
	local unit = HistoryHeroWeaponUnit.new()
	unit:initData(v)
	local list = self:getWeaponList()
	list["k_"..tostring(unit:getId())] = unit

	table.sort(list, function(item1, item2)
		return item1:getId() < item2:getId()
	end)

	return unit
end

-- @Role 	
function HistoryHeroData:getHeroWeaponUnitData(id)
	local list = self:getWeaponList()
	local unit = list["k_"..tostring(id)]
	return unit
end

-- @Export 		Update更新武器
function HistoryHeroData:updateWeaponData(v)
	if v == nil or type(v) ~= "table" then
		return
	end
	for key, value in pairs(v) do
		self:_createHeroWeaponUnitData(value)
	end
end

-- @Export		Create/Insert 武器
function HistoryHeroData:insertWeaponData(v)
	if v == nil or type(v) ~= "table" then
		return
	end
	for key, value in pairs(v) do
		self:_createHeroWeaponUnitData(value)
	end
end

-- @Export 		Del删除武器
function HistoryHeroData:deleteWeaponData(v)
	if v == nil or type(v) ~= "table" then
		return
	end
	for key, value in pairs(v) do
		local list = self:getWeaponList()
		list["k_"..tostring(value)] = nil
	end
end

-- 是否拥有武器
function HistoryHeroData:haveWeapon(configId)
	local weapon = self:getHeroWeaponUnitData(configId)
	return weapon and true or false
end

-------------------------------------------------------------
-- @Export 		可重生的名将
function HistoryHeroData:getCanRebornHisoricalHero()
	local canBornHero = {}
	local heroList = self:getHeroList()
	local heroSquad= self:getHistoryHeroIds()
	
	for key, value in pairs(heroList) do
		local bSquad, _ = self:isStarEquiped(value:getId())
		if not bSquad and value:getBreak_through() > 1 then
			table.insert(canBornHero, value)
		end
	end
	return canBornHero
end

-------------------------------------------------------------
-- @Export 		根据名将唯一标识获取名将
-- @Param 		uniqueId 
function HistoryHeroData:getHisoricalHeroValueById(uniqueId)
	local heroListData = self:getHeroList()
	for key, value in pairs(heroListData) do
		if uniqueId == value:getId() then
			return value
		end
	end
	return nil
end

-------------------------------------------------------------
-- @Export 		根据名将唯一标识获取名将下标
-- @Param 		uniqueId 
function HistoryHeroData:getHisoricalHeroKeyById(uniqueId)
	local heroListData = self:getHeroList()
	for key, value in pairs(heroListData) do
		if uniqueId == value:getId() then
			return key
		end
	end
	return 0
end

-------------------------------------------------------------
-- @Export 		获取名将BaseId
-- @Param 		uniqueId 
function HistoryHeroData:getHisoricalHeroBaseIdById(uniqueId)
	local heroListData = self:getHeroList()
	if heroListData == nil then
		return nil
	end
	for key, value in pairs(heroListData) do
		if uniqueId == value:getId() then
			return value:getSystem_id()
		end
	end
	return nil
end

--------------------------------------------------------------------------
-- @Export 		是否上阵(判断上阵位置专用)
function HistoryHeroData:isStarEquiped(id)
	local equipedStars = self:getHistoryHeroIds()
	if equipedStars == nil then
		return false, nil
	end

	for key, value in pairs(equipedStars) do
		if value ~= nil and id == value then
			return true, key
		end
	end
	return false, nil
end

--------------------------------------------------------------------------
-- @Export 		上阵名将的systemId
function HistoryHeroData:getSystemIds()
	local equipedStars = self:getHistoryHeroIds()
	local stars = self:getHeroList()
	local systemIds = {}
	for k,v in pairs(equipedStars) do
		for index, value in ipairs(stars) do
			if v == value:getId() then
				table.insert(systemIds, value:getSystem_id())
			end 
		end
	end

	self:setSystemIdList(systemIds)
end

-- @Export 		获取上阵名将列表
function HistoryHeroData:getOnFormationList()
	local stars = self:getHistoryHeroIds()
	local list = {}
	for i = 1, #stars do
		local id = stars[i]
		if id == 0 then
			list[i] = nil
		else
			local data = self:getHisoricalHeroValueById(stars[i])
			-- table.insert(list, data)
			list[i] = data
		end
	end

	return list
end

--------------------------------------------------------------------------
-- @Export 		根据systemId判断是否上阵
-- @Param 		systemId
function HistoryHeroData:isStarSquad(systemId)
	local systemIds = self:getSystemIdList()
	for k,v in pairs(systemIds) do
		if v == systemId then
			return true
		end
	end
	return false
end

--------------------------------------------------------------------------
-- @Export 		获取上阵的名将数量
function HistoryHeroData:getSquadStarsNums()
	local count = 0
	local data = self:getHistoryHeroIds()
	for k,v in pairs(data) do
		if v ~= nil and v > 0 then
			count = count + 1
		end
	end
	return count
end

-----------------------------------------------------------------------------
-- @Export  	是否已经激活图鉴
-- @Param 		mapId 图鉴id
function HistoryHeroData:isActivedBook(mapId)
	local activedIds = self:getActivatedBookIds()
	if activedIds == nil then
		return false
	end

	for key, value in pairs(activedIds) do
		if mapId == value then
			return true
		end
	end
	return false
end

-------------------------------------------------------------------------------
-- @Export  	是否已经拥有
-- @Param 		systemId
function HistoryHeroData:isHaveHero(systemId)
	local list = self:getHeroList()
	for k,v in pairs(list) do
		if v ~= nil and v:getSystem_id() == systemId then
			return true
		end
	end
	return false
end
-------------------------------------------------------------------------------
-- @Export  	给定configId，获取未上阵的列表 configId为空则获取全部未上阵列表
-- @Param 		configId（systemId）
function HistoryHeroData:getNotInFormationList(configId)
	local heroList = {}
	local heroInBagList = self:getHeroList()
	for k, v in ipairs(heroInBagList) do
		if configId then
			if configId == v:getConfig().id and not v:isEquiped() then
				table.insert(heroList, v)
			end 
		else
			if not v:isEquiped() then
				table.insert(heroList, v)
			end 
		end
	end
	return heroList
end
-------------------------------------------------------------------------------
-- @Export  	获取未上阵的列表(排除同名武将)
function HistoryHeroData:getNotInFormationListExcludeSameName()
	local heroList = {}
	local heroInBagList = self:getHeroList()
	local function isSameNameOnFomation(v)
		--是否有同名的上阵武将
		return self:isStarSquad(v:getConfig().id)
	end

	for k, v in ipairs(heroInBagList) do
		if not self:isStarSquad(v:getConfig().id) and not isSameNameOnFomation(v) then
			table.insert(heroList, v)
		end 
	end
	return heroList
end
-------------------------------------------------------------------------------
--是否存在可突破武将
function HistoryHeroData:existCanBreakHistoryHero()
	local HistoryHeroConst = require("app.const.HistoryHeroConst")
	local heroInBagList = self:getHeroList()
	for k, v in ipairs(heroInBagList) do
		if v:enoughMaterial() then
			return true
		end
	end
	return false
end
-------------------------------------------------------------------------------
--上阵是否有坑
function HistoryHeroData:existSpaceOnFormation()
	local HistoryHeroConst = require("app.const.HistoryHeroConst")
	local HistoryHeroDataHelper = require("app.utils.data.HistoryHeroDataHelper")
	local slotList, unlockCount = HistoryHeroDataHelper.getHistoricalHeroSlotList()

	local onFormationList = self:getHistoryHeroIds()
	if onFormationList == nil then
		return false
	end

	for key, value in pairs(onFormationList) do
		if value == 0 then
			if slotList[key].isopen then
				--上阵坑位打开，没有武将，则找未上阵列表
				-- local list = self:getNotInFormationListExcludeSameName()
				local list = self:getNotInFormationList()
				return #list > 0
			end
		end
	end
	return false
end
-------------------------------------------------------------------------------
--是否存在未上阵的比上阵的战力高
function HistoryHeroData:existStrongerHero()
	-- local list = self:getNotInFormationListExcludeSameName()
	local list = self:getNotInFormationList()
	local onFormationList = self:getHistoryHeroIds()
	for _, underFormationData in pairs(list) do
		for _, heroId in pairs(onFormationList) do
			if heroId > 0 then
				local onFormationData = self:getHisoricalHeroValueById(heroId)
				if underFormationData:getConfig().color > onFormationData:getConfig().color then
					return true
				elseif underFormationData:getBreak_through() > onFormationData:getBreak_through() then
					return true
				end
			end
		end
	end
	return false
end
-------------------------------------------------------------------------------
--是否已经拥有2级非上阵武将
function HistoryHeroData:existLevel2Hero(configId)
	local list = self:getHeroList()
	for k,v in pairs(list) do
		if v ~= nil and 
			v:getSystem_id() == configId and 
			v:getBreak_through() == 2 and 
			not v:isOnFormation() then
			return true
		end
	end
	return false
end

--是否已经拥有1级非上阵武将 且有对应武器
function HistoryHeroData:existLevel1HeroWithWeapon(configId)
	local list = self:getHeroList()
	for k,v in pairs(list) do
		if v ~= nil and 
			v:getSystem_id() == configId and 
			v:getBreak_through() == 1 and 
			not v:isOnFormation() and 
			v:haveWeapon() then
			return true
		end
	end
	return false
end

function HistoryHeroData:getHeroDataWithPos(pos)
	local historyHeroIds = G_UserData:getHistoryHero():getHistoryHeroIds()
	local historyHeroId = historyHeroIds[pos]
	if historyHeroId and historyHeroId > 0 then
		local historyHeroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(historyHeroId)
		return historyHeroData
	else
		return nil
	end
end

-------------------------------------------------------------------------------
function HistoryHeroData:clear()
	self._s2cGetStarsListener:remove()
	self._s2cGetStarsListener = nil
	self._s2cGetWeaponListener:remove()
	self._s2cGetWeaponListener = nil
	self._s2cStarBreakThroughListener:remove()
	self._s2cStarBreakThroughListener = nil

	self._s2cStarEquipListener:remove()
	self._s2cStarEquipListener = nil
	self._s2cStarRebornListener:remove()
	self._s2cStarRebornListener = nil
	self._s2cStarCollectionListener:remove()
	self._s2cStarCollectionListener = nil

	self._s2cGetStarCollectionListener:remove()
	self._s2cGetStarCollectionListener = nil
	self._s2cGetStarFormationListener:remove()
	self._s2cGetStarFormationListener = nil
	self._s2cStarBreakDowncListener:remove()
	self._s2cStarBreakDowncListener = nil
end



return HistoryHeroData