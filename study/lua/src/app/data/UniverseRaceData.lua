
--真武战神数据
local BaseData = require("app.data.BaseData")
local UniverseRaceData = class("UniverseRaceData", BaseData)
local UniverseRaceUserData = require("app.data.UniverseRaceUserData")
local UniverseRaceMatchData = require("app.data.UniverseRaceMatchData")
local UniverseRaceGroupReportData = require("app.data.UniverseRaceGroupReportData")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local UniverseRaceSupportUnitData = require("app.data.UniverseRaceSupportUnitData")
local UniverseRacePlayerRankData = require("app.data.UniverseRacePlayerRankData")
local UniverseRaceWinnerData = require("app.data.UniverseRaceWinnerData")
local UniverseRaceChipInData = require ("app.data.UniverseRaceChipInData")


local schema = {}
schema["begin_time"] = {"begin_time", 0}
schema["create_time"] = {"create_time", 0}
schema["now_round"] = {"number", 0}
schema["round_begin_time"] = {"number", 0}
schema["curWatchPos"] = {"number", 0}
UniverseRaceData.schema = schema

function UniverseRaceData:ctor(properties)
	UniverseRaceData.super.ctor(self, properties)

	self._userDatas = {} --选手数据
	self._matchDatas = {} --比赛数据
	self._groupReportDatas = {} --战报数据
	self._userDetailInfo = {} --玩家信息
	self._supportSingleDatas = {} --单场竞猜支持数据
	self._supportMultipleDatas = {} --串联竞猜支持数据
	self._guessRankDatas = {} --竞猜排行
	self._myGuessRankData = nil --自己的竞猜排行
	self._pastChampions = {} --历代冠军数据
	self._jackpot = 0 --奖池奖金数
	self:_formatPosMap()

	self._recvGetUniverseRacePkInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUniverseRacePkInfo, handler(self, self._s2cGetUniverseRacePkInfo))
	self._recvUpdateUniverseRacePkInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateUniverseRacePkInfo, handler(self, self._s2cUpdateUniverseRacePkInfo))
	self._recvSyncUniverseRaceActInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_SyncUniverseRaceActInfo, handler(self, self._s2cSyncUniverseRaceActInfo))
	self._recvUniverseRaceChangeEmbattle = G_NetworkManager:add(MessageIDConst.ID_S2C_UniverseRaceChangeEmbattle, handler(self, self._s2cUniverseRaceChangeEmbattle))
	self._recvUpdateUniverseRaceEmbattle = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateUniverseRaceEmbattle, handler(self, self._s2cUpdateUniverseRaceEmbattle))
	self._recvGetBattleReport = G_NetworkManager:add(MessageIDConst.ID_S2C_GetBattleReport, handler(self, self._s2cGetBattleReport))
	self._recvGetUniverseRacePositionInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUniverseRacePositionInfo, handler(self, self._s2cGetUniverseRacePositionInfo))
	self._recvUniverseRaceSupport = G_NetworkManager:add(MessageIDConst.ID_S2C_UniverseRaceSupport, handler(self, self._s2cUniverseRaceSupport))
	self._recvSyncUniverseRaceGuess = G_NetworkManager:add(MessageIDConst.ID_S2C_SyncUniverseRaceGuess, handler(self, self._s2cSyncUniverseRaceGuess))
	self._recvGetUniverseRaceWiner = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUniverseRaceWiner, handler(self, self._s2cGetUniverseRaceWiner))
	self._recvGetUniverseRaceWinerDetail = G_NetworkManager:add(MessageIDConst.ID_S2C_GetUniverseRaceWinerDetail, handler(self, self._s2cGetUniverseRaceWinerDetail))
	self._recvSyncUniverseRaceGuessPot = G_NetworkManager:add(MessageIDConst.ID_S2C_SyncUniverseRaceGuessPot, handler(self, self._s2cSyncUniverseRaceGuessPot))
end

