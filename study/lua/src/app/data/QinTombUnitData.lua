-- Author: hedili
-- Date:2018-08-31 10:16:30
-- Describle：先秦皇陵,玩家单位

local BaseData = require("app.data.BaseData")
local QinTombUnitData = class("QinTombUnitData", BaseData)
local QinTombConst = require("app.const.QinTombConst")
local schema = {}

schema["team_info"] = {"table", {}}--团队信息
schema["path"] = {"table", {}} 
schema["begin_time"] = {"number", 0} 
schema["need_time"] = {"number", 0}
schema["reborn_time"] = {"number", 0 }
schema["title"] = {"number", 0 }

QinTombUnitData.schema = schema

function QinTombUnitData:ctor(properties)
	QinTombUnitData.super.ctor(self, properties)
end

function QinTombUnitData:clear()

end

function QinTombUnitData:reset()

end

function QinTombUnitData:getTeamId( ... )
	-- body
	local teamInfo = self:getTeam_info()
	return teamInfo.team_id
end

function QinTombUnitData:getTeamLeaderId(  )
	-- body
	local team_leader = self:getTeam_info().team_leader
	
	return team_leader
end
function QinTombUnitData:getTeamUsers( ... )
	-- body
	local teamUsers = {}
	local teamInfo = self:getTeam_info()
	for i, value in ipairs( teamInfo.members ) do
        -- table.insert(teamUsers, value.user)
        teamUsers[value.team_no] = value.user
    end
	return teamUsers
end

function QinTombUnitData:updateData( serverData )
	-- body
	local team_info = rawget(serverData, "team_info") or {}
	self:setTeam_info(team_info)

	local path = rawget(serverData, "path") or {}
	self:setPath(path)

	local begin_time = rawget(serverData, "begin_time") or 0
	self:setBegin_time(begin_time)

	local need_time = rawget(serverData, "need_time") or 0
	self:setNeed_time(need_time)

	local reborn_time = rawget(serverData, "reborn_time") or 0
	self:setReborn_time(reborn_time)


end


--获得当前
function QinTombUnitData:getCurrPointKeyPos( ... )
	-- body
	local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper") 
	local targetKey = self:getCurrPointKey()
	if targetKey then
		local targetPos = QinTombHelper.getRangePoint(targetKey)
		return targetPos
	end
	return nil
end


--获得当前
function QinTombUnitData:getCurrPointKeyMidPos( ... )
	-- body
	local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper") 
	local targetKey = self:getCurrPointKey()
	if targetKey then
		local targetPos = QinTombHelper.getMidPoint(targetKey)
		return targetPos
	end
	return nil
end



