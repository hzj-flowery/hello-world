local State = require("app.fight.states.State")
local StateBuff = class("StateBuff", State)

local FightConfig = require("app.fight.Config")

-- --战斗buff结算状态
function StateBuff:ctor(entity, buffTime, attackId, targetId)

    StateBuff.super.ctor(self, entity)
    self._buffTime = buffTime
    self._attackId = attackId
    self._targetId = targetId
    self._showBuff = false
    self._showBuffTime = 0
    if not self._entity.isPet then 
        self._bShowName = false
    end
end

function StateBuff:start()
    StateBuff.super.start(self)
    local isBuffShow = false
    if self._entity.isPet then
        self._entity:setAction("idle", true)
        local BuffManager = require("app.fight.BuffManager")
        isBuffShow = self._entity._buffManager:checkPoint(self._buffTime, self._entity.camp, self._targetId)
    else
        -- self._entity:showBillBoard(false)
        -- self._entity:setAction("idle", true)
        -- print("1112233 unit id = ", self._entity.stageID, "play buff idle")
        local BuffManager = require("app.fight.BuffManager")
        isBuffShow = self._entity._buffManager:checkPoint(self._buffTime, self._attackId, self._targetId)
    end
    if isBuffShow then
        self._showBuff = true
        self._showBuffTime = 0
    end
end

function StateBuff:update(f)
    if not self:isStart() then
        return
    end
    if not self._showBuff then
        self:onFinish()
    end
    if not self:isFinish() and self._showBuffTime >= FightConfig.SHOW_BUFF_PRE_ATTACK_TIME then
        self._showBuff = false
    else
        self._showBuffTime = self._showBuffTime + f
    end
end

function StateBuff:onFinish()
    StateBuff.super.onFinish(self)
end

return StateBuff