function UniverseRaceData:clear()
	self._recvGetUniverseRacePkInfo:remove()
	self._recvGetUniverseRacePkInfo = nil
	self._recvUpdateUniverseRacePkInfo:remove()
	self._recvUpdateUniverseRacePkInfo = nil
	self._recvSyncUniverseRaceActInfo:remove()
	self._recvSyncUniverseRaceActInfo = nil
	self._recvUniverseRaceChangeEmbattle:remove()
	self._recvUniverseRaceChangeEmbattle = nil
	self._recvUpdateUniverseRaceEmbattle:remove()
	self._recvUpdateUniverseRaceEmbattle = nil
	self._recvGetBattleReport:remove()
	self._recvGetBattleReport = nil
	self._recvGetUniverseRacePositionInfo:remove()
	self._recvGetUniverseRacePositionInfo = nil
	self._recvUniverseRaceSupport:remove()
	self._recvUniverseRaceSupport = nil
	self._recvSyncUniverseRaceGuess:remove()
	self._recvSyncUniverseRaceGuess = nil
	self._recvGetUniverseRaceWiner:remove()
	self._recvGetUniverseRaceWiner = nil
	self._recvGetUniverseRaceWinerDetail:remove()
	self._recvGetUniverseRaceWinerDetail = nil
	self._recvSyncUniverseRaceGuessPot:remove()
	self._recvSyncUniverseRaceGuessPot = nil
end

function UniverseRaceData:reset()
	self._userDatas = {}
	self._matchDatas = {}
	self._groupReportDatas = {}
	self._userDetailInfo = {}
	self._supportSingleDatas = {}
	self._supportMultipleDatas = {}
	self._guessRankDatas = {}
	self._myGuessRankData = nil
	self._pastChampions = {}
	self._jackpot = 0
end

function UniverseRaceData:_formatPosMap()
	self._posMap = {}
	self._round2Pos = {}
	self._pos2Series = {} --每个位置对应的串联分组号
	local config = require("app.config.pvpuniverse_group")
	local len = config.length()
	for i = 1, len do
		local info = config.indexOf(i)
		local competitor = info.competitor
		local nextIndex = info.next_position
		local side = info.side
		local round = info.round
		local series = info.series
		if nextIndex > 0 then
			if self._posMap[nextIndex] == nil then
				self._posMap[nextIndex] = {}
			end
			self._posMap[nextIndex][side] = competitor
			if self._pos2Series[nextIndex] == nil then
				self._pos2Series[nextIndex] = series
			end
		end
		if self._round2Pos[round] == nil then
			self._round2Pos[round] = {}
		end
		if self._round2Pos[round][nextIndex] == nil then
			self._round2Pos[round][nextIndex] = true
		end
	end
end

function UniverseRaceData:_formatMapRelation(random)
	self._index2Pos, self._pos2Index = UniverseRaceDataHelper.getTransformMapRelation(random)
end

function UniverseRaceData:getPosWithIndex(index)
	local pos = self._index2Pos[index]
	return pos
end

function UniverseRaceData:getPosWithIndexAndSide(index, side)
	local pos = self:getPosWithIndex(index)
	local sidePos = self._posMap[pos][side]
	return sidePos
end

function UniverseRaceData:getIndexAndSideWithPos(pos)
	local nextPos = UniverseRaceDataHelper.getGroupConfig(pos).next_position
	local index = self._pos2Index[nextPos]
	local posMap = self._posMap[nextPos] or {}
	for side, sidePos in pairs(posMap) do
		if pos == sidePos then
			return index, side
		end
	end
	return 0, 0 --表示是冠军位置
end

function UniverseRaceData:getPrePosOfPos(pos)
	local result = self._posMap[pos]
	assert(result, string.format("UniverseRaceData:getPrePosOfPos is wrong! pos = %d", pos))
	return result
end

function UniverseRaceData:getRoundWithPosition(pos)
	for round, info in pairs(self._round2Pos) do
		if info[pos] == true then
			return round
		end
	end
	return 0
end

function UniverseRaceData:getSeriesWithPos(pos)
	return self._pos2Series[pos] or 0
end

function UniverseRaceData:getUserDatas()
	return self._userDatas
