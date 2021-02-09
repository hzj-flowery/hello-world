--普通副本胜利界面
local ViewBase = require("app.ui.ViewBase")
local NormalLoseBase = class("NormalLoseBase", ViewBase)

function NormalLoseBase:ctor()
    self._layerColor = cc.LayerColor:create(cc.c4b(0, 0, 0, 0))     --触摸面板
	local resource = {
		file = Path.getCSB("NormalLoseBase", "settlement"),
		size = {1136, 640},
		binding = {
		}
	}
	NormalLoseBase.super.ctor(self, resource)
end

function NormalLoseBase:onCreate()
	self._layerColor:setAnchorPoint(0.5,0.5)
	self._layerColor:setIgnoreAnchorPointForPosition(false)
	self:addChild(self._layerColor)
	self._layerColor:setTouchEnabled(true)
    self._layerColor:setTouchMode(cc.TOUCHES_ONE_BY_ONE)
    self._layerColor:registerScriptTouchHandler(handler(self, self._onTouchHandler))
end

function NormalLoseBase:onEnter()
end

function NormalLoseBase:onExit()
end

--点击触摸返回
function NormalLoseBase:_onTouchHandler(event,x,y)
	if event == "began" then
        return true
    elseif event == "ended" then
        G_SceneManager:popScene()
    end
end

return NormalLoseBase