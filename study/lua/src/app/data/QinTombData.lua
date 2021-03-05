-- Author: hedili
-- Date:2018-08-31 10:16:30
-- Describle：先秦皇陵
local BaseData = require("app.data.BaseData")
local QinTombData = class("QinTombData", BaseData)

local QinTombUnitData = require("app.data.QinTombUnitData")
local QinTombMonsterData = require("app.data.QinTombMonsterData")
local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper")
local schema = {}

QinTombData.schema = schema

function QinTombData:ctor(properties)
    QinTombData.super.ctor(self, properties)

    self._pointMap = {}
    self._lineMap = {}
    self._pointLineMap = {}

    self._teamMap = {}
    self._monsterMap = {}
    self._monumentList = {}
     --墓地
    self._myTeamId = 0
    self._nextKey = nil
    self._showEffect = false
    self._movingSpeed = nil
    self:_buildPointMap()

    --self:_initTestData()
    self._msgGraveEnterScene =
        G_NetworkManager:add(MessageIDConst.ID_S2C_GraveEnterScene, handler(self, self._s2cGraveEnterScene))

    self._msgUpdateGrave = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateGrave, handler(self, self._s2cUpdateGrave))

    self._msgGraveMove = G_NetworkManager:add(MessageIDConst.ID_S2C_GraveMove, handler(self, self._s2cGraveMove))

    self._msgGraveBattleNotice =
        G_NetworkManager:add(MessageIDConst.ID_S2C_GraveBattleNotice, handler(self, self._s2cGraveBattleNotice))

    self._msgGraveLeaveBattle =
        G_NetworkManager:add(MessageIDConst.ID_S2C_GraveLeaveBattle, handler(self, self._s2cGraveLeaveBattle))

    --秦皇陵击杀boss奖励协议
    self._msgGraveReward = G_NetworkManager:add(MessageIDConst.ID_S2C_GraveReward, handler(self, self._s2cGraveReward))

    self._signalAllDataReady =
        G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onAllDataReady))
end

function QinTombData:clear()
    self._pointMap = {}
    self._lineMap = {}
    self._pointLineMap = {}
    self._teamMap = {}
    self._monsterMap = {}
    self._monumentList = {}
     --墓地
    self._myTeamId = 0
    self._nextKey = nil
    self._showEffect = false

    self._msgGraveEnterScene:remove()
    self._msgGraveEnterScene = nil
    self._msgUpdateGrave:remove()
    self._msgUpdateGrave = nil
    self._msgGraveMove:remove()
    self._msgGraveMove = nil
    self._msgGraveBattleNotice:remove()
    self._msgGraveBattleNotice = nil
    self._msgGraveLeaveBattle:remove()
    self._msgGraveLeaveBattle = nil
    self._signalAllDataReady:remove()
    self._signalAllDataReady = nil
    self._msgGraveReward:remove()
    self._msgGraveReward = nil
end

function QinTombData:reset()
    self._nextKey = nil
end

--秦皇陵是否开启
function QinTombData:isQinOpen()
    -- body
    local qinCfg = require("app.config.qin_info").get(1)
    local openTime = tonumber(qinCfg.open_time)
    local closeTime = tonumber(qinCfg.close_time)
    local time = G_ServerTime:getTodaySeconds()
    if time >= openTime and time <= closeTime then
        return true
    end
    logWarn(" QinTombData:isQinOpen  =========== false")
    return false
end

function QinTombData:getOpenTime(...)
    -- body
    if self:isQinOpen() then
        local qinCfg = require("app.config.qin_info").get(1)
        local openTime = tonumber(qinCfg.open_time)
        local time = G_ServerTime:getTodaySeconds()
        local leftTime = time - openTime
        return leftTime + G_ServerTime:getTime()
    end
    return 0
end


function QinTombData:getCloseTime(...)
    -- body
    if self:isQinOpen() then
        local qinCfg = require("app.config.qin_info").get(1)
        local closeTime = tonumber(qinCfg.close_time)
        local time = G_ServerTime:getTodaySeconds()
        local leftTime = closeTime - time
        return leftTime + G_ServerTime:getTime()
    end
    return 0
end