end

function UniverseRaceData:getUserDataWithId(userId)
	local userData = self._userDatas[userId]
	return userData
end

function UniverseRaceData:getMatchDataWithPosition(position)
	local matchData = self._matchDatas[position]
	return matchData
end

function UniverseRaceData:getUserDataWithPosition(position)
	local matchData = self:getMatchDataWithPosition(position)
	if matchData then
		local userId = matchData:getUser_id()
		local isHide = matchData:isHide()
		local userData = self:getUserDataWithId(userId)
		return userData, isHide
	end
	return nil, true
end

function UniverseRaceData:getGroupReportData(position)
	return self._groupReportDatas[position]
end

function UniverseRaceData:getUserDetailInfoWithId(userId)
	return self._userDetailInfo[userId]
end

function UniverseRaceData:getResultStateWithPosition(position, side)
	local reportPos = UniverseRaceDataHelper.getGroupConfig(position).next_position
	local groupReportData = self:getGroupReportData(reportPos)
	if groupReportData then
		local state = groupReportData:getResultStateWithSide(side)
		return state
	else
		return UniverseRaceConst.RESULT_STATE_NONE
	end
end

function UniverseRaceData:getReportStateWithPosition(position)
	local nowRound = self:getNow_round()
	local round = self:getRoundWithPosition(position)
	if round > nowRound then
		return UniverseRaceConst.MATCH_STATE_BEFORE
	elseif round == nowRound then
		return UniverseRaceConst.MATCH_STATE_ING
	elseif round < nowRound then
		return UniverseRaceConst.MATCH_STATE_AFTER
	end
end

--找到当前轮次自己所在场次索引
function UniverseRaceData:findSelfRacePosOfCurRound()
	local selfId = G_UserData:getBase():getId()
	local racePos = self:findRacePosOfCurRound(selfId)
	
	return racePos
end

--找到当前轮次某玩家所在场次索引
function UniverseRaceData:findRacePosOfCurRound(userId)
	local nowRound = self:getNow_round()
	local posInfo = self._round2Pos[nowRound] or {}
	for pos, v in pairs(posInfo) do
		local prePos = self:getPrePosOfPos(pos)
		for side, tempPos in pairs(prePos) do
			local userData, isHide = self:getUserDataWithPosition(tempPos)
			if userData and isHide == false then
				local id = userData:getUser_id()
				if id == userId then
					return pos
				end
			end
		end
	end
	return 0 --没在当前轮次，返回0
end

--根据时间计算当前是第几局比赛
function UniverseRaceData:getCurMatchIndexByPos(pos)
	local matchIndex = 0

	local groupReportData = self:getGroupReportData(pos)
	local num = 1
	if groupReportData then
		num = groupReportData:getReportNum() + 1
	end
	 
	local maxWinNum = UniverseRaceConst.getWinMaxNum()
	local maxNum = maxWinNum*2-1
	if num >= 1 and num <= maxNum then --正确的范围：1~5
		matchIndex = num
	end
	if matchIndex == 0 then
		logWarn(string.format("UniverseRaceData:getCurMatchIndexByPos()--- pos = %d", pos))
	end
	return matchIndex
end

--获取先手索引，1左，2右
--规则：第1、3、5局高战力先手，2、4局低战力先手
function UniverseRaceData:getFirstHandPos(pos)
	local firstHandPos = 0
	local matchIndex = self:getCurMatchIndexByPos(pos)
	local prePos = self:getPrePosOfPos(pos)
	local pos1 = prePos[1]
	local pos2 = prePos[2]
	local userData1 = self:getUserDataWithPosition(pos1)
	local userData2 = self:getUserDataWithPosition(pos2)
	if userData1 and userData2 then
		local power1 = userData1:getPower()
		local power2 = userData2:getPower()
		local maxPowerPos = 0
		local minPowerPos = 0
		if power1 >= power2 then
			maxPowerPos = pos1
			minPowerPos = pos2
		else
			maxPowerPos = pos2
			minPowerPos = pos1
		end
		if matchIndex % 2 == 1 then
			firstHandPos = maxPowerPos
		else
			firstHandPos = minPowerPos
		end
	end

	return firstHandPos
