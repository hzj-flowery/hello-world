-- Author: hedili
-- Date:2018-01-25 10:16:30
-- Describle：

local BaseData = require("app.data.BaseData")
local RunningManUnitData = require("app.data.RunningManUnitData")
local RunningManData = class("RunningManData", BaseData)
local RunningManHelp = require("app.scene.view.runningMan.RunningManHelp")
local RunningManConst = require("app.const.RunningManConst")
local GrainCarConfigHelper = require("app.scene.view.grainCar.GrainCarConfigHelper") 
local schema = {}

--schema["bet_hero"]   = {"number", 0}
schema["user_bet"] = {"table", 0} --下注数量
schema["bet_info"] = {"table", {}}
schema["win_hero"] = {"number", 0}
schema["match_info"] = {"table", {}}
schema["start_time"] = {"number", 0} --// 活动开启时间
schema["end_time"] = {"number", 0} --// 活动结束时间
schema["bet_end"] = {"number", 0} --// 下注结束时间
schema["match_start"] = {"number", 0} --// 比赛开始时间
schema["match_end"] = {"number", 0} --// 比赛结束时间
schema["open_times"] = {"number", 0}
--开启次数
schema["histroy"] = {"table", {}}
--历史信息
--schema

local LINEAR_OFFSET = 0.5

RunningManData.schema = schema

function RunningManData:ctor(properties)
	RunningManData.super.ctor(self, properties)

	--self:resetTalkList()

	self._signalRecvPlayHorseInfo =
		G_NetworkManager:add(MessageIDConst.ID_S2C_PlayHorseInfo, handler(self, self._s2cPlayHorseInfo))

	self._signalRecvPlayHorseResult =
		G_NetworkManager:add(MessageIDConst.ID_S2C_PlayHorseResult, handler(self, self._s2cPlayHorseResult))

	self._signalRecvPlayHorseBet =
		G_NetworkManager:add(MessageIDConst.ID_S2C_PlayHorseBet, handler(self, self._s2cPlayHorseBet))

	self._signalPlayHorseBetNotice =
		G_NetworkManager:add(MessageIDConst.ID_S2C_PlayHorseBetNotice, handler(self, self._s2cPlayHorseBetNotice))
end

function RunningManData:clear()
	self._signalRecvPlayHorseInfo:remove()
	self._signalRecvPlayHorseInfo = nil

	self._signalRecvPlayHorseResult:remove()
	self._signalRecvPlayHorseResult = nil

	self._signalRecvPlayHorseBet:remove()
	self._signalRecvPlayHorseBet = nil

	self._signalPlayHorseBetNotice:remove()
	self._signalPlayHorseBetNotice = nil
end

function RunningManData:reset()
end

function RunningManData:c2sPlayHorseInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_PlayHorseInfo, {})
end

function RunningManData:getHeroBetNum(heroId)
	-- body
	local betTable = self:getUser_bet()
	if #betTable > 0 then
		for i, value in ipairs(betTable) do
			if value.hero_id == heroId then
				return value.bet_num
			end
		end
	end
	return 0
end
function RunningManData:_updateBetInfoEx(message)
	local user_bet = rawget(message, "user_bet")

	self:setUser_bet({})
	if user_bet then
		self:setUser_bet(user_bet)
	end

	local bet_info = rawget(message, "bet_info")
	if bet_info then
		for i, value in ipairs(bet_info) do
			local betInfo = self:getBetInfo(value.hero_id)
			if betInfo then
				betInfo.heroWinRate = value.hero_win_rate
				betInfo.heroBetRate = value.hero_bet_rate
				--英雄投注率
				betInfo.heroOdds = value.hero_odds --英雄赔率
				betInfo.roadNum = value.road_num
				--跑到信息
				self:setBetInfo(betInfo)
			end
		end
	end
end

