local NetworkManager = class("NetworkManager")

local PrioritySignal = require("yoka.event.PrioritySignal")
local Timeout = require("yoka.utils.Timeout")
local MessageConst = MessageConst
local MessageErrorConst = MessageErrorConst
local MessageError  = require("app.config.net_msg_error")
local UIPopupHelper = require("app.utils.UIPopupHelper")

local FILTER_LIST = {}
FILTER_LIST[MessageIDConst.ID_S2C_KeepAlive] = true
FILTER_LIST[MessageIDConst.ID_S2C_BulletNotice] = true
FILTER_LIST[MessageIDConst.ID_S2C_UpdateRankCakeAndNotice] = true
--FILTER_LIST[MessageIDConst.ID_S2C_ExecuteStage] = true
local FILTER_LIST_RET = {
    [MessageIDConst.ID_S2C_Login] = true,    
    [MessageIDConst.ID_S2C_ActivateAccount] = true,   
}


--
function NetworkManager:ctor()
	self._connectingTimeout = nil
    self._dead = false
    self._connecting = false

    self._signals = {}
    self._sendSignal = PrioritySignal.new("number", "table")
    self._receiveSignal = PrioritySignal.new("number", "table")

	self._hearBeartService = require("app.network.services.HeartBeatService").new(self)
	self._requestService = require("app.network.services.RequestService").new(self)
    self._serverTimeService = require("app.network.services.ServerTimeService").new(self)

	self._signalDeadNetwork = G_SignalManager:add(SignalConst.EVENT_NETWORK_DEAD, handler(self, self._onDeadNetwork))
    --
	self._signalConnect = G_SocketManager.connectSignal:add(handler(self, self._onConnectServer))
    self._signalMessage = G_SocketManager.messageSignal:add(handler(self, self._onRecvMessage))
end

-- 清除连接和定时器
function NetworkManager:clear()
    crashPrint("[NetworkManager] clear")
    self._signalDeadNetwork:remove()
    self._signalConnect:remove()
    self._signalMessage:remove()
    self:disconnect()
    self._hearBeartService:clear()
    self._serverTimeService:clear()
    self._requestService:clear()
end

-- 发送协议
function NetworkManager:send(id, buff)
    crashPrint("[NetworkManager] send <" .. id .. ">")
    if CONFIG_OPEN_DUMP_MESSAGE then
        dump(buff)
    end
    self._sendSignal:dispatch(id, buff)
    self._requestService:addRequest(id, buff)
    self:checkConnection()
end

-- 回到登陆界面时需要重置
function NetworkManager:reset()
    crashPrint("[NetworkManager] reset")
    self:disconnect()
    self._requestService:reset()
end

--
function NetworkManager:checkLoginedGame()
    crashPrint("[NetworkManager] checkLoginedGame")
    self._requestService:checkLoginedGame()
end

-- 开启心跳服务
function NetworkManager:startServerTimeService()
    crashPrint("[NetworkManager] startServerTimeService")
    self._serverTimeService:start()
end

--------------------------------------------------------------------------------------------------------------------
-- 
function NetworkManager:setSession(uid, sid)
    G_SocketManager:setSession(uid, sid)
end

--
function NetworkManager:isConnected()
    return G_SocketManager:isConnected()
end

-- 如果现在网络没有联通, 进行连接
function NetworkManager:checkConnection()
    crashPrint("[NetworkManager] checkConnection")
    if not self:isConnected() then
        crashPrint("[NetworkManager] checkConnection <not connected>")
        --没有连接过服务器, 先开始连接服务器
        if self._connectingTimeout == nil then
            --
            local startJob = function ()
                -- 开始连接
                crashPrint("[NetworkManager] checkConnection <Timeout start connect>")
                self:_showLoading(true)
                self:_connectToServer()
            end

            --
            local timeoutJob = function(finish)
                --超时了
                crashPrint("[NetworkManager] checkConnection <Timeout stop connect timeout>")
                UIPopupHelper.showOfflineDialog(Lang.get("login_network_timeout"))
                self:_showLoading(false)
                self:disconnect()
                self._connectingTimeout = nil
            end

            --
            crashPrint("[NetworkManager] checkConnection <new Timeout>")
            self._connectingTimeout = Timeout.new(startJob, timeoutJob, 30)
            self._connectingTimeout:start()
        end
    end