end

--获取某轮的所有比赛位置
function UniverseRaceData:getPositionWithRound(round)
	local result = {}
	local indexs = UniverseRaceConst.getIndexsWithRound(round)
	for i, index in ipairs(indexs) do
		local pos = self:getPosWithIndex(index)
		table.insert(result, pos)
	end
	return result
end

function UniverseRaceData:getSupportSingleUnitDataWithPosition(position)
	local unitData = self._supportSingleDatas[position]
	return unitData
end

function UniverseRaceData:getSupportMutipleUnitDataWithPosition(position)
	local unitData = self._supportMultipleDatas[position]
	return unitData
end

function UniverseRaceData:getGuessRankList()
	local result = self._guessRankDatas
	table.sort(result, function(a, b)
		return a:getRank() < b:getRank()
	end)

	return result
end

function UniverseRaceData:getMyGuessRank()
	return self._myGuessRankData
end

function UniverseRaceData:getPastChampionDataWithActId(actId)
	return self._pastChampions[actId]
end

function UniverseRaceData:getPastChampionList()
	local result = {}
	for k, data in pairs(self._pastChampions) do
		table.insert(result, data)
	end
	table.sort(result, function(a, b)
		return a:getAct_id() < b:getAct_id()
	end)

	local count = 4 - #result --补齐4个
	if count > 0 then
		for i = 1, count do
			table.insert(result, {isEmpty = true})
		end
	end
	
	return result
end

--找到当前聚焦的位置
--对于参赛者 一直聚焦到自己身上 
--对于观众 聚焦到左上角即将开始比赛的人物身上
--打到16进8比赛时聚焦到中心冠军台子位置
function UniverseRaceData:getCurFocusIndex()
	local focusIndex = 1
	local nowRound = self:getNow_round()
	if nowRound >= 3 then
		focusIndex = 31 --冠军位置
	else
		local selfPos = 0 --自己的位置
		local selfId = G_UserData:getBase():getId()
		for userId, userData in pairs(self._userDatas) do
			if selfId == userId then
				selfPos = userData:getPosition()
			end
		end
		if selfPos > 0 then
			focusIndex = self:getIndexAndSideWithPos(selfPos)
		else
			if nowRound == 1 then
				focusIndex = 1
			elseif nowRound == 2 then
				focusIndex = 9 
			end
		end
	end
	return focusIndex
end

function UniverseRaceData:getJackpot()
	return self._jackpot
end

--========================协议部分===========================================
function UniverseRaceData:c2sGetUniverseRacePkInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUniverseRacePkInfo, {

    })
end

function UniverseRaceData:_s2cGetUniverseRacePkInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local users = rawget(message, "users") or {}
	local pkInfos = rawget(message, "pk_infos") or {}
	local nowRound = rawget(message, "now_round") or 0
	local roundBeginTime = rawget(message, "round_begin_time") or 0
	local pkInfoNum = rawget(message, "pk_info_num") or 0
	local userSupport = rawget(message, "user_support") or {}
	local guess = rawget(message, "guess") or {}
	local selfRank = rawget(message, "self_rank")
	local myServerId = rawget(message, "my_server_id") or 0
	local jackpot = rawget(message, "jackpot") or 0

	self._userDatas = {}
	self._matchDatas = {}
	self._groupReportDatas = {}
	self._supportSingleDatas = {}
	self._supportMultipleDatas = {}
	self._guessRankDatas = {}
	self._myGuessRankData = nil

	for i, user in ipairs(users) do
		local userData = UniverseRaceUserData.new()
		userData:updateData(user)
		local userId = userData:getUser_id()
		self._userDatas[userId] = userData
	end
	for i, pkInfo in ipairs(pkInfos) do
		local match = rawget(pkInfo, "position_info")
		local matchData = UniverseRaceMatchData.new()
		matchData:updateData(match)
		local position = matchData:getPosition()
		self._matchDatas[position] = matchData

		local reports = rawget(pkInfo, "reports") or {}
		for i, report in ipairs(reports) do
			local pos = rawget(report, "position") or 0
			local groupReportData = self:getGroupReportData(pos)
			if groupReportData == nil then
				groupReportData = UniverseRaceGroupReportData.new()
				self._groupReportDatas[pos] = groupReportData
			end
			groupReportData:updateData(report)
		end
	end

	self:setNow_round(nowRound)
	self:setRound_begin_time(roundBeginTime)
	self:_formatMapRelation(pkInfoNum) --根据随机参数组织数据

	for i, support in ipairs(userSupport) do
		local supportData = UniverseRaceSupportUnitData.new()
		supportData:updateData(support)
		local position = supportData:getPosition()
		if supportData:isSingle() then --单场竞猜
			self._supportSingleDatas[position] = supportData
		else
			self._supportMultipleDatas[position] = supportData
		end
	end

	for i, data in ipairs(guess) do
		local rankData = UniverseRacePlayerRankData.new()
		rankData:updateData(data)
		table.insert(self._guessRankDatas, rankData)
	end

	if selfRank then
		local myData = UniverseRacePlayerRankData.new()
		myData:updateData(selfRank)
		self._myGuessRankData = myData
	end
	
	self._jackpot = jackpot

	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_GET_PK_INFO_SUCCESS)
