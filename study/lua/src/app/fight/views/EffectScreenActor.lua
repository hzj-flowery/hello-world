local EffectActor = require("app.fight.views.EffectActor")
local EffectScreenActor = class("EffectScreenActor", EffectActor)

local FightConfig = require("app.fight.Config")
local Path = require("app.utils.Path")
--
function EffectScreenActor:ctor(name)
	self:setCascadeOpacityEnabled(true)
	self:setCascadeColorEnabled(true)
	-- root
	self._root = cc.Node:create()
	self._root:setCascadeOpacityEnabled(true)
	self._root:setCascadeColorEnabled(true)
	self:addChild(self._root)

	-- action
	local spine = require("yoka.node.SpineNode").new(0.5)
	self._animation = require("app.fight.views.Animation").new(spine)
	self._root:addChild(self._animation)
	self._animation:setAsset(Path.getFightEffectSpine(name))
end


return EffectScreenActor