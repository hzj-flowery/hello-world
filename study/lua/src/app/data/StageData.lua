local BaseData = require("app.data.BaseData")
local StageData = class("StageData", BaseData)

local StageBaseData = require("app.data.StageBaseData")
local StoryStage = require("app.config.story_stage")

local ChapterConst = require("app.const.ChapterConst")

local schema = {}
schema["stages"] = {"table", {}}
schema["nowFightStage"] = {"number", 0}
StageData.schema = schema

function StageData:ctor(properties)
    StageData.super.ctor(self, properties)
    self:_createStageData()
    self._rebel = nil   --未处理的最后一个叛军
    self._recvFirstKill = G_NetworkManager:add(MessageIDConst.ID_S2C_GetFirstKill, handler(self, self._s2cGetFirstKill))
    self._recvNewFirstKill = G_NetworkManager:add(MessageIDConst.ID_S2C_NewFirstKill, handler(self, self._s2cNewFirstKill))
    self._listenerExecuteStage = G_NetworkManager:add(MessageIDConst.ID_S2C_ExecuteStage, handler(self, self._s2cExecuteStage))
    self._listenerFastExecute = G_NetworkManager:add(MessageIDConst.ID_S2C_FastExecuteStage, handler(self, self._s2cFastExecuteStage))
    self._listenerReset = G_NetworkManager:add(MessageIDConst.ID_S2C_ResetStage, handler(self, self._s2cResetStage))
end

function StageData:clear()
    self._recvFirstKill:remove()
	self._recvFirstKill = nil
    self._recvNewFirstKill:remove()
	self._recvNewFirstKill = nil	
    self._listenerExecuteStage:remove()
    self._listenerExecuteStage = nil
    self._listenerFastExecute:remove()
    self._listenerFastExecute = nil
    self._listenerReset:remove()
    self._listenerReset = nil
    self._rebel = nil 
end

function StageData:reset()
	
end

--根据id获取stage
function StageData:getStageById(stageId)
    local stageList = self:getStages()
    assert(stageList[stageId], "quary wrong stage id "..stageId)
    return stageList[stageId]
end

--根据表格信息，新建stage
function StageData:_createStageData()
    local stageList = {}
    local stageCount = StoryStage.length()
    for i = 1, stageCount do
        local stageData = StoryStage.indexOf(i)
        local stage = StageBaseData.new()
        stage:setId(stageData.id)
        stage:setConfigData(stageData)
        stageList[stageData.id] = stage
    end
    self:setStages(stageList)
end

--刷新stage
function StageData:updateStageByList(list)
    for i, v in pairs(list) do
        self:updateStage(v)
    end
end

--跟新stageinfo
function StageData:updateStage(data)
    local stage = self:getStageById(data.id)    
    stage:updateData(data)
end

--获得box
function StageData:recvStageBox(stageId)
    local stage = self:getStageById(stageId)
    stage:setReceive_box(true)
end

function StageData:_s2cGetFirstKill(id, message)
    if rawget(message, "first_kill") then
        for _, killData in pairs(message.first_kill) do
            local stage = self:getStageById(killData.id)
            stage:setKiller(killData.name)
            stage:setKillerId(killData.user_id)
        end
    end
end

function StageData:_s2cNewFirstKill(id, message)
    local stage = self:getStageById(message.stage_id)
    stage:setKiller(message.first_kill_name)
    stage:setKillerId(message.user_id)
end

function StageData:getStarById(stageId)
    local stageData = self:getStageById(stageId)
    return stageData:getStar()
end

function StageData:isStageOpen(stageId)
    local stageData = self:getStageById(stageId)
    if stageData and stageData:isIs_finished() then
        return true
    end
    return false
end

function StageData:getStageCount(stageId)
    local stageData = self:getStageById(stageId)
    return stageData:getExecute_count(), stageData:getConfigData().challenge_num
end

--攻打副本
function StageData:c2sExecuteStage(stageId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ExecuteStage, 
        {
            stage_id = stageId,
        })
end