function QinTombData:c2sGraveEnterScene()
    -- body
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    if FunctionCheck.funcIsOpened(FunctionConst.FUNC_MAUSOLEUM) then
        if self:isQinOpen() and G_UserData:getGroups():isInActiveScene() then
            G_NetworkManager:send(MessageIDConst.ID_C2S_GraveEnterScene, {})
        end
    end
end

function QinTombData:c2sGraveMove(path, needTime)
    -- body
    G_NetworkManager:send(MessageIDConst.ID_C2S_GraveMove, {path = path, need_time = needTime})
end

function QinTombData:c2sGraveLeaveBattle()
    -- body
    logWarn("QinTombData:c2sGraveLeaveBattle")
    G_NetworkManager:send(MessageIDConst.ID_C2S_GraveLeaveBattle, {})
end

--触发战斗
function QinTombData:c2sGraveBattlePoint(...)
    -- body
    G_NetworkManager:send(MessageIDConst.ID_C2S_GraveBattlePoint, {})
end

--获取先秦皇陵历史战报
function QinTombData:c2sCommonGetReport()
    -- body
    G_NetworkManager:send(MessageIDConst.ID_C2S_CommonGetReport, {report_type = 7})
end

function QinTombData:_s2cGraveLeaveBattle(id, message)
    -- body
    G_SignalManager:dispatch(SignalConst.EVENT_GRAVE_LEAVE_BATTLE, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
end

--断线重连，并已经登录过了，重新拉取皇陵数据
function QinTombData:_onAllDataReady()
    if G_UserData:isFlush() then
        self:c2sGraveEnterScene()
    end
end

--[[

message GraveTeam {
optional TeamInfo  team_info= 1;
repeated uint32  path =2;
optional uint32  begin_time =3;
optional uint32  need_time =4;
}
]]
function QinTombData:_s2cGraveEnterScene(id, message)
    -- body
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end

    local teams = rawget(message, "teams") or {}

    self._teamMap = {}
    for i, value in ipairs(teams) do
        local key = self:_updateTeam(value)
    end

    self._monsterMap = {}
    local mosters = rawget(message, "mosters")
    if mosters then
        for i, value in ipairs(mosters) do
            self:_updateMonster(value)
        end
    end

    self._monumentList = {}
    local monuments = rawget(message, "monuments")
    if monuments then
        for i, value in ipairs(monuments) do
            self:_addMonument(value)
        end
    end
    self._myTeamId = rawget(message, "my_team_id")

    G_SignalManager:dispatch(SignalConst.EVENT_GRAVE_ENTER_SCENE)
end

function QinTombData:_s2cGraveMove(id, message)
    -- body
end

function QinTombData:_s2cGraveBattleNotice(id, message)
    -- body
    dump(message)
    G_SignalManager:dispatch(SignalConst.EVENT_GRAVE_BATTLE_NOTICE, message)
end

function QinTombData:_s2cGraveReward(id, message)
    G_SignalManager:dispatch(SignalConst.EVENT_GRAVE_GETREWARD, message)
end

function QinTombData:_s2cUpdateGrave(id, message)
    -- body
    -- 删除某个team
    logWarn("QinTombData:_s2cUpdateGrave")

    local del = rawget(message, "del") or 0
    if del and del > 0 then
        self._teamCacheList = nil
        --这里队伍数据要删除
        self._teamMap[del] = nil
        G_SignalManager:dispatch(SignalConst.EVENT_DELETE_GRAVE, del)
        return
    end

    local moument = rawget(message, "add_monument")
    if moument then
        self:_updateMonument()
        self:_addMonument(moument)
    end

    --怪物刷新先与team
    local monsterId = 0
    local monster = rawget(message, "monster")
    if monster then
        monsterId = self:_updateMonster(monster)
    end

    --更新team
    local teamId = 0
    local team = rawget(message, "team")
    if team then
        teamId = self:_updateTeam(team)
    end

    G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_GRAVE, teamId, monsterId)
end

