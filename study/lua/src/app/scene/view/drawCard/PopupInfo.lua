local PopupBase = require("app.ui.PopupBase")
local PopupInfo = class("PopupInfo", PopupBase)

function PopupInfo:ctor()
    local resource = {
		file = Path.getCSB("DrawCardScoreIntroLayer", "drawCard"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_panelBase = {
				events = {{event = "touch", method = "_onCloseClick"}}
			},
		}
	}
	PopupInfo.super.ctor(self, resource, true, true)
end

function PopupInfo:onCreate()
	self:setPosition(0,0)
end

function PopupInfo:onEnter()
    self:setPosition(cc.p(0, 0))
end

function PopupInfo:onExit()
end

function PopupInfo:_onCloseClick()
    self:closeWithAction()
end

return PopupInfo