local ServerListManager = class("ServerListManager")
local scheduler = require("cocos.framework.scheduler")
local PrioritySignal = require("yoka.event.PrioritySignal")
local ServerData = require("app.data.ServerData")
local ServerGroupData = require("app.data.ServerGroupData")

--
function ServerListManager:ctor()
	self._inited = false
    self._useTestList = false
    self._lastRemoteTime = 0
    self._lastRequestTime = 0
    self._lastRandServer = nil
    self._list = {}
    self._group = {}
    self.signal = PrioritySignal.new("string")
end

--
function ServerListManager:clear()
    
end

--
function ServerListManager:reset()
    
end

--
function ServerListManager:isCheckUpdate()
	local uuid = G_GameAgent:getTopUserId()
	if uuid == nil then
		return true
	end
    local time = G_ConfigManager:getServerCacheTime() or 60
    if self._lastRemoteTime == 0 or (timer:gets() - self._lastRemoteTime) > time or #self._list == 0 then
        return true
    end
    
    return false
end

function ServerListManager:resetLastRemoteTime()
	self._lastRemoteTime = 0
end

--
function ServerListManager:checkUpdateList()
	local remoteServer = G_ConfigManager:isRemoteServer()
	if remoteServer then
		local isCheck = G_ConfigManager:isCheckReturnServer() --是否检查回归服
		if isCheck then
			self:_checkReturnServer()
		else
			self:getRemoteServerList(0)
		end
	else
		local ret = {}
		local list_servers = G_ConfigManager:getListServer()
	    if list_servers ~= nil and list_servers ~= "" then
	        local list = json.decode(list_servers)
	        for k,v in pairs(list) do
                local server = ServerData.new(v)
                table.insert(ret, server)
	        end
	    end

	    self:setServerList(ret)
		self.signal:dispatch("success")
	end
end

--
function ServerListManager:setServerList(list)
	--[[local list_servers = G_ConfigManager:getListServer()
    if list_servers ~= nil and list_servers ~= "" then
        local list = json.decode(list_servers)
        for k,v in pairs(list) do
            ret[v.id] = v
        end
    end]]
	self._list = list
end

function ServerListManager:getServerGroup()
    return self._group
end

--
function ServerListManager:_setOpenTimeRankForList(list)
    local sortFunc = function(a,b)
        return checkint(a:getOpentime()) > checkint(b:getOpentime())     
    end
    table.sort(list, sortFunc)
end

--
function ServerListManager:_getAddServerList()
    local ret = {}

    local addServerList = G_ConfigManager:getAddServer()
    if addServerList ~= nil and addServerList ~= "" then
        local list = json.decode(addServerList)
        for k,v in pairs(list) do
            local server = ServerData.new(v)
            ret[v.server] = server
        end
    end

    return ret
end

