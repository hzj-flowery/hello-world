--全服数据类
--@Author:Conley
local ExpireStateData = import(".ExpireStateData")
local BaseData = require("app.data.BaseData")
local ServerRecordData = class("ServerRecordData", BaseData)
local schema = {}
ServerRecordData.schema = schema

function ServerRecordData:ctor(properties)
	ServerRecordData.super.ctor(self, properties)
    self._data = {}
    self._s2cServerRecordNotifyListener = G_NetworkManager:add(MessageIDConst.ID_S2C_ServerRecordNotify, 
        handler(self, self._s2cServerRecordNotify))
end

-- 清除
function ServerRecordData:clear()
    self._s2cServerRecordNotifyListener:remove()
	self._s2cServerRecordNotifyListener = nil
end

-- 重置
function ServerRecordData:reset()
	 self._data = {}
end

function ServerRecordData:_s2cServerRecordNotify(id,message)
    self._data = {}
    local records = rawget(message,"records") or {}
    for k,v in ipairs(records) do
       self._data["key_"..tostring(v.Key)] = v.Value
    end
    --发送通知
    G_SignalManager:dispatch(SignalConst.EVENT_SERVER_RECORD_CHANGE)
end

--@return：找不到返回0
function ServerRecordData:getRecordById(id)
    --使用字符串，以免服务器传入0等诡异的数字
    return self._data["key_"..tostring(id)] or 0
end

--是否紧急关闭
--ServerRecordConst.SHIFT_FUNCTION_GRAIN_CAR = 8 --暗度陈仓
--value >> shift & 1
function ServerRecordData:isEmergencyClose(shift)
    local ServerRecordConst = require("app.const.ServerRecordConst")
    local value = self:getRecordById(ServerRecordConst.KEY_EMERGENCY)
    local b = bit.brshift(value, shift)
    local result = bit.band(b,1)
    return result == 1
end

return ServerRecordData