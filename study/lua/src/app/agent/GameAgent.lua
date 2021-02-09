local GameAgent = class("GameAgent")
local PrioritySignal = require("yoka.event.PrioritySignal")
local Version = require("yoka.utils.Version")
local PopupAlert = require("app.ui.PopupAlert")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local NativeConst = require("app.const.NativeConst")
local sharedDirector = cc.Director:getInstance()

local SERVER_STATE_GRAY = 11
--
function GameAgent:ctor()
    self._server = nil
    self._ticket = nil
    self._topUserID = nil
    self._sdkUserName = nil 
	self._sdkUserID = nil
	self._channelID = nil
    self._wantAutoEnterGame = false
    self._needVersionUpdate = false
    self._isLogin = false
    self._isInit = false
    self._loginUserId = 0
    self._loginServer = 0
    self._openExitGamePopupAlert = false

    self._isRealName = false --是否实名认证
    self._gpt = nil --gpt
    self._isAdult = false --是否成年
    self._grayTestLocalType = 0 --是否灰度测试版本
    self:_loadGrayTestFile()

    self._sdkRealName = false   --sdk传入的是否已经实名认证
	self._returnServerInfo = {} --回归服相关数据

    self._signalNative = nil
    self._signalLogin = G_NetworkManager:add(MessageIDConst.ID_S2C_Login, handler(self, self._recvLogin))
    self._signalActivate =
        G_NetworkManager:add(MessageIDConst.ID_S2C_ActivateAccount, handler(self, self._recvActivateAccount))
    self._signalCreate = G_NetworkManager:add(MessageIDConst.ID_S2C_Create, handler(self, self._recvCreateRole))
    self._signalFlush = G_NetworkManager:add(MessageIDConst.ID_S2C_Flush, handler(self, self._recvFlush))
    self._signalKickOut = G_NetworkManager:add(MessageIDConst.ID_S2C_KickOutUser, handler(self, self._recvKickOutUser))
    self._signalLevelup = G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onEventLevelUp))
    self._signalChangeScene =
        G_SignalManager:add(SignalConst.EVENT_CHANGE_SCENE, handler(self, self._onEventChangeScene))
    self._signalSecretVerifyNotify =
        G_NetworkManager:add(MessageIDConst.ID_S2C_Secret_Verify_Notify, handler(self, self._onEventSecretVerifyNotify))
    self._signalSecretVerify =
        G_NetworkManager:add(MessageIDConst.ID_S2C_Secret_Verify, handler(self, self._onEventSecretVerify))
    self._signalGetRoleList = G_RoleListManager.signal:add(handler(self, self._onEventGetRoleList))
    self._signalGetServerList = G_ServerListManager.signal:add(handler(self, self._onEventGetServerList))
    self._signalCheckHuman = G_NetworkManager:add(MessageIDConst.ID_S2C_Verify_Notice, handler(self, self._getVerifyNotice))

    self:addKeyBackListener()
end

function GameAgent:clear()
    self:removeKeyBackListener()
    self._signalLogin:remove()
    self._signalActivate:remove()
    self._signalCreate:remove()
    self._signalFlush:remove()
    self._signalKickOut:remove()
    self._signalLevelup:remove()
    self._signalChangeScene:remove()
    if self._signalNative then
        self._signalNative:remove()
        self._signalNative = nil
    end
    if self._signalSecretVerifyNotify then
        self._signalSecretVerifyNotify:remove()
        self._signalSecretVerifyNotify = nil
    end
    if self._signalSecretVerify then
        self._signalSecretVerify:remove()
        self._signalSecretVerify = nil
    end
	if self._signalGetRoleList then
		self._signalGetRoleList:remove()
		self._signalGetRoleList = nil
    end
    if self._signalGetServerList then
		self._signalGetServerList:remove()
		self._signalGetServerList = nil
    end
    if self._signalCheckHuman then 
        self._signalCheckHuman:remove()
        self._signalCheckHuman = nil
    end
    if self._signalVerify then 
        self._signalVerify:remove()
        self._signalVerify = nil
    end
end

--------------------------------------------------------------------------------------------------------------------
-- 初始化sdk
function GameAgent:initSDK()
    self._isInit = true
    self._signalNative = G_NativeAgent.signal:add(handler(self, self._onNativeCallback))
    G_NativeAgent:init()

    -- --
    G_VoiceAgent:setAppId("1698864032")
    G_VoiceAgent:setAppKey("f3faf617681b352187b72193119f7697")
    G_VoiceAgent:setOpenId("0")
    G_VoiceAgent:init()
end

--
function GameAgent:isInit()
    return self._isInit
end

function GameAgent:isLogin()
	return self._isLogin
end

function GameAgent:isRealName()
    return self._isRealName
end

function GameAgent:isAdult()
    return self._isAdult
end

function GameAgent:isSdkRealName()
    return self._sdkRealName
end

--是否是游卡渠道
function GameAgent:isYoka()
    local opGameId  = G_NativeAgent:getOpGameId()
    local opId = G_NativeAgent:getOpId()
    if opGameId == "1001" and opId == "2" then --安卓混服
        return true
    elseif opGameId ==  "1004" then --appstore
        return true
    end
    return false
end

--根据渠道，判断是否是实名成年人
function GameAgent:isRealNameAdult()
    if self:isYoka() then 
        return self._sdkRealName and self._isAdult
    end
    return false
end

function GameAgent:isGrayTest()
    return self._grayTestLocalType == SERVER_STATE_GRAY
end

function GameAgent:getGrayOpId(...)
    return 90000
    --灰度测试
end

function GameAgent:getGrayOpGameId(...)
    return 90000
    --灰度测试
end

function GameAgent:_loadGrayTestFile()
    local data = G_StorageManager:load("grayFile") or {}
    self._grayTestLocalType = data["grayTest"] or 0
end

function GameAgent:_writeGrayTestFile(serverState)
    local data = G_StorageManager:load("grayFile") or {}
    data["grayTest"] = serverState
    G_StorageManager:save("grayFile", data)
end

--灰度测试，版本比较，灰度状态比较
function GameAgent:_checkGrayVesion(message)
    dump(message)
    --已经登录过了，则不需要验证灰度
    if G_UserData:isLogin() == true then
        return false
    end
    logWarn(" GameAgent:_checkGrayVesion ")
    local serverVersion = rawget(message, "server_version") or 0
    local serverState = rawget(message, "server_status") or 0
    local currentResVersion = Version.toNumber(VERSION_RES)

    --服务器版本号没下发，应该是登录失败
    if serverVersion == 0 then
        return false
    end

    crashPrint(
        string.format(
            "[GameAgent] _checkGrayVesion, clientState[%d] serverState[%d] clientVersion[%d] serverVersion[%d]",
            self._grayTestLocalType,
            serverState,
            currentResVersion,
            serverVersion
        )
    )

    if serverState == nil then
        return false
    end

    local grayToNormal = self:isGrayTest() and serverState ~= SERVER_STATE_GRAY
    local normalToGray = not self:isGrayTest() and serverState == SERVER_STATE_GRAY

    dump(grayToNormal)
    dump(normalToGray)

    if self._grayTestLocalType == serverState then
        return false
    end

    local function delUpdateFile()
        --删除更新文件
        G_Prompt:showTip("delUpdateFile")
        local writeDir = cc.FileUtils:getInstance():getWritablePath()
        local function delSuc()
            --G_Prompt:showTip('删除成功')
        end

        --删除pkg文件夹，会导致客户端闪退。。
        cc.FileUtils:getInstance():removeDirectory(writeDir .. "package/", delSuc)
    end

    local function callBackfunc(serverState)
        logWarn("GameAgent:_checkGrayVesion callBackfunc")
        self:_writeGrayTestFile(serverState)
        local server = self:getLoginServer()
        G_ServerListManager:setLastServerId(server:getServer())
        self:reloadModule()
    end

    local function callBackDelFunc(serverState)
        logWarn("GameAgent:_checkGrayVesion callBackDelFunc")

        self:_writeGrayTestFile(serverState)
        local server = self:getLoginServer()
        G_ServerListManager:setLastServerId(server:getServer())
        delUpdateFile()

        self:reloadModule()
    end

    if grayToNormal then
        crashPrint(
            string.format(
                "[GameAgent] Gray to Noraml  clientState[%d] serverState[%d] clientVersion[%d] serverVersion[%d]",
                self._grayTestLocalType,
                serverState,
                currentResVersion,
                serverVersion
            )
        )
        if currentResVersion > serverVersion then --客户端版本高于服务器版本， 删除客户端文件
            UIPopupHelper.showGrayTestDialog(serverState, currentResVersion, serverVersion, callBackDelFunc)
        end
        if currentResVersion <= serverVersion then --客户端版本低于服务器版本， 切换状态。。
            callBackfunc() --直接切换状态不弹出提示框
        end
        return true
    end

    if normalToGray then
        crashPrint(
            string.format(
                "[GameAgent] Normal to Gray clientState[%d] serverState[%d] clientVersion[%d] serverVersion[%d]",
                self._grayTestLocalType,
                serverState,
                currentResVersion,
                serverVersion
            )
        )

        if currentResVersion <= serverVersion then --客户端版本低于服务器版本， 切换状态。。
            UIPopupHelper.showGrayTestDialog(serverState, currentResVersion, serverVersion, callBackfunc)
        end
        if currentResVersion > serverVersion then --客户端版本高于服务器版本， 删除客户端文件
            UIPopupHelper.showGrayTestDialog(serverState, currentResVersion, serverVersion, callBackDelFunc)
        end
        return true
    end

    return false
