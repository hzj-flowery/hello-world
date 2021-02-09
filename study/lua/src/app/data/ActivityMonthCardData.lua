--月卡活动数据类
--@Author:Conley
local BaseData = import(".BaseData")
local ActivityBaseData = import(".ActivityBaseData")
local VipPay = require("app.config.vip_pay")
local ActivityConst = require("app.const.ActivityConst")


local ActivityMonthCardData = class("ActivityMonthCardData", BaseData)
local schema = {}
schema["baseActivityData"] 	= {"table", {}}--基本活动数据
ActivityMonthCardData.schema = schema

function ActivityMonthCardData:ctor(properties)
	ActivityMonthCardData.super.ctor(self, properties)
	self._monthCardConfigList = nil
	self._signalRechargeGetInfo = G_SignalManager:add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(self, self._onEventRechargeGetInfo))    
	self._s2cUseMonthlyCardListener = G_NetworkManager:add(MessageIDConst.ID_S2C_UseMonthlyCard, handler(self, self._s2cUseMonthlyCard))
	
	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_MONTHLY_CARD })
	self:setBaseActivityData(activityBaseData)
end

-- 清除
function ActivityMonthCardData:clear()
	ActivityMonthCardData.super.clear(self)
	self._signalRechargeGetInfo:remove()
	self._signalRechargeGetInfo = nil
	self._s2cUseMonthlyCardListener:remove()
	self._s2cUseMonthlyCardListener = nil

	self:getBaseActivityData():clear()
end

-- 重置
function ActivityMonthCardData:reset()
	ActivityMonthCardData.super.reset(self)
	self._monthCardConfigList = nil
	self:getBaseActivityData():reset()
end

function ActivityMonthCardData:_onEventRechargeGetInfo(event,id,message)
	self:getBaseActivityData():setHasData(true)
	self:resetTime()
end

function ActivityMonthCardData:_s2cUseMonthlyCard(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		if message.ret == MessageErrorConst.RET_MONTH_CARD_NOT_AVAILABLE or 
		message.ret == MessageErrorConst.RET_MONTH_CARD_NOT_USE then
			G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_MONTH_CARD_NOT_AVAILABLE, message.ret)
		end
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_MONTH_CARD_GET_REWARD,id,message)
end

--从vip_pay表里取出月卡配置，排好序
function ActivityMonthCardData:_createMonthCardCfgListFromConfig()
	local monthCardCfgList = {}
    local size = VipPay.length()
	local config = nil
	for i =1,size,1 do
		config = VipPay.indexOf(i)
		if config.card_type == ActivityConst.MONTH_CARD_VIP_PAY_TYPE then
	        table.insert(monthCardCfgList,config)
		end
	end
	return monthCardCfgList
end

function ActivityMonthCardData:getMonthCardDataById(id)
	local rechargeData = G_UserData:getRechargeData():getRechargeUnitDataById(id)
	return rechargeData
end

function ActivityMonthCardData:getMonthCardCfgList()
	if not self._monthCardConfigList then
		self._monthCardConfigList = self:_createMonthCardCfgListFromConfig()
	end
	return self._monthCardConfigList 
end

function ActivityMonthCardData:pullData()
	G_UserData:getRechargeData():pullData()
end

function ActivityMonthCardData:resetData()
	self:pullData()
	self:setNotExpire()--避免重复取数据
end

function ActivityMonthCardData:c2sUseMonthlyCard(payId)
	if self:isExpired() == true then
		self:pullData()
		return 
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_UseMonthlyCard, {id = payId})
end


function ActivityMonthCardData:hasRedPoint()
	--如果没有充值，每日（凌晨四点——凌晨四点）第一次登陆，都会有红点提醒一下，玩家看后即消失， 当天再次登陆就没了。
	--充值的，有奖励没有领的时候
	return self:_hasBuyResPoint() or self:hasRewardNotReceived()
end

function ActivityMonthCardData:_hasBuyResPoint()
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_MONTHLY_CARD,"buyMonthCardHint"}
    )
	if showed then
		return false
	end
	return  not self:hasBuyCard()
end

--是否购买了月卡
function ActivityMonthCardData:hasBuyCard()	
	local monthCardList = self:getMonthCardCfgList()
	for k,data in ipairs(monthCardList) do
		local cardData = self:getMonthCardDataById(data.id)
		if cardData and cardData:getRemainDay() > 0 then
			return true
		end 
	end
	return false
end

--是否有奖励没有领取
function ActivityMonthCardData:hasRewardNotReceived()
	local monthCardList = self:getMonthCardCfgList()
	for k,data in ipairs(monthCardList) do
		local cardData = self:getMonthCardDataById(data.id)
		if cardData and cardData:isCanReceive() then
			return true
		end 
	end
	return false
end

return ActivityMonthCardData