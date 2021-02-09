local BaseData = require("app.data.BaseData")
local CommonConst = require("app.const.CommonConst")
local ChapterData = class("ChapterData", BaseData)
local ChapterConst = require("app.const.ChapterConst")
local Parameter = require("app.config.parameter")
local ParameterIDConst = require("app.const.ParameterIDConst")

local schema = {}
schema["total_star"] = {"number", 0}
schema["total_e_star"] = {"number", 0}
schema["chapters"] = {"table", {}}
schema["e_chapters"] = {"table", {}}
schema["f_chapters"] = {"table", {}}
schema["generals"] = {"table", {}}
schema["hero_chapter_challenge_count"] = {"number", 0}
schema["showBossPage"] = {"boolean", false}
schema["resList"] = {"table", {}}
ChapterData.schema = schema

function ChapterData:ctor(properties)
    self._lastCheckBossTime = nil
    ChapterData.super.ctor(self, properties)
    self._stageListData = {}
    self:_initStageData()
    self:_createChapterData()
	self._listenerChapterData = G_NetworkManager:add(MessageIDConst.ID_S2C_GetChapterList, handler(self, self._s2cGetChapterList))
    self._listenerActDailyBoss = G_NetworkManager:add(MessageIDConst.ID_S2C_GetActDailyBoss, handler(self, self._s2cGetActDailyBoss))
    self._listenerStarBox = G_NetworkManager:add(MessageIDConst.ID_S2C_FinishChapterBoxRwd, handler(self, self._s2cFinishChapterBoxRwd))
    self._listenerEnterStage = G_NetworkManager:add(MessageIDConst.ID_S2C_FirstEnterChapter, handler(self, self._s2cFirstEnterChapter))
    self._listenerStageBox = G_NetworkManager:add(MessageIDConst.ID_S2C_ReceiveStageBox, handler(self, self._s2cReceiveStageBox))
    self._listenerBossFight = G_NetworkManager:add(MessageIDConst.ID_S2C_ActDailyBoss, handler(self, self._s2cActDailyBoss))
    self._listenerGetAllAward = G_NetworkManager:add(MessageIDConst.ID_S2C_GetAllAwardBox, handler(self, self._s2cGetAllAwardBox))
    self._listenerChallengeFamous = G_NetworkManager:add(MessageIDConst.ID_S2C_ChallengeHeroChapter, handler(self, self._s2cChallengeHeroChapter))

end

function ChapterData:clear()
	self._listenerChapterData:remove()
	self._listenerChapterData = nil
    self._listenerActDailyBoss:remove()
    self._listenerActDailyBoss = nil
    self._listenerStarBox:remove()
    self._listenerStarBox = nil
    self._listenerEnterStage:remove()
    self._listenerEnterStage = nil
    self._listenerStageBox:remove()
    self._listenerStageBox = nil
    self._listenerBossFight:remove()
    self._listenerBossFight = nil
    self._listenerGetAllAward:remove()
    self._listenerGetAllAward = nil
    self._listenerChallengeFamous:remove()
    self._listenerChallengeFamous = nil
end

function ChapterData:reset()
end

