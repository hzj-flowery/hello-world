local SignalManager = class("SignalManager")
local PrioritySignal = require("yoka.event.PrioritySignal")
--
function SignalManager:ctor()
	self._signals = {}
end

--
function SignalManager:clear()
	self._signals = {}
end
--
function SignalManager:add(event, listener, priority)
	return self:registerListener(event, listener, false, priority or 0)
end

--
function SignalManager:addOnce(event, listener, priority)
	return self:registerListener(event, listener, true, priority or 0)
end

--
function SignalManager:registerListener(event, listener, once, priority)
	local signal = self._signals[event]
	if not signal then
		signal = PrioritySignal.new("string", "table")
		self._signals[event] = signal
	end

	return signal:registerListenerWithPriority(listener, once or false, priority or 0)
end

--
function SignalManager:dispatch(event, ...)
	local signal = self._signals[event]
	if signal then
		signal:dispatch(event, ...)
	end
end

return SignalManager