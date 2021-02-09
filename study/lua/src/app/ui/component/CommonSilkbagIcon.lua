--
-- Author: Liangxu
-- Date: 2018-3-2 14:10:57
-- 
local CommonIconBase = import(".CommonIconBase")
local CommonSilkbagIcon = class("CommonSilkbagIcon",CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local EXPORTED_METHODS = {
	
}


function CommonSilkbagIcon:ctor()
	CommonSilkbagIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_SILKBAG
	self._effect1 = nil
	self._effect2 = nil
end

function CommonSilkbagIcon:_init()
	CommonSilkbagIcon.super._init(self)
	self._imageMidBg = ccui.Helper:seekNodeByName(self._target, "ImageMidBg")
end

function CommonSilkbagIcon:bind(target)
	CommonSilkbagIcon.super.bind(self, target)
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonSilkbagIcon:unbind(target)
	CommonSilkbagIcon.super.unbind(self, target)
	
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonSilkbagIcon:updateUI(value, size)
    local itemParams = CommonSilkbagIcon.super.updateUI(self, value, size)
    self._imageMidBg:loadTexture(itemParams.icon_mid_bg) 
	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end

	self:showIconEffect()
	return itemParams
end

function CommonSilkbagIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				local popup = require("app.scene.view.silkbag.PopupSilkbagDetailEx").new(TypeConvertHelper.TYPE_SILKBAG, self._itemParams.cfg.id)
				popup:openWithAction()
				if G_UserData:getSeasonSport():getInSeasonSilkView() then
					popup:updateInSeasonSilkView()
					popup:setCloseCallBack(handler(self, self._dispatchSeasonSilk))
				end
			end
		end
	end
end

function CommonSilkbagIcon:_dispatchSeasonSilk()
	G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_CLOSESILKDETAIL)
end

function CommonSilkbagIcon:removeLightEffect()
    if self._effect1 then
		self._effect1:runAction(cc.RemoveSelf:create())
		self._effect1 = nil
	end
	if self._effect2 then
		self._effect2:runAction(cc.RemoveSelf:create())
		self._effect2 = nil
	end
end

function CommonSilkbagIcon:showIconEffect(scale)
	self:removeLightEffect()
	if self._itemParams == nil then
		return
	end

	local baseId = self._itemParams.cfg.id
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

return CommonSilkbagIcon