
local CommonIconBase = import(".CommonIconBase")
local CommonHistoryWeaponIcon = class("CommonHistoryWeaponIcon",CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local EXPORTED_METHODS = {
	"setType",
	"updateUI",
}


function CommonHistoryWeaponIcon:ctor()
	CommonHistoryWeaponIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_HISTORY_HERO_WEAPON
	self._effect1 = nil
	self._effect2 = nil
end

function CommonHistoryWeaponIcon:_init()
	CommonHistoryWeaponIcon.super._init(self)
end

function CommonHistoryWeaponIcon:bind(target)
	CommonHistoryWeaponIcon.super.bind(self, target)
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHistoryWeaponIcon:unbind(target)
	CommonHistoryWeaponIcon.super.unbind(self, target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHistoryWeaponIcon:updateUI(value, size)
	local itemParams = CommonHistoryWeaponIcon.super.updateUI(self, value, size)
	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end
	self:showIconEffect()
end

function CommonHistoryWeaponIcon:setType(type)
	self._type = type
end

function CommonHistoryWeaponIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				local popup = require("app.scene.view.historyhero.PopupHistoryHeroWeaponDetail").new(
					self._itemParams.cfg.id)
    			popup:openWithAction()
			end
		end
	end
end

function CommonHistoryWeaponIcon:removeLightEffect()
    if self._effect1 then
		self._effect1:runAction(cc.RemoveSelf:create())
		self._effect1 = nil
	end
	if self._effect2 then
		self._effect2:runAction(cc.RemoveSelf:create())
		self._effect2 = nil
	end
end

function CommonHistoryWeaponIcon:showIconEffect(scale)
	self:removeLightEffect()
	if self._itemParams == nil then
		return
	end

	local baseId = self._itemParams.cfg.id

	local effects = require("app.utils.data.HistoryHeroDataHelper").getHistoryHeroEffectWithBaseId(baseId)
	if effects == nil then
		return
	end
	--dump(effects)
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


return CommonHistoryWeaponIcon