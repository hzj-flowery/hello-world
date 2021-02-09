local Signal = require("yoka.event.Signal")
local PrioritySignal = class("PrioritySignal", Signal)
local Slot = require("yoka.event.Slot")
--
function PrioritySignal:ctor(...)
	PrioritySignal.super.ctor(self, ...)
end

--
function PrioritySignal:addWithPriority(listener, priority)
	return self:registerListenerWithPriority(listener, false, priority or 0)
end

--
function PrioritySignal:addOnceWithPriority(listener, priority)
	return self:registerListenerWithPriority(listener, true, priority or 0)
end

--
function PrioritySignal:registerListener(listener, once)
	return self:registerListenerWithPriority(listener, once or false)
end

--
function PrioritySignal:registerListenerWithPriority(listener, once, priority)
	local slot = Slot.new(listener, self, once or false, priority or 0)
	self._slots = self._slots:insertWithPriority(slot)
	return slot
end

return PrioritySignal