end

function GameAgent:setRealName(strName, strId)
    -- local url = "https://configmjz.sanguosha.com/api?service=realname"

    -- local url = "http://10.235.102.205:12167/updateauthinfo?"
    local url = "https://authservmjz.sanguosha.com/updateauthinfo?"

    local urlContent = ""
    urlContent = urlContent .. "uuid=" .. string.urlencode(self:getTopUserId())
    urlContent = urlContent .. "&uid=" .. string.urlencode(G_UserData:getBase():getId())
    urlContent = urlContent .. "&server_id=" .. self._loginServer
    urlContent = urlContent .. "&name=" .. string.urlencode(strName)
    urlContent = urlContent .. "&idcard=" .. tostring(strId)
    url = url .. urlContent

    print("----------------------------", url, "----------------------------")

    local xhr = cc.XMLHttpRequest:new()
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    xhr:open("GET", url)
    local function onCallback()
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            local ret = json.decode(xhr.response)
            if ret then --ret and ret.status == 1
                local retCode = tonumber(ret.ret)
                local errorMsg = ret.msg
                if retCode == 1 then
                    self._isRealName = true
                    self:_writeRealNameFile(retCode)
                end
                G_SignalManager:dispatch(SignalConst.EVENT_REAL_NAME_RET, retCode, errorMsg)
            end
        end
        xhr:unregisterScriptHandler()
    end

    xhr:registerScriptHandler(onCallback)
    xhr:send()
end

function GameAgent:_writeRealNameFile(retCode)
    local data = G_StorageManager:load("realName") or {}
    local uuid = self:getTopUserId()
    data[uuid] = retCode
    G_StorageManager:save("realName", data)
end

function GameAgent:getRealNameState(callback)
    local data = G_StorageManager:load("realName") or {}
    local uuid = self:getTopUserId()
    if not data[uuid] then
        -- local url = "http://10.235.102.205:12167/getauthinfo?uuid="
        local url = "https://authservmjz.sanguosha.com/getauthinfo?uuid="
        local urlContent = ""
        urlContent = urlContent .. uuid
        url = url .. urlContent

        local xhr = cc.XMLHttpRequest:new()
        xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
        xhr:open("GET", url)
        local function onCallback()
            if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
                local ret = json.decode(xhr.response)
                if ret then --ret and ret.status == 1
                    local retCode = ret.ret
                    if retCode == 1 then
                        if self._isRealName == false then
                            self._isRealName = true
                            G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_AVOID_GAME)
                        end
                        self._isRealName = true
                    elseif retCode == 0 then
                        self._isRealName = false
                        if callback then
                            callback()
                        end
                    end
                    self:_writeRealNameFile(retCode)
                end
            end
            xhr:unregisterScriptHandler()
        end

        xhr:registerScriptHandler(onCallback)
        xhr:send()
    end
    if data[uuid] == 0 then
        self._isRealName = false
        if callback then
            callback()
        end
    elseif data[uuid] == 1 then
        if self._isRealName == false then
            self._isRealName = true
            G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_AVOID_GAME)
        end
        self._isRealName = true
    end
end

--
function GameAgent:addKeyBackListener()
    if self._listenerKeyBack == nil then
        local listener = cc.EventListenerKeyboard:create()
        listener:registerScriptHandler(
            function(keyCode, event)
                if keyCode == cc.KeyCode.KEY_BACK then
                    self:exitGame()
                elseif keyCode == cc.KeyCode.KEY_MENU then
                --label:setString("MENU clicked!")
                end
            end,
            cc.Handler.EVENT_KEYBOARD_RELEASED
        )

        local eventDispatcher = sharedDirector:getEventDispatcher()
        eventDispatcher:addEventListenerWithFixedPriority(listener, 1)
        self._listenerKeyBack = listener
    end
end

--
function GameAgent:removeKeyBackListener()
    if self._listenerKeyBack ~= nil then
        local eventDispatcher = sharedDirector:getEventDispatcher()
        eventDispatcher:removeEventListener(self._listenerKeyBack)
        self._listenerKeyBack = nil
    end
end

--
function GameAgent:openLoginPlatform()
    crashPrint("[GameAgent] openLoginPlatform")
    if not self._isLogin then
        self._wantAutoEnterGame = false
        self:_checkHideYouke()
        G_NativeAgent:login()
    end
end

function GameAgent:_checkHideYouke()
    --只有ios的时候,新版本sdk
    local platform = G_NativeAgent:getNativeType()
    local nativeVersion = G_NativeAgent:getNativeVersion()
    if platform == "ios" and nativeVersion >= 3 then
        local showVisitor = G_ConfigManager:isShowYouke()
        if not showVisitor then 
            G_NativeAgent:hideYouke()
        end
    end
end

-- 登录平台账号
function GameAgent:loginPlatform()
    crashPrint("[GameAgent] loginPlatform")
    self._wantAutoEnterGame = false
    self:_loginPlatform()
end

-- 进入游戏
function GameAgent:enterGame()
    -- self:openSdkIdView()
    if self._isLogin then
        crashPrint("[GameAgent] enterGame<loginGame>")
        self:checkAndLoginGame()
    else
        crashPrint("[GameAgent] enterGame<loginPlatform>")
        self._wantAutoEnterGame = false --去掉自动进游戏的机制
        self:_loginPlatform()
    end
end

function GameAgent:checkAndLoginGame()
    --根据协议是否全同意判断是否需要弹框
    local AgreementSetting = require("app.data.AgreementSetting")
    if not AgreementSetting.isAllAgreementCheck() then
        G_SceneManager:showDialog("app.scene.view.login.PopupSecretView")
    else
		if G_ConfigManager:isOpenSdkRealName() == false then --没开启sdk认证功能
            self:loginGame()
        elseif NOT_REAL_NAME then 
            self:loginGame()
		else
			self:_checkSdkRealName()
		end
    end
end

-- 退出平台账号
function GameAgent:logoutPlatform()
    local t = G_NativeAgent:getLogoutType()
    if t == NativeConst.LOGOUT_TYPE_HAS_DIALOG then
        -- sdk内部有确认框
        crashPrint("[GameAgent] logoutPlatform<open sdk logout>")
        G_NativeAgent:logout()
    else
        crashPrint("[GameAgent] logoutPlatform<openPopupLogout>")
        self:_openPopupLogout()
    end
end

--
function GameAgent:_loginPlatform()
    if not self._isLogin then
        crashPrint("[GameAgent] _loginPlatform<login>")
        G_NativeAgent:login()
    else
        crashPrint("[GameAgent] _loginPlatform<logout>")
        self:logoutPlatform()
    end
