--播一个动作的state
local State = require("app.fight.states.State")
local StateAction = class("StateAction", State)

local actionTime = 0.3

function StateAction:ctor(entity, action)
    StateAction.super.ctor(self, entity)
    self._action = action
    self._entity:setAction(self._action)
    self._during = 0
end

function StateAction:update(f)
    if self:isStart() then
		if self._during >= actionTime then
            self:onFinish()
		end 
		self._during = self._during + f
	end
end


return StateAction