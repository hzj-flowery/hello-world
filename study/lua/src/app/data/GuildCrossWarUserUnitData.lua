-- Author: hedili
-- Date:2018-12-05 10:16:30
-- Describle：跨服军团战, 战斗单位

local BaseData = require("app.data.BaseData")
local GuildCrossWarUserUnitData = class("GuildCrossWarUserUnitData", BaseData)
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
local schema = {}


schema["uid"]           = {"number", 0}     --玩家id
schema["sid"]           = {"number", 0}     --玩家服务器id
schema["sname"]         = {"string", ""}    --服务器名称
schema["name"]          = {"string", ""}    --玩家昵称
schema["base_id"]       = {"number", 0}     --主角id
schema["avatar_base_id"]= {"number", 0}     --变身卡id
schema["guild_id"]      = {"number", 0}     --军团Id
schema["guild_name"]    = {"string", ""}    --军团名称
schema["guild_level"]   = {"number", 1}     --军团等级
schema["officer_level"] = {"number", 0}     --官衔
schema["title"]         = {"number", 0}     --称号title
schema["hp"]            = {"number", 0}     --体力
schema["max_hp"]        = {"number", 0}     --最大体力
schema["init_hp"]       = {"number", 0}     --初始血量(最大血量)
schema["power"]         = {"number", 0}     --战力
schema["head_frame_id"] = {"number", 0}     --头像框

schema["action"]        = {"number", 0}     --0-移动据点 1-复活返回初始点 2-血量更新
schema["move_end_time"] = {"number", 0}     --移动结束时间
schema["need_time"]     = {"number", 0}     --移动所需时间
schema["move_cd"]       = {"number", 0}     --移动cd
schema["fight_cd"]      = {"number", 0}     --挑战cd
schema["revive_time"]   = {"number", 0}     --复活时间
schema["from_pos"]      = {"table", {}}     --起点（key_point_id据点、pos坑点）
schema["to_pos"]        = {"table", {}}     --终点（key_point_id据点、pos坑点）
schema["isAI"]          = {"boolean", false} --Ai？ -- TODO：：Test


GuildCrossWarUserUnitData.schema = schema
function GuildCrossWarUserUnitData:ctor(properties)
    self._isReachEdge = false   -- 终点边缘
    self._isMoving    = false   -- 移动中
    GuildCrossWarUserUnitData.super.ctor(self, properties)
end

function GuildCrossWarUserUnitData:clear()
end

function GuildCrossWarUserUnitData:reset()
end

-- @Role    Update Obj
function GuildCrossWarUserUnitData:updateData(data)
    self:setProperties(data)
    self:updatePosition(data)
    self:setMaxHp()
end

