-- Author: nieming
-- Date:2018-02-13 14:02:13
-- Describle：充值返利
local ActivityBaseData = import(".ActivityBaseData")
local BaseData = import(".BaseData")
local RechargeRebateData = class("RechargeRebateData", BaseData)
local ActivityConst = require("app.const.ActivityConst")
local schema = {}
--schema
schema["baseActivityData"] 	= {"table", {}}--基本活动数据

RechargeRebateData.schema = schema


function RechargeRebateData:ctor(properties)
	RechargeRebateData.super.ctor(self, properties)

	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_RECHARGE_REBATE  })
	self:setBaseActivityData(activityBaseData)

	self._curRechargeInfo = nil
	self._isTakenRebate = nil
	self._allRebates = nil
	self._startTime = nil

	self._signalRecvGetCurrentRechargeRebate = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCurrentRechargeRebate, handler(self, self._s2cGetCurrentRechargeRebate))

	self._signalRecvGetRechargeRebateInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetRechargeRebateInfo, handler(self, self._s2cGetRechargeRebateInfo))

	self._signalRecvGetRechargeRebateAward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetRechargeRebateAward, handler(self, self._s2cGetRechargeRebateAward))

	-- self._signalRecvFlushData = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onEventRecvFlushData))


end

function RechargeRebateData:clear()
	self._signalRecvGetCurrentRechargeRebate:remove()
	self._signalRecvGetCurrentRechargeRebate = nil

	self._signalRecvGetRechargeRebateInfo:remove()
	self._signalRecvGetRechargeRebateInfo = nil

	self._signalRecvGetRechargeRebateAward:remove()
	self._signalRecvGetRechargeRebateAward = nil

	-- self._signalRecvFlushData:remove()
	-- self._signalRecvFlushData = nil
end

function RechargeRebateData:reset()
	self._curRechargeInfo = nil
	self._isTakenRebate = nil
	self._allRebates = nil
	self._startTime = nil
end

function RechargeRebateData:getCurRechargeNum(isForceGet)
	if isForceGet then
		self:c2sGetCurrentRechargeRebate()
		return
	end

	if self._curRechargeNum then
		return self._curRechargeNum
	end
	self:c2sGetCurrentRechargeRebate()
end

function RechargeRebateData:isNotTakenRebate()
	if self._isTakenRebate ~= nil then
		return self._isTakenRebate ~= 1
	end
	return false
end

--获取 充值返利界面所需的信息
function RechargeRebateData:getRebateInfo()
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local DataConst = require("app.const.DataConst")
	local totalMoney = 0
	local totalReturnMoney = 0
	local totalReturnVip = 0
	for k, v in ipairs(self._allRebates)do
		totalMoney = totalMoney + v.money
		totalReturnMoney = totalReturnMoney + v.returnMoney
		totalReturnVip = totalReturnVip + v.returnVipExp
	end
	local awards = {
		{
			type = TypeConvertHelper.TYPE_RESOURCE,
			value = DataConst.RES_DIAMOND,
			size = totalReturnMoney,
		},
		{
			type = TypeConvertHelper.TYPE_RESOURCE,
			value = DataConst.RES_VIP,
			size = totalReturnVip,
		}
	}
	return self._startTime, totalMoney, awards
end

function RechargeRebateData:hasRedPoint()
	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_RECHARGE_REBATE}
	)
	if showed then
		return false
	end
	return true
end

---登录完成 后拉取 一次充值返利
-- function RechargeRebateData:_onEventRecvFlushData()
-- 	self:c2sGetRechargeRebateInfo()
-- end
-- Describle：!获取当前充值返利信息
-- Param:

function RechargeRebateData:c2sGetCurrentRechargeRebate()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetCurrentRechargeRebate, {

	})
end
-- Describle：!获取当前充值返利信息
function RechargeRebateData:_s2cGetCurrentRechargeRebate(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local rebates = rawget(message, "rebates")
	if rebates then
		self._curRechargeNum = {}
		self._curRechargeNum.money = rebates.money
		self._curRechargeNum.returnMoney = rebates.returnMoney
		self._curRechargeNum.returnVipExp = rebates.returnVipExp
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GET_CURRENT_RECHARGE_REBATE_SUCCESS)
end




function RechargeRebateData:c2sGetRechargeRebateInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetRechargeRebateInfo, {

	})
end
-- Describle：
-- Param:
-- Describle：
function RechargeRebateData:_s2cGetRechargeRebateInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	self._isTakenRebate = nil
	local is_taken = rawget(message, "is_taken")
	if is_taken then
		self._isTakenRebate = is_taken
	end
	self._allRebates = {}
	local rebates = rawget(message, "rebates")
	if rebates then
		for k, v in pairs(rebates) do
			local single = {}
			single.money = v.money
			single.returnMoney = v.returnMoney
			single.returnVipExp = v.returnVipExp
			table.insert(self._allRebates, single)
		end
	end
	self._startTime  = 0
	local start_time = rawget(message, "start_time")
	if start_time then
		self._startTime = start_time
	end
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RECHARGE_REBATE)
	G_SignalManager:dispatch(SignalConst.EVENT_GET_RECHARGE_REBATE_INFO_SUCCESS)
end
-- Describle：
-- Param:

function RechargeRebateData:c2sGetRechargeRebateAward()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetRechargeRebateAward, {

	})
end
-- Describle：
function RechargeRebateData:_s2cGetRechargeRebateAward(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local award = rawget(message, "award")
	if not award then
		award = {}
	end
	self._isTakenRebate = 1
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RECHARGE_REBATE)
	G_SignalManager:dispatch(SignalConst.EVENT_GET_RECHARGE_REBATE_AWARD_SUCCESS,award)
end

return RechargeRebateData
