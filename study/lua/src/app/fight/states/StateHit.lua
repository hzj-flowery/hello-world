local StateFlash = require("app.fight.states.StateFlash")
local StateHit = class("StateHit", StateFlash)
local Path = require("app.utils.Path")
local Engine = require("app.fight.Engine")
local BuffManager = require("app.fight.BuffManager")
local FightConfig = require("app.fight.Config")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")

function StateHit:ctor(entity, actionID, info, isProjectile, attackId)
    -- print("stateHit actionId = "..actionID)
    StateHit.super.ctor(self, entity, actionID)
    self._info = info
    self._hitCount = 0
    self._isProjectile = isProjectile
    self._totalPercent = 0
    self._attackId = attackId

    if FightConfig.HP_TEST_ON and self._entity.stageID == FightConfig.HP_TEST_ID then
        local damageInfo = self._info.damage
        if damageInfo.damageType ~= 0 then
            self._testData = {
                realValue = 0,
                showValue = 0
            }
            if damageInfo.type == 1 then
                self._testData.type = "扣血"
            else
                self._testData.type = "治疗"
            end
        end
    end
end

--
function StateHit:onDamageEvent(value1, value2)
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

    local damageInfo = self._info.damage

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
    for i, v in pairs(self._info.hurts) do
        if v.hurtId == 5 then
            if v.hurtValue >= singleValue then
                singleValue = 0
            else
                -- v.hurtValue = 0
                singleValue = singleValue - v.hurtValue
            end
            if v.hurtValue >= realDamage then
                v.hurtValue = v.hurtValue - realDamage
                realDamage = 0
            else
                realDamage = realDamage - v.hurtValue
                v.hurtValue = 0
            end
        end
    end

    -- local damage = damageInfo.value + damageInfo.protect

    if damageType ~= 0 then
        self._entity:doHurt(damageType, realDamage, singleValue, self._info.hurts, realProtect)
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
        if FightConfig.HP_TEST_ON and self._entity.stageID == FightConfig.HP_TEST_ID then
            if singleValue ~= 0 then
                self._testData.realValue = self._testData.realValue + realDamage
                self._testData.showValue = self._testData.showValue + singleValue
                local hpChange = type * realDamage
                self._entity.hp = self._entity.hp + hpChange
                self._testData.finalHp = self._entity.hp
            end
        end
        local v = type * checkint(singleValue)
        if v ~= 0 then
            FightSignalManager.getFightSignalManager():dispatchSignal(
                FightSignalConst.SIGNAL_HURT_VALUE,
                type * singleValue
            )
        end
    end

    if self._isProjectile then --如果事弹道目标
        self._entity.projectileCount = self._entity.projectileCount - 1
        if self._entity.projectileCount == 0 then
            FightSignalManager.getFightSignalManager():dispatchSignal(
                FightSignalConst.SIGNAL_ADD_HURT_END,
                self._entity.stageID
            )
            if not self._entity.to_alive then
                Engine.getEngine():dispatchLastHit(self._entity)
                self._entity.is_alive = self._entity.to_alive
                if value2 == "dying" then
                    if not self._entity.is_alive then
                        self:onFinish()
                        self._entity:dying()
                    end
                end
            end
        end
    else
        self._totalPercent = self._totalPercent + c
        if self._totalPercent == count then
            Engine.getEngine():dispatchLastHit(self._entity)
            FightSignalManager.getFightSignalManager():dispatchSignal(
                FightSignalConst.SIGNAL_ADD_HURT_END,
                self._entity.stageID
            )
        end
        if value2 == "dying" then
            if not self._entity.is_alive then
                self._entity:dying()
                self:onFinish()
            end
        end
    end
end

function StateHit:onFinish()
    StateHit.super.onFinish(self)

    self._entity:updateHpShadow(true)
    self._entity:checkSpcialBuff()

    if not self._entity.is_alive then
        BuffManager.getBuffManager():checkPoint(BuffManager.BUFF_DIE, self._entity.stageID)
        BuffManager.getBuffManager():checkPoint(BuffManager.BUFF_HIT_BACK, self._attackId, self._entity.stageID)
        BuffManager.getBuffManager():deleteEffectByStateId(self._entity.stageID)
        self._entity:dispatchDie()
    end

    if self._testData then
        local FightHelper = require("app.scene.view.fight.FightHelper")
        FightHelper.pushDamageData(self._testData)
    end
end

return StateHit
