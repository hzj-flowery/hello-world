-- 心跳服务
local HeartBeatService =  class("HeartBeatService")

local scheduler = require("cocos.framework.scheduler")
local SECONDS = 15000 -- 每X秒一次心跳
local TIMEOUT_SECONDS = 20000 -- X秒内都没收到过心跳包

--
function HeartBeatService:ctor(networkManager)
    self._networkManager = networkManager
    local t = timer:getms()
    self._lastSendCounter = t
    self._lastRecvCounter = t
    self._lastCheckCounter = t
    self._timer = scheduler.scheduleGlobal(handler(self, self._onTimer), 1) 
    self._networkManager:add(MessageIDConst.ID_S2C_KeepAlive, handler(self, self._onAlive))
end

-- 启动心跳服务
function HeartBeatService:start()
    local t = timer:getms()
    self._lastSendCounter = t
    self._lastRecvCounter = t
    self:_send()
end

-- 心跳返回
function HeartBeatService:_onAlive()
    self._lastRecvCounter = timer:getms()
end

-- 单位时间内通知一次服务器
function HeartBeatService:_onTimer()
    local t = timer:getms()
    if t - self._lastCheckCounter > 5000 then
        self._lastRecvCounter = t
    end
    self._lastCheckCounter = t

    local elapsedSend = t - self._lastSendCounter
    local elapsedRecv = t - self._lastRecvCounter

    if not self._networkManager:isConnected() then
        return
    end
    
    if elapsedRecv >= TIMEOUT_SECONDS then
        self._lastRecvCounter = t
        print("[HeartBeatService] time out elapsedSend:",elapsedSend,"elapsedRecv:",elapsedRecv,"TTTT",t)
        G_SignalManager:dispatch(SignalConst.EVENT_NETWORK_DEAD)
        return
    end

    if elapsedSend >= SECONDS then
        self:_send()
    end
end

-- 发送心跳协议
function HeartBeatService:_send()
    self._lastSendCounter = timer:getms() 
    self._networkManager:send(MessageIDConst.ID_C2S_KeepAlive, {})
end

--
function HeartBeatService:isTimeout()
    local t = timer:getms()
    local elapsedRecv = t - self._lastRecvCounter
    if elapsedRecv >= TIMEOUT_SECONDS then
        return true
    end

    return false
end

-- 关闭心跳服务
function HeartBeatService:clear()
    if self._timer ~= nil then
        scheduler.unscheduleGlobal(self._timer)
        self._timer = nil
    end
end


return HeartBeatService