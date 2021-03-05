--
-- Author: Liangxu
-- Date: 2017-03-29 20:08:33
-- 阵容界面援军按钮
local ViewBase = require("app.ui.ViewBase")
local TeamPartnerButton = class("TeamPartnerButton", ViewBase)

function TeamPartnerButton:ctor(onClick)
	self._onClick = onClick

	local resource = {
		file = Path.getCSB("TeamPartnerButton", "team"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onPanelTouch"}}
			},
		}
	}

	TeamPartnerButton.super.ctor(self, resource)
end

function TeamPartnerButton:onCreate()
	self._panelTouch:setSwallowTouches(false)
	self:_initUI()
end

function TeamPartnerButton:onEnter()
	
end

function TeamPartnerButton:onExit()
	
end

function TeamPartnerButton:_initUI()
	self._imageSelected:setVisible(false)
	self._redPoint:setVisible(false)
end

function TeamPartnerButton:setSelected(selected)
	self._imageSelected:setVisible(selected)
end

function TeamPartnerButton:_onPanelTouch(sender, state)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		if self._onClick then
			self._onClick()
		end
	end
end

function TeamPartnerButton:showRedPoint(visible)
	self._redPoint:setVisible(visible)
end

return TeamPartnerButton