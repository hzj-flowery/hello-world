--管理场地，unit，等等抛出的signal
local FightSignalManager = class("SignalManager")
local fightSignalManager = nil

local PrioritySignal = require("yoka.event.PrioritySignal")

--
function FightSignalManager.create(engine)
    fightSignalManager = FightSignalManager.new(engine)
    return fightSignalManager
end

function FightSignalManager.clear()
	if fightSignalManager then 
		fightSignalManager:clear()
	end
    fightSignalManager = nil
end

function FightSignalManager.getFightSignalManager()
    assert(fightSignalManager, "SignalManager is nil")
    return fightSignalManager
end

function FightSignalManager:ctor(engine)
    self._engine = engine
	self._signal = PrioritySignal.new("string")
end

function FightSignalManager:clear()
    if self._signal then
        self._signal = nil
    end
end

function FightSignalManager:addListenerHandler(handler)
	return self._signal:add(handler)
end

function FightSignalManager:dispatchSignal(s, ...)
    -- print("1112233 dispatch signal ====== ", s)
	self._signal:dispatch(s, ...)
end

return FightSignalManager

