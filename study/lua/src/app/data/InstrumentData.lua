--
-- Author: Liangxu
-- Date: 2017-9-7 11:12:56
-- 神兵数据
local BaseData = require("app.data.BaseData")
local InstrumentData = class("InstrumentData", BaseData)
local InstrumentUnitData = require("app.data.InstrumentUnitData")

local schema = {}
schema["curInstrumentId"] = {"number", 0} --当前选中的神兵Id
InstrumentData.schema = schema

function InstrumentData:ctor(properties)
	InstrumentData.super.ctor(self, properties)

	self._instrumentList = {}
	self._heroMap = {} --神兵对应武将表
	self:_createHeroMap()

	self._recvGetInstrument = G_NetworkManager:add(MessageIDConst.ID_S2C_GetInstrument, handler(self, self._s2cGetInstrument))
	self._recvAddFightInstrument = G_NetworkManager:add(MessageIDConst.ID_S2C_AddFightInstrument, handler(self, self._s2cAddFightInstrument))
	self._recvClearFightInstrument = G_NetworkManager:add(MessageIDConst.ID_S2C_ClearFightInstrument, handler(self, self._s2cClearFightInstrument))
	self._recvInstrumentUpLevel = G_NetworkManager:add(MessageIDConst.ID_S2C_InstrumentUpLevel, handler(self, self._s2cInstrumentUpLevel))
	self._recvInstrumentUpLimitLevel = G_NetworkManager:add(MessageIDConst.ID_S2C_InstrumentUpLimitLevel, handler(self, self._s2cInstrumentUpLimitLevel))
	self._recvInstrumentLimitLvPutRes = G_NetworkManager:add(MessageIDConst.ID_S2C_InstrumentLimitLvPutRes, handler(self, self._s2cInstrumentLimitLvPutRes))
	self._recvInstrumentRecycle = G_NetworkManager:add(MessageIDConst.ID_S2C_InstrumentRecycle, handler(self, self._s2cInstrumentRecycle))
	self._recvInstrumentReborn = G_NetworkManager:add(MessageIDConst.ID_S2C_InstrumentReborn, handler(self, self._s2cInstrumentReborn))
	self._recvInstrumentTransform = G_NetworkManager:add(MessageIDConst.ID_S2C_InstrumentTransform, handler(self, self._s2cInstrumentTransform))
end

function InstrumentData:clear()
	self._recvGetInstrument:remove()
	self._recvGetInstrument = nil
	self._recvAddFightInstrument:remove()
	self._recvAddFightInstrument = nil
	self._recvClearFightInstrument:remove()
	self._recvClearFightInstrument = nil
	self._recvInstrumentUpLevel:remove()
	self._recvInstrumentUpLevel = nil
	self._recvInstrumentUpLimitLevel:remove()
	self._recvInstrumentUpLimitLevel = nil
	self._recvInstrumentLimitLvPutRes:remove()
	self._recvInstrumentLimitLvPutRes = nil
	self._recvInstrumentRecycle:remove()
	self._recvInstrumentRecycle = nil
	self._recvInstrumentReborn:remove()
	self._recvInstrumentReborn = nil
	self._recvInstrumentTransform:remove()
	self._recvInstrumentTransform = nil
end

function InstrumentData:reset()
	self._instrumentList = {}
	self._heroMap = {}
end

function InstrumentData:_createHeroMap()
	local HeroConfig = require("app.config.hero")
	local len = HeroConfig.length()
	for i = 1, len do
		local info = HeroConfig.indexOf(i)
		local id = info.instrument_id
		local heroBaseId = info.id
		if self._heroMap[id] == nil then
			self._heroMap[id] = heroBaseId
		end
	end
end

function InstrumentData:getHeroMap()
	return self._heroMap
end

--创建临时神兵数据
function InstrumentData:createTempInstrumentUnitData(data)
	assert(data and type(data) == "table", "InstrumentData:createTempInstrumentUnitData data must be table")

	local baseData = {}
	baseData.id = data.id or 0
	baseData.base_id = data.baseId or 1
	baseData.level = data.level or 0
	baseData.limit_level = data.limit_level or 0

	local unitData = InstrumentUnitData.new()
	unitData:updateData(baseData)

	return unitData
end

