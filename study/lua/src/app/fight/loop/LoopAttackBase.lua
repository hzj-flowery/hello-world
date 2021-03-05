local LoopAttackBase = class("LoopAttackBase")
local Engine = require("app.fight.Engine")
local BuffManager = require("app.fight.BuffManager")
local HeroSkillEffect = require("app.config.hero_skill_effect")

local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")

local FightConfig = require("app.fight.Config")

function LoopAttackBase:ctor(data, index)
    -- print("1112233 loop attack new index", index)
    self._data = data --本次攻击信息
    assert(self._data, "attack data is nil")
    self._unit = nil --攻击的单位或者宠物
    self._unitPartner = nil --合击的武将，合击技能时候出现
    self._targets = nil --目标
    self._targetCount = 0 --目标数量
    self._addTargets = nil --附加目标
    self._selfTarget = nil --攻击者自己是目标时候的信息（通常是加血的时候）

    self._finish = false --是否结束

    self._hitFinish = false --所有受击完成
    self._attackFinish = false --所有攻击（包括buff类型4检测）完成
    self._hitFinishCount = 0 --攻击结束数量

    self._skillInfo = nil --skillInfo

    --一些公用的signal
    self._signals = {}
    self._signalAttacker = nil
    self._signalWait = nil --合击主将等待
    self._signalWait2 = nil --合击副将等待

    self._hasCheckChat = false --是否检查过对话
    self._start = false --是否开始攻击
    self._isExecute = false --是否已经执行

    local fightSignalManager = FightSignalManager.getFightSignalManager()
    self._listenerSignal = fightSignalManager:addListenerHandler(handler(self, self._onSignalEvent))

    self._buffManager = BuffManager.getBuffManager()

    self._index = index
    self._atkType = nil
    -- self:gethurtByStageId(202)

    self._saveData = false
end

function LoopAttackBase:_processBuffs()
    self:_processBuffEffect()
    self:_processDelBuffBefore()
    self:_processDelBuffMiddle()
    self:_processAnger()
    self:_processAddBuff()
    self:_processBattleEffect()
    self:_processDelBuff()
end

function LoopAttackBase:_checkRoundBuff()
    if self._index == 1 then
        self._buffManager:checkRoundBuff()
    end
end

function LoopAttackBase:_processHistoryStar()
    local historyStars = self._data.stars
    local hisBuffs = {}
    for _, data in pairs(historyStars) do
        local historyBuff = require("app.fight.history.HistoryBuff").new(data)
        table.insert(hisBuffs, historyBuff)
    end
    self._buffManager:formatHistoryBuff(hisBuffs)
end

