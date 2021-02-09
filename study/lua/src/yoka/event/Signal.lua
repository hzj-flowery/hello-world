local OnceSignal = require("yoka.event.OnceSignal")
local Signal = class("Signal", OnceSignal)

--
function Signal:ctor(...)
	Signal.super.ctor(self, ...)
end

--
function Signal:add(listener)
	return self:registerListener(listener)
end

return Signal