function RunningManData:_updateBetInfo(message)
	-- body
	local user_bet = rawget(message, "user_bet")

	self:setUser_bet({})
	if user_bet then
		self:setUser_bet(user_bet)
	end

	local bet_info = rawget(message, "bet_info")
	self:setBet_info({})
	if bet_info then
		local tempList = {}
		for i, value in ipairs(bet_info) do
			local temp = {}
			temp.heroId = value.hero_id
			temp.heroWinRate = value.hero_win_rate
			temp.heroBetRate = value.hero_bet_rate
			--英雄投注率
			temp.heroOdds = value.hero_odds --英雄赔率
			temp.roadNum = value.road_num
			--跑到信息
			temp.isPlayer = rawget(value, "is_palyer") or 0
			temp.powerRank = value.power_rank
			temp.user = self:_converUserBaseInfo(value.user)
			table.insert(tempList, temp)
		end
		--根据跑到信息排序
		table.sort(
			tempList,
			function(item1, item2)
				return item1.roadNum < item2.roadNum
			end
		)

		dump(tempList)
		logWarn("_updateBetInfo")
		self:setBet_info(tempList)
	end
end

function RunningManData:_converUserBaseInfo(userInfo)
	-- body
	local retTable = {}
	if userInfo == nil then
		return retTable
	end

	local UserDataHelper = require("app.utils.UserDataHelper")
	local baseId, userTable = UserDataHelper.convertAvatarId(userInfo)

	retTable.playerInfo = userTable
	retTable.user_id = userInfo.user_id
	retTable.avatar_id = userInfo.avatar_id
	retTable.avatar_base_id = userInfo.avatar_base_id
	retTable.base_id = userInfo.base_id
	retTable.office_level = userInfo.office_level
	retTable.name = userInfo.name
	retTable.title = userInfo.title
	retTable.head_frame_id = userInfo.head_frame_id 
	return retTable
end
-- Describle：
function RunningManData:_s2cPlayHorseInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	
	self:_updateBetInfo(message)

	--时间更新
	local start_time = rawget(message, "start_time") or 0
	self:setStart_time(start_time)
	local end_time = rawget(message, "end_time") or 0
	self:setEnd_time(end_time)

	local bet_end = rawget(message, "bet_end") or 0
	self:setBet_end(bet_end)

	--注册一个小闹钟
	self:_registerAlarmClock(message.bet_end, message.end_time)

	local match_start = rawget(message, "match_start") or 0
	self:setMatch_start(match_start)

	local match_end = rawget(message, "match_end") or 0
	self:setMatch_end(match_end)

	local open_times = rawget(message, "open_times") or 0
	self:setOpen_times(open_times)

	self._lastMatchInfo = {}
	local lastMatchInfo = rawget(message, "last_match_info")
	if lastMatchInfo then
		local tempTable = {}
		for i, value in ipairs(lastMatchInfo) do
			local info = {}
			info.heroId = value.hero_id
			info.time = value.use_time / 10
			info.heroOdds = value.odds
			info.isPlayer = value.is_player
			info.user = self:_converUserBaseInfo(value.user)
			table.insert(tempTable, info)
		end

		table.sort(
			tempTable,
			function(itemSort1, itemSort2)
				-- body
				return itemSort1.time < itemSort2.time
			end
		)
		self._lastMatchInfo = tempTable
	end

	local histroy = rawget(message, "histroy")
	if histroy then
		self:setHistroy(histroy)
	end

	--在非跑步状态，需要清空比赛信息
	local state = RunningManHelp.getRunningState()
	if state <= RunningManConst.RUNNING_STATE_BET then
		self:setWin_hero(0)
		self:setMatch_info({})
	end

	--活动结束，跑步结束，重置talk
	if state == RunningManConst.RUNNING_STATE_END or state == RunningManConst.RUNNING_STATE_RUNNING_END then
		self:resetTalkList()
	end

	--*************暗度陈仓，替换跑马***********
	local grainCarStartTime = rawget(message, "grain_car_st_time") or 0
	local grainCarInterval = GrainCarConfigHelper.getGrainCarEndTimeStamp() - GrainCarConfigHelper.getGrainCarOpenTimeStamp()
	if grainCarStartTime > 0 and math.abs(start_time - grainCarStartTime) <= grainCarInterval  then
		--如果大于0 说明开服天数足够开暗度陈仓，和跑马时间基本一致，跑马就不开启
		self:setStart_time(0)
		self:setMatch_end(0)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_PLAY_HORSE_INFO_SUCCESS)
	--因为跑男时间变化，需要刷新主界面
	G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RUNNING_MAN)
