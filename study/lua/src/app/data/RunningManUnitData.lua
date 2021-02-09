-- Author: hedili
-- Date:2018-01-25 10:16:30
-- Describle：

local BaseData = require("app.data.BaseData")
local RunningManUnitData = class("RunningManUnitData", BaseData)

local schema = {}
schema["hero_id"]   = {"number", 0}
schema["use_time"]  = {"table"}
schema["road_num"] = {"number", 0} --跑到
schema["rank"] = {"number",0}

--schema

local LINEAR_OFFSET = 0.2

RunningManUnitData.schema = schema

function RunningManUnitData:ctor(properties)
	self._distance = 0 --跑动距离，每次比赛开始时重置
	self._totalDistance = 0
	self._totalTime = 0
	self._lineInfoList= nil

	RunningManUnitData.super.ctor(self, properties)
end

function RunningManUnitData:clear()

end

function RunningManUnitData:reset()

end


function RunningManUnitData:getTotalDistance( ... )
	-- body
	if self._totalDistance == 0 then
		local play_horse_info = require("app.config.play_horse_info")
		local partNumber = play_horse_info.get(1).part_number
		local lineSeq = string.split(partNumber, "|")
		for i, value in ipairs(lineSeq) do
			self._totalDistance = tonumber(value) + self._totalDistance
		end
	end
	return self._totalDistance
end

function RunningManUnitData:_getSeqInfoList()
	-- body
	--获得总段数
	if self._lineInfoList == nil then 
		local lineInfoList = {}
		local play_horse_info = require("app.config.play_horse_info")
		local partNumber = play_horse_info.get(1).part_number
		local lineSeq = string.split(partNumber, "|")
		--获得每段所需时间
		local lineTime = self:getLineTime()

		if #lineSeq ~= #lineTime then
			--dump(#lineSeq)
			--dump(#lineTime)
			assert(false, "!@!!!!!!!!!!!!!!!!")
		end
		local lastLineInfo = {
			distance = 0,
			time = 0,
			toSpeed = 0,
			totalTime = 0,
		}
		for i, value in ipairs(lineSeq) do
			local lineInfo = {
				distance = lastLineInfo.distance + tonumber(value), --距离
				time 	 = lastLineInfo.totalTime + lineTime[i] - LINEAR_OFFSET,	    --跑完时间
				seqDistacne = tonumber(value), --一段长度
				seqTime =  lineTime[i],
				accTime  = lastLineInfo.totalTime + LINEAR_OFFSET,
				startTime = lastLineInfo.totalTime,
				normalSpeed = tonumber(value) / (lineTime[i] -LINEAR_OFFSET),
			}
			lineInfo = self:_buildAccSpeed(lastLineInfo,lineInfo)
			table.insert(lineInfoList,lineInfo)
			lastLineInfo = lineInfo
		end
		self._lineInfoList = lineInfoList
	end

	return self._lineInfoList
end


function RunningManUnitData:_buildAccSpeed( lastLineInfo,lineInfo )
	-- body
	local toSpeed = lineInfo.distance / lineInfo.time
	lineInfo.startSpeed = lastLineInfo.toSpeed
	lineInfo.toSpeed = lineInfo.normalSpeed
	lineInfo.totalTime = lineInfo.time + LINEAR_OFFSET
	return lineInfo
end

--根据当前速度,目标速度，时间，获得插值速度
function RunningManUnitData:_getAccSpeed(lineInfo, time)
	local retSpeed = 0
	local needTime = 1
	
	local offset =  ( lineInfo.toSpeed - lineInfo.startSpeed ) / needTime
	retSpeed = offset* (time - lineInfo.startTime) + lineInfo.startSpeed
	return retSpeed
end


function RunningManUnitData:getMoveSpeed(  currTime )
	-- body
	local totalTime = currTime
	local lineInfoList = self:_getSeqInfoList()
	local lastValue = {}
	lastValue.totalTime = 0
	lastValue.accTime = 0
	
	for i, value in ipairs(lineInfoList) do
		if totalTime >= value.startTime and totalTime <= value.totalTime  then
			lastValue = value
			break
		end
	end

	if currTime > lastValue.accTime then
		return lastValue.toSpeed
	end

	if currTime < lastValue.accTime then
		return self:_getAccSpeed(lastValue, currTime)
	end

	return nil
end

function RunningManUnitData:isRunning( ... )
	-- body
	local runningTime = G_UserData:getRunningMan():getRunningTime()
	if runningTime > 0 then
		if self._distance >= self:getTotalDistance() then
			return false
		end
		return true
	end

	return false
end


--根据当前时间，确定武将位置
function RunningManUnitData:_procDistanceByTime()
	-- body
	local runningTime = G_UserData:getRunningMan():getRunningTime()

	local lastValue = {}
	lastValue.totalTime = 0
	lastValue.accTime = 0
	
	if runningTime >= self:getRunningTime() then
		self._distance = self:getTotalDistance()
		return
	end
	
	local function getLastValue( runningTime )
		local lineInfoList = self:_getSeqInfoList()
		for i, value in ipairs(lineInfoList) do
			if runningTime >= value.startTime and runningTime <= value.totalTime then
				return value
			end
		end
		return nil
	end
	local lastValue = getLastValue(runningTime)
	if lastValue == nil then
		self._distance = self:getTotalDistance()
		return
	end

	--dump(lastValue)
	local currSeqTime = runningTime - lastValue.startTime
	local currDist = (lastValue.seqDistacne / lastValue.seqTime) * currSeqTime
	--dump(currDist)
	local distance = lastValue.distance - lastValue.seqDistacne + currDist

	self._distance = distance
	return distance
end

--跑步开始
function RunningManUnitData:resumeRunning()
	self:_procDistanceByTime()
end

--更新跑步进度
function RunningManUnitData:updateRunning( dt )
	-- body
	--logWarn("RunningManUnitData:updateRunning")

	if self:isRunning() then

		self:_procDistanceByTime()
		if self._distance == self:getTotalDistance() then
			G_SignalManager:dispatch(SignalConst.EVENT_PLAY_HORSE_HERO_RUNNING_END, self:getHero_id())
		end
		--local totalTime = G_UserData:getRunningMan():getRunningTime()
		--local speed = self:getMoveSpeed(totalTime)
		--if speed == nil then
			--跑到终点弹出界面，播放动画
		--	self._distance = self:getTotalDistance()
		--	G_SignalManager:dispatch(SignalConst.EVENT_PLAY_HORSE_HERO_RUNNING_END, self:getHero_id())
		--	return
		--end

		--local detalS = speed * dt
		--self._distance = detalS + self._distance
	end
end

--获取跑动距离
function RunningManUnitData:getRunningDistance( ... )
	-- body
	return self._distance
end


function RunningManUnitData:getTotoalTime( ... )
	-- body
	local retTime = 0 
	local retList = {}
	local timeList = self:getUse_time()
	for i ,value in ipairs(timeList) do
		retTime = value + retTime
	end
	
	return retTime
end

function RunningManUnitData:getLineTime( ... )
	-- body
	local retList = {}
	local timeList = self:getUse_time()
	for i ,value in ipairs(timeList) do
		local tempValue = value * 0.1
		table.insert( retList, tempValue )
	end
	return retList
end
--获取单个英雄跑步时间
function RunningManUnitData:getRunningTime( ... )
	-- body
	if self._totalTime == 0 then
		local time = 0
		local timeList = self:getLineTime()
		for i, value in ipairs(timeList) do
			time = value + time
		end
		self._totalTime = time
	end
	return self._totalTime
end

return RunningManUnitData
