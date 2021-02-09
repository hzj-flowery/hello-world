--战斗前展示
local State = require("app.fight.states.State")
local StateShow = class("StateShow", State)

local Path = require("app.utils.Path")
local FightConfig = require("app.fight.Config")
local BuffManager = require("app.fight.BuffManager")

--
function StateShow:ctor(entity, skillPlay, skillType, prePosition)
	StateShow.super.ctor(self, entity)
    self._showTime = 0
    self._skillPlay = skillPlay
    self._skillType = skillType
    self._prePosition = prePosition
    self._bShowName = false
end

--播放声音
function StateShow:_playSkillVoice()
    if self._skillPlay and self._skillPlay.battle_voice ~= "0" then
        local mp3 = Path.getSkillVoice(self._skillPlay.battle_voice)
        G_AudioManager:playSound(mp3)
    end
end

--
function StateShow:start()
	StateShow.super.start(self)
    -- if self._entity.partner
    if self._skillType == 2 then
        if self._skillPlay.txt == 0 then
            self:onFinish()
            return
        end
        self:_playSkillVoice()
        if self._skillPlay and self._skillPlay.txt ~= 0 then
            self._entity:showSkill(self._skillPlay.txt)
        end
    elseif self._skillType == 3 then
        local partner = self._entity:getPartner()
        if partner then
            partner:startCombineVice(self._skillPlay, self._prePosition)
            -- self._entity:playDuang(handler(self, self._playSkillVoice))
            self:_playSkillVoice()
        end
        self._entity:playDuang()
        
    end
end

function StateShow:update(f)
    if self._showTime > FightConfig.SHOW_TIME then
        self:onFinish()
    end
    self._showTime = self._showTime + f
end

return StateShow