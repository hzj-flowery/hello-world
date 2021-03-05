--阵营竞技数据
local BaseData = require("app.data.BaseData")
local CampRaceData = class("CampRaceData", BaseData)
local CampRaceConst = require("app.const.CampRaceConst")
local CampRaceUserData = require("app.data.CampRaceUserData")
local CampRaceReportData = require("app.data.CampRaceReportData")
local CampRaceFormationData = require("app.data.CampRaceFormationData")
local CampRaceStateData = require("app.data.CampRaceStateData")
local CampRacePreRankData = require("app.data.CampRacePreRankData")
local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")

local schema = {}
schema["camp"] = {"number", 0}
schema["status"] = {"number", 0}        --0, 未开始，1，预赛，2，决赛
schema["champion"] = {"table", {}}
schema["curWatchUserId"] = {"number", 0} --当前看的玩家Id
schema["selfWinChampion"] = {"boolean", false} --自己是否赢得冠军
CampRaceData.schema = schema


--对阵结构表
-- 1                       5 
--     9               11
-- 2           15          6
--         13      14
-- 3                       7
--     10              12
-- 4                       8

--每一轮季后赛对应的站位图
CampRaceData.ROUND = {
    {1, 2, 3, 4, 5, 6, 7, 8},
    {9, 10, 11, 12},
    {13, 14},
    {15},
    -- {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15}
}

function CampRaceData:ctor(properties)
    CampRaceData.super.ctor(self, properties)

    --战报
    self._reports = {}

    --预赛排行
    self._preRankList = {}

    --上次的对阵结果，如果有比赛的时候就是本次比赛
    --结构：先按阵营分，再按位置排的userId
    --只针对淘汰赛
    self._lastRaceUserIds = {}

    -- 当前状态
    self._curStatus = {}

    self._lastUsers = {}

    --当前比赛数据，按照阵营分
    --每个单独数据结构为
    -- {
    --     camp --阵营
    --     round --第几回合
    --     startTime --下回合开始时间
    --     leftFormation --左侧玩家数据
    --     rightFormation --右侧玩家数据
    -- }
    self._curMatchDatas = {} 
    self._leftPlayer = nil
    self._rightPlayer = nil

    --押注信息
    self._betData = {}
    
    --报名
    self._listenerSignUp = G_NetworkManager:add(MessageIDConst.ID_S2C_CampRaceSignUp,handler(self, self._s2cCampRaceSignUp)) 
    --获得阵营消息
    self._ListenerGetInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCampRaceBaseInfo,handler(self, self._s2cGetCampRaceBaseInfo))
    --获取排行榜
    self._listenerGetRank = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCampRaceRank,handler(self, self._s2cGetCampRaceRank))
    --上次排行
    self._listenerGetLastRank = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCampRaceLastRank,handler(self, self._s2cGetCampRaceLastRank))
    --获得阵型
    self._listenerGetFormation = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCampRaceFormation,handler(self, self._s2cGetCampRaceFormation))
    --更新阵型
    self._listenerUpdateFormation = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCampRaceFormation,handler(self, self._s2cUpdateCampRaceFormation))
    --战报广播
    self._listenerAddCampRaceReport = G_NetworkManager:add(MessageIDConst.ID_S2C_AddCampRaceBattleReport, handler(self, self._s2cAddRaceBattleReport))  
    --获取战报
    self._listenerGetBattleReport = G_NetworkManager:add(MessageIDConst.ID_S2C_GetBattleReport, handler(self, self._s2cGetBattleReport))
    --更新状态
    self._listenerUpdateCampRace = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCampRace, handler(self, self._s2cUpdateCampRace))
    --赌博
    self._listenerCampRaceBet = G_NetworkManager:add(MessageIDConst.ID_S2C_CampRaceBet, handler(self, self._s2cCampRaceBet))
    --更新赌博
    self._listenerUpdateBet = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateCampRaceBet, handler(self, self._s2cUpdateCampRaceBet))
    --获取冠军
    self._listenerGetCampRaceChampion = G_NetworkManager:add(MessageIDConst.ID_S2C_GetCampRaceChampion, handler(self, self._s2cGetCampRaceChampion))
    --更新预赛结果
    self._listenerCampRaceBattleResult = G_NetworkManager:add(MessageIDConst.ID_S2C_CampRaceBattleResult, handler(self, self._s2cCampRaceBattleResult))