--执行副本消息
function StageData:_s2cExecuteStage(id, message)
    if message.ret ~= 1 then
        return
    end
    if rawget(message, "rebel_army_id") then
        local rebel = {
            id = message.rebel_army_id,
            level = message.rebel_army_level,
        }
        self._rebel = rebel
        G_SignalManager:dispatch(SignalConst.EVENT_TRIGGER_REBEL_ARMY)
    end
    local firstPass = false
    if rawget(message, "stage") then
        local stageId = message.stage_id
        local data = message.stage
        local oldData = self:getStageById(stageId)
        local oldPass = oldData:isIs_finished()
        if not oldPass and data.is_finished then
            firstPass = true
        end
        G_SignalManager:dispatch(SignalConst.EVENT_EXECUTE_STAGE, message, firstPass, stageId, message.is_win)
        self:updateStage(data)

        -- 战斗触发引导消息
        local messageTable = {
            battleReport = message.battle_report,
            battleId = message.stage_id,
            firstPass = firstPass,
        }
        G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_BATTLE_START, messageTable)
    end

    if message.is_win then
        local stageData = self:getStageById(message.stage_id)
        local chapterData = G_UserData:getChapter():getChapterByTypeId( ChapterConst.CHAPTER_TYPE_FAMOUS, stageData:getConfigData().chapter_id)
        if chapterData then
            local num = G_UserData:getChapter():getHero_chapter_challenge_count() + 1
            G_UserData:getChapter():setHero_chapter_challenge_count(num) 
        end
    end

    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_NEW_STAGE)
end

--扫荡副本
function StageData:c2sFastExecuteStage(stageId, count)
    G_NetworkManager:send(MessageIDConst.ID_C2S_FastExecuteStage, 
        {
            stage_id = stageId,
            count = count,
    })   
end

--获得奖励
local function getRewards(awards)
    local rewards = {}
    for _, award in pairs(awards) do
        local reward = {
            type = award.type,
            value = award.value,
            size = award.size,
        }
        table.insert(rewards, reward)
    end
    return rewards    
end

--暴击奖励
local function getAddReward(addAwards)
    local rewards = {}
    for _, val in pairs(addAwards) do
        local addReward = {}
        addReward.reward =
        {
            type = val.award.type,
            value = val.award.value,
            size = val.award.size,
        }
        addReward.index = val.index
        table.insert(rewards, addReward)
    end    
    return rewards
end

--扫荡消息
function StageData:_s2cFastExecuteStage(id, message)
    if message.ret ~= 1 then
        return
    end
    if rawget(message, "stage") ~= nil then
        self:updateStage(message.stage)
    end
    local sweepResults = {}
    local rebels = {}
    if rawget(message, "rewards") then
        for _, v in pairs (message.rewards) do
            local singleResult = {}
            singleResult.money = rawget(v, "stage_money") or 0
            singleResult.exp = rawget(v, "stage_exp") or 0
            singleResult.isDouble = rawget(v, "is_double") or false
            if rawget(v, "awards") then
                singleResult.rewards = getRewards(v.awards)
            end
            if rawget(v, "add_awards") then
                singleResult.addRewards = getAddReward(v.add_awards)
            end   
            table.insert(sweepResults, singleResult)

            if rawget(v, "rebel_army_id") then
                local rebel = {}
                rebel.id = v.rebel_army_id
                rebel.level = v.rebel_army_level
                self._rebel = rebel
                G_SignalManager:dispatch(SignalConst.EVENT_TRIGGER_REBEL_ARMY)
            end
        end
        G_SignalManager:dispatch(SignalConst.EVENT_FAST_EXECUTE_STAGE, sweepResults)
    end
end

--删除叛军信息
function StageData:resetRebel()
    self._rebel = nil
end

--获得是是否有新叛军
function StageData:getNewRebel()
    return self._rebel
end

--重置副本
function StageData:c2sResetStage(stageId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ResetStage, 
    {
        stage_id = stageId,
    })  
end

--重置消息处理
function StageData:_s2cResetStage(id, message)
    if message.ret ~= 1 then
        return
    end
    if rawget(message, "stage") then
        self:updateStage(message.stage)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_RESET_STAGE)
end

--是否是当前章节的最后一关
function StageData:isLastStage(stageId)
    local stageConfigData = self:getStageById(stageId):getConfigData()
    local nextId = stageConfigData.next_id
    if nextId == 0 then     --到底了，就是0
        return true
    end
    local nextStageConfigData = self:getStageById(nextId):getConfigData()
    if nextStageConfigData.chapter_id ~= stageConfigData.chapter_id then
        return true
    end
    return false
end

--获得章节信息
function StageData:getChapterData(stageId)
    local stageConfigData = self:getStageById(stageId):getConfigData()
    local chapterId = stageConfigData.chapter_id
    local chapterData = G_UserData:getChapter():getGlobalChapterById(chapterId)
    return chapterData
end

--是否需要弹出名将令
function StageData:needShowEnd()
    local stageId = self:getNowFightStage()
    if stageId == 0 then
        return false
    end
    local stageData = self:getStageById(stageId)
    if self:isLastStage(stageId) and not stageData:isLastIs_finished() then
        self:setNowFightStage(0)
        return true
    end
    return false
end


return StageData