end

-- Describle：比赛结果信息
function RunningManData:getLastMatchInfo(...)
	-- body
	return self._lastMatchInfo
end

function RunningManData:c2sPlayHorseResult()
	G_NetworkManager:send(MessageIDConst.ID_C2S_PlayHorseResult, {})
end

-- Describle：
function RunningManData:_s2cPlayHorseResult(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	--check data
	self:setWin_hero(0)
	local win_hero = rawget(message, "win_hero")
	if win_hero then
		self:setWin_hero(win_hero)
	end

	self:setMatch_info({})
	local match_info = rawget(message, "match_info")
	if match_info then
		local tempList = {}
		for i, value in ipairs(match_info) do
			local temp = RunningManUnitData.new(value)
			local betInfo = self:getBetInfo(temp:getHero_id())
			if betInfo then
				temp:setRoad_num(betInfo.roadNum)
				temp:setRank(value.rank)
				table.insert(tempList, temp)
			end
		end

		--根据跑道做排序
		table.sort(
			tempList,
			function(item1, item2)
				--由小到大排序
				return item1:getRoad_num() < item2:getRoad_num()
			end
		)

		self:setMatch_info(tempList)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_PLAY_HORSE_RESULT_SUCCESS)
end

-- Describle：跑马押注
-- Param:
--	hero_id
function RunningManData:c2sPlayHorseBet(hero_id, num)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_PlayHorseBet,
		{
			hero_id = hero_id,
			num = num
		}
	)
end

--押注同步
function RunningManData:_s2cPlayHorseBetNotice(id, message)
	-- body
	--if message.ret ~= MessageErrorConst.RET_OK then
	--	return
	--end

	local function updateBet(value)
		-- body
		local heroId = rawget(value, "hero")
		local bet_rate = rawget(value, "bet_rate")
		if heroId and bet_rate then
			local betInfoList = self:getBet_info()
			if betInfoList and #betInfoList > 0 then
				for i, value in ipairs(betInfoList) do
					if value.heroId == heroId then
						betInfoList[i].heroBetRate = bet_rate
					end
				end
			end
		end
	end

	--更新下注率
	local bet_info = rawget(message, "bet_info") or {}
	if #bet_info > 0 then
		for i, value in ipairs(bet_info) do
			updateBet(value)
		end
	end

	G_SignalManager:dispatch(SignalConst.EVENT_PLAY_HORSE_BET_NOTICE)
