local Entity = require("app.fight.Entity")
local Effect = class("Effect", Entity)

--
function Effect:ctor()
	Effect.super.ctor(self)
	--self._zOrderFix = 4000
end

function Effect:createActor(path)
    self._actor = require("app.fight.views.EffectActor").new(path)
	return self._actor
end


function Effect:start()
	self:setAction("effect")
	self._actor:getAnimation():getSpine().signalComplet:add(function( ... )
		self:_onEffectFinish()
	end)
end

--
function Effect:update(f)
	Effect.super.update(self, f)
end

--
function Effect:setAction(name, loop)
	self._actor:setAction(name, loop)
end

function Effect:_onEffectFinish()
	self._remove = true
end

return Effect