end

function UniverseRaceData:_s2cUpdateUniverseRacePkInfo(id, message)
	local pkInfos = rawget(message, "pk_infos") or {}
	local reports = rawget(message, "reports") or {}
	local nowRound = rawget(message, "now_round") or 0
	local roundBeginTime = rawget(message, "round_begin_time") or 0

	for i, match in ipairs(pkInfos) do
		local position = rawget(match, "position") or 0
		local matchData = self:getMatchDataWithPosition(position)
		if matchData == nil then
			matchData = UniverseRaceMatchData.new()
			self._matchDatas[position] = matchData
		end
		matchData:updateData(match)
	end

	for i, report in ipairs(reports) do
		local position = rawget(report, "position") or 0
		local groupReportData = self:getGroupReportData(position)
		if groupReportData == nil then
			groupReportData = UniverseRaceGroupReportData.new()
			self._groupReportDatas[position] = groupReportData
		end
		groupReportData:updateData(report)
	end
	
	local lastRound = self:getNow_round()
	local isChangeRound = lastRound ~= nowRound --轮次是否有改变
	self:setNow_round(nowRound)
	self:setRound_begin_time(roundBeginTime)

	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_UPDATE_PK_INFO_SUCCESS, pkInfos, reports, isChangeRound)
end

function UniverseRaceData:_s2cSyncUniverseRaceActInfo(id, message)
	local id = rawget(message, "id") or 0
	local beginTime = rawget(message, "begin_time") or 0
	local createTime = rawget(message, "create_time") or 0
	local nowRound = rawget(message, "now_round") or 0
	local roundBeginTime = rawget(message, "round_begin_time") or 0

	self:setBegin_time(beginTime)
	self:setCreate_time(createTime)
	self:setNow_round(nowRound)
	self:setRound_begin_time(roundBeginTime)
	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SYNC_ACTINFO)
end

function UniverseRaceData:c2sUniverseRaceChangeEmbattle(userId, positions)
	G_NetworkManager:send(MessageIDConst.ID_C2S_UniverseRaceChangeEmbattle, {
		user_id = userId,
		positions = positions,
    })
end

function UniverseRaceData:_s2cUniverseRaceChangeEmbattle(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_CHANGE_EMBATTLE_SUCCESS)
end

function UniverseRaceData:_s2cUpdateUniverseRaceEmbattle(id, message)
	local user = rawget(message, "user") or {}
	local userId = rawget(user, "user_id") or 0
	local userData = self:getUserDataWithId(userId)
	if userData == nil then
		userData = UniverseRaceUserData.new()
		self._userDatas[userId] = userData
	end
	userData:updateData(user)

	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_EMBATTlE_UPDATE, userData)
end

