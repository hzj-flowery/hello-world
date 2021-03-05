-- Author: nieming
-- Date:2018-02-16 14:20:58
-- Describle：公测预约

local BaseData = require("app.data.BaseData")
local ActivityBetaAppointmentData = class("ActivityBetaAppointmentData", BaseData)
local ActivityConst = require("app.const.ActivityConst")
local ActivityBaseData = import(".ActivityBaseData")
local schema = {}
schema["baseActivityData"] 	= {"table", {}}--基本活动数据
--schema
ActivityBetaAppointmentData.schema = schema


function ActivityBetaAppointmentData:ctor(properties)
	ActivityBetaAppointmentData.super.ctor(self, properties)
	local activityBaseData = ActivityBaseData.new()
	activityBaseData:initData({id = ActivityConst.ACT_ID_BETA_APPOINTMENT  })
	self:setBaseActivityData(activityBaseData)

	self._signalRecvCommonPhoneOrder = G_NetworkManager:add(MessageIDConst.ID_S2C_CommonPhoneOrder, handler(self, self._s2cCommonPhoneOrder))

end

function ActivityBetaAppointmentData:hasRedPoint()
	local state = G_UserData:getBase():getOrder_state()
	local isAlreadyOrder = state ~= 0
	if isAlreadyOrder then
		return false
	end

	local showed = G_UserData:getRedPoint():isTodayShowedRedPointByFuncId(
		FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_BETA_APPOINTMENT}
	)
	if showed then
		return false
	end
	return true
end



function ActivityBetaAppointmentData:clear()
	self._signalRecvCommonPhoneOrder:remove()
	self._signalRecvCommonPhoneOrder = nil

end

function ActivityBetaAppointmentData:reset()

end

-- Describle：
-- Param:
--	phone_num   手机号
function ActivityBetaAppointmentData:c2sCommonPhoneOrder( phone_num)
	G_NetworkManager:send(MessageIDConst.ID_C2S_CommonPhoneOrder, {
		phone_num = phone_num,
	})
end
-- Describle：
function ActivityBetaAppointmentData:_s2cCommonPhoneOrder(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	local awards = rawget(message, "awards") or {}
	--设置 已预约
	G_UserData:getBase():setOrder_state(1)

	G_SignalManager:dispatch(SignalConst.EVENT_COMMON_PHONE_ORDER_SUCCESS,awards)
end

return ActivityBetaAppointmentData
