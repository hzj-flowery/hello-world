-- Author: liushiyin
-- Date:2019-03-11 18:36:35
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildServerAnswerNode = class("GuildServerAnswerNode", ViewBase)
local SchedulerHelper = require("app.utils.SchedulerHelper")
local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")
local GuildAnswerConst = require("app.const.GuildAnswerConst")
local TextHelper = require("app.utils.TextHelper")

local FLOAT_HEIGHT = 80
local MAX_TIME = 10

function GuildServerAnswerNode:ctor()
	--csb bind var name
	self._btnFalse = nil --Button
	self._btnTrue = nil --Button
	self._panelDesign = nil --Panel
	self._textExamination = nil --Text
	self._textCountDown = nil
	self._startTimer = false
	self._deltTime = 0
	self._timeOffset = 0

	local resource = {
		file = Path.getCSB("GuildServerAnswerNode", "guildServerAnswer"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnFalse = {
				events = {{event = "touch", method = "_onBtnFalse"}}
			},
			_btnTrue = {
				events = {{event = "touch", method = "_onBtnTrue"}}
			}
		}
	}
	GuildServerAnswerNode.super.ctor(self, resource)
end

-- Describle：
function GuildServerAnswerNode:onCreate()
	self._answerText:setString("")
	self._waveImage:ignoreContentAdaptWithSize(true)
	self._diedTips:ignoreContentAdaptWithSize(true)
	self._textQuesNo:ignoreContentAdaptWithSize(true)
	self._textExamination:setString("")
	self._specialNode:setVisible(false)
	self._textQuesNo:setVisible(false)
	self._countDown:setVisible(false)
	local textureList = {
		"img_runway_star.png",
		"img_runway_star1.png",
		"img_runway_star2.png",
		"img_runway_star3.png"
	}
	self._countDown:setTextureList(textureList)
	self._openCountDown:setCountdownLableParam(
		{color = Colors.DARK_BG_THREE, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO}
	)
	self._openCountDown:setCountdownTimeParam({color = Colors.BRIGHT_BG_RED, outlineColor = Colors.BRIGHT_BG_OUT_LINE_TWO})
end

-- Describle：
function GuildServerAnswerNode:onEnter()
	self._signalEventGuildServerUpdatePlayerNums =
		G_SignalManager:add(
		SignalConst.EVENT_GUILD_NEW_ANSWER_UPDATE_PLAYER_NUMS,
		handler(self, self._onEventUpdatePlayerNums)
	)
	self:scheduleUpdateWithPriorityLua(handler(self, self._update), 0)
	self:_onEventUpdatePlayerNums()
end

-- Describle：
function GuildServerAnswerNode:onExit()
	self._state = nil
	self._signalEventGuildServerUpdatePlayerNums:remove()
	self._signalEventGuildServerUpdatePlayerNums = nil
end

function GuildServerAnswerNode:_update(dt)
	if self._startTimer then
		self._deltTime = self._deltTime + dt
		if self._deltTime >= 1 then
			self._deltTime = 0
			self:_timeTick()
		end
	end
end

function GuildServerAnswerNode:_onEventUpdatePlayerNums()
	local GuildAnswerConst = require("app.const.GuildAnswerConst")
	local trueNums = 0
	local falseNums = 0
	local playerList = G_UserData:getGuildServerAnswer():getGuildServerAnswerPlayerDatas()
	for k, v in pairs(playerList) do
		if v:getSide() == GuildAnswerConst.LEFT_SIDE then
			trueNums = trueNums + 1
		else
			falseNums = falseNums + 1
		end
	end
	self._textTrueNums:setString(trueNums)
	self._textFalseNums:setString(falseNums)
end

function GuildServerAnswerNode:_timeTick()
	if self:_totalTime() >= 0 then
		local state = G_UserData:getGuildServerAnswer():getAnswerState()
		if state == GuildAnswerConst.ANSWER_STATE_PLAYING or state == GuildAnswerConst.ANSWER_STATE_RESTING then
			self:_setTextCount()
			if self:_totalTime() == 0 then
				self:_setButtonVisible(false)
			end
		else
			self:_setEffectCoundDown()
		end
	else
		self._startTimer = false
	end
