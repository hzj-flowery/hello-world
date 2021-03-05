local NativeAgent = class("NativeAgent")

local Application = cc.Application:getInstance()
local sharedDirector = cc.Director:getInstance()
local LuaNativeBridge = require("yoka.utils.LuaNativeBridge")
local PrioritySignal = require("yoka.event.PrioritySignal")
local NativeConst = require("app.const.NativeConst")
local VipPaySpecial = require("app.config.vip_pay_special")
local targetPlatform = Application:getTargetPlatform()

--
function NativeAgent:ctor()
	--
	self._init = false
	self._nativeVersion = 0
	self._opId = "unknown"
	self._opGameId = "unknown"
	self._adCode = "0"
	self._nativeType = "unknown"
	self._nativeModel = "unknown"
	self._appPackage = "unknown"
	self._deviceId = "unknown"
	if targetPlatform == cc.PLATFORM_OS_WINDOWS then
	    self._nativeType = "windows"
	elseif targetPlatform == cc.PLATFORM_OS_MAC then
	    self._nativeType = "mac"
	elseif targetPlatform == cc.PLATFORM_OS_ANDROID then
	    self._nativeType = "android"
	elseif targetPlatform == cc.PLATFORM_OS_IPHONE or targetPlatform == cc.PLATFORM_OS_IPAD then
	    self._nativeType = "ios"
		if targetPlatform == cc.PLATFORM_OS_IPHONE then
		    self._nativeModel = "iphone"
		else
		    self._nativeModel = "ipad"
		end
	end

	-- signal
	self.signal = PrioritySignal.new("table")
	self._appVersion = Application:getVersion()
	self._runCode = appcode()
	print("self._runCode = " .. self._runCode)
end

--
function NativeAgent:init()
	-- 注册回调
	self:callNativeFunction("registerScriptHandler", {{listener = handler(self, self._onNativeCallback)}})
end

--
function NativeAgent:_initAgent()
	-- 获取参数
	self._deviceId = self:callNativeFunction("getDeviceId", nil, "string")
	self._nativeModel = self:callNativeFunction("getDeviceModel", nil, "string")
	self._appPackage = self:callNativeFunction("getAppPackage", nil, "string")

	--
	local op = self:callNativeFunction("getChannelID", nil, "string")
	if op ~= nil and op ~= "" then
		self._opId = op
	end

	--
	local opgame = self:callNativeFunction("getPlatformID", nil, "string")
	if opgame ~= nil and opgame ~= "" then
		self._opGameId = opgame
		if opgame == "1003" then
			-- 应用宝切换到安卓混服平台
			self._opGameId = "1001"
		end
	end

	--
	local adcode = self:callNativeFunction("getAdCode", nil, "string")
	if adcode ~= nil and adcode ~= "" then
		self._adCode = adcode
	end

	-- 初始化sdk
	self:callNativeFunction("initSDK")
end

--
function NativeAgent:clear()
	
end

--
function NativeAgent.callStaticFunction(func, params, returnType)
	if targetPlatform == cc.PLATFORM_OS_ANDROID then
		--android
		return LuaNativeBridge.call("org.cocos2dx.sdk.NativeAgent", func, params, returnType)
	elseif targetPlatform == cc.PLATFORM_OS_IPHONE or targetPlatform == cc.PLATFORM_OS_IPAD then
		--ios
		return LuaNativeBridge.call("NativeAgent", func, params, returnType)
	elseif targetPlatform == cc.PLATFORM_OS_WINDOWS then
        if func == "getDeviceModel" then
            return getDeviceModel()
        elseif func == "clipboard" then
        	clipboard(params[1]["str"])
        end
	end
	return nil
end

-- 调用原生平台方法
function NativeAgent:callNativeFunction(func, params, returnType)
	if func ~= "crashLog" then
		self:crashLog("NativeAgent:" .. func)
	end
	return NativeAgent.callStaticFunction(func, params, returnType)
end

-- 调用原生平台方法回调
function NativeAgent:_onNativeCallback(data)
	local result = json.decode(data)
	if result then
        if result.event == NativeConst.SDKAgentVersion then
            -- 注册成功，返回NativeAgent版本号
            self._nativeVersion = result.ret or 0
			self:_initAgent()
		elseif result.event == NativeConst.SDKCheckVersionResult then
			self._init = true
    		self:crashSetAppVersion(self:getAppVersion() .. "_" .. VERSION_RES)
		end
	end
	dump(result, "NativeAgent", 10)
	self.signal:dispatch(result)
end

--获得agent的version
function NativeAgent:getNativeVersion()
    return self._nativeVersion
end

-- 获取app版本号
function NativeAgent:getAppVersion()
	return self._appVersion
end