function LoopAttackBase:_makeTargets()
    local targets = {}
    targets.list = {}
    targets.cell = {}
    targets.MainCellIdx = 0 --主要目标idx（相邻攻击时，主要收集idx）
    for i, v in ipairs(self._data.targets) do
        local target = Engine.getEngine():getUnitById(v.stageId)
        if target then
            if i == 1 then
                targets.MainCellIdx = target.cell
            end
            -- local signal = target.signalStateFinish:add(handler(self, self._onHitFinish))
            -- table.insert(self._signals, signal)
            if not v.isAlive then
                target.to_alive = v.isAlive
            end
            if #v.awards ~= 0 then
                target.dropAward = v.awards
            end
            local t = {}
            t.unit = target
            t.info = v
            targets.cell[target.cell] = t
            targets.list[#targets.list + 1] = t
            if v.stageId ~= self._unit.stageID then
                self._targetCount = self._targetCount + 1
                local signal = target.signalStateFinish:add(handler(self, self._onHitFinish))
                table.insert(self._signals, signal)
            else
                self._selfTarget = t
            end
        end
    end
    self._targets = targets --目标
    self._targetCount = #self._data.targets
    if self._selfTarget then
        self._targetCount = self._targetCount - 1 --把自己从target里面拿掉
    end
end

-- 做一个新的addtarget，用stageId
function LoopAttackBase:_makeAddTargets()
    local targets = {}
    for i, v in pairs(self._data.addTargets) do
        local target = Engine.getEngine():getUnitById(v.stageId)
        if target then
            local t = {}
            if not v.isAlive then
                target.to_alive = v.isAlive
            end
            t.stageId = v.stageId
            t.info = v
            table.insert(targets, t)
        end
    end
    self._addTargets = targets
end

--buff相关处理 begin------------------------------------------------------
--处理攻击前表现
function LoopAttackBase:_processBuffEffect()
    for _, buffData in pairs(self._data.buffEffects) do
        local data = self:_processBuff(buffData)
        self._buffManager:addBuffEffect(data, self._unit.stageID)
    end
end

--处理全场展示的buff
function LoopAttackBase:_processBattleEffect()
    for _, buffData in pairs(self._data.battleEffects) do
        local data = self:_processBuff(buffData)
        self._buffManager:addBattleEffect(data)
    end
end

--处理攻击前删除buff
function LoopAttackBase:_processDelBuffBefore()
    for _, buffData in pairs(self._data.delBuffsBefore) do
        local data = self:_processBuff(buffData)
        self._buffManager:addDelBuffBefore(data)
    end
end

--处理攻击中删除的buff
function LoopAttackBase:_processDelBuffMiddle()
    for _, buffData in pairs(self._data.delBuffsMiddle) do
        local data = self:_processBuff(buffData)
        self._buffManager:addDelBuffMiddle(data)
    end
end

--处理攻击后删除buff
function LoopAttackBase:_processDelBuff()
    for _, buffData in pairs(self._data.delBuffs) do
        local data = self:_processBuff(buffData)
        self._buffManager:addDelBuff(data)
    end
end

--处理怒气buff
function LoopAttackBase:_processAnger()
    for _, buffData in pairs(self._data.angers) do
        local data = self:_processBuff(buffData)
        self._buffManager:addAngerBuff(data)
    end
end

--处理添加buff
function LoopAttackBase:_processAddBuff()
    for _, buffData in pairs(self._data.addBuffs) do
        local data = self:_processBuff(buffData)
        self._buffManager:addAddBuff(data)
    end
end

--给buff加上攻击者，受击者列表，--如果是宠物上的buff，函数重写
function LoopAttackBase:_processBuff(data)
    local buffData = clone(data)
    buffData.buffConfig = HeroSkillEffect.get(data.configId)
    -- assert(buffData.buffConfig, "buff id is wrong "..buffData.configId)
    buffData.attacker = self._unit.stageID
    buffData.target = data.stageId --被上buff的对象
    -- assert(data.stageId ~= 0, "wrong buff data, buffid = "..data.configId)
    buffData.targets = {} --被攻击的目标
    buffData.atkTargets = {} --攻击者用buff目标
    buffData.checkCount = 0 --被攻击的检察数量
    buffData.atkCheckCount = 0 --攻击者的检查数量
    for _, hitter in pairs(self._targets.list) do
        if hitter.unit.to_alive then
            table.insert(buffData.targets, hitter.unit.stageID)
        end
        table.insert(buffData.atkTargets, hitter.unit.stageID)
    end
    buffData.totalCount = #buffData.targets
    buffData.atkTotalCount = #buffData.atkTargets

    buffData.attackIndex = self._index
    buffData.isAlive = data.isAlive
    if buffData.isAlive == false then
        buffData.dieIndex = self._index
    end

    return buffData
end
--buff相关处理 end------------------------------------------------------

--是否可以攻击
function LoopAttackBase:isExecute()
    -- if self._data.isHistory and not self._unit then
    -- 	return true
    -- end

    if self._unit:getState() == "StateOut" then
        self:_processDelBuffBefore()
        local buffManager = BuffManager.getBuffManager()
        buffManager:checkDelBefore(self._unit.stageID)
    end

    if not self._skillInfo and not self._data.isHistory and self._unit:getState() == "StateOut" then
        self:_onFinish()
        return false
    end

    if not self._data.isHistory and not self._unit:isStateStart("StateIdle") then
        return false
    end

    if self._unitPartner and not self._unitPartner:isStateStart("StateIdle") then
        return false
    end

    for i, v in ipairs(self._targets.list) do
        if not v.unit:isStateStart("StateIdle") then
            return false
        end
    end

    if not self._hasCheckChat then
        self:_checkChat()
        self._hasCheckChat = true
        return false
    end

    if not self._start then
        return false
    end

    if self._isExecute then
        return false
    end

    return true
end

--是否结束
function LoopAttackBase:isFinish()
    return self._finish
end

function LoopAttackBase:_checkChat()
    local fightSignalManager = FightSignalManager.getFightSignalManager()
    fightSignalManager:dispatchSignal(FightSignalConst.SIGNAL_ATTACK_CHECK_CHAT) --检查对话
end

--攻击
function LoopAttackBase:execute()
    self._buffManager:deleteUsedBuff()
    self:_processHistoryStar()
    self:_processBuffs()
    for i, v in pairs(self._targets.cell) do
        v.unit.attackIndex = self._index
    end
    -- 计算伤害
    for i, v in ipairs(self._targets.list) do
        local target = v.unit
        local info = v.info
        if info.type == 1 then
            target.hp = target.hp - info.value
            if target.hp < 0 then
                target.hp = 0
            end
        else
        end
    end
    self._finish = false
    self:_startSkill()
    self._isExecute = true
end

--开始攻击
function LoopAttackBase:_startSkill()
end

--结束本次攻击轮次
function LoopAttackBase:_onFinish()
    local buffManager = BuffManager.getBuffManager()
    buffManager:checkPoint(BuffManager.BUFF_ATTACK_FINISHED, self._unit.stageID)

    -- self:calchurt()
    self:_updateFinalHp()
    self._finish = true
    if self._unit.to_alive == false then
        self._unit.is_alive = self._unit.to_alive
    end
end

--清除监听
function LoopAttackBase:clear()
    for _, val in pairs(self._signals) do
        val:remove()
        val = nil
    end
    if self._signalAttacker then
        self._signalAttacker:remove()
        self._signalAttacker = nil
    end
    if self._signalWait then
        self._signalWait:remove()
        self._signalWait = nil
    end
    if self._signalWait2 then
        self._signalWait2:remove()
        self._signalWait = nil
    end
    if self._listenerSignal then
        self._listenerSignal:remove()
        self._listenerSignal = nil
    end
end

function LoopAttackBase:_onSignalEvent(event, ...)
    if event == FightSignalConst.SIGNAL_START_ATTACK then
        self._start = true
    elseif event == FightSignalConst.SIGNAL_FIGHT_ADD_HURT then
        self:_doAddHurt(...)
    elseif event == FightSignalConst.SIGNAL_ADD_HURT_END then
        self:_doAddHurtEnd(...)
    elseif event == FightSignalConst.SIGNAL_ROUND_BUFF_CHECK then
        self:_checkRoundBuff()
    end
end

function LoopAttackBase:_doAddHurt(percent, attackId)
    if not self._addTargets or #self._addTargets == 0 then
        return
    end

    if FightConfig.HP_TEST_ON then
        if not self._testHpData then
            self._testHpData = {
                type = "桃源扣血",
                showValue = 0,
                realValue = 0
            }
        end
    end

    for i = #self._addTargets, 1, -1 do
        local v = self._addTargets[i]
        local atkId = v.info.attackStageId
        if atkId == attackId then
            local unit = Engine.getEngine():getUnitById(v.stageId)
            local hurtInfo = {
                [1] = {
                    -- hurtId = FightConfig.HURT_TYPE_TAOYUAN,
                    hurtId = FightConfig.getAddHurtId(v.info.showType),
                    hurtValue = 0
                }
            }

            local damageInfo = v.info.damage
            local type = damageInfo.type
            local showValue = math.ceil(damageInfo.showValue * percent)
            local totalValue = damageInfo.value + damageInfo.protect
            local value = math.ceil(totalValue * percent)

            if unit then
                unit:doHurt(type, value, showValue, hurtInfo)
                if type == 1 then
                    showValue = -showValue
                end
                FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_HURT_VALUE, showValue)
                if FightConfig.HP_TEST_ON and unit.stageID == FightConfig.HP_TEST_ID then
                    unit.hp = unit.hp - value
                    self._testHpData.finalHp = unit.hp
                    self._testHpData.showValue = self._testHpData.showValue - showValue
                    self._testHpData.realValue = self._testHpData.realValue + value
                end
            end
        end
    end
