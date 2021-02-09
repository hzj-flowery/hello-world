-- Author: nieming
-- Date:2018-01-30 10:35:52
-- Describle：

local BaseData = require("app.data.BaseData")
local GuildServerAnswerData = class("GuildServerAnswerData", BaseData)

local schema = {}
--schema
schema["newStartTime"] = {"number", 0}
schema["answerState"] = {"number", 0}
schema["stateEndTime"] = {"number", 0}
schema["curQuestion"] = {"table", {}}
schema["readySucess"] = {"number", 0}
schema["ranks"] = {"table", {}}
schema["randomAward"] = {"table", {}}
GuildServerAnswerData.schema = schema

function GuildServerAnswerData:ctor(properties)
	GuildServerAnswerData.super.ctor(self, properties)
	self._answerPlayers = {}

	self._signalRecvGuildAnswerPublic =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GuildNewAnswerPublic, handler(self, self._s2cGuildAnswerPublic))
	self._signalRecvEnterNewAnswer =
		G_NetworkManager:add(MessageIDConst.ID_S2C_EnterNewAnswer, handler(self, self._s2cEnterNewGuildAnswer))
	self._signalGuildAnswerSysNotify =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GuildAnswerSysNotify, handler(self, self._s2cGuildAnswerSysNotify))
	self._signalGuildAnswerChangeNotify =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GuildAnswerChangeNotify, handler(self, self._s2cGuildAnswerChangeNotify))
	self._signalGuildAnswerChange =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GuildAnswerChange, handler(self, self._s2cGuildAnswerChange))
	self._signalGetGuildNewAnswer =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildNewAnswer, handler(self, self._s2cGetGuildNewAnswer))

	-- self._index = 0
	self:_resetData()
end

function GuildServerAnswerData:_resetData()
	local GuildAnswerQuestionUnitData = require("app.data.GuildAnswerQuestionUnitData")
	self:setCurQuestion(GuildAnswerQuestionUnitData.new())
end

function GuildServerAnswerData:clear()
	self._signalGuildAnswerSysNotify:remove()
	self._signalGuildAnswerSysNotify = nil
	self._signalGuildAnswerChangeNotify:remove()
	self._signalGuildAnswerChangeNotify = nil
	self._signalGuildAnswerChange:remove()
	self._signalGuildAnswerChange = nil
	self._signalRecvEnterNewAnswer:remove()
	self._signalRecvEnterNewAnswer = nil
	self._signalGetGuildNewAnswer:remove()
	self._signalGetGuildNewAnswer = nil
	self._signalRecvGuildAnswerPublic:remove()
	self._signalRecvGuildAnswerPublic = nil
	self:_resetData()
end

function GuildServerAnswerData:reset()
	self:_resetData()
end

-- Describle：
-- Param:
function GuildServerAnswerData:_handleRankData(message)
	local GuildAnswerRankUnitData = require("app.data.GuildAnswerRankUnitData")
	local GuildAnswerMyGuildRankUnitData = require("app.data.GuildAnswerMyGuildRankUnitData")
	local answer_rank = rawget(message, "answer_rank") or {}
	local ranks = {}
	ranks.guild = {}
	for _, v in ipairs(answer_rank) do
		local signalData = GuildAnswerRankUnitData.new()
		signalData:setProperties(v)
		table.insert(ranks.guild, signalData)
	end
	table.sort(
		ranks.guild,
		function(a, b)
			if a:getPoint() == b:getPoint() then
				return a:getGuild_id() < b:getGuild_id()
			else
				return a:getPoint() > b:getPoint()
			end
		end
	)
	local member_point = rawget(message, "member_point") or {}
	ranks.person = {}
	for _, v in ipairs(member_point) do
		local signalData = GuildAnswerMyGuildRankUnitData.new()
		signalData:setName(v.user_name)
		signalData:setUser_id(v.user_id)
		signalData:setPoint(v.point)
		table.insert(ranks.person, signalData)
	end
	table.sort(
		ranks.person,
		function(a, b)
			if a:getPoint() == b:getPoint() then
				return a:getUser_id() < b:getUser_id()
			else
				return a:getPoint() > b:getPoint()
			end
		end
	)
	for k, v in ipairs(ranks.person) do
		v:setRank(k)
	end
	return ranks
end

--# 新版答题 begin
function GuildServerAnswerData:_handlePlayerData(message)
	local listPlayer = rawget(message, "cur_player") or rawget(message, "update_player") or {}
	self._answerPlayers = self._answerPlayers or {}
	for k, v in pairs(listPlayer) do
		self:_updatePlayerDataEx(v)
	end
end

function GuildServerAnswerData:_delPlayerData(dels)
	for i, user_id in ipairs(dels) do
		self:_removePlayerById(user_id)
	end
end

function GuildServerAnswerData:_updateCurrPlayerData ( message )
	local listPlayer = rawget(message, "update_player") or {}
	self._answerPlayers = self._answerPlayers or {}
	for k, v in pairs(listPlayer) do
		local GuildServerAnswerPlayerUnitData = require("app.data.GuildServerAnswerPlayerUnitData")
		local unitData = self:_findPlayerById(v.user_id)
		if unitData then
			unitData:updateData(v)
		end
	end
end

function GuildServerAnswerData:_updatePlayerDataEx(data)
	if not data then
		return
	end
	local status = 0
	local GuildServerAnswerPlayerUnitData = require("app.data.GuildServerAnswerPlayerUnitData")
	local unitData = self:_findPlayerById(data.user_id)
	if not unitData then
		unitData = GuildServerAnswerPlayerUnitData.new()
		table.insert(self._answerPlayers, unitData)
		status = 1
	end
	unitData:updateData(data)
	return status
end

function GuildServerAnswerData:_findPlayerById(user_id)
	for i, unit in ipairs(self._answerPlayers) do
		if unit:getUser_id() == user_id then
			return unit
		end
	end
end

function GuildServerAnswerData:_removePlayerById(user_id)
	for i, unit in ipairs(self._answerPlayers) do
		if unit:getUser_id() == user_id then
			table.remove(self._answerPlayers, i)
			return
		end
	end
end

-- 全服答题顽疾列表
function GuildServerAnswerData:getGuildServerAnswerPlayerDatas()
	return self._answerPlayers
end

function GuildServerAnswerData:_handleCurAnswerData(message)
	local answerState = rawget(message, "state")
	local stateEndTime = rawget(message, "stateEndTime") or 0
	if stateEndTime == 0 then
		stateEndTime = self:getNewStartTime()
	end
	local curQuestion = rawget(message, "curQuestion") or rawget(message, "question")
	if curQuestion then
		local GuildAnswerQuestionUnitData = require("app.data.GuildAnswerQuestionUnitData")
		local signalData = GuildAnswerQuestionUnitData.new(nil, 1)
		signalData:updateData(
			curQuestion.question_no or 0,
			curQuestion.question_id or 0,
			curQuestion.questions or {},
			curQuestion.right_answer or -1,
			nil,
			curQuestion.question_param or "",
			{}
		)
		self:setCurQuestion(signalData)
	end
	self:setAnswerState(answerState)
	self:setStateEndTime(stateEndTime)
end

function GuildServerAnswerData:_handleEnd(message)
	local state = rawget(message, "state")
	local stateEndTime = rawget(message, "stateEndTime")
	if (state == "ANSWER_STATE_INIT" or state == "ANSWER_STATE_IDLE") and stateEndTime == 0 then -- 答题结束
		self:setNewStartTime(0)
		G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_GUILD_SERVER_ANSWER)
	end
end

function GuildServerAnswerData:_handleNewStartTime(message)
	local start_time = rawget(message, "start_time")
	local curTime = G_ServerTime:getTime()
	if
		start_time < curTime and
			(self:getAnswerState() == "ANSWER_STATE_INIT" or self:getAnswerState() == "ANSWER_STATE_IDLE")
	 then
		start_time = 0
	end
	if start_time then
		-- logError("_handleNewStartTime " .. start_time)
		self:setNewStartTime(start_time)
	end
end

function GuildServerAnswerData:c2sEnterNewGuildAnswer()
	G_NetworkManager:send(MessageIDConst.ID_C2S_EnterNewAnswer, {})
end

-- message S2C_EnterNewAnswer{
-- 	required uint32 ret = 1;
-- 	optional uint32 start_time =2;//开始时间
-- 	optional GuildAnswerState state = 3;	// 状态
-- 	optional uint32 stateEndTime = 4;		// 状态结束时间
-- 	repeated GuildAnswerPlyInfo cur_player = 5;	// 玩家列表
-- 	optional guildAnswerQuestion curQuestion = 6;//
-- 	repeated guildAnswerRank answer_rank = 7;//自己公会答题时间段的公会积分排名
-- 	repeated GuildMemberAnsewerPoint member_point = 8;//军团成员自己的积分
-- }
function GuildServerAnswerData:_s2cEnterNewGuildAnswer(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local ranks = {}
	ranks = self:_handleRankData(message)
	self._answerPlayers = {}
	self:_handleCurAnswerData(message)
	self:_handlePlayerData(message)
	self:_handleNewStartTime(message)
	self:setRanks(ranks)
	if self:getAnswerState() == "ANSWER_STATE_INIT" then
		self:setReadySucess(0)
	else
		self:setReadySucess(1)
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_ENTER_NEW_ANSWER)
end

-- message S2C_GetGuildNewAnswer{
-- 	optional uint32 start_time =1;//开始时间
-- 	repeated Award now_rand_item =2;//当前随机出的物品
-- }
function GuildServerAnswerData:_s2cGetGuildNewAnswer(id, message)
	local now_rand_item = rawget(message, "now_rand_item")
	if now_rand_item then
		self:setRandomAward(now_rand_item)
	end
	self:_handleNewStartTime(message)
end

-- // 答题系统状态变更
-- message S2C_GuildAnswerSysNotify{
-- 	optional GuildAnswerState state = 1;			// 状态
-- 	optional uint32 stateEndTime = 2;				// 状态结束时间
-- 	optional guildAnswerQuestion question = 3;	    // 下题目-里面有答案
-- }
function GuildServerAnswerData:_s2cGuildAnswerSysNotify(id, message)
	self:_handleCurAnswerData(message)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_UPDATE_STATE)
	if self:getAnswerState() == "ANSWER_STATE_RESTING" then
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, {flag = 0})
	else
		if self:getAnswerState() ~= "ANSWER_STATE_READY" then
			G_SignalManager:dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, {flag = 1})
		end
	end
	self:_handleEnd(message)
end

-- // 更改答案全服广播
-- message S2C_GuildAnswerChangeNotify{
-- 	repeated GuildAnswerPlyInfo update_player = 1;	// 更新玩家答案或者插入玩家
-- 	repeated uint64 del_player = 2;	// 删除玩家
-- 	optional uint32 utype = 3;		// 增加或者重置
-- }
function GuildServerAnswerData:_s2cGuildAnswerChangeNotify(id, message)
	--dump(message)
	local dels = rawget(message, "del_player") or {}
	if #dels > 0 then
		self:_delPlayerData(dels)

		self:_handlePlayerData(message)
	else
		local utype = rawget(message, "utype")
		if utype then
			if utype == 1 then
				local update_player = rawget(message, "update_player") or {}
				self:_updatePlayerDataEx(update_player[1])
			else
				self._answerPlayers = {}
				self:_handlePlayerData(message)
			end
		else
			self:_handlePlayerData(message)
		end
		
		G_SignalManager:dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE, {flag = 1})
	end

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_NEW_ANSWER_UPDATE_PLAYER_NUMS)
end

function GuildServerAnswerData:c2sGuildAnswerChange(answer)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_GuildAnswerChange,
		{
			answer = answer
		}
	)
end

function GuildServerAnswerData:_s2cGuildAnswerChange(id, message)
	if message.ret ~= 1 then
		return
	end
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_SERVER_ANSWER_CHANGE_ANSWER_SUCESS)
end

function GuildServerAnswerData:_s2cGuildAnswerPublic(id, message)
	--check data
	local ranks = self:_handleRankData(message)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_NEW_ANSWER_UPDATE_RANK, ranks)
end

return GuildServerAnswerData