function QinTombData:_addMonument(data)
    -- body
    local monumentData = {
        point_id = data.point_id,
        member = data.member,
        die_time = data.die_time,
        position = data.position, --1.攻击方  2.防守方
        pkPos = {},
        hookPos = {}
    }

    local function updateMonumentPos(data)
        -- body
        local posArray = {}
        local monster = self:getMonster(data.point_id)
        for i, value in ipairs(data.member) do
            if data.position == 1 then
                local pkPos = monster:getMonumentPKPos(i)
                data.pkPos[i] = pkPos
            else
                local hookPos = monster:getMonumentHookPos(i)
                data.hookPos[i] = hookPos
            end
        end
    end

    updateMonumentPos(monumentData)
    table.insert(self._monumentList, monumentData)

    --dump(self._monumentList)
end

function QinTombData:_updateMonument(...)
    -- body
    local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper")

    local liveTime = QinTombHelper.getQinInfo("tombstone_time")
    local currTime = G_ServerTime:getTime()
    for i, value in ipairs(self._monumentList) do
        if currTime > value.die_time + liveTime then
            table.remove(self._monumentList, i)
        end
    end
end

function QinTombData:_updateMonster(monsterData)
    -- body
    local pointId = monsterData.point_id
    local oldMonster = self._monsterMap[pointId]
    if oldMonster then
        local retTable = oldMonster:syncData(monsterData)
        self._monsterMap[oldMonster:getPoint_id()] = oldMonster
        --dump(retTable)
        G_SignalManager:dispatch(SignalConst.EVENT_GRAVE_SYNC_ATTCK_PLAYER, retTable)
        return oldMonster:getPoint_id()
    end
    local monster = QinTombMonsterData.new()
    monster:updateData(monsterData)
    self._monsterMap[monster:getPoint_id()] = monster
    return monster:getPoint_id()
end

function QinTombData:getTeamById(teamId)
    -- body
    local teamUnit = self._teamMap[teamId]
    if teamUnit then
        return teamUnit
    end
    return nil
end

function QinTombData:getMonster(point)
    -- body
    local monsterUnit = self._monsterMap[point]
    if monsterUnit then
        return monsterUnit
    end
    return nil
end

--获取怪物列表
function QinTombData:getMonsterList(...)
    -- body
    local monsterList = {}
    for i, value in pairs(self._monsterMap) do
        table.insert(monsterList, value)
    end
    return monsterList
end

--获取队伍列表,将自己队伍放在最前面
function QinTombData:getTeamListEx(...)
    -- body
    if self._teamCacheList == nil then
        local teamList = {}
        local selfTeam = self:getSelfTeam()
        if selfTeam then
            local selfTeamdId = selfTeam:getTeamId()
            for i, value in pairs(self._teamMap) do
                if value:getTeamId() ~= selfTeamdId then
                    table.insert(teamList, value)
                end
            end
            table.insert(teamList, 1, selfTeam)
        end
        logWarn("QinTombData:getTeamListEx")
        self._teamCacheList = teamList
    end
    return self._teamCacheList
end

--获取队伍列表
function QinTombData:getTeamList(...)
    -- body
    local teamList = {}
    for i, value in pairs(self._teamMap) do
        table.insert(teamList, value)
    end
    return teamList
end

--获取墓地列表
function QinTombData:getMonumentList(pointKey)
    -- body
    self:_updateMonument()

    --获取指定点的墓地
    if pointKey then
        local retList = {}
        for i, value in ipairs(self._monumentList) do
            if pointKey == value.point_id then
                table.insert(retList, value)
            end
        end
        return retList
    end

    --获取全部墓地
    return self._monumentList
end

function QinTombData:_updateTeam(teamData)
    -- body
    local teamId = teamData.team_info.team_id or 0
    local function makeTeam(teamData)
        -- body
        local teamId = teamData.team_info.team_id
        local teamUnit = QinTombUnitData.new()
        teamUnit:updateData(teamData)
        return teamId, teamUnit
    end

    local oldTeam = self._teamMap[teamId]
    if oldTeam == nil then
        self._teamCacheList = nil
    end

    local key, unit = makeTeam(teamData)
    self._teamMap[key] = unit

    if unit:getBattleMonsterId() > 0 then
        local monsterId = unit:getBattleMonsterId()
        G_SignalManager:dispatch(SignalConst.EVENT_UPDATE_GRAVE, 0, monsterId)
    end
    return key
