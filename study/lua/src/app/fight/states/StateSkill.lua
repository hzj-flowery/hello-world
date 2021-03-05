local StateFlash = require("app.fight.states.StateFlash")
local StateSkill = class("StateSkill", StateFlash)
local FightConfig = require("app.fight.Config")
local Engine = require("app.fight.Engine")
local Path = require("app.utils.Path")
local BuffManager = require("app.fight.BuffManager")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")

local searchType = {
    {},
    {
        {1, 2, 3},
        {4, 5, 6}
    },
    {
        {1, 4},
        {2, 5},
        {3, 6}
    },
    {},
    {
        {1, 0, 4, 2},
        {2, 1, 5, 3},
        {3, 2, 6, 0},
        {4, 0, 0, 5},
        {5, 4, 0, 6},
        {6, 5, 0, 0}
    }
}

--
function StateSkill:ctor(entity, skillPlay, targets, skillInfo)
    self._skillPlay = skillPlay
    self._skillInfo = skillInfo

    local ani = Path.getAttackerAction(self._skillPlay.atk_action)
    StateSkill.super.ctor(self, entity, ani)

    self._targets = targets
    self._selfHitInfo = nil

    self._hitCount = 0
    for i, v in pairs(self._targets.list) do
        if v.unit.stageID == self._entity.stageID then
            self._selfHitInfo = v.info
        end
    end
    self._projectiles = {}
    self._hitType = nil
    self._wait = false
    self._firstProjectilOver = false
    self._projectBuffPlay = false
    -- self._entity._buffManager:setHitBuffs()
    --self._bShowName = false
    if self._projectileCount ~= 0 then
        for i, v in pairs(self._targets.list) do
            v.unit.projectileCount = self._projectileCount
        end
    end
    self._bShowName = false
end

--
function StateSkill:start()
    StateSkill.super.start(self)
    self._entity._buffManager:_checkDelBeforeNotAttack()
    if not self._entity.isPet then
        self._entity:setBuffEffectVisible(false)
    end
    self._entity:setTowards(self._entity.camp)
    self._entity.updateShadow = false
    if self._skillInfo.skill_type == 2 then
        self._entity:setZOrderFix(FightConfig.ZORDER_SKILL_UNIT)
        for _, v in pairs(self._targets.list) do
            v.unit:setZOrderFix(FightConfig.ZORDER_SKILL_UNIT)
        end
        local sceneView = Engine.getEngine():getView()
        sceneView:showSkill2Layer(true)
    end

    Engine.getEngine():startFlashViewport(self._skillPlay.atk_action, self._entity.camp)
end

--
function StateSkill:update(f)
    if self._wait == false then
        StateSkill.super.update(self, f)
    end

    if self._hitType == "projectile" then
        local isProjectileOver = true
        for i, v in pairs(self._projectiles) do
            if not v:isRemove() then
                isProjectileOver = false
            else
                self._firstProjectilOver = true
            end
        end

        if isProjectileOver and self._frame >= self._data.frameCount then
            -- print("skillfinish")
            StateSkill.super.onFinish(self)
        end

        if self._firstProjectilOver and not self._projectBuffPlay then
            local buffManager = BuffManager.getBuffManager()
            buffManager:checkPoint(BuffManager.BUFF_ATTACK, self._entity.stageID)
            self._projectBuffPlay = true
        end
    end
end

--
function StateSkill:onHitEvent(hitType, value1, value2, value3)
    self._hitType = hitType
    --attack, 3, "",""
    if hitType == "attack" then
        local buffManager = BuffManager.getBuffManager()
        if not self._entity.isPet then
            buffManager:checkPoint(BuffManager.BUFF_ATTACK, self._entity.stageID)
        else
            buffManager:checkPoint(BuffManager.BUFF_ATTACK, self._entity.camp)
        end
        if self._skillPlay.atk_type == 1 then --1单体
            for i, v in ipairs(self._targets.list) do
                -- v.unit:hitPlay(self._skillPlay, v.info)
                self:doHitPlay(v, self._skillPlay, v.info)
            end
        else
            local search = string.split(value1, "_")
            if search[1] == "0" then -- 全体
                for i, v in ipairs(self._targets.list) do
                    -- v.unit:hitPlay(self._skillPlay, v.info)
                    self:doHitPlay(v, self._skillPlay, v.info)
                end
            else
                if self._skillPlay.atk_type == 4 then -- 4全体
                    for i = 1, #search do
                        local target = self._targets.cell[checkint(search[i])]
                        if target then
                            self:doHitPlay(target, self._skillPlay, target.info)
                        end
                    end
                elseif self._skillPlay.atk_type == 5 then --相邻
                    local stype = searchType[self._skillPlay.atk_type]
                    if stype then
                        local cells = stype[self._targets.MainCellIdx] --第一个人是主受击者,找出他的位置
                        for i = 1, #search do
                            local cell = cells[checkint(search[i])]
                            local target = self._targets.cell[cell]
                            if target then
                                self:doHitPlay(target, self._skillPlay, target.info, checkint(search[i]))
                            end
                        end
                    end
                else -- 2列，3排
                    local stype = searchType[self._skillPlay.atk_type]
                    if stype then
                        for i = 1, #search do
                            local cells = stype[checkint(search[i])]
                            for _, cell in ipairs(cells) do
                                local target = self._targets.cell[cell]
                                if target then
                                    self:doHitPlay(target, self._skillPlay, target.info)
                                end
                            end
                        end
                    end
                end
            end
        end
    elseif hitType == "projectile" then
        local f = self._entity.camp == FightConfig.campLeft and 1 or -1
        local startP = cc.pAdd(cc.p(self._entity:getPosition()), cc.p(value2 * f, -value3))
        for i, v in ipairs(self._targets.list) do
            local endP = cc.pAdd(cc.p(v.unit:getPosition()), cc.p(0, 50))
            local projectile =
                Engine.getEngine():createProjectile(self._skillPlay, {v}, startP, endP, self._entity.stageID)
            table.insert(self._projectiles, projectile)
        end
    end
