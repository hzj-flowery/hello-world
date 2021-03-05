local Loop = require("app.fight.loop.Loop")
local LoopWave = class("LoopWave", Loop)

local Engine = require("app.fight.Engine")
local BuffManager = require("app.fight.BuffManager")
local HeroSkillEffect = require("app.config.hero_skill_effect")
local FightConfig = require("app.fight.Config")
local FightSignalConst = require("app.fight.FightSignalConst")
local FightSignalManager = require("app.fight.FightSignalManager")

--
function LoopWave:ctor(data)
    LoopWave.super.ctor(self)

    self._data = data
    self._rounds = data:getRounds()
    self._index = 1
    self._round = nil
    self._unitCount = 0
    self._signals = {}
    self._enterList = data:getEnterStage() --后入场的
    self._stageUnitCount = #data:getFirstEnter() --原来在场地里面的
    self._checkEndIdle = false
    --
    self._unitCount = #data:getUnits()

    self._petCount = #data:getPets()
    for unit in Engine.getEngine():foreachUnit() do
        local signal = unit.signalStartCG:add(handler(self, self._onPetEnter))
        table.insert(self._signals, signal)
    end
    for pet in Engine.getEngine():foreachPet() do
        local signal = pet.signalStartCG:add(handler(self, self._onPetEnter))
        table.insert(self._signals, signal)
    end

    self._readyCount = 0
    self.selfIndex = 0

    self._initBuff = data:getInitBuff()
    for i, data in pairs(self._initBuff) do
        data.buffConfig = HeroSkillEffect.get(data.configId)
        BuffManager.getBuffManager():addAddBuff(data)
    end

    self._petsBuff = data:getPetsBuff()
    for i, data in pairs(self._petsBuff) do
        data.buffConfig = HeroSkillEffect.get(data.configId)
        BuffManager.getBuffManager():addPetsBuff(data)
    end

    self._isFirstEnter = false --是否已经第一次进入
    self._enterTime = 0 --进入后计时
    self._startEnter = false --开始进入
    self._waitTime = 0 --等待下一个入场的时间
    self._enterIndex = 0 --进入了几个人

    self._historyCount = 0
    self._hisEndCount = 0
    -- self._hisBuffs = {}
end

--
function LoopWave:start()
    -- if 1 then
    -- 	return
    -- end
    LoopWave.super.start(self)
    for unit in Engine.getEngine():foreachUnit() do
        unit:enterFightStage()
        if not self._startEnter then
            self:startEnter()
        end
    end
    if not FightConfig.NEED_PET_SHOW then
        Engine.getEngine():petsEnter()
    end
    self._index = 1
    self._round = nil
end

--
function LoopWave:checkRound()
    if self._round == nil then
        self._round = require("app.fight.loop.LoopRound").new(self._rounds[self._index])
        if self._index ~= 1 then --第一轮放到杀之后去
            Engine.getEngine():checkMonsterTalk()
        end
    end
end

--
function LoopWave:update(f)
    if self._index > #self._rounds then
        if self:checkUnitIdle() then
            self._finish = true
        else
            if not self._checkEndIdle then
                Engine.getEngine():makeUnitIdle()
                self._checkEndIdle = true
            end
        end
    else
        self:checkRound()
        if self._round then
            if not self._round:isStart() then
                -- self
                -- self:_checkRoundStart(handler(self, self._startRound))
                self._round:start()
            else
                self._round:update(f)
                if self._round:isFinish() then
                    self._round:onFinish()
                    self._round = nil
                    self._index = self._index + 1
                end
            end
        end
    end
    if self._startEnter then
        if self._enterTime >= self._waitTime then
            self:_unitJumpIn()
            self._enterTime = 0
        end
        self._enterTime = self._enterTime + f
    end
end

function LoopWave:_startRound()
    if self._round then
        self._round:start()
    end
end

function LoopWave:_checkRoundStart(callback)
    if callback then
        self._callback = callback
    end
    local buffs = BuffManager.getBuffManager():checkHisBuff(BuffManager.HIS_BEFORE_FIGHT)
    self._historyCount = 0
    self._hisEndCount = 0

    if not buffs then
        if self._callback then
            self._callback()
            return
        end
    end

    for _, v in pairs(buffs) do
        v:playBuff(handler(self, self._playBuffCallback))
        self._historyCount = self._historyCount + 1
    end
    local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_PURPLE_HISTORICAL_HERO_FIGHT)

    -- local buff1, buff2 = BuffManager.getBuffManager():checkNextHistoryBuff(BuffManager.HIS_BEFORE_FIGHT)
    -- self._historyCount = 0
    -- self._hisEndCount = 0
    -- if not buff1 and not buff2 then
    --     if self._callback then
    --         self._callback()
    --         return
    --     end
    -- end
    -- if buff1 then
    --     buff1:playBuff(handler(self, self._playBuffCallback))
    --     self._historyCount = self._historyCount + 1
    -- end
    -- if buff2 then
    --     buff2:playBuff(handler(self, self._playBuffCallback))
    --     self._historyCount = self._historyCount + 1
    -- end
    -- if self._hisBuffs[1] then
    --     self._hisBuffs[1]:clear()
    --     self._hisBuffs[1] = nil
    -- end
    -- if self._hisBuffs[2] then
    --     self._hisBuffs[2]:clear()
    --     self._hisBuffs[2] = nil
    -- end
    -- self._hisBuffs = {}
    -- self._hisBuffs[1] = buff1
    -- self._hisBuffs[2] = buff2
end

function LoopWave:_playBuffCallback()
    self._hisEndCount = self._hisEndCount + 1
    if self._hisEndCount == self._historyCount then
        if self._callback then 
            self._callback()
        end
    end
end

function LoopWave:getLoopRound()
    return self._round
end

function LoopWave:_dispatchStart()
    local signal = FightSignalConst.SIGNAL_START_WAVE
    FightSignalManager.getFightSignalManager():dispatchSignal(signal, self.selfIndex)
end

function LoopWave:_onPetEnter(event)
    self._readyCount = self._readyCount + 1
    if self._readyCount == self._unitCount + self._petCount then
        self:_checkRoundStart(handler(self, self._dispatchStart))
    elseif FightConfig.NEED_PET_SHOW and self._readyCount == self._unitCount then
        Engine.getEngine():petsEnter()
    end
end

function LoopWave:_onStartCG(event)
    self._readyCount = self._readyCount + 1
    if self._readyCount == self._unitCount + self._petCount then
        self:_dispatchStart()
    end
end

function LoopWave:startEnter()
    -- self:_unitJumpIn()
    self._startEnter = true
    self._enterTime = 0
    self._waitTime = FightConfig.FIRST_FIRST_TIME[1]
end

function LoopWave:_unitJumpIn()
    if #self._enterList == 0 then
        self._startEnter = false
        return
    end
    local enterUnit = self._enterList[1]
    for _, stageId in pairs(enterUnit) do
        self._stageUnitCount = self._stageUnitCount + 1
        local unit = Engine.getEngine():getUnitById(stageId)
        if unit.stageID == FightConfig.FIRST_SHOW_STAGEID then
            unit.needOpenShow = true
        end
        unit:JumpIntoStage()
    end
    table.remove(self._enterList, 1)
    if #self._enterList ~= 0 then
        self._enterIndex = self._enterIndex + 1
        self._waitTime = FightConfig.FIRST_FIRST_TIME[self._enterIndex]
    end
end

function LoopWave:clear()
    self._round:clear()
    self._round:onFinish()
    self._round = nil
end

return LoopWave
