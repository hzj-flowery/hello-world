local StateFlash = require("app.fight.states.StateFlash")
local StateDying = class("StateDying", StateFlash)
local Path = require("app.utils.Path")

local BuffManager = require("app.fight.BuffManager")

function StateDying:ctor(entity, actionID)
    -- local action = Path.getTargetAction(actionID)
	StateDying.super.ctor(self, entity, actionID)
end

function StateDying:onFinish()
	StateDying.super.onFinish(self)
	BuffManager.getBuffManager():checkPoint(BuffManager.BUFF_DIE, self._entity.stageID)
end

return StateDying