-- 战马数据
-- Author: Liangxu
-- Date: 2018-8-27
--

local BaseData = require("app.data.BaseData")
local HorseData = class("HorseData", BaseData)
local HorseUnitData = require("app.data.HorseUnitData")
local HorseConst = require("app.const.HorseConst")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")

local schema = {}
schema["curHorseId"] = {"number", 0} --当前选中的Id
HorseData.schema = schema

function HorseData:ctor(properties)
	HorseData.super.ctor(self, properties)

	self._horseList = {}
	self._applicableHeros = {} --适用武将 表

	self._horsePhotoList = {}  --战马图鉴表，已完成的

	self._recvWarHorseInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseInfo, handler(self, self._s2cWarHorseInfo))
	self._recvWarHorseFit = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseFit, handler(self, self._s2cWarHorseFit))
	self._recvWarHorseUnFit = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseUnFit, handler(self, self._s2cWarHorseUnFit))
	self._recvWarHorseUpgrade = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseUpgrade, handler(self, self._s2cWarHorseUpgrade))
	self._recvWarHorseReclaim = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseReclaim, handler(self, self._s2cWarHorseReclaim))
	self._recvWarHorseReborn = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseReborn, handler(self, self._s2cWarHorseReborn))
	self._recvWarHorseDraw = G_NetworkManager:add(MessageIDConst.ID_S2C_WarHorseDraw, handler(self, self._s2cWarHorseDraw))

	-- 新增战马图鉴信息下发
	self._recvGetActiveWarHorsePhoto = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActiveWarHorsePhoto, handler(self, self._s2cGetActiveWarHorsePhoto))
	self._recvActiveWarHorsePhoto    = G_NetworkManager:add(MessageIDConst.ID_S2C_ActiveWarHorsePhoto, handler(self, self._s2cActiveWarHorsePhoto))

	self:_initApplicableHeroIds()
end

function HorseData:clear()
	self._recvWarHorseInfo:remove()
	self._recvWarHorseInfo = nil
	self._recvWarHorseFit:remove()
	self._recvWarHorseFit = nil
	self._recvWarHorseUnFit:remove()
	self._recvWarHorseUnFit = nil
	self._recvWarHorseUpgrade:remove()
	self._recvWarHorseUpgrade = nil
	self._recvWarHorseReclaim:remove()
	self._recvWarHorseReclaim = nil
	self._recvWarHorseReborn:remove()
	self._recvWarHorseReborn = nil
	self._recvWarHorseDraw:remove()
	self._recvWarHorseDraw = nil

	self._recvGetActiveWarHorsePhoto:remove()
    self._recvGetActiveWarHorsePhoto = nil
    self._recvActiveWarHorsePhoto:remove()
    self._recvActiveWarHorsePhoto = nil
end

function HorseData:reset()
	self._horseList = {}
	self._applicableHeros = {}

	self._horseStateList = nil
	self._horsePhotoList = {}
end

function HorseData:_initApplicableHeroIds()
	local horseConfig = require("app.config.horse")
	local len = horseConfig.length()
	for i = 1, len do
		local horseInfo = horseConfig.indexOf(i)
		local strHero = horseInfo.hero
		local heroIds = {}
		local isSuitAll = false --是否适用全武将
		if strHero ~= "0" and strHero ~= "" then
			if strHero == tostring(HorseConst.ALL_HERO_ID) then --全武将
				isSuitAll = true
				local heroConfig = require("app.config.hero")
				local len = heroConfig.length()
				for i = 1, len do
					local info = heroConfig.indexOf(i)
					if info.type == 1 then --主角
						table.insert(heroIds, info.id)
					elseif info.type == 2 then
						table.insert(heroIds, info.id)
					end
				end
			else
				isSuitAll = false
				local ids = string.split(strHero, "|")
				for i, id in ipairs(ids) do
					table.insert(heroIds, tonumber(id))
				end
			end
		end
		self._applicableHeros[horseInfo.id] = {heroIds = heroIds, isSuitAll = isSuitAll}
	end
end

function HorseData:getHeroIdsWithHorseId(horseId)
	local heroIds = {}
	local isSuitAll = false
	local info = self._applicableHeros[horseId]
	if info then
		heroIds = info.heroIds
		isSuitAll = info.isSuitAll
	end
	return heroIds, isSuitAll
