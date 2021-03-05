--充值奖励数据类(比如首充)
--@Author:Conley
local ExpireStateData = import(".ExpireStateData")
local BaseData = require("app.data.BaseData")
local ActivityRechargeAwardData = class("ActivityRechargeAwardData", BaseData)
local CommonConst = require("app.const.CommonConst")

local schema = {}
schema["hasData"] 	= {"boolean",false}
ActivityRechargeAwardData.schema = schema

function ActivityRechargeAwardData:ctor(properties)
	ActivityRechargeAwardData.super.ctor(self, properties)
    self._data = {}
    self._oldData = {}
    self._s2cActGetRechargeAwardListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActGetRechargeAward, 
        handler(self, self._s2cActGetRechargeAward))
    self._s2cActRechargeAwardListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ActRechargeAward, 
        handler(self, self._s2cActRechargeAward))

   -- 服务器登陆后通知了
   -- self._signalAllDataReady = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onAllDataReady))    
   --
end

-- 清除
function ActivityRechargeAwardData:clear()
    self._s2cActGetRechargeAwardListener:remove()
	self._s2cActGetRechargeAwardListener = nil

    self._s2cActRechargeAwardListener:remove()
	self._s2cActRechargeAwardListener = nil

   -- self._signalAllDataReady:remove()
   -- self._signalAllDataReady = nil
end

-- 重置
function ActivityRechargeAwardData:reset()
	 self._data = {}
     self._oldData = {}
     self:setHasData(false)
end

function ActivityRechargeAwardData:_initData(intMapArr)
    self._oldData = self._data
    self._data = {}
    for k,v in ipairs(intMapArr) do
       self._data[v.Key] = v.Value
    end
    self:setHasData(true)
end

function ActivityRechargeAwardData:_s2cActGetRechargeAward(id,message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    local record = rawget(message,"record") or {}
    self:_initData(record)

    G_SignalManager:dispatch(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO,id,message)
end

function ActivityRechargeAwardData:_s2cActRechargeAward(id,message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
    local record = rawget(message,"record") or {}
    self:_initData(record)

    G_SignalManager:dispatch(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE,id,message)
end


--@return：找不到返回0
function ActivityRechargeAwardData:getRecordById(id)
    return self._data[id] or CommonConst.RECEIVE_NOT
end

--记录数据是否发生变化
function ActivityRechargeAwardData:isRecordChanged(id)
     if self:getRecordById(id) == self._oldData[id] then
        return false
    else
        return true      
    end
end


function ActivityRechargeAwardData:c2sActGetRechargeAward()
    G_NetworkManager:send(MessageIDConst.ID_C2S_ActGetRechargeAward, {})
end

function ActivityRechargeAwardData:c2sActRechargeAward(record)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ActRechargeAward, {record = record})
end

function ActivityRechargeAwardData:pullData()
    self:c2sActGetRechargeAward()
end

return ActivityRechargeAwardData