end

--
function GameAgent:_openPopupLogout()
    local callback = function()
        G_NativeAgent:logout()
    end
    local alert = PopupAlert.new(Lang.get("sdk_title_tishi"), Lang.get("sdk_exit_message"), callback)
    alert:openWithAction()
end

--
function GameAgent:exitGame()
    local t = G_NativeAgent:getExitType()
    if t == NativeConst.EXIT_TYPE_HAS_DIALOG then
        G_NativeAgent:exit()
    else
        self:_openExitLogout()
    end
end

--
function GameAgent:_openExitLogout()
    if self._openExitGamePopupAlert == false then
        self._openExitGamePopupAlert = true
        local callbackOk = function()
            self._openExitGamePopupAlert = false
            local t = G_NativeAgent:getExitType()
            if t == NativeConst.EXIT_TYPE_NO_DIALOG then
                G_NativeAgent:exit()
            else
                G_NativeAgent:exitGame()
            end
        end
        local callbackCancel = function()
            self._openExitGamePopupAlert = false
        end

        local alert =
            PopupAlert.new(
            Lang.get("sdk_title_tishi"),
            Lang.get("sdk_exit_game"),
            callbackOk,
            callbackCancel,
            callbackCancel
        )
        alert:openWithAction()
    end
end

--
function GameAgent:_onNativeCallback(data)
    local event = data.event
    local ret = data.ret
    local param = data.param

    crashPrint("[GameAgent] _onNativeCallback<" .. event .. ", " .. ret .. ">")
    if event == NativeConst.SDKCheckVersionResult then
        if ret == NativeConst.CHECK_VERSION_TYPE_NEW then
            -- 检查到有版本更新
            return
        --elseif ret == NativeConst.CHECK_VERSION_TYPE_WITHOUT_NEW then
        -- 检查到没有版本更新
        --elseif ret == NativeConst.CHECK_VERSION_TYPE_WITHOUT then
        -- 没有版本更新接口
        --else
        -- 检查失败
        end

        G_SignalManager:dispatch(SignalConst.EVENT_SDK_CHECKVERSION)
    elseif event == NativeConst.SDKLoginResult then
        if ret == NativeConst.STATUS_SUCCESS then
            --
            self._gpt = nil
            self._isRealName = false
            self._isAdult = false
            self._isLogin = true
            local sdkInfo = json.decode(param)
            local platform = G_NativeAgent:getNativeType()
            if platform == "ios" then
                sdkInfo.os = "ios"
            else
                sdkInfo.os = "android"
            end
            self._topUserID = sdkInfo.topUserName
            self._sdkUserName = sdkInfo.sdkUserName
			self._sdkUserID = sdkInfo.sdkUserID
			self._channelID = sdkInfo.channelID
            param = json.encode(sdkInfo)
            dump(param, "4545454545")
            self._ticket = base64.encode(param)

            if sdkInfo.extension then
                local exts = string.split(sdkInfo.extension, "|")
                if #exts >= 3 then
                    self._gpt = exts[1]
                    -- self._isRealName = exts[2] == "1"
                    self._sdkRealName = exts[2] ==  "1"
                    self._isAdult = exts[3] == "1"
                end
            end

            --
            G_SignalManager:dispatch(SignalConst.EVENT_SDK_LOGIN)
			
			-- 如果不需要检查回归资格，则正常进游戏
			if G_ConfigManager:isCheckReturnServer() == false then
				-- 进入游戏
				if self._wantAutoEnterGame then
					self._wantAutoEnterGame = false

					self:checkAndLoginGame()
				end
			else
				self:_processReturnSituation()
			end
        elseif ret == NativeConst.STATUS_FAILED then
            if G_NativeAgent:getOpId() == "75" then
                local title = Lang.get("login_fail_title")
                local content = Lang.get("login_fail_notice")
                local popupSystemAlert = require("app.ui.PopupSystemAlert").new(title, content)
                popupSystemAlert:showGoButton(Lang.get("fight_kill_comfirm"))
                popupSystemAlert:setCheckBoxVisible(false)
                popupSystemAlert:openWithAction()
            end
        end
    elseif event == NativeConst.SDKLogoutResult then
        if ret == NativeConst.STATUS_SUCCESS then
            self._ticket = nil
            self._topUserID = nil
            self._sdkUserName = nil
            self._isLogin = false

            self._gpt = nil
            self._isRealName = false
            self._isAdult = false
			self._sdkRealName = nil
            --
            G_SignalManager:dispatch(SignalConst.EVENT_SDK_LOGOUT)
            -- 返回登陆界面
            local scene = G_SceneManager:getRunningSceneName()
            if scene ~= "login" then
                self:returnToLogin()
            end
        end
    elseif event == NativeConst.SDKExitResult then
        if ret == NativeConst.STATUS_SUCCESS then
            G_NativeAgent:exitGame()
        end
    elseif event == NativeConst.SDKPayResult then
        if ret == NativeConst.STATUS_SUCCESS then
            G_NetworkManager:checkConnection()
            if G_ConfigManager:isRechargeTip() then
                G_Prompt:showTip(Lang.get("sdk_platform_recharge"))
            end
        elseif ret == NativeConst.STATUS_PROCESS then
            local platform = G_NativeAgent:getNativeType()
            if platform == "ios" then
                G_NativeAgent:eventCustom("ios_pay_code", param)
            end
        else
            local platform = G_NativeAgent:getNativeType()
            if platform == "ios" then
                if
                    param == "000917" or param == "000910" or param == "000904" or param == "000906" or
                        param == "000902" or
                        param == "000907" or
                        param == "00909"
                 then
                    G_Prompt:showTip(Lang.get("sdk_recharge_ios_" .. param))
                end
            end
        end
    elseif event == NativeConst.SDKShareResult then
        if ret == NativeConst.STATUS_SUCCESS then
            G_Prompt:showTip("分享成功")
        elseif ret == NativeConst.STATUS_CANCEL then
            G_Prompt:showTip("分享取消")
        else
            G_Prompt:showTip("分享失败")
        end
        G_SignalManager:dispatch(SignalConst.EVENT_SHARE_RESULT_NOTICE, ret)
    elseif event == NativeConst.SDKIdResult then 
        --回过来的就是实名认证成功，
        if ret == NativeConst.STATUS_SUCCESS then 
            -- ret 0, 成年
            self._sdkRealName = true
            self._isAdult = true
            G_SignalManager:dispatch(SignalConst.EVENT_REAL_ID_SUCCESS)
        else 
            --
            self._sdkRealName = true
        end
    elseif event == "VoiceApplyMessageKey" then
        G_Prompt:showTip(ret .. ": " .. ret .. ", param: " .. param)
    elseif event == "VoiceUploadFile" then
        G_Prompt:showTip(ret .. ": " .. ret .. ", param: " .. param)
    elseif event == "VoiceDownloadFile" then
        G_Prompt:showTip(ret .. ": " .. ret .. ", param: " .. param)
    elseif event == "VoicePlayRecordedFile" then
        G_Prompt:showTip(ret .. ": " .. ret .. ", param: " .. param)
    elseif event == "VoiceSpeechToText" then
        G_Prompt:showTip(ret .. ": " .. ret .. ", param: " .. param)
    end
end

--------------------------------------------------------------------------------------------------------------------
-- 登陆游戏
function GameAgent:loginGame()
	crashPrint("[GameAgent] loginGame")
	local channel_id = G_NativeAgent:getChannelId()
	local device_id = G_NativeAgent:getDeviceId()
	local server = self:getLoginServer()
	self:_sendLoginGame(self._ticket, server:getServer(), channel_id, device_id)
end

--处理回归情况
--先拉取角色列表，因为后面判断是否允许进入回归服，需要角色列表信息
function GameAgent:_processReturnSituation()
    G_ServerListManager:resetLastRemoteTime() --登录账号后，重置时间，为的是可以根据新账号重新拉取服务器列表
	if G_RoleListManager:isCheckUpdate() then
		G_RoleListManager:checkUpdateList("returnSvr")
		G_WaitingMask:showWaiting(true)
	else
		self:_checkReturnSvr()
	end
