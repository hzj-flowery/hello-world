--跨服个人竞技数据
local BaseData = require("app.data.BaseData")
local SingleRaceData = class("SingleRaceData", BaseData)
local SingleRaceUserData = require("app.data.SingleRaceUserData")
local SingleRaceMatchData = require("app.data.SingleRaceMatchData")
local SingleRaceReportData = require("app.data.SingleRaceReportData")
local SingleRaceServerRankData = require("app.data.SingleRaceServerRankData")
local SingleRacePlayerRankData = require("app.data.SingleRacePlayerRankData")
local SingleRaceConst = require("app.const.SingleRaceConst")
local SingleRaceDataHelper = require("app.utils.data.SingleRaceDataHelper")
local SingleRaceGuessServerData = require("app.data.SingleRaceGuessServerData")
local SingleRaceGuessUnitData = require("app.data.SingleRaceGuessUnitData")

local schema = {}
schema["now_round"] = {"number", 0}
schema["round_begin_time"] = {"number", 0}
schema["support_pos"] = {"number", 0}
schema["support_user_id"] = {"number", 0}
schema["my_server_id"] = {"number", 0}
schema["curWatchPos"] = {"number", 0}
schema["status"] = {"number", 0}
SingleRaceData.schema = schema

function SingleRaceData:ctor(properties)
	SingleRaceData.super.ctor(self, properties)

	self._userDatas = {} --选手数据
	self._matchDatas = {} --比赛数据
	self._reportDatas = {} --战报数据
	self._serverRankData = {} --服务器排行榜
	self._playerRankData = {} --个人排行榜
	self._sameServerRankData = {} --本服个人排行榜
	self._userDetailInfo = {} --玩家信息
	self._guessServerData = {} --竞猜中用的服务器数据
	self._guessDatas = {} --竞猜情况数据
	self:_formatPosMap()

	self._recvGetSingleRacePkInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetSingleRacePkInfo, handler(self, self._s2cGetSingleRacePkInfo))
	self._recvUpdateSingleRacePkInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateSingleRacePkInfo, handler(self, self._s2cUpdateSingleRacePkInfo))
	self._recvSingleRaceChangeEmbattle = G_NetworkManager:add(MessageIDConst.ID_S2C_SingleRaceChangeEmbattle, handler(self, self._s2cSingleRaceChangeEmbattle))
	self._recvUpdateSingleRaceEmbattle = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateSingleRaceEmbattle, handler(self, self._s2cUpdateSingleRaceEmbattle))
	self._recvSingleRaceSupport = G_NetworkManager:add(MessageIDConst.ID_S2C_SingleRaceSupport, handler(self, self._s2cSingleRaceSupport))
	self._recvGetBattleReport = G_NetworkManager:add(MessageIDConst.ID_S2C_GetBattleReport, handler(self, self._s2cGetBattleReport))
	self._recvGetSingleRacePositionInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_GetSingleRacePositionInfo, handler(self, self._s2cGetSingleRacePositionInfo))
	self._recvGetSingleRaceStatus = G_NetworkManager:add(MessageIDConst.ID_S2C_GetSingleRaceStatus, handler(self, self._s2cGetSingleRaceStatus))
	self._recvSingleRaceAnswerSupport = G_NetworkManager:add(MessageIDConst.ID_S2C_SingleRaceAnswerSupport, handler(self, self._s2cSingleRaceAnswerSupport))
	self._recvUpdateSingleRaceAnswerSupport = G_NetworkManager:add(MessageIDConst.ID_S2C_UpdateSingleRaceAnswerSupport, handler(self, self._s2cUpdateSingleRaceAnswerSupport))
end

function SingleRaceData:clear()
	self._recvGetSingleRacePkInfo:remove()
	self._recvGetSingleRacePkInfo = nil
	self._recvUpdateSingleRacePkInfo:remove()
	self._recvUpdateSingleRacePkInfo = nil
	self._recvSingleRaceChangeEmbattle:remove()
	self._recvSingleRaceChangeEmbattle = nil
	self._recvUpdateSingleRaceEmbattle:remove()
	self._recvUpdateSingleRaceEmbattle = nil
	self._recvSingleRaceSupport:remove()
	self._recvSingleRaceSupport = nil
	self._recvGetBattleReport:remove()
	self._recvGetBattleReport = nil
	self._recvGetSingleRacePositionInfo:remove()
	self._recvGetSingleRacePositionInfo = nil
	self._recvGetSingleRaceStatus:remove()
	self._recvGetSingleRaceStatus = nil
	self._recvSingleRaceAnswerSupport:remove()
	self._recvSingleRaceAnswerSupport = nil
	self._recvUpdateSingleRaceAnswerSupport:remove()
	self._recvUpdateSingleRaceAnswerSupport = nil
