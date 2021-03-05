local BuffManager = class("BuffManager")
local buffManager = nil

local HeroSkillEffect = require("app.config.hero_skill_effect")
local HeroSkillActive = require("app.config.hero_skill_active")
local FightConfig = require("app.fight.Config")

BuffManager.BUFF_PRE_ATTACK = 0 --作用时间是攻击前,喊话前
BuffManager.BUFF_ATTACK = 1 --作用时间攻击第一下时候
BuffManager.BUFF_ATTACK_BACK = 2 --作用时间是攻击者回位
BuffManager.BUFF_HIT_BACK = 3 --作用时间是受击回位
BuffManager.BUFF_ATTACK_FINISHED = 4 --作用时间是攻击完成后
BuffManager.BUFF_AFTER_SHOW = 5 --喊话之后
BuffManager.BUFF_FIGHT_OPENING = 6 --开始战斗时候的buff
BuffManager.BUFF_PET_SHOW_END = 7 --开场怪物回到位置
-- BuffManager.BUFF_TALENT_EVENT = 8       --跳字事件中
BuffManager.BUFF_DIE = 8 --死亡

BuffManager.HIS_BEFORE_FIGHT = 1 --整场开始前
BuffManager.HIS_BEFORE_ATK = 2 --攻击开始前
BuffManager.HIS_AFTER_ATK = 3 --攻击回位后
BuffManager.HIS_AFTER_HIT = 4 --受击回位后

--
function BuffManager.create(engine)
    buffManager = BuffManager.new(engine)
    return buffManager
end
function BuffManager.clear()
    buffManager = nil
end
function BuffManager.getBuffManager()
    assert(buffManager, "buffManager is nil")
    return buffManager
end

--
function BuffManager:ctor(engine)
    self._buffEffect = {} --攻击者攻击前buff效果
    self._addBuff = {} --一轮战斗增加buff
    self._angerBuff = {} --怒气buff
    self._delBuffBefore = {} --攻击前删除buff
    self._delBuffMiddle = {} --攻击中删除的buff
    self._delBuff = {} --攻击后删除buff
    self._battleEffect = {} --战斗展示buff
    self._petsBuff = {} --神兽buff

    self._buffList = {} --总的bufflist
    self._engine = engine --engine

    self._effectLaterShow = {} --需要回掉的，一串battleeffect的表index
    self._addBuffLastShow = {} --需要回掉的，一串addBuff

    self._historyIndex = 1
    self._buffHistoryLeft = {}
    self._buffHistoryRight = {}

    self._roundBuff = {}
end

function BuffManager:clearBuff()
    self._addBuff = {}
    self._delBuff = {}
    self._buffEffect = {}
    self._angerBuff = {}
    self._delBuffBefore = {}
    self._battleEffect = {}
    self._buffList = {}
    self._petsBuff = {}
    self._effectLaterShow = {}

    self._buffHistoryLeft = {}
    self._buffHistoryRight = {}
    self._roundBuff = {}
end

function BuffManager:deleteUsedBuff()
    local newbuff = {}
    for i = 1, #self._battleEffect do
        local data = self._battleEffect[i]
        if not data.isShowed then
            -- table.remove(self._battleEffect, i)
            table.insert(newbuff, clone(data))
        end
    end
    self._battleEffect = nil
    self._battleEffect = newbuff
end

function BuffManager:clearDelBuffBefore()
    self._delBuffBefore = {}
end

--增加angerbuff
function BuffManager:addAngerBuff(data)
    table.insert(self._angerBuff, data)
end

--增加添加buff
function BuffManager:addAddBuff(data)
    table.insert(self._addBuff, data)
end

--增加神兽buff
function BuffManager:addPetsBuff(data)
    table.insert(self._petsBuff, data)
end

--添加buffeffect
function BuffManager:addBuffEffect(data, stageID)
    if not self._buffEffect[stageID] then
        self._buffEffect[stageID] = {}
    end
    table.insert(self._buffEffect[stageID], data)
end

--全场展示用buff
function BuffManager:addBattleEffect(data)
    table.insert(self._battleEffect, data)
end

--攻击前删除buff
function BuffManager:addDelBuffBefore(data)
    table.insert(self._delBuffBefore, data)