end

function CampRaceData:clear()
    self._listenerSignUp:remove()
    self._listenerSignUp = nil
    self._ListenerGetInfo:remove()
    self._ListenerGetInfo = nil
    self._listenerGetRank:remove()
    self._listenerGetRank = nil
    self._listenerGetLastRank:remove()
    self._listenerGetLastRank = nil
    self._listenerGetFormation:remove()
    self._listenerGetFormation = nil
    self._listenerUpdateFormation:remove()
    self._listenerUpdateFormation = nil
    self._listenerAddCampRaceReport:remove()
    self._listenerAddCampRaceReport = nil
    self._listenerGetBattleReport:remove()
    self._listenerGetBattleReport = nil 
    self._listenerUpdateCampRace:remove()
    self._listenerUpdateCampRace = nil
    self._listenerCampRaceBet:remove()
    self._listenerCampRaceBet = nil
    self._listenerUpdateBet:remove()
    self._listenerUpdateBet = nil
    self._listenerGetCampRaceChampion:remove()
    self._listenerGetCampRaceChampion = nil
    self._listenerCampRaceBattleResult:remove()
    self._listenerCampRaceBattleResult = nil
end

function CampRaceData:getMyCamp()
    local myCamp = self:getCamp()
    if myCamp == 0 then 
        myCamp = G_UserData:getBase():getCamp()
    end
    return myCamp
end

--报名
function CampRaceData:c2sCampRaceSignUp()
    G_NetworkManager:send(MessageIDConst.ID_C2S_CampRaceSignUp, {

    })	
end

function CampRaceData:_s2cCampRaceSignUp(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then 
        return 
    end

    G_SignalManager:dispatch(SignalConst.EVENT_CAMP_SIGN_UP)
end

--获取信息
function CampRaceData:c2sGetCampRaceBaseInfo()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetCampRaceBaseInfo, {

    })	
end

function CampRaceData:_s2cGetCampRaceBaseInfo(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then 
        return
    end

    local camp = rawget(message, "camp") or 0
    local status = rawget(message, "status") or 0
    self:setCamp(camp)
    self:setStatus(status)
    G_SignalManager:dispatch(SignalConst.EVENT_GET_CAMP_BASE_INFO)
end

--获取排行榜
function CampRaceData:c2sGetCampRaceRank(campList)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetCampRaceRank, {
        camp = campList
    })	
end

function CampRaceData:_s2cGetCampRaceRank(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then 
        return
    end
    local ranks = rawget(message, "ranks") or {}
    for i, rank in ipairs(ranks) do
        local preRankData = CampRacePreRankData.new(rank)
        local camp = preRankData:getCamp()
        self._preRankList[camp] = self._preRankList[camp] or preRankData
        self._preRankList[camp]:updateData(rank)
    end

    G_SignalManager:dispatch(SignalConst.EVENT_GET_CAMP_RACE_RANK)
end

--获取排名信息
function CampRaceData:c2sGetCampRaceLastRank(camp)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetCampRaceLastRank, {
        camp = camp
    })	
end

