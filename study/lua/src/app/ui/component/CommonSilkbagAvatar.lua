--
-- Author: Liangxu
-- Date: 2018-4-23
-- 装备展示控件
local CommonSilkbagAvatar = class("CommonSilkbagAvatar")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local EXPORTED_METHODS = {
    "updateUI",
    "setCallBack",
}

function CommonSilkbagAvatar:ctor()
	self._target = nil
	self._effect1 = nil
	self._effect2 = nil
end

function CommonSilkbagAvatar:_init()
	self._imageMidBg = ccui.Helper:seekNodeByName(self._target, "ImageMidBg")
	self._imageIcon = ccui.Helper:seekNodeByName(self._target, "ImageIcon")
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName")
	self._imageTextName = ccui.Helper:seekNodeByName(self._target, "Image11")
	self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")
	self._panelTouch:addTouchEventListener(handler(self, self._onTouchCallBack))
	self._panelTouch:setSwallowTouches(false)
end

function CommonSilkbagAvatar:bind(target)
	self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonSilkbagAvatar:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonSilkbagAvatar:updateUI(baseId)
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, baseId)
	self._imageMidBg:loadTexture(param.icon_mid_bg2)
	self._imageIcon:loadTexture(param.icon)
	self._textName:setString(param.name)
	local sz = self._imageTextName:getContentSize()
	local width = self._textName:getContentSize().width
	self._imageTextName:setContentSize(cc.size(width+50, sz.height))
	self._textName:setColor(param.icon_color)
	self:showIconEffect(baseId)
end

function CommonSilkbagAvatar:setCallBack(callback)
	if self._callback then
		self._callback = nil
	end
	self._callback = callback
end

function CommonSilkbagAvatar:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback()
			end
		end
	end
end

function CommonSilkbagAvatar:removeLightEffect()
    if self._effect1 then
		self._effect1:runAction(cc.RemoveSelf:create())
		self._effect1 = nil
	end
	if self._effect2 then
		self._effect2:runAction(cc.RemoveSelf:create())
		self._effect2 = nil
	end
end

function CommonSilkbagAvatar:showIconEffect(baseId)
	self:removeLightEffect()

	local effects = require("app.utils.data.SilkbagDataHelper").getEffectWithBaseId(baseId)
	if effects == nil then
		return
	end

	if self._nodeEffectUp == nil then
		self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")
	end
	if self._nodeEffectDown == nil then
		self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
	end

	if #effects == 1 then
		local effectName = effects[1]
		self._effect1 = EffectGfxNode.new(effectName)
		self._nodeEffectUp:addChild(self._effect1)
        self._effect1:play()
	end

	if #effects == 2 then
		local effectName1 = effects[1]
		self._effect1 = EffectGfxNode.new(effectName1)
		self._nodeEffectDown:addChild(self._effect1)
		self._effect1:play()
    	local effectName2 = effects[2]
		self._effect2 = EffectGfxNode.new(effectName2)
		self._nodeEffectUp:addChild(self._effect2)
		self._effect2:play()
	end
end

return CommonSilkbagAvatar