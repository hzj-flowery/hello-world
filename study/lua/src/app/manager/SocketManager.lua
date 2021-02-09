local SocketManager = class("SocketManager")
local PrioritySignal = require("yoka.event.PrioritySignal")
local Socket = require("yoka.socket.Socket")

--
function SocketManager:ctor()
    self._socket = nil
    self._connectIndex = 0
    self._sockets = {}
    self.connectSignal = PrioritySignal.new("number", "string")
    self.messageSignal = PrioritySignal.new("number", "number", "string", "number")
    Socket.init()
    Socket.registerHandler(handler(self, self.onSocketHandler))
end

--
function SocketManager:connectToServer(ip, port)
    if self._socket ~= nil then
        self:removeConnect()
    end
    --清空消息队列
    Socket.clearMessageQueue()
    -- 连接服务器
    self._connectIndex = self._connectIndex + 1
    crashPrint("[SocketManager] connectToServer<" .. self._connectIndex .. ", " .. ip .. ":" .. port .. ">")
    self._socket = Socket.new(self._connectIndex, ip, port)
    self._socket:connect()
end

--
function SocketManager:removeConnect()
    crashPrint("[SocketManager] removeConnect")
    if self._socket then
        self._socket:disconnect()
        self._socket = nil
    end
end

--
function SocketManager:send(id, msg)
    crashPrint("[SocketManager] send<" .. id .. ">")
    if self._socket then
        if self._socket:isConnected() then
            self._socket:send(id, msg)
        end
    end
end

--
function SocketManager:setSession(uid, sid)
    crashPrint("[SocketManager] setSession<" .. uid .. "," .. sid .. ">")
    if self._socket then
        self._socket:setSession(uid, sid)
    end
end

--
function SocketManager:isConnected()
    --print("SocketManager:checkConnection", index)
    if self._socket then
        return self._socket:isConnected()
    end

    return false
end

--
function SocketManager:onSocketHandler(event, connectIndex, msgId, msg, len)
    local dis = 0
    crashPrint("[SocketManager] onSocketHandler------------------begin<" .. event .. "," .. connectIndex .. "," .. msgId .. "," .. len .. ">")
    if connectIndex == self._connectIndex then
        dis = 1
        if self._socket then
            dis = 2
            if event == "message" then
                dis = 3
                self.messageSignal:dispatch(msgId, msg, len)
            else
                if event == "connect_success" then
                    dis = 4
                    self._socket:connected()
                elseif event == "connect_fail" or event == "connect_broken" or event == "connect_close" then
                    dis = 5
                    self._socket:disconnected()
                end
                dis = 6
                self.connectSignal:dispatch(event)
            end
        end
    end
    crashPrint("[SocketManager] onSocketHandler------------------end<step=" .. dis .. "," .. event .. "," .. connectIndex .. ">")
end

return SocketManager