-- 获取app包名
function NativeAgent:getAppPackage()
	return self._appPackage
end

-- 获取原生平台类型
function NativeAgent:getNativeType()
	return self._nativeType
end

-- 获取原生平台型号
function NativeAgent:getNativeModel()
	return self._nativeModel
end

-- 获取可运行版本
function NativeAgent:getRunCode()
	return self._runCode
end

--获取设备id
function NativeAgent:getDeviceId()
	return self._deviceId
end

--获取分包id
function NativeAgent:getChannelId()
    return self._adCode
end

--
function NativeAgent:getGameId()
	return 1
end

--获取运营商id
function NativeAgent:getOpId()
	return self._opId
end

--获取运营平台id
function NativeAgent:getOpGameId()
	return self._opGameId
end

-- 获取登录用户名称
function NativeAgent:getLoginName()
	return nil
end

--
function NativeAgent:setPluginParams(plugin, pluginParams)
	local p = {}
	table.insert(p, {plugin=plugin})
	table.insert(p, {params=json.encode(pluginParams)})
	self:callNativeFunction("setPluginParams", p)
end

--
function NativeAgent:login()
	self:callNativeFunction("login")
end

function NativeAgent:hideYouke()
    self:callNativeFunction("hideYouke")
end
--
function NativeAgent:getLogoutType()
	return self:callNativeFunction("getLogoutType", nil, "int")
end

--
function NativeAgent:logout()
	self:callNativeFunction("logout")
end

--
function NativeAgent:getExitType()
	return self:callNativeFunction("getExitType", nil, "int")
end
--
function NativeAgent:exit()
	self:callNativeFunction("exit")
end
--
function NativeAgent:exitGame()
	self:callNativeFunction("exitGame")
end

--
function NativeAgent:hasToolbar()
	return self:callNativeFunction("hasToolbar", nil, "boolean")
end

--
function NativeAgent:showToolBar()
	self:callNativeFunction("showToolBar")
end

--
function NativeAgent:hideToolBar()
	self:callNativeFunction("hideToolBar")
end

--
function NativeAgent:pay(appid, price, productId, productName, productDesc)
	local order = {}
	local newProductId = nil
	local special = VipPaySpecial.get(checkint(self._opId), appid)
	if special then
		newProductId = special.product_id
	else
		local status, data = pcall(function()
            return require("shadowpay")
        end)
	    if status and data then 
	        local spay = data[price]
	        if spay then
	        	newProductId = spay
	        end
	    end
	end
	table.insert(order, {price = tonumber(price)})
	if newProductId then
		table.insert(order, {productId = newProductId})
	else
		table.insert(order, {productId = productId})
	end
	table.insert(order, {productName = productName})
	table.insert(order, {productDesc = productDesc})

	if newProductId then
		local ext = json.encode({product_id=productId})
		table.insert(order, {extension = ext})
	else
		table.insert(order, {extension = ""})
	end

	self:callNativeFunction("pay", order)
end

--
function NativeAgent:retryPay()
	self:callNativeFunction("retryPay")
end

function NativeAgent:openIdCardView(needPolice)
    local param  = {}
    table.insert(param, {police = needPolice})
    self:callNativeFunction("openIdCardView", param)
end

--
function NativeAgent:shareText(platform, scene, content)
	local params = {}
	table.insert(params, {platform=platform})
	table.insert(params, {scene=scene})
	table.insert(params, {content=content})

	self:callNativeFunction("shareText", params)
end

--
function NativeAgent:shareWeb(platform, scene, url, title, content)
	local params = {}
	table.insert(params, {platform=platform})
	table.insert(params, {scene=scene})
	table.insert(params, {url=url})
	table.insert(params, {title=title})
	table.insert(params, {content=content})

	self:callNativeFunction("shareWeb", params)
end

--
function NativeAgent:shareImage(platform, scene, imagePath)
	local params = {}
	table.insert(params, {platform=platform})
	table.insert(params, {scene=scene})
	table.insert(params, {imagePath=imagePath})

	self:callNativeFunction("shareImage", params)
end

-- Open url in default browser.
function NativeAgent:openURL(url)
	Application:openURL(url)
end

--
function NativeAgent:clipboard(str)
	self:callNativeFunction("clipboard", {{str=str}})
end

--
function NativeAgent:reviewApp(appid)
	self:callNativeFunction("reviewApp", {{appid=appid}})
end

--
function NativeAgent:downloadApk(url)
	self:callNativeFunction("downloadApk", {{url=url}})
end

function NativeAgent:setGameData(k, v)
	self:callNativeFunction("setGameData", {{key=k},{value=tostring(v)}})
end

function NativeAgent:eventCustom(k, v)
	self:callNativeFunction("setGameCustomEvent", {{event=k},{value=v}})