function UniverseRaceData:c2sGetBattleReport(reportId)
	logWarn(string.format("UniverseRaceData:c2sGetBattleReport, reportId = %d", reportId))
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetBattleReport, {
		id = reportId
	})
end

function UniverseRaceData:_s2cGetBattleReport(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

    local id = rawget(message, "id") or 0
    local battleReport = rawget(message, "battle_report")
	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_GET_REPORT, battleReport, id)
end

function UniverseRaceData:c2sGetUniverseRacePositionInfo(position)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUniverseRacePositionInfo, {
		pos = position
	})
end

function UniverseRaceData:_s2cGetUniverseRacePositionInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local user = rawget(message, "user")
	local userDetail = rawget(message, "detail_user")
	local userId = rawget(user, "user_id")

	local userData = self:getUserDataWithId(userId)
	if userData == nil then
		userData = UniverseRaceUserData.new()
		userData:updateData(user)
		self._userDatas[userId] = userData
	end
	
	self._userDetailInfo[userId] = userDetail

	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_GET_POSITION_INFO, userData, userDetail)
end

function UniverseRaceData:c2sUniverseRaceSupport(chipIn)
	G_NetworkManager:send(MessageIDConst.ID_C2S_UniverseRaceSupport, {
		chip_in = chipIn,
    })
end

function UniverseRaceData:_s2cUniverseRaceSupport(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local chipIn = rawget(message, "chip_in") or {}
	local isSingle = #chipIn == 1 --只有一场表示是单场竞猜
	local selfId = G_UserData:getBase():getId()
	for index, data in ipairs(chipIn) do
		local pos = rawget(data, "pos") or 0
		local userId = rawget(data, "userId") or 0
		local addNum = rawget(data, "add_num") or 0
		local support = {
			user_id = selfId,
			position = pos,
			support = userId,
		}
		local supportData = UniverseRaceSupportUnitData.new()
		supportData:updateData(support)
		if isSingle then
			self._supportSingleDatas[pos] = supportData
		else
			self._supportMultipleDatas[pos] = supportData
		end
		
		--客户端先把支持人数算一下
		local matchData = self:getMatchDataWithPosition(pos)
		matchData:updateSupportNum(userId, addNum)
	end
	
	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SUPPORT_SUCCESS, isSingle)
end

function UniverseRaceData:_s2cSyncUniverseRaceGuess(id, message)
	local guess = rawget(message, "guess") or {}
	local selfRank = rawget(message, "self_rank")
	self._guessRankDatas = {}
	for i, data in ipairs(guess) do
		local rankData = UniverseRacePlayerRankData.new()
		rankData:updateData(data)
		table.insert(self._guessRankDatas, rankData)
	end

	if selfRank then
		local myData = UniverseRacePlayerRankData.new()
		myData:updateData(selfRank)
		self._myGuessRankData = myData
	end

	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SYNC_GUESS)
end

function UniverseRaceData:c2sGetUniverseRaceWiner()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUniverseRaceWiner, {
		
    })
end

function UniverseRaceData:_s2cGetUniverseRaceWiner(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	self._pastChampions = {}
	local winers = rawget(message, "winers") or {}
	for i, data in ipairs(winers) do
		local winnerData = UniverseRaceWinnerData.new()
		winnerData:updateData(data)
		local actId = winnerData:getAct_id()
		self._pastChampions[actId] = winnerData
	end

	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_GET_WINNER)
end

function UniverseRaceData:c2sGetUniverseRaceWinerDetail(actId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetUniverseRaceWinerDetail, {
		act_id = actId
    })
end

function UniverseRaceData:_s2cGetUniverseRaceWinerDetail(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local detailUser = rawget(message, "detail_user")
	local actId = rawget(message, "act_id") or 0

	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_GET_WINNER_DETAIL, detailUser, actId)
end

function UniverseRaceData:_s2cSyncUniverseRaceGuessPot(id, message)
	local jackpot = rawget(message, "jackpot") or 0
	self._jackpot = jackpot

	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SYNC_GUESS_POT)
end

return UniverseRaceData