function InstrumentData:getHeroBaseId(id)
	local heroId = self._heroMap[id]
	assert(heroId, string.format("hero config can not find instrument_id = %d", id))
	return heroId
end

function InstrumentData:_setInstrumentData(data)
	self._instrumentList["k_"..tostring(data.id)] = nil
	local unitData = InstrumentUnitData.new()
	unitData:updateData(data)
	self._instrumentList["k_"..tostring(data.id)] = unitData
end

function InstrumentData:_s2cGetInstrument(id, message)
	self._instrumentList = {}
	local instrumentList = rawget(message, "instruments") or {}
	for i, data in ipairs(instrumentList) do
		self:_setInstrumentData(data)
	end
end

function InstrumentData:getInstrumentDataWithId(id)
	local unitData = self._instrumentList["k_"..tostring(id)]
	assert(unitData, string.format("Can not find id = %d in InstrumentDataList", id))
	return unitData
end

function InstrumentData:updateData(data)
	if data == nil or type(data) ~= "table" then
		return 
	end
	if self._instrumentList == nil then 
        return 
    end
    for i = 1, #data do
    	self:_setInstrumentData(data[i])
    end
end

function InstrumentData:insertData(data)
	if data == nil or type(data) ~= "table" then 
		return 
	end
	if self._instrumentList == nil then 
        return 
    end
    for i = 1, #data do
    	self:_setInstrumentData(data[i])
    end
end

function InstrumentData:deleteData(data)
	if data == nil or type(data) ~= "table" then 
		return 
	end
	if self._instrumentList == nil then 
        return 
    end
    for i = 1, #data do
    	local id = data[i]
    	self._instrumentList["k_"..tostring(id)] = nil
    end
end

function InstrumentData:getInstrumentTotalCount()
	local count = 0
	for k, v in pairs(self._instrumentList) do
		count = count + 1
	end
	return count
end

function InstrumentData:getInstrumentIdWithBaseId(baseId)
	for k, data in pairs(self._instrumentList) do
		if data:getBase_id() == baseId then
			return data:getId()
		end
	end
	return nil
end

function InstrumentData:getInstrumentCountWithBaseId(baseId)
	local count = 0
	for k, data in pairs(self._instrumentList) do
		if data:getBase_id() == baseId then
			count = count + 1
		end
	end
	return count
end

function InstrumentData:getListDataBySort()
	local result = {}
	local temp = {}

	local function sortFun(a, b)
		if a:isInBattle() ~= b:isInBattle() then
			return a:isInBattle() == true
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, data in pairs(self._instrumentList) do
		table.insert(temp, data)
	end
	table.sort(temp, sortFun)
	for i, data in ipairs(temp) do
		table.insert(result, data:getId())
	end

	return result
end

function InstrumentData:getRangeDataBySort()
	local result = {}
	local temp = {}

	local function sortFun(a, b)
		if a:isInBattle() ~= b:isInBattle() then
			return a:isInBattle() == true
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, data in pairs(self._instrumentList) do
		table.insert(temp, data)
	end
	table.sort(temp, sortFun)
	for i, data in ipairs(temp) do
		table.insert(result, data:getId())
	end

	return result
end

function InstrumentData:getReplaceInstrumentListWithSlot(pos, heroBaseId)
	local heroConfig = require("app.config.hero").get(heroBaseId)
	assert(heroConfig, string.format("hero config can not find id = %d", heroBaseId))
	local instrumentId = heroConfig.instrument_id
	local result = {}
	local wear = {}
	local noWear = {}

	local function sortFun(a, b)
		if a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		elseif a:getConfig().color ~= b:getConfig().color then
			return a:getConfig().color > b:getConfig().color
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, data in pairs(self._instrumentList) do
		if data:getBase_id() == instrumentId then
			local battleData = G_UserData:getBattleResource():getInstrumentDataWithId(data:getId())
			if battleData then
				if battleData:getPos() ~= pos then
					table.insert(wear, data)
					table.insert(result, data)
				end
			else
				table.insert(noWear, data)
				table.insert(result, data)
			end
		end
	end

	table.sort(result, sortFun)

	return result, noWear, wear
end