end

--攻击中删除buff
function BuffManager:addDelBuffMiddle(data)
    table.insert(self._delBuffMiddle, data)
end

--攻击后删除buff
function BuffManager:addDelBuff(data)
    table.insert(self._delBuff, data)
end

--根据stageId获得buff
function BuffManager:getBuffListByStageId(stageId)
    local buffList = {}
    for _, val in pairs(self._buffList) do
        if val.stageId == stageId then
            table.insert(buffList, val)
        end
    end
    return buffList
end

--根据buff全局id获得表id
function BuffManager:getBuffConfigIdByGlobalId(globalId)
    local hasBuff = nil
    for _, val in pairs(self._buffList) do
        if globalId == val.globalId then
            hasBuff = 1
            return val.configId
        end
    end
end

--获得buff信息
function BuffManager:getBuffConfigByGlobalId(globalId)
    for _, val in pairs(self._buffList) do
        if globalId == val.globalId then
            local configId = val.configId
            -- return val.buffConfig
            local data = HeroSkillEffect.get(configId)
            return data
        end
    end
end

--[[-------------------------------------
buff时间点流程(攻击buff根据表格，可以出现在每个时间点， 包括 addBuff, buffEffect, 需要显示的angerBuff)
1.BuffManager.BUFF_PRE_ATTACK = 0     --作用时间是攻击前,喊话前
    1.buffEffect
    2.delBuffBefore
2.BuffManager.BUFF_AFTER_SHOW = 5     --作用时间是喊话后，比如攻击增加等buff展示
3.BuffManager.BUFF_ATTACK = 1         --作用时间攻击第一下时候
    1.不显示的angerbuff  （showType = 0）
4.BuffManager.BUFF_ATTACK_FINISHED = 4    --作用时间是攻击完成后
    1.delBuff
5.BuffManager.BUFF_ATTACK_BACK = 2    --作用时间是攻击者回位
6.BuffManager.BUFF_HIT_BACK = 3       --作用时间是受击回位

优先处理制定类型，最后处理根据表格需要根据时间点处理的buff
---------------------------------------]]
--检查buffeffect
function BuffManager:_checkBuffEffect(stageId)
    --buff effect 是攻击者结算的buff
    if not self._buffEffect[stageId] or #self._buffEffect[stageId] == 0 then
        self:_checkDelBeforeNotAttack()
        return
    end
    local unit = self._engine:getUnitById(stageId)
    assert(unit, "stage id is nil = " .. stageId)
    unit:damage(self._buffEffect[stageId])

    if FightConfig.HP_TEST_ON and stageId == FightConfig.HP_TEST_ID then
        for i, val in pairs(self._buffEffect[stageId]) do
            local damageInfo = val.damage
            if damageInfo.value ~= 0 then
                local data = {}
                data.realValue = damageInfo.value
                data.showValue = damageInfo.showValue
                local damage = data.realValue
                if damageInfo.type == 1 then
                    data.type = "结算buff扣血"
                    damage = -damage
                elseif damageInfo.type == 2 then
                    data.type = "结算buff治疗"
                end
                unit.hp = unit.hp + damage
                data.finalHp = unit.hp
                local FightHelper = require("app.scene.view.fight.FightHelper")
                FightHelper.pushDamageData(data)
            end
        end
    end

    -- self._buffEffect = {}
end

function BuffManager:clearBuffEffect(stageId)
    self._buffEffect[stageId] = {}
end

--检查战斗前删除buff
function BuffManager:checkDelBefore(stageId)
    for i = #self._delBuffBefore, 1, -1 do
        local val = self._delBuffBefore[i]
        if val.stageId == stageId then
            self:doBuffEndOp(val.buffEndOps)
            self:removeBuffByGlobalId(val.globalId)
            table.remove(self._delBuffBefore, i)
        end
    end
end

--检查中间删除的buff
function BuffManager:_checkDelBuffMiddle()
    for i = #self._delBuffMiddle, 1, -1 do
        local val = self._delBuffMiddle[i]
        self:doBuffEndOp(val.buffEndOps)
        self:removeBuffByGlobalId(val.globalId)
        table.remove(self._delBuffMiddle, i)
    end
end