end

function GuildServerAnswerNode:_setEffectCoundDown()
	self._specialNode:setVisible(true)
	self._textCountDown:setVisible(false)
	local state = G_UserData:getGuildServerAnswer():getAnswerState()
	if self:_totalTime() <= 3 and state == GuildAnswerConst.ANSWER_STATE_READY then
		if self:_totalTime() == 3 then
			self._waveImage:setVisible(false)
			self._specialTime:setVisible(false)
			local AudioConst = require("app.const.AudioConst")
			G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_COUNT)
			self._countDown:setVisible(true)
			self._countDown:playAnimation(4, 1, nil)
		end
	else
		self._specialTime:setVisible(true)
		self._specialTime:setString(self:_totalTime())
	end
end

function GuildServerAnswerNode:_setTextCount()
	self._textCountDown:setVisible(true)
	self._specialNode:setVisible(false)
	self._countDown:setVisible(false)
	local timeTxt = self:_totalTime()
	self._textCountDown:setString(timeTxt)
end

-- Describle：
function GuildServerAnswerNode:_onBtnTrue()
	if self._state ~= GuildAnswerConst.ANSWER_STATE_PLAYING then
		return
	end

	-- body
	self:_clickSound()
	if not GuildServerAnswerHelper.getServerAnswerSelfIsReadSuccess() then
		G_Prompt:showTip(Lang.get("guild_server_answer_taotai"))
		return
	end
	local GuildAnswerConst = require("app.const.GuildAnswerConst")
	G_UserData:getGuildServerAnswer():c2sGuildAnswerChange(GuildAnswerConst.LEFT_SIDE)
	self._btnTrue:setEnabled(false)
	self._btnFalse:setEnabled(true)
end
-- Describle：
function GuildServerAnswerNode:_onBtnFalse()
	if self._state ~= GuildAnswerConst.ANSWER_STATE_PLAYING then
		return
	end
	
	-- body
	self:_clickSound()
	if not GuildServerAnswerHelper.getServerAnswerSelfIsReadSuccess() then
		G_Prompt:showTip(Lang.get("guild_server_answer_taotai"))
		return
	end
	local GuildAnswerConst = require("app.const.GuildAnswerConst")
	G_UserData:getGuildServerAnswer():c2sGuildAnswerChange(GuildAnswerConst.RIGHT_SIDE)
	self._btnTrue:setEnabled(true)
	self._btnFalse:setEnabled(false)
end

function GuildServerAnswerNode:_clickSound()
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playSoundWithId(AudioConst.SOUND_BUTTON)
end

function GuildServerAnswerNode:_updateExamiationInfo()
	local curQues = G_UserData:getGuildServerAnswer():getCurQuestion()
	local des = curQues:getQuestionDes()
	--dump(des)
	local parts = string.split(des, "_")
	local index = tonumber(parts[1])
	local realDes = parts[index + 1]
	--dump(realDes)
	self._textExamination:setString(realDes or "")
	-- self._answerText:setString(curQues:getRightAnswer())
	return curQues:getRightAnswer()
end

-- 题号动画
function GuildServerAnswerNode:_playQuesNoFloatAction(callback)
	local visibleNo = GuildServerAnswerHelper.getCurrentVisibleQuesNo()
	self._textQuesNo:setVisible(true)
	local posx, posy = self._textQuesNo:getPosition()
	self._textQuesNo:loadTexture(Path.getGuildAnswerText(string.format("txt_answer_n%02d", visibleNo)))
	self._textQuesNo:setScale(0.1)
	local fade = cc.ScaleTo:create(0.5, 1)
	local delayTime = cc.DelayTime:create(1)
	local move = cc.MoveBy:create(0.5, cc.p(0, FLOAT_HEIGHT))
	local sequence =
		cc.Sequence:create(
		fade,
		delayTime,
		move,
		cc.CallFunc:create(
			function()
				self._textQuesNo:setVisible(false)
				self._textQuesNo:setScale(1)
				self._textQuesNo:setPosition(cc.p(posx, posy))
				if callback then
					callback()
				end
			end
		)
	)
	self._textQuesNo:runAction(sequence)
