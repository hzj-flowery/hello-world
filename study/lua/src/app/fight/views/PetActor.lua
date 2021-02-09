local PetActor = class("PetActor", function()
	return cc.Node:create()
end)

local FightConfig = require("app.fight.Config")

function PetActor:ctor(name, loadOverFunc)
	self:setCascadeOpacityEnabled(true)
	self:setCascadeColorEnabled(true)
	-- root
	self._root = cc.Node:create()
	self._root:setCascadeOpacityEnabled(true)
	self._root:setCascadeColorEnabled(true)
	self:addChild(self._root)
	-- back
	self._backLayer = cc.Node:create()
	self._backLayer:setCascadeOpacityEnabled(true)
	self._backLayer:setCascadeColorEnabled(true)
	self._root:addChild(self._backLayer)
	-- body
	self._bodyLayer = cc.Node:create()
	self._bodyLayer:setCascadeOpacityEnabled(true)
	self._bodyLayer:setCascadeColorEnabled(true)
	self._root:addChild(self._bodyLayer)

	-- action
	local spine = require("yoka.node.HeroSpineNode").new()
	spine:setScale(FightConfig.SCALE_ACTOR)
	-- spine:setScale(1.35)
	spine.signalLoad:add(function ( ... )
		loadOverFunc()
	end)
	self._animation = require("app.fight.views.Animation").new(spine)
	self._bodyLayer:addChild(self._animation, 2)
	self._animation:setAsset(Path.getSpine(name))

	self._name = name

	if G_SpineManager:isSpineExist(Path.getSpine(name.."_back_effect")) then
		local spineEffect = require("yoka.node.HeroSpineNode").new()
    	spineEffect:setScale(FightConfig.SCALE_ACTOR)
		self._animationEffectBack = require("app.fight.views.Animation").new(spineEffect)
		self._bodyLayer:addChild(self._animationEffectBack, 1)
		self._animationEffectBack:setAsset(Path.getSpine(name.."_back_effect"))
	end

	if G_SpineManager:isSpineExist(Path.getSpine(name.."_fore_effect")) then
		local spineEffect = require("yoka.node.HeroSpineNode").new()
    	spineEffect:setScale(FightConfig.SCALE_ACTOR)
		self._animationEffectFore = require("app.fight.views.Animation").new(spineEffect)
		self._bodyLayer:addChild(self._animationEffectFore, 3)
		self._animationEffectFore:setAsset(Path.getSpine(name.."_fore_effect"))
    end
    
	-- front
	self._frontLayer = cc.Node:create()
	self._frontLayer:setCascadeOpacityEnabled(true)
	self._frontLayer:setCascadeColorEnabled(true)
	self._root:addChild(self._frontLayer)
end

--
function PetActor:setAction(name, loop)
	self._animation:setAnimation(name, loop, true)
	
	if string.find(name, "skill") == 1 or string.find(name, "win") or string.find(name, "open") then
		if self._animationEffectFore and self._animationEffectFore:isAnimationExist(name) then
			self._animationEffectFore:setAnimation(name, loop, true)
		end
		if self._animationEffectBack and self._animationEffectBack:isAnimationExist(name) then
			self._animationEffectBack:setAnimation(name, loop, true)
		end
	else
		if self._animationEffectFore then
			self._animationEffectFore:resetSkeletonPose()
		end
		if self._animationEffectBack then
			self._animationEffectBack:resetSkeletonPose()
		end
	end
end

function PetActor:death()
	local action1 = cc.FadeOut:create(0.2)
    local action2 = cc.RemoveSelf:create()
    local action = cc.Sequence:create(action1, action2)
    self:runAction(action)
end

function PetActor:setTowards(towards)
	self._towards = towards == FightConfig.campLeft and 1 or -1
	self._root:setScaleX(self._towards)
end

--渐隐渐出
function PetActor:playFade(isIn)
	if isIn then
		local action = cc.FadeIn:create(0.5)
		self:runAction(action)
		if self._chatBubble then
			self._chatBubble:setVisible(false)
		end
	else
		local action = cc.FadeOut:create(0.5)
		self:runAction(action)
	end
end

return PetActor