--金将入场show（区别吕布新手入场）
local State = require("app.fight.states.State")
local StateGoldShow = class("StateGoldShow", State)

--
function StateGoldShow:ctor(entity, time)
    StateGoldShow.super.ctor(self, entity)
    self._playTime = 0
    self._bShowName = false
    self._time = time
end

--
function StateGoldShow:start()
    StateGoldShow.super.start(self)
    self._entity._actor:setVisible(true)
    self._entity:showShadow(true)
    self._playTime = 0
    self._entity:setAction("coming", false)
end

--
function StateGoldShow:update(f)
    if not self:isStart() then 
        return 
    end
    if self._playTime >= self._time then
       
        self:onFinish()
    end
    self._playTime = self._playTime + f
end

--
function StateGoldShow:onFinish()
    -- self._entity.signalStartCG:dispatch("enterStage")
    StateGoldShow.super.onFinish(self)
end

return StateGoldShow