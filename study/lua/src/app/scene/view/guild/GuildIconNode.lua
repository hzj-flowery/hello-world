--
-- Author: Liangxu
-- Date: 2017-06-21 14:38:27
-- 军团创建图标
local GuildIconNode = class("GuildIconNode")
local UserDataHelper = require("app.utils.UserDataHelper")

function GuildIconNode:ctor(target, iconIndex, onClick)
	self._target = target
	self._iconIndex = iconIndex
	self._onClick = onClick

	self._imageIcon = ccui.Helper:seekNodeByName(self._target, "ImageIcon")
	self._imageSelected = ccui.Helper:seekNodeByName(self._target, "ImageSelected")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))

	local icon = Path.getCommonIcon("guild", iconIndex)
	self._imageIcon:loadTexture(icon)
end

function GuildIconNode:_onPanelTouch()
	if self._onClick then
		self._onClick(self._iconIndex)
	end
end

function GuildIconNode:setSelected(selected)
	if selected == nil then
		selected = false
	end
	self._imageSelected:setVisible(selected)
end

return GuildIconNode