end

-- 发送登陆协议
function GameAgent:_sendLoginGame(token, sid, channel_id, device_id)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_Login,
        {
            token = token,
            sid = sid,
            channel_id = channel_id,
            device_id = device_id,
            version = Version.toNumber(VERSION_RES)
        }
    )
end

--
function GameAgent:activateAccount(code)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_ActivateAccount,
        {
            code = code
        }
    )
end

--
function GameAgent:_recvActivateAccount(id, msg)
    if msg.ret == MessageErrorConst.RET_OK then
        self:_onVerifyServerStatus()
        G_SignalManager:dispatch(SignalConst.EVENTT_POPUP_CLOSE)
    elseif msg.ret == MessageErrorConst.RET_ACTIVATE_ALREADY_USE then
        --激活码已经被使用
        self:_onUUIDActivateAlreadyUse()
    elseif msg.ret == MessageErrorConst.RET_ACTIVATE_INVALID then
        --无效激活码
        self:_onUUIDActivateInvalid()
    end
end

-- 处理登陆返回协议
function GameAgent:_recvLogin(id, msg)
    if self:_checkGrayVesion(msg) then
        return
    end
    if msg.ret == MessageErrorConst.RET_NO_FIND_USER then
        -- 创建角色
        --G_NetworkManager:setSession(msg.uid,msg.sid)
        self:_onVerifyServerStatus()
    elseif msg.ret == MessageErrorConst.RET_LOGIN_REPEAT then
        -- 重复登录
        self:_onNeedRelogin()
    elseif msg.ret == MessageErrorConst.RET_SERVER_MAINTAIN then
        -- 服务器维护
        self:_onMaintain()
    elseif msg.ret == MessageErrorConst.RET_LOGIN_BAN_USER then
        -- 封号了
        self:_onBanUser()
    elseif msg.ret == MessageErrorConst.RET_LOGIN_TOKEN_TIME_OUT then
        --登录token无效
        self:_onTokenExpired()
    elseif msg.ret == MessageErrorConst.RET_SERVER_NO_OPEN then
        -- 不在白名单内
        self:_onNotAllowed()
    elseif msg.ret == MessageErrorConst.RET_VERSION_ERR then
        -- 客户端版本错误

        self:_onWrongVersion()
    elseif msg.ret == MessageErrorConst.RET_SERVER_CLOSE_REGIST then
        -- 限制注册
        self:_onStopRegister()
    elseif msg.ret == MessageErrorConst.RET_OK then
        -- 登陆成功
        -- G_Me.platformData:setYzuid(decodeBuffer.yzuid)

        G_NetworkManager:setSession(msg.uid, msg.sid)
        -- is login true
        G_UserData:setLogin(true)
        self:_onLoginSuccess()
    elseif msg.ret == MessageErrorConst.RET_TEMPORARY_BAN then
        -- 临时封号
        self:_onTempBanUser()
    elseif msg.ret == MessageErrorConst.RET_UUID_NOT_ACTIVATE then
        -- 账号未激活
        self:_onUUIDNotActivate()
    elseif msg.ret == MessageErrorConst.RET_LOGIN_BAN_IP_ALL_SERVER then
        --全服封IP
        self:_onBanIp()
    elseif msg.ret == MessageErrorConst.RET_LOGIN_BAN_DEVICE_ALL_SERVER then
        --全服封设备
        self:_onBanDevice()
	elseif msg.ret == MessageErrorConst.RET_RETURNSVR_IS_FULL then
		self:_onReturnSvrIsFull()
	elseif msg.ret == MessageErrorConst.RET_RETURNSVR_NOT_QUALIFIED then
        self:_onRetrunSvrNotQualified()
    -- elseif msg.ret == MessageErrorConst.RET_LOGIN_NEED_VERYFY then 
    --     self:_getVerifyNotice()
    else
        --未知错误
        self:_onUnknownError()
    end
end

--强制输入秘钥，成功后创角
function GameAgent:_onVerifyServerStatus()
    local secretKeyInputSuccess = function()
        self:_onNeedCreateRole()
    end
    local isNeedInputSecretKey = function()
        if G_ConfigManager:isAppstore() then
            return false
        end
        local server = G_GameAgent:getLoginServer()
        if not server then
            return false
        end
        local ServerConst = require("app.const.ServerConst")
        if not ServerConst.isNeedSecretKeyServer(server:getStatus()) then
            return false
        end
        return true
    end
    if isNeedInputSecretKey() then
        local cancelCallback = function()
            G_NetworkManager:reset()
        end

        UIPopupHelper.popupSecretKeyInput(secretKeyInputSuccess, cancelCallback)
    else
        secretKeyInputSuccess()
    end
end

--登陆游戏成功, 此时应该还没取到角色数据
function GameAgent:_onLoginSuccess()
    --此时保存成功登陆的服务器ID
    local server = self:getLoginServer()
    G_ServerListManager:setLastServerId(server:getServer())
    crashPrint("[GameAgent] _onLoginSuccess<" .. server:getServer() .. ">")

    G_NetworkManager:startServerTimeService()
    --这里我们不需要等对时返回,理论上来说这条协议是网关返回,所以肯定是第一条返回的
    --G_HandlersManager.coreHandler:sendFlush() -- 获取基本数据
    self:_sendFlush()
end

-- 需要创建角色
function GameAgent:_onNeedCreateRole()
    local server = self:getLoginServer()
    G_ServerListManager:setLastServerId(server:getServer())
    crashPrint("[GameAgent] _onNeedCreateRole<" .. server:getServer() .. ">")

    local scene = G_SceneManager:getRunningSceneName()
    if scene == "create" then
        crashPrint("[GameAgent] _onNeedCreateRole<create finish>")
        -- 发送缓存协议
        G_NetworkManager:checkLoginedGame()
    else
        --
        local createRole = function()
            G_SceneManager:showScene("create")
        end
        --
        if G_TutorialManager:isTutorialEnabled() then
            crashPrint("[GameAgent] _onNeedCreateRole<opening tutorial>")
            G_TutorialManager:hasOpeningTutorial(createRole)
        else
            crashPrint("[GameAgent] _onNeedCreateRole<enter create scene>")
            createRole()
        end
    end
end

--角色在他处登陆
function GameAgent:_onNeedRelogin()
    crashPrint("[GameAgent] _onNeedRelogin")
    G_NetworkManager:reset()
    local opgame = G_NativeAgent:getOpGameId()
    if opgame == "1005" or opgame == "1006" or opgame == "1007" or opgame == "1008" then
        self._ticket = nil
        self._isLogin = false
    end
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_relogin"), true)
end

--维护中
function GameAgent:_onMaintain()
    crashPrint("[GameAgent] _onMaintain")
    G_NetworkManager:reset()
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_mantain"), true)
end

--玩家被封禁
function GameAgent:_onBanUser()
    crashPrint("[GameAgent] _onBanUser")
    G_NetworkManager:reset()
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_ban_user"), true)
end

--临时封号
function GameAgent:_onTempBanUser()
    crashPrint("[GameAgent] _onTempBanUser")
    G_NetworkManager:reset()
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_temp_ban"), true)
end

--token 过期
function GameAgent:_onTokenExpired()
    crashPrint("[GameAgent] _onTokenExpired")
    G_NetworkManager:reset()
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_token_expired"), true)
end

--not allow
function GameAgent:_onNotAllowed()
    crashPrint("[GameAgent] _onNotAllowed")
    G_NetworkManager:reset()

    local txt = Lang.get("sdk_platform_allowed")
    local server = self:getLoginServer()
    local openTime = tonumber(server.first_opentime)
    if openTime ~= nil then
        local m = os.date("%m", openTime)
        local d = os.date("%d", openTime)
        local t = os.date("%H:%M", openTime)
        txt = Lang.get("sdk_platform_open_time", {month = m, day = d, time = t})
    end

    local tip = G_ConfigManager:getServerNotAllowedTip()
    if tip ~= nil and tip ~= "" then
        txt = tip
    end
    UIPopupHelper.showOfflineDialog(txt, true)