function GuildCrossWarUserUnitData:updatePosition(data)
    if rawget(data, "key_point_id") == nil then
        return
    end

    if rawget(data, "pos") ~= nil and rawget(data, "pos") ~= 0 then
        self:setTo_pos({key_point_id = data.key_point_id, pos = data.pos})
        return
    end

    local holeMap = G_UserData:getGuildCrossWar():getWarPointMap()
    local holeKeys= table.keys(holeMap[data.key_point_id])

    local pos = math.random(1, #holeKeys)
    self:setTo_pos({key_point_id = data.key_point_id, pos = holeKeys[pos]})
end

function GuildCrossWarUserUnitData:setMaxHp()
    self:setMax_hp(self:getInit_hp())
end

-- @Role    Cur's Point
function GuildCrossWarUserUnitData:getCurPointId()
    return self:getTo_pos().key_point_id
end

-- @Role    Cur's hole
function GuildCrossWarUserUnitData:getCurPointHole()
    return self:getTo_pos()
end

-- @Role    Cur's Grid
function GuildCrossWarUserUnitData:getCurGrid()
    return self:getTo_pos().pos
end

-- @Role    Last's Grid
function GuildCrossWarUserUnitData:getLastCurGrid()
    if not self:getFrom_pos() or not self:getFrom_pos().pos then
        return nil
    end
    return self:getFrom_pos().pos
end

-- @Role    Get Target's Pos
function GuildCrossWarUserUnitData:getCurrPointKeyPos()
    local curState = self:getCurrState()
    if curState == GuildCrossWarConst.UNIT_STATE_MOVING then
        return GuildCrossWarHelper.getOffsetPointRange(self:getFrom_pos().pos, self:isSelf())
    else
        return GuildCrossWarHelper.getOffsetPointRange(self:getTo_pos().pos, self:isSelf())
    end
	return nil
end

-- @Role    Get BeforeTarget's Pos
function GuildCrossWarUserUnitData:getMoveBeforePos()
    if self:getFrom_pos() and self:getFrom_pos().pos then
        return GuildCrossWarHelper.getOffsetPointRange(self:getFrom_pos().pos, self:isSelf())
    else
        return GuildCrossWarHelper.getOffsetPointRange(self:getTo_pos().pos, self:isSelf())
    end
end

-- @Role    Get Target's Pos
function GuildCrossWarUserUnitData:getCurrPos()
    return GuildCrossWarHelper.getOffsetPointRange(self:getTo_pos().pos, self:isSelf())
end

-- @Role    Is Move End
function GuildCrossWarUserUnitData:isMoveEnd()
    return G_ServerTime:getLeftSeconds(self:getMove_end_time()) <= 0
end

-- @Role    Get User's State
function GuildCrossWarUserUnitData:getCurrState()
    -- body
	local reviveTime = self:getRevive_time() > 0 and G_ServerTime:getLeftSeconds(self:getRevive_time()) or 0
	if reviveTime > 0 then      -- 4. 死亡态
		return GuildCrossWarConst.UNIT_STATE_DEATH
	end

    local movingEnd = self:getMove_end_time() > 0 and G_ServerTime:getLeftSeconds(self:getMove_end_time()) or 0
	if movingEnd > 0 then       -- 1. 移动态
		return GuildCrossWarConst.UNIT_STATE_MOVING
    end

	local cdLeftTime = self:getMove_cd() > 0 and G_ServerTime:getLeftSeconds(self:getMove_cd()) or 0
	if cdLeftTime > 0 then      -- 2. CD态
		return GuildCrossWarConst.UNIT_STATE_CD
	end
                                
	return GuildCrossWarConst.UNIT_STATE_IDLE   -- 0. 等待态
end

-- @Role    Get moving's Time
function GuildCrossWarUserUnitData:getNeedTime(path)
    -- body
    if table.nums(path) <= 0 then
        return {}
    end

    local totalTime = 0
    for i = 1, (#path - 1) do
        local startPos, endPos = GuildCrossWarHelper.getMovingLine(path[i].id, path[i+1].id, self:isSelf())
        local time = cc.pGetDistance(endPos, startPos) or 0
        totalTime = (totalTime + time)
    end
    
    totalTime = tonumber(string.format("%.2f", (totalTime / GuildCrossWarConst.AVATAR_MOVING_RATE))) * 1000
    totalTime = totalTime > 1500 and --[[math.floor(totalTime)]]1500 * (#path - 1) or 1500    -- 应策划、服务器要求写死!!
    return totalTime--math.ceil(totalTime)
end

-- @Role    Get MovingPath
function GuildCrossWarUserUnitData:getMovingPath(selfX, selfY, isSelf)
    -- body    
	local fromPos = self:getFrom_pos()
    local targetPos = self:getTo_pos()
    
    if type(fromPos) ~= "table" or type(targetPos) ~= "table" then
        return {}
    end

    if table.nums(fromPos) ~= 2 or table.nums(targetPos) ~= 2 then
        return {}
    end

    local path = GuildCrossWarHelper.getFindingpath(fromPos.pos, targetPos.pos)
    local count = table.nums(path)
    if count <= 0 then
        return {}
    end
    
    local moveData = {}
    for i = 1, (count - 1) do
        local startPos, endPos = GuildCrossWarHelper.getMovingLine(path[i].id, path[i+1].id, self:isSelf())
        startPos = i == 1 and cc.p(selfX,selfY) or startPos

        local line = {}
        local lineData = {}
        table.insert(line, startPos)
        table.insert(line, endPos)
        local distance = cc.pGetDistance(startPos, endPos)
        local totalTime = tonumber(string.format("%.3f", (distance / GuildCrossWarConst.AVATAR_MOVING_RATE)))
        lineData = {
            gridIds = {path[i].id, path[i+1].id},
            curLine = line,
            totalTime = totalTime,--(totalTime > 1 and math.floor(totalTime) or 1),
            endTime = self:getMove_end_time()
        }
        table.insert(moveData, lineData)
    end

    -- Camera’s Path
    if isSelf then
        local camreraPath = clone(moveData)
        local cameraCount = table.nums(camreraPath)
        for i = 1, cameraCount do
            camreraPath[i].curLine[1] = GuildCrossWarHelper.getWarMapGridCenter(camreraPath[i].gridIds[1])
            camreraPath[i].curLine[2] = GuildCrossWarHelper.getWarMapGridCenter(camreraPath[i].gridIds[2])

            if i ~= 1 then
                moveData[i].curLine[1] = GuildCrossWarHelper.getWarMapGridCenter(camreraPath[i].gridIds[1])
            end
            if i ~= cameraCount then
                moveData[i].curLine[2] = GuildCrossWarHelper.getWarMapGridCenter(camreraPath[i].gridIds[2])
            end
        end
        return moveData, camreraPath
    else
        local cameraCount = table.nums(moveData)
        for i = 1, cameraCount do
            if i ~= 1 then
                moveData[i].curLine[1] = GuildCrossWarHelper.getWarMapGridCenter(moveData[i].gridIds[1])
            end
            if i ~= cameraCount then
                moveData[i].curLine[2] = GuildCrossWarHelper.getWarMapGridCenter(moveData[i].gridIds[2])
            end
        end
        return moveData, nil
    end
end

-- @Role   Check Moving
function GuildCrossWarUserUnitData:checkCanMoving(gridData, path)
    if type(gridData) ~= "table" then
        return false
    end

    if rawequal(gridData.is_move, 0) then
        return false
    end

    local retList = G_UserData:getGuildCrossWar():getWarHoleList()
    local selfGridData = retList[self:getCurGrid()]
    local destGridData = retList[gridData.id]

    local distance = cc.pGetDistance(cc.p(selfGridData.x, selfGridData.y), cc.p(destGridData.x, destGridData.y))
    --[[if distance > GuildCrossWarConst.MAX_GRID_PATHFINDING then
        return false
    end]]

    if distance ~= 1 then       -- 1.多格子(兼容之前单格子逻辑
        return true--table.nums(path) <= (GuildCrossWarConst.MAX_GRID_PATHFINDING + 1)
    end

                                -- 2.单格子
    if not GuildCrossWarHelper.checkCanMovedPoint(self:getTo_pos(), gridData) then
        return false
    end
    
    local curPointId = self:getCurPointId()
    local bossUnit = G_UserData:getGuildCrossWar():getBossUnitById(curPointId)
    if bossUnit == nil then
        return true
    end

    local bossState, __ = bossUnit:getCurState()
    if bossState ~= GuildCrossWarConst.BOSS_STATE_DEATH then
        if gridData.point_y ~= 0 then
            return true
        end
        return false
    end
    return true
end

--@Role     Self's Around Grid
function GuildCrossWarUserUnitData:getVisibleScreenGrid( ... )
    local newAroundAtkGrids = {}
    local gridData = GuildCrossWarHelper.getWarMapCfg(self:getCurGrid())
    if gridData == nil then
        return newAroundAtkGrids
    end

    local oriX = (gridData.axis_x - 3)
    local oriY = (gridData.axis_y - 2)
    for x=0, 6 do
        for y=0, 4 do
            local newGrid = GuildCrossWarHelper.getWarMapCfgByGrid(oriX + x, oriY + y)
            if newGrid and newGrid.is_move == 1 then
                newAroundAtkGrids["K" ..newGrid.id] = newGrid.id
            end
        end
    end
    return newAroundAtkGrids
end

-- @Role    Is Self
function GuildCrossWarUserUnitData:isSelf()
    return self:getUid() == (G_UserData:getGuildCrossWar():getObserverId() > 0 and G_UserData:getGuildCrossWar():getObserverId()
                                                                                or G_UserData:getBase():getId())
end

--  @Role   Is Self's Guild
function GuildCrossWarUserUnitData:isSelfGuild()
    local guildId = G_UserData:getGuildCrossWar():getObserverGuildId()
    return self:getGuild_id() == (guildId > 0 and guildId or G_UserData:getGuild():getMyGuildId())
end

-- @Role    is GuildLeader
function GuildCrossWarUserUnitData:isGuildLeader()
    local guildData = G_UserData:getGuild():getMyGuild()
    if guildData == nil then
        return false
    end
    local leaderId = guildData:getLeader()
    if leaderId == 0 or leaderId == nil then
        return false
    end 
    return self:getUid() == guildData:getLeader()
end

-- @Role    Is Moving Edge
function GuildCrossWarUserUnitData:setReachEdge(bReach)
    self._isReachEdge = bReach
end

-- @Role    Is Moving Edge
function GuildCrossWarUserUnitData:isReachEdge()
    return self._isReachEdge
end

-- @Role    Is Moving
function GuildCrossWarUserUnitData:setMoving(bMoving)
    self._isMoving = bMoving
end

-- @Role    Is Moving
function GuildCrossWarUserUnitData:isMoving()
    return self._isMoving
end


return GuildCrossWarUserUnitData
