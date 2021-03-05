--普通副本胜利界面
local ViewBase = require("app.ui.ViewBase")
local NormalWinBase = class("NormalWinBase", ViewBase)

function NormalWinBase:ctor()
    self._panelStar = nil   --星数面板
    self._imgStar1 = nil    --1星
    self._imgStar2 = nil    --2星
    self._imgStar3 = nil    --3星
    self._showStars = {}    --星数组
    self._listContent = nil     --用于塞入panel的listview
    self._layerColor = cc.LayerColor:create(cc.c4b(0, 0, 0, 0))     --触摸面板
	local resource = {
		file = Path.getCSB("NormalWinBase", "settlement"),
		size = {1136, 640},
		binding = {
		}
	}
	NormalWinBase.super.ctor(self, resource)
end

function NormalWinBase:onCreate()
	self._layerColor:setAnchorPoint(0.5,0.5)
	self._layerColor:setIgnoreAnchorPointForPosition(false)
	self:addChild(self._layerColor)
	self._layerColor:setTouchEnabled(true)
    self._layerColor:setTouchMode(cc.TOUCHES_ONE_BY_ONE)
    self._layerColor:registerScriptTouchHandler(handler(self, self._onTouchHandler))
    self._panelStar:setVisible(false)
    self._showStars = {self._imgStar1, self._imgStar2, self._imgStar3}
end

function NormalWinBase:onEnter()
end

function NormalWinBase:onExit()
end

--点击触摸返回
function NormalWinBase:_onTouchHandler(event,x,y)
	if event == "began" then
        return true
    elseif event == "ended" then
        G_SceneManager:popScene()
    end
end

--更新星数
function NormalWinBase:setStarCount(count)
    for i = 1, 3 do
        if i <= count then
            self._showStars[i]:setVisible(true)
        else
            self._showStars[i]:setVisible(false)
        end
    end
    self._panelStar:setVisible(true)
end

function NormalWinBase:pushPanel(panel)
    self._listContent:pushBackCustomItem(panel)
end

return NormalWinBase