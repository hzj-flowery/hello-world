local RunningManHelp = {}

local RunningManConst = require("app.const.RunningManConst")
--获取跑步状态
function RunningManHelp.getRunningState()
	-- body
	local currTime,currTimeMis = G_ServerTime:getTime()
	local startTime = G_UserData:getRunningMan():getStart_time()
	local endTime = G_UserData:getRunningMan():getEnd_time()
	local betEndTime = G_UserData:getRunningMan():getBet_end()
	local matchStart = G_UserData:getRunningMan():getMatch_start()
	local matchEnd = G_UserData:getRunningMan():getMatch_end()
	--local runningEndTime = G_UserData:getRunningMan():getRunningEndTime()
	--活动开启倒计时

	--活动尚未开启
	if currTime <= startTime then
		return RunningManConst.RUNNING_STATE_PRE_START
	end

	--活动结束
	if currTime >= endTime then
		return RunningManConst.RUNNING_STATE_END
	end

	--投注状态
	if  currTime >= startTime and currTime <= betEndTime then
		return RunningManConst.RUNNING_STATE_BET
	end

	--比赛开始等待
	if currTimeMis >= betEndTime and currTimeMis <= matchStart then
		return RunningManConst.RUNNING_STATE_WAIT
	end
	
	--跑步状态
	if currTimeMis >= matchStart and currTimeMis <= matchEnd then
		return RunningManConst.RUNNING_STATE_RUNNING
	end
	

	if currTimeMis >= matchEnd and currTimeMis <= endTime then
		return RunningManConst.RUNNING_STATE_RUNNING_END
	end
	
	return RunningManConst.RUNNING_STATE_END
end


--根据武将id， 获得当前跑步名次
function RunningManHelp.getRunningRank( heroId )
	-- body
	local runningList = G_UserData:getRunningMan():getMatch_info()

	table.sort( runningList, function(value1, value2)
		return value1:getRunningDistance() > value2:getRunningDistance()
	end )

	for i , value in ipairs(runningList) do
		if value:getHero_id() == heroId then
			return i
		end
	end

end

function RunningManHelp.getTopUnitDistance( ... )
	-- body
	local runningList = G_UserData:getRunningMan():getMatch_info()
	local runningTable, index = RunningManHelp.runningProcess()

	return runningList[index]
end

--获取跑步进度,跑的最快Index
function RunningManHelp.runningProcess( ... )
	-- body
	local maxDistance = G_UserData:getRunningMan():getMaxDistance()
	local runningTable = {}
	local runningList = G_UserData:getRunningMan():getMatch_info()

	table.sort( runningList, function(value1, value2)
		return value1:getRunningTime() < value2:getRunningTime()
	end )

	local maxIndex = 0
	local maxPercent = 0

	for i, unitData in ipairs(runningList) do
		local distance = unitData:getRunningDistance()
		local percent = distance / maxDistance
		table.insert( runningTable, {
			dist = distance, 
			maxDist = maxDistance, 
			percent = percent,
			roadNum = unitData:getRoad_num(),
			runningTime = unitData:getRunningTime()
		  } 
		)
		if maxPercent < percent then
			maxIndex = i
			maxPercent = percent
		end
	end
	return runningTable,maxIndex
end

--获得跑步结果
function RunningManHelp.getRunningResult(heroId)
	local retTable = {}
	local unitData = G_UserData:getRunningMan():getRunningUnit(heroId)
	retTable.heroId = heroId
	retTable.time = unitData:getRunningTime()
	
	local betInfo = G_UserData:getRunningMan():getBetInfo(heroId)
	if betInfo then
		retTable.heroOdds = betInfo.heroOdds
		retTable.isPlayer = betInfo.isPlayer
		retTable.user = betInfo.user
	end
	--dump(betInfo)


	return retTable
end

--获得跑步完成列表
function RunningManHelp.getRunningFinishList( runEndList )
	-- body

	local retTable = {}
	local state = RunningManHelp.getRunningState()
	
	if state == RunningManConst.RUNNING_STATE_PRE_START then
		local lastListInfo = G_UserData:getRunningMan():getLastMatchInfo()
		return lastListInfo
	end
	
	local function getHeroId( heroData )
		if heroData.isPlayer == 1 then
			return heroData.user.user_id
		end
		return heroData.heroId
	end
	
	local function isInRunEndList(heroData)
		if runEndList and #runEndList > 0 then
			local heroId = getHeroId(heroData)
			for i, data in ipairs(runEndList) do
				local tempId = getHeroId(data)
				if tempId == heroId then
					return true
				end
			end
		end
		return false
	end

	local runningList = G_UserData:getRunningMan():getMatch_info()
	if runningList and #runningList > 0 then

		table.sort( runningList, function(item1, item2) 
			return item1:getRank() < item2:getRank()
		end )

		for i, value in ipairs(runningList) do
			if value:isRunning() == false  then
				local tempTable = RunningManHelp.getRunningResult(value:getHero_id())

				if isInRunEndList(tempTable) == false then
					table.insert( retTable, tempTable )
				end

			end
		end
	end

	return retTable
end


return RunningManHelp