end

--创建临时战马数据
function HorseData:createTempHorseUnitData(baseId)
	local baseData = {}
	baseData.id = 0
	baseData.base_id = baseId or 1
	baseData.star = 1 --初始1星

	local unitData = HorseUnitData.new()
	unitData:updateData(baseData)

	return unitData
end

function HorseData:_setHorseData(data)
	self._horseList["k_"..tostring(data.id)] = nil
	local unitData = HorseUnitData.new()
	unitData:updateData(data)
	self._horseList["k_"..tostring(data.id)] = unitData
end

function HorseData:_s2cWarHorseInfo(id, message)
	self._horseList = {}
	local horseList = rawget(message, "datas") or {}
	for i, data in ipairs(horseList) do
		self:_setHorseData(data)
	end

	logWarn("已有的战马列表")
	dump(self._horseList)
end

function HorseData:getHorseListData()
	return self._horseList
end

function HorseData:getUnitDataWithId(id)
	local unitData = self._horseList["k_"..tostring(id)]
	assert(unitData, string.format("Can not find id = %d in HorseDataList", id))
	return unitData
end

function HorseData:updateData(data)
	if data == nil or type(data) ~= "table" then
		return 
	end
	if self._horseList == nil then 
        return 
    end
    for i = 1, #data do
    	self:_setHorseData(data[i])
    end
end

function HorseData:insertData(data)
	if data == nil or type(data) ~= "table" then 
		return 
	end
	if self._horseList == nil then 
        return 
    end
    for i = 1, #data do
    	self:_setHorseData(data[i])
    end
    
    -- 有新增战马，需要把当前的战马图鉴状态清空，使用时，重新加载
    -- self._horseStateList = nil

    G_UserData:getHandBook():c2sGetResPhoto()
end

function HorseData:deleteData(data)
	if data == nil or type(data) ~= "table" then 
		return 
	end
	if self._horseList == nil then 
        return 
    end
    for i = 1, #data do
    	local id = data[i]
    	self._horseList["k_"..tostring(id)] = nil
    end
end

function HorseData:getHorseTotalCount()
	local count = 0
	for k, v in pairs(self._horseList) do
		count = count + 1
	end
	return count
end

function HorseData:getHorseIdWithBaseId(baseId)
	for k, data in pairs(self._horseList) do
		if data:getBase_id() == baseId then
			return data:getId()
		end
	end
	return nil
end

function HorseData:getHorseCountWithBaseId(baseId)
	local count = 0
	for k, data in pairs(self._horseList) do
		if data:getBase_id() == baseId then
			count = count + 1
		end
	end
	return count
end

function HorseData:getListDataBySort()
	local result = {}
	local temp = {}

	local function sortFun(a, b)
		if a:isInBattle() ~= b:isInBattle() then
			return a:isInBattle() == true
		elseif a:getStar() ~= b:getStar() then
			return a:getStar() > b:getStar()
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, data in pairs(self._horseList) do
		table.insert(temp, data)
	end
	table.sort(temp, sortFun)
	for i, data in ipairs(temp) do
		table.insert(result, data:getId())
	end

	return result
end

function HorseData:getRangeDataBySort()
	local result = {}
	local temp = {}

	local function sortFun(a, b)
		if a:isInBattle() ~= b:isInBattle() then
			return a:isInBattle() == true
		elseif a:getStar() ~= b:getStar() then
			return a:getStar() > b:getStar()
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, data in pairs(self._horseList) do
		table.insert(temp, data)
	end
	table.sort(temp, sortFun)
	for i, data in ipairs(temp) do
		table.insert(result, data:getId())
	end

	return result	
end

