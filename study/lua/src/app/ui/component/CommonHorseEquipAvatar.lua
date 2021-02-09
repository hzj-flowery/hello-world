--
-- Author: JerryHe
-- Date: 2019-01-28
-- 战马装备展示控件
-- 
local CommonHorseEquipAvatar = class("CommonHorseEquipAvatar")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local EXPORTED_METHODS = {
    "updateUI",
    "showShadow",
    "setCallBack",
    "setEquipId",
    "getEquipId",
    "getHeight",
}

function CommonHorseEquipAvatar:ctor()
	self._target = nil
	self._equipId = nil
end

function CommonHorseEquipAvatar:_init()
	self._imageEquip = ccui.Helper:seekNodeByName(self._target, "ImageEquip")
	self._imageShadow = ccui.Helper:seekNodeByName(self._target, "ImageShadow")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addTouchEventListener(handler(self, self._onTouchCallBack))
	self._panelTouch:setSwallowTouches(false)
end

function CommonHorseEquipAvatar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHorseEquipAvatar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHorseEquipAvatar:updateUI(equipBaseId)   
    -- todo Jerry 这里需要根据战马装备的静态id，获取相应的参数，暂时没有，使用装备的类别来处理
	local equipParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HORSE_EQUIP, equipBaseId)
	self._imageEquip:loadTexture(equipParam.icon_big)
end

function CommonHorseEquipAvatar:showShadow(visible)
	self._imageShadow:setVisible(visible)
end

function CommonHorseEquipAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonHorseEquipAvatar:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(self._userData)
			end
		end
	end
end

function CommonHorseEquipAvatar:setEquipId(equipId)
	self._equipId = equipId
end

function CommonHorseEquipAvatar:getEquipId()
	return self._equipId
end

function CommonHorseEquipAvatar:getHeight()
	return self._imageEquip:getContentSize().height
end

return CommonHorseEquipAvatar