end

--连接服务器
function NetworkManager:_connectToServer(gateway, port)
    if not gateway or not port then
        crashPrint("[NetworkManager] _connectToServer <update gateway list>")
        G_GatewayListManager.signal:addOnce(handler(self, self._onGateway))
        G_GatewayListManager:checkUpdateList()
    else
        crashPrint("[NetworkManager] _connectToServer <" .. gateway .. ":" .. port .. ">")
        self._connecting = true
        self._connectTime = timer:getms()

        self._dead = false
        G_SocketManager:connectToServer(gateway, port)
    end
end

--
function NetworkManager:_onGateway(ret)
    crashPrint("[NetworkManager] _onGateway <update gateway list: " .. ret .. ">")
    if ret == "success" then
        local gateway = G_GatewayListManager:getGateway()
        if gateway then
            self:_connectToServer(gateway:getIp(), gateway:getPort())
        end
    else
       UIPopupHelper.showOfflineDialog(Lang.get("login_get_server_fail"))
    end
end

-- 连接成功失败socket相关消息
function NetworkManager:_onConnectServer(ret)
    crashPrint("[NetworkManager] _onConnectServer <ret=" .. ret .. ">")
    if ret == "connect_success" then -- socket连接成功 发送心跳包 绑定消息
        self:_showLoading(false)
        if self._connectingTimeout ~= nil then
            self._connectingTimeout:stop()
            self._connectingTimeout = nil
        else
            crashPrint("[NetworkManager] _onConnectServer <connecting Timeout is nil>")
        end

        if self._connecting then
            self._dead = false
            G_SocketManager:setSession(0, 0)
            self._hearBeartService:start()
            G_GameAgent:loginGame()
        else
            crashPrint("[NetworkManager] _onConnectServer <not connecting>")
        end
    else  -- socket 断开 
        --self._dead = true
        if self._connectingTimeout ~= nil then
            -- 连接服务器时socket断开
            crashPrint("[NetworkManager] _onConnectServer <connecting fail>")
            self._connectingTimeout:timeout()   
        else
            crashPrint("[NetworkManager] _onConnectServer <connecting close>")
            self:disconnect()
        end
    end
end

--
function NetworkManager:disconnect()
    crashPrint("[NetworkManager] disconnect")

    self._connecting = false
    if self._dead then
        crashPrint("[NetworkManager] disconnect <dead>")
        return
    end
    
    crashPrint("[NetworkManager] disconnect <remove connect>")
    G_SocketManager:removeConnect()
    
    self._requestService:onDisconnected()
    self._dead = true
end

--
function NetworkManager:_onDeadNetwork()
    crashPrint("[NetworkManager] _onDeadNetwork")

    --如果现在有协议在等待返回， 断开后弹框提示
    local isWaiting = self._requestService:hasWaiting()
    if isWaiting then
        crashPrint("[NetworkManager] _onDeadNetwork <show PopupOffline>")
       UIPopupHelper.showOfflineDialog(Lang.get("login_network_disconnect"))
    end

    self:disconnect()
end

-- 显示等待菊花
function NetworkManager:_showLoading(b) 
    G_WaitingMask:showWaiting(b)
end


--------------------------------------------------------------------------------------------------------------------
--
function NetworkManager:addSend(listener, priority)
    return self._sendSignal:registerListenerWithPriority(listener, false, priority or 0)
end

--
function NetworkManager:addReceive(listener, priority)
    return self._receiveSignal:registerListenerWithPriority(listener, false, priority or 0)
end
--
function NetworkManager:add(messageID, listener, priority)
    return self:_registerListener(messageID, listener, false, priority or 0)
end

--
function NetworkManager:addOnce(messageID, listener, priority)
    return self:_registerListener(messageID, listener, true, priority or 0)
end