function HorseData:getReplaceHorseListWithSlot(pos, heroBaseId)
	local result = {}
	local wear = {}
	local noWear = {}

	local function sortFun(a, b)
		if a.isEffective ~= b.isEffective then
			return a.isEffective
		elseif a:getStar() ~= b:getStar() then
			return a:getStar() > b:getStar()
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, data in pairs(self._horseList) do
		local cloneData = clone(data)
		cloneData.isEffective = false
		if heroBaseId then
			cloneData.isEffective = HorseDataHelper.isEffectiveHorseToHero(cloneData:getBase_id(), heroBaseId)
		end

		local battleData = G_UserData:getBattleResource():getHorseDataWithId(cloneData:getId())
		if battleData then
			if battleData:getPos() ~= pos then
				table.insert(wear, cloneData)
			end
		else
			table.insert(noWear, cloneData)
			table.insert(result, cloneData)
		end
	end

	table.sort(result, sortFun)

	return result, noWear, wear
end

--获取战马回收列表
function HorseData:getRecoveryList()
	local result = {}

	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isDidUpStar() and 1 or 0
		local isTrainB = b:isDidUpStar() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getStar() ~= b:getStar() then
			return a:getStar() < b:getStar()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, unit in pairs(self._horseList) do
        local isInBattle = unit:isInBattle()
        local recoveryValid = HorseDataHelper.isHorseRecoveryValid(unit:getId())               --没有装备的，并且没有上阵的，可以回收
		if not isInBattle and recoveryValid then
			table.insert(result, unit)
		end
	end
	table.sort(result, sortFun)

	return result
end

--获取战马回收自动添加列表
function HorseData:getRecoveryAutoList()
	local result = {}

	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color

		if colorA ~= colorB then
			return colorA < colorB
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, unit in pairs(self._horseList) do
		local color = unit:getConfig().color
		local isTrain = unit:isDidUpStar()
        local isInBattle = unit:isInBattle()
        local recoveryValid = HorseDataHelper.isHorseRecoveryValid(unit:getId())               --没有装备的，并且没有上阵的，可以回收
		if not isInBattle and color < 5 and not isTrain and recoveryValid then
			table.insert(result, unit)
		end
	end
	table.sort(result, sortFun)

	return result
end

function HorseData:getRebornList()
	local result = {}

	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isDidUpStar() and 1 or 0
		local isTrainB = b:isDidUpStar() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getStar() ~= b:getStar() then
			return a:getStar() < b:getStar()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, unit in pairs(self._horseList) do
		local isDidUpStar = unit:isDidUpStar()
		if isDidUpStar then
            local isInBattle = unit:isInBattle()
            local recoveryValid = HorseDataHelper.isHorseRecoveryValid(unit:getId())               --没有装备的，并且没有上阵的，可以重生
			if not isInBattle and recoveryValid then
				table.insert(result, unit)
			end
		end
	end

	table.sort(result, sortFun)

	return result
end

--判断是否有没穿戴的战马
function HorseData:isHaveHorseNotInPos(heroBaseId)
	for k, unit in pairs(self._horseList) do
		local pos = unit:getPos()
		local isEffective = HorseDataHelper.isEffectiveHorseToHero(unit:getBase_id(), heroBaseId)
		if pos == nil and isEffective then
			 return true
		end
	end
	return false
end

--判断是否有更好的战马（红点机制）
function HorseData:isHaveBetterHorse(pos, heroBaseId)
	local function isBetter(a, b) --retrun true: a比b好
		local colorA = a:getConfig().color
		local starA = a:getStar()

		local colorB = b:getConfig().color
		local starB = b:getStar()

		if colorA ~= colorB then
			return colorA > colorB
		elseif starA ~= starB then
			return starA > starB
		end
	end

	local horseId = G_UserData:getBattleResource():getResourceId(pos, HorseConst.FLAG, 1)
	if not horseId then
		return false
	end

	local horseData = self:getUnitDataWithId(horseId)
	if not horseData then
		return false
	end

	for k, unit in pairs(self._horseList) do
		local pos = unit:getPos()
		local isEffective = HorseDataHelper.isEffectiveHorseToHero(unit:getBase_id(), heroBaseId)
		if pos == nil and isEffective then
			if isBetter(unit, horseData) then
				return true
			end
		end
	end
	return false
end

--根据baseId获取同名卡的表
function HorseData:getSameCardsWithBaseId(baseId, filterId)
	local result = {}
	for k, data in pairs(self._horseList) do
		if data:getBase_id() == baseId 
			and data:getId() ~= filterId
			and not data:isInBattle()
            and not data:isDidUpStar() then
            
            local horseEquipList = G_UserData:getHorseEquipment():getEquipedEquipListWithHorseId(data:getId())
            if #horseEquipList <= 0 then
                table.insert(result, data)
            end
		end
	end
	return result
