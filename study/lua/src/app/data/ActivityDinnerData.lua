--宴会活动数据类
--@Author:Conley
local ActivityBaseData = import(".ActivityBaseData")
local BaseData = require("app.data.BaseData")
local ActDinner = require("app.config.act_dinner")
local ActivityConst = require("app.const.ActivityConst")
local DinnerConst = require("app.const.DinnerConst")
local ActivityDinnerData = class("ActivityDinnerData", BaseData)
local TimeConst = require("app.const.TimeConst")

-- 宴会单元数据
-- ===================START=====================
local ActivityDinnerUnitData = class("ActivityDinnerUnitData", BaseData)
local schema = {}
schema["config"] 	= {"table", {}}--配置
schema["state"] 	= {"number", 0}--领取状态@see:DinnerConst
schema["id"] 	    = {"number", 0}-- 1,2,3对应早中晚
schema["day"] 	    = {"number", 0}--第几天，不是当天则说明是以前的宴会
schema["startTime"] 	    = {"number", 0}--宴会开始时间单位秒
schema["endTime"] 	    = {"number", 0}--宴会结束时间单位秒
ActivityDinnerUnitData.schema = schema

function ActivityDinnerUnitData:ctor(properties)
	ActivityDinnerUnitData.super.ctor(self, properties)
end

-- 清除
function ActivityDinnerUnitData:clear()
end

-- 重置
function ActivityDinnerUnitData:reset()
end

--是否已吃了
function ActivityDinnerUnitData:hasEatDinner()
	 return self:getState() == DinnerConst.DINNER_STATE_EAT
end

--当前时分秒是否在宴会时间内
function ActivityDinnerUnitData:isInDinnerTime()
	local curTime = G_ServerTime:getTime()
	local hasSeconds = G_ServerTime:secondsFromToday(curTime)
	if self:getStartTime() <= hasSeconds 
		and self:getEndTime()  >= hasSeconds then
		return true
	end		
	return false
end

--转换config中时间字符串成时间秒(TODO迁移到配置工具函数)
function ActivityDinnerUnitData:_convertTimeStrToSecond(timeStr)
	local second = 0
	local secondRates = {3600,60,1}
	local strArr = string.split(timeStr,"|")--self:_split(timeStr,"|")
	for k,v in ipairs(strArr) do
		local number = tonumber(v)
		if number and secondRates[k] then
			second = second + secondRates[k]*number
		end
	end
	return second
end

-- 分隔字符串  
--@str：被分割的字符串
--@sep：分隔符，默认"\t"
function ActivityDinnerUnitData:_split(str,sep)  
	if str == nil or str == "" then
		return {}
	end
    local sep, fields = sep or "\t", {}  
    local pattern = string.format("([^%s]+)", sep)  
	string.gsub(str,pattern, function(c) fields[#fields+1] = c end )
    return fields  
end  

function ActivityDinnerUnitData:initData(day,id,state)
	self:setDay(day)
	self:setId(id)
	self:setState(state)
	
	local info = ActDinner.get(id)
	assert(info,"act_dinner can't find id = "..tostring(id))
	self:setConfig(info)
	self:setStartTime(self:_convertTimeStrToSecond(info.start_time))
	self:setEndTime(self:_convertTimeStrToSecond(info.end_time))
end

-- ===================end=====================


local schema = {}
schema["currDay"] 	    = {"number", 0}--当前天
schema["baseActivityData"] 	= {"table", {}}--基本活动数据
ActivityDinnerData.schema = schema

function ActivityDinnerData:ctor(properties)
	ActivityDinnerData.super.ctor(self, properties)


	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_DINNER  })
	self:setBaseActivityData(activityBaseData)

	self._unitDataList = {}
	self._todayUnitDataList = self:_createTodayDinnerUnitDataFromCfg()--按照时间循序


	self._s2cGetActDinnerListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActDinner, handler(self, self._s2cGetActDinner))
	self._s2cActDinnerListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActDinner, handler(self, self._s2cActDinner))
	self._s2cActReDinnerListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActReDinner, handler(self, self._s2cActReDinner))

	
	--self._signalAllDataReady = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onAllDataReady))
	
	self._canEat = false  --当前可吃标记
