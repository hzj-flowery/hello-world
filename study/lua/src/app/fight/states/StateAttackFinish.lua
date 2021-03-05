local StateFlash = require("app.fight.states.StateFlash")
local StateAttackFinish = class("StateAttackFinish", StateFlash)
local Path = require("app.utils.Path")

--攻击完成后状态，对应攻击完成后buff
function StateAttackFinish:ctor(entity, buffList)
    local actionID = Path.getTargetAction("damage")
    StateAttackFinish.super.ctor(self, entity, actionID)
    self._buffList = buffList
    self._bShowName = false
end

function StateAttackFinish:start()
    StateAttackFinish.super.start(self)
    -- self._entity:showBillBoard(false)
    self._finish = false
    self._start = true
    if #self._buffList == 0 then
        self:onFinish()
    end
end

function StateAttackFinish:onDamageEvent(_, value2)
    self:doBuffs()
    for i, v in pairs(self._buffList) do 
        if v.isAlive == false then 
            self._entity.to_alive = false
        end
    end
    self._entity.is_alive = self._entity.to_alive
    if value2 == "dying" then
        if not self._entity.is_alive then
            self:onFinish()
            self._entity:dying()
        end
    end
end

function StateAttackFinish:doBuffs()
    for _, data in pairs(self._buffList) do
        local damageInfo = nil
        if data.damage.showValue ~= 0 then
            damageInfo = data.damage
        end
        local configId = data.configId
        self._entity:buffPlay(configId, damageInfo)
    end
end

function StateAttackFinish:onFinish()
    self._entity.is_alive = self._entity.to_alive
    StateAttackFinish.super.onFinish(self)
end

return StateAttackFinish
