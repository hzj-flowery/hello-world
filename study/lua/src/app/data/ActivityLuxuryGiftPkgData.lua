--豪华礼包活动数据类
--@Author:Conley
local ActivityBaseData = import(".ActivityBaseData")
local BaseData = require("app.data.BaseData")
local ActivityConst = require("app.const.ActivityConst")
local RechargeConst = require("app.const.RechargeConst")
local ActDailyDiscount = require("app.config.act_daily_discount")
local VipPay = require("app.config.vip_pay")

-- 豪华礼包单元数据
-- ===================START=====================
local ActivityLuxuryGiftPkgUnitData = class("ActivityLuxuryGiftPkgUnitData", BaseData)

local schema = {}
schema["time"] 		= {"number", 0}--购买次数
schema["id"] 		= {"number",0}--ID
schema["config"] 	= {"table",{}}--礼包配置
schema["vipConfig"] 	= {"table",{}}--付费vip_pay配置

ActivityLuxuryGiftPkgUnitData.schema = schema

function ActivityLuxuryGiftPkgUnitData:ctor(properties)
	ActivityLuxuryGiftPkgUnitData.super.ctor(self, properties)
end

-- 清除
function ActivityLuxuryGiftPkgUnitData:clear()
end

-- 重置
function ActivityLuxuryGiftPkgUnitData:reset()
end

function ActivityLuxuryGiftPkgUnitData:initData(id,time)
	self:setTime(time)
	self:setId(id)

	local info = ActDailyDiscount.get(id)
	assert(info,"act_daily_discount not find id "..tostring(id))
	self:setConfig(info)

	--通过pay_type(充值档次123)获得付费vip_pay配置
	local vipCfg = G_UserData:getActivityLuxuryGiftPkg():getGiftPkgPayCfgByIndex(info.pay_type)
	assert(vipCfg,"act_daily_discount pay_type "..tostring(info.pay_type).." not find match vip_pay ")

	self:setVipConfig(vipCfg)
end

--@return剩余购买次数
function ActivityLuxuryGiftPkgUnitData:getRemainBuyTime()
    return G_UserData:getActivityLuxuryGiftPkg():getTotalBuyTime() - self:getTime()
end

function ActivityLuxuryGiftPkgUnitData:getPayType()
	local cfg = self:getConfig()
	if not cfg then
		return nil
	end
	return cfg.pay_type
end

-- ===================end=====================

local ActivityLuxuryGiftPkgData = class("ActivityLuxuryGiftPkgData", BaseData)

local schema = {}
schema["baseActivityData"] 	= {"table", {}}--基本活动数据
schema["start_time"] 	= {"number", 0}--连续领取的开始时间

ActivityLuxuryGiftPkgData.schema = schema

function ActivityLuxuryGiftPkgData:ctor(properties)
	ActivityLuxuryGiftPkgData.super.ctor(self, properties)

	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_LUXURY_GIFT_PKG  })
	self:setBaseActivityData(activityBaseData)

	self._unitDataList = {}
	self._vipPayCfgList = self:_createVipPayCfgListFromConfig()

	self._s2cGetActDiscountListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActDiscount, handler(self, self._s2cGetActDiscount))
	self._s2cActDiscountListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActDiscount, handler(self, self._s2cActDiscount))
end

-- 清除
function ActivityLuxuryGiftPkgData:clear()
	ActivityLuxuryGiftPkgData.super.clear(self)
	self._s2cGetActDiscountListener:remove()
	self._s2cGetActDiscountListener = nil

	self._s2cActDiscountListener:remove()
	self._s2cActDiscountListener = nil

	self:getBaseActivityData():clear()
end

-- 重置
function ActivityLuxuryGiftPkgData:reset()
	ActivityLuxuryGiftPkgData.super.reset(self)
	self:getBaseActivityData():reset()

	self._unitDataList = {}
	self._vipPayCfgList = self:_createVipPayCfgListFromConfig()
end

function ActivityLuxuryGiftPkgData:_createUnitData(id,time)
	local unitData = ActivityLuxuryGiftPkgUnitData.new()
	unitData:initData(id,time)
	self._unitDataList["k_"..tostring(id)] =  unitData
end

--创建礼包相关的充值配置数组
function ActivityLuxuryGiftPkgData:_createVipPayCfgListFromConfig()
	local payCfgList = {}
    local size = VipPay.length()
	local config = nil
	for i =1,size,1 do
		config = VipPay.indexOf(i)
		if config.card_type == RechargeConst.VIP_PAY_TYPE_LUXURY_GIFT_PKG then
	        table.insert(payCfgList,config)
		end
	end
	local sortFunc = function (obj1,obj2)
		return obj1.rmb < obj2.rmb
	end
	table.sort(payCfgList, sortFunc )
	return payCfgList
end

--通过档次获取充值信息
--@index:档次
function ActivityLuxuryGiftPkgData:getGiftPkgPayCfgByIndex(index)
	return self._vipPayCfgList[index]
end

function ActivityLuxuryGiftPkgData:getGiftPkgPayCfgList()
	return self._vipPayCfgList
end

--获得豪华礼包单元数据
function ActivityLuxuryGiftPkgData:getUnitData(id)
	return self._unitDataList["k_"..tostring(id)]
end