end

function LoopAttackBase:_doAddHurtEnd(attackId)
    for i, v in pairs(self._addTargets) do
        local atkId = v.info.attackStageId
        if atkId == attackId then
            local unit = Engine.getEngine():getUnitById(v.stageId)
            if unit then
                unit:getAddHurtEnd()
            end
        end
    end
    if self._testHpData and not self._saveData then
        if self._testHpData.realValue ~= 0 then
            local FightHelper = require("app.scene.view.fight.FightHelper")
            FightHelper.pushDamageData(self._testHpData)
            self._saveData = true
        end
    end
end

--场景动画回掉
function LoopAttackBase:_onSceneFinish(event)
    self:_onFinish()
end

--受击结束事件处理
function LoopAttackBase:_onHitFinish(event, unitId)
    if not self._start then
        return
    end
    if event == "StateHit" or event == "StateDying" then
        self._hitFinishCount = self._hitFinishCount + 1
        if self._hitFinishCount == self._targetCount then
            self._hitFinish = true
            local hisBuffs = BuffManager.getBuffManager():checkSelfCampBackHistory(self._unit.camp)
            if hisBuffs then 
                for i, v in pairs(hisBuffs) do 
                    v:playBuff()
                end
            end
        end
    elseif event == "StateDamage" and not self._unit.to_alive and not self._skillInfo then --buff跳伤害死亡的情况\
        self:_onFinish()
        return
    elseif event == "StateAttackFinish" then
        self._attackFinish = true
        if self._targetCount == 0 then --自己打自己的情况
            self._hitFinish = true
        end
        if #self._data.newUnits ~= 0 then
            Engine.getEngine():initUnit(self._data.newUnits, true)
        end
    end
    if self._hitFinish and self._attackFinish then
        if not self._skillInfo then
            self:_onFinish()
        elseif self._skillInfo and self._skillInfo.skill_type ~= 3 then
            self:_onFinish()
        end
    end
