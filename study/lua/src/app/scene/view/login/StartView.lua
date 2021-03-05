local ViewBase = require("app.ui.ViewBase")
local StartView = class("StartView", ViewBase)
local UIPopupHelper = require("app.utils.UIPopupHelper")
local PopupServerList = require("app.scene.view.login.PopupServerList")

--
function StartView:ctor()
	local resource = {
		file = Path.getCSB("StartView", "login"),
        size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnEnter = {
				events = {{event = "touch", method = "onButtonEnter"}}
			},
			_btnUser = {
				events = {{event = "touch", method = "onButtonUser"}}
			},
			_btnServer = {
				events = {{event = "touch", method = "onButtonServer"}}
			},
			_buttonGongGao = {
				events = {{event = "touch", method = "_onGongGaoButton"}}
			},
			_buttonLogoutAccount = {
				events = {{event = "touch", method = "_onLogoutAccountButton"}}
            },
            _btnPlay = {
				events = {{event = "touch", method = "_onPlayClick"}}
			},
			
		}
	}
	StartView.super.ctor(self, resource)
end

--
function StartView:onCreate()
	--self._btnEnter:setString(Lang.get("login_start_game"))
	self._buttonLogoutAccount:setVisible(false)
end

--
function StartView:onEnter()
	self._signalSdkLogin = G_SignalManager:add(SignalConst.EVENT_SDK_LOGIN, handler(self,self.updateUserName))
    self._signalSdkLogout = G_SignalManager:add(SignalConst.EVENT_SDK_LOGOUT, handler(self,self.updateUserName))
    self._signalServer = G_ServerListManager.signal:add(handler(self, self.onCheckUpdateList))

    local CGHelper = require("app.scene.view.cg.CGHelper")
    if not CGHelper.checkCG(true) then 
        self._btnPlay:setVisible(false)
        self._buttonLogoutAccount:setPositionY(self._btnPlay:getPositionY())
    end
end

--
function StartView:onExit()
	self._signalSdkLogin:remove()
	self._signalSdkLogin = nil
	self._signalSdkLogout:remove()
	self._signalSdkLogout = nil
	self._signalServer:remove()
	self._signalServer = nil
end

--
function StartView:showView()
	self:setVisible(true)
	self:updateUserName()
    self:checkUpdateList(false)
end

--
function StartView:hideView()
	self:setVisible(false)
end

function StartView:_onGongGaoButton(render)

    if ccexp.WebView then
        local url = G_ConfigManager:getPopupUrl()
        if url ~= nil and url ~= "" then
			local PopupNotice = require("app.ui.PopupNotice")
            PopupNotice:create(url, nil)
		end
		return
	end
	if CONFIG_READ_REPORT then
		-- G_SceneManager:showScene("firstfight")
		G_SceneManager:showScene("fighttest")
		-- G_SceneManager:showScene("horseRace", 1)
	-- 	local storyChat = require("app.scene.view.storyChat.PopupStoryChat").new(22)
	-- 	storyChat:open()
		-- G_SceneManager:showScene("uicontrol")
    end
end

function StartView:_onLogoutAccountButton(render)
    G_GameAgent:loginPlatform()
end


--
function StartView:onCheckUpdateList(ret)
	print("onCheckUpdateList = " .. ret)
	G_WaitingMask:showWaiting(false)
	if ret == "success" or ret == "returnServerSuccess" then
		if self._openServerList then
			self._openServerList = false
			G_SceneManager:showDialog("app.scene.view.login.PopupServerList",nil,nil,
				function (server)
					G_GameAgent:setLoginServer(server)
					self:updateUserServer()
				end)
--[[
			local popup = PopupServerList.new(function (server)
				G_GameAgent:setLoginServer(server)
                self:updateUserServer()
			end)
			popup:openWithAction()
			]]
		else
			self:updateUserServer() 
		end
	elseif ret == "fail" then
		--失败
		local callback = function ()
            self:checkUpdateList()
        end
     
		UIPopupHelper.popupOkDialog(nil,"获取服务器列表失败",callback,"更新")
	end
	
end

--
function StartView:updateUserName()
    local str_name = G_GameAgent:getLoginUserName()
    if str_name then
		self._buttonLogoutAccount:setVisible(true)
        self._labelUser:setString(str_name)
    else
		self._buttonLogoutAccount:setVisible(false)
        self._labelUser:setString("")
    end
	
	
	
end

--
function StartView:updateUserServer()
    local server = G_GameAgent:getLoginServer()
    if server then
		local statusIcon,showStatusIcon = Path.getServerStatusIcon(server:getStatus())
		self._image_server_type:setVisible(showStatusIcon)
		if showStatusIcon then
			self._image_server_type:loadTexture(statusIcon)
		end
        self._labelServer:setString(server:getName())
    else
		self._image_server_type:setVisible(false)
        self._labelServer:setString("")
    end

	
end

--
function StartView:checkUpdateList(open)
    self._openServerList = open
    if G_ServerListManager:isCheckUpdate() then
    	-- G_WaitingMask:showWaiting(true)
	    G_ServerListManager:checkUpdateList()
	else
		self:onCheckUpdateList("success")
	end
end

--
function StartView:onButtonEnter()
	local server = G_GameAgent:getLoginServer()
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playSoundWithId(AudioConst.SOUND_BUTTON_START_GAME)
	logWarn("onButtonEnter")
	if server == nil then
		G_GameAgent:loginPlatform()
        return
    end
    -- local isLogin = G_GameAgent:isLogin()
    -- print("1112233 islogin = ", isLogin)
	-- local AgreementSetting = require("app.data.AgreementSetting")
	-- if not AgreementSetting.isAgreementCheckMayLogin() or not AgreementSetting.isAllAgreementCheck() then
	-- 	--G_Prompt:showTip(Lang.get("login_tips_agreement_not_agree"))
	-- 	G_SceneManager:showDialog("app.scene.view.login.PopupSecretView")
	-- 	return 
	-- end
	if server:isBackserver() and G_GameAgent:isLogin() then
		if G_GameAgent:checkIsCanEnterReturnServer(server) == false then
			G_GameAgent:onCanNotEnterReturnServer()
			return
		end
	end
    G_GameAgent:enterGame()
    

    -- local videoPlayer = ccexp.VideoPlayer:create()
    -- videoPlayer:setPosition(cc.p(700, 320))
    -- videoPlayer:setAnchorPoint(cc.p(0.5, 0.5))
    -- videoPlayer:setContentSize(cc.size(700, 320))
    -- videoPlayer:setKeepAspectRatioEnabled(false)
    -- videoPlayer:setTouchEnabled(false)
    -- videoPlayer:setFullScreenEnabled(true)
    -- self:addChild(videoPlayer)
    -- videoPlayer:setFileName("video/opening.mp4")
    -- videoPlayer:play()


end

--
function StartView:onButtonUser()
	G_GameAgent:loginPlatform()
end

--
function StartView:onButtonServer()
	if G_ConfigManager:isCheckReturnServer() and G_GameAgent:getTopUserId() == nil then
		G_Prompt:showTip(Lang.get("return_server_first_login_tip"))
		return
	end
	self:checkUpdateList(true)
end

function StartView:_onPlayClick( )
    -- body
    -- G_SceneManager:showScene("cg", "start.mp4")
    local cgNode = require("app.scene.view.cg.CGView").new("start.mp4", true)
    self:addChild(cgNode)
end



return StartView