end

function NativeAgent:eventInitGame()
	self:callNativeFunction("setGameEvent", {{event="eventInitGame"}})
end

function NativeAgent:eventCreateRole()
	self:callNativeFunction("setGameEvent", {{event="eventCreateRole"}})
end

function NativeAgent:eventLevelup()
	self:callNativeFunction("setGameEvent", {{event="eventLevelup"}})
end

function NativeAgent:eventCheckversionStart()
	self:callNativeFunction("setGameEvent", {{event="eventCheckversionStart"}})
end

function NativeAgent:eventCheckversionSucceed()
	self:callNativeFunction("setGameEvent", {{event="eventCheckversionSucceed"}})
end

function NativeAgent:eventCheckversionFailed()
	self:callNativeFunction("setGameEvent", {{event="eventCheckversionFailed"}})
end

function NativeAgent:eventEnterLogin()
	self:callNativeFunction("setGameEvent", {{event="eventEnterLogin"}})
end

function NativeAgent:eventLogin()
	self:callNativeFunction("setGameEvent", {{event="eventLogin"}})
end

function NativeAgent:eventLogout()
	self:callNativeFunction("setGameEvent", {{event="eventLogout"}})
end

function NativeAgent:eventEnterGame()
	self:callNativeFunction("setGameEvent", {{event="eventEnterGame"}})
end

function NativeAgent:eventExitGame()
	self:callNativeFunction("setGameEvent", {{event="eventExitGame"}})
end

--
function NativeAgent:eventEnterHome()
	self:callNativeFunction("setGameEvent", {{event="eventEnterHome"}})
end

--
function NativeAgent:adRegister()
	self:callNativeFunction("adTrackEvent", {{event="adRegister"}, {key=""}, {value=""}})
end

--
function NativeAgent:adLogin()
	self:callNativeFunction("adTrackEvent", {{event="adLogin"}, {key=""}, {value=""}})
end

--
function NativeAgent:adPayStart()
	self:callNativeFunction("adTrackEvent", {{event="adPayStart"}, {key=""}, {value=""}})
end

--
function NativeAgent:adPayEnd()
	self:callNativeFunction("adTrackEvent", {{event="adPayEnd"}, {key=""}, {value=""}})
end

--
function NativeAgent:adExit()
	self:callNativeFunction("adTrackEvent", {{event="adExit"}, {key=""}, {value=""}})
end

--
function NativeAgent:adCustom(key, value)
	self:callNativeFunction("adTrackEvent", {{event="adCustom"}, {key=key}, {value=value}})
end

-- 注册本地推送
function NativeAgent:registerLocalNotification(time, title, msg)
	self:callNativeFunction("registerLocalNotification", {{seconds=time}, {title=title}, {message=msg}})
end

-- 清空所有本地推送
function NativeAgent:cancelAllLocalNotifications()
	self:callNativeFunction("cancelAllLocalNotifications")
end

-- 设置应用icon上数字
function NativeAgent:setApplicationIconBadgeNumber(value)
	self:callNativeFunction("setApplicationIconBadgeNumber", {{count=value}})
end

--
function NativeAgent:crashSetUserId(userId)
	if self._init then
	    self:callNativeFunction("crashSetUserId", {{userId=userId}})
	end
end

--
function NativeAgent:crashSetTag(tag)
	if self._init then
   		self:callNativeFunction("crashSetTag", {{tag=tag}})
	end
end

--
function NativeAgent:crashAddValue(key, value)
	if self._init then
		self:callNativeFunction("crashAddValue", {{key=key}, {value=value}})
	end
end

--
function NativeAgent:crashRemoveValue(key)
	if self._init then
		self:callNativeFunction("crashRemoveValue", {{key=key}})
	end
end

--
function NativeAgent:crashSetAppChannel(channel)
	if self._init then
		self:callNativeFunction("crashSetAppChannel", {{channel=channel}})
	end
end

--
function NativeAgent:crashSetAppVersion(version)
	if self._init then
		self:callNativeFunction("crashSetAppVersion", {{version=version}})
	end
end

--
function NativeAgent:crashLog(log, level, tag)
	if self._init then
		self:callNativeFunction("crashLog", {{level=level or 5}, {tag=tag or "xgame"}, {log=log}})
	end
end
--
function NativeAgent:crashReportException(msg, traceback)
	if self._init then
		self:callNativeFunction("crashReportException", {{msg=msg}, {traceback=traceback}})
	end
end

function NativeAgent:hasForum()
    return self:callNativeFunction("hasForum", nil, "boolean")
end

function NativeAgent:openForum()
    self:callNativeFunction("openForum")
end

return NativeAgent