--获得当前
function QinTombUnitData:getCurrPointKey( ... )
	-- body
	--dump(self:getCurrState())
	if self:getCurrState() == QinTombConst.TEAM_STATE_IDLE or 
	   self:getCurrState() == QinTombConst.TEAM_STATE_DEATH or
	   self:getCurrState() == QinTombConst.TEAM_STATE_HOOK or
	   self:getCurrState() == QinTombConst.TEAM_STATE_PK then
		local pathList = self:getPath()
		return pathList[#pathList]
	end

	return nil
end

function QinTombUnitData:getTargetPointKey( ... )
	-- body
	if self:getCurrState() == QinTombConst.TEAM_STATE_MOVING then
		local pathList = self:getPath()
		return pathList[#pathList]
	end
	return nil
end

function QinTombUnitData:getTargetPointPos( ... )
	-- body
	local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper") 
	local targetKey = self:getTargetPointKey()
	if targetKey then
		local targetValue = QinTombHelper.getMidPoint(targetKey)
		return targetValue
	end
	return nil
end

function QinTombUnitData:getCameraKey( ... )
	-- body
	local currKey = self:getCurrPointKey()
	if currKey == nil then
		return nil
	end
	if currKey then
		local qin_point = require("app.config.qin_point")
		local point_cfg = qin_point.get(currKey)
		assert(point_cfg, "can not find qin_point by id :"..currKey)
		if point_cfg.point_type == 3 then
			return currKey
		end
	end
	return nil
end
function QinTombUnitData:getBattleMonsterId( ... )
	-- body
	local currTeamId = self:getTeamId()
	local monsterList = G_UserData:getQinTomb():getMonsterList()
	if monsterList and #monsterList > 0 then
		for i , value in ipairs(monsterList) do
			if value:getBattle_team_id() == currTeamId then
				return value:getPoint_id()
			end
			if value:getOwn_team_id() == currTeamId then
				return value:getPoint_id()
			end
		end
	end
	return 0
end

function QinTombUnitData:getBatteTeamId( ... )
	-- body
	local currTeamId = self:getTeamId()
	local monsterList = G_UserData:getQinTomb():getMonsterList()
	if monsterList and #monsterList > 0 then
		for i , value in ipairs(monsterList) do
			if value:getBattle_team_id() == currTeamId then
				return value:getOwn_team_id()
			end
			if value:getOwn_team_id() == currTeamId then
				return value:getBattle_team_id()
			end
		end
	end
	return 0
end
--获取当前状态
function QinTombUnitData:getCurrState( ... )
	-- body

	local rebornTime = self:getReborn_time()
    local curTime = G_ServerTime:getTime()
    if curTime <= rebornTime  then
		return QinTombConst.TEAM_STATE_DEATH
	end

	local currTeamId = self:getTeamId()
	local monsterList = G_UserData:getQinTomb():getMonsterList()
	if monsterList and #monsterList > 0 then
		for i , value in ipairs(monsterList) do
			if value:getBattle_team_id() == currTeamId then
				return QinTombConst.TEAM_STATE_PK
			end
			if value:getOwn_team_id() == currTeamId then
				return QinTombConst.TEAM_STATE_HOOK
			end
		end
	end

	local endingTime = self:getBegin_time()*1000 + self:getNeed_time()
	local currTime = G_ServerTime:getMSTime()
	if currTime < endingTime then
		return QinTombConst.TEAM_STATE_MOVING
	end

	return QinTombConst.TEAM_STATE_IDLE
end


function QinTombUnitData:replaceStartEndPoint(startPos, endPoint, lineList)
	-- body
	--dump(startPos)
	local QinTombHelper = require("app.scene.view.qinTomb.QinTombHelper") 
	local startPoint = startPos
	local endPoint = QinTombHelper.getRangePoint(endPoint)
	lineList[1].line[1] = {[1] = startPoint.x, [2] = startPoint.y}
	
	local endLine = lineList[#lineList].line
	endLine[#endLine] =  {[1] = endPoint.x, [2] = endPoint.y}
end

--获得该单位当前移动路径
function QinTombUnitData:getMovingPath(currX, currY )
	-- body
	--logWarn("QinTombUnitData:getMovingPath bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
	local endingTime = self:getBegin_time()*1000 + self:getNeed_time()
	local currTime = G_ServerTime:getMSTime()

	local path = self:getPath()
	--当前移动时间
	if currTime >= endingTime then
		return path[#path]
	end
	

	--dump(path)
	local returnTable = G_UserData:getQinTomb():buildPathList(path)

	--dump(self:getBegin_time())
	for i, value in ipairs(returnTable) do
		value.totalTime = value.totalTime  + self:getBegin_time()*1000 -- 总结束时长
	end

	local finalPath = self:moveToPath(returnTable, movingTime)

	self:replaceStartEndPoint(cc.p(currX, currY), path[#path] , finalPath)

	G_UserData:getQinTomb():changeToCurveList(finalPath)

	--dump(finalPath[1])
	--logWarn("QinTombUnitData:getMoqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqvingPath bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
	return finalPath
end

--[[
		local linePointData = {
		key = key1.."_"..key2, 
		line = pointList,
		len = s,
		time = s / self:_getMovingSpeed()
	}
]]
function QinTombUnitData:moveToPath( pathList )
	-- body
	--路径算法
	--服务器只给beginTime， 前端需要做一次转换
	--
	local currTime = G_ServerTime:getTime()
	local function seekIndex( ... )
		-- body
		local tempTime = movingTime
		local lastIndex = #pathList
		for i , value in ipairs(pathList) do
			if currTime <= value.totalTime then
				return i
			end
		end
		return lastIndex
	end

	local lastIndex = seekIndex()
	local tempTable = {}
	for i =lastIndex, #pathList do
		table.insert(tempTable, pathList[i])
	end

	return tempTable
end



function QinTombUnitData:isSelf(  )
	-- body
	local teamId = self:getTeamId()
	if teamId == G_UserData:getQinTomb():getSelfTeamId() then
		return true
	end

	return false
end

--玩家自己是否是队长
function QinTombUnitData:isSelfTeamLead( ... )
	-- body
	local teamLeader = self:getTeamLeaderId()
	if teamLeader == G_UserData:getBase():getId() and self:isSelf() then
		return true
	end

	return false
end
return QinTombUnitData