--
function NetworkManager:_registerListener(messageID, listener, once, priority)
    local key = "signal_" .. messageID
    local signal = self._signals[key]
    if not signal then
        signal = PrioritySignal.new("number", "table")
        self._signals[key] = signal
    end

    return signal:registerListenerWithPriority(listener, once or false, priority or 0)
end


--用于pbc的协议copy
function NetworkManager:_metatableTransToTable(data)
    if data == nil then
	    return nil
	end

	if "table"  ~= type(data) then
		return data
	end
	local rTable = {}
	for k ,v in pairs(data) do
		local type_name = type(v)
     	rTable[k] = NetworkManager:_metatableTransToTable(v)
	end
	return rTable
end


--
function NetworkManager:_onRecvMessage(msgId, msgBuf, msgLen)
    local cs = MessageConst["cs" .. msgId]
    assert(cs, string.format("can not find MessageConst, msgId = %d", msgId))

    crashPrint("[NetworkManager] _onRecvMessage <id:" .. msgId .. ",len:" .. msgLen .. ">")
    local buff = pbc.decode(cs, msgBuf, msgLen)
    if buff then

        local convtbuff = buff --self:_metatableTransToTable(buff)
        if CONFIG_OPEN_DUMP_MESSAGE then
            if FILTER_LIST[msgId] == nil then
                dump(convtbuff, cs, 100)
            end
        end
        
        if rawget(convtbuff, "ret") then
            crashPrint("[NetworkManager] _onRecvMessage <id:" .. msgId .. ",ret:" .. convtbuff.ret .. ">")
            if FILTER_LIST_RET[msgId] == nil then
                self:_onMessageError(convtbuff.ret)
            end
        end

        --
        self._receiveSignal:dispatch(msgId, convtbuff)

        --
        local key = "signal_" .. msgId
        local signal = self._signals[key]
        if signal then
            signal:dispatch(msgId, convtbuff)
        end
    end
end


function NetworkManager:_procMessageError(errorId)
    local UserCheck = require("app.utils.logic.UserCheck")
    
	if errorId == MessageErrorConst.RET_HERO_BAG_FULL then
		local isFull, left, popupDlg = UserCheck.isHeroFull()
		popupDlg()
        return true
	end
	if errorId == MessageErrorConst.RET_EQUIP_BAG_FULL then
		local isFull, left, popupDlg = UserCheck.isEquipmentFull()
		popupDlg()
        return true
	end
	if errorId == MessageErrorConst.RET_TREASURE_BAG_FULL then
		local isFull, left, popupDlg = UserCheck.isTreasureFull()
		popupDlg()
        return true
	end
	if errorId == MessageErrorConst.RET_TINSTRUMENT_BAG_FULL then
		local isFull, left, popupDlg = UserCheck.isInstrumentFull()
		popupDlg()
        return true
    end
    if errorId == MessageErrorConst.RET_FIGHTS_MATCH_TIMEOUT or 
        errorId == MessageErrorConst.RET_FIGHTS_CANCEILMATCH_TIMEOUT or
        errorId == MessageErrorConst.RET_FIGHTS_MATCH_FORBIT or 
        errorId == MessageErrorConst.RET_GUILD_TRAIN_INTERVAL or 
        errorId == MessageErrorConst.RET_FIGHTS_SEASONREWARDS_GOT then
        return true
    end
    return false
end

--
function NetworkManager:_onMessageError(ret)
    if ret ~= MessageErrorConst.RET_OK then
        --服务器返回错误消息时，清理回调信号
        
        G_SceneManager:clearWaitEnterSignal()

        --处理过背包已满，则不用弹提示信息了
        if self:_procMessageError(ret) == true then
            return
        end

        local errMsg = MessageError.get(ret)
        local txt = errMsg and errMsg.error_msg or ""
        if ret == MessageErrorConst.RET_ERROR then
            local tip = G_ConfigManager:getServerUnknownErrorTip()
            if tip ~= nil and tip ~= "" then
                txt = tip
            end
            return
        end

        if txt ~= nil and txt ~= "" then
            G_Prompt:showTip(txt)
        else
            G_Prompt:showTip("Unknown ret: "..tostring(ret))
        end
    end
end


return NetworkManager