--获取神兵回收列表
function InstrumentData:getRecoveryList()
	local result = {}

	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isAdvanced() and 1 or 0
		local isTrainB = b:isAdvanced() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, unit in pairs(self._instrumentList) do
		local isInBattle = unit:isInBattle()
		local color = unit:getConfig().color
		if not isInBattle and color ~= 7 then --金色神兵不可回收
			table.insert(result, unit)
		end
	end
	table.sort(result, sortFun)

	return result
end

--获取神兵回收自动添加列表
function InstrumentData:getRecoveryAutoList()
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

	for k, unit in pairs(self._instrumentList) do
		local color = unit:getConfig().color
		local isTrain = unit:isAdvanced()
		local isInBattle = unit:isInBattle()
		if not isInBattle and color < 5 and not isTrain then
			table.insert(result, unit)
		end
	end
	table.sort(result, sortFun)

	return result
end

--获取神兵重生列表
function InstrumentData:getRebornList()
	local result = {}

	local sortFun = function(a, b)
		local colorA = a:getConfig().color
		local colorB = b:getConfig().color
		local isTrainA = a:isAdvanced() and 1 or 0
		local isTrainB = b:isAdvanced() and 1 or 0

		if colorA ~= colorB then
			return colorA < colorB
		elseif isTrainA ~= isTrainB then
			return isTrainA < isTrainB
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() < b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	for k, unit in pairs(self._instrumentList) do
		local isAdvanced = unit:isAdvanced()
		if isAdvanced then
			local isInBattle = unit:isInBattle()
			if not isInBattle then
				table.insert(result, unit)
			end
		end
	end

	table.sort(result, sortFun)

	return result
end

function InstrumentData:getTransformSrcList()
	local sortFun = function(a, b)
		local configA = a:getConfig()
		local configB = b:getConfig()

		if configA.color ~= configB.color then
			return configA.color > configB.color
		elseif a:getLimit_level() ~= b:getLimit_level() then
			return a:getLimit_level() > b:getLimit_level()
		elseif a:getLevel() ~= b:getLevel() then
			return a:getLevel() > b:getLevel()
		else
			return a:getBase_id() < b:getBase_id()
		end
	end

	local result = {
		[1] = {}, --魏
		[2] = {}, --蜀
		[3] = {}, --吴
		[4] = {}, --群雄
	}
	for k, unit in pairs(self._instrumentList) do
		local isInBattle = unit:isInBattle()
		local isSrc = unit:isCanBeTransformSrc() --是否能是置换者
		local color = unit:getConfig().color
		if not isInBattle and isSrc and color >= 5 and color <= 7 then --橙、红、金
			local country = unit:getCountry()
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

--判断是否有没穿戴的神兵，且神兵对应武将符合要求
function InstrumentData:isHaveInstrumentNotInPos(heroBaseId)
	local heroConfig = require("app.config.hero").get(heroBaseId)
	assert(heroConfig, string.format("hero config can not find id = %d", heroBaseId))
	local instrumentId = heroConfig.instrument_id

	for k, unit in pairs(self._instrumentList) do
		local pos = unit:getPos()
		if pos == nil and unit:getBase_id() == instrumentId then
			 return true
		end
	end
	return false
end

--判断是否有更好的神兵（红点机制）
function InstrumentData:isHaveBetterInstrument(pos, heroBaseId)
	local function isBetter(a, b) --retrun true: a比b好
		local colorA = a:getConfig().color
		local levelA = a:getLevel()

		local colorB = b:getConfig().color
		local levelB = b:getLevel()

		if colorA ~= colorB then
			return colorA > colorB
		elseif levelA ~= levelB then
			return levelA > levelB
		end
	end

	local heroConfig = require("app.config.hero").get(heroBaseId)
	assert(heroConfig, string.format("hero config can not find id = %d", heroBaseId))
	local tempInstrumentId = heroConfig.instrument_id

	local instrumentId = G_UserData:getBattleResource():getResourceId(pos, 3, 1)
	if not instrumentId then
		return false
	end

	local instrumentData = G_UserData:getInstrument():getInstrumentDataWithId(instrumentId)
	if not instrumentData then
		return false
	end

	for k, unit in pairs(self._instrumentList) do
		local pos = unit:getPos()
		if pos == nil and unit:getBase_id() == tempInstrumentId then
			if isBetter(unit, instrumentData) then
				return true
			end
		end
	end
	return false