--检查非攻击者的需要删除的buff
function BuffManager:_checkDelBeforeNotAttack()
    for i = #self._delBuffBefore, 1, -1 do
        local val = self._delBuffBefore[i]
        self:doBuffEndOp(val.buffEndOps)
        self:removeBuffByGlobalId(val.globalId)
        table.remove(self._delBuffBefore, i)
    end
end

--检查不可见的怒气buff
function BuffManager:_checkAngerBuffNoShow()
    for i = #self._angerBuff, 1, -1 do
        local val = self._angerBuff[i]
        if val.showType == 0 then
            local unit = self._engine:getUnitById(val.stageId)
            local sValue = val.value
            if val.type == 1 then
                sValue = -val.value
            end
            if unit then
                unit:updateAnger(sValue)
            end
            table.remove(self._angerBuff, i)
        end
    end
end

--攻击结束删除buff
function BuffManager:_checkDelBuff()
    for i = #self._delBuff, 1, -1 do
        local val = self._delBuff[i]
        self:doBuffEndOp(val.buffEndOps)
        self:removeBuffByGlobalId(val.globalId)
    end
    self._delBuff = {}
end

--处理攻击前buff
function BuffManager:_BUFF_PRE_ATTACK(attackId)
    self:_checkBuffEffect(attackId)
end

--处理喊话后buff
function BuffManager:_BUFF_AFTER_SHOW()
end

--死亡buff
function BuffManager:_BUFF_DIE()
end

--攻击时buff
function BuffManager:_BUFF_ATTACK(attackId)
    self:_checkAngerBuffNoShow()
    self:_checkDelBuffMiddle()
end

--攻击者回位
function BuffManager:_BUFF_ATTACK_BACK()
end

--受击回位
function BuffManager:_BUFF_HIT_BACK()
end

--攻击完成后
function BuffManager:_BUFF_ATTACK_FINISHED()
    self:_checkDelBuff()
    self:clearDelBuffBefore()
end

--开场buff
function BuffManager:_BUFF_FIGHT_OPENING()
    -- for unit in self._engine:foreachUnit() do
    --     unit:playStartBuff()
    -- end
end

--判断时机
function BuffManager:_checkBuffTime(buffData, effectTime, attackId, targetId, isServer, isNoAttack)
    if buffData.isShowed then
        return false
    end
    if isNoAttack then
        return true
    end
    --开场写在最前面
    if effectTime == buffManager.BUFF_FIGHT_OPENING then --开场
        local target = buffData.target
        if targetId == target then
            return true
        end
    end

    --除开场外
    local showTime = nil
    if isServer then
        showTime = buffData.showTime
    else
        showTime = buffData.buffConfig.buff_eff_time
    end

    if effectTime == BuffManager.BUFF_AFTER_SHOW then
        effectTime = BuffManager.BUFF_PRE_ATTACK
    end

    --在最后
    if showTime ~= effectTime then
        return false
    end

    if
        effectTime == BuffManager.BUFF_PRE_ATTACK or effectTime == BuffManager.BUFF_ATTACK_FINISHED or
            effectTime == BuffManager.BUFF_ATTACK
     then
        -- elseif effectTime == BuffManager.BUFF_ATTACK  then
        --     local targetList = buffData.targets
        --     for i, v in pairs(targetList) do
        --         if targetId == v then
        --             buffData.checkCount = buffData.checkCount + 1
        --             if buffData.checkCount == buffData.totalCount then
        --                 return true
        --             end
        --             table.remove(targetList, i)
        --             break
        --         end
        --     end
        if buffData.attacker == attackId then
            return true
        end
    elseif effectTime == BuffManager.BUFF_HIT_BACK then --只有在攻击回位后需要判断受攻击者全部回来，并且所受攻击是buff释放者id
        -- elseif effectTime == buffManager.BUFF_FIGHT_OPENING then    --开场
        --     return true
        if buffData.attacker ~= attackId then
            return false
        end

        local targetList = buffData.targets
        if #targetList == 0 then
            if buffData.target == targetId then
                return true
            end
            local buffUnit = self._engine:getUnitById(buffData.target)
            if buffUnit and buffUnit.to_alive then
                return true
            end
            return false
        end
        for i, v in pairs(targetList) do
            if targetId == v then
                local unit = self._engine:getUnitById(v)
                if unit and unit.attackIndex == buffData.attackIndex then
                    table.remove(targetList, i)
                    return true
                end
            -- buffData.checkCount = buffData.checkCount + 1
            -- if buffData.checkCount == buffData.totalCount then
            end
        end

        return false
    elseif effectTime == BuffManager.BUFF_ATTACK_BACK then --攻击回位置，判断敌方群体
        if buffData.attacker ~= attackId then
            return false
        end

        if not targetId then
            return true
        end

        local targetList = buffData.atkTargets
        if #targetList ~= #targetId then
            return false
        end

        for _, id in pairs(targetList) do
            for i, v in pairs(targetId) do
                if id == v then
                    buffData.atkCheckCount = buffData.atkCheckCount + 1
                    if buffData.atkCheckCount == buffData.atkTotalCount then
                        return true
                    end
                end
            end
        end
        return false
    elseif effectTime == BuffManager.BUFF_DIE then
        if buffData.attacker == attackId then
            return true
        end
        local targetList = buffData.atkTargets
        for _, id in pairs(targetList) do
            if id == attackId then
                return true
            end
        end
        return false
    end
    return false