function CampRaceData:_s2cGetCampRaceLastRank(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then 
        return
    end

    local camp = rawget(message, "camp") or 0
    local status = rawget(message, "status") or 0
    local lastRaceIds = rawget(message, "last_race_ids") or {}
    local userDatas = rawget(message, "user_data") or {}
    local battleReports = rawget(message, "battle_report") or {}

    self._curStatus[camp] = self:getCurStatusWithCamp(camp)
    self._curStatus[camp]:setFinal_status(status)

    self._lastRaceUserIds[camp] = lastRaceIds

    self._lastUsers = {}
    for _, data in ipairs(userDatas) do 
        self:_updateUserData(data)
    end

    --组织战报信息
    self._reports = {}
    self:_updateReportData(battleReports)
    G_SignalManager:dispatch(SignalConst.EVENT_GET_LAST_RANK, camp)
end

--更新战报信息
function CampRaceData:_updateReportData(datas)
    for i, data in ipairs(datas) do 
        local report = CampRaceReportData.new(data)
        local camp = report:getCamp()
        local pos1 = report:getPos1()
        local pos2 = report:getPos2()
        local posKey = tostring(pos1).."_"..tostring(pos2)
        local id = report:getId()
        if self._reports[camp] == nil then
            self._reports[camp] = {}
        end
        if self._reports[camp][posKey] == nil then
            self._reports[camp][posKey] = {}
        end
        self._reports[camp][posKey][id] = report
    end
end

function CampRaceData:getUserIdsWithCamp(camp)
    local userIds = self._lastRaceUserIds[camp] or {}
    return userIds
end

function CampRaceData:getUserIdsCount(camp)
    local count = 0
    local userIds = self:getUserIdsWithCamp(camp)
    for i, userId in ipairs(userIds) do
        if userId > 0 then
            count = count + 1
        end
    end
    return count
end

function CampRaceData:getCampWithUserId(userId)
    for camp, userIds in pairs(self._lastRaceUserIds) do
        for i, id in ipairs(userIds) do
            if id == userId then
                return camp
            end
        end
    end
    return 0
end

function CampRaceData:isMatching(camp, userId)
    local status = self:getStatus()
    if status ~= CampRaceConst.STATE_PLAY_OFF then
        return false
    end

    local camp = camp or self:getMyCamp()
    local round = self:getFinalStatusByCamp(camp)
    if round == CampRaceConst.PLAY_OFF_ROUND_ALL then --淘汰赛已经结束
        return false
    end

    local tbPos = CampRaceData.ROUND[round]
    if tbPos == nil then
        return false
    end
    
    local userId = userId or G_UserData:getBase():getId()
    local userIds = self:getUserIdsWithCamp(camp)
    for i, pos in ipairs(tbPos) do
        if userId == userIds[pos] then
            return true
        end
    end
    return false
end

function CampRaceData:getUserByPos(camp, pos)
    local userIds = self:getUserIdsWithCamp(camp)
    local userId = userIds[pos]
    local userData = self:_getUserData(userId)
    return userData
end

function CampRaceData:_getUserData(userId)
    local userData = self._lastUsers[userId]
    return userData
end

function CampRaceData:_updateUserData(data)
    local userData = CampRaceUserData.new(data)
    local userId = userData:getId()
    self._lastUsers[userId] = userData
end

--获取预赛排行榜
function CampRaceData:getPreRankWithCamp(camp)
    return self._preRankList[camp]
end

--获取阵型
function CampRaceData:c2sGetCampRaceFormation(camp, userId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetCampRaceFormation, {
        camp = camp,
        uid = userId,
    })	
end

function CampRaceData:_s2cGetCampRaceFormation(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then 
        return
    end

    local camp = rawget(message, "camp") or 0
    local round = rawget(message, "round") or 0
    local startTime = rawget(message, "start_time") or 0
    local leftFormation = rawget(message, "left_formation")
    local rightFormation = rawget(message, "right_formation")



    self._curMatchDatas[camp] = {}
    self._curMatchDatas[camp]._round = round
    self._curMatchDatas[camp]._startTime = startTime
    if leftFormation then
        local leftPlayer = CampRaceFormationData.new()
        leftPlayer:updateData(leftFormation)
        self._curMatchDatas[camp]._leftPlayer = leftPlayer
    end
    if rightFormation then
        local rightPlayer = CampRaceFormationData.new()
        rightPlayer:updateData(rightFormation)
        self._curMatchDatas[camp]._rightPlayer = rightPlayer
    end
    
    G_SignalManager:dispatch(SignalConst.EVENT_GET_CAMP_RACE_FORMATION, camp)
end

function CampRaceData:_s2cUpdateCampRaceFormation(id, message)
    local uid = rawget(message, "uid") or 0
    local camp = rawget(message, "camp") or 0
    local formation = rawget(message, "formation")
    local player = CampRaceFormationData.new()
    player:updateData(formation)

    local curMatch = self:getCurMatchDataWithCamp(camp)
    local leftPlayer = curMatch._leftPlayer
    local rightPlayer = curMatch._rightPlayer
    if leftPlayer then
        local curLeftUid = leftPlayer:getUid()
        if uid == curLeftUid then
            self._curMatchDatas[camp]._leftPlayer = player
            G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_CAMP_RACE_FORMATION, camp, 1)
        end
    end
    if rightPlayer then
        local curRightUid = rightPlayer:getUid()
        if uid == rightPlayer then
            self._curMatchDatas[camp]._rightPlayer = player
            G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_CAMP_RACE_FORMATION, camp, 2)
        end
    end