end

--根据baseId获取同名卡的表
function InstrumentData:getSameCardsWithBaseId(baseId)
	local result = {}
	for k, data in pairs(self._instrumentList) do
		if data:getBase_id() == baseId 
			and not data:isInBattle()
			and not data:isAdvanced() then
			table.insert(result, data)
		end
	end
	return result
end

--某阵位上的神兵是否满级
function InstrumentData:isInstrumentLevelMaxWithPos(pos)
	local ids = G_UserData:getBattleResource():getInstrumentIdsWithPos(pos)
	local instrumentId = ids[1]

	if instrumentId and instrumentId > 0 then
		local unitData = self:getInstrumentDataWithId(instrumentId)
		local level = unitData:getLevel()
		local maxLevel = unitData:getConfig().level_max
		if level >= maxLevel then
			return true
		end
	end

	return false
end

--========================================协议部分===================================================

function InstrumentData:c2sAddFightInstrument(pos, instrumentId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_AddFightInstrument, {
		pos = pos,
		instrument_id = instrumentId,
	})
end

function InstrumentData:_s2cAddFightInstrument(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local id = rawget(message, "instrument_id") or 0
	local pos = rawget(message, "pos") or 0
	local oldId = rawget(message, "old_id") or 0

	G_UserData:getBattleResource():setInstrumentPosTable(pos, id, oldId)

	G_SignalManager:dispatch(SignalConst.EVENT_INSTRUMENT_ADD_SUCCESS, id, pos, oldId)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TREASURE)
end

function InstrumentData:c2sClearFightInstrument(pos)
	G_NetworkManager:send(MessageIDConst.ID_C2S_ClearFightInstrument, {
		pos = pos,
	})
end

function InstrumentData:_s2cClearFightInstrument(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local pos = rawget(message, "pos") or 0
	local oldId = rawget(message, "old_id") or 0

	G_UserData:getBattleResource():clearInstrumentPosTable(pos, oldId)

	G_SignalManager:dispatch(SignalConst.EVENT_INSTRUMENT_CLEAR_SUCCESS)
end

function InstrumentData:c2sInstrumentUpLevel(instrumentId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_InstrumentUpLevel, {
		id = instrumentId,
	})
end

function InstrumentData:_s2cInstrumentUpLevel(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_INSTRUMENT_LEVELUP_SUCCESS)
end

function InstrumentData:c2sInstrumentUpLimitLevel(instrumentId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_InstrumentUpLimitLevel, {
		id = instrumentId,
	})
end

function InstrumentData:_s2cInstrumentUpLimitLevel(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_INSTRUMENT_LIMIT_SUCCESS)
end

function InstrumentData:c2sInstrumentLimitLvPutRes(instrumentId, pos, subItems)
	G_NetworkManager:send(MessageIDConst.ID_C2S_InstrumentLimitLvPutRes, {
		instrument_id = instrumentId,
		pos = pos,
		sub_item = subItems
	})
end

function InstrumentData:_s2cInstrumentLimitLvPutRes(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local pos = rawget(message, "pos") or 0
	G_SignalManager:dispatch(SignalConst.EVENT_INSTRUMENT_LIMIT_LV_PUT_RES, pos)
end

function InstrumentData:c2sInstrumentRecycle(instrumentId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_InstrumentRecycle, {
		instrument_id = instrumentId,
	})
end

function InstrumentData:_s2cInstrumentRecycle(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_INSTRUMENT_RECYCLE_SUCCESS, awards)
end

function InstrumentData:c2sInstrumentReborn(instrumentId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_InstrumentReborn, {
		instrument_id = instrumentId,
	})
end

function InstrumentData:_s2cInstrumentReborn(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local awards = rawget(message, "awards") or {}
	G_SignalManager:dispatch(SignalConst.EVENT_INSTRUMENT_REBORN_SUCCESS, awards)
end

--置换
function InstrumentData:c2sInstrumentTransform(srcIds, toId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_InstrumentTransform, {
		to_id = toId,
		src_ids = srcIds,
	})
end

function InstrumentData:_s2cInstrumentTransform(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_INSTRUMENT_TRANSFORM_SUCCESS)
end

return InstrumentData