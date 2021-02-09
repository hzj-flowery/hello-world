--第一场战斗中吕布的openshow
local State = require("app.fight.states.State")
local StateOpenShow = class("StateOpenShow", State)

--
function StateOpenShow:ctor(entity, position, waitTime)
    StateOpenShow.super.ctor(self, entity)
    self._playTime = 0
    self._waitingTime = 0
    self._waitTime = waitTime
    self._isWaiting = true
    self._position = position
    self._bShowName = false
end

--
function StateOpenShow:start()
    StateOpenShow.super.start(self)
    local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_LVBU_IN)
    self._playTime = 0
    self._waitingTime = 0
    self._isWaiting = true
end

--
function StateOpenShow:update(f)
    if self._isWaiting then
        if self._waitingTime >= self._waitTime then
            self._entity:setPosition(self._position.x, self._position.y)
            self._entity:setAction("openshow", false)
            self._isWaiting = false
        end
        self._waitingTime = self._waitingTime + f
        return 
    end
    if self._playTime >= 2.37 then
        self:onFinish()
    end
    self._playTime = self._playTime + f
end

--
function StateOpenShow:onFinish()
    -- self._entity.signalStartCG:dispatch("enterStage")
    StateOpenShow.super.onFinish(self)
end

return StateOpenShow