end
-- Describle：
function RunningManData:_s2cPlayHorseBet(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self:_updateBetInfoEx(message)

	G_SignalManager:dispatch(SignalConst.EVENT_PLAY_HORSE_BET_SUCCESS)
end

function RunningManData:getRunningUnit(heroId)
	-- body
	local list = self:getMatch_info()
	if list and #list > 0 then
		for i, value in ipairs(list) do
			if value:getHero_id() == heroId then
				return value
			end
		end
		assert(false, string.format("can't find heroId [%d] in RunningManData Match_info table", heroId))
	end
	return nil
end

--跑步状态，恢复running
function RunningManData:resumeRunning(...)
	-- body
	local list = self:getMatch_info()
	if list and #list > 0 then
		for i, value in ipairs(list) do
			value:resumeRunning()
		end
	end
end

function RunningManData:getBetInfo(heroId)
	local betInfo = self:getBet_info()
	if betInfo and #betInfo > 0 then
		for i, value in ipairs(betInfo) do
			if value.heroId == heroId then
				return value
			end
		end
	end
	return nil
end

function RunningManData:setBetInfo(info)
	-- body
	local betInfo = self:getBet_info()
	for i, value in ipairs(betInfo) do
		if value.heroId == info.heroId then
			betInfo[i] = info
			break
		end
	end

	self:setBet_info(betInfo)
end

--获得跑道距离
function RunningManData:getMaxDistance(...)
	-- body
	local maxDistance = 0
	local play_horse_info = require("app.config.play_horse_info")
	local partNumber = play_horse_info.get(1).part_number
	local lineSeq = string.split(partNumber, "|")
	for i, value in ipairs(lineSeq) do
		maxDistance = tonumber(value) + maxDistance
	end
	return maxDistance
end

--获取跑马押注消耗价格
function RunningManData:getRunningCostValue(...)
	-- body
	local play_horse_info = require("app.config.play_horse_info")
	local costType = play_horse_info.get(1).type
	local costValue = play_horse_info.get(1).value
	local costSize = play_horse_info.get(1).size
	local support_max = play_horse_info.get(1).support_max
	local player_max = play_horse_info.get(1).people_max
	local costValue = {
		type = costType,
		value = costValue,
		size = costSize,
		playerMax = player_max,
		limitMax = support_max
	}
	return costValue
end

--获得跑动结束时间
function RunningManData:getRunningEndTime(...)
	-- body
	local startTime = self:getMatch_start()
	local list = self:getMatch_info()
	local maxTime = 0
	if #list > 0 then
		for i, value in ipairs(list) do
			maxTime = math.max(maxTime, value:getRunningTime())
		end
	end

	return startTime + maxTime
end

--获取跑动时间
function RunningManData:getRunningTime(...)
	-- body
	local currTime, misTime = G_ServerTime:getTime()
	local startTime = self:getMatch_start()
	local runningTime = 0
	local runningEndTime = self:getMatch_end()

	if misTime >= startTime and misTime <= runningEndTime then
		return misTime - startTime
	end
	--不在跑动状态
	return 0
end

-- 注册一个小闹钟 跑马结束 拉取下一个跑马 和 提前开启刷新主界面
function RunningManData:_registerAlarmClock(betEnd, endTime)
	if not endTime then
		return
	end

	local curTime = G_ServerTime:getTime()
	if curTime <= endTime then
		G_ServiceManager:registerOneAlarmClock(
			"RUNNING_MAN_GET_NEXT",
			endTime + 1,
			function()
				local FunctionCheck = require("app.utils.logic.FunctionCheck")
				local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RUNNING_MAN)
				if isOpen then
					self:c2sPlayHorseInfo()
				end
			end
		)
	end

	if not betEnd then
		return
	end
	local curTime = G_ServerTime:getTime()
	if curTime <= betEnd then
		G_ServiceManager:registerOneAlarmClock(
			"RUNNING_MAN_BET_END",
			betEnd + 1,
			function()
				local FunctionCheck = require("app.utils.logic.FunctionCheck")
				local isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_RUNNING_MAN)
				if isOpen then
					--下注结束，需要主页面icon。
					G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_RUNNING_MAN)
				end
			end
		)
	end
end

function RunningManData:resetTalkList(...)
	-- body
	self._waitTalkList = nil
	self._runningTalkList = nil
	self._playerTalkList = nil

	if self._waitTalkList == nil then
		self._waitTalkList = self:_makeWaitTalkList()
	end

	if self._playerTalkList == nil then
		self._playerTalkList = self:_makePlayerTalkList()
	end

	if self._runningTalkList == nil then
		self._runningTalkList = self:_makeRunningTalkList()
	end
end

--根据英雄id，获取等待时的说话内容
function RunningManData:getWaitTalkStr(heroId)
	-- body
	if self._waitTalkList == nil then
		self._waitTalkList = self:_makeWaitTalkList()
	end

	local leftTime = G_ServerTime:getLeftSeconds(self:getMatch_start())

	local listData = self._waitTalkList["k" .. heroId]
	if listData then
		for i, value in ipairs(listData) do
			if leftTime <= value.showTime and leftTime >= value.minTime then
				return value.content
			end
		end
	end
	return nil
