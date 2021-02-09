local RealNameService = class("RealNameService")

function RealNameService:ctor( ... )
    self._signalAvoidGame = nil
    self._signalOpenRealName = nil
    self._signalAvoidNotice = nil
    self:_registerEvents()
    self._showDlg = false
    self._popupSystemAlert = nil
    self._avoidDlg = nil
end

function RealNameService:_registerEvents()
    if not self._signalAvoidGame then
		self._signalAvoidGame = G_SignalManager:add(SignalConst.EVENT_AVOID_GAME, handler(self, self._onEventAvoidGame))
    end
    if not self._signalOpenRealName then
		self._signalOpenRealName = G_SignalManager:add(SignalConst.EVENT_OPEN_REAL_NAME, handler(self, self._onEventRealName))
    end
    if not self._signalAvoidNotice then
		self._signalAvoidNotice = G_SignalManager:add(SignalConst.EVENT_AVOID_NOTICE, handler(self, self._onEventAvoidNotice))
    end
end


function RealNameService:_openAvoidAlert()
    local scene = G_SceneManager:getRunningSceneName()
    if scene == "login" then
        return
    end

    if self._popupSystemAlert then 
        self._popupSystemAlert:close()
        self._popupSystemAlert = nil
    end

    local popupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("avoid_notice_title"), Lang.get("avoid_notice_content"), 
    handler(self, self._openAvoidGameDlg), handler(self, self._reLogin), false)
    popupSystemAlert:setCloseVisible(false)
    popupSystemAlert:setCheckBoxVisible(false)
    popupSystemAlert:setBtnOk(Lang.get("avoid_btn_go"))
    popupSystemAlert:setBtnCancel(Lang.get("avoid_btn_cancel"))
    popupSystemAlert:openWithAction()
    self._popupSystemAlert = popupSystemAlert
end

function RealNameService:_onEventAvoidGame()
    G_GameAgent:getRealNameState(handler(self, self._openAvoidAlert))
end

function RealNameService:openRealNameDlg()
    local popupRealName = require("app.scene.view.system.PopupRealName").new(false)
    popupRealName:openWithAction()
    self._showDlg = true
end

function RealNameService:_openAvoidGameDlg()
    if self._avoidDlg then 
        self._avoidDlg:close()
        self._avoidDlg = nil
    end
    local popupRealName = require("app.scene.view.system.PopupRealName").new(true)
    popupRealName:openWithAction()
    self._avoidDlg = popupRealName
end

function RealNameService:_reLogin()
    G_GameAgent:returnToLogin()
end

function RealNameService:_openRealDlg()
    local scene = G_SceneManager:getRunningSceneName()
    if scene == "login" or self._showDlg then
        return
    end
    local popupRealName = require("app.scene.view.system.PopupRealName").new(false)
    popupRealName:openWithAction()
    self._showDlg = true
end


function RealNameService:_onEventRealName()
    G_GameAgent:getRealNameState(handler(self, self._openRealDlg))
end

function RealNameService:_unRegisterEvents()
	if self._signalAvoidGame then
		self._signalAvoidGame:remove()
		self._signalAvoidGame = nil
    end
    if self._signalOpenRealName then
		self._signalOpenRealName:remove()
		self._signalOpenRealName = nil
    end
    if self._signalAvoidNotice then 
        self._signalAvoidNotice:remove()
        self._signalAvoidNotice = nil
    end  
end

function RealNameService:start()
    self:_registerEvents()
    self._showDlg = false
    self._popupSystemAlert = nil
    self._avoidDlg = nil
end

function RealNameService:clear()
	self:_unRegisterEvents()
end

function RealNameService:_onEventAvoidNotice(msgName, hour)
    G_GameAgent:getRealNameState(function()
            local popupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("avoid_notice_hour_title"), Lang.get("avoid_notice_content_hour", {count = hour}))
            popupSystemAlert:setCloseVisible(false)
            popupSystemAlert:setCheckBoxVisible(false)
            popupSystemAlert:showGoButton(Lang.get("avoid_hour_ok"))
            popupSystemAlert:openWithAction() 
        end
    )
end

return RealNameService