end

function CampRaceData:_s2cCampRaceBattleResult(id, message)
    local uid = rawget(message, "uid") or 0
    local camp = rawget(message, "camp") or 0
    local win = rawget(message, "win")
    G_SignalManager:dispatch(SignalConst.EVENT_CAMP_BATTLE_RESULT, camp, win)
end

function CampRaceData:getCurMatchDataWithCamp(camp)
    local data = self._curMatchDatas[camp] or {}
    return data
end

function CampRaceData:getCurMatchRoundWithCamp(camp)
    local data = self:getCurMatchDataWithCamp(camp)
    return data._round
end

function CampRaceData:getCurMatchStartTimeWithCamp(camp)
    local data = self:getCurMatchDataWithCamp(camp)
    return data._startTime
end

function CampRaceData:getCurMatchPlayersWithCamp(camp)
    local data = self:getCurMatchDataWithCamp(camp)
    return data._leftPlayer, data._rightPlayer
end

function CampRaceData:getPositionByUserId(camp, userId)
    local status = self:getFinalStatusByCamp(camp)
    local indexList = CampRaceData.ROUND[status]
    for i, pos in ipairs(indexList) do
        if self._lastRaceUserIds[camp] and self._lastRaceUserIds[camp][pos] == userId then 
            return pos
        end
    end
    return 0
end

function CampRaceData:_s2cAddRaceBattleReport(id, message)
    local battleReport = rawget(message, "battle_report")
    if battleReport then
        local report = CampRaceReportData.new(battleReport)
        local datas = {report}
        self:_updateReportData(datas)
        G_SignalManager:dispatch(SignalConst.EVENT_ADD_RACE_BATTLE_REPORT, report)
    end
end

function CampRaceData:c2sGetBattleReport(reportId)
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetBattleReport, {
        id = reportId
    })	
end

