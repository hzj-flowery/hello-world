-- local HistoryBuffShow = class("HistoryBuffShow")

-- local FightSignalConst = require("app.fight.FightSignalConst")
-- local FightSignalManager = require("app.fight.FightSignalManager")

-- local BuffManager = require("app.fight.BuffManager")



-- function HistoryBuffShow:ctor(stageId)
--     self._stageId = stageId
-- end

-- function HistoryBuffShow:start()
--     local fightSignalManager = FightSignalManager.getFightSignalManager()
--     self._listenerSignal = fightSignalManager:addListenerHandler(handler(self, self._onSignalEvent))
-- end


-- function HistoryBuffShow:_onFinish()
--     self._listenerSignal:remove()
--     self._listenerSignal = nil
-- end

-- function LoopAttackBase:_onSignalEvent(event, stageId)
--     if self._stageId ~= stageId then 
--         return
--     end
--     if event == FightSignalConst.SIGNAL_HISTORY_SHOW_END then
--         self:_onFinish()
--     elseif event == FightSignalConst.SIGNAL_HISTORY_BUFF then
--         BuffManager.getBuffManager():doHistoryBuffs()
--     end

-- end



-- return HistoryBuffShow