--
-- Author: Liangxu
-- Date: 2017-05-09 14:16:28
--
local CommonTreasureAvatar = class("CommonTreasureAvatar")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
    "updateUI",
	"showShadow",
	"setCallBack",
	"setTouchEnabled",
}

function CommonTreasureAvatar:ctor()
	self._target = nil
	
end

function CommonTreasureAvatar:_init()
	self._imageTreasure = ccui.Helper:seekNodeByName(self._target, "ImageTreasure")
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "ImageShadow")
	self._panelClick = ccui.Helper:seekNodeByName(self._target, "Panel_click")
	self._panelClick:addClickEventListenerEx(handler(self, self._onTouchCallBack))
	self._panelClick:setSwallowTouches(false)
end

function CommonTreasureAvatar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTreasureAvatar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTreasureAvatar:updateUI(treasureBaseId)
	local treasureParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TREASURE, treasureBaseId)
	self._imageTreasure:loadTexture(treasureParam.icon_big)
end

function CommonTreasureAvatar:setTouchEnabled(enable)
	self._panelClick:setTouchEnabled(enable)
	self._panelClick:setSwallowTouches(false)
end

function CommonTreasureAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonTreasureAvatar:_onTouchCallBack(sender)
	local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
	local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
	if moveOffsetX < 20 and moveOffsetY < 20 then
		logWarn(" CommonTreasureAvatar:_onTouchCallBack(sender,state) ")
		if self._callback then
			self._callback(self._userData)
		end
	end
end

function CommonTreasureAvatar:showShadow(visible)
	self._imageShadow:setVisible(visible)
end

return CommonTreasureAvatar