end

--
function StateSkill:doHitPlay(target, skillPlay, info, hitCount) --hitcount,相邻时第几个受击
    if target and target.unit.stageID ~= self._entity.stageID then
        local stageId = self._entity.stageID
        if self._entity.isPet then
            stageId = self._entity.camp
        end
        target.unit:hitPlay(skillPlay, info, hitCount, nil, stageId)
    -- print("1112233 target = ", target.unit.stageID)
    end
end

--
function StateSkill:onDamageEvent(value1, value2)
    if not self._selfHitInfo then --如果没有自己受伤信息，不执行该函数
        return
    end

    -- 伤害
    local count = checkint(self._data.damage) --受击次数
    local c = checkint(value1) --当次受击所占的比重
    local p = c / count --每次手机所占百分比
    if self._isProjectile then --如果是弹道攻击的话，平分100
        p = c / 100
    end

    FightSignalManager.getFightSignalManager():dispatchSignal(
        FightSignalConst.SIGNAL_FIGHT_ADD_HURT,
        p,
        self._entity.stageID
    ) --伤害百分比分配出去

    local damageInfo = self._selfHitInfo.damage
    if not damageInfo.type then
        return
    end

    local damageType = damageInfo.type --1,扣血；2，加血

    --如果有吸收信息这边处理一下
    local singleValue = math.ceil(damageInfo.showValue * p) --展示伤害
    local hpDamage = damageInfo.value
    local protectDamage = damageInfo.protect
    local damage = 0
    local realDamage = 0
    local realProtect = 0
    if damageType == 1 then
        damage = hpDamage + protectDamage
        realDamage = math.ceil(damage * p)
    elseif damageType == 2 then
        realDamage = math.ceil(hpDamage * p)
        realProtect = math.ceil(protectDamage * p)
    end

    local damageType = damageInfo.type
    if damageType ~= 0 then
        self._entity:doHurt(damageType, realDamage, singleValue, self._selfHitInfo.hurts, realProtect)
        if not self._isProjectile then
            self._entity.is_alive = self._entity.to_alive
        end
        self._hitCount = self._hitCount + 1
        if self._hitCount == 1 then
            local buffManager = self._entity._buffManager
            buffManager:checkPoint(BuffManager.BUFF_ATTACK, self._attackId)
        end
        local type = 0
        if damageType == 1 then
            type = -1
        elseif damageType == 2 then
            type = 1
        end
        local v = type * checkint(singleValue)
        if v ~= 0 then
            FightSignalManager.getFightSignalManager():dispatchSignal(
                FightSignalConst.SIGNAL_HURT_VALUE,
                type * singleValue
            )
        end
    end
    -- 死亡
    if value2 == "dying" then
        if not self._entity.is_alive then
            self:onFinish()
            self._entity:dying()
        end
    end
end

--
function StateSkill:onFinish()
    if self._hitType == "projectile" then
        self._entity:setAction("idle", true)
        self._wait = true
    else
        StateSkill.super.onFinish(self)
    end
    if not self._entity.isPet then
        self._entity:updateHpShadow(true)
        self._entity:setBuffEffectVisible(true)
    else
        self._entity:checkShow()
    end
    FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_ATTACK_FINISH)

    if self._selfHitInfo then
        FightSignalManager.getFightSignalManager():dispatchSignal(
            FightSignalConst.SIGNAL_ADD_HURT_END,
            self._entity.stageID
        )
        BuffManager.getBuffManager():checkPoint(BuffManager.BUFF_HIT_BACK, self._entity.stageID, self._entity.stageID)
    end
    if not self._entity.to_alive then
        BuffManager.getBuffManager():checkPoint(BuffManager.BUFF_ATTACK_BACK, self._entity.stageID)
    end
end

return StateSkill