end

function SingleRaceData:reset()
	self._userDatas = {}
	self._matchDatas = {}
	self._reportDatas = {}
	self._serverRankData = {}
	self._playerRankData = {}
	self._sameServerRankData = {}
	self._userDetailInfo = {}
	self._guessServerData = {}
	self._guessDatas = {}
end

function SingleRaceData:_formatPosMap()
	self._posMap = {}
	self._posMapEx = {}
	local config = require("app.config.single_schedule")
	local len = config.length()
	for i = 1, len do
		local info = config.indexOf(i)
		local nextPos = info.nxet_position
		if nextPos > 0 then
			if self._posMap[nextPos] == nil then
				self._posMap[nextPos] = {}
			end
			table.insert(self._posMap[nextPos], info.top32)
		end
	end
	for pos, info in pairs(self._posMap) do
		local index1 = info[1]
		local index2 = info[2]
		assert(index1 and index2, string.format("SingleRaceData:_formatPosMap is wrong, pos = %d", pos))
		self._posMapEx[index1.."_"..index2] = pos
	end
end

function SingleRaceData:getPreIndexOfPosition(position)
	local result = self._posMap[position]
	assert(result, string.format("SingleRaceData:getPreIndexOfPosition is wrong! position = %d", position))
	return result
end

function SingleRaceData:getNextIndexOfPosition(position)
	local key = ""
	if position % 2 == 0 then
		key = (position-1).."_"..position
	else
		key = position.."_"..(position+1)
	end
	local nextIndex = self._posMapEx[key] or 0
	return nextIndex
end

function SingleRaceData:getUserDataWithId(userId)
	local userData = self._userDatas[userId]
	return userData
end

function SingleRaceData:getMatchDataWithPosition(position)
	local matchData = self._matchDatas[position]
	return matchData
end

--竞猜用，所以只在1~32位置找
function SingleRaceData:getPosWithUserIdForGuess(userId)
	for pos = 1, 32 do
		local matchData = self:getMatchDataWithPosition(pos)
		if matchData:getUser_id() == userId then
			return pos
		end
	end
	return 0
end

function SingleRaceData:getUserDataWithPosition(position)
	local matchData = self:getMatchDataWithPosition(position)
	if matchData then
		local userId = matchData:getUser_id()
		local userData = self:getUserDataWithId(userId)
		return userData
	end
	return nil
end

function SingleRaceData:getReportData(position)
	return self._reportDatas[position]
end

function SingleRaceData:getReportUnitData(position, battleNo)
	local reportDatas = self:getReportData(position)
	if reportDatas == nil then
		return nil
	end
	return reportDatas[battleNo]
end

function SingleRaceData:getServerRankDataWithId(serverId)
	return self._serverRankData[serverId]
end

function SingleRaceData:getPlayerRankDataWithId(userId)
	return self._playerRankData[userId]
end

function SingleRaceData:getSameServerRankDataWithId(userId)
	return self._sameServerRankData[userId]
end

function SingleRaceData:getUserDetailInfoWithId(userId)
	return self._userDetailInfo[userId]
end

function SingleRaceData:getServerRankList()
	local sortFunc = function(a, b)
		return a:getRank() < b:getRank()
	end

	local result = {}
	for serverId, data in pairs(self._serverRankData) do
		table.insert(result, data)
	end
	table.sort(result, sortFunc)

	return result
end

function SingleRaceData:getPlayerRankList()
	local sortFunc = function(a, b)
		return a:getRank() < b:getRank()
	end

	local result = {}
	for userId, data in pairs(self._playerRankData) do
		table.insert(result, data)
	end
	table.sort(result, sortFunc)

	return result
end

