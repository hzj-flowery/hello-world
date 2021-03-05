local NativeAgent = require("app.agent.NativeAgent")
local NativeAgentDevelop = class("NativeAgentDevelop", NativeAgent)

local PrioritySignal = require("yoka.event.PrioritySignal")
local PopupLogin = require("app.ui.PopupLogin")
local NativeConst = require("app.const.NativeConst")
--
function NativeAgentDevelop:ctor()
	NativeAgentDevelop.super.ctor(self)
	self._userID = ""
end

--
function NativeAgentDevelop:init()
	self:_dispatch({event = NativeConst.SDKCheckVersionResult, 
					  ret = NativeConst.CHECK_VERSION_TYPE_WITHOUT})
end

--
function NativeAgentDevelop:_dispatch(data)
	self:_onNativeCallback(json.encode(data))
end

--
function NativeAgentDevelop:getLoginName()
	return self._userID
end

--
function NativeAgentDevelop:getDeviceId()
	return "develop"
end

--获取分包id
function NativeAgentDevelop:getChannelId()
    return "0"
end

--
function NativeAgentDevelop:getGameId()
	return SPECIFIC_GAME_ID
end

--获取运营商id
function NativeAgentDevelop:getOpId()
	return SPECIFIC_OP_ID
end

--获取运营平台id
function NativeAgentDevelop:getOpGameId()
	return SPECIFIC_GAME_OP_ID
end

--
function NativeAgentDevelop:login()
	local info = G_StorageManager:load(self.__cname)
	if info and info.userName ~= "" then
		self._userID = info.userName
		self:_getTokenLocal(SPECIFIC_OP_ID, info.userName)
	else
        self:_openPopupLogin()
	end
end

function NativeAgentDevelop:_openPopupLogin()
	local callback = function (name, psw)
		self._userID = name
		self:_getTokenLocal(SPECIFIC_OP_ID, name)
	end
	local login = PopupLogin.new(callback)
	login:openWithAction()
end

--
--function NativeAgentDevelop:callNativeFunction(func, param, returnType)
--	return ""
--end

--
function NativeAgentDevelop:onGetToken(ret, response)
	if ret == 1 then
		G_StorageManager:save(self.__cname, {userName = self._userID})
		self:_dispatch({event=NativeConst.SDKLoginResult, ret=NativeConst.STATUS_SUCCESS, param=response})
	else
		self:_dispatch({event=NativeConst.SDKLoginResult, ret=NativeConst.STATUS_FAILED, param=""})
	end
end

--
function NativeAgentDevelop:_getTokenLocal(opId, uid, callback)
	--
	local data = {}
	data['topUserID'] = uid
	data['topUserName'] = uid
	data['platformID'] = self:getOpGameId()
	data['sdkUserName'] = ""
	data['sdkUserID'] = uid
	data['channelID'] = opId
	data['token'] = "8150c2bcf918221df25313d46a18a033"
	data['timestamp'] = tostring(timer:gets()*1000)
	data['sign'] = md5.sum(uid..uid..uid..'8150c2bcf918221df25313d46a18a033' .. TOKEN_KEY)
    data['extension'] = "gptxxxxxxx|0|1"
	--local ret = {}
	--ret["state"] = 1
	--ret["data"] = base64.encode(json.encode(data))
    
	self:onGetToken(1, json.encode(data))
end
--
function NativeAgentDevelop:_getToken(opId, uid, callback)
	G_WaitingMask:showWaiting(true)
	local url = TOKEN_URL_TEMPLATE
	url = string.gsub(url, "http://url", "http://" .. TOKEN_URL)
    url = url .. "?op_id=" .. opId .. "&uid=" .. uid
    print(url)
    local xhr = cc.XMLHttpRequest:new()
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    --xhr:setRequestHeader("Host", domain)
    xhr:open("GET", url)

    local function onReadyStateChange()
    	G_WaitingMask:showWaiting(false)
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            if xhr.response ~= nil and xhr.response ~= "" then
            	self:onGetToken(1, xhr.response)
            	return
            end
        end
        self:onGetToken(0, "")
    end

    xhr:registerScriptHandler(onReadyStateChange)
    xhr:send()
end

--
function NativeAgentDevelop:getLogoutType()
	return NativeConst.LOGOUT_TYPE_UNAVAILABLE
end
--
function NativeAgentDevelop:logout()
	G_StorageManager:save(self.__cname, {userName = ""})
	self:_dispatch({event = NativeConst.SDKLogoutResult, 
					ret = NativeConst.STATUS_SUCCESS, 
					param = ""})
end

--
function NativeAgentDevelop:getExitType()
	return 0
end
--
function NativeAgentDevelop:exit()
	
end

--
function NativeAgentDevelop:hasFloatWindow()
	return false
end

--
function NativeAgentDevelop:openFloatWindow()
	
end

--
function NativeAgentDevelop:closeFloatWindow()
	
end

--
function NativeAgent:pay(appid, price, productId, productName, productDesc)
	local order = {}


	local info = G_StorageManager:load(self.__cname)

	local server = G_GameAgent:getLoginServer()
  	local value = "channelID=#channelID#&currency=RMB&extension=#extension#&gameID=#gameID#&money=#money#&orderID=#orderID#&orderTime=#orderTime#&platformID=#platformID#&productID=#productID#&serverID=#serverID#&userName=#userName#"
  	local orderTime = os.date("%y%m%d%H%M%S", os.time())
  	local orderID = tostring(timer:getms()):reverse():sub(1, 7)
	local domain = RECHARGE_TEST_URL
    local url = RECHARGE_TEST_URL_TEMPLATE
    url = string.gsub(url, "http://url", "http://" .. domain)
    url = string.gsub(url, "#gameID#", tostring(self:getGameId()))
    url = string.gsub(url, "#platformID#", tostring(self:getOpGameId()))
    url = string.gsub(url, "#channelID#", tostring(self:getOpId()))
    url = string.gsub(url, "#extension#", "")
    url = string.gsub(url, "#productID#", productId)
    url = string.gsub(url, "#orderID#", orderID)
    url = string.gsub(url, "#userName#", info.userName)
    url = string.gsub(url, "#serverID#", server:getServer())
    url = string.gsub(url, "#money#", price)
    url = string.gsub(url, "#orderTime#", orderTime)

    value = string.gsub(value, "#gameID#", tostring(self:getGameId()))
    value = string.gsub(value, "#platformID#", tostring(self:getOpGameId()))
    value = string.gsub(value, "#channelID#", tostring(self:getOpId()))
    value = string.gsub(value, "#extension#", "")
    value = string.gsub(value, "#productID#", productId)
    value = string.gsub(value, "#orderID#", orderID)
    value = string.gsub(value, "#userName#", info.userName)
    value = string.gsub(value, "#serverID#", server:getServer())
    value = string.gsub(value, "#money#", price)
    value = string.gsub(value, "#orderTime#", orderTime)
    
    url = string.gsub(url, "#sign#", md5.sum(value .. "common"))


    print("pay url = " .. url)
    --
	local xhr = cc.XMLHttpRequest:new()
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    --xhr:setRequestHeader("Host", domain)
    xhr:open("GET", url)

    local function onReadyStateChange()
        local result = "fail"
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            if xhr.response ~= nil and xhr.response ~= "" then
                if xhr.response == "ok" then
                    result = "success"
                end
                print("pay result=" .. xhr.response)
            end
        end

    end

    xhr:registerScriptHandler(onReadyStateChange)
    xhr:send()


end

return NativeAgentDevelop