end

-- 版本号错误
function GameAgent:_onWrongVersion()
    crashPrint("[GameAgent] _onWrongVersion")
    G_NetworkManager:reset()
    self._needVersionUpdate = true
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_version"), true)
end

-- 账号未激活
function GameAgent:_onUUIDNotActivate()
    crashPrint("[GameAgent] _onUUIDNotActivate")
    --G_NetworkManager:reset()
    --UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_uuid_not_activate"), true)

    local callback = function(name, psw)
        self:activateAccount(name)
        return true
        --返回false关闭弹窗，否则保留弹窗
    end
    local cancelCallback = function()
        G_NetworkManager:reset()
    end
    --[[
    local PopupLogin = require("app.ui.PopupLogin")
    local login = PopupLogin.new(callback)
    login:openWithAction()
    ]]
    local UIPopupHelper = require("app.utils.UIPopupHelper")
    UIPopupHelper.popupInputAccountActivationCode(callback, cancelCallback)
end

--激活码被使用
function GameAgent:_onUUIDActivateAlreadyUse()
    crashPrint("[GameAgent] _onUUIDActivateAlreadyUse")
    --G_NetworkManager:reset()
    --UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_uuid_activate_already_use"), true)
    G_Prompt:showTip(Lang.get("sdk_platform_uuid_activate_already_use"))
end

--激活码无效
function GameAgent:_onUUIDActivateInvalid()
    crashPrint("[GameAgent] _onUUIDActivateInvalid")
    --G_NetworkManager:reset()
    --UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_uuid_activate_invalid"), true)
    G_Prompt:showTip(Lang.get("sdk_platform_uuid_activate_invalid"))
end

-- 限制注册
function GameAgent:_onStopRegister()
    crashPrint("[GameAgent] _onStopRegister")
    G_NetworkManager:reset()
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_stop_register"), true)
end

-- 没有回归资格，不能进回归服
function GameAgent:onCanNotEnterReturnServer()
	crashPrint("[GameAgent] onCanNotEnterReturnServer")
	G_NetworkManager:reset()
	UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_can_not_enter_return_server"), 
									true, 
									Lang.get("common_reselect_server"))
end

-- 登陆未知错误
function GameAgent:_onUnknownError()
    crashPrint("[GameAgent] _onUnknownError")
    G_NetworkManager:reset()

    local msg = Lang.get("sdk_platform_unknown_error")
    if decodeBuffer ~= nil and decodeBuffer.ret ~= nil then
        local msgInfo = require("app.config.net_msg_error").get(decodeBuffer.ret)
        if msgInfo ~= nil then
            msg = msgInfo.error_msg
        else
            msg = msg .. ":" .. decodeBuffer.ret
        end
    end

    UIPopupHelper.showOfflineDialog(msg, true)
end

-- ip被封
function GameAgent:_onBanIp()
    crashPrint("[GameAgent] _onBanIp")
    G_NetworkManager:reset()
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_ban_ip"), true)
end

--设备被封
function GameAgent:_onBanDevice()
    crashPrint("[GameAgent] _onBanIp")
    G_NetworkManager:reset()
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_ban_device"), true)
end

--回归人数已满
function GameAgent:_onReturnSvrIsFull()
	crashPrint("[GameAgent] _onReturnSvrIsFull")
	G_NetworkManager:reset()
	UIPopupHelper.showOfflineDialog(Lang.get("sdk_return_svr_is_full"), true, Lang.get("common_reselect_server"))
end

--无回归资格
function GameAgent:_onRetrunSvrNotQualified()
	crashPrint("[GameAgent] _onRetrunSvrNotQualified")
	G_NetworkManager:reset()
	UIPopupHelper.showOfflineDialog(Lang.get("sdk_return_svr_not_qualified"), true)
end

--------------------------------------------------------------------------------------------------------------------
--
function GameAgent:createRole(roleName, heroType)
    self:_sendCreateRole(roleName, heroType)
end

function GameAgent:checkContent(strContent, callback)
    if not G_ConfigManager:isUrlFilter() then
        callback()
        return
    end
    local url = "https://filterad.sanguosha.com/v1/query?"
    local urlContent = ""
    urlContent = urlContent .. "q=" .. string.urlencode(strContent)
    urlContent = urlContent .. "&appid=1270"
    url = url .. urlContent

    local xhr = cc.XMLHttpRequest:new()
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    G_WaitingMask:showWaiting(true)
    xhr:open("GET", url)
    local function onCallback(callback)
        G_WaitingMask:showWaiting(false)
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            local ret = json.decode(xhr.response)
            dump(ret)
            if ret then
                if ret.keywords == nil then
                    callback()
                else
                    G_Prompt:showTip(Lang.get("wrong_textcontent"))
                end
            end
        end
        xhr:unregisterScriptHandler()
    end
    xhr:registerScriptHandler(
        function()
            onCallback(callback)
        end
    )
    xhr:send()
end

function GameAgent:checkTalkAndSend(channel, strContent, chatPlayerData, msgType, parameter, voiceUrl, voiceTime)
    -- body
    local ChatConst = require("app.const.ChatConst")
    if not G_ConfigManager:isUrlFilter() then
        if msgType == ChatConst.MSG_TYPE_VOICE then
            strContent = string.format("%s#%s#%s", voiceUrl, voiceTime or "", strContent or "") --"voiceUrl|voiceTime|voiceText"
        end
        G_UserData:getChat():c2sChatRequest(channel, strContent, chatPlayerData, msgType, parameter)
        return
    end
    local url = "https://filterad.sanguosha.com/v1/query?"
    local urlContent = ""
    urlContent = urlContent .. "q=" .. string.urlencode(strContent)
    urlContent = urlContent .. "&appid=1270"
    url = url .. urlContent

    print("1112233 url = ", url)

    local xhr = cc.XMLHttpRequest:new()
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    G_WaitingMask:showWaiting(true)
    xhr:open("GET", url)
    local function onCallback()
        G_WaitingMask:showWaiting(false)
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            local ret = json.decode(xhr.response)
            dump(ret)
            if ret then
                local content = ret.text
                if msgType == ChatConst.MSG_TYPE_VOICE then
                    content = string.format("%s#%s#%s", voiceUrl, voiceTime or "", content or "") --"voiceUrl|voiceTime|voiceText"
                end
                G_UserData:getChat():c2sChatRequest(channel, content, chatPlayerData, msgType, parameter)
            end
        end
        xhr:unregisterScriptHandler()
    end
    xhr:registerScriptHandler(
        function()
            onCallback()
        end
    )
    xhr:send()
end

-- 发送创建协议
function GameAgent:_sendCreateRole(roleName, heroType)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_Create,
        {
            name = roleName,
            type = heroType
        }
    )
end

-- 处理创建返回协议
function GameAgent:_recvCreateRole(id, message)
    if message.ret == MessageErrorConst.RET_OK then
        G_NetworkManager:setSession(message.uid, message.sid)
        G_UserData:setLogin(true)
        self:_onCreatedRole()
        self:_onLoginSuccess()
        G_SignalManager:dispatch(SignalConst.EVENT_CREATED_ROLE)
    elseif message.ret == MessageErrorConst.RET_LOGIN_NEED_VERYFY then 
        self:_getVerifyNotice()
    end
end

--
function GameAgent:_onCreatedRole()
    -- 更新数据
    self:_updateGameData()

    --推送创角事件
    G_NativeAgent:eventCreateRole()
    --
    G_NativeAgent:adRegister()
end

--------------------------------------------------------------------------------------------------------------------
-- 发送刷新数据协议
function GameAgent:_sendFlush()
    G_NetworkManager:send(MessageIDConst.ID_C2S_Flush, {})
end

-- 处理刷新返回协议
function GameAgent:_recvFlush(id, message)
    if message.ret == MessageErrorConst.RET_OK then
        G_SignalManager:dispatch(SignalConst.EVENT_RECV_FLUSH_DATA)
        G_NetworkManager:checkLoginedGame()
        G_SignalManager:dispatch(SignalConst.EVENT_LOGIN_SUCCESS)
        if not G_UserData:isFlush() then
            G_UserData:setFlush(true)
            G_UserData:getBase():setOnlineTime(message.today_online_time)
            self:_onLoginedGame()
        end
    end