function SingleRaceData:getSameServerRankList()
	local sortFunc = function(a, b)
		return a:getRank() < b:getRank()
	end

	local result = {}
	for userId, data in pairs(self._sameServerRankData) do
		table.insert(result, data)
	end
	table.sort(result, sortFunc)

	return result
end

function SingleRaceData:getWinNumWithPosition(position)
	local reportDatas = self:getReportData(position)
	local winNum1, winNum2 = self:getWinNumWithReportData(reportDatas)
	return winNum1, winNum2
end

function SingleRaceData:getWinNumWithReportData(reportDatas)
	local winNum1 = 0
	local winNum2 = 0
	if reportDatas then
		for battleNo, reportData in pairs(reportDatas) do
			local winnerSide = reportData:getWinnerSide()
			if winnerSide == SingleRaceConst.REPORT_SIDE_1 then
				winNum1 = winNum1 + 1
			elseif winnerSide == SingleRaceConst.REPORT_SIDE_2 then
				winNum2 = winNum2 + 1
			end
		end
	end
	return winNum1, winNum2
end

function SingleRaceData:getResultStateWithPosition(position)
	local reportPos = self:getNextIndexOfPosition(position)
	local winNum1, winNum2 = self:getWinNumWithPosition(reportPos)
	local side = 0
	if position % 2 == 1 then
		side = SingleRaceConst.REPORT_SIDE_1
	else
		side = SingleRaceConst.REPORT_SIDE_2
	end
	if winNum1 == SingleRaceConst.MAX_WIN_COUNT then
		if side == SingleRaceConst.REPORT_SIDE_1 then
			return SingleRaceConst.RESULT_STATE_WIN
		elseif side == SingleRaceConst.REPORT_SIDE_2 then
			return SingleRaceConst.RESULT_STATE_LOSE
		end
	elseif winNum2 == SingleRaceConst.MAX_WIN_COUNT then
		if side == SingleRaceConst.REPORT_SIDE_1 then
			return SingleRaceConst.RESULT_STATE_LOSE
		elseif side == SingleRaceConst.REPORT_SIDE_2 then
			return SingleRaceConst.RESULT_STATE_WIN
		end
	elseif winNum1 > 0 or winNum2 > 0 then
		return SingleRaceConst.RESULT_STATE_ING
	else
		return SingleRaceConst.RESULT_STATE_NONE
	end
end

--某个位置的比赛是否已经决出胜负
function SingleRaceData:isMatchEndWithPosition(position)
	local winNum1, winNum2 = self:getWinNumWithPosition(position)
	if winNum1 == SingleRaceConst.MAX_WIN_COUNT or winNum2 == SingleRaceConst.MAX_WIN_COUNT then
		return true
	else
		return false
	end
end

function SingleRaceData:getReportStateWithPosition(position)
	local nowRound = self:getNow_round()
	local round = SingleRaceConst.getRoundWithPosition(position)
	if round > nowRound then
		return SingleRaceConst.MATCH_STATE_BEFORE
	elseif round == nowRound then
		return SingleRaceConst.MATCH_STATE_ING
	elseif round < nowRound then
		return SingleRaceConst.MATCH_STATE_AFTER
	end
end

--自己是否被淘汰
function SingleRaceData:isSelfEliminated()
	local selfId = G_UserData:getBase():getId()
	local nowRound = self:getNow_round()
	print( "SingleRaceData:isSelfEliminated()",  nowRound)
	local region = SingleRaceConst.getPositionRegionWithRound(nowRound)
	for pos = region[1], region[2] do
		local userData = self:getUserDataWithPosition(pos)
		if userData then
			local userId = userData:getUser_id()
			if userId == selfId then
				return false --在当前轮次找到了自己，说明没被淘汰
			end
		end
	end
	return true
end