--
function ServerListManager:getRemoteServerList(isback, eventName)
    local send = function (ip, domain)

        local url = SERVERLIST_URL_TEMPLATE
        url = string.gsub(url, "#domain#", ip)
        url = string.gsub(url, "#userId#", tostring(G_NativeAgent:getDeviceId()))
        url = string.gsub(url, "#gameId#", tostring(G_NativeAgent:getGameId()))
        url = string.gsub(url, "#gameOpId#", tostring(G_NativeAgent:getOpGameId()))
        url = string.gsub(url, "#opId#", tostring(G_NativeAgent:getOpId()))
        url = string.gsub(url, "#time#", os.time())
		url = string.gsub(url, "#isback#", isback)

        print("get server list: " .. tostring(url))

        local xhr = cc.XMLHttpRequest:new()
        xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
        --xhr:setRequestHeader("Accept-Encoding", "gzip")
        --xhr:setRequestHeader("Host", domain)
        xhr:open("POST", url)
		print("ServerListManager:getRemoteServerList, url = ", url)
        local function onReadyStateChange()
			G_WaitingMask:showWaiting(false)
        	local e = "fail"
            if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
                local ret = json.decode(xhr.response)
				dump(ret, "111111111111111111111111111111")
                if ret and ret.status == 1 then
                    local list = {}
                    local group = {}
                    
                    local addServerList = self:_getAddServerList()
                    for k,v in pairs(addServerList) do
                        if v:isHide() == false then
                            table.insert(list, v)
                        end
                    end

                    if ret.data and #ret.data > 0 then
                        for i=1, #ret.data do
                            local info = ret.data[i]
                            if addServerList[info.server] == nil then
                            	local server = ServerData.new(info)
                                table.insert(list, server)
                            end
                        end
                    end
                    if ret.group and #ret.group > 0 then
                        for i=1, #ret.group do
                            local info = ret.group[i]
                            local serverGroup = ServerGroupData.new(info)
                            table.insert(group, serverGroup)
                        end
                    end

                   	--对没有lock的服务器列表进行开服时间排序， 赋值给openTimeRank
                    self:_setOpenTimeRankForList(list)
                    self._lastRemoteTime = timer:gets()
                    self:setServerList(list)
                    self._group = group
					e = eventName or "success"
                end
            end
            xhr:unregisterScriptHandler()
            self.signal:dispatch(e)
        end

        xhr:registerScriptHandler(onReadyStateChange)
        xhr:send()
        self._lastRequestTime = timer:gets()
    end

	G_WaitingMask:showWaiting(true)
    -- 延迟请求
    local t = 5
    if (timer:gets() - self._lastRequestTime) > t then
        t = 0
    end
    scheduler.performWithDelayGlobal(function()
        -- 获取服务器列表
        send(SERVERLIST_URL)
    end, t)
end

--
function ServerListManager:getList()
    local ret = {}

    for i,v in ipairs(self._list) do
        --if v:isValid() then
            ret[#ret + 1] = v
        --end
    end

    return ret
end

--
function ServerListManager:getServerById(serverId)
    for i,server in ipairs(self._list) do
        if tostring(server:getServer()) == tostring(serverId) then
            return server
        end
    end
    
    return nil
end

--
function ServerListManager:getFirstServer()
    local default_server = G_ConfigManager:getDefaultServer()
    local newList = {}
    local list = self:getList()
    if list and #list then
        for i,server in ipairs(list) do 
            if tostring(server:getServer()) == tostring(default_server) then
                return server
            end
            if server:getStatus() == 2 then
                table.insert(newList, server)
            end
        end

        if #newList > 1 then
            return newList[math.random(1, #newList)]
        end
        return list[1]
    end

    return nil
end

--
function ServerListManager:getLastServer()
    local serverInfo = G_StorageManager:load("server")
    if serverInfo then
        return self:getServerById(serverInfo.lastServerId)
    else
        return nil
    end
end

--
function ServerListManager:setLastServerId(sid)
    G_StorageManager:save("server", {lastServerId = sid})
end

--检查回归服
function ServerListManager:_checkReturnServer()
	local url = RETURN_SERVER_CHECK_URL_TEMPLATE
    local topUserId = G_GameAgent:getTopUserId()

    if topUserId == nil then
        return
    end
    url = string.gsub(url, "#domain#", RETURN_SERVER_CHECK_URL)
    local uuid = string.urlencode(topUserId)
    url = string.gsub(url, "#uuid#", uuid)
    
    local xhr = cc.XMLHttpRequest:new()
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    xhr:open("GET", url)
    G_WaitingMask:showWaiting(true)
    print("ServerListManager:_checkReturnServer url = ", url)
    local function onCallback()
        G_WaitingMask:showWaiting(false)
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            local response = json.decode(xhr.response)
            if response then
                local ret = tonumber(response.ret)
                if ret == 1 then
                    local msg = response.msg
                    G_GameAgent:setReturnServerInfo(msg)
                    dump(msg, "0000000000000000000000000000000")
                    if msg.is_back_user == 0 and msg.already_back_sid == "" then --没有回归资格，且没有回归过
                        self:getRemoteServerList(0)
                    else
                        self:getRemoteServerList(1)
                    end
                else
                    logError("ServerListManager:_checkReturnServer is wrong, ret = ".. ret)
                end
            end
        end
        xhr:unregisterScriptHandler()
    end

    xhr:registerScriptHandler(onCallback)
    xhr:send()
end

return ServerListManager