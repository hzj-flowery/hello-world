local Request =  class("Request")

-- 超时时间
local TIMEOUT = 30000
local MessageIDConst = MessageIDConst
local MessageConst = MessageConst
local pbc = pbc

--过滤
local FILTER_LIST = {
    [MessageIDConst.ID_C2S_KeepAlive] = true,    
    [MessageIDConst.ID_C2S_GetServerTime] = true
}

--
local function setup()
    local ret = {}
    -- 响应的协议id
    local responseProtoId = nil
    -- 检索消息列表
    for k, v in pairs(MessageIDConst) do
        -- 查找是否有返回协议
        if string.sub(k, 4, 6) == "C2S" then
            -- 找出对应的协议名称
            responseProtoId = string.gsub(k, "C2S", "S2C")
            -- 如果有则认为是成对的，加入列表当中
            if MessageIDConst[responseProtoId] ~= nil then
                if FILTER_LIST[v] == nil then
                    ret[v] = MessageIDConst[responseProtoId]
                end
            end
        end
    end
    return ret
end

--
function Request:ctor(id, msg)
    -- 监控等待的协议列表
    if not Request._monitorProtocols then
        Request._monitorProtocols = setup()
    end

    self._id            = id                                        --协议ID
    self._msg           = pbc.encode(MessageConst["cs" .. id], msg)
    self._sent          = false                                     --是否已经发送
    self._reponseId     = Request._monitorProtocols[id] or 0        --响应的msgId, 只有monitor的协议,这个字段才有意义
    self._responsed     = false                                     --是否已经得到响应, 只有monitor的协议,这个字段才有意义
    self._sendTime      = 0                                         --发送时间
    self._checkTime     = 0
end

-- 是否已经发送
function Request:isSent()
    return self._sent
end

-- 发送
function Request:send()
    G_SocketManager:send(self._id, self._msg)
    self._sendTime = timer:getms()
    self._checkTime = self._sendTime
    self._sent = true
    print("[Request] send id = " .. self._id .. ", time = " .. self._sendTime)
end

-- 检查返回协议
function Request:checkResponse(responseId)
    if self._responsed then
        return false
    end

    if self._reponseId == responseId then
        self._responsed = true
    end

    return self._responsed
end

-- 获取协议ID
function Request:getId()
    return self._id
end

-- 获取返回协议ID
function Request:getResponseMsgId()
    return self._reponseId
end

-- 获取是否在等待返回协议
function Request:isWaiting()
    if self._reponseId == 0 then
        return false
    end

    if self._sent and self._responsed == false then
        return true
    end

    return false
end

-- 获取是否协议发送超时
function Request:isTimeout(now)
    if self._reponseId == 0 then
        return false
    end

    if self._responsed then
        return false
    end

    if now - self._checkTime > 5000 then
        print("Request:isTimeout = " .. now - self._checkTime)
        self._sendTime = now
    end
    self._checkTime = now

    if TIMEOUT <= now - self._sendTime then
        return true
    end

    return false
end

return Request