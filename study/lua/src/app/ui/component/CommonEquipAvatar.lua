--
-- Author: Liangxu
-- Date: 2017-04-13 10:36:09
-- 装备展示控件
local CommonEquipAvatar = class("CommonEquipAvatar")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
	"updateUI",
	"showShadow",
	"setCallBack",
	"setEquipId",
	"getEquipId",
	"getHeight",
	"setShadowPosY"
}

function CommonEquipAvatar:ctor()
	self._target = nil
	self._equipId = nil
end

function CommonEquipAvatar:_init()
	self._imageEquip = ccui.Helper:seekNodeByName(self._target, "ImageEquip")
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "ImageShadow")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addTouchEventListener(handler(self, self._onTouchCallBack))
	self._panelTouch:setSwallowTouches(false)
end

function CommonEquipAvatar:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonEquipAvatar:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonEquipAvatar:updateUI(equipBaseId)
	local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, equipBaseId)
	self._imageEquip:loadTexture(equipParam.icon_big)
end

function CommonEquipAvatar:showShadow(visible)
	self._imageShadow:setVisible(visible)
end

function CommonEquipAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonEquipAvatar:_onTouchCallBack(sender, state)
	-----------防止拖动的时候触发点击
	if (state == ccui.TouchEventType.ended) then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(self._userData)
			end
		end
	end
end

function CommonEquipAvatar:setEquipId(equipId)
	self._equipId = equipId
end

function CommonEquipAvatar:getEquipId()
	return self._equipId
end

function CommonEquipAvatar:getHeight()
	return self._imageEquip:getContentSize().height
end

function CommonEquipAvatar:setShadowPosY(y)
	local posy = -94 --默认位置
	self._imageShadow:setPositionY(posy + y)
end

return CommonEquipAvatar
