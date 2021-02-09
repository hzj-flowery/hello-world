--站在场外的状态
local StateIdle = require("app.fight.states.StateIdle")
local StateOut = class("StateOut", StateIdle)
local BuffManager = require("app.fight.BuffManager")
local FightConfig = require("app.fight.Config")

function StateOut:ctor(entity, attackId)
    StateOut.super.ctor(self, entity)
    self._attackId = attackId
end

function StateOut:start()
    StateOut.super.start(self)
    BuffManager.getBuffManager():checkPoint(BuffManager.BUFF_HIT_BACK, self._attackId, self._entity.stageID)
end

return StateOut