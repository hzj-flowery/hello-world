local PopupBase = require("app.ui.PopupBase")
local PopupSeasonTip = class("PopupSeasonTip", PopupBase)

function PopupSeasonTip:ctor(dstPosition)
    self._dstPosition = dstPosition or cc.p(0, 0)
	local resource = {
		file = Path.getCSB("PopupSeasonTip", "seasonSport"),
		binding = {
		}
	}
	PopupSeasonTip.super.ctor(self, resource, false, true)
end

function PopupSeasonTip:onCreate()
	self._label = nil
	self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:addClickEventListener(handler(self, self._onClick)) --避免0.5秒间隔
end

function PopupSeasonTip:onEnter()
	self:_updateView()
end

function PopupSeasonTip:onExit()
	
end

--重写opne&close接口，避免黑底层多层时的混乱现象
function PopupSeasonTip:open()
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(self)
end

function PopupSeasonTip:close()
	self:onClose()
	self.signal:dispatch("close")
	self:removeFromParent()
end

function PopupSeasonTip:_updateView()
	if self._label == nil then
		self._label = cc.Label:createWithTTF("", Path.getCommonFont(), 22)
		self._label:setAnchorPoint(cc.p(0, 0.8))
		self._label:setColor(Colors.DARK_BG_ONE)
		self._label:setWidth(450)
		self._desNode:addChild(self._label)
	end

    local stage = G_UserData:getSeasonSport():getSeason_Stage()
	self._label:setString(Lang.get("season_tip_rulecontent_" .. stage))

	local txtHeight = self._label:getContentSize().height
	local panelHeight = 132
	if txtHeight > 132 - 60 then
		panelHeight = 60 + txtHeight
		self._desNode:setPositionY(panelHeight - 49)
		local bgSize = self._panelBg:getContentSize()
		self._panelBg:setContentSize(cc.size(bgSize.width, panelHeight))
	end

	self._panelBg:setPosition(self._dstPosition)
end

function PopupSeasonTip:_onClick()
	self:close()
end

return PopupSeasonTip