end

--
function GameAgent:_onLoginedGame()
    crashPrint("[GameAgent] _onLoginedGame")
    --初始化新手引导
    G_ServiceManager:start()
    G_RollNoticeService:start()
    G_MineNoticeService:start()
    G_RealNameService:start()
    G_GuildSnatchRedPacketServe:start()
    G_TutorialManager:reset()
    G_BulletScreenManager:start()
    -- 如果有新手引导，则会进入新手引导流程，否则进入正常流程
    G_TutorialManager:hasTutorial(
        function()
            G_SceneManager:showScene("main")
        end
    )
    --
    local gameUserID = G_UserData:getBase():getId()
    G_VoiceAgent:setOpenId(tostring(gameUserID))
    G_VoiceAgent:applyMessageKey(15000)
    G_VoiceAgent:setMicVolume(100)
    G_VoiceAgent:setSpeakerVolume(168)
    --添加本地通知
    G_NotifycationManager:registerNotifycation()
    --设置sdk数据
    self:_updateGameData()
    -- 推送登陆成功事件
    G_NativeAgent:eventLogin()
    G_NativeAgent:adLogin()
    G_NativeAgent:retryPay()
    G_SignalManager:dispatch(SignalConst.EVENT_FINISH_LOGIN)
end

--
function GameAgent:_sendGetServerTime()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetServerTime, {})
end

-- 踢下线
function GameAgent:_recvKickOutUser(id, message)
    crashPrint("[GameAgent] _recvKickOutUser")
    G_NetworkManager:reset()
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_kickoutuser"), true)
end

function GameAgent:_onEventLevelUp()
    --更新登陆
    local gameUserLevel = G_UserData:getBase():getLevel()
    G_NativeAgent:setGameData("gameUserLevel", gameUserLevel)

    --推送升级事件
    G_NativeAgent:eventLevelup()
	
	self:checkReturnEvent()
end

function GameAgent:_onEventChangeScene(event, enter, sceneName)
    if enter then
        --
        if sceneName ~= "login" and sceneName ~= "logo" and sceneName ~= "cg" then
            -- 登陆过程中注销或切换账号
            if not self._isLogin then
                G_NetworkManager:reset()
                UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_logout_sdk"), true)
            end

        -- G_UserData:getBase():checkRealName()
        end

    --
    --[[if sceneName == "main" then
            G_NativeAgent:showToolBar()
        else
            if not G_ConfigManager:isAlwaysShowToolBar() then
                G_NativeAgent:hideToolBar()
            else
                if sceneName == "login" then
                    G_NativeAgent:hideToolBar()
                end
            end
        end]]
    end
end

function GameAgent:_onEventSecretVerifyNotify(id, message)
    local function getKey()
        local Parameter = require("app.config.parameter")
        local ParameterIDConst = require("app.const.ParameterIDConst")
        return Parameter.get(ParameterIDConst.SIGN_HEAD).content
    end

    local randString = rawget(message, "rand_str") or ""
    local key = getKey()
    local sign = md5.sum(randString .. key)
    G_NetworkManager:send(
        MessageIDConst.ID_C2S_Secret_Verify,
        {
            uid = 0,
            verify_str = sign
        }
    )
end

function GameAgent:_onEventSecretVerify(id, message)
    if message.ret == MessageErrorConst.RET_OK then
    end
end

function GameAgent:_onEventGetRoleList(event)
	G_WaitingMask:showWaiting(false)
	
	if event ~= "returnSvr" then
		return
	end
	
	self:_checkReturnSvr()
end

function GameAgent:_checkReturnSvr()
	local url = RETURN_SERVER_CHECK_URL_TEMPLATE
	local uuid = string.urlencode(self:getTopUserId())
	url = string.gsub(url, "#domain#", RETURN_SERVER_CHECK_URL)
	url = string.gsub(url, "#uuid#", uuid)

	local xhr = cc.XMLHttpRequest:new()
	xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
	xhr:open("GET", url)
	G_WaitingMask:showWaiting(true)

	local function onCallback()
		G_WaitingMask:showWaiting(false)
		if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
			local response = json.decode(xhr.response)
			if response then
				local ret = tonumber(response.ret)
				if ret == 1 then
					local msg = response.msg
                    self:setReturnServerInfo(msg)
                    local isBack = 0
					if msg.is_back_user == 0 and msg.already_back_sid == "" then --没有回归资格，且没有回归过
                        isBack = 0
					else
                        isBack = 1
                    end
                    if G_ServerListManager:isCheckUpdate() then
                        G_ServerListManager:getRemoteServerList(isBack, "returnServerSuccess")
                    end
				else
					logError("GameAgent:_processReturnSituation is wrong, ret = ".. ret)
				end
			end
		end
		xhr:unregisterScriptHandler()
	end

	xhr:registerScriptHandler(onCallback)
	xhr:send()
end

function GameAgent:_onEventGetServerList(eventName)
    if eventName ~= "returnServerSuccess" then
		return
	end
    local server = self:getLoginServer()
    local isBreak = false --是否要打断
    if server and server:isBackserver() then
        if self:checkIsCanEnterReturnServer(server) == false then
            self:onCanNotEnterReturnServer()
            isBreak = true
        end
    end
    if isBreak == false then
        if self._wantAutoEnterGame then
            self._wantAutoEnterGame = false

            self:checkAndLoginGame()
        end
    end
end

function GameAgent:checkIsCanEnterReturnServer(server)
	local info = self:getReturnServerInfo()
	
	if info.isBackUser == nil or info.alreadyBackSid == nil then
		return false
	end
	
	if info.isBackUser == 0 and info.alreadyBackSid == "" then --没有回归资格，且没有回归过
		return false
	elseif G_UserData:getBase():isCanEnterReturnServer(server) == false then
		return false
	end
	
	return true
end

--------------------------------------------------------------------------------------------------------------------
--从loginView中移过来的
--需要与赛老板讨论，是否搬过来
function GameAgent:reloadModule()
    G_GatewayListManager:clear()
    G_ServerListManager:clear()

    G_SignalManager:clear()

    G_UserData:clear()
    G_GameAgent:clear()
    G_NativeAgent:clear()
    G_NetworkManager:clear()
    G_SceneManager:clear()
    G_RecoverMgr:clear()
    G_TutorialManager:clear()
    G_BulletScreenManager:clear()
    G_ServiceManager:stop()
    G_RollNoticeService:clear()
    G_MineNoticeService:clear()
    G_RealNameService:clear()
    G_GuildSnatchRedPacketServe:clear()
    G_SpineManager:clear()

    G_WaitingMask:clear()
    G_TouchEffect:clear()
    G_TopLevelNode:clear()
    G_AudioManager:clear()
    --
    cc.CSLoader:getInstance():removeAllCacheReaders()
    sp.SpineCache:getInstance():removeSpines()
    cc.SpriteFrameCache:getInstance():removeSpriteFrames()
    cc.Director:getInstance():getTextureCache():removeAllTextures()
    cc.Director:getInstance():purgeCachedData()
    --
    cc.enable_global()
    local function tableContain(t, key)
        for _, v in ipairs(t) do
            if v == key then
                return true
            end
        end
        return false
    end
    for k, _ in pairs(package.loaded) do
        if not tableContain(g_package_loaded, k) then
            package.loaded[k] = nil
            print("package.loaded = " .. k)
        end
    end
    for k, _ in pairs(_G) do
        if not tableContain(g_G, k) then
            _G[k] = nil
            print("_G = " .. k)
        end
    end
    -- local videoParam = G_UserData:getUserSetting():getSettingValue("VideoVer")
    -- local VideoConst = require("app.const.VideoConst")
    -- if VideoConst.videoVer == videoParam then
    watchVideo = true
    -- end

    collectgarbage("collect")
    require("main.lua")
end

