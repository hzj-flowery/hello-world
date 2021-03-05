local RoleListManager = class("RoleListManager")
local scheduler = require("cocos.framework.scheduler")
local PrioritySignal = require("yoka.event.PrioritySignal")
local ServerListRoleUnitData = require("app.data.ServerListRoleUnitData")

--
function RoleListManager:ctor()
    self._lastRemoteTime = 0
    self._lastRequestTime = 0
    self._list = {}
    self._uuid = nil
    self.signal = PrioritySignal.new("RoleListManager")
end

--
function RoleListManager:clear()
    
end

--
function RoleListManager:reset()
    
end

--
function RoleListManager:isCheckUpdate()
    if not G_ConfigManager:isGetRoleList() then
        return false
    end
    local uuid = G_GameAgent:getTopUserId() 
    if self._uuid ~= uuid then
        return true
    end

    local time = 60--G_ConfigManager:getServerCacheTime() or 60

    if self._lastRemoteTime == 0 or (timer:gets() - self._lastRemoteTime) > time or #self._list == 0 then
        return true
    end
    
    return false
end

--
function RoleListManager:checkUpdateList(eventName)

	self:_getRemoteServerList(eventName)
end

--
function RoleListManager:setList(list)
	self._list = list
end

--
function RoleListManager:_getRemoteServerList(eventName)
    local send = function (ip, domain)
        local uuid = G_GameAgent:getTopUserId() 
        if not uuid then
            self._lastRemoteTime = timer:gets()
            self._uuid = uuid
            self:setList({})--清空

            self.signal:dispatch("success")
            return 
        end
        local url = ROLELIST_URL_TEMPLATE
        url = string.gsub(url, "#domain#", ip)
        url = string.gsub(url, "#uuid#", tostring(uuid))
        url = string.gsub(url, "#gameOpId#", tostring(G_NativeAgent:getOpGameId()))
        url = string.gsub(url, "#opId#", tostring(G_NativeAgent:getOpId()))

        print("get role list: " .. tostring(url))

        local xhr = cc.XMLHttpRequest:new()
        xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
        --xhr:setRequestHeader("Accept-Encoding", "gzip")
        --xhr:setRequestHeader("Host", domain)
        xhr:open("POST", url)

        local function onReadyStateChange()

        	local e = "fail"
            if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
                local ret = json.decode(xhr.response)
                print(xhr.response)
                if ret then --ret and ret.status == 1
                    local list = {}
          

                    if ret.info and #ret.info > 0 then
                        for i=1, #ret.info do
                            local info = ret.info[i]
                            local unitData = ServerListRoleUnitData.new(info)
                            table.insert(list, unitData)
                        end
                    end

                    self._lastRemoteTime = timer:gets()
                    self._uuid = uuid
                    self:setList(list)
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

    -- 延迟请求
    local t = 10
    if (timer:gets() - self._lastRequestTime) > 10 then
        t = 0
    end
    scheduler.performWithDelayGlobal(function()
        -- 获取服务器列表
        send(ROLELIST_URL)
    end, t)
end

--
function RoleListManager:getList()
    local ret = {}

    for i,v in ipairs(self._list) do
        --if v:isValid() then
            ret[#ret + 1] = v
        --end
    end

    return ret
end

--获取某个serverId服务器下最大等级的角色
function RoleListManager:getMaxLevelRoleInServer(serverId)
    local retData = nil
    local roleList = self:getList()
    for m, roleData in ipairs(roleList) do
        if roleData:getServer_id() == tonumber(serverId) then
            if retData == nil then
                retData = roleData
            elseif roleData:getRole_lv() > retData:getRole_lv() then
                retData = roleData
            end
        end
    end
    return retData
end

--是否是新玩家（没有过角色）
function RoleListManager:isNewPlayer()
    local list = self:getList()
    return #list == 0
end

--获取创建最早的角色所在服务器
function RoleListManager:getEarliestServerId()
    local role = nil
    local roleList = self:getList()
    for m, roleData in ipairs(roleList) do
        if role == nil then
            role = roleData
        elseif roleData:getCreate_time() < role:getCreate_time() then
            role = roleData
        end
    end
    if role then
        return role:getServer_id()
    else
        return nil
    end
end

return RoleListManager