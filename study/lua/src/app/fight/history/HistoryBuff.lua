--历代名将的buff
local HistoryBuff = class("HistoryBuff")
local HistoricalHeroStep = require("app.config.historical_hero_step")

local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")

local Engine = require("app.fight.Engine")
local HeroSkillActive = require("app.config.hero_skill_active")
local HeroSkillEffect = require("app.config.hero_skill_effect")

function HistoryBuff:ctor(data)
    self._heroData = HistoricalHeroStep.get(data.id, data.rank)
    self._heroId = data.id
    assert(self._heroData, "history hero id or step is wrong id = " .. data.id .. " step = " .. data.rank)
    self._stageId = data.stageId --持有者的场上id
    self._camp = math.floor(self._stageId / 100)
    self:_createBuff()
end

function HistoryBuff:_createBuff()
    self._buffData = {}
end

function HistoryBuff:getCamp()
    return self._camp
end

function HistoryBuff:getBuffTime()
    return self._heroData.skill_front
end

function HistoryBuff:getStageId()
    return self._stageId
end

function HistoryBuff:playBuff(callback)
    local skillInfo = HeroSkillActive.get(self._heroData.skill_id, 0, 0)
    assert(skillInfo, "wrong skill id " .. tostring(self._heroData.skill_id))
    local skillId = skillInfo.skill_show_id

    -- FightSignalManager.getFightSignalManager():dispatchSignal(
    --     FightSignalConst.SIGNAL_HISTORY_SHOW,
    --     self._camp,
    --     self._heroId,
    --     skillId,
    --     self._stageId
    -- )
    local unit = Engine.getEngine():getUnitById(self._stageId)
    if unit then
        unit:playHistoryShow(self._heroId, skillId)
    end
    local fightSignalManager = FightSignalManager.getFightSignalManager()
    self._listenerSignal = fightSignalManager:addListenerHandler(handler(self, self._onSignalEvent))
    self._callback = callback
end

function HistoryBuff:_onSignalEvent(event, stageId)
    if event == FightSignalConst.SIGNAL_HISTORY_BUFF and self._stageId == stageId then
        local unit = Engine.getEngine():getUnitById(self._stageId)
        if unit then
            unit:buffPlay(self._heroData.skill_effectid)
            local buffConfig = HeroSkillEffect.get(self._heroData.skill_effectid)
            assert(buffConfig, "wrong buff id = " .. self._heroData.skill_effectid)
            unit:playOnceBuff(nil, buffConfig)
        end
    elseif event == FightSignalConst.SIGNAL_HISTORY_SHOW_END and self._stageId == stageId then
        if self._callback then
            self._callback()
        end
    end
end

function HistoryBuff:clear()
    self._listenerSignal:remove()
    self._listenerSignal = nil
end

return HistoryBuff
