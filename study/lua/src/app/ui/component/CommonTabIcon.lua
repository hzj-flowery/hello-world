--
-- Author: Liangxu
-- Date: 2017-11-29
-- 侧边玉牌
local CommonTabIcon = class("CommonTabIcon")

local EXPORTED_METHODS = {
	"updateUI",
	"setCallback",
	"showRedPoint",
    "setSelected",
    "setNodeVisible"
}

function CommonTabIcon:ctor()
	self._target = nil
	self._imageBg = nil
	self._text = nil
	self._imageRedPoint = nil
	self._panelTouch = nil

	self._isOpen = nil
	self._index = nil
	self._callback = nil
end

function CommonTabIcon:_init()
	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._text = ccui.Helper:seekNodeByName(self._target, "Text")
	self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
	self._imageRedPoint:setVisible(false)
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
end

function CommonTabIcon:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTabIcon:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTabIcon:updateUI(txt, isOpen, index)
	self._isOpen = isOpen
	self._index = index

	local res = isOpen and Path.getUICommon("img_btn_tab01_nml") or Path.getUICommon("img_btn_tab01_dis")
	local color = isOpen and Colors.TAB_ICON_NORMAL or Colors.TAB_ICON_DISABLE
	self._imageBg:loadTexture(res)
	self._text:setString(txt)
	self._text:setColor(color)
end

function CommonTabIcon:setCallback(callback)
	self._callback = callback
end

function CommonTabIcon:showRedPoint(show)
	self._imageRedPoint:setVisible(show)
end

function CommonTabIcon:setSelected(selected)
	if not self._isOpen then
		return
	end

	local res = selected and Path.getUICommon("img_btn_tab01_down") or Path.getUICommon("img_btn_tab01_nml")
	local color = selected and Colors.TAB_ICON_SELECTED or Colors.TAB_ICON_NORMAL
	self._imageBg:loadTexture(res)
	self._text:setColor(color)
end

function CommonTabIcon:setNodeVisible(isVisible)
    self._imageBg:setVisible(isVisible)
    self._text:setVisible(isVisible)
    self._imageRedPoint:setVisible(isVisible)
    self._panelTouch:setVisible(isVisible)
end

function CommonTabIcon:_onPanelTouch(sender, state)
	if not self._isOpen then
		return
	end
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:setSelected(true)
		if self._callback then
			self._callback(self._index)
		end
	end
end

return CommonTabIcon