--根据表新建chapter
function ChapterData:_createChapterData()
    local StoryChapter = require("app.config.story_chapter")

    local chapters = {}     --普通副本
    local chapterData = StoryChapter.indexOf(1) --第一关
    local firstChapter = self:_createSingleData(chapterData)
    table.insert(chapters, firstChapter)
    while chapterData.next_chapter_id ~= 0 do
        local nextChapterId = chapterData.next_chapter_id
        local configData = StoryChapter.get(nextChapterId)
        local chapter = self:_createSingleData(configData)
        table.insert(chapters, chapter)
        chapterData = configData
    end
    self:setChapters(chapters)

    local eChapters = {}    --精英副本
    local eliteData = nil
    local famousData = nil
    local countChapter = StoryChapter.length()
    for i = 1 ,countChapter do
        local data = StoryChapter.indexOf(i)
        if data.type == ChapterConst.CHAPTER_TYPE_ELITE and not eliteData then
            eliteData = data        --精英副本第一关
        elseif data.type == ChapterConst.CHAPTER_TYPE_FAMOUS and not famousData then
            famousData = data       --名将本第一章
        end
    end
    local firstEChapter = self:_createSingleData(eliteData)
    table.insert(eChapters, firstEChapter)
    while eliteData.next_chapter_id ~= 0 do
        local nextChapterId = eliteData.next_chapter_id
        local configData = StoryChapter.get(nextChapterId)
        local chapter = self:_createSingleData(configData)
        table.insert(eChapters, chapter)
        eliteData = configData
    end
    self:setE_chapters(eChapters)

    local fChapters = {}    --名将副本
    local firstFChapter = self:_createSingleData(famousData)
    table.insert(fChapters, firstFChapter)
    while famousData.next_chapter_id ~= 0 do
        local nextChapterId = famousData.next_chapter_id
        local configData = StoryChapter.get(nextChapterId)
        local chapter = self:_createSingleData(configData)
        table.insert(fChapters, chapter)
        famousData = configData
    end    
    self:setF_chapters(fChapters)

    local StoryGeneralPlan = require("app.config.story_general_plan")
    local generals = {}     --名将副本帐篷
    for i = 1, StoryGeneralPlan.length() do
        local configData = StoryGeneralPlan.indexOf(i)
        local general = self:_createGeneralData(configData)
        table.insert(generals, general)
    end
    self:setGenerals(generals)
end

--创建名将副本的帐篷
function ChapterData:_createGeneralData(configData)
    local ChapterGeneralData = require("app.data.ChapterGeneralData")
    local generalData = ChapterGeneralData.new()
    generalData:setConfigData(configData)
    generalData:setId(configData.id)
    return generalData
end

function ChapterData:_initStageData()
    self._stageListData = {}
    local StoryStage = require("app.config.story_stage")
    local countStage = StoryStage.length()
    for i = 1, countStage do 
        local stageData = StoryStage.indexOf(i)
        if not self._stageListData[stageData.chapter_id] then 
            self._stageListData[stageData.chapter_id] = {}
        end
        table.insert(self._stageListData[stageData.chapter_id], stageData.id)
    end
end

function ChapterData:_createSingleData(configData)
    local ChapterBaseData = require("app.data.ChapterBaseData")
    local chapter = ChapterBaseData.new()
    chapter:setConfigData(configData)
    chapter:setId(configData.id)   

    local stageIdList = self._stageListData[configData.id]
    table.sort(stageIdList, function(a, b) return a < b end)
    chapter:setStageIdList(stageIdList)

    local resList = self:getResList()
    local newRes = true
    for i, v in pairs(resList) do 
        if v == configData.island_eff then 
            newRes = false
        end
    end
    if newRes then 
        table.insert(resList, configData.island_eff)
        self:setResList(resList)
    end

    return chapter
end

-- --创建单个数据
-- function ChapterData:_createSingleData(configData)
--     local ChapterBaseData = require("app.data.ChapterBaseData")
--     local chapter = ChapterBaseData.new()
--     chapter:setConfigData(configData)
--     chapter:setId(configData.id)
    
--     local StoryStage = require("app.config.story_stage")
--     local countStage = StoryStage.length()
--     local stageIdList = {}
--     for i = 1, countStage do
--         local stageData = StoryStage.indexOf(i)
--         if stageData.chapter_id == configData.id then
--             table.insert(stageIdList, stageData.id)
--         end
--     end
--     table.sort(stageIdList, function(a, b) return a < b end)
--     chapter:setStageIdList(stageIdList)

--     local resList = self:getResList()
--     local newRes = true
--     for i, v in pairs(resList) do 
--         if v == configData.island_eff then 
--             newRes = false
--         end
--     end
--     if newRes then 
--         table.insert(resList, configData.island_eff)
--         self:setResList(resList)
--     end

--     return chapter
-- end

--获取data
function ChapterData:getChapterByTypeId(type, id)
    local chapterList = nil
    if type == ChapterConst.CHAPTER_TYPE_NORMAL  then
        chapterList = self:getChapters()
    elseif type == ChapterConst.CHAPTER_TYPE_ELITE  then
        chapterList = self:getE_chapters()
    elseif type == ChapterConst.CHAPTER_TYPE_FAMOUS then
        chapterList = self:getF_chapters()
    end
    if not chapterList then
        return nil
    end
    for i, v in pairs(chapterList) do
        if v:getId() == id then
            return v
        end
    end
