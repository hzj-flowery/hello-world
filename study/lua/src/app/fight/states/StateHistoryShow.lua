local State = require("app.fight.states.State")
local StateHistoryShow = class("StateHistoryShow", State)

local BuffManager = require("app.fight.BuffManager")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")


function StateHistoryShow:ctor(entity, checkTime, checkId)
    self._checkTime = checkTime
    self._showCount = 0
    self._checkId = checkId
    StateHistoryShow.super.ctor(self, entity)
end

function StateHistoryShow:start()
    StateHistoryShow.super.start(self)
    self:_checkHistoryBuff()
end

function StateHistoryShow:_checkHistoryBuff()
    -- local buff1, buff2 = BuffManager.getBuffManager():checkNextHistoryBuff(self._checkTime)
    local buffs = nil
    if self._checkId then
        buffs = BuffManager.getBuffManager():checkHisBuff(self._checkTime, self._entity.stageID)
    else
        buffs = BuffManager.getBuffManager():checkHisBuff(self._checkTime)
    end

    if not buffs then
        self:onFinish()
        return
    end
    self._endCount = 0
    for _, v in pairs(buffs) do 
    -- local buff = buffs[1]       --改成每个人带一个buff，所以取数组头一个
        v:playBuff(handler(self, self._playBuffCallback))
        self._showCount = self._showCount + 1
    end
end

function StateHistoryShow:_playBuffCallback()
    self._endCount = self._endCount + 1
    if self._endCount == self._showCount then
        self:onFinish()
    end
end

function StateHistoryShow:onFinish()
    FightSignalManager.getFightSignalManager():dispatchSignal(FightSignalConst.SIGNAL_ROUND_BUFF_CHECK)
    StateHistoryShow.super.onFinish(self)
end 


return StateHistoryShow