--找到当前聚焦的位置
--优先选择规则：1,没被淘汰的自己。2，没被淘汰的同服战力最高者。3，淘汰的自己。4，淘汰的同服战力最高者
function SingleRaceData:getCurFocusPos()
	local function findPosWithRound(roundStart, roundEnd)
		local selfId = G_UserData:getBase():getId()
		local myServerId = self:getMy_server_id()
		local selfPos = 0
		local players = {}
		for i = roundStart, roundEnd, -1 do
			local region = SingleRaceConst.getPositionRegionWithRound(i)
			for pos = region[1], region[2] do
				local userData = self:getUserDataWithPosition(pos)
				if userData then
					if userData:getUser_id() == selfId then
						selfPos = pos
					elseif userData:getServer_id() == myServerId then
						table.insert(players, {user = userData, pos = pos})
					end
				end
			end
		end
		if selfPos > 0 then
			return selfPos
		else
			table.sort(players, function(a, b)
				return a.user:getPower() > b.user:getPower()
			end)
			local player = players[1]
			if player then
				return player.pos
			end
		end
		return 0
	end

	local status = self:getStatus()
	if status == SingleRaceConst.RACE_STATE_FINISH then --比赛结束，直接定位冠军
		return 63
	end

	local nowRound = self:getNow_round()
	local pos1 = findPosWithRound(6, nowRound) --先找未淘汰的情况
	if pos1 > 0 then
		return pos1
	end
	local pos2 = findPosWithRound(nowRound, 1) --先找未淘汰的情况
	if pos2 > 0 then
		return pos2
	end
	return 0
end

--找到所有自己最终的位置
function SingleRaceData:getSelfFinalPos()
	local selfId = G_UserData:getBase():getId()
	for i = 6, 1, -1 do --从后往前找
		local region = SingleRaceConst.getPositionRegionWithRound(i)
		for pos = region[1], region[2] do
			local userData = self:getUserDataWithPosition(pos)
			if userData then
				local userId = userData:getUser_id()
				if userId == selfId then
					return pos
				end
			end
		end
	end
	
	return 0
end

--找同服参赛者的最终位置
function SingleRaceData:getSameServerPlayerFinalPos()
	local result = {}
	local myServerId = self:getMy_server_id()
	for i = 6, 1, -1 do --从后往前找，不存重复的
		local region = SingleRaceConst.getPositionRegionWithRound(i)
		for pos = region[1], region[2] do
			local userData = self:getUserDataWithPosition(pos)
			if userData then
				local userId = userData:getUser_id()
				local userServerId = userData:getServer_id()
				if result[userId] == nil and myServerId == userServerId then
					result[userId] = pos
				end
			end
		end
	end

	return result
end

--找到自己所在场次索引
function SingleRaceData:findSelfRacePos()
	local selfId = G_UserData:getBase():getId()
	local nowRound = self:getNow_round()
	local region = SingleRaceConst.getPositionRegionWithRound(nowRound)
	for pos = region[1], region[2] do
		local userData = self:getUserDataWithPosition(pos)
		if userData then
			local userId = userData:getUser_id()
			if userId == selfId then
				local racePos = self:getNextIndexOfPosition(pos) --racePos是玩家位置晋级后的位置
				return racePos
			end
		end
	end
	return 0 --已淘汰，返回0
end

--根据时间计算当前是第几局比赛
function SingleRaceData:getCurMatchIndexByPos(pos)
	local matchIndex = 0

	local reports = self:getReportData(pos) or {}
	local num = #reports + 1
	local maxWinNum = SingleRaceConst.getWinMaxNum()
	local maxNum = maxWinNum*2-1
	if num >= 1 and num <= maxNum then --正确的范围：1~5
		matchIndex = num
	end
	if matchIndex == 0 then
		logWarn(string.format("SingleRaceData:getCurMatchIndexByPos()--- pos = %d", pos))
	end
	return matchIndex
end

--获取先手索引，1左，2右
--规则：第1、3、5局高战力先手，2、4局低战力先手
function SingleRaceData:getFirstHandIndex(pos)
	local state = self:getReportStateWithPosition(pos)
	local firstHandIndex = 0
	local matchIndex = self:getCurMatchIndexByPos(pos)
	local preIndex = self:getPreIndexOfPosition(pos)
	local index1 = preIndex[1]
	local index2 = preIndex[2]
	local userData1 = self:getUserDataWithPosition(index1)
	local userData2 = self:getUserDataWithPosition(index2)
	if userData1 and userData2 then
		local power1 = userData1:getPower()
		local power2 = userData2:getPower()
		local maxPowerIndex = 0
		local minPowerIndex = 0
		if power1 >= power2 then
			maxPowerIndex = index1
			minPowerIndex = index2
		else
			maxPowerIndex = index2
			minPowerIndex = index1
		end
		if matchIndex % 2 == 1 then
			firstHandIndex = maxPowerIndex
		else
			firstHandIndex = minPowerIndex
		end
	end

	return firstHandIndex
