local PopupBase = require("app.ui.PopupBase")
local PopupNotice = class("PopupNotice", PopupBase)
local Path = require("app.utils.Path")

--
function PopupNotice:ctor(url, title)
    self._url = url
    self._title = title
    self._autoLogin = false
    local resource = {
        file = Path.getCSB("PopupNotice", "common"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _commonButton = {
                events = {{event = "touch", method = "_onKnowBtn"}}
            }
        }
    }
    PopupNotice.super.ctor(self, resource, false, true)
end

--
function PopupNotice:onCreate()
    self._popupBG:setTitle(self._title or "公   告")
    self._popupBG:addCloseEventListener(
        function()
            self:closeWithAction()
        end
    )

    --self._popupBG:offsetCloseButton(0,4)--按钮向上移动4个像素
    self._commonButton:setString(Lang.get("login_notice_know"))

    if G_ConfigManager:isDalanVersion() then
        local imageLogo = self._resourceNode:getChildByName("Image_1")
        if imageLogo then
            imageLogo:setVisible(false)
        end
    end
end

--
function PopupNotice:onShowFinish()
    local discSize = self._webLayer:getContentSize()
    if ccexp.WebView then
        self._webView = ccexp.WebView:create()
        self._webView:setPosition(cc.p(discSize.width / 2 - 6, discSize.height / 2))
        self._webView:setContentSize(discSize.width, discSize.height)
        self._webView:loadURL(self._url)
        self._webView:setScalesPageToFit(false)
        self._webView:setBounces(false)

        self._webLayer:addChild(self._webView)
    end
end

--
function PopupNotice:_onKnowBtn(sender)
    self:close()
end

--
function PopupNotice:onEnter()
end

--
function PopupNotice:onExit()
    if self._autoLogin then
        G_SignalManager:dispatch(SignalConst.EVENT_AUTO_LOGIN)
    end
end

--
function PopupNotice:create(url, title)
    local popup = PopupNotice.new(url, title)
    popup:openWithAction()
    return popup
end

--
function PopupNotice:closeWithAction()
    self:close()
end

--
function PopupNotice:open()
    self:setPosition(G_ResolutionManager:getDesignCCPoint())
    G_TopLevelNode:addToNoticeLevel(self)
end

function PopupNotice:openAutoLogin()
    self._autoLogin = true
end

return PopupNotice