end

function BuffManager:_doAddBuffLater()
    for i = #self._addBuffLastShow, 1, -1 do
        local data = self._addBuffLastShow[i]
        local unit = self._engine:getUnitById(data.stageId)
        if unit then
            unit:getBuff(data)
            unit:buffPlay(data.configId)
            table.remove(self._addBuffLastShow, i)
        -- table.insert(self._buffList, data)
        end
    end
    self._addBuffLastShow = {}
end

--处理添加buff
function BuffManager:_checkAddBuff(effectTime, attackId, targetId, isNoSkill)
    local function addBuffFunc(i)
        local data = self._addBuff[i]
        local unit = self._engine:getUnitById(data.stageId)
        local attackUnit = self._engine:getUnitById(data.attackId)
        if unit then
            local skillData = HeroSkillActive.get(data.skillId)
            if attackId ~= data.attackId and skillData and skillData.talent ~= "" and attackUnit and attackUnit.to_alive then
                table.insert(self._addBuffLastShow, data)
                table.insert(self._buffList, data)
                self._engine:playFeatures(data.attackId, data.skillId, handler(self, self._doAddBuffLater))
            else
                table.insert(self._buffList, data)
                unit:buffPlay(data.configId)
                unit:getBuff(data)
                if data.removeId ~= 0 then
                    self:removeBuffByGlobalId(data.removeId)
                end
            end
            table.remove(self._addBuff, i)
        end
    end
    local isShowBuff = false

    for i = #self._addBuff, 1, -1 do
        local val = self._addBuff[i]
        isShowBuff = self:_checkBuffTime(val, effectTime, attackId, targetId, true, isNoSkill)
        if isShowBuff then
            addBuffFunc(i)
        end
    end
    return isShowBuff
end

--处理神兽buff
function BuffManager:checkPetsBuff()
    local function doBattleEffectFunc(i)
        local data = self._petsBuff[i]
        local unit = self._engine:getUnitById(data.stageId)
        if not unit then --buff目标已经死亡
            table.remove(self._petsBuff, i)
            return
        else
            local damageInfo = nil
            if data.damage.showValue ~= 0 or data.damage.protect ~= 0 then
                damageInfo = data.damage
            end
            unit:buffPlay(data.configId, damageInfo)
            if unit.to_alive then
                unit.to_alive = data.isAlive
            end
            table.remove(self._petsBuff, i)
        end
    end
    --这边处理一下，如果是攻击前的buff，改成喊话后
    if effectTime == BuffManager.BUFF_PRE_ATTACK then
        return
    end
    local isShowBuff = false
    for i = #self._petsBuff, 1, -1 do
        local val = self._petsBuff[i]
        doBattleEffectFunc(i)
    end
end

