local State = require("app.fight.states.State")
local StateWin = class("StateWin", State)

--
function StateWin:ctor(entity)
	StateWin.super.ctor(self, entity)
end

--
function StateWin:start()
	StateWin.super.start(self)
	self._entity:playWinAction()
	self._entity:setTowards(self._entity.camp)
end

return StateWin