function CampRaceData:_s2cGetBattleReport(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

    local id = rawget(message, "id") or 0
    local battleReport = rawget(message, "battle_report")
	G_SignalManager:dispatch(SignalConst.EVENT_GET_CAMP_REPORT, battleReport)
end

function CampRaceData:_s2cUpdateCampRace(id, message)
    local camp = rawget(message, "camp")
    local stateData = self:getCurStatusWithCamp(camp)
    stateData:updateData(message)
    local startTime = stateData:getStart_time()

    if self._curMatchDatas[camp] == nil then
        self._curMatchDatas[camp] = {}
    end
    self._curMatchDatas[camp]._startTime = startTime -- 存到_curMatchDatas中，startTime都从_curMatchDatas中读取

    self._curStatus[camp] = stateData

    self:_checkSelfIsGetChampion(camp)

    G_SignalManager:dispatch(SignalConst.EVENT_CAMP_UPDATE_STATE, camp)
end

function CampRaceData:getCurStatusWithCamp(camp)
    local stateData = self._curStatus[camp]
    if stateData == nil then
        stateData = CampRaceStateData.new()
        self._curStatus[camp] = stateData
    end
    return self._curStatus[camp]
end

function CampRaceData:getFinalStatusByCamp(camp)
    local stateData = self:getCurStatusWithCamp(camp)
    local finalStatus = stateData:getFinal_status()
    return finalStatus
end

--获取战报组
function CampRaceData:getReportGroupByPos(camp, pos1, pos2)
    local posKey = tostring(pos1).."_"..tostring(pos2)
    if self._reports[camp] == nil then
        return {}
    end
    local reports = self._reports[camp][posKey] or {}
    
    return reports
end

function CampRaceData:c2sCampRaceBet(camp, pos)
    G_NetworkManager:send(MessageIDConst.ID_C2S_CampRaceBet, {
        camp = camp,
        pos = pos,
    })
end

function CampRaceData:_s2cCampRaceBet(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then 
        return 
    end
    G_SignalManager:dispatch(SignalConst.EVENT_CAMP_BET_SUCCESS)
end

function CampRaceData:_s2cUpdateCampRaceBet(id, message)
    self._betData = {}
    local betInfo = rawget(message, "bet_info") or {}
    for i, info in ipairs(betInfo) do
        local camp = info.camp
        local pos = info.pos
        self._betData[camp] = pos
    end
    G_SignalManager:dispatch(SignalConst.EVENT_CAMP_UPDATE_BET)
end

function CampRaceData:getBetPosWithCamp(camp)
    local pos = self._betData[camp] or 0
    return pos
end

--是否能押某阵营
function CampRaceData:isCanBetWithCamp(camp)
    local myCamp = self:getMyCamp()
    return camp == myCamp
end

--是否已经押注过
function CampRaceData:isHaveBet()
    for camp, pos in pairs(self._betData) do
        if pos > 0 then
            return true
        end
    end
    return false
end

--是否已报名
function CampRaceData:isSignUp()
    return self:getCamp() > 0
end

--某个阵营比赛是否结束
function CampRaceData:isFinishWithCamp(camp)
    local status = self:getCurStatusWithCamp(camp)
    if status then
        local isFinish = status:getFinal_status() == CampRaceConst.PLAY_OFF_ROUND_ALL
        return isFinish
    end
    return false
end

--是否比赛全部结束
function CampRaceData:isAllRaceFinish()
    local isAllFinish = true
    for i = 1, 4 do
        local isFinish = self:isFinishWithCamp(i)
        isAllFinish = isAllFinish and isFinish
    end
    return isAllFinish
end

--获取冠军信息
function CampRaceData:c2sGetCampRaceChampion()
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetCampRaceChampion, {})   
end

function CampRaceData:_s2cGetCampRaceChampion(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then 
        return 
    end
    local championList = {}
    for i, v in pairs(message.champion) do 
        local camp = v.camp 
        local user = CampRaceUserData.new(v.user)
        championList[camp] = user
    end
    self:setChampion(championList)
    G_SignalManager:dispatch(SignalConst.EVENT_CAMP_GET_CHAMPION)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_CAMP_RACE_CHAMPION)
end

function CampRaceData:hasRedPoint()
    local signUpRp = self:hasSignUpRedPoint()
    return signUpRp
end

--押注红点
function CampRaceData:hasBetRedPoint()
    local status = self:getStatus()
    if status ~= CampRaceConst.STATE_PLAY_OFF then
        return false
    end
    if self:isMatching() then
        return false
    end
    if self:isHaveBet() then
        return false
    end
    return true
end

--报名红点
function CampRaceData:hasSignUpRedPoint()
    if CampRaceHelper.isReplacedBySingleRace() == true then
        return false
    end
    local status = self:getStatus()
    if status == CampRaceConst.STATE_PRE_OPEN then
        local openState = CampRaceHelper.getSigninState()
        if openState == CampRaceConst.SIGNIN_OPEN and not self:isSignUp() then
            return true
        end
    end
    return false
end

--寻找能看的userId
--有自己，优先看自己，没自己，按照pos位置找第一个能看的
function CampRaceData:findWatchUserIdWithCamp(camp)
    local selfId = G_UserData:getBase():getId()
    local finalStatus = self:getFinalStatusByCamp(camp)
    local tbPos = CampRaceData.ROUND[finalStatus]
    local userIds = self:getUserIdsWithCamp(camp)
    for i, pos in ipairs(tbPos) do
        local userId = userIds[pos]
        if userId == selfId then
            return userId --先找自己
        end
    end
    for i, pos in ipairs(tbPos) do
        local userId = userIds[pos]
        return userId
    end
end

function CampRaceData:findCurWatchCamp()
    local curWatchUserId = self:getCurWatchUserId()
    if curWatchUserId == 0 then
        return self:getMyCamp()
    else
        return self:getCampWithUserId(curWatchUserId)
    end
end

--检测是否赢得冠军
function CampRaceData:_checkSelfIsGetChampion(camp)
    local myCamp = self:getMyCamp()
    if myCamp ~= camp then
        return
    end
    if self:isFinishWithCamp(myCamp) then
        local userIds = G_UserData:getCampRaceData():getUserIdsWithCamp(myCamp)
        local championId = userIds[15]
        if championId == G_UserData:getBase():getId() then
            self:setSelfWinChampion(true)
            return true
        end
    end
    return false
end

return CampRaceData