end

-- 清除
function ActivityDinnerData:clear()
	ActivityDinnerData.super.clear(self)
	self._s2cGetActDinnerListener:remove()
	self._s2cGetActDinnerListener = nil

	self._s2cActDinnerListener:remove()
	self._s2cActDinnerListener = nil

	self._s2cActReDinnerListener:remove()
	self._s2cActReDinnerListener = nil

	--self._signalAllDataReady:remove()
	--self._signalAllDataReady = nil

	self:getBaseActivityData():clear()
end

-- 重置
function ActivityDinnerData:reset()
	ActivityDinnerData.super.reset(self)
	self:getBaseActivityData():reset()

	self._unitDataList = {}
	self._todayUnitDataList = self:_createTodayDinnerUnitDataFromCfg()
end

--创建当天的宴会单元数据,按照时间循序数组
function ActivityDinnerData:_createTodayDinnerUnitDataFromCfg()
	local unitDataList = {}
	local length = ActDinner.length()
	for i = 1,length,1 do
		local cfg = ActDinner.indexOf(i)
		local unitData = ActivityDinnerUnitData.new()
		unitData:initData(0,cfg.id,DinnerConst.DINNER_STATE_NOT_EAT)
		unitDataList[cfg.id] = unitData--注意：1,2,3对应早中晚
	end
	return unitDataList
end
 
function ActivityDinnerData:_makeKey(day,id)
	return tostring(day).."_"..id
end 

--登陆成功事件回调
function ActivityDinnerData:_onAllDataReady()
	self:pullData()
end

function ActivityDinnerData:_s2cGetActDinner(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	self:getBaseActivityData():setHasData(true)
	self:resetTime()

	self._unitDataList = {}
	self:setCurrDay(message.day)
	local dinners = rawget(message,"dinner") or {}

	--补签测试数据
	-- ===================START=====================
	--table.insert( dinners,{ day = 0,ids = {1,2,3},states = {0,0,0}} )
	-- ===================end=======================

	for k,v in ipairs(dinners) do
		local day = v.day
		local ids = rawget(v,"ids") or {}
		local states = rawget(v,"states") or {}
		if message.day == day then
			--当天的
			for k1,v1 in ipairs(ids) do
				local unitData = self:getTodayDinnerUnitData(v1) 
				unitData:initData(day,v1,states[k1])
				local key = self:_makeKey(day,v1)
				self._unitDataList[key] = unitData
			end
			
		else
			for k1,v1 in ipairs(ids) do
				local unitData = ActivityDinnerUnitData.new()
				unitData:initData(day,v1,states[k1])
				local key = self:_makeKey(day,v1)
				self._unitDataList[key] = unitData
			end
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_DINNER_GET_INFO,id,message)

	self:_dispatchDinnerEvent()

	
end

function ActivityDinnerData:_s2cActDinner(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--当天的宴会对应时间id设置成已领
	local currUnitData = self:getTodayDinnerUnitData(message.id)
	if currUnitData then
		currUnitData:setState(DinnerConst.DINNER_STATE_EAT)
	
	end

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_DINNER_EAT,id,message)
	self:_dispatchDinnerEvent()

	self:setCanEat(false)
end

--补吃宴席
function ActivityDinnerData:_s2cActReDinner(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--非当天的宴会数据全部设置成已领
	for k,v in pairs(self._unitDataList) do
		if v:getDay() ~= self:getCurrDay() then
			v:setState(DinnerConst.DINNER_STATE_EAT)
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_DINNER_REEAT,id,message)

	self:_dispatchDinnerEvent()
end

--分派宴会数据变更事件
function ActivityDinnerData:_dispatchDinnerEvent()
	local missDinner = self:hasMissEatDinner()--是否漏签
	G_SignalManager:dispatch(SignalConst.EVENT_ACT_DINNER_RESIGNIN,missDinner)

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_DINNER} )
end