end

--某阵位上的战马是否满级
function HorseData:isHorseLevelMaxWithPos(pos)
	local ids = G_UserData:getBattleResource():getInstrumentIdsWithPos(pos)
	local horseId = ids[1]

	if horseId and horseId > 0 then
		local unitData = self:getUnitDataWithId(horseId)
		local star = unitData:getStar()
		if star >= HorseConst.HORSE_STAR_MAX then
			return true
		end
	end

	return false
end

--========================================协议部分===================================================

function HorseData:c2sWarHorseFit(pos, horseId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseFit, {
		horseId = horseId,
		pos = pos,
	})
end

function HorseData:_s2cWarHorseFit(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local id = rawget(message, "id") or 0
	local pos = rawget(message, "pos") or 0
	local oldId = rawget(message, "old_id") or 0

	G_UserData:getBattleResource():setHorsePosTable(pos, id, oldId)

	G_SignalManager:dispatch(SignalConst.EVENT_HORSE_ADD_SUCCESS, id, pos, oldId)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HORSE)
end

function HorseData:c2sWarHorseUnFit(pos)
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseUnFit, {
		pos = pos,
	})
end

function HorseData:_s2cWarHorseUnFit(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local pos = rawget(message, "pos") or 0
	local oldId = rawget(message, "old_id") or 0

	G_UserData:getBattleResource():clearHorsePosTable(pos, oldId)

	G_SignalManager:dispatch(SignalConst.EVENT_HORSE_CLEAR_SUCCESS)
end

function HorseData:c2sWarHorseUpgrade(horseId, times)
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseUpgrade, {
		horseId = horseId,
		times = times or 1,
	})
end

function HorseData:_s2cWarHorseUpgrade(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_HORSE_STARUP_SUCCESS)
end

function HorseData:c2sWarHorseReclaim(horseId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseReclaim, {
		horseId = horseId,
	})
end

function HorseData:_s2cWarHorseReclaim(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_HORSE_RECYCLE_SUCCESS, awards)
end

function HorseData:c2sWarHorseReborn(horseId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseReborn, {
		id = horseId,
	})
end

function HorseData:_s2cWarHorseReborn(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_HORSE_REBORN_SUCCESS, awards)
end

function HorseData:c2sWarHorseDraw(num)
	G_NetworkManager:send(MessageIDConst.ID_C2S_WarHorseDraw, {
		num = num,
	})
end

function HorseData:_s2cWarHorseDraw(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_HORSE_JUDGE_SUCCESS, awards)
end

------------------ 战马新增 -----------------
-- 新增战马图鉴下发
function HorseData:_s2cGetActiveWarHorsePhoto(id,message)
	self._horseStateList = nil
	self._horsePhotoList = {}

	local list = rawget(message,"horse_photo") or {}

	for k, photoId in pairs(list) do 
		self._horsePhotoList["k_"..photoId] = {photoId = photoId,state = HorseConst.HORSE_PHOTO_DONE}
	end

	logWarn("战马下发图鉴")
	dump(self._horsePhotoList)
end

-- 激活战马图鉴
function HorseData:c2sActiveWarHorsePhoto(photoId)
    self._horsePhotoId = photoId
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActiveWarHorsePhoto, {
		id = photoId,
	})
end

-- 激活战马图鉴回调
function HorseData:_s2cActiveWarHorsePhoto(id,message)
	logWarn("Data:_s2cActiveWarHorsePhoto")
	dump(message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
    end
    
    self._horsePhotoList["k_"..self._horsePhotoId] = {photoId = self._horsePhotoId,state = HorseConst.HORSE_PHOTO_DONE}
    -- self._horseStateList = nil

	-- 战马图鉴已激活，可以派发消息，刷新
    G_SignalManager:dispatch(SignalConst.EVENT_HORSE_KARMA_ACTIVE_SUCCESS,self._horsePhotoId)

    -- 战马图鉴红点刷新
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HORSE_BOOK)
end