function ActivityLuxuryGiftPkgData:getUnitDatasByPayType(payType)
	dump(self._unitDataList)
	local dataList = {}
	for k,unitData in pairs(self._unitDataList) do
		if unitData:getPayType() == payType then
			table.insert( dataList,unitData)
		end
	end
	return dataList
end

function ActivityLuxuryGiftPkgData:_s2cGetActDiscount(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--豪华礼包和周礼包用同一个协议，这里过滤下
	if message.discount_type ~= ActivityConst.GIFT_PKG_TYPE_LUXURY then
		return
	end
	self:getBaseActivityData():setHasData(true)
	self:resetTime()

	self._unitDataList = {}

	self:setProperties(message)

	local goodsIds = rawget(message,"goods_ids") or {}
	local buyTimes = rawget(message,"buy_times") or {}
	--local startTime = rawget(message,"start_time") or 0

	for k,v in ipairs(goodsIds) do
		if v and buyTimes[k] then
			self:_createUnitData(v,buyTimes[k])
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_INFO,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId =ActivityConst.ACT_ID_LUXURY_GIFT_PKG})
end

function ActivityLuxuryGiftPkgData:_s2cActDiscount(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--豪华礼包和周礼包用同一个协议，这里过滤下
	if message.discount_type ~= ActivityConst.GIFT_PKG_TYPE_LUXURY then
		return
	end
	local ids = rawget(message,"id") or {}
	for k,id in ipairs(ids) do
		local unitData = self:getUnitData(id)
		if unitData then
			unitData:setTime(unitData:getTime() + 1)
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_REWARD,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_LUXURY_GIFT_PKG})
end

--发送购买礼包消息
function ActivityLuxuryGiftPkgData:c2sActDiscount(payIndex)
	if self:isExpired() == true then
		self:pullData()
		return
	end
	local unitDataList = self:getUnitDatasByPayType(payIndex)
	local ids = {}
	for k,v in ipairs(unitDataList) do
		table.insert( ids, v:getConfig().id )
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActDiscount, {discount_type = ActivityConst.GIFT_PKG_TYPE_LUXURY,id = ids})
end

--发送获取礼包数据消息
function ActivityLuxuryGiftPkgData:c2sGetActDiscount(discountType)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetActDiscount, {discount_type = discountType})
end

function ActivityLuxuryGiftPkgData:pullData()
	self:c2sGetActDiscount(ActivityConst.GIFT_PKG_TYPE_LUXURY)
end

function ActivityLuxuryGiftPkgData:resetData()
	self:pullData()
	self:setNotExpire()--避免重复取数据
end


--最大可购买次数
function ActivityLuxuryGiftPkgData:getTotalBuyTime()
	local baseActData = self:getBaseActivityData()
	return baseActData:getActivityParameter(ActivityConst.ACT_PARAMETER_INDEX_LUXURY_GIFT_PKG_MAX_BUY_TIMES) or 0
end

function ActivityLuxuryGiftPkgData:hasRedPoint()
	--没有买（每日提醒一次）
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_LUXURY_GIFT_PKG}
    )
	if showed then
		return false
	end

	return not self:hasBuyGoods()
end

function ActivityLuxuryGiftPkgData:hasBuyGoods()
	for k,actLuxuryGiftPkgUnitData in pairs(self._unitDataList) do
		local buyTime = actLuxuryGiftPkgUnitData:getTime()
		if buyTime >  0 then
			return true
		end
	end
	return false
end

function ActivityLuxuryGiftPkgData:getRewards(ids)
	local awards = {}
	for k,id in ipairs(ids) do
		local unitData = self:getUnitData(id)
		if unitData then
			local cfg = unitData:getConfig()
			table.insert(awards,{type = cfg.type,value = cfg.value,size = cfg.size})
		end
	end
	return awards
end

function ActivityLuxuryGiftPkgData:getRewardsByPayType(index)
	local awards = {}
	local unitDataList = self:getUnitDatasByPayType(index)
	for k,cfg in ipairs(unitDataList) do
		table.insert(awards,{type = cfg.type,value = cfg.value,size = cfg.size})
	end
	return awards
end

function ActivityLuxuryGiftPkgData:isNeedBuy7Days()
	local startTime = self:getStart_time()
	local currTime = G_ServerTime:getTime()
	local expiredTime = startTime + 7 *  3600 * 24

	if currTime < expiredTime then
		return false,math.ceil( (expiredTime - currTime)/(3600 * 24) ) -1
	end
	return true,0
end


function ActivityLuxuryGiftPkgData:isCanReceiveGiftPkg()
	local startTime = self:getStart_time()
	local currTime = G_ServerTime:getTime()
	local expiredTime = startTime + 7 *  3600 * 24
	return 	currTime >= startTime and currTime < expiredTime
end


function ActivityLuxuryGiftPkgData:getBuy7DaysPayConfig()
	local baseActData = self:getBaseActivityData()
	local payId = baseActData:getActivityParameter(2)
	local payCfg = VipPay.get(payId)
	assert(payCfg,"vip_pay not find id "..tostring(payId))
	return payCfg
end

function ActivityLuxuryGiftPkgData:getBuy7DayVipLimit()
	local baseActData = self:getBaseActivityData()
	local vipLimit = tonumber(baseActData:getActivityParameter(3))
	return vipLimit
end

return ActivityLuxuryGiftPkgData
