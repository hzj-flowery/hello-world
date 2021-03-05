--充值数据
--@Author:Conley

local BaseData = import(".BaseData")
local RechargeMonthCardData = import(".RechargeMonthCardData")
local RechargeData = class("RechargeData", BaseData)

local schema = {}
RechargeData.schema = schema

function RechargeData:ctor(properties)
	RechargeData.super.ctor(self, properties)
	self._rechargeDataList = {}
	self._s2cGetRechargeListener = G_NetworkManager:add(MessageIDConst.ID_S2C_GetRecharge, handler(self, self._s2cGetRecharge))
	self._s2cRechargeNoticeListener = G_NetworkManager:add(MessageIDConst.ID_S2C_RechargeNotice, handler(self, self._s2cRechargeNotice))
end

-- 清除
function RechargeData:clear()
	self._s2cGetRechargeListener:remove()
	self._s2cGetRechargeListener = nil

	self._s2cRechargeNoticeListener:remove()
	self._s2cRechargeNoticeListener = nil
end

-- 重置
function RechargeData:reset()
	self._rechargeDataList = {}
end

function RechargeData:_setRechargeUnitData(id,rechargeData)
	self._rechargeDataList["k_"..tostring(id)] = rechargeData
end

function RechargeData:_s2cGetRecharge(id, message)
	--required uint32 ret = 1;
	--repeated MonthlyCard month_card = 2;//月卡
	--repeated uint32 recharge_money = 3;//首冲的档位
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	self:reset()
	local monthCardList = rawget(message,"month_card") or {}
	for k,monthlyCard in ipairs(monthCardList) do
		local data = RechargeMonthCardData.new()
		data:initData(monthlyCard)
		self:_setRechargeUnitData(monthlyCard.id,data)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_RECHARGE_GET_INFO,id,message)
	
	--首充红点
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_FIRST_RECHARGE)
	--月卡
	local ActivityConst = require("app.const.ActivityConst")
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_WELFARE,{actId =ActivityConst.ACT_ID_MONTHLY_CARD})
	
end

function RechargeData:_s2cRechargeNotice(id,message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_RECHARGE_NOTICE,id,message)
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,  FunctionConst.FUNC_RECHARGE)
end

function RechargeData:getRechargeUnitDataById(id)
	return self._rechargeDataList["k_"..tostring(id)]
end 

function RechargeData:pullData()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetRecharge, {})
end


return RechargeData