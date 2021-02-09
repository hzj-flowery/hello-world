local EffectActor = class("EffectActor", function()
	return cc.Node:create()
end)

local FightConfig = require("app.fight.Config")
local Path = require("app.utils.Path")
--
function EffectActor:ctor(name)
	self:setCascadeOpacityEnabled(true)
	self:setCascadeColorEnabled(true)
	-- root
	self._root = cc.Node:create()
	self._root:setCascadeOpacityEnabled(true)
	self._root:setCascadeColorEnabled(true)
	self:addChild(self._root)

	-- action
	local spine = require("yoka.node.HeroSpineNode").new()
	spine:setScale(FightConfig.SCALE_ACTOR)
	self._animation = require("app.fight.views.Animation").new(spine)
	self._root:addChild(self._animation)
	self._animation:setAsset(Path.getFightEffectSpine(name))
	self._spine = spine
end

function EffectActor:test()
	local action1 = cc.FadeIn:create(0.5)	
    self:runAction(action1)
end

--
function EffectActor:setAction(name, loop)
	self._animation:setAnimation(name, loop, true)
end

--
function EffectActor:setTowards(towards)
	self._root:setScaleX(towards == FightConfig.campLeft and 1 or -1)
end

--
function EffectActor:death()
	local action1 = cc.FadeOut:create(0.3)
    local action2 = cc.RemoveSelf:create()
    local action = cc.Sequence:create(action1, action2)
    self:runAction(action)
end

function EffectActor:getAnimation()
	return self._animation
end

function EffectActor:setOnceAction(name)
	self._animation:setAnimation(name, false, true)
	self._spine.signalComplet:addOnce(function() self:death() end)
end

return EffectActor