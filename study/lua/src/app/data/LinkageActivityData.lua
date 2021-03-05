-- Author: nieming
-- Date:2018-03-01 10:58:18
-- Describle：手杀联动

local BaseData = require("app.data.BaseData")
local LinkageActivityData = class("LinkageActivityData", BaseData)
local CombineTaskStatusData = require("app.data.CombineTaskStatusData")

local schema = {}
schema["status"] = {"number", 0}
schema["records"] = {"table", {}}
schema["game_id"] = {"number", 0}
schema["begin_time"] = {"number", 0}
schema["end_time"] = {"number", 0}
schema["act_status"] = {"number", 0} -- 0: close 1: open

--schema
LinkageActivityData.schema = schema


function LinkageActivityData:ctor(properties)
	LinkageActivityData.super.ctor(self, properties)

	self._combineTaskList = {}

	self._signalRecvLoadSGSCodeRecord = G_NetworkManager:add(MessageIDConst.ID_S2C_LoadSGSCodeRecord, handler(self, self._s2cLoadSGSCodeRecord))
	self._signalRecvTakeSGSCode = G_NetworkManager:add(MessageIDConst.ID_S2C_TakeSGSCode, handler(self, self._s2cTakeSGSCode))
	self._signalGetCombineTaskStatus = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCombineTaskStatus, handler(self, self._s2cGetCombineTaskStatus))

end

function LinkageActivityData:clear()
	self._signalRecvLoadSGSCodeRecord:remove()
	self._signalRecvLoadSGSCodeRecord = nil

	self._signalRecvTakeSGSCode:remove()
	self._signalRecvTakeSGSCode = nil

	self._signalGetCombineTaskStatus:remove()
	self._signalGetCombineTaskStatus = nil
end



function LinkageActivityData:reset()

end


function LinkageActivityData:isVisible(gameId)
	return gameId == 1  and not self:isAllTaskComplete() and self:getAct_status() == 1
	--[[
	local curTime = G_ServerTime:getTime()
	local endTime = self:getEnd_time()
	if curTime > endTime then
		logError("isVisible")
		return false
	end
	return self:getStatus() == 1 and gameId == self:getGame_id()
	]]
end

function LinkageActivityData:hasRedPoint()
	return false
--[[
	local userLevel = G_UserData:getBase():getLevel()
	local records = self:getRecords()
	local levels = self:getRequireLevels()
	for i = 1, 3 do
		local isAlreayGet = records[i] ~= nil
		local canGet = userLevel >= levels[i]
		if canGet and not isAlreayGet then
			return true
		end
	end
	return false
	]]
end

-- function LinkageActivityData:getEndTime()
-- 	local openServerTime = G_UserData:getBase():getServer_open_time()
-- 	local date = G_ServerTime:getDateObject(openServerTime)
-- 	local t1 = date.hour*3600 + date.min*60 + date.sec
-- 	local zeroTime = openServerTime - t1
-- 	local curTime = G_ServerTime:getTime()
-- 	local oneDay = 24* 60* 60
-- 	local ParameterConfig = require("app.config.parameter")
-- 	local cfg = ParameterConfig.get(311)
-- 	assert(cfg ~= nil, "parameter can not find id = 311")
-- 	local endDay = tonumber(cfg.content) or 0
-- 	local endTime = zeroTime + endDay * oneDay
-- 	return endTime
-- end

function LinkageActivityData:getRequireLevels()
	local paramConfig = require("app.config.parameter")
	local config = paramConfig.get(195)
	assert(config ~= nil, "not find parameter config id = 195")
	local content = config.content
	local levelstr = string.split(config.content, "|")
	local levels = {}
	for k, v in ipairs(levelstr) do
		table.insert(levels, tonumber(v))
	end
	return levels
end

-- Describle：之前根据开发时间来判断  现在取消只是用1 2 3来表示  open_server_day == index
function LinkageActivityData:_s2cLoadSGSCodeRecord(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local oldStatus = self:getStatus()
	self:setStatus(message.status)
	--check data
	self:setProperties(message)
	local records = rawget(message, "records")
	if records then
		local data = {}
		for k, v in pairs(records) do
			data[v.open_server_day] = v.code
		end
		self:setRecords(data)
	end
	local endTime = self:getEnd_time()
	local curTime = G_ServerTime:getTime()

	if curTime < endTime then
		G_ServiceManager:registerOneAlarmClock("LINKAGE_ACTIVITY_TIME_END", endTime, function()
			G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_LINKAGE_ACTIVITY)
		end)
	end

	if oldStatus ~= message.status then
		G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_LINKAGE_ACTIVITY)
	end
	--
end
-- Describle：
-- Param:
--	open_server_day
function LinkageActivityData:c2sTakeSGSCode( open_server_day)
	G_NetworkManager:send(MessageIDConst.ID_C2S_TakeSGSCode, {
		open_server_day = open_server_day,
	})
end
-- Describle：
function LinkageActivityData:_s2cTakeSGSCode(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local open_server_day = rawget(message, "open_server_day")
	if open_server_day then
		local data = self:getRecords()
		data[open_server_day] = rawget(message, "code") or ""
	end
	G_SignalManager:dispatch(SignalConst.EVENT_TAKE_LINKAGE_ACTIVITY_CODE_SUCCESS, open_server_day)
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_LINKAGE_ACTIVITY)
end


function LinkageActivityData:c2sGetCombineTaskStatus( )
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetCombineTaskStatus, {
	})
end


function LinkageActivityData:_s2cGetCombineTaskStatus(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self._combineTaskList = {}
	local tasks = rawget(message, "tasks") or {}
	for k,v in ipairs(tasks) do
		local data = CombineTaskStatusData.new()
		data:initData(v)
		self._combineTaskList[data:getTask_id()] = data
	end	
	

	self:setProperties(message)
	

	G_SignalManager:dispatch(SignalConst.EVENT_LINKAGE_ACTIVITY_TASK_SYN)
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_LINKAGE_ACTIVITY)
end	

function LinkageActivityData:getCombineTaskList()
	return self._combineTaskList
end

function LinkageActivityData:getCombineTaskUnitData(taskId)
	return self._combineTaskList[taskId]
end

function LinkageActivityData:isAllTaskComplete()
	local SgsLinkage = require("app.config.sgs_linkage")
	for i = 1,SgsLinkage.length(),1 do
		local config = SgsLinkage.indexOf(i)
		local unit = self:getCombineTaskUnitData(config.id)
		if not unit then
			return false
		elseif unit:getStatus() ~= 1 	then
			return false
		end
	end
	return true
end



return LinkageActivityData
