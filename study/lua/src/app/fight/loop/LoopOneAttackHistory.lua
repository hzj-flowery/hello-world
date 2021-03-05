--历代名将攻击, 没有攻击者，只有攻击目标
local LoopAttackBase = require("app.fight.loop.LoopAttackBase")
local LoopOneAttackHistory = class("LoopOneAttackHistory", LoopAttackBase)
local Engine = require("app.fight.Engine")
local HeroSkillEffect = require("app.config.hero_skill_effect")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")
local FightConfig = require("app.fight.Config")
local HeroSkillActive = require("app.config.hero_skill_active")

function LoopOneAttackHistory:ctor(data, index)
    LoopOneAttackHistory.super.ctor(self, data, index)
    self._hisStartSkill = false
    self._skillShowId = 0
    self:_makeAttacker()
    self:_makeTargets()
    self:_addBuffs()
    self._atkType = FightConfig.HISTORY_ATTACK
    
end

function LoopOneAttackHistory:_makeAttacker()
    self._unit = {}
    self._unit.stageID = 0
    local skillInfo = HeroSkillActive.get(self._data.skillId, 0, 0)
    assert(skillInfo, "wrong skill id "..tostring(self._data.skillId))
    self._skillShowId = skillInfo.skill_show_id
end

function LoopOneAttackHistory:isExecute()
    if self._hisStartSkill then 
        return false
    end
    return LoopOneAttackHistory.super.isExecute(self)
end

--执行攻击
function LoopOneAttackHistory:execute()
    self._hisStartSkill = true
    LoopOneAttackHistory.super.execute(self)
end

--开始攻击
function LoopOneAttackHistory:_startSkill()
    FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_HISTORY_SHOW, self._data.hisCamp, self._data.hisId, self._skillShowId)
    for unit in Engine.getEngine():foreachUnit() do
		unit:setZOrderFix(FightConfig.ZORDER_SKILL_UNIT)
	end
	local sceneView = Engine.getEngine():getView()
    sceneView:showSkill2Layer(true)
    LoopOneAttackHistory.super._startSkill(self)
end

function LoopOneAttackHistory:_addBuffs()
    for _, buffData in pairs(self._data.addBuffs) do
		local data = self:_processBuff(buffData)
		self._buffManager:addHistoryBuff(data)
	end
end

function LoopOneAttackHistory:_onSignalEvent(event, ...)
	-- if event == FightSignalConst.SIGNAL_START_ATTACK then 
	-- 	self._start = true
	-- elseif event == FightSignalConst.SIGNAL_FIGHT_ADD_HURT then
	-- 	self:_doAddHurt(...)
	-- elseif event == FightSignalConst.SIGNAL_ADD_HURT_END then 
	-- 	self:_doAddHurtEnd(...)
    -- end
    if event == FightSignalConst.SIGNAL_HISTORY_SHOW_END then 
        self:_onFinish()
    elseif event == FightSignalConst.SIGNAL_HISTORY_BUFF then 
        self._buffManager:doHistoryBuffs()
    end
    LoopOneAttackHistory.super._onSignalEvent(self, event, ...)
end

function LoopOneAttackHistory:_onFinish()
    for unit in Engine.getEngine():foreachUnit() do
		unit:setZOrderFix(0)
	end
	local sceneView = Engine.getEngine():getView()
    sceneView:showSkill2Layer(false)
    LoopOneAttackHistory.super._onFinish(self)
end


return LoopOneAttackHistory