end

--是否支持过
function SingleRaceData:isDidSupport()
	local supportPos = self:getSupport_pos()
	local supportUserId = self:getSupport_user_id()
	if supportPos > 0 and supportUserId > 0 then
		return true
	else
		return false
	end
end

--获取竞猜个人列表
function SingleRaceData:getGuessPlayerList()
	local result = {}
	for userId, user in pairs(self._userDatas) do
		table.insert(result, user)
	end
	table.sort(result, function(a, b)
		return a:getPower() > b:getPower()
	end)
	return result
end

--获取竞猜服务器列表
function SingleRaceData:getGuessServerList(isAscending)
	local result = {}
	for serverId, data in pairs(self._guessServerData) do
		table.insert(result, data)
	end
	if isAscending then --升序
		table.sort(result, function(a, b)
			return a:getPower() > b:getPower()
		end)
	else
		table.sort(result, function(a, b)
			return a:getPower() < b:getPower()
		end)
	end

	return result
end

--是否能竞猜
function SingleRaceData:isCanGuess()
	local status = self:getStatus()
	return status == SingleRaceConst.RACE_STATE_PRE
end

function SingleRaceData:_initGuessData()
	self._guessDatas = {}
	for id = SingleRaceConst.GUESS_TAB_TYPE_1, SingleRaceConst.GUESS_TAB_TYPE_3 do
		local unitData = SingleRaceGuessUnitData.new()
		unitData:setAnswer_id(id)
		self._guessDatas[id] = unitData
	end
end

function SingleRaceData:getGuessUnitDataWithId(id)
	return self._guessDatas[id]
end

function SingleRaceData:hasRedPointOfGuessWithType(type)
	if SingleRaceDataHelper.isInGuessTime() == false or self:isCanGuess() == false then
		return false
	end
	local unit = self:getGuessUnitDataWithId(type)
	if unit == nil then
		return false
	end
	if unit:isVoted() then
		return false
	end
	return true
end

function SingleRaceData:hasRedPoint()
	local result = false
	for type = SingleRaceConst.GUESS_TAB_TYPE_1, SingleRaceConst.GUESS_TAB_TYPE_3 do
		local has = self:hasRedPointOfGuessWithType(type)
		result = result or has
	end
	return result
end

--========================协议部分===========================================
function SingleRaceData:c2sGetSingleRacePkInfo()
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetSingleRacePkInfo, {

    })
end

function SingleRaceData:_s2cGetSingleRacePkInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local users = rawget(message, "users") or {}
	local pkInfos = rawget(message, "pk_infos") or {}
	local nowRound = rawget(message, "now_round") or 0
	local roundBeginTime = rawget(message, "round_begin_time") or 0
	local supportPos = rawget(message, "support_pos") or 0
	local supportUserId = rawget(message, "support_user_id") or 0
	local serverRanks = rawget(message, "server_rank") or {}
	local myServerId = rawget(message, "my_server_id") or 0
	local playerRanks = rawget(message, "player_rank") or {}
	local answerSupport = rawget(message, "answer_support") or {}

	self._userDatas = {}
	self._matchDatas = {}
	self._reportDatas = {}
	self._serverRankData = {}
	self._playerRankData = {}
	self._sameServerRankData = {}
	self._guessServerData = {}
	self:_initGuessData()

	for i, user in ipairs(users) do
		local userData = SingleRaceUserData.new()
		userData:updateData(user)
		local userId = userData:getUser_id()
		self._userDatas[userId] = userData
		local serverId = userData:getServer_id()
		if self._guessServerData[serverId] == nil then
			self._guessServerData[serverId] = SingleRaceGuessServerData.new()
			self._guessServerData[serverId]:initData(userData)
		end
		self._guessServerData[serverId]:insertUser(userData)
	end
	for i, pkInfo in ipairs(pkInfos) do
		local match = rawget(pkInfo, "position_info")
		local matchData = SingleRaceMatchData.new()
		matchData:updateData(match)
		local position = matchData:getPosition()
		self._matchDatas[position] = matchData

		local reports = rawget(pkInfo, "reports") or {}
		for i, report in ipairs(reports) do
			local reportData = SingleRaceReportData.new()
			reportData:updateData(report)
			local pos = reportData:getPosition()
			if self._reportDatas[pos] == nil then
				self._reportDatas[pos] = {}
			end
			local battleNo = reportData:getBattle_no()
			self._reportDatas[pos][battleNo] = reportData
		end
	end
	for i, serverRank in ipairs(serverRanks) do
		local rankData = SingleRaceServerRankData.new()
		rankData.type = SingleRaceConst.RANK_DATA_TYPE_1
		rankData:updateData(serverRank)
		local serverId = rankData:getServer_id()
		self._serverRankData[serverId] = rankData
	end
	for i, playerRank in ipairs(playerRanks) do
		local rankData = SingleRacePlayerRankData.new()
		rankData.type = SingleRaceConst.RANK_DATA_TYPE_2
		rankData:updateData(playerRank)
		local userId = rankData:getUser_id()
		local serverId = rankData:getServer_id()
		self._playerRankData[userId] = rankData
		if serverId == myServerId then
			local tempData = clone(rankData)
			tempData.type = SingleRaceConst.RANK_DATA_TYPE_3
			self._sameServerRankData[userId] = tempData
		end
	end
	for i, support in ipairs(answerSupport) do
		local id = rawget(support, "answer_id")
		local unitData = self:getGuessUnitDataWithId(id)
		unitData:updateData(support)
	end

	self:setNow_round(nowRound)
	self:setRound_begin_time(roundBeginTime)
	self:setSupport_pos(supportPos)
	self:setSupport_user_id(supportUserId)
	self:setMy_server_id(myServerId)

	G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_GET_PK_INFO_SUCCESS)
