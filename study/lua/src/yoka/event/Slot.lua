local Slot = class("Slot")

--
function Slot:ctor(listener, signal, once, priority)
	self._signal = signal
	self._listener = listener
	self._once = once or false
	self._priority = priority or 0
	self._enabled = true
	self._params = {}
end

--
function Slot:execute(value)

	if not self._enabled then return end
	if self._once then self:remove() end
	if self._params and #self._params > 0 then
		self._listener(unpack(self._params))
	else
		--dump(value)
		self._listener(unpack(value))
	end
end

--
function Slot:getListener()
	return self._listener
end

--
function Slot:setListener(listener)
	self._listener = listener
end

--
function Slot:getOnce()
	return self._once
end

--
function Slot:getPriority()
	return self._priority
end

--
function Slot:setEnabled(enabled)
	self._enabled = enabled
end
function Slot:getEnabled()
	return self._enabled
end

--
function Slot:setParams(...)
	self._params = {...}
end

--
function Slot:getParams()
	return self._params
end

--
function Slot:remove()
	self._signal:remove(self._listener)
end


return Slot