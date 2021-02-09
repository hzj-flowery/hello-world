--战斗前展示
local State = require("app.fight.states.State")
local StatePetEnter = class("StatePetEnter", State)

-- local FightConfig = require("app.fight.Config"
--
function StatePetEnter:ctor(entity, stopTime)
    StatePetEnter.super.ctor(self, entity)
    self._showTime = 0
    self._stopTime = stopTime / 100
end

--播放声音
function StatePetEnter:_playSkillVoice()
    -- if self._skillPlay and self._skillPlay.battle_voice ~= "0" then
    --     local mp3 = Path.getSkillVoice(self._skillPlay.battle_voice)
    --     G_AudioManager:playSound(mp3)
    -- end
end

--
function StatePetEnter:start()
    StatePetEnter.super.start(self)
	self._entity:setAction("show")
    self._showTime = 0
    self._entity:showBillBoard(false)
end

function StatePetEnter:update(f)
    if self._showTime > self._stopTime then
        self:onFinish()
    end
    self._showTime = self._showTime + f
end

return StatePetEnter