-- 查看战马是否已获得
-- function HorseData:isHorseValid(horseId)
--     local horseValid = HorseDataHelper.isHorseValid(horseId,self._horseList)
--     return horseValid
-- end

-- 查看是否有可以激活的战马图鉴
function HorseData:isHorsePhotoValid()
    local horseStateList = self:getHorsePhotoStateList()
    local result = HorseDataHelper.isHorsePhotoValid(horseStateList)
    return result
end

-- 获取战马图鉴的所有属性和
function HorseData:getAllHorsePhotoAttrList()
    local horseStateList = self:getHorsePhotoStateList()
    local horseGroupList = self:_getHorseGroupList()
    local powerList = HorseDataHelper.getAllHorsePhotoAttrList(horseStateList,horseGroupList)
    return powerList
end

-- 获取战马图鉴的所有属性和
function HorseData:getAllHorsePhotoPowerList()
    local horseStateList = self:getHorsePhotoStateList()
    local horseGroupList = self:_getHorseGroupList()
    local powerList = HorseDataHelper.getAllHorsePhotoPowerList(horseStateList,horseGroupList)
    return powerList
end

-- 获取所有战马图鉴的状态
function HorseData:getHorsePhotoStateList()
	-- if self._horseStateList then
	-- 	return self._horseStateList,self._photoNum
	-- end

    self._horseStateList = {}
    self._photoNum = 0

    -- logWarn("已有的战马列表")
    -- dump(self._horseList)

    local horseGroupList = self:_getHorseGroupList()
    -- logWarn("horseGroupList")
    -- dump(horseGroupList)
    for i, groupData in ipairs(horseGroupList) do
        -- dump(groupData)
		if self._horsePhotoList["k_"..groupData.id] then
			self._horseStateList[i] = {photoId = groupData.id,state = HorseConst.HORSE_PHOTO_DONE}
		else
			-- local horseValid1 = self:isHorseValid(groupData.horse1,self._horseList)
            -- local horseValid2 = self:isHorseValid(groupData.horse2,self._horseList)
            local horseValid1 = G_UserData:getHandBook():isHorseHave(groupData.horse1)
            local horseValid2 = G_UserData:getHandBook():isHorseHave(groupData.horse2)
			if horseValid1 and horseValid2 then
				self._horseStateList[i] = {photoId = groupData.id,state = HorseConst.HORSE_PHOTO_VALID}
			else
				self._horseStateList[i] = {photoId = groupData.id,state = HorseConst.HORSE_PHOTO_UNVALID}
			end
        end
        
        self._photoNum = self._photoNum + 1
	end

	return self._horseStateList,self._photoNum
end

-- 获得战马图鉴分组数据列表
function HorseData:_getHorseGroupList()
	if not self._horseGroupList then
		self._horseGroupList = {}
		local horseGroupFile = require("app.config.horse_group")
		local dataLen 	= horseGroupFile.length()
		for index = 1, dataLen do
			local groupData = horseGroupFile.indexOf(index)
			table.insert(self._horseGroupList,groupData)
		end
	end
	return self._horseGroupList
end

-- 获得某一战马图鉴的详情
function HorseData:getHorsePhotoDetailInfo(photoId)
    local horseGroupList = self:_getHorseGroupList()
    local groupData = HorseDataHelper.getHorsePhotoDetailInfo(photoId,horseGroupList)
    return groupData
end

-- 获得某一战马图鉴，需要的战马个数
function HorseData:getHorsePhotoNeedNum(photoId)
    local horseGroupList = self:_getHorseGroupList()
    local needNum = HorseDataHelper.getHorsePhotoNeedNum(photoId,horseGroupList)
    return needNum
end

-- 获取战马的总战力，包括自身的和穿戴的马具的
function HorseData:getHorsePowerWithId(horseId)
    local horseData = self:getUnitDataWithId(horseId)
    local baseId = horseData:getBase_id()
    local star = horseData:getStar()
    local info = HorseDataHelper.getHorseStarConfig(baseId, star)
    local equipList = G_UserData:getHorseEquipment():getEquipedEquipListWithHorseId(horseId)
    local power = info.power
    for k, equipUnit in pairs(equipList) do
        power = power + equipUnit:getConfig().all_combat
    end

    return power
end

return HorseData