function GameAgent:returnToLogin()
    crashPrint("[GameAgent] returnToLogin")
    --清除登陆信息
    --self._ticket = nil
    --self._isLogin = false
    --重置网络
    G_NetworkManager:reset()
    --清除走马灯公告
    G_RollNoticeService:clear()
    --清除矿战公告
    G_MineNoticeService:clear()
    --清除防沉迷
    G_RealNameService:clear()
    --清除红包
    G_GuildSnatchRedPacketServe:clear()

    --清除userdata
    --G_UserData:reset()
    G_UserData:clear()
    --清除引导
    G_TutorialManager:clear()
    --清除武将声音回调
    G_HeroVoiceManager:stopPlayMainMenuVoice()

    -- 返回登陆界面
    local scene = G_SceneManager:getRunningSceneName()
    if scene ~= "login" then
        G_SceneManager:showScene("login")
    else
        if self._needVersionUpdate then
            self._needVersionUpdate = false
            G_SignalManager:dispatch(SignalConst.EVENT_LOGIN_VERSION_UPDATE)
        end
    end
    cc.exports.G_UserData = require("app.data.UserData").new()
end

--
function GameAgent:wantExitGame()
end

--
function GameAgent:_exitGame()
end

--------------------------------------------------------------------------------------------------------------------
--获取上次登陆的server id
function GameAgent:getRecommendServer()
    local server = G_ServerListManager:getLastServer()

    if server == nil then
        server = G_ServerListManager:getFirstServer()
    end

    return server
end

-- 记录当前选择服务器
function GameAgent:setLoginServer(server)
    local id = "nil"
    if server then
        id = server:getServer()
    end
    crashPrint("[GameAgent] setLoginServer<" .. id .. ">")
    self._server = server
end

-- 获取当前登录服务器
function GameAgent:getLoginServer()
    if self._server == nil then
        self._server = self:getRecommendServer()
    end
    return self._server
end

-- 当前登录的是否是回归服
function GameAgent:isLoginReturnServer()
	local server = self:getLoginServer()
	return server:isBackserver()
end

-- 获取当前登录用户名称
function GameAgent:getLoginUserName()
    if self._isLogin then
        local name = G_NativeAgent:getLoginName()
        return name and name or Lang.get("sdk_platform_logined")
    end

    return nil
    --Lang.get("sdk_platform_notlogined")
end

--
function GameAgent:hasToken()
    return self._ticket ~= ""
end

--
function GameAgent:getTokenTicket()
    return self._ticket
end

--
function GameAgent:getTopUserId()
    return self._topUserID
end

--
function GameAgent:getSdkUserName()
    return self._sdkUserName
end

function GameAgent:openSdkIdView()
    local police = 0
    if G_ConfigManager:isPolice() then 
        police = 1
    end
    G_NativeAgent:openIdCardView(police)
end

--
function GameAgent:pay(appid, price, productId, productName, productDesc)
    if G_ConfigManager:isRecharge() == false then
        G_Prompt:showTip("充值未开放")
        return 1
    end

    if G_ConfigManager:isRealName() and not self._isRealName then --未实名认证
        G_RealNameService:openRealNameDlg()
        return 1
    end
	
	if self:isLoginReturnServer() and G_UserData:getBase():getReturnSvr() == nil then --如果还没有确认回归
		G_Prompt:showTip(Lang.get("return_server_can_not_recharge"))
		return 1
	end

    local rechargeLimit = G_ConfigManager:getRechargeLimit()
    if rechargeLimit ~= 0 and G_UserData:getBase():getRecharge_today() >= rechargeLimit then
        local title = Lang.get("recharge_limit_title")
        local content = Lang.get("recharge_limit_content", {count = rechargeLimit})
        local popupSystemAlert = require("app.ui.PopupSystemAlert").new(title, content)
        popupSystemAlert:showGoButton(Lang.get("fight_kill_comfirm"))
        popupSystemAlert:setCheckBoxVisible(false)
        popupSystemAlert:openWithAction()
        -- 弹出提示框
        return 1
    end

    G_NativeAgent:pay(appid, price, productId, productName, productDesc)
    return 0
end

--appstore补单
function GameAgent:retryPay()
    G_NativeAgent:retryPay()
end

--
function GameAgent:shareText(platform, scene, content)
    G_NativeAgent:shareText(platform, scene, content)
end

--
function GameAgent:shareWeb(platform, scene, url, title, content)
    G_NativeAgent:shareWeb(platform, scene, url, title, content)
end

--
function GameAgent:shareImage(platform, scene, imagePath)
    G_NativeAgent:shareImage(platform, scene, imagePath)
end

--
function GameAgent:reportCrash(msg, traceback)
    G_NativeAgent:crashReportException(msg, traceback)
end

--
function GameAgent:_updateGameData()
    crashPrint("[GameAgent] _updateGameData")
    local opId = G_NativeAgent:getOpId()
    local opgameId = G_NativeAgent:getOpGameId()
    local serverId = self:getLoginServer():getServer()
    local serverName = self:getLoginServer():getName()
    local gameUserID = G_UserData:getBase():getId()
    local gameUserName = G_UserData:getBase():getName()
    local gameUserLevel = G_UserData:getBase():getLevel()
    local createTime = G_UserData:getBase():getCreate_time()

    G_NativeAgent:setGameData("gameUserID", gameUserID)
    G_NativeAgent:setGameData("gameUserName", gameUserName)
    G_NativeAgent:setGameData("gameUserLevel", gameUserLevel)
    G_NativeAgent:setGameData("serverId", serverId)
    G_NativeAgent:setGameData("serverName", serverName)
    G_NativeAgent:setGameData("createTime", createTime)

    self._loginUserId = gameUserID
    self._loginServer = serverId

    G_NativeAgent:crashSetAppVersion(G_NativeAgent:getAppVersion() .. "_" .. VERSION_RES)
    G_NativeAgent:crashSetUserId(opId .. "_" .. opgameId .. "_" .. self._loginUserId .. "_" .. self._loginServer)
end

--检测sdk实名认证
function GameAgent:_checkSdkRealName()
	if self:isRealNameAdult() then --已经认证过了
		self:loginGame()
		return
	end
	
	if self:isYoka() then
		self:_checkSdkRealNameOfYoka()
	else
		self:_checkSdkRealNameOfThirdParty()
	end
end

function GameAgent:requestSdkRealName(realName, realId)
    if self:isYoka() then
        local version = G_NativeAgent:getNativeVersion()
        if version < 3 then
            self:requestSdkRealNameOfYoka(realName, realId)
        end
	else
		self:requestSdkRealNameOfThirdParty(realName, realId)
	end
end

function GameAgent:openRealName()
    local version = G_NativeAgent:getNativeVersion()
    if version >= 3 then 
        self:openSdkIdView()
    else
        local popup = require("app.scene.view.system.PopupRealName2").new()
        popup:openWithAction()
    end
end

--官方游卡检测是否认证过sdk实名
function GameAgent:_checkSdkRealNameOfYoka()
	local url = "https://authservicemjz.sanguosha.com/yokaget?"
	local urlContent = ""
	urlContent = urlContent .. "areaId=" .. 0
	urlContent = urlContent .. "&sndaId=" .. string.urlencode(self._sdkUserID)
	url = url .. urlContent

	local xhr = cc.XMLHttpRequest:new()
	xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
	xhr:open("GET", url)
	G_WaitingMask:showWaiting(true)
	local function onCallback()
		G_WaitingMask:showWaiting(false)
		if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
			local response = json.decode(xhr.response)
			if response then
				local ret = tonumber(response.ret)
				if ret == 1 then
					local msg = response.msg
					local code = msg.return_code
					if code == 0 then
						local data = msg.data
						if data.status == 1 then --已经实名认证
							if data.isAdult == 1 then --已成年
								self:loginGame()
							else
								self:_popupAlert()
							end
						else
                            self:openRealName()
						end
					else
						logError("GameAgent:_checkSdkRealNameOfThirdParty is wrong, code = ".. code)
					end
				else
					logError("GameAgent:_checkSdkRealNameOfYoka is wrong, ret = ".. ret)
				end
			end
		end
		xhr:unregisterScriptHandler()
	end

	xhr:registerScriptHandler(onCallback)
	xhr:send()
