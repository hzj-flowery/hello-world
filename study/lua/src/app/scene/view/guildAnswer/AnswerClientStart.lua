-- Author: nieming
-- Date:2018-01-30 20:17:37
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local AnswerClientStart = class("AnswerClientStart", ViewBase)
local UIActionHelper = require("app.utils.UIActionHelper")
local GuildAnswerHelper = require("app.scene.view.guildAnswer.GuildAnswerHelper")
local GuildAnswerConst = require("app.const.GuildAnswerConst")

function AnswerClientStart:ctor(questions, countDownCallback)
	--csb bind var name
	self._countDownTime = nil --Text
	self._loadingBarProgress = nil --LoadingBar
	self._questionContent = nil --
	self._questionIndexText = nil --Text
	self._questionIndexParent = nil --SingleNode
	self._questionOptionsParent = nil
	self._curSelectAnswerOptionIndex = 0
	self._curBeginTime = 0
	self._curEndTime = 0

	self._questions = questions
	self._countDownCallback = countDownCallback

	local resource = {
		file = Path.getCSB("AnswerClientStart", "guildAnswer")
	}
	AnswerClientStart.super.ctor(self, resource)
end

-- Describle：
function AnswerClientStart:onCreate()
	local renderLabel = self._questionContent:getVirtualRenderer()
	renderLabel:setWidth(400)
	renderLabel:setLineSpacing(3)

	local ExaminationIndex = require("app.scene.view.guildAnswer.ExaminationIndex")
	local ExaminationOption = require("app.scene.view.guildAnswer.ExaminationOption")
	self._indexs = {}
	local indexGap = 60
	for i = 1, GuildAnswerConst.QUESTION_NUM do
		local indexNode = ExaminationIndex.new(i)
		indexNode:setPositionX((i - 1) * indexGap)
		self._questionIndexParent:addChild(indexNode)
		self._indexs[i] = indexNode
	end

	self._options = {}
	local optionXGap = 300
	local optionYGap = 80
	for i = 1, 4 do
		local optionNode = ExaminationOption.new(i, handler(self, self._onSelectOption))
		optionNode:setPosition(cc.p(((i - 1) % 2) * optionXGap, -math.floor(((i - 1) / 2)) * optionYGap))
		self._questionOptionsParent:addChild(optionNode)
		self._options[i] = optionNode
	end
	self._respondTime = GuildAnswerHelper.getRespondTime()
	self._awardTime = GuildAnswerHelper.getAwardTime()
	self._curIndex, self._isAwardTime = GuildAnswerHelper.getCurQuestionIndex(self._questions)
	-----测试代码
	-- self:getTestData()
	-- self._curIndex = 1
	---
	self._curQuestion = self._questions[self._curIndex]
	-- print("============================111=="..self._curIndex)

	if not self._curQuestion then
		assert(false, "self._curQuestion == nil")
		return
	end

	self._curSelectAnswerOptionIndex = self._curQuestion:getSelectOption()
	self:_updateQuestionContent()
	self:_startCountDown()
end

-- Describle：
function AnswerClientStart:onEnter()
	self._answerSignal =
		G_SignalManager:add(SignalConst.EVENT_ANSWER_GUILD_QUESTION_SUCCESS, handler(self, self._onEventAnswerResult))
	self._answerNextSignal =
		G_SignalManager:add(SignalConst.EVENT_GUILD_ANSWER_ONE_QUESTION_DONE, handler(self, self._next))
end

-- Describle：
function AnswerClientStart:onExit()
	self._answerSignal:remove()
	self._answerSignal = nil
	self._answerNextSignal:remove()
	self._answerNextSignal = nil
end

function AnswerClientStart:_updateQuestionContent()
	self:_updateQuestionsIndex()
	self:_updateOptions()
end

function AnswerClientStart:_updateQuestionsIndex()
	for i = 1, GuildAnswerConst.QUESTION_NUM do
		local questionData = self._questions[i]
		local isRight = questionData:getRightAnswer() == questionData:getSelectOption()
		local isAnswer = questionData:getSelectOption() ~= 0
		self._indexs[i]:updateUI(self._curIndex, isRight, isAnswer)
		if self._curIndex == i then
			self._questionIndexText:setString(Lang.get("lang_guild_answer_start_question_index", {num = i}))

			local des = questionData:getQuestionDes()
			--dump(des)
			local parts = string.split(des, "_")
			local index = tonumber(parts[1])
			local realDes = parts[index + 1]
			--dump(realDes)
			self._questionContent:setString(realDes or "")
		end
	end