function BuffManager:_doBattleEffectList()
    for i = #self._effectLaterShow, 1, -1 do
        local data = self._effectLaterShow[i]
        local unit = self._engine:getUnitById(data.stageId)
        if unit then
            local damageInfo = nil
            if data.damage.showValue ~= 0 then
                damageInfo = data.damage
            end
            if unit.to_alive then
                unit.to_alive = data.isAlive
            end
            unit:buffPlay(data.configId, damageInfo, false, data.dieIndex)
            self:doBuffEndOp(data.buffEndOps)
            if FightConfig.HP_TEST_ON and unit.stageID == FightConfig.HP_TEST_ID and damageInfo then
                local data = {}
                data.realValue = damageInfo.value
                data.showValue = damageInfo.showValue
                local damage = data.realValue
                if damageInfo.type == 1 then
                    data.type = "effect扣血"
                    damage = -damage
                elseif damageInfo.type == 2 then
                    data.type = "effect加血"
                end
                unit.hp = unit.hp + damage
                data.finalHp = unit.hp
                local FightHelper = require("app.scene.view.fight.FightHelper")
                FightHelper.pushDamageData(data)
            end

            table.remove(self._effectLaterShow, i)
        end
    end
    self._effectLaterShow = {}
end

--处理只需要表现的Battleeffect
function BuffManager:_checkBattleEffect(effectTime, attackId, targetId)
    local function doBattleEffectFunc(i)
        local data = self._battleEffect[i]
        if data.isShowed then
            return
        end

        local unit = self._engine:getUnitById(data.stageId)

        if not unit then --buff目标已经死亡
            table.remove(self._battleEffect, i)
            return
        else
            self._battleEffect[i].isShowed = true
            local damageInfo = nil
            if data.damage.showValue ~= 0 or data.damage.protect ~= 0 then
                damageInfo = data.damage
            end

            local skillData = HeroSkillActive.get(data.skillId)
            if attackId ~= data.attackId and skillData and skillData.talent ~= "" then
                table.insert(self._effectLaterShow, data)
                self._engine:playFeatures(data.attackId, data.skillId, handler(self, self._doBattleEffectList))
            else
                --输出成文件相关
                if data.isAlive ~= nil and unit.to_alive then
                    unit.to_alive = data.isAlive
                end
                unit:buffPlay(data.configId, damageInfo, false, data.dieIndex)
                self:doBuffEndOp(data.buffEndOps)
                print("1112233 do buff data", data.stageID, data.configId)
            end
            -- table.remove(self._battleEffect, i)
        end
    end
    --这边处理一下，如果是攻击前的buff，改成喊话后
    if effectTime == BuffManager.BUFF_PRE_ATTACK then
        return
    end
    local isShowBuff = false
    for i = #self._battleEffect, 1, -1 do
        local val = self._battleEffect[i]
        if not val.isShowed then
            isShowBuff = self:_checkBuffTime(val, effectTime, attackId, targetId)
            if isShowBuff then
                doBattleEffectFunc(i)
            end
        end
    end
    return isShowBuff
end

--需要展示的怒气buff
function BuffManager:_checkAngerBuffShow(effectTime, attackId, targetId)
    local function doAngerBuffFunc(i)
        local data = self._angerBuff[i]
        local unit = self._engine:getUnitById(data.stageId)
        if unit then
            local sValue = data.value
            local damage = {
                type = data.type,
                value = sValue,
                showValue = sValue
            }
            unit:buffPlay(data.configId, damage, true)
            if data.type == 1 then
                sValue = -sValue
            end
            unit:updateAnger(sValue)
            unit:playOnceBuff(data)
            table.remove(self._angerBuff, i)
        end
    end
    local isShowBuff = false
    for i = #self._angerBuff, 1, -1 do
        local val = self._angerBuff[i]
        if val.showType == 1 then
            isShowBuff = self:_checkBuffTime(val, effectTime, attackId, targetId, true)
            if isShowBuff then
                doAngerBuffFunc(i)
            end
        end
    end
    return isShowBuff
end

--检查buff点，effect 0攻击前，1攻击时，2攻击后回位，3受击后回位，4攻击结束后
--作用时机，本次攻击者ID，buff受益者id, 是否时神兽攻击,
--如果时神兽，则attackid变为阵营camp
function BuffManager:checkPoint(effectTime, attackId, targetId, isNoSkill)
    local isAddBuff = self:_checkAddBuff(effectTime, attackId, targetId, isNoSkill)
    local isBattleBuff = self:_checkBattleEffect(effectTime, attackId, targetId)
    local isAngerBuff = self:_checkAngerBuffShow(effectTime, attackId, targetId)
    local funcName = nil
    for key, value in pairs(BuffManager) do
        if string.find(key, "BUFF_") and value == effectTime then
            funcName = "_" .. key
        end
    end
    if funcName then
        local func = self[funcName]
        assert(func, "has not func name = " .. funcName)
        func(self, attackId, targetId, buffAttackId)
    end
    return isAddBuff or isBattleBuff or isAngerBuff
