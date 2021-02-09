--首充数据
--@Author:Conley

local BaseData = require("app.data.BaseData")
local ActivityRechargeAwardConst = require("app.const.ActivityRechargeAwardConst")
local CommonConst = require("app.const.CommonConst")
local ActivityFirstPayData = class("ActivityFirstPayData", BaseData)

local schema = {}
ActivityFirstPayData.schema = schema

function ActivityFirstPayData:ctor(properties)
	ActivityFirstPayData.super.ctor(self, properties)
  

    self._signalActivityRechargeAwardUpdate = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE, 
        handler(self, self._onEventActivityRechargeAwardUpdate))  

    self._signalActivityRechargeAwardGetInfo = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO, 
        handler(self, self._onEventActivityRechargeAwardGetInfo))   
end

-- 清除
function ActivityFirstPayData:clear()
    self._signalActivityRechargeAwardUpdate:remove()
	self._signalActivityRechargeAwardUpdate = nil

    self._signalActivityRechargeAwardGetInfo:remove()
	self._signalActivityRechargeAwardGetInfo = nil
end

-- 重置
function ActivityFirstPayData:reset()
   
end

function ActivityFirstPayData:_onEventActivityRechargeAwardGetInfo(event,id,message)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_FIRST_RECHARGE)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_FIRST_RECHARGE)
end

function ActivityFirstPayData:_onEventActivityRechargeAwardUpdate(event,id,message)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_FIRST_RECHARGE) --首充功能入口显示隐藏刷新
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_FIRST_RECHARGE)

end


--发送领取首充奖励消息
function ActivityFirstPayData:c2sActRechargeAward(id)
    G_UserData:getActivityRechargeAward():c2sActRechargeAward(id)
end

--拉取首充是否领取的服务器数据
function ActivityFirstPayData:pullData()
    G_UserData:getActivityRechargeAward():pullData()
end

--是否有首充数据
function ActivityFirstPayData:isHasData()
    return G_UserData:getActivityRechargeAward():isHasData()
end

--@return:返回是否有领取资格
function ActivityFirstPayData:isReachReceiveCondition(id)
    local FirstPay = require("app.config.first_pay")
    local config = FirstPay.get(id)
    assert(config, "first_pay can not find id "..tostring(id))
    local count = G_UserData:getBase():getRecharge_total() 
    local jadeCount = G_UserData:getBase():getRecharge_jade_bi()
    local fakeRechargeCount =  G_UserData:getBase():getRecharge_fake_total()
    --return (count - jadeCount) >= config.charge or fakeRechargeCount >= config.charge
    return jadeCount >= config.charge or fakeRechargeCount >= config.charge
end

--@return:返回是否已领取
function ActivityFirstPayData:hasReceive(id)
    local status = G_UserData:getActivityRechargeAward():getRecordById(id) 
    return status == CommonConst.RECEIVE_HAS
end

--@return:能否领取
function ActivityFirstPayData:canReceive(id)
    if self:isReachReceiveCondition(id) and not self:hasReceive(id) then
        return true
    end
    return false
end

function ActivityFirstPayData:hasRedPoint()
     local FirstPay = require("app.config.first_pay")
     for index = 1,FirstPay.length(),1 do
         local config = FirstPay.indexOf(index)
         if self:canReceive(config.id) then
            return true
         end
     end
     return false
end

function ActivityFirstPayData:getFirstPayList()
    local FirstPay = require("app.config.first_pay")
    local list = {}
    for index = 1,FirstPay.length(),1 do
        local config = FirstPay.indexOf(index)
        table.insert( list,config )
    end
    return list
end

function ActivityFirstPayData:needShowFirstPayAct()
     local FirstPay = require("app.config.first_pay")
     for index = 1,FirstPay.length(),1 do
         local config = FirstPay.indexOf(index)
         if not self:hasReceive(config.id) then
            return true
         end
     end
     return false
end

return ActivityFirstPayData

