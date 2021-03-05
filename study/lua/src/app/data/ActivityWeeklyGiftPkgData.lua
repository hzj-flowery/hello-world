--豪华礼包活动数据类
--@Author:Conley
local ActivityBaseData = import(".ActivityBaseData")
local ActivityConst = require("app.const.ActivityConst")
local BaseData = require("app.data.BaseData")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local ActWeekDiscount = require("app.config.act_week_discount")
---------------------------------------------------
local ActivityWeeklyGiftPkgUnitData = class("ActivityWeeklyGiftPkgUnitData", BaseData)

local schema = {}
schema["time"] 		= {"number", 0}
schema["id"] 		= {"number",0}
schema["config"] 	= {"table",{}}
ActivityWeeklyGiftPkgUnitData.schema = schema

function ActivityWeeklyGiftPkgUnitData:ctor(properties)
	ActivityWeeklyGiftPkgUnitData.super.ctor(self, properties)
end

-- 清除
function ActivityWeeklyGiftPkgUnitData:clear()
end

-- 重置
function ActivityWeeklyGiftPkgUnitData:reset()
end

function ActivityWeeklyGiftPkgUnitData:initData(id,time)
	self:setTime(time)
	self:setId(id)

	local info = ActWeekDiscount.get(id)
	assert(info,"act_week_discount not find id "..tostring(id))

	self:setConfig(info)
end

function ActivityWeeklyGiftPkgUnitData:getRemainBuyTime()
	local cfg = self:getConfig()
	return cfg.time - self:getTime()
end


--检查是否能购买
function ActivityWeeklyGiftPkgUnitData:checkIsCanBuy()
	local cfg = self:getConfig()
	--元宝和VIP条件
	local vip = cfg.vip
	local gold = cfg.price
	local checkParams = {
			[1] = { funcName = "enoughVip", param =  {vip}  },  --检查资源是否满足
			[2] = { funcName = "enoughCash", param =  {gold}  },  --检查资源是否满足
	}
	local success, errorMsg,funcName  = LogicCheckHelper.doCheckList(checkParams)
	return success, errorMsg,funcName
end

function ActivityWeeklyGiftPkgUnitData:checkVip()
	local cfg = self:getConfig()
	local success, hintCallback = LogicCheckHelper.enoughVip(cfg.vip)
	return success
end


---------------------------------------------------
local ActivityWeeklyGiftPkgData = class("ActivityWeeklyGiftPkgData", BaseData)

local schema = {}
schema["baseActivityData"] 	= {"table", {}}
ActivityWeeklyGiftPkgData.schema = schema

function ActivityWeeklyGiftPkgData:ctor(properties)
	ActivityWeeklyGiftPkgData.super.ctor(self, properties)

	local TimeExpiredData = require("app.data.TimeExpiredData")
	self:setResetType(TimeExpiredData.RESET_TYPE_WEEKLY)

	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_WEEKLY_GIFT_PKG  })
	self:setBaseActivityData(activityBaseData)

	self._unitDataList = {}

	self._s2cGetActDiscountListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActDiscount, handler(self, self._s2cGetActDiscount))
	self._s2cActDiscountListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActDiscount, handler(self, self._s2cActDiscount))
end

-- 清除
function ActivityWeeklyGiftPkgData:clear()
	ActivityWeeklyGiftPkgData.super.clear(self)
	self._s2cGetActDiscountListener:remove() 
	self._s2cGetActDiscountListener = nil

	self._s2cActDiscountListener:remove() 
	self._s2cActDiscountListener = nil


	self:getBaseActivityData():clear()
end

-- 重置
function ActivityWeeklyGiftPkgData:reset()
	ActivityWeeklyGiftPkgData.super.reset(self)
	self:getBaseActivityData():reset()
end

function ActivityWeeklyGiftPkgData:_setUnitData(id,time)
	local unitData = ActivityWeeklyGiftPkgUnitData.new()
	unitData:initData(id,time)
	self._unitDataList["k_"..tostring(id)] =  unitData
end

function ActivityWeeklyGiftPkgData:getUnitData(id)
	return self._unitDataList["k_"..tostring(id)] 
end

function ActivityWeeklyGiftPkgData:getAllShowUnitDatas()
	local dataList = {}
	local myVip = G_UserData:getVip():getLevel()

	for k,v in pairs(self._unitDataList) do
		if myVip >= v:getConfig().vip_show then
			table.insert( dataList,v)
		end
	end
	local sortFunc = function(obj1,obj2)
		local time1 = obj1:getRemainBuyTime() 
		local time2 = obj2:getRemainBuyTime()
		if time1 <= 0 and time2 <= 0 then
			return obj1:getId() > obj2:getId()
		elseif time1 <= 0 then
			return false
		elseif time2 <= 0 then
			return true
		end
		return obj1:getId() < obj2:getId()
	end
	table.sort(dataList,sortFunc)
	return dataList
end

function ActivityWeeklyGiftPkgData:_s2cGetActDiscount(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	if message.discount_type ~= ActivityConst.GIFT_PKG_TYPE_WEEKLY then
		return 
	end
	self:getBaseActivityData():setHasData(true)
	self:resetTime()

	self._unitDataList = {}

	local goodsIds = rawget(message,"goods_ids") or {}
	local buyTimes = rawget(message,"buy_times") or {}
	
	for k,v in ipairs(goodsIds) do
		if v and buyTimes[k] then
			self:_setUnitData(v,buyTimes[k])
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_INFO,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId =ActivityConst.ACT_ID_WEEKLY_GIFT_PKG})
end

function ActivityWeeklyGiftPkgData:_s2cActDiscount(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	if message.discount_type ~= ActivityConst.GIFT_PKG_TYPE_WEEKLY then
		return 
	end
	local ids = rawget(message,"id") or {} 
	local giftId = 0
	for k,id in ipairs(ids) do
		local unitData = self:getUnitData(id)
		if unitData then
			giftId = id
			unitData:setTime(unitData:getTime() + 1)
		end
	end
	G_SignalManager:dispatch(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_REWARD,id,message,giftId)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId =ActivityConst.ACT_ID_WEEKLY_GIFT_PKG})
end

function ActivityWeeklyGiftPkgData:c2sActDiscount(id)
	if self:isExpired() == true then
		self:pullData()
		return 
	end
	G_NetworkManager:send(MessageIDConst.ID_C2S_ActDiscount,  {discount_type = ActivityConst.GIFT_PKG_TYPE_WEEKLY,id = { id}  })
end

function ActivityWeeklyGiftPkgData:c2sGetActDiscount(discountType)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetActDiscount, {discount_type = discountType})
end

function ActivityWeeklyGiftPkgData:pullData()

	self:c2sGetActDiscount(ActivityConst.GIFT_PKG_TYPE_WEEKLY)
end

function ActivityWeeklyGiftPkgData:resetData()
	self:pullData()
	self:setNotExpire()--避免重复取数据
end

function ActivityWeeklyGiftPkgData:hasRedPoint()
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_WEEKLY_GIFT_PKG}
    )
	if showed then
		return false
	end

	return not self:hasBuyAllGoods()
end

function ActivityWeeklyGiftPkgData:hasBuyAllGoods()
	for k,weekUnitData in pairs(self._unitDataList) do
		local buyTime = weekUnitData:getTime()
		if buyTime <=  0 then
			return false
		end 
	end
	return true
end

function ActivityWeeklyGiftPkgData:getRewards(ids)
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

return ActivityWeeklyGiftPkgData