end

--根据排行，获取跑动时的说话内容
function RunningManData:getPlayerWaitTalkStr(rank)
	if self._playerTalkList == nil then
		self._playerTalkList = self:_makePlayerTalkList()
	end

	local leftTime = G_ServerTime:getLeftSeconds(self:getMatch_start())
	local listData = self._playerTalkList["k" .. rank]
	if listData then
		for i, value in ipairs(listData) do
			if leftTime <= value.showTime and leftTime >= value.minTime then
				return value.content
			end
		end
	end
	return nil
end

--根据排行，获取跑动时的说话内容
function RunningManData:getRunningTalkStr(rank)
	if self._runningTalkList == nil then
		self._runningTalkList = self:_makeRunningTalkList()
	end

	local time = self:getRunningTime()
	local listData = self._runningTalkList["k" .. rank]
	if listData then
		for i, value in ipairs(listData) do
			if time >= value.showTime and time <= value.maxTime and value.needShow then
				return value.content
			end
		end
	end
	return nil
end

function RunningManData:_makePlayerTalkList(...)
	-- body
	local function makeList(data)
		-- body
		local retList = {}
		local stringList = string.split(data.bubble_time, "|")

		for i, value in ipairs(stringList) do
			local minList = string.split(value, ",")
			local min, max = unpack(string.split(value, ","))

			local showTime = math.random(tonumber(min), tonumber(max))
			local index = math.random(1, 4)
			local talkStr = data["text_" .. index]
			table.insert(
				retList,
				{
					showTime = showTime,
					content = talkStr,
					minTime = tonumber(min),
					maxTime = tonumber(max)
				}
			)
		end
		return retList
	end

	local retList = {}
	local play_horse_player = require("app.config.play_horse_player")
	for i = 1, play_horse_player.length() do
		local data = play_horse_player.indexOf(i)
		local list = makeList(data)
		retList["k" .. data.rank] = list
	end
	return retList
end

--生成等待时的跑男说话数据
function RunningManData:_makeWaitTalkList()
	-- body
	local function makeList(data)
		-- body
		local retList = {}
		local stringList = string.split(data.bubble_time, "|")

		for i, value in ipairs(stringList) do
			local minList = string.split(value, ",")
			local min, max = unpack(string.split(value, ","))

			local showTime = math.random(tonumber(min), tonumber(max))
			local index = math.random(1, 4)
			local talkStr = data["text_" .. index]
			table.insert(
				retList,
				{
					showTime = showTime,
					content = talkStr,
					minTime = tonumber(min),
					maxTime = tonumber(max)
				}
			)
		end
		return retList
	end
	local retList = {}
	local play_horse_hero = require("app.config.play_horse_hero")
	for i = 1, play_horse_hero.length() do
		local data = play_horse_hero.indexOf(i)
		local list = makeList(data)
		retList["k" .. data.hero_id] = list
	end
	return retList
end

--生成跑动时，跑男说话数据
function RunningManData:_makeRunningTalkList()
	-- body
	local function makeList(data)
		-- body
		local retList = {}
		local stringList = string.split(data.bubble_time, "|")
		local percentList = string.split(data.probability, "|")
		for i, value in ipairs(stringList) do
			local min, max = unpack(string.split(value, ","))
			local showTime = math.random(tonumber(min), tonumber(max))
			local startIndex = (i - 1) * 4 + 1
			local index = math.random(startIndex, startIndex + 3)

			local talkStr = data["text_" .. index]
			local percent = tonumber(percentList[i])
			local rand = math.random(1, 1000)

			table.insert(
				retList,
				{
					showTime = showTime,
					minTime = tonumber(min),
					maxTime = tonumber(max),
					needShow = (rand <= percent),
					content = talkStr,
					percent = percent
				}
			)
		end
		return retList
	end
	local retList = {}
	local play_horse_bubble = require("app.config.play_horse_bubble")
	for i = 1, play_horse_bubble.length() do
		local data = play_horse_bubble.indexOf(i)
		local list = makeList(data)
		retList["k" .. data.rank] = list
	end
	return retList
