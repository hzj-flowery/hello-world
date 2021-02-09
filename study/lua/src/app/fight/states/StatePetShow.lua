--战斗前展示
local State = require("app.fight.states.State")
local StatePetShow = class("StatePetShow", State)

local Path = require("app.utils.Path")
local FightConfig = require("app.fight.Config")
-- local BuffManager = require("app.fight.BuffManager")

--
function StatePetShow:ctor(entity, skillPlay)
    StatePetShow.super.ctor(self, entity)
    self._showTime = 0
end

--播放声音
function StatePetShow:_playSkillVoice()
    -- if self._skillPlay and self._skillPlay.battle_voice ~= "0" then
    --     local mp3 = Path.getSkillVoice(self._skillPlay.battle_voice)
    --     G_AudioManager:playSound(mp3)
    -- end
end

--
function StatePetShow:start()
    StatePetShow.super.start(self)
    self._showTime = 0
    self._entity:showBillBoard(false)
end

function StatePetShow:update(f)
    -- if self._showTime > FightConfig.SHOW_TIME then
    --     self:onFinish()
    -- end
    -- self._showTime = self._showTime + f
end

return StatePetShow