local HitTipParticle = class("HitTipParticle")
local Path = require("app.utils.Path")
local CustomNumLabel = require("app.ui.number.CustomNumLabel")

HitTipParticle.TYPE_DAMAGE = 1
HitTipParticle.TYPE_HEAL = 2

--
function HitTipParticle:ctor(type)
	self._isFinish = false
	self._type = type
	self._view = cc.Node:create()
	self._view:setCascadeOpacityEnabled(true)
	self._view:setCascadeColorEnabled(true)
	self._node = cc.Node:create()
	self._node:setCascadeOpacityEnabled(true)
	self._node:setCascadeColorEnabled(true)
	self._view:addChild(self._node)
	self._tween = 0
	self._height = 0
end

function HitTipParticle:getViewNode()
	return self._view
end

--
function HitTipParticle:isFinish()
	return self._isFinish
end

--
function HitTipParticle:popup()
end

--
function HitTipParticle:onFinish()
	self._view:setVisible(false)
	self._isFinish = true
end

function HitTipParticle:createValueLabel(type, isCrit, value)	
	local label = nil
	if type == HitTipParticle.TYPE_DAMAGE then
		if isCrit then
			label = CustomNumLabel.create("num_battle_crit", Path.getBattleDir(), value, nil, nil, true)
		else 
			label = CustomNumLabel.create("num_battle_hit",  Path.getBattleDir(),value, nil, nil, true)
		end
	elseif type == HitTipParticle.TYPE_HEAL then
		if isCrit then
			label = CustomNumLabel.create("num_battle_heal",  Path.getBattleDir(),value, nil, nil, true)
		else 
			label = CustomNumLabel.create("num_battle_heal",  Path.getBattleDir(),value, nil, nil, true)
		end
	end
	return label
end

function HitTipParticle:setPosition(pos)
	self._view:setPosition(pos)
end

--普通伤害
function HitTipParticle:_runDamageAction()
	G_EffectGfxMgr:applySingleGfx(self._node, "smoving_putong_tiaozi", handler(self, self.onFinish), nil, nil)
end

--暴击伤害
function HitTipParticle:_runCritAction()
	G_EffectGfxMgr:applySingleGfx(self._node, "smoving_baoji_tiaozi", handler(self, self.onFinish), nil, nil)
end

--降低
function HitTipParticle:_runDownAction()
	self._node:setOpacity(51)
	self._node:setScale(1.8)
	local action1 = cc.Spawn:create(cc.FadeIn:create(0.1), cc.ScaleTo:create(0.1, 0.9))
	local action2 = cc.ScaleTo:create(0.1, 1)
	local action3 = cc.DelayTime:create(1)
	local action4 = cc.Spawn:create(cc.MoveBy:create(0.3, cc.p(0, -14)), cc.FadeOut:create(0.3))
	local callFunc = cc.CallFunc:create(handler(self, self.onFinish))
	local action = cc.Sequence:create(action1, action2, action3, action4, callFunc)
	self._node:runAction(action)
end

--升高
function HitTipParticle:_runUpAction()
	self._node:setOpacity(51)
	self._node:setScale(1.8)
	local action1 = cc.Spawn:create(cc.FadeIn:create(0.1), cc.ScaleTo:create(0.1, 0.9))
	local action2 = cc.ScaleTo:create(0.1, 1)
	local action3 = cc.DelayTime:create(1)
	local action4 = cc.Spawn:create(cc.MoveBy:create(0.3, cc.p(0, 14)), cc.FadeOut:create(0.3))
	local callFunc = cc.CallFunc:create(handler(self, self.onFinish))
	local action = cc.Sequence:create(action1, action2, action3, action4, callFunc)
	self._node:runAction(action)
end

--中间停止
function HitTipParticle:_runMiddleAction()
	self._node:setOpacity(51)
	self._node:setScale(0.8)
	local action1 = cc.Spawn:create(cc.FadeIn:create(0.1), cc.ScaleTo:create(0.1, 1.8))
	local action2 = cc.ScaleTo:create(0.1, 1)
	local action3 = cc.DelayTime:create(1)
	local action4 = cc.FadeOut:create(0.3)
	local callFunc = cc.CallFunc:create(handler(self, self.onFinish))
	local action = cc.Sequence:create(action1, action2, action3, action4, callFunc)
	self._node:runAction(action)
end

function HitTipParticle:getActionType()
    return self._tween
end

function HitTipParticle:getHeight()
	return self._height
end

function HitTipParticle:getType()
	return self._type
end


return HitTipParticle