end

--检查战斗展示buff by stageId
function BuffManager:getFinishBuffByStageId(stageId)
    local bufflist = {}
    for i = #self._battleEffect, 1, -1 do
        local val = self._battleEffect[i]
        local buffData = HeroSkillEffect.get(val.configId)
        assert(buffData, "no buff data id = " .. val.configId .. "stageId" .. stageId)
        if buffData.buff_eff_time == BuffManager.BUFF_ATTACK_FINISHED and val.stageId == stageId then
            local buff = {
                stageId = val.stageId,
                configId = val.configId,
                damage = val.damage,
                isAlive = val.isAlive
            }
            table.insert(bufflist, buff)
            table.remove(self._battleEffect, i)
        end
    end
    return bufflist
end

--执行buff删除的时候附加的效果
function BuffManager:doBuffEndOp(endOps)
    if endOps and #endOps ~= 0 then
        for i, v in pairs(endOps) do
            local unit = self._engine:getUnitById(v.stageId)
            if unit then
                if unit.to_alive then
                    unit.to_alive = v.isAlive
                end
                unit:doBuffEndOp(v.type, v.damage)
            end
        end
    end
end

--删除制定id的buff
function BuffManager:removeBuffByGlobalId(globalId)
    for i = #self._buffList, 1, -1 do
        local val = self._buffList[i]
        if val.globalId == globalId then
            local unit = self._engine:getUnitById(val.stageId)
            if unit and unit.is_alive then
                unit:deleteBuff(val)
            end
            table.remove(self._buffList, i)
            break
        end
    end
end

--删除所有buff
function BuffManager:clearAllBuff()
    for i = #self._buffList, 1, -1 do
        local val = self._buffList[i]
        local unit = self._engine:getUnitById(val.stageId)
        if unit and unit.is_alive then
            unit:deleteBuff(val)
        end
    end
    self._buffList = {}
end

--获得buff数量
function BuffManager:getBuffCount(stageId, configId)
    local count = 0
    for i = 1, #self._buffList do
        local val = self._buffList[i]
        if val.stageId == stageId and val.configId == configId then
            count = count + 1
        end
    end
    return count
end
--返回。camp1 buff， camp2 buff
function BuffManager:checkNextHistoryBuff(buffTime)
    self._historyIndex = self._historyIndex + 1
    local buff1 = nil
    local buff2 = nil
    if self._buffHistoryLeft[buffTime] then
        buff1 = self._buffHistoryLeft[buffTime][self._historyIndex]
    end
    if self._buffHistoryRight[buffTime] then
        buff1 = self._buffHistoryRight[buffTime][self._historyIndex]
    end
    if not buff1 and buff2 then
        self._historyIndex = 0
    end
    return buff1, buff2
end

function BuffManager:checkHisBuff(buffTime, stageId)
    local buffs = nil
    if self._buffHistoryLeft[buffTime] then
        for _, data in pairs(self._buffHistoryLeft[buffTime]) do
            if not buffs then
                buffs = {}
            end
            table.insert(buffs, data)
        end
    end
    if self._buffHistoryRight[buffTime] then
        for _, data in pairs(self._buffHistoryRight[buffTime]) do
            if not buffs then
                buffs = {}
            end
            table.insert(buffs, data)
        end
    end

    if stageId and buffs then
        local newbuff = {}
        for i = 1, #buffs do
            if buffs[i]:getStageId() == stageId then
                table.insert(newbuff, clone(buffs[i]))
            end
        end
        if #newbuff == 0 then 
            buffs =  nil
        else 
            buffs = nil 
            buffs = newbuff
        end
    end

    return buffs
end