end

function GuildServerAnswerNode:_set_ANSWER_STATE_PLAYING()
	self._textExamination:setString("")
	self._textCountDown:setString("")
	self._playingImage:setVisible(true)
	self._startTimer = false
	local callback = function()
		self._startTimer = true
		self._timeOffset = -1
		self:_timeTick()
		self:_updateExamiationInfo()
		local isInAnswer = GuildServerAnswerHelper.getServerAnswerSelfIsReadSuccess()
		self:_setButtonVisible(true and isInAnswer)
	end
	if self._state then
		self:_playQuesNoFloatAction(callback)
	else
		callback()
	end
end

function GuildServerAnswerNode:_set_ANSWER_STATE_RESTING()
	self._textCountDown:setString("")
	self._playingImage:setVisible(true)
	self._startTimer = false
	self:_setButtonVisible(false)
	self:_updateExamiationInfo()
end

function GuildServerAnswerNode:_set_ANSWER_STATE_IDLE()
	self._openCountDown:setVisible(true)
	self._openCountDown:startCountDown(
		Lang.get("country_boss_countdown_label5"),
		GuildServerAnswerHelper.getNextOpenTime()
	)
	self:_setButtonVisible(false)
end

function GuildServerAnswerNode:_set_ANSWER_STATE_INIT()
	self:_set_ANSWER_STATE_IDLE()
end

function GuildServerAnswerNode:_set_ANSWER_STATE_READY()
	if G_UserData:getGuildServerAnswer():getReadySucess() == 0 then -- 报名未成功
		G_UserData:getGuildServerAnswer():c2sEnterNewGuildAnswer()
	end
	self._waveImage:setVisible(true)
	self._timeOffset = -1
	local wave = GuildServerAnswerHelper.getCurWaves()
	self._waveImage:loadTexture(Path.getGuildAnswerText("txt_answer_wave_" .. wave))
	self:_setButtonVisible(false)
end

function GuildServerAnswerNode:_setButtonVisible(enbaled)
	self._btnTrue:setVisible(enbaled)
	self._btnFalse:setVisible(enbaled)
	self._btnTrue:setEnabled(enbaled)
	self._btnFalse:setEnabled(enbaled)
end

function GuildServerAnswerNode:updateUI(state)
	self:_preState(state)
	local stateFunc = self["_set_" .. state]
	if stateFunc then
		stateFunc(self)
	end
	self._state = state
end

function GuildServerAnswerNode:_preState(state)
	self:_updateTick(state)
	self:_updateTips(state)
	self._imageSelected:setVisible(false)
	self._playingImage:setVisible(false)
	self._waveImage:setVisible(false)
	self._openCountDown:setVisible(false)
	self._timeOffset = 0
end

function GuildServerAnswerNode:_updateTips(state)
	local show = not GuildServerAnswerHelper.getServerAnswerSelfIsReadSuccess()
	show = show and (state == GuildAnswerConst.ANSWER_STATE_PLAYING or state == GuildAnswerConst.ANSWER_STATE_RESTING)
	self._imageTips:setVisible(show)
	local waves = GuildServerAnswerHelper.getCurWaves()
	local resId = "txt_answer_04"
	if waves >= GuildServerAnswerHelper.getMaxWaves() then
		resId = "txt_answer_03"
	end
	self._diedTips:loadTexture(Path.getGuildAnswerText(resId))
end

function GuildServerAnswerNode:_updateTick(state)
	self._startTimer = false
	if state == GuildAnswerConst.ANSWER_STATE_IDLE or state == GuildAnswerConst.ANSWER_STATE_INIT then
		return
	end
	if self:_totalTime() > 0 then
		self:_timeTick()
		self._startTimer = true
	else
		self._textCountDown:setString("")
	end
end

function GuildServerAnswerNode:_totalTime()
	local curTime = G_ServerTime:getTime()
	local endTime = G_UserData:getGuildServerAnswer():getStateEndTime()
	return endTime - curTime + self._timeOffset
end

return GuildServerAnswerNode