end

--官方游卡认证sdk实名
function GameAgent:requestSdkRealNameOfYoka(realName, realId)
	local url = "https://authservicemjz.sanguosha.com/yokaset?"
	local urlContent = ""
	urlContent = urlContent .. "areaId=" .. 0
	urlContent = urlContent .. "&pgt=" .. string.urlencode(self._gpt)
	urlContent = urlContent .. "&sndaId=" .. string.urlencode(self._sdkUserID)
	urlContent = urlContent .. "&realName=" .. string.urlencode(realName)
	urlContent = urlContent .. "&idCard=" .. string.urlencode(realId)
	url = url .. urlContent

	local xhr = cc.XMLHttpRequest:new()
	xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
	xhr:open("GET", url)
	G_WaitingMask:showWaiting(true)
	print("requestSdkRealNameOfYoka", url, "----------------------------")
	local function onCallback()
		G_WaitingMask:showWaiting(false)
		if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
			local response = json.decode(xhr.response)
			if response then
				local ret = tonumber(response.ret)
				if ret == 1 then
					local msg = response.msg
					local code = msg.return_code
					local message = msg.return_message
					local data = msg.data
					G_SignalManager:dispatch(SignalConst.EVENT_SDK_REAL_NAME_RET, code, message, data)
				else
					logError("GameAgent:requestSdkRealNameOfYoka is wrong, ret = ".. ret)
				end
			end
		end
		xhr:unregisterScriptHandler()
	end

	xhr:registerScriptHandler(onCallback)
	xhr:send()
end

--第三方平台检测是否认证过sdk实名
function GameAgent:_checkSdkRealNameOfThirdParty()
	local url = "https://authservicemjz.sanguosha.com/noyokaget?"
	local urlContent = ""
	urlContent = urlContent .. "userId=" .. string.urlencode(self._sdkUserID)
	urlContent = urlContent .. "&channelId=" .. string.urlencode(self._channelID)
	url = url .. urlContent

	local xhr = cc.XMLHttpRequest:new()
	xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
	xhr:open("GET", url)
	G_WaitingMask:showWaiting(true)
	local function onCallback()
		G_WaitingMask:showWaiting(false)
		if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
			local response = json.decode(xhr.response)
			if response then
				local ret = tonumber(response.ret)
				if ret == 1 then
					local msg = response.msg
					local code = msg.code
					if code == 0 then
						local data = msg.data
						if data.status == 1 then --已经实名认证
							if data.isAdult == 1 then --已成年
								self:loginGame()
							else
								self:_popupAlert()
							end
						else
							local popup = require("app.scene.view.system.PopupRealName2").new()
							popup:openWithAction()
						end
					else
						logError("GameAgent:_checkSdkRealNameOfThirdParty is wrong, code = ".. code)
					end
				else
					logError("GameAgent:_checkSdkRealNameOfThirdParty is wrong, ret = ".. ret)
				end
			end
		end
		xhr:unregisterScriptHandler()
	end

	xhr:registerScriptHandler(onCallback)
	xhr:send()
end

--第三方平台认证sdk实名
function GameAgent:requestSdkRealNameOfThirdParty(realName, realId)
	local url = "https://authservicemjz.sanguosha.com/noyokaset?"
	local urlContent = ""
	urlContent = urlContent .. "userId=" .. string.urlencode(self._sdkUserID)
	urlContent = urlContent .. "&channelId=" .. string.urlencode(self._channelID)
	urlContent = urlContent .. "&realName=" .. string.urlencode(realName)
	urlContent = urlContent .. "&realId=" .. string.urlencode(realId)
	url = url .. urlContent

	local xhr = cc.XMLHttpRequest:new()
	xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
	xhr:open("GET", url)
	G_WaitingMask:showWaiting(true)
	print("requestSdkRealNameOfThirdParty", url, "----------------------------")
	local function onCallback()
		G_WaitingMask:showWaiting(false)
		if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
			local response = json.decode(xhr.response)
			if response then
				local ret = tonumber(response.ret)
				if ret == 1 then
					local msg = response.msg
					local code = msg.code
					local message = msg.message
					local data = msg.data
					G_SignalManager:dispatch(SignalConst.EVENT_SDK_REAL_NAME_RET, code, message, data)
				else
					logError("GameAgent:requestSdkRealNameOfThirdParty is wrong, ret = ".. ret)
				end
			end
		end
		xhr:unregisterScriptHandler()
	end

	xhr:registerScriptHandler(onCallback)
	xhr:send()
end

function GameAgent:_popupAlert()
	local popup = require("app.ui.PopupAlert").new(Lang.get("sdk_title_tishi"), Lang.get("sdk_real_name_alert_content"))
	popup:setOKBtn(Lang.get("common_btn_name_confirm"))
	popup:openWithAction()
end

--检查回归事件
function GameAgent:checkReturnEvent()
	local returnSvr = G_UserData:getBase():getReturnSvr()
	if self:isLoginReturnServer() and (returnSvr == nil) then --在回归服，但还没回归
		local UserDataHelper = require("app.utils.UserDataHelper")
		local tempLevel = UserDataHelper.getParameter(G_ParameterIDConst.BACK_CONFIRM_LV)
		local level = G_UserData:getBase():getLevel()
		if level >= tempLevel then
			UIPopupHelper.popupReturnConfirm()
		end
	end
end

--{"ret":1,"msg":{"uuid":"1","vip_lv":0,"vip_exp":0,"offline_time":0,"is_back_user":0,"already_back_sid":"x|x|x"}}
function GameAgent:setReturnServerInfo(msg)
	local info = {}
	info.uuId = msg.uuid
	info.vipLv = msg.vip_lv
	info.vipExp = msg.vip_exp
	info.offlineTime = msg.offline_time
	info.isBackUser = msg.is_back_user
	info.alreadyBackSid = msg.already_back_sid

	self._returnServerInfo = info
end

function GameAgent:getReturnServerInfo()
	return self._returnServerInfo
end

--某个服是否已回归
function GameAgent:isAlreadyReturn(serverId)
	local alreadyBackSid = self._returnServerInfo.alreadyBackSid
	if alreadyBackSid and alreadyBackSid ~= "" then
		local sIds = string.split(alreadyBackSid, "|")
		for i, id in ipairs(sIds) do
			local nId = tonumber(id)
			if nId and nId == serverId then
				return true
			end
		end
	end
	return false
end

--是否在其他服已回归
function GameAgent:isOtherAlreadyReturn()
	local curServer = self:getLoginServer()
	local curServerId = curServer:getServer()
	local alreadyBackSid = self._returnServerInfo.alreadyBackSid
	if alreadyBackSid and alreadyBackSid ~= "" then
		local sIds = string.split(alreadyBackSid, "|")
		for i, id in ipairs(sIds) do
			local nId = tonumber(id)
			if nId and nId ~= curServerId then --找到一个已回归的服不是现在的服，就说明在其他服回归了
				return true
			end
		end
	end
	return false
end


--是否有资格回归
function GameAgent:isCanReturnServer()
	local isBackUser = self._returnServerInfo.isBackUser
	if isBackUser and isBackUser == 1 then
		return true
	end
	return false
end

--接受服务器校验信息
function GameAgent:_getVerifyNotice()
    if ccexp.WebView then 
        local checkUrl = G_ConfigManager:getHumanCheckUrl()
        if not checkUrl or checkUrl == "" then 
            return 
        end
        local urlTemplate = "#domain#/?sid=#sid#&uuid=#uuid#"
        local uuid = string.urlencode(G_GameAgent:getTopUserId())
        local sid = string.urlencode(G_GameAgent:getLoginServer():getServer())
        local url = string.gsub(urlTemplate, "#domain#", checkUrl)
        url = string.gsub(url, "#uuid#", uuid)
        url = string.gsub(url, "#sid#", sid)
        local popupHumanCheck = require("app.scene.view.humanCheck.PopupHumanCheck").new(url)
        -- popupHumanCheck:open()
        popupHumanCheck:openToOfflineLevel()
    end
end

return GameAgent
