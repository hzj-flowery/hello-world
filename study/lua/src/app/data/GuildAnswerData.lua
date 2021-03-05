-- Author: nieming
-- Date:2018-01-30 10:35:52
-- Describle：

local BaseData = require("app.data.BaseData")
local GuildAnswerData = class("GuildAnswerData", BaseData)
local GuildServerAnswerPlayerUnitData = require("app.data.GuildServerAnswerPlayerUnitData")

local schema = {}
--schema
schema["randomAward"] = {"table", nil}
schema["startTime"] = {"number", 0}
schema["answerData"] = {"table", {}}
GuildAnswerData.schema = schema

function GuildAnswerData:ctor(properties)
	GuildAnswerData.super.ctor(self, properties)

	self._signalRecvEnterGuildAnswer =
		G_NetworkManager:add(MessageIDConst.ID_S2C_EnterGuildAnswer, handler(self, self._s2cEnterGuildAnswer))

	self._signalRecvAnswerGuildQuestion =
		G_NetworkManager:add(MessageIDConst.ID_S2C_AnswerGuildQuestion, handler(self, self._s2cAnswerGuildQuestion))

	self._signalRecvSetGuildAnswerTime =
		G_NetworkManager:add(MessageIDConst.ID_S2C_SetGuildAnswerTime, handler(self, self._s2cSetGuildAnswerTime))

	self._signalRecvGuildAnswerPublic =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GuildAnswerPublic, handler(self, self._s2cGuildAnswerPublic))
	self._signalRandomAward =
		G_NetworkManager:add(MessageIDConst.ID_S2C_GetGuildAnswer, handler(self, self._s2cGetGuildAnswer))
end

function GuildAnswerData:clear()
	self._signalRecvEnterGuildAnswer:remove()
	self._signalRecvEnterGuildAnswer = nil

	self._signalRecvAnswerGuildQuestion:remove()
	self._signalRecvAnswerGuildQuestion = nil

	self._signalRecvSetGuildAnswerTime:remove()
	self._signalRecvSetGuildAnswerTime = nil

	self._signalRecvGuildAnswerPublic:remove()
	self._signalRecvGuildAnswerPublic = nil

	self._signalRandomAward:remove()
	self._signalRandomAward = nil
end

function GuildAnswerData:reset()
end

-- Describle：
-- Param:
function GuildAnswerData:_handleRankData(message)
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

function GuildAnswerData:_handleStartTime(message)
	local start_time = rawget(message, "start_time")
	if start_time then
		self:setStartTime(start_time)
	end
end

function GuildAnswerData:c2sEnterGuildAnswer()
	G_NetworkManager:send(MessageIDConst.ID_C2S_EnterGuildAnswer, {})
end

-- Describle：
function GuildAnswerData:_s2cEnterGuildAnswer(id, message)
	dump(message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	local answerData = {}
	local questions = rawget(message, "questions") or {}
	local answers = rawget(message, "answers") or {}
	local answersMap = {}
	for _, v in ipairs(answers) do
		answersMap[v.Key] = v.Value
	end
	answerData.questions = {}

	local GuildAnswerQuestionUnitData = require("app.data.GuildAnswerQuestionUnitData")
	for k, v in ipairs(questions) do
		local signalData = GuildAnswerQuestionUnitData.new()
		signalData:updateData(v.question_no, v.question_id, v.questions, v.right_answer, answersMap[v.question_no], nil, v.wrong_param)
		answerData.questions[v.question_no] = signalData
		-- table.insert(answerData.questions, signalData)
	end
	table.sort(
		answerData.questions,
		function(a, b)
			return a:getQuestionNo() < b:getQuestionNo()
		end
	)

	-- local canAnswer = rawget(message, "can_answer") or false
	-- answerData.canAnswer = canAnswer

	answerData.ranks = self:_handleRankData(message)

	local endScore = 0
	local endRank = 0
	local endExp = 0
	local end_notice = rawget(message, "end_notice")
	if end_notice then
		for _, v in pairs(end_notice.sys_notice) do
			if v.key == "integral" then
				endScore = tonumber(v.value) or 0
			elseif v.key == "rank" then
				endRank = tonumber(v.value) or 0
			elseif v.key == "exp" then
				endExp = tonumber(v.value) or 0
			end
		end
	end
	answerData.endScore = endScore
	answerData.endRank = endRank
	answerData.endExp = endExp
	local now_rand_item = rawget(message, "now_rand_item")
	if now_rand_item then
		self:setRandomAward(now_rand_item)
	end
	self:_handleStartTime(message)
	self:setAnswerData(answerData)
	G_SignalManager:dispatch(SignalConst.EVENT_ENTER_GUILD_ANSWER_SUCCESS)
end
-- Describle：
-- Param:
--	question_id
--	answer_id
function GuildAnswerData:c2sAnswerGuildQuestion(question_no, answer_id)
	-- logWarn("GuildAnswerData:c2sAnswerGuildQuestion " .. question_no .. " " .. answer_id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_AnswerGuildQuestion,
		{
			question_no = question_no,
			answer_id = answer_id
		}
	)
end
-- Describle：
function GuildAnswerData:_s2cAnswerGuildQuestion(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	if rawget(message, "question_no") then
		local answerData = self:getAnswerData()
		local question = answerData.questions[message.question_no]
		if question then
			question:setIs_right(rawget(message, "is_right") or false)
		end
		self:setAnswerData(answerData)
	end

	G_SignalManager:dispatch(SignalConst.EVENT_ANSWER_GUILD_QUESTION_SUCCESS, message)
end
-- Describle：
-- Param:
--	time_id   时间id
function GuildAnswerData:c2sSetGuildAnswerTime(time_id)
	G_NetworkManager:send(
		MessageIDConst.ID_C2S_SetGuildAnswerTime,
		{
			time_id = time_id
		}
	)
end

-- Describle：
function GuildAnswerData:_s2cSetGuildAnswerTime(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	--报名军团发生变化
	local ranks = self:_handleRankData(message)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_ANSWER_PUBLIC_SUCCESS, ranks)
	--修改答题时间
	G_SignalManager:dispatch(SignalConst.EVENT_SET_GUILD_ANSWER_TIME_SUCCESS)
end
-- Describle：
function GuildAnswerData:_s2cGuildAnswerPublic(id, message)
	--check data
	local ranks = self:_handleRankData(message)
	local answerData = self:getAnswerData()

	if rawget(message, "question_no") and answerData.questions then
		local question = answerData.questions[message.question_no]
		if question then
			question:setRightAnswer(message.right_answer)
		else
			print("question is null")
		end
		self:setAnswerData(answerData)
	else
		print("null")
	end

	dump(message)

	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_ANSWER_PUBLIC_SUCCESS, ranks)
	G_SignalManager:dispatch(SignalConst.EVENT_GUILD_ANSWER_ONE_QUESTION_DONE)
end

function GuildAnswerData:_s2cGetGuildAnswer(id, message)
	local now_rand_item = rawget(message, "now_rand_item")
	if now_rand_item then
		self:setRandomAward(now_rand_item)
	end
	self:_handleStartTime(message)
end

return GuildAnswerData