--回合结束后检查是否有没有攻击方的应表现的回位后历代名将
function BuffManager:checkSelfCampBackHistory(camp)
    print("1112233 check back his , ", camp)
    local buffs = self._buffHistoryLeft[BuffManager.HIS_AFTER_HIT]
    local showBuff = nil
    if camp == 2 then 
        buffs = self._buffHistoryRight[BuffManager.HIS_AFTER_HIT]
    end
    if not buffs then
        return nil
    end
    for _, data in pairs(buffs) do 
        if not showBuff then  
            showBuff = {}
        end
        table.insert(showBuff, data)
    end
    return showBuff

end

--整理历代名将buff，按照camp分类
function BuffManager:formatHistoryBuff(buffs)
    self._historyIndex = 0
    self._buffHistoryLeft = {}
    self._buffHistoryRight = {}
    for _, data in pairs(buffs) do
        local buff = clone(data)
        if buff:getCamp() == 1 then
            local time = buff:getBuffTime()
            if not self._buffHistoryLeft[time] then
                self._buffHistoryLeft[time] = {}
            end
            table.insert(self._buffHistoryLeft[time], buff)
        elseif buff:getCamp() == 2 then
            local time = buff:getBuffTime()
            if not self._buffHistoryRight[time] then
                self._buffHistoryRight[time] = {}
            end
            table.insert(self._buffHistoryRight[time], buff)
        end
    end
end

--出发历代名将buff
function BuffManager:doHistoryBuffs()
    -- local function addBuffFunc(i)
    --     local data = self._buffHistory[i]
    --     local unit = self._engine:getUnitById(data.stageId)
    --     if unit then
    --         unit:buffPlay(data.configId)
    --         unit:playOnceBuff(data)
    --         if data.removeId ~= 0 then
    --             self:removeBuffByGlobalId(data.removeId)
    --         end
    --         table.remove(self._buffHistory, i)
    --     end
    -- end
    -- local isShowBuff = false
    -- for i = #self._buffHistory, 1, -1 do
    --     local val = self._buffHistory[i]
    --     addBuffFunc(i)
    -- end
end

function BuffManager:checkRoundEndAnger(angers)
    -- local anger = clone(angers)
    local function doAngerBuffFunc(data)
        local unit = self._engine:getUnitById(data.stageId)
        if unit then
            local sValue = data.value
            local damage = {
                type = data.type,
                value = sValue,
                showValue = sValue
            }
            unit:buffPlay(data.configId, damage, true)
            if data.type == 1 then
                sValue = -sValue
            end
            unit:updateAnger(sValue)
            local config = HeroSkillEffect.get(data.configId)
            unit:playOnceBuff(data, config)
        end
    end
    for i, v in pairs(angers) do
        doAngerBuffFunc(v)
    end
end

function BuffManager:addRoundBuff(buffs)
    self._roundBuff = buffs
end

function BuffManager:checkRoundBuff()
    if not self._roundBuff then 
        return 
    end
    for _, data in pairs(self._roundBuff) do
        local unit = self._engine:getUnitById(data.stageId)
        if unit then
            table.insert(self._buffList, data)
            unit:buffPlay(data.configId)
            unit:getBuff(data)
            if data.removeId ~= 0 then
                self:removeBuffByGlobalId(data.removeId)
            end
        end
    end
    self._roundBuff = nil
end

--攻击前检查一些攻击者需要删除的buff，如果有特殊的，就优先执行删除
function BuffManager:doPerCheck(stageId, buffs)
    for i = #buffs, 1, -1 do
        local data = buffs[i]
        local config = HeroSkillEffect.get(data.configId)
        if config.special == "jifei" then
            self:removeBuffByGlobalId(data.globalId)
            table.remove(buffs, i)
        end
    end
end

function BuffManager:deleteEffectByStateId(stageId)
    for i = #self._battleEffect, 1, -1 do
        local data = self._battleEffect[i]
        if data.target == stageId and not data.isShowed then
            local damageInfo = nil
            if data.damage.showValue ~= 0 or data.damage.protect ~= 0 then
                damageInfo = data.damage
            end
            local unit = self._engine:getUnitById(stageId)
            unit:buffPlay(data.configId, damageInfo, false, data.dieIndex)
            self._battleEffect[i].isShowed = true
        end
    end
end

return BuffManager