end

--跑男小红点
function RunningManData:hasRedPoint(...)
	-- body
	local state = RunningManHelp.getRunningState()
	if state == RunningManConst.RUNNING_STATE_BET then
		local betTable = self:getUser_bet()
		if betTable and #betTable > 0 then
			return false
		end
		return true
	end
	return false
end

--==============================--
--[[
--构建测试数据
function RunningManData:makePlayHourseInfo( ... )
	local dataTable = {
		 
		 bet_info = {
			 [1] = {
				 hero_bet_rate = 0,
				 hero_id = 405,
				 hero_odds = 24,
				 hero_win_rate = 0,
				 road_num = 1,
			 },
			 [2] = {
				 hero_bet_rate = 0,
				 hero_id = 108,
				 hero_odds = 18,
				 hero_win_rate = 4,
				 road_num = 2,
			 },
			 [3] = {
				 hero_bet_rate = 0,
				 hero_id = 201,
				 hero_odds = 16,
				 hero_win_rate = 9,
				 road_num = 3,
			 },
			 [4] = {
				 hero_bet_rate = 0,
				 hero_id = 308,
				 hero_odds = 7,
				 hero_win_rate = 9,
				 road_num = 4,
			 },
			 [5] = {
				 hero_bet_rate = 0,
				 hero_id = 319,
				 hero_odds = 7,
				 hero_win_rate = 19,
				 road_num = 5,
			 },
		 },
		 start_time = G_ServerTime:getTime() + 3,
		 bet_end  = G_ServerTime:getTime() + 10,
		 end_time = G_ServerTime:getTime() + 500,
		 match_start = G_ServerTime:getTime() + 12,
		 match_end = G_ServerTime:getTime() + 12+ 100,
		 open_times = 10,
		 ret = 1,
	}
	self:_s2cPlayHorseInfo(nil,dataTable)
end

function RunningManData:makePlayHourseResult( ... )
	-- body
	local dataTable = {
		match_info = {
			 [1] = {
				 hero_id = 405,
				 use_time = {
					 [1] = 127,
					 [2] = 130,
					 [3] = 177,
					 [4] = 12,
					 [5] = 106,
					 [6] = 117,
					 [7] = 177,
					 [8] = 12,
					 [9] = 106,
					 [10] = 117,
				 }
			 },
			 [2] = {
				 hero_id = 108,
				 use_time = {
					 [1] = 49,
					 [2] = 83,
					 [3] = 85,
					 [4] = 117,
					 [5] = 117,
					 [6] = 122,
					 [7] = 177,
					 [8] = 12,
					 [9] = 106,
					 [10] = 117,
				 }
			 },
			 [3] = {
				 hero_id = 201,
				 use_time = {
					 [1] = 51,
					 [2] = 77,
					 [3] = 85,
					 [4] = 89,
					 [5] = 100,
					 [6] = 105,
					 [7] = 177,
					 [8] = 12,
					 [9] = 106,
					 [10] = 117,	  					 
				 }
			 },
			 [4] = {
				 hero_id = 308,
				 use_time = {
					 [1] = 38,
					 [2] = 62,
					 [3] = 80,
					 [4] = 92,
					 [5] = 114,
					 [6] = 116,
					 [7] = 177,
					 [8] = 12,
					 [9] = 106,
					 [10] = 117,	
				 }
			 },
			 [5] = {
				 hero_id = 319,
				 use_time = {
					 [1] = 39,
					 [2] = 86,
					 [3] = 87,
					 [4] = 103,
					 [5] = 105,
					 [6] = 119,
					 [7] = 177,
					 [8] = 12,
					 [9] = 106,
					 [10] = 117,
				 }
			 },

		 },
		 ret = 1,
		 win_hero = 405,
	}

	self:_s2cPlayHorseResult(nil,dataTable)
end
]]
--==============================--

return RunningManData