end

function QinTombData:_decodeNums(str)
    local strArr = string.split(str, "|")
    local nums = {}
    for k, v in ipairs(strArr) do
        nums[k] = tonumber(v)
    end
    return nums
end

function QinTombData:_makePointTimeKey(pointData)
    -- body
    local key1 = pointData.point_id_1 .. "_" .. pointData.point_id_2
    return key1
end

function QinTombData:_makePointKey(pointData)
    -- body
    local key = pointData.point_id
    return key
end

--构建地图路径
function QinTombData:_buildPointMap(...)
    -- body
    local qin_point = require("app.config.qin_point")
    for loop = 1, qin_point.length() do
        local pointData = qin_point.indexOf(loop)
        local clickRect = QinTombHelper.getClickRect(pointData.point_id)
        self._pointMap[pointData.point_id] = {cfg = pointData, index = 1, clickRect = clickRect}
    end

    --线路图
    local qin_point_time = require("app.config.qin_point_time")
    for loop = 1, qin_point_time.length() do
        local pointData = qin_point_time.indexOf(loop)
        local key = self:_makePointTimeKey(pointData)
        self._lineMap[key] = {cfg = pointData, index = 1}
        self:_makeLine(pointData)
    end
end

--根据某个点，构建点与点关系的Map
function QinTombData:_makeLine(cfgData)
    -- body
    local key1 = cfgData.point_id_1
    local key2 = cfgData.point_id_2

    local connectlist = self._pointLineMap[key1]
     --获取该点有关的所有点

    if connectlist == nil then
        connectlist = {}
    end

    local pointLineList = self:_getMidPointEx(cfgData)
    local pointList = {}
    for i, value in ipairs(pointLineList) do
        pointList[i] = self:_decodeNums(value)
    end

    local curveConfigList = self:_makeCureList(pointList)
    local CurveHelper = require("app.utils.CurveHelper")
    local s = 0
    for k, curveConfig in ipairs(curveConfigList) do
        local len = CurveHelper.bezier3Length(curveConfig)
        s = s + len
    end
    local linePointData = {
        key = key1 .. "_" .. key2,
        line = pointList,
        len = s,
        time = math.floor(s / self:_getMovingSpeed() * 1000)
    }
    connectlist[key2] = linePointData

    self._pointLineMap[key1] = connectlist
end

function QinTombData:_getMidPointEx(pointCfg)
    -- body
    local retList = {}
    for i = 1, 5 do
        local mid_point = pointCfg["mid_point_" .. i]
        if mid_point ~= "" and mid_point ~= "0" then
            table.insert(retList, mid_point)
        end
    end
    return retList
end

--可以移走
function QinTombData:_makeCureList(pointList)
    -- body
    local curveConfigList = {}
    for i = 1, #pointList - 1, 1 do
        local curveData = {}
        curveData[1] = cc.p(pointList[i][1], pointList[i][2])
        curveData[2] = cc.p((pointList[i][1] + pointList[i + 1][1]) / 2, (pointList[i][2] + pointList[i + 1][2]) / 2)
        curveData[3] = cc.p(pointList[i + 1][1], pointList[i + 1][2])
        curveData[4] = cc.p(pointList[i + 1][1], pointList[i + 1][2])
        table.insert(curveConfigList, curveData)
    end
    return curveConfigList
end

function QinTombData:_getMovingSpeed(...)
    -- body
    if self._movingSpeed == nil then
        local qin_info = require("app.config.qin_info").get(1)
        self._movingSpeed = qin_info.speed
        return self._movingSpeed
    end

    return self._movingSpeed
end

function QinTombData:getPointRectList(...)
    -- body
    local retList = {}
    for key, value in pairs(self._pointMap) do
        if value.clickRect ~= nil then
            table.insert(retList, value.clickRect)
        end
    end
    return retList
end

--根据某个坐标点，找到路径Key点
function QinTombData:findPointKey(position)
    -- body
    for key, value in pairs(self._pointMap) do
        if value.clickRect ~= nil then
            if cc.rectContainsPoint(value.clickRect, position) then
                return key
            end
        end
    end
    return nil