--@return:返回nil表明当前不处于饭点
function ActivityDinnerData:getCurrDinnerUnitData()
	local curTime = G_ServerTime:getTime()
	local hasSeconds = G_ServerTime:secondsFromToday(curTime)
	for k,v in pairs(self._todayUnitDataList) do
		if v:getStartTime() <= hasSeconds 
			and v:getEndTime()  >= hasSeconds then
			return v
		end		
	end
	return nil
end

--返回最近的宴会数据,当前或者上一个
function ActivityDinnerData:getRecentDinnerUnitData()
	local curTime = G_ServerTime:getTime()
	local hasSeconds = G_ServerTime:secondsFromToday(curTime)
	local num = #self._todayUnitDataList
	for i = num,1,-1 do
		local v = self._todayUnitDataList[i]
		if hasSeconds >= v:getStartTime() then
			return v
		end		
	end
	--找不到说明在第一个宴会前，取最后一个
	local lastUnitData = self._todayUnitDataList[num]
	return lastUnitData
end

--返回下一个宴会数据，23：00到03：59下个宴会数据为nil
function ActivityDinnerData:getNextDinnerUnitData()
	local curTime = G_ServerTime:getTime()
	local hasSeconds = G_ServerTime:secondsFromToday(curTime)
	local zeroTime = TimeConst.RESET_TIME*3600
	for k,v in ipairs(self._todayUnitDataList) do
		if hasSeconds >= zeroTime and hasSeconds < v:getStartTime() then
			return v
		end		
	end
	return nil
end



--通过id,返回当天的宴会数据
function ActivityDinnerData:getTodayDinnerUnitData(id)
	for k,v in ipairs(self._todayUnitDataList) do
		if v:getId() == id  then
			return v
		end
	end
	return nil
	--return self._todayUnitDataList[id]
end 

function ActivityDinnerData:getTodayAllDinnerUnitDatas()
	return self._todayUnitDataList
end 

--是否漏吃了宴会
function ActivityDinnerData:hasMissEatDinner()
	--[[
		--暂时屏蔽补签
	local curTime = G_ServerTime:getTime()
	local hasSeconds = G_ServerTime:secondsFromToday(curTime)
	for k,v in pairs(self._unitDataList) do
		if v:getDay() ~= self:getCurrDay() then--非当天的宴会数据
			if not v:hasEatDinner() then
				return true
			end
		else
		end
	end
	]]
	return false
end

--返回漏吃的宴会数据列表
function ActivityDinnerData:getMissEatDinnerDataList()
	local dinnerDataList = {}
	local curTime = G_ServerTime:getTime()
	local hasSeconds = G_ServerTime:secondsFromToday(curTime)
	for k,v in pairs(self._unitDataList) do
		if v:getDay() ~= self:getCurrDay() then--非当天的宴会数据
			if not v:hasEatDinner() then
				table.insert(dinnerDataList,v)
			end
		else--当天的宴会数据,不算补签
		end
	end
	return dinnerDataList
end


function ActivityDinnerData:c2sGetActDinner()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetActDinner, {})
end

function ActivityDinnerData:c2sActDinner()
	if self:isExpired() == true then
		self:pullData()
		return 
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActDinner, {})
end

function ActivityDinnerData:c2sActReDinner()
	if self:isExpired() == true then
		self:pullData()
		return 
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActReDinner, {})
end

function ActivityDinnerData:pullData()
	self:c2sGetActDinner()
end

function ActivityDinnerData:resetData()
	self:pullData()
	self:setNotExpire()--避免重复取数据
end


function ActivityDinnerData:hasRedPoint()
	--当有宴会可以吃体力的时候
	local currDinnerUnitData = self:getCurrDinnerUnitData()
	if currDinnerUnitData then--在宴会时间点内
		return not currDinnerUnitData:hasEatDinner()
	end
	return false	
end

--是否需要提示可吃
function ActivityDinnerData:getCanEat()
	if self._canEat then return false end
	self._canEat = self:hasRedPoint()
	return self._canEat
end

function ActivityDinnerData:setCanEat(canEat)
	self._canEat = checkbool(canEat)
end

return ActivityDinnerData