end

function SingleRaceData:_s2cUpdateSingleRacePkInfo(id, message)
	local pkInfos = rawget(message, "pk_infos") or {}
	local reports = rawget(message, "reports") or {}
	local nowRound = rawget(message, "now_round") or 0
	local roundBeginTime = rawget(message, "round_begin_time") or 0
	local serverRanks = rawget(message, "server_rank") or {}
	local playerRanks = rawget(message, "player_rank") or {}

	for i, match in ipairs(pkInfos) do
		local position = rawget(match, "position") or 0
		local matchData = self:getMatchDataWithPosition(position)
		if matchData == nil then
			matchData = SingleRaceMatchData.new()
			self._matchDatas[position] = matchData
		end
		matchData:updateData(match)
	end

	for i, report in ipairs(reports) do
		local position = rawget(report, "position") or 0
		local battleNo = rawget(report, "battle_no") or 0
		local reportData = self:getReportUnitData(position, battleNo)
		if reportData == nil then
			reportData = SingleRaceReportData.new()
			if self._reportDatas[position] == nil then
				self._reportDatas[position] = {}
			end
			self._reportDatas[position][battleNo] = reportData
		end
		reportData:updateData(report)
	end
	for i, serverRank in ipairs(serverRanks) do
		local serverId = rawget(serverRank, "server_id") or 0
		local rankData = self:getServerRankDataWithId(serverId)
		if rankData == nil then
			rankData = SingleRaceServerRankData.new()
			rankData.type = SingleRaceConst.RANK_DATA_TYPE_1
			self._serverRankData[serverId] = rankData
		end
		rankData:updateData(serverRank)
	end

	local myServerId = self:getMy_server_id()
	for i, playerRank in ipairs(playerRanks) do
		local userId = rawget(playerRank, "user_id") or 0
		local serverId = rawget(playerRank, "server_id") or 0
		local rankData = self:getPlayerRankDataWithId(userId)
		if rankData == nil then
			rankData = SingleRacePlayerRankData.new()
			rankData.type = SingleRaceConst.RANK_DATA_TYPE_2
			self._playerRankData[userId] = rankData
		end
		rankData:updateData(playerRank)
		if serverId == myServerId then
			local tempData = clone(rankData)
			tempData.type = SingleRaceConst.RANK_DATA_TYPE_3
			self._sameServerRankData[userId] = tempData
		end
	end
	
	local lastRound = self:getNow_round()
	local isChangeRound = lastRound ~= nowRound --轮次是否有改变
	self:setNow_round(nowRound)
	self:setRound_begin_time(roundBeginTime)
	
	if isChangeRound then --轮次发生改变，清除支持信息, 找下一轮场次位置
		self:setSupport_pos(0)
		self:setSupport_user_id(0)
		local curPos = self:getCurWatchPos()
		local nextPos = self:getNextIndexOfPosition(curPos)
		if nextPos > 0 then
			self:setCurWatchPos(nextPos)
		end
	end

    G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_UPDATE_PK_INFO_SUCCESS, pkInfos, reports, isChangeRound)
