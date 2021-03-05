local Loop = class("Loop")

local Engine = require("app.fight.Engine")
--
function Loop:ctor()
	self._finish = false
	self._start = false
end

--
function Loop:start()
	self._finish = false
	self._start = true
end

--
function Loop:stop()
	self._start = false
end

--
function Loop:isStart()
	return self._start
end

--
function Loop:isFinish()
	return self._finish
end

--
function Loop:update(f)
	
end

--
function Loop:onFinish()
	self._finish = true
end

--
function Loop:checkUnitIdle()
	for unit in Engine.getEngine():foreachUnit() do
		if unit:getState() ~= "StateIdle" then
			return false
		end
	end
	
	return true
end

return Loop