end

function AnswerClientStart:_updateOptions()
	if not self._curQuestion then
		return
	end

	local hasShowWrongBuff = false
	local showWrongNum = 0
	local buffDatas = G_UserData:getHomeland():getBuffDatasWithBaseId(2) -- 军团答题排除错误答案buff

	if #buffDatas ~= 0 then
		hasShowWrongBuff = true
		showWrongNum = buffDatas[1]:getConfig().value
	end

	-- local resultIndex = {}

	-- if hasShowWrongBuff == true then
	-- 	-- 随机4选3
	-- 	local indexArray = {1, 2, 3, 4}
	-- 	local m = 4
	-- 	local n = 3

	-- 	for k, v in pairs(indexArray) do 
	-- 		math.randomseed(math.floor(G_ServerTime:getTime() / 3600) + self._curIndex)
	-- 		local rand = math.random()
	-- 		if rand < n / m then
	-- 			resultIndex[v] = v
	-- 			n = n - 1
	-- 		end

	-- 		m = m - 1
	-- 	end
	-- end

	-- dump(resultIndex)

	local options = self._curQuestion:getOptions()
	local wrongAnswers = self._curQuestion:getWrongParam()
	for j = 1, 4 do
		local isNeedShowRight = self._isAwardTime
		local isNeedShowWrong = hasShowWrongBuff and showWrongNum > 0 and wrongAnswers[j]
		local isSelect = self._curQuestion:getSelectOption() == j

		local isRight = false
		if self._curQuestion:getRightAnswer() > 0 then
			isRight = self._curQuestion:getRightAnswer() == j
		else
			isRight = self._curQuestion:isIs_right()
		end



		self._options[j]:updateUI(options[j], isNeedShowRight or isSelect, isSelect, isRight, isNeedShowWrong)

		if isRight == false and isNeedShowWrong then
			showWrongNum = showWrongNum - 1
		end
	end
end

function AnswerClientStart:_updateOptionByIndex(index)
	if not self._curQuestion then
		return
	end
	local options = self._curQuestion:getOptions()
	for j = 1, 4 do
		if j == index then
			-- local isNeedShowRight = self._isAwardTime
			local isSelect = self._curQuestion:getSelectOption() == j
			local isRight = self._curQuestion:isIs_right()
			self._options[j]:updateUI(options[j], true, isSelect, isRight)
			break
		end
	end
end

function AnswerClientStart:_onSelectOption(index)
	if self._isAwardTime then
		return
	end

	if not self._curQuestion then
		assert(false, "self._curQuestion  == nil ")
		return
	end

	if self._curSelectAnswerOptionIndex and self._curSelectAnswerOptionIndex > 0 then
		return
	end

	-- 如果被踢出军团 不能答题
	local isInGuild = G_UserData:getGuild():isInGuild()
	if not isInGuild then
		G_Prompt:showTip(Lang.get("lang_guild_answer_no_guild"))
		return
	end
	-- logError("====================="..index)
	G_UserData:getGuildAnswer():c2sAnswerGuildQuestion(self._curQuestion:getQuestionNo(), index)
end

function AnswerClientStart:_setLoadingBarProgress(curTime)
	if self._isAwardTime then
		self._loadingBarProgress:setPercent(0)
	else
		local percent = 100 * (self._curEndTime - curTime) / (self._curEndTime - self._curBeginTime)
		if percent < 0 then
			percent = 0
		end
		self._loadingBarProgress:setPercent(percent)
	end
end
--开始倒计时
function AnswerClientStart:_startCountDown()
	if not self._curQuestion then
		return
	end
	self._countDownTime:stopAllActions()
	self._curBeginTime = GuildAnswerHelper.getQuestionBeginTime(self._curQuestion)
	if self._isAwardTime then
		--结算时间
		self._awardTimeLabel:setVisible(false) -- 策划大哥不需要 结算中  暂时设为false
		self._countDownParentNode:setVisible(false)
		self._curBeginTime = self._curBeginTime + self._respondTime
		self._curEndTime = self._curBeginTime + self._awardTime
	else
		--答题时间
		self._countDownParentNode:setVisible(true)
		self._awardTimeLabel:setVisible(false)
		self._curEndTime = self._curBeginTime + self._respondTime
	end
	-- logError("============================")
	-- print(self._isAwardTime, self._curBeginTime, self._curEndTime, self._curIndex)

	local curTime = G_ServerTime:getTime()

	local action =
		UIActionHelper.createUpdateAction(
		function()
			local curTime2 = G_ServerTime:getTime()
			local diffTime = self._curEndTime - curTime2
			if diffTime < 0 then
				diffTime = 0
			end
			self._countDownTime:setString(diffTime)
			self:_setLoadingBarProgress(curTime2)
			if curTime2 >= self._curEndTime then
				--self:_next()
				self._countDownTime:stopAllActions()
			end
		end,
		0.02
	)

	self._countDownTime:setString(self._curEndTime - curTime)
	self:_setLoadingBarProgress(curTime)
	self._countDownTime:runAction(action)
