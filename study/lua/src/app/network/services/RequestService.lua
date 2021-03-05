local RequestService = class("RequestService")
local Request = require("app.network.Request")
local scheduler = require("cocos.framework.scheduler")

--
function RequestService:ctor(network)
    self._networkManager = network
    self._requestList = {}
    --这里一般是空,当断线后, 把requestList的东西挪动到_cacheReuqestList里, 登陆成功后, 重新把 self._cacheRequestList发一遍
    self._cacheRequestList = {}  

    self._waitTimer = scheduler.scheduleGlobal(handler(self, self._onTimer), 1)

    self._networkManager:addReceive(handler(self, self._onNetReceiveEvent))
end

-- 添加协议请求
function RequestService:addRequest(id, msg)
    local connected = G_NetworkManager:isConnected()
    if not connected then
        if id == MessageIDConst.ID_C2S_FLUSH or id == MessageIDConst.ID_C2S_Login then
            return
        end
    end

    local request = Request.new(id, msg)
    if not connected then
        crashPrint("[RequestService] addRequest <cache, " .. id .. ">")
        self:_addCacheRequest(request)
    else
        crashPrint("[RequestService] addRequest <request, " .. id .. ">")
        table.insert(self._requestList, request)
    end

    self:sendAll()
end

-- 发送队列协议
function RequestService:sendAll() 
    if not G_NetworkManager:isConnected() then 
        return false
    end

    crashPrint("[RequestService] sendAll")
    for i,request in ipairs(self._requestList) do 
        if not request:isSent() then
            request:send()
        end
    end

    self:_checkWaiting()

    return true
end

-- 检查返回协议
function RequestService:_onNetReceiveEvent(msgId, content)
    for i,request in ipairs(self._requestList) do 
        if request:isSent() then
            if request:checkResponse(msgId) then
                crashPrint("[RequestService] _onNetReceiveEvent <" .. request:getId() .. " -> " .. msgId .. ">")
                table.remove(self._requestList, i , 1)
                break
            end
        end
    end

    self:_checkWaiting()
end

-- 检查是否有在等待的协议
function RequestService:_checkWaiting() 
    local waiting = false
    for i,request in ipairs(self._requestList) do 
        if request:isWaiting() then
            waiting = true
            crashPrint("[RequestService] _checkWaiting <" .. request:getId() .. " -> " .. tostring(request:getResponseMsgId()) .. ">")
            break
        end
    end

    self:_showLoading(waiting)
end

--
function RequestService:hasWaiting() 
    local waiting = false
    for i,request in ipairs(self._requestList) do 
        if request:isWaiting() then
            local id = request:getId()
            waiting = true
            break
        end
    end

    return waiting
end

-- 显示等待界面
function RequestService:_showLoading(b) 
    G_WaitingMask:showWaiting(b)
end

-- 添加协议请求到缓存列表
function RequestService:_addCacheRequest(request) 
    local id = request:getId()
    if id ~= MessageIDConst.ID_C2S_KeepAlive and id ~= MessageIDConst.ID_C2S_Login then
        table.insert(self._cacheRequestList, request)
    end
end

-- 网络断开处理，将发送队列协议添加到缓存队列
function RequestService:onDisconnected() 
    --self._cacheRequestList = {}
    --for i,request in ipairs(self._requestList) do 
    --    if not request:isSent() then
    --        self:_addCacheRequest(request)
    --    end
    --end

    crashPrint("[RequestService] onDisconnected")
    self._requestList = {}
    self._cacheRequestList = {} 
    self:_checkWaiting()
end

-- 重新登陆游戏后发送缓存队列协议
function RequestService:checkLoginedGame() 
    for i,request in ipairs(self._cacheRequestList) do 
        table.insert(self._requestList, request)
    end

    self._cacheRequestList = {}
    self:sendAll()
end

-- 检查协议请求是否超时
function RequestService:_onTimer() 
    if not G_NetworkManager:isConnected() then 
        --self:_checkWaiting()
        return false
    end

    --check timeout
    local timeout = false
    local tick = timer:getms()
    for i,request in ipairs(self._requestList) do 
        if request:isTimeout(tick) then
            timeout = true
            crashPrint("[RequestService] _onTimer <" .. request:getId() .. ">")
            break
        end
    end

    if timeout then
        G_SignalManager:dispatch(SignalConst.EVENT_NETWORK_DEAD)
    end
end

--
function RequestService:reset()
    crashPrint("[RequestService] reset")
    self._requestList = {}
    self._cacheRequestList = {} 
end

-- 清理队列
function RequestService:clear()
    self:reset()
    if self._waitTimer ~= nil then
        scheduler.unscheduleGlobal(self._waitTimer)
        self._waitTimer = nil
    end
end

return RequestService
