local EffectScreen = class("EffectScreen")
local FightConfig = require("app.fight.Config")
local PrioritySignal = require("yoka.event.PrioritySignal")

--
function EffectScreen:ctor(data)
	self._actor = nil
	self._remove = false
	self._towards = FightConfig.campLeft
	self._scale = 1
	self._position = {0, 0}
	self._positionFrame = {0, 0}
	self._positionLast = {0, 0}
end

--
function EffectScreen:createActor(path)
	self._actor = require("app.fight.views.EffectScreenActor").new(path)
	return self._actor
end

function EffectScreen:start()
	self:setAction("effect")
	self._actor:getAnimation():getSpine().signalComplet:add(function( ... )
		self:_onEffectFinish()
	end)
end

--
function EffectScreen:setAction(name, loop)
	self._actor:setAction(name, loop)
end

function EffectScreen:_onEffectFinish()
	self._remove = true
end

--
function EffectScreen:getTowards()
	return self._towards
end

--
function EffectScreen:setTowards(t)
	self._towards = t
	if self._actor then
		self._actor:setTowards(t)
	end
end

--
function EffectScreen:isRemove()
	return self._remove
end

--
function EffectScreen:remove()
	self._remove = true
end

--
function EffectScreen:getActor()
	return self._actor
end

--
function EffectScreen:update(f)
	self._positionLast[1] = self._position[1]
	self._positionLast[2] = self._position[2]
end

--
function EffectScreen:updateFrame(f)
	if self._positionFrame[1] ~= self._position[1] 
		or self._positionFrame[2] ~= self._position[2] then

		self._positionFrame[1] = self._positionLast[1] + (self._position[1] - self._positionLast[1]) * f
		self._positionFrame[2] = self._positionLast[2] + (self._position[2] - self._positionLast[2]) * f

		if self._actor then
			self._actor:setPosition((self._positionFrame[1]), (self._positionFrame[2]))
		end
	end
end

--
function EffectScreen:setFlashColor(r, g, b, a)

end

--
function EffectScreen:setFlashScale(...)
	
end

--
function EffectScreen:getFlashPosition()
	return self._position[1], self._position[2]
end

--
function EffectScreen:setFlashPosition(x, y)
	self._position[1] = x
	self._position[2] = y
end


return EffectScreen