end

--获取全局数据
function ChapterData:getGlobalChapterById(chapterId)
    local chapter = self:getChapterDataById(chapterId)
    if not chapter then
        chapter = self:getEChapterDataById(chapterId)
    end
    if not chapter then
        chapter = self:getFChapterDataById(chapterId)
    end
    assert(chapter, "enter wrong chapter id = "..chapterId)
    return chapter
end

--获取普通本data
function ChapterData:getChapterDataById(id)
    local chapterList = self:getChapters()
    for i, v in pairs(chapterList) do
        if v:getId() == id then
            return v
        end
    end
end

--获取精英本data
function ChapterData:getEChapterDataById(id)
    local eChapterList = self:getE_chapters()
    for i, v in pairs(eChapterList) do
        if v:getId() == id then
            return v
        end
    end
end

--获得名将本data
function ChapterData:getFChapterDataById(id)
    local fChapterList = self:getF_chapters()
    for i, v in pairs(fChapterList) do
        if v:getId() ==  id then
            return v
        end
    end
end

--刷新副本信息
function ChapterData:c2sGetChapterList()
    --if self:isExpired() then
        G_NetworkManager:send(MessageIDConst.ID_C2S_GetChapterList, {})
   -- end
end

--接受副本信息
function ChapterData:_s2cGetChapterList(id, message)
    if message.ret ~= 1 then
        return
    end
    -- self:setTotal_star(message.total_star)
    -- self:setTotal_e_star(message.total_e_star)

    self:resetTime()

    if rawget(message, "chapters") then
        for _, data in pairs(message.chapters) do
            local chapter = self:getChapterDataById(data.id)
            chapter:updateData(data)
            G_UserData:getStage():updateStageByList(data.stages)
        end
    end

    if rawget(message, "e_chapters") then
        for _, data in pairs(message.e_chapters) do
            local chapter = self:getEChapterDataById(data.id)
            chapter:updateData(data)
            G_UserData:getStage():updateStageByList(data.stages)
        end
    end

    if rawget(message, "hero_chapters") then
        for _, data in pairs(message.hero_chapters) do
            local chapter = self:getFChapterDataById(data.id)
            chapter:updateData(data)
            G_UserData:getStage():updateStageByList(data.stages)
        end
    end

	if rawget(message, "chapter_box_ids") then
		G_UserData:getChapterBox():updateData(message.chapter_box_ids)
    end
    
    if rawget(message, "hero_chapter_ids") then
        for _, id in pairs(message.hero_chapter_ids) do
            local generalData = self:getGeneralById(id)
            generalData:setPass(true)
        end
    end
    dump(message.first_kill)
    if rawget(message, "first_kill") then 
        dump(message.first_kill)
        for _, killData in pairs(message.first_kill) do 
            local stageData = G_UserData:getStage():getStageById(killData.id)
            stageData:setKiller(killData.name)
            stageData:setKillerId(killData.user_id)
        end
    end

    self:setHero_chapter_challenge_count(message.hero_chapter_challenge_count)
    
    G_SignalManager:dispatch(SignalConst.EVENT_CHAPTER_INFO_GET)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_NEW_STAGE)
end

--处理进入副本信息
function ChapterData:_enterChapter(chapterId)
    local chapter = self:getGlobalChapterById(chapterId)
    chapter:setHas_entered(true)
end

--刷新章节宝箱信息
function ChapterData:_refreshStarBox(chapterId, boxType)
    local chapter = self:getGlobalChapterById(chapterId)
    if chapter then
        if boxType == CommonConst.BOX_TYPE_COPPER then
            chapter:setBreward(1)
        elseif boxType == CommonConst.BOX_TYPE_SILVER then
            chapter:setSreward(1)
        elseif boxType == CommonConst.BOX_TYPE_GOLD then
            chapter:setGreward(1)
		elseif boxType == CommonConst.BOX_TYPE_PASS then
            chapter:setPreward(1)
        end
    end
end

--判断下一章节是否开放
function ChapterData:_getNextOpenChapter(chapterData)
    local nextId = chapterData:getConfigData().next_chapter_id
    if nextId ~= 0 then
        local chapter = self:getGlobalChapterById(nextId)
        if chapter:isHas_entered() then
            return chapter
        elseif chapterData:isLastStagePass() then
            return chapter
        end
    end
    return nil