end

function LoopAttackBase:getAttackType()
    return self._atkType
end

function LoopAttackBase:gethurtByStageId(stageId)
    self._targetHurt = 0
    self._calcId = stageId
    self._addDamage = 0
    self._addDamageB = 0
    local unit = Engine.getEngine():getUnitById(stageId)
    unit.totalDamage = 0
    unit.calcDamage = true
    for i, v in pairs(self._data.targets) do
        if v.stageId == stageId then
            local vhp = v.value
            if v.type == 1 then
                vhp = -vhp
                self._targetHurt = self._targetHurt + vhp
                self._addDamageB = vhp
            end
            for ii, vv in pairs(v.hurts) do
                if vv.hurtId == 5 then
                    vhp = vv.hurtValue
                    self._targetHurt = self._targetHurt + vhp
                end
            end
        end
    end
    for i, v in pairs(self._data.addTargets) do
        if v.stageId == stageId then
            -- type = 0, 								--事件类型
            -- value = 0, 								--数值
            local vhp = v.value
            if v.type == 1 then
                vhp = -vhp
                self._targetHurt = self._targetHurt + vhp
                self._addDamage = vhp
            end
        end
    end
end

--比较伤害
function LoopAttackBase:calchurt()
    local unit = Engine.getEngine():getUnitById(self._calcId)
    if not unit then
        return
    end
    local unitHp = math.floor(math.abs(unit.totalDamage) / 10000)
    local attackHp = math.floor(math.abs(self._targetHurt) / 10000)
    -- if math.abs(unitHp - attackHp) > 1 then
    -- 	Engine.getEngine():pause()
    -- end
    -- assert(math.abs(unitHp - attackHp) < 1, "wrong hp calc attack index = "..self._index.." unit hp = "..unitHp.." attack hp = "..attackHp.." hahahaa "..self._addDamage.." "..self._addDamageB)
    unit.calcDamage = false
    unit.totalDamage = 0
    self._addDamage = 0
    self._addDamageB = 0
end

function LoopAttackBase:_updateFinalHp()
    -- 	local finalHp = self._data.finalHp
    -- 	for i, v in pairs(finalHp) do
    -- 		if v.hp ~= 0 then
    -- 			local unit = Engine.getEngine():getUnitById(v.id)
    -- 			unit:updateFinalHp(v.hp)
    -- 		end
    -- 	end
end

return LoopAttackBase