end

--testCode =
--G_UserData:getQinTombo():getMovingPath({type=1,value =1}, {type=3,value =6})
function QinTombData:getMovingKeyList(pointKey1, pointKey2)
    logWarn("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
    local testValue = self:_breadthFirstSearch(pointKey1, pointKey2)

    local pathTable = {}
    local endKey = pointKey2
    pathTable[1] = endKey
    local function findPath(startKey)
        local value = testValue[startKey]
        if value ~= nil then
            table.insert(pathTable, testValue[startKey])
            findPath(value)
        end
    end

    local function reverseTable(tab)
        local tmp = {}
        for i = 1, #tab do
            local key = #tab
            tmp[i] = table.remove(tab)
        end
        return tmp
    end

    findPath(endKey)
    local reversePath = reverseTable(pathTable)
    local returnTable, totalTime = self:buildPathList(reversePath)

    return reversePath, totalTime
end

function QinTombData:changeStartEndPoint(startData, endData, lineList)
    -- body
    --dump(startData.pointId)
    local startPoint = QinTombHelper.getMidPoint(startData.pointId, startData.size)
    --dump(startPoint)
    local endPoint = QinTombHelper.getRangePoint(endData.pointId, endData.size)
    --dump(endPoint)
    --dump(lineList)
    lineList[1].line[1] = {[1] = startPoint.x, [2] = startPoint.y}
    local endLine = lineList[#lineList].line
    endLine[#endLine] = {[1] = endPoint.x, [2] = endPoint.y}
end

function QinTombData:changeToCurveList(lineList)
    -- body
    for i, value in ipairs(lineList) do
        value.curveLine = self:_makeCureList(value.line)
    end
end

--可以移走
function QinTombData:buildPathList(pathTable)
    -- body
    local function getLine(oldPoint, newPoint)
        -- body3
        local connectlist = self._pointLineMap[oldPoint]
        local linePointData = connectlist[newPoint]
        return linePointData
    end

    local lineList = {}
    local oldPoint = pathTable[1]
    for i = 2, #pathTable do
        local newPoint = pathTable[i]
        local lineData = getLine(oldPoint, newPoint)
        local linePoint = clone(lineData)
        table.insert(lineList, linePoint)
        oldPoint = newPoint
    end
    local totalTime = 0
    for i, value in ipairs(lineList) do
        totalTime = totalTime + value.time
        value.totalTime = totalTime
    end
    return lineList, totalTime
end

--查找路径
function QinTombData:_breadthFirstSearch(pointKey1, pointKey2)
    -- bod
    local startKey1 = pointKey1
    local startKey2 = pointKey2

    local marked = {}
    marked[startKey1] = true
    local bfsQueue = {}
    local parent = {}
    table.insert(bfsQueue, startKey1)

    while (#bfsQueue > 0) do
        local key1 = bfsQueue[1]
        local list = self._pointLineMap[key1]

        for key2, lineData in pairs(list) do
            if marked[key2] == nil then
                marked[key2] = true
                table.insert(bfsQueue, key2)
                parent[key2] = key1
                if key2 == startKey2 then
                    return parent
                end
            end
        end

        table.remove(bfsQueue, 1)
    end
    return parent
end

--
function QinTombData:getTeamData(teamId)
    -- body
    local unitObj = self._teamMap[teamId]
    if unitObj == nil then
        return nil
    end
    return unitObj
end

--获得本队Id
function QinTombData:getSelfTeamId(...)
    -- body
    return self._myTeamId
end

function QinTombData:getSelfTeam(...)
    -- body
    local selfTeam = self:getTeamById(self:getSelfTeamId())
    return selfTeam
end

function QinTombData:cacheNextKey(nextKey)
    -- body
    self._nextKey = nextKey
end

function QinTombData:getCacheNextKey(...)
    -- body
    return self._nextKey
end

function QinTombData:clearCacheNextKey(...)
    -- body
    self._nextKey = nil
end

function QinTombData:isShowEffect(...)
    -- body
    return self._showEffect
end

function QinTombData:setShowEffect(...)
    -- body
    self._showEffect = true
end

return QinTombData