end

--获得开放章节
function ChapterData:getOpenChapter(type)
    local chapterList = nil
    if type == ChapterConst.CHAPTER_TYPE_NORMAL then
        chapterList = self:getChapters()
    elseif type == ChapterConst.CHAPTER_TYPE_ELITE then
        chapterList = self:getE_chapters()
    elseif type == ChapterConst.CHAPTER_TYPE_FAMOUS then
        chapterList = self:getF_chapters()
    end

    local chapterDataList = {}
    local chapter = chapterList[1]
    while chapter do
        table.insert(chapterDataList, chapter)
        chapter = self:_getNextOpenChapter(chapter)
    end
    return chapterDataList
end



--得到开放的最后章节
function ChapterData:getLastOpenChapterId()
    local list = self:getOpenChapter(1)
    return list[#list]:getId()
end

--获得下n章的信息
function ChapterData:getNextChapter(type, chapter, count)
    local nowChapter = chapter
    local nextChapterList = {}
    local index = 0
    while index < count do
        local nextId = nowChapter:getConfigData().next_chapter_id
        if nextId == 0 then
            return nextChapterList
        end
        local chapterData = self:getChapterByTypeId(type, nextId)
        local structNext = {before = nowChapter, now = chapterData}
        table.insert(nextChapterList, structNext)
        nowChapter = chapterData
        index = index + 1
    end
    return nextChapterList
end

--章节boss
function ChapterData:_s2cGetActDailyBoss(id, message)
    if message.ret ~= 1 then
        return
    end
    local time = G_ServerTime:getTime()
    if not self._lastCheckBossTime then
        self:setShowBossPage(true)
        self._lastCheckBossTime = G_ServerTime:secondsFromToday(time)
    else
        local nowSec = G_ServerTime:secondsFromToday(time)
        local Parameter = require("app.config.parameter")
        local ParameterIDConst = require("app.const.ParameterIDConst")
        local configBossInfo = Parameter.get(ParameterIDConst.DAILY_BOSS_TIME)
        assert(configBossInfo, "bossTime is nil")
        local bossTime = configBossInfo.content
        local bossSecs = string.split(bossTime,"|")       
        for i, v in pairs(bossSecs) do
            local secondToday = tonumber(v) * 3600
            if self._lastCheckBossTime < secondToday and secondToday < nowSec then
                self._lastCheckBossTime = nowSec
                self:setShowBossPage(true)
                break
            end
        end
    end

    local eChapterList = self:getE_chapters()
    for i, v in pairs(eChapterList) do
        v:setBossId(0)
        v:setBossState(0)
    end

    if rawget(message, "boss_state") then
        for i, v in pairs(message.boss_state) do
            local chapter = self:getEChapterDataById(v.chapter_id)
            chapter:setBossId(v.boss_id)
            chapter:setBossState(v.boss_state)
        end
    end
    G_SignalManager:dispatch(SignalConst.EVENT_ACTIVITY_DAILY_BOSS)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CHAPTER_BOSS)
end

--获取章节boss信息
function ChapterData:getBossChapters()
    local list = self:getE_chapters()
    local bossChapters = {}
    for i, v in pairs(list) do
        if v:getBossId() ~= 0 then
            table.insert(bossChapters, v)
        end
    end
    return bossChapters
end

--有没有活着的boss
function ChapterData:isAliveBoss()
    local bossChapters = self:getBossChapters()
    for i, v in pairs(bossChapters) do
        if v:getBossState() == 0 then
            return true
        end
    end
    return false
end

--击败章节boss
function ChapterData:defeatBoss(chapterId)
    local chapter = self:getEChapterDataById(chapterId)
    chapter:setBossState(1)
end

--发送获得精英boss消息
function ChapterData:c2sGetActDailyBoss()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetActDailyBoss, {})
end

function ChapterData:pullData()
    self:c2sGetChapterList()
    self:c2sGetActDailyBoss()
end

--开启章节宝箱
function ChapterData:c2sFinishChapterBoxRwd(chapterId, boxId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_FinishChapterBoxRwd,
        {
            ch_id = chapterId,
            box_type = boxId,
        }
    )
end

