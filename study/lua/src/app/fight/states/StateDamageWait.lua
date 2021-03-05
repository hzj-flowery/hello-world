local StateIdle = require("app.fight.states.StateIdle")
local StateDamageWait = class("StateDamageWait", StateIdle)

local FightConfig = require("app.fight.Config")

function StateDamageWait:ctor(entity, buffConfig)
    StateDamageWait.super.ctor(self, entity)

    local config = buffConfig
    self._buffSound = config.buff_sound
    self._spine = config.buff_front_effect
    self._time = config.buff_blow_time
    self._action = "effect"
    if config.buff_type == FightConfig.FLASH_BUFF_ID or config.buff_type == FightConfig.FLASH_BUFF_ID2 then 
        self._action = FightConfig.getFlashAction(self._entity.country)
    end
    
    self._startTime = 0
end

function StateDamageWait:start()
    StateDamageWait.super.start(self)
    self._entity:playSpineEffect(self._spine, self._action, self._buffSound)
end

function StateDamageWait:update(f)
    local time = self._startTime * 1000
    if time > self._time then 
        self:onFinish()
    end
    self._startTime = self._startTime + f
end

return StateDamageWait

