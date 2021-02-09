--
-- Author: hedili
-- Date: 2018-01-25 14:48:55
-- 
local CommonIconBase = import(".CommonIconBase")
local CommonPetIcon = class("CommonPetIcon",CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local EXPORTED_METHODS = {
	"setType",
	"setId",
	"showPetIconInitialStars",
}


function CommonPetIcon:ctor()
	CommonPetIcon.super.ctor(self)
	self._petId = nil
	self._type = TypeConvertHelper.TYPE_PET
	self._effect1 = nil
	self._effect2 = nil

	self._startRoot = nil
end

function CommonPetIcon:_init()
	CommonPetIcon.super._init(self)

	self._starRoot = ccui.Helper:seekNodeByName(self._target, "starRoot")
	if self._starRoot and cc.isRegister("CommonHeroStar") then
		cc.bind(self._starRoot, "CommonHeroStar")
	end
end

function CommonPetIcon:bind(target)
	CommonPetIcon.super.bind(self, target)

	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonPetIcon:unbind(target)
	CommonPetIcon.super.unbind(self, target)
	
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonPetIcon:updateUI(value, size)
	local itemParams = CommonPetIcon.super.updateUI(self, value, size)
	if itemParams.size ~= nil then
		self:setCount(itemParams.size)
	end
	self:showIconEffect()
end

function CommonPetIcon:showPetIconInitialStars()
	local initial_star = self._itemParams.cfg.initial_star
	if initial_star > 0 then
		self._starRoot:setCountAdv(initial_star)
	end
end

function CommonPetIcon:setType(type)
	self._type = type
end

function CommonPetIcon:setId(avatarId)
	self._petId = avatarId
end


function CommonPetIcon:_onTouchCallBack(sender,state)
	-----------防止拖动的时候触发点击
	if(state == ccui.TouchEventType.ended)then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
		if moveOffsetX < 20 and moveOffsetY < 20 then
			if self._callback then
				self._callback(sender, self._itemParams)
			else
				local popup = require("app.scene.view.petDetail.PopupPetDetail").new(TypeConvertHelper.TYPE_PET, self._itemParams.cfg.id)
    			popup:openWithAction()
			end
		end
	end
end



function CommonPetIcon:removeLightEffect()
    if self._effect1 then
		self._effect1:runAction(cc.RemoveSelf:create())
		self._effect1 = nil
	end
	if self._effect2 then
		self._effect2:runAction(cc.RemoveSelf:create())
		self._effect2 = nil
	end
end

function CommonPetIcon:showIconEffect(scale)
	self:removeLightEffect()
	if self._itemParams == nil then
		return
	end

	local baseId = self._itemParams.cfg.id
	local effects = require("app.utils.data.PetDataHelper").getPetEffectWithBaseId(baseId)
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


return CommonPetIcon