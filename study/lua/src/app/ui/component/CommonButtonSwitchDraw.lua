--
-- Author: Liangxu
-- Date: 2017-12-6 17:39:29
-- 战斗\立绘切换按钮
local CommonButtonSwitchDraw = class("CommonButtonSwitchDraw")

local EXPORTED_METHODS = {
	"setState",
	"setCallback",
}

function CommonButtonSwitchDraw:ctor()
	self._target = nil
	self._isDrawing = nil --是否是立绘
	self._callback = nil
end

function CommonButtonSwitchDraw:_init()
	self._image1 = ccui.Helper:seekNodeByName(self._target, "Image1")
	self._image2 = ccui.Helper:seekNodeByName(self._target, "Image2")
	self._imageText1 = ccui.Helper:seekNodeByName(self._target, "ImageText1")
	self._imageText2 = ccui.Helper:seekNodeByName(self._target, "ImageText2")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))

	self._pos1 = cc.p(self._image1:getPosition()) --初始位置
	self._pos2 = cc.p(self._image2:getPosition())
end

function CommonButtonSwitchDraw:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonButtonSwitchDraw:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonButtonSwitchDraw:setState(isDrawing)
	self._isDrawing = isDrawing
	self:_updateUI()
end

function CommonButtonSwitchDraw:setCallback(callback)
	self._callback = callback
end

function CommonButtonSwitchDraw:_updateUI()
	if not self._isDrawing then
		self._image1:loadTexture(Path.getCommonIcon("system", "icon_zhandou01"))
		self._imageText1:loadTexture(Path.getTextSystem("txt_zhandou01"))
		self._image2:loadTexture(Path.getCommonIcon("system", "icon_lihui02"))
		self._imageText2:loadTexture(Path.getTextSystem("txt_lihui01"))
	else --立绘
		self._image1:loadTexture(Path.getCommonIcon("system", "icon_lihui01"))
		self._imageText1:loadTexture(Path.getTextSystem("txt_lihui01"))
		self._image2:loadTexture(Path.getCommonIcon("system", "icon_zhandou02"))
		self._imageText2:loadTexture(Path.getTextSystem("txt_zhandou01"))
	end
end

function CommonButtonSwitchDraw:_onPanelTouch()
	self._isDrawing = not self._isDrawing
	self:_updateUI()
	if self._callback then
		self._callback(self._isDrawing)
	end
end

return CommonButtonSwitchDraw