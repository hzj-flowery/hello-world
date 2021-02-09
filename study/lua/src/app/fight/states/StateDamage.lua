local StateFlash = require("app.fight.states.StateFlash")
local StateDamage = class("StateDamage", StateFlash)
local Path = require("app.utils.Path")
local BuffManager = require("app.fight.BuffManager")
-- local Engine = require("app.fight.Engine")

function StateDamage:ctor(entity, info, isLastBuff)
    self._buffList = info
    self._isLastBuff = isLastBuff
    if #self._buffList == 0 then
        local actionID = Path.getTargetAction("idle")
        StateDamage.super.ctor(self, entity, actionID)
        return 
    end
    local actionID = Path.getTargetAction("idle")
    for _, val in pairs(self._buffList) do
        local damageInfo = val.damage
        local showValue = damageInfo.showValue
        if damageInfo.type == 1 then
            showValue = showValue * -1
            actionID = Path.getTargetAction("damage")
        end        
    end
    self._actionID = actionID
    StateDamage.super.ctor(self, entity, actionID)
end

function StateDamage:start()
    if self._actionID == Path.getTargetAction("idle") then
        self:doBuffs()
    end
    StateDamage.super.start(self)
    if #self._buffList == 0 then
        self:onFinish()
    end
end

function StateDamage:onDamageEvent(_, value2)
    self:doBuffs()
    if not self._isLastBuff then 
        return 
    end
    if not self._entity:hasSkill() then
        self._entity.is_alive = self._entity.to_alive 
    end
	if value2 == "dying" then		
        if not self._entity.is_alive then
			self:onFinish()
            self._entity:setDieState()
            --处理武将死亡情况
            local Engine = require("app.fight.Engine")
            Engine.getEngine():dispatchLastHit(self._entity)
		end
	end
end

function StateDamage:doBuffs()
    --根据buff类型在buff列表里面找到并计算,
    local buffManager = BuffManager.getBuffManager()
    for _, val in pairs(self._buffList) do
        local configId = val.configId
        if not configId then
            configId = buffManager:getBuffConfigIdByGlobalId(val.globalId)
        end
        local damageInfo = nil
        if val.damage.showValue ~= 0 or val.damage.protect ~= 0 then
            damageInfo = val.damage
        end
        self._entity:buffPlay(configId, damageInfo, nil, nil, nil, true)
    end   
end

function StateDamage:onFinish()
    local buffManager = BuffManager.getBuffManager()
    if self._isLastBuff then 
        buffManager:clearBuffEffect(self._entity.stageID)
        buffManager:checkDelBefore(self._entity.stageID)
    end
    -- self._entity.is_alive = self._entity.to_alive
    if not self._entity.is_alive then
        self._entity:dispatchDie()
        buffManager:checkPoint(BuffManager.BUFF_ATTACK_BACK, self.stageID, nil, true) 
    end
    StateDamage.super.onFinish(self)
end

return StateDamage