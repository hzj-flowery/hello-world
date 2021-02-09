local GatewayListManager = class("GatewayListManager")
local scheduler = require("cocos.framework.scheduler")
local PrioritySignal = require("yoka.event.PrioritySignal")
local GatewayData = require("app.data.GatewayData")

--
function GatewayListManager:ctor()
	self._inited = false
    self._useTestList = false
    self._lastRemoteTime = 0
    self._lastRequestTime = 0
    self._lastRandServer = nil
    self._list = {}
    self.signal = PrioritySignal.new("string")
end

--
function GatewayListManager:clear()
    
end

--
function GatewayListManager:reset()
    
end

--
function GatewayListManager:getGateway()
    return self._list[1]
end

--
function GatewayListManager:isCheckUpdate()
    local time = G_ConfigManager:getGatewayCacheTime() or 900
    if self._lastRemoteTime == 0 or (timer:gets() - self._lastRemoteTime) > time or #self._list == 0 then
        return true
    end
    
    return false
end

--
function GatewayListManager:checkUpdateList()
    if self:isCheckUpdate() then
        local remoteGateway = G_ConfigManager:isRemoteGateway()
        if remoteGateway then
            --[[if self._timer == nil then
                self._timer = scheduler.scheduleGlobal(handler(self, self._onCheckGatewayCache), 900)
            end]]
            self:_getRemoteServerList()
        else
            local ret = G_ConfigManager:getListGateway()
            if ret ~= nil and ret ~= "" then
                local infos = self:_decode(ret)
                if #infos > 0 then
                    local list = {}
                    for i=1, #infos do
                        local info = infos[i]
                        local gateway = GatewayData.new(info)
                        list[#list + 1] = gateway
                    end
                    self:setGatewayList(list)
                end
            end

            self.signal:dispatch("success")
        end
    else
        self.signal:dispatch("success")
    end
end

--
function GatewayListManager:setGatewayList(list)
	self._list = list
end

--
function GatewayListManager:_onCheckGatewayCache()
    self:_getRemoteServerList()
end

--
function GatewayListManager:_getRemoteServerList()
    if self._httpRequest == nil then
        print("GatewayListManager:_getRemoteServerList")
        local url = GATEWAYLIST_URL_TEMPLATE
        url = string.gsub(url, "#domain#", GATEWAYLIST_URL)
        self._httpRequest = cc.XMLHttpRequest:new()
        self._httpRequest.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
        self._httpRequest:open("GET", url)
        self._httpRequest:registerScriptHandler(handler(self, self._onReadyStateChange))
        self._httpRequest:send()
    end
end

--
function GatewayListManager:_onReadyStateChange()
    local e = "fail"
    if self._httpRequest.readyState == 4 and (self._httpRequest.status >= 200 and self._httpRequest.status < 207) then
        local response = self._httpRequest.response
        local infos = self:_decode(self._httpRequest.response)
        if #infos > 0 then
            dump(infos)
            local list = {}
            local addServerList = G_ConfigManager:getAddGateway()
            if addServerList ~= nil and addServerList ~= "" then
                local list = self:_decode(addServerList)
                for k,v in ipairs(list) do
                    local gateway = GatewayData.new(v)
                    list[#list + 1] = gateway
                end
            end

            for i=1, #infos do
                local info = infos[i]
                local gateway = GatewayData.new(info)
                list[#list + 1] = gateway
            end
            self:setGatewayList(list)
            self._lastRemoteTime = timer:gets()
            e = "success"
        end
    end

    self._httpRequest:unregisterScriptHandler()
    self._httpRequest = nil
    self.signal:dispatch(e)
end

--
function GatewayListManager:_decode(response)
    local cache = {}
    local gateways = string.split(response, ",")
    if gateways and #gateways >= 1 then
        for i,v in ipairs(gateways) do
            local ret = string.split(v, "|")
            local info = {}
            info.ip = ret[1]
            info.port = 0
            if ret[2] ~= nil then
                info.port = tonumber(ret[2])
            end
            cache[#cache + 1] = info
        end
    end

    return cache
end

return GatewayListManager