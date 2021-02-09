local Socket = class("Socket")
local ssocket = ssocket

--
function Socket.init()
    ssocket.init()
    --ssocket.code(0)
end

function Socket.clearMessageQueue()
    ssocket.clearMessageQueue()
end

--
function Socket.registerHandler(func)
    ssocket.registerHandler(func)
end

--
function Socket:ctor(index, ip, port)
    self._ip = ip
    self._port = port
    self._connectIndex = index
    self._connected = false
end

--
function Socket:getIndex()
    return self._connectIndex
end

--
function Socket:connect()
    if not self._connected then
        if ssocket.connect_timeout ~= nil then
            ssocket.connect_timeout(self._connectIndex, self._ip, self._port, 15)
        else
            ssocket.connect(self._connectIndex, self._ip, self._port)
        end
    end
end

--
function Socket:connected()
    self._connected = true
end
--
function Socket:send(id, msg)
    if self._connected then
        ssocket.send(self._connectIndex, id, msg, #msg)
    end
end

--
function Socket:disconnect()
    ssocket.disconnect(self._connectIndex)
    self:disconnected()
end

--
function Socket:disconnected()
    self._connected = false
    ssocket.setSession(self._connectIndex, 0, 0)
end

--
function Socket:setSession(userId, sessionId)
    ssocket.setSession(userId, sessionId)
end

--
function Socket:isConnected()
    return self._connected
end

--
function Socket:cleanup()
    self:disconnect()
end



return Socket