--
-- Author: Liangxu
-- Date: 2017-9-16 10:58:02
--
local CommonInstrumentAvatar = class("CommonInstrumentAvatar")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
	"updateUI",
	"showShadow",
	"setCallBack",
	"setTouchEnabled",
}

function CommonInstrumentAvatar:ctor()
	self._target = nil
end

function CommonInstrumentAvatar:_init()
	self._imageInstrument = ccui.Helper:seekNodeByName(self._target, "ImageInstrument")
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "ImageShadow")
	self._panelClick = ccui.Helper:seekNodeByName(self._target, "Panel_click")
	self._panelClick:addClickEventListenerEx(handler(self, self._onTouchCallBack))
	self._panelClick:setSwallowTouches(false)
end

function CommonInstrumentAvatar:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonInstrumentAvatar:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonInstrumentAvatar:updateUI(baseId, limitLevel)
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, baseId, nil, nil, limitLevel)
	self._imageInstrument:loadTexture(param.icon_big)
end

function CommonInstrumentAvatar:setTouchEnabled(enable)
	self._panelClick:setTouchEnabled(enable)
	self._panelClick:setSwallowTouches(false)
end

function CommonInstrumentAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonInstrumentAvatar:_onTouchCallBack(sender)
	local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
	local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
	if moveOffsetX < 20 and moveOffsetY < 20 then
		logWarn(" CommonInstrumentAvatar:_onTouchCallBack(sender,state) ")
		if self._callback then
			self._callback()
		end
	end
end

function CommonInstrumentAvatar:showShadow(visible)
	self._imageShadow:setVisible(visible)
end

return CommonInstrumentAvatar
