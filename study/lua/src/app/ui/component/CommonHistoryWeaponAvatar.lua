--
-- Author: chenzhongjie
-- Date: 2019-08-23 14:16:28
--
local CommonHistoryWeaponAvatar = class("CommonHistoryWeaponAvatar")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
    "updateUI",
	"showShadow",
	"setCallBack",
	"setTouchEnabled",
}

function CommonHistoryWeaponAvatar:ctor()
	self._target = nil
	
end

function CommonHistoryWeaponAvatar:_init()
	self._imageWeapon = ccui.Helper:seekNodeByName(self._target, "ImageWeapon")
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "ImageShadow")
	self._panelClick = ccui.Helper:seekNodeByName(self._target, "Panel_click")
	self._panelClick:addClickEventListenerEx(handler(self, self._onTouchCallBack))
	self._panelClick:setSwallowTouches(false)
end

function CommonHistoryWeaponAvatar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHistoryWeaponAvatar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHistoryWeaponAvatar:updateUI(weaponBaseId)
	local weaponParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON, weaponBaseId)
	self._imageWeapon:loadTexture(weaponParam.icon_big)
end

function CommonHistoryWeaponAvatar:setTouchEnabled(enable)
	self._panelClick:setTouchEnabled(enable)
	self._panelClick:setSwallowTouches(false)
end

function CommonHistoryWeaponAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonHistoryWeaponAvatar:_onTouchCallBack(sender)
	local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
	local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
	if moveOffsetX < 20 and moveOffsetY < 20 then
		logWarn(" CommonHistoryWeaponAvatar:_onTouchCallBack(sender,state) ")
		if self._callback then
			self._callback(self._userData)
		end
	end
end

function CommonHistoryWeaponAvatar:showShadow(visible)
	self._imageShadow:setVisible(visible)
end

return CommonHistoryWeaponAvatar