end
--
function AnswerClientStart:_addScorePromptTips(questionData, callback)
	if questionData then
		if questionData:getSelectOption() ~= 0 then
			if questionData:isIs_right() then
				local score = GuildAnswerHelper.getRightPoint()
				local str = Lang.get("lang_guild_answer_start_right_score_add", {num = score})
				self:_showTips(str, true, callback)
			else
				local score = GuildAnswerHelper.getWrongPoint()
				local str = Lang.get("lang_guild_answer_start_wrong_score_add", {num = score})
				self:_showTips(str, false, callback)
			end
		else
			local str = Lang.get("lang_guild_answer_start_not_answer")
			self:_showTips(str, false, callback)
		end
	else
		callback()
	end
end

function AnswerClientStart:_next()
	--主要 处理 切换到后台在切换回来导致题目序号不对 需要从新推算
	--self.___, self._isAwardTime = GuildAnswerHelper.getCurQuestionIndex(self._questions)

	self._isAwardTime = true
	self:_updateQuestionContent()

	self._curIndex = self._curIndex + 1
	self._isAwardTime = false

	print("self._curIndex "..self._curIndex)

	if not self._curIndex or self._curIndex > #self._questions then
		self._countDownTime:stopAllActions()
		
		if self._countDownCallback then
			self._countDownCallback()
		end

		logDebug("====================get acution data")
		G_UserData:getAuction():c2sGetAllAuctionInfo()

		return
	end
	-- 进入下一题前 清除选项
	if not self._isAwardTime then
		self._curSelectAnswerOptionIndex = 0
	end

	self._curQuestion = self._questions[self._curIndex]

	local awardTime = GuildAnswerHelper.getAwardTime()

	local SchedulerHelper = require ("app.utils.SchedulerHelper")
    SchedulerHelper.newScheduleOnce(function()
		self:_startCountDown()
		self:_updateQuestionContent()
    end, awardTime)
end

function AnswerClientStart:_onEventAnswerResult(id, message)
	local question_no = rawget(message, "question_no")
	if question_no then
		local questionData = self._questions[question_no]
		if not questionData then
			assert(false, "questionData == nil")
			return
		end
		local answer_id = rawget(message, "answer_id")
		local awards = rawget(message, "reward") or {}
		if answer_id then
			questionData:setSelectOption(answer_id)
			self._curSelectAnswerOptionIndex = answer_id
			self:_addScorePromptTips(
				questionData,
				function()
					G_Prompt:showAwards(awards)
				end
			) --弹出积分
			--更新选项
			if questionData:getQuestionNo() == self._curQuestion:getQuestionNo() then
				self:_updateOptionByIndex(answer_id)
			end
		end
	end
end

function AnswerClientStart:_showTips(str, isRight, callback)
	-- local function effectFunction(effect)
	-- 	if string.find(effect, "effect_") then
	-- 		local subEffect = EffectGfxNode.new(effect)
	-- 		subEffect:play()
	-- 		return subEffect
	-- 	elseif effect == "txt_huida" then
	-- 		-- local richtext = ccui.RichText:createRichTextByFormatString2(str, Colors.BRIGHT_BG_ONE, 22)
	-- 		-- richtext:setAnchorPoint(0.5, 0.5)
	-- 		local sprite
	-- 		if isRight then
	-- 			sprite = cc.Sprite:create(Path.getGuildAnswerText("txt_answer_01"))
	-- 		else
	-- 			sprite = cc.Sprite:create(Path.getGuildAnswerText("txt_answer_02"))
	-- 		end
	-- 		return sprite
	-- 	end
	-- end
	local function eventFunction(event)
		if event == "finish" then
			if callback then
				callback()
			end
		end
	end
	local movingName = "moving_juntuandati_zhengque"
	if not isRight then
		movingName = "moving_juntuandati_cuowu"
	end
	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._effectTipsNode, movingName, nil, eventFunction, true)
end

return AnswerClientStart
