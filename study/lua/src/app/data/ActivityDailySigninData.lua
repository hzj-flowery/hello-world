--每日签到活动数据类
--@Author:Conley

local ActivityBaseData = import(".ActivityBaseData")
local ActivityConst = require("app.const.ActivityConst")
local BaseData = require("app.data.BaseData")
local ActCheckin = require("app.config.act_checkin")
local TimeConst  = require("app.const.TimeConst")
-- 签到数据
-- ===================START=====================
local ActivityDailySigninUnitData = class("ActivityDailySigninUnitData", BaseData)
local schema = {}
schema["config"] 	= {"table", {}}--签到配置
schema["state"] 		= {"number", 0}--签到状态@see ActivityConst
schema["day"] 	= {"number", 0}--第几天
ActivityDailySigninUnitData.schema = schema
function ActivityDailySigninUnitData:ctor(properties)
	ActivityDailySigninUnitData.super.ctor(self, properties)
end

-- 清除
function ActivityDailySigninUnitData:clear()
end

-- 重置
function ActivityDailySigninUnitData:reset()
end

function ActivityDailySigninUnitData:initData(month,day,state)
	self:setState(state)
	self:setDay(day)
	
	local info = ActCheckin.get(month,day)
	assert(info,"act_checkin can't find month = "..tostring(month).." day = "..tostring(day))
	self:setConfig(info)
end	

-- ===================end=====================

local ActivityDailySigninData = class("ActivityDailySigninData", BaseData)
local schema = {}
schema["baseActivityData"] 	= {"table", {}}--活动基本数据
schema["checkinCount"]		= {"number", 0}--签到总天数
schema["checkinMonth"]		= {"number", 0}--签到月份
ActivityDailySigninData.schema = schema

function ActivityDailySigninData:ctor(properties)
	ActivityDailySigninData.super.ctor(self, properties)
	self._signinUnitDataList = {}

	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_SIGNIN  })
	self:setBaseActivityData(activityBaseData)

	self._s2cGetActCheckinListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActCheckin, handler(self, self._s2cGetActCheckin))
	self._s2cActCheckinListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActCheckin, handler(self, self._s2cActCheckin))
	self._s2cActReCheckinListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActReCheckin, handler(self, self._s2cActReCheckin))
end

-- 清除
function ActivityDailySigninData:clear()
	ActivityDailySigninData.super.clear(self)
	self._s2cGetActCheckinListener:remove()
	self._s2cGetActCheckinListener = nil
	self._s2cActCheckinListener:remove()
	self._s2cActCheckinListener = nil
	self._s2cActReCheckinListener:remove()
	self._s2cActReCheckinListener = nil

	self:getBaseActivityData():clear()
end

-- 重置
function ActivityDailySigninData:reset()
	ActivityDailySigninData.super.reset(self)
	self:getBaseActivityData():reset()
	self._signinUnitDataList = {}
end

function ActivityDailySigninData:_createSignUnitData(month,day,state)
	local actDailySigninUnitData = ActivityDailySigninUnitData.new()
	actDailySigninUnitData:initData(month,day,state)
	table.insert( self._signinUnitDataList,actDailySigninUnitData)
end

--刷新指定月天的签到数据
function ActivityDailySigninData:_setUnitData(month,day,state)
	 local unitData =  self._signinUnitDataList[day]
	 if unitData then
	 	 unitData:initData(month,day,state)
	 end
end

--设置指定月天签到成功
function ActivityDailySigninData:_setSignSuccess(month,day)
	 local unitData =  self._signinUnitDataList[day]
	 if unitData then
	 	 unitData:initData(month,day,ActivityConst.CHECKIN_STATE_PASS_TIME)
	 end
end

function ActivityDailySigninData:_s2cGetActCheckin(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:getBaseActivityData():setHasData(true)
	self:resetTime()
	self._signinUnitDataList = {}

	self:setCheckinCount(message.checkin_count)
	self:setCheckinMonth(message.checkin_month)

	local checkinDay = rawget(message,"checkin_day") or {}
	for k,v in ipairs(checkinDay) do
		self:_createSignUnitData(message.checkin_month,k,v)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_SIGNIN_GET_INFO,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_SIGNIN})
end

function ActivityDailySigninData:_s2cActCheckin(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setCheckinCount(self:getCheckinCount()+1)
	--服务器天数从0开始，特别注意
	self:_setSignSuccess(self:getCheckinMonth(),message.day+1,ActivityConst.CHECKIN_STATE_PASS_TIME)

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_SIGNIN_DO_SIGNIN,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_SIGNIN } )
	
end

function ActivityDailySigninData:_s2cActReCheckin(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:setCheckinCount(self:getCheckinCount()+1)
	--服务器天数从0开始，特别注意
	self:_setSignSuccess(self:getCheckinMonth(),message.day+1,ActivityConst.CHECKIN_STATE_PASS_TIME)

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_SIGNIN_DO_SIGNIN,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_SIGNIN} )
end

--签到了第几天
function ActivityDailySigninData:getCurrSignDay()
	local allSigninUnitData = self:getAllSigninUnitDatas()
	for k,dailySigninUnitData in ipairs(allSigninUnitData) do
		local state = dailySigninUnitData:getState()
		if state == ActivityConst.CHECKIN_STATE_RIGHT_TIME then--可领取
			return dailySigninUnitData:getDay()
		end
	end
	return nil
end

--返回指定天数的签到数据
--@day:从1开始
function ActivityDailySigninData:getSigninUnitDataByDay(day)
	if day <= 0 then
		return nil
	end
	return self._signinUnitDataList[day]
end

function ActivityDailySigninData:getAllSigninUnitDatas()
	return self._signinUnitDataList
end

function ActivityDailySigninData:pullData()
	logWarn("pullData    ActivityDailySigninData ")
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetActCheckin, {})
end

function ActivityDailySigninData:resetData()
	self:pullData()
	self:setNotExpire()--避免重复取数据
end

function ActivityDailySigninData:c2sActCheckin()
	if self:isExpired() == true then
		self:pullData()
		return 
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActCheckin, {})
end

function ActivityDailySigninData:c2sActReCheckin(day)
	if self:isExpired() == true then
		self:pullData()
		return 
	end
	--服务器天数从0开始，特别注意
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActReCheckin, {day = day-1})

end

function ActivityDailySigninData:getReSigninCostGold()
	return self:getBaseActivityData():getActivityParameter(ActivityConst.ACT_PARAMETER_INDEX_RESIGNIN_COST_GOLD )
end

function ActivityDailySigninData:hasRedPoint()
	--可以签到领取奖励的时候
	local allSigninUnitData = self:getAllSigninUnitDatas()
	for k,dailySigninUnitData in ipairs(allSigninUnitData) do
		local state = dailySigninUnitData:getState()
		if state == ActivityConst.CHECKIN_STATE_RIGHT_TIME then--可领取
			return true
		end
	end
	return false
end

return ActivityDailySigninData