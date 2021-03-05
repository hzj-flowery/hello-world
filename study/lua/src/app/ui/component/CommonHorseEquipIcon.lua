--
-- Author: JerryHe
-- Date: 2019-01-28
-- 
local CommonIconBase = import(".CommonIconBase")
local CommonHorseEquipIcon = class("CommonHorseEquipIcon",CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")

local EXPORTED_METHODS = {
	
}


function CommonHorseEquipIcon:ctor()
	CommonHorseEquipIcon.super.ctor(self)
	self._type = TypeConvertHelper.TYPE_HORSE_EQUIP
	self._effect1 = nil
	self._effect2 = nil
end

function CommonHorseEquipIcon:_init()
	CommonHorseEquipIcon.super._init(self)
end

function CommonHorseEquipIcon:bind(target)
	CommonHorseEquipIcon.super.bind(self, target)
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonHorseEquipIcon:unbind(target)
	CommonHorseEquipIcon.super.unbind(self, target)
	
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonHorseEquipIcon:updateUI(value, size)
    local itemParams = CommonHorseEquipIcon.super.updateUI(self, value, size)
	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end
	self:showIconEffect()
	return itemParams
end

function CommonHorseEquipIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				--打开战马装备二级详情
				local popup = require("app.scene.view.horseEquipDetail.PopupHorseEquipDetail").new(
					TypeConvertHelper.TYPE_HORSE_EQUIP, self._itemParams.cfg.id)
				popup:openWithAction()
			end
		end
	end
end

function CommonHorseEquipIcon:removeLightEffect()
    if self._effect1 then
		self._effect1:runAction(cc.RemoveSelf:create())
		self._effect1 = nil
	end
	if self._effect2 then
		self._effect2:runAction(cc.RemoveSelf:create())
		self._effect2 = nil
	end
end

function CommonHorseEquipIcon:showIconEffect(scale)
	self:removeLightEffect()
	-- if self._itemParams == nil then
	-- 	return
	-- end

	-- local baseId = self._itemParams.cfg.id
	-- local effects = HorseDataHelper.getEffectWithBaseId(baseId)
	-- if effects == nil then
	-- 	return
	-- end

	-- if self._nodeEffectUp == nil then
	-- 	self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")
	-- end
	-- if self._nodeEffectDown == nil then
	-- 	self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
	-- end

	-- if #effects == 1 then
	-- 	local effectName = effects[1]
	-- 	self._effect1 = EffectGfxNode.new(effectName)
	-- 	self._nodeEffectUp:addChild(self._effect1)
    --     self._effect1:play()
	-- end

	-- if #effects == 2 then
	-- 	local effectName1 = effects[1]
	-- 	self._effect1 = EffectGfxNode.new(effectName1)
	-- 	self._nodeEffectDown:addChild(self._effect1)
	-- 	self._effect1:play()
    -- 	local effectName2 = effects[2]
	-- 	self._effect2 = EffectGfxNode.new(effectName2)
	-- 	self._nodeEffectUp:addChild(self._effect2)
	-- 	self._effect2:play()
	-- end
end

return CommonHorseEquipIcon