--获得章节宝箱
function ChapterData:_s2cFinishChapterBoxRwd(id, message)
    if message.ret ~= 1 then
        return
    else
        local id = message.ch_id
        local boxType = message.box_type
        self:_refreshStarBox(id, boxType)
        local rewards = {}
        for _, v in pairs(message.awards) do
            local reward =
            {
                type = v.type,
                value = v.value,
                size = v.size,
            }
            table.insert(rewards, reward)
        end
        G_SignalManager:dispatch(SignalConst.EVENT_CHAPTER_BOX, rewards, boxType)
        G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_NEW_STAGE)
    end
end

--发送进入消息
function ChapterData:c2sFirstEnterChapter(chapterId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_FirstEnterChapter,
        {
            ch_id = chapterId,
        }
    )
end

--收到进入消息
function ChapterData:_s2cFirstEnterChapter(id, message)
    if message.ret ~= 1 then
        return
    else
        local id = message.ch_id
        self:_enterChapter(id)

        G_SignalManager:dispatch(SignalConst.EVENT_CHAPTER_ENTER_STAGE, id)
        if rawget(message, "first_kill") then 
            for _, killData in pairs(message.first_kill) do 
                local stageData = G_UserData:getStage():getStageById(killData.id)
                stageData:setKiller(killData.name)
                stageData:setKillerId(killData.user_id)
            end
        end
    end
end

--发送关卡宝箱
function ChapterData:c2sReceiveStageBox(stageId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ReceiveStageBox,
        {
            stage_id = stageId,
        }
    )
end

--收到关卡宝箱
function ChapterData:_s2cReceiveStageBox(id, message)
    if message.ret ~= 1 then
        return
    else
        local stageId = message.stage_id
        G_UserData:getStage():recvStageBox(stageId)
        G_SignalManager:dispatch(SignalConst.EVENT_CHAPTER_STAGE_BOX, stageId)
        G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE,FunctionConst.FUNC_NEW_STAGE)
    end
end

function ChapterData:hasRedPoint()
    local normalExplore = self:hasRedPointForExplore(ChapterConst.CHAPTER_TYPE_NORMAL)
    local eliteExplore = self:hasRedPointForExplore(ChapterConst.CHAPTER_TYPE_ELITE)
    local famousExplore = self:hasRedPointForExplore(ChapterConst.CHAPTER_TYPE_FAMOUS)
    return normalExplore or eliteExplore or famousExplore
end



function ChapterData:hasRedPointForExplore(type)
    if type == ChapterConst.CHAPTER_TYPE_FAMOUS then 
        local LogicCheckHelper = require("app.utils.LogicCheckHelper")
        local FunctionConst	= require("app.const.FunctionConst")
        local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_FAMOUS_CHAPTER)
        if not isOpen then
            return false
        end
        local leftCount = self:getFamousLeftCount()
        if leftCount > 0 then
            return true
        end
    end

    local list = self:getChapterListByType(type)
    if not list then
        return false
    end
    for k,v in ipairs(list) do
        local redPoint = self:hasRedPointForChapter(v:getId())
        if redPoint then
            return true
        end
    end
	--主线副本 章节宝箱是否可以领取
	if type == ChapterConst.CHAPTER_TYPE_NORMAL then
		return G_UserData:getChapterBox():isCurBoxAwardsCanGet()
    end

    --精英副本，强敌来袭
    if type == ChapterConst.CHAPTER_TYPE_ELITE  then
        local chapterData = G_UserData:getChapter()
        local bossChapters = chapterData:getBossChapters()
        local hasAliveBoss = false
        for i, v in pairs(bossChapters) do
            if v:getBossState() == 0 then
                hasAliveBoss = true
                break
            end
        end
        if hasAliveBoss then
            return true
        end
    end
    
    return false
end


function ChapterData:getChapterListByType(type)
    local chapterList = nil
    if type == ChapterConst.CHAPTER_TYPE_NORMAL  then
        chapterList = self:getChapters()
    elseif type == ChapterConst.CHAPTER_TYPE_ELITE  then
        chapterList = self:getE_chapters()
    elseif type == ChapterConst.CHAPTER_TYPE_FAMOUS then
        chapterList = self:getF_chapters()
    end

    return chapterList
end


function ChapterData:hasRedPointForChapter(chapterId)
    local chapter = self:getGlobalChapterById(chapterId)
    if not chapter:isHas_entered() then
        return false
    end

    local redPoint01 = chapter:canGetStageBoxReward()
    local redPoint02 = chapter:canGetStarBox()
    return  redPoint01 or redPoint02
end

--
function ChapterData:c2sActDailyBoss(chapterId, bossId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ActDailyBoss,
        {
            chapter_id = chapterId,
            boss_id = bossId,
        })
end

--
function ChapterData:_s2cActDailyBoss(id, message)
    if message.ret ~= 1 then
        return
    end
    G_SignalManager:dispatch(SignalConst.EVENT_DAILY_BOSS_FIGNT, message)
end

--
function ChapterData:c2sGetAllAwardBox(chapterId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetAllAwardBox,
    {
        chapter_id = chapterId,
    })
end

--
function ChapterData:_s2cGetAllAwardBox(id, message)
    if message.ret ~= 1 then
        return
    end
    local chapterBaseData = self:getGlobalChapterById(message.chapter_id)
    for _, boxType in pairs(message.box_type) do  --1.铜，2.银，3.金
        if boxType == CommonConst.BOX_TYPE_COPPER then
            chapterBaseData:setBreward(1)
        elseif boxType == CommonConst.BOX_TYPE_SILVER then
            chapterBaseData:setSreward(1)
        elseif boxType == CommonConst.BOX_TYPE_GOLD then
            chapterBaseData:setGreward(1)
		elseif boxType == CommonConst.BOX_TYPE_PASS then
			chapterBaseData:setPreward(1)
        end
    end
    for i, v in pairs(message.stage_ids) do
        local stageData = G_UserData:getStage():getStageById(v)
        stageData:setReceive_box(true)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_GET_ALL_BOX, message.awards)
end

function ChapterData:c2sChallengeHeroChapter(stageId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ChallengeHeroChapter,
    {
        stage_id = stageId,
    })
end

function ChapterData:_s2cChallengeHeroChapter(id, message)
    if message.ret ~= 1 then
        return 
    end
    if message.win then
        local generalData = self:getGeneralById(message.stage_id)
        generalData:setPass(true)
    end
    G_SignalManager:dispatch(SignalConst.EVENT_CHALLENGE_HERO_GENERAL, message)
end

function ChapterData:getGeneralById(stageId)
    local generals = self:getGenerals()
    for i, v in pairs(generals) do
        if v:getId() == stageId then
            return v
        end
    end
end

function ChapterData:getOpenGeneralIds()
    local generalList = self:getGenerals()
    local openChapter = self:getOpenChapter(ChapterConst.CHAPTER_TYPE_FAMOUS)
    local openGenerals = {}
    for _, data in pairs(generalList) do
        local configData = data:getConfigData()
        local chapter = self:getChapterByTypeId( ChapterConst.CHAPTER_TYPE_FAMOUS, configData.need_chapter)
        if chapter:isLastStagePass() then
            table.insert(openGenerals, data)
        end
    end
    if #openGenerals > 3 then
        for i = #openGenerals-3, 1, -1 do 
            if openGenerals[i]:isPass() then 
                table.remove( openGenerals, i)
            end
        end
    end
    return openGenerals
end

function ChapterData:getFamousLeftCount()
    local famousCount = tonumber(Parameter.get(ParameterIDConst.FAMOUS_MAX_COUNT).content)
    local nowCount = self:getHero_chapter_challenge_count()
    return famousCount - nowCount
end

function ChapterData:getChapterTotalStarNum(type)
    local list = self:getChapterListByType(type)
    if not list then
        return 0
    end
    local totalStarNum = 0
    for k,v in pairs(list) do
        local isFinish, getStar, totalStar = v:getChapterFinishState()
        totalStarNum = totalStarNum + getStar
    end
    return totalStarNum
end

--获取精英副本星数 
--TO DO 康康实现
function ChapterData:getElitePassCount( ... )
    -- body
    return self:getChapterTotalStarNum(ChapterConst.CHAPTER_TYPE_ELITE)
end

--获取名将副本星数
function ChapterData:getFamousPassCount( ... )
    -- body
    return self:getChapterTotalStarNum(ChapterConst.CHAPTER_TYPE_FAMOUS)
end

return ChapterData
