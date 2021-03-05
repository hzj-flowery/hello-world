local Hero = require("app.config.hero")
local HeroSkillActive = require("app.config.hero_skill_active")
local StateWait = require("app.fight.states.StateWait")
local Engine = require("app.fight.Engine")

local LoopAttackBase = require("app.fight.loop.LoopAttackBase")
local LoopOneAttack = class("LoopOneAttack", LoopAttackBase)

local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")
local FightConfig = require("app.fight.Config")
local BuffManager = require("app.fight.BuffManager")

function LoopOneAttack:ctor(data, index)
    LoopOneAttack.super.ctor(self, data, index)
    self:_makeAttacker()
    self:_makeAddTargets()
    self:_makeTargets()

    self._atkType = FightConfig.NORMAL_ATTACK
end

--制作攻击者
function LoopOneAttack:_makeAttacker()
    self._unit = Engine.getEngine():getUnitById(self._data.stageId) --攻击单位
    self._unit.to_alive = self._data.isAlive
    self._signalAttacker = self._unit.signalStateFinish:add(handler(self, self._onHitFinish))

    --攻击者回掉
    if self._data.skillId == 0 or not self._data.skillId then --技能id是0的时候，认为没有放技能，跳过回合
        self._hitFinish = true
    else
        self._skillInfo = HeroSkillActive.get(self._data.skillId, 0, 0)
        assert(self._skillInfo, "wrong skill id " .. tostring(self._data.skillId))
    end

    BuffManager.getBuffManager():doPerCheck(self._unit.stageID, self._data.delBuffsBefore)
    if self._skillInfo then
        --处理合击技能
        if self._skillInfo.skill_type == 3 then
            local hero = Hero.get(self._unit.configId)
            local partnerId = hero.skill_3_partner
            for unit in Engine.getEngine():foreachUnit() do
                if unit.camp == self._data.camp and unit.configId == partnerId and unit.to_alive and unit:getState() ~= "StateOut" then
                    self._unitPartner = unit
                    break
                end
            end
            assert(self._unitPartner, "partner id wrong" .. tostring(partnerId) .. " skill id = " .. self._data.skillId)
            self._signalWait = self._unit.signalStateWait:add(handler(self, self._onWaitCombine))
            self._signalWait2 = self._unitPartner.signalStateWait:add(handler(self, self._onWaitCombine))
            self._combineReady = 0
            self._combineFlash = 0
            -- Engine.getEngine():dispatchCombineSkill(true)
            self._unit.startMove = false
            self._unitPartner.startMove = false
        end
    end

    --场景动画结束回掉
    local sceneSignal = Engine.getEngine():getSceneSignal():add(handler(self, self._onSceneFinish))
    table.insert(self._signals, sceneSignal)


end

--执行攻击
function LoopOneAttack:execute()
    --处理合击
    if self._skillInfo then
        if self._skillInfo.skill_type == 3 then
            for unit in Engine.getEngine():foreachUnit() do
                unit.inCombineWatcher = true
            end
            self._unitPartner.inCombineWatcher = false
            self._unit.inCombineWatcher = false
            for _, v in pairs(self._targets.list) do
                v.unit.inCombineWatcher = false
            end

            self._unit:showBillBoard(false)
            self._unitPartner:showBillBoard(false)
            local view = Engine.getEngine():getView()
            view:showSkill3Layer(true)
            for unit in Engine.getEngine():foreachUnit() do
                unit:showShadow(false)
                if unit.inCombineWatcher then
                    unit:fade(false)
                end
            end
        end
    end
    LoopOneAttack.super.execute(self)
   
end

--开始攻击
function LoopOneAttack:_startSkill()
    self._unit:skill(self._skillInfo, self._targets, self._unitPartner)
    LoopOneAttack.super._startSkill(self)
end

--接受合击等待信号
function LoopOneAttack:_onWaitCombine(event)
    if event == StateWait.WAIT_COMBINE_SKILL then
        self._combineReady = self._combineReady + 1
        if self._combineReady == 2 then
            self._unit:startCombineSkill()
            self._combineReady = 0
        end
    elseif event == StateWait.WAIT_COMBINE_FLASH then
        self._combineFlash = self._combineFlash + 1
        if self._combineFlash == 2 then
            local HeroSkillPlay = require("app.config.hero_skill_play")
            local skillPlay = HeroSkillPlay.get(self._skillInfo.skill_show_id)
            assert(skillPlay, "wrong skill id " .. tostring(self._skillInfo.skill_show_id))
            if skillPlay.heji_show ~= "0" then
                -- Engine.getEngine():dispatchCombineFlash(handler(self, self._startCombine), skillPlay.heji_show)
                FightSignalManager.getFightSignalManager():dispatchSignal(
                    FightSignalConst.SIGNAL_PLAY_COMBINE_FLASH,
                    skillPlay.heji_show
                )
            else
                self:_startCombine()
            end
        end
    end
end

function LoopOneAttack:_onSignalEvent(event, ...)
    if event == FightSignalConst.SIGNAL_PLAY_COMBINE_FLASH then
        self:_startCombine()
    end
    LoopOneAttack.super._onSignalEvent(self, event, ...)
end

--开始合击
function LoopOneAttack:_startCombine()
    self._unit.startMove = true
    self._unitPartner.startMove = true
    --处理合击
    for unit in Engine.getEngine():foreachUnit() do
        unit.inCombineWatcher = true
    end
    self._unitPartner.inCombineWatcher = false
    self._unit.inCombineWatcher = false
    for _, v in pairs(self._targets.list) do
        v.unit.inCombineWatcher = false
    end

    self._unit:showBillBoard(false)
    self._unitPartner:showBillBoard(false)
    local view = Engine.getEngine():getView()
    view:showSkill3Layer(true)
    for unit in Engine.getEngine():foreachUnit() do
        if unit.inCombineWatcher then
            unit:fade(false)
        end
    end

    -- for pet in Engine.getEngine():foreachPet() do
    -- 	pet:fade(false)
    -- end
end

--结束本次攻击轮次
function LoopOneAttack:_onFinish()
    if self._skillInfo and self._skillInfo.skill_type == 3 then
        for unit in Engine.getEngine():foreachUnit() do
            unit:fade(true)
        end
    -- for pet in Engine.getEngine():foreachPet() do
    -- 	pet:fade(true)
    -- end
    -- Engine.getEngine():dispatchCombineSkill(false)
    end
    for unit in Engine.getEngine():foreachUnit() do
        unit.inCombineWatcher = nil
        unit:setZOrderFix(0)
    end
    local sceneView = Engine.getEngine():getView()
    sceneView:showSkill2Layer(false)
    LoopOneAttack.super._onFinish(self)
end

--获得攻击unit的id
function LoopOneAttack:getUnitConfigId()
    if self._unit:isPlayer() then
        return 1
    end
    return self._unit.configId
end

return LoopOneAttack