end

function SingleRaceData:c2sSingleRaceChangeEmbattle(userId, positions)
	G_NetworkManager:send(MessageIDConst.ID_C2S_SingleRaceChangeEmbattle, {
		user_id = userId,
		positions = positions,
    })
end

function SingleRaceData:_s2cSingleRaceChangeEmbattle(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_CHANGE_EMBATTLE_SUCCESS)
end

function SingleRaceData:_s2cUpdateSingleRaceEmbattle(id, message)
	local user = rawget(message, "user") or {}
	local userId = rawget(user, "user_id") or 0
	local userData = self:getUserDataWithId(userId)
	if userData == nil then
		userData = SingleRaceUserData.new()
		self._userDatas[userId] = userData
	end
	userData:updateData(user)

	G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_EMBATTlE_UPDATE, userData)
end

function SingleRaceData:c2sSingleRaceSupport(pos, userId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_SingleRaceSupport, {
		pos = pos,
		userId = userId,
    })
end

function SingleRaceData:_s2cSingleRaceSupport(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local pos = rawget(message, "pos") or 0
	local userId = rawget(message, "userId") or 0
	self:setSupport_pos(pos)
	self:setSupport_user_id(userId)
	G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_SUPPORT_SUCCESS)
end

function SingleRaceData:c2sGetBattleReport(reportId)
	logWarn(string.format("SingleRaceData:c2sGetBattleReport, reportId = %d", reportId))
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetBattleReport, {
		id = reportId
	})
end

function SingleRaceData:_s2cGetBattleReport(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

    local id = rawget(message, "id") or 0
    local battleReport = rawget(message, "battle_report")
	G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_GET_REPORT, battleReport, id)
end

function SingleRaceData:c2sGetSingleRacePositionInfo(position)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetSingleRacePositionInfo, {
		pos = position
	})
end

function SingleRaceData:_s2cGetSingleRacePositionInfo(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	local user = rawget(message, "user")
	local userDetail = rawget(message, "detail_user")
	local userId = rawget(user, "user_id")

	local userData = self:getUserDataWithId(userId)
	if userData == nil then
		userData = SingleRaceUserData.new()
		userData:updateData(user)
		self._userDatas[userId] = userData
	end
	
	self._userDetailInfo[userId] = userDetail

	G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_GET_POSITION_INFO, userData, userDetail)
end

function SingleRaceData:_s2cGetSingleRaceStatus(id, message)
	local status = rawget(message, "status")
	local lastStatus = self:getStatus()
	self:setStatus(status)
	if status ~= lastStatus then
		if status == SingleRaceConst.RACE_STATE_NONE then
			self._userDetailInfo = {}
		end
		G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_STATUS_CHANGE, status)
		G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SINGLE_RACE)
	end
end

function SingleRaceData:c2sSingleRaceAnswerSupport(answerId, supportId)
	G_NetworkManager:send(MessageIDConst.ID_C2S_SingleRaceAnswerSupport, {
		answer_id = answerId,
		support_id = supportId
	})
end

function SingleRaceData:_s2cSingleRaceAnswerSupport(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local answerId = rawget(message, "answer_id")
	local supportId = rawget(message, "support_id")
	local unitData = self:getGuessUnitDataWithId(answerId)
	unitData:setMy_support(supportId)
	G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_GUESS_SUCCESS, answerId, supportId)
end

function SingleRaceData:_s2cUpdateSingleRaceAnswerSupport(id, message)
	local answerId = rawget(message, "answer_id")
	local support = rawget(message, "support_info")
	local supportId = rawget(support, "support_id")
	local supportNum = rawget(support, "support_num")
	local unitData = self:getGuessUnitDataWithId(answerId)
	if unitData then
		unitData:updateSupport(support)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_SINGLE_RACE_GUESS_UPDATE, answerId, supportId, supportNum)
end

return SingleRaceData