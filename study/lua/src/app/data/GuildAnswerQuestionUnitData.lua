-- Author: nieming
-- Date:2018-01-30 15:04:00
-- Describle：

local BaseData = require("app.data.BaseData")
local GuildAnswerQuestionUnitData = class("GuildAnswerQuestionUnitData", BaseData)
local AnswerConfig = require("app.config.answer")
local NewAnswerConfig = require("app.config.new_answer")
local schema = {}
schema["questionNo"] = {"number", 0} -- 第几题
schema["questionId"] = {"number", 0} --题目
schema["rightAnswer"] = {"number", -1} -- 正确答案
schema["is_right"] = {"boolean", false} -- 正确答案

schema["options"] = {"table", {}} -- 选项
schema["wrongParam"] = {"table", {}} -- 错误选项
schema["questionDes"] = {"string", ""} -- 题目描述
schema["selectOption"] = {"number", 0} -- 0

--schema
GuildAnswerQuestionUnitData.schema = schema

function GuildAnswerQuestionUnitData:ctor(properties, flag)
	GuildAnswerQuestionUnitData.super.ctor(self, properties)
	self._flag = flag or 0 -- 0 原答题 1 新答题
end

function GuildAnswerQuestionUnitData:clear()
end

function GuildAnswerQuestionUnitData:reset()
end

function GuildAnswerQuestionUnitData:updateData(
	question_no,
	question_id,
	options,
	right_answer,
	selectOption,
	question_param,
	wrongAnswers)
	self:setQuestionNo(question_no)
	self:setQuestionId(question_id)
	self:setRightAnswer(right_answer)
	self:setSelectOption(selectOption or 0)

	local wrongAnswerArray = {}

	if wrongAnswers then
		for k, v in pairs(wrongAnswers) do
			wrongAnswerArray[v] = 1
		end
	end

	self:setWrongParam(wrongAnswerArray)

	local config = nil
	if self._flag == 1 then
		config = NewAnswerConfig.get(question_id)
	else
		config = AnswerConfig.get(question_id)
	end
	if config then
		local des = string.gsub(config.description, "#param#", question_param or "")

		local result = ""
		local randomLength = math.random(2, 7)
		local randomIndex = math.random(1, randomLength )

		result = randomIndex

		for i = 1, randomLength do 
			local randomPart = math.random( 9999999 )
			if i == randomIndex then
				result = result .. "_" .. des
			else
				result = result .. "_" .. randomPart
			end
		end

		print("result "..result)
		self:setQuestionDes(result)
	else
		logError("error id " .. question_id)
		self:setQuestionDes("")
	end

	local ops = {}
	for i = 1, #options do
		ops[i] = options[i] or ""
	end
	self:setOptions(ops)
end

return GuildAnswerQuestionUnitData
