-- 服务器时间同步服务
local ServerTimeService =  class("ServerTimeService")

local scheduler = require("cocos.framework.scheduler")   
local SECONDS = 120-- 每X秒一次同步

--
function ServerTimeService:ctor(networkManager)
     --self._lastSendTime = 0
     self._counter = 0
     self._networkManager = networkManager

     self._signalServerTime = networkManager:add(MessageIDConst.ID_S2C_GetServerTime, handler(self, self._recvGetServerTime))
end

-- 启动时间同步服务
function ServerTimeService:start()
    if self._timer == nil then
        self._timer = scheduler.scheduleGlobal(handler(self, self._checkServerTime), 1)    
    end

    self:_sendGetServerTime()
end

-- 单位时间内同步一次服务器时间
function ServerTimeService:_checkServerTime()
    if not self._networkManager:isConnected() then
        return
    end

    self._counter = self._counter + 1
    if self._counter >= SECONDS then
        self:_sendGetServerTime()
    end
end

-- 发送时间同步协议
function ServerTimeService:_sendGetServerTime()
    self._networkManager:send(MessageIDConst.ID_C2S_GetServerTime, {})
    self._counter = 0
end

-- 关闭时间同步服务
function ServerTimeService:clear()
    if self._timer ~= nil then 
        scheduler.unscheduleGlobal(self._timer)
        self._timer = nil
    end
    self._signalServerTime:remove()
    self._signalServerTime = nil
end



--客户端服务器时间同步
function ServerTimeService:_recvGetServerTime( id, message)
    local zoneMiniutes = message.zone
    local t = message.time
    zoneMiniutes = zoneMiniutes - 720
    local zone = zoneMiniutes / 60

    --print( "set server time: " .. t  .."," .. zone)
    G_ServerTime:setTime(t, zone)
end

return ServerTimeService
