local PopupBase =  require("app.ui.PopupBase")
local PopupHumanCheck = class("popupHumanCheck", PopupBase)

--
function PopupHumanCheck:ctor(url, title)
    self._url = url
    self._title = title
    local resource = {
        file = Path.getCSB("PopupNotice", "common"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            -- _commonButton = {
            --     events = {{event = "touch", method = "_onKnowBtn"}}
            -- }
        }
    }
    PopupHumanCheck.super.ctor(self, resource, false, true)
end

function PopupHumanCheck:onCreate()
end

function PopupHumanCheck:onEnter()
    local discSize = cc.size(1400,  640)
    if ccexp.WebView then
        self._webView = ccexp.WebView:create()
        -- self._webView:setPosition(cc.p(discSize.width / 2 , discSize.height / 2))
        self._webView:setPosition(cc.p(0, 0))
        
        self._webView:setContentSize(discSize.width, discSize.height)
        
        self._webView:setScalesPageToFit(false)
        self._webView:setBounces(false)

        -- self._webLayer:addChild(self._webView)
        self:addChild(self._webView)

        self._webView:setOnShouldStartLoading(function(sender, url)
            print("onWebViewShouldStartLoading, url is ", url)
            --xxx.xx.xx.xx/success.php        
            -- if url == "https://mjz.sanguosha.com/" then 
            if string.find(url,"success") then
                self:close()
            end
            
            return true
      end)  

    self._webView:loadURL(self._url)
    end   
end

function PopupHumanCheck:onExit()
end

return PopupHumanCheck
