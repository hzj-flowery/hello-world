-- Author: nieming
-- Date:2018-01-30 10:11:53
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local AnswerClientEnd = class("AnswerClientEnd", ViewBase)
local GuildAnswerHelper = require("app.scene.view.guildAnswer.GuildAnswerHelper")
local ParamConfig = require("app.config.parameter")
local UIActionHelper = require("app.utils.UIActionHelper")
function AnswerClientEnd:ctor(callback, emptyQuestions)
	--csb bind var name
	self._heroAvatar = nil --CommonStoryAvatar
	-- self._tip = nil  --Text
	self._callback = callback
	self._emptyQuestions = emptyQuestions
	local resource = {
		file = Path.getCSB("AnswerClientEnd", "guildAnswer")
	}
	AnswerClientEnd.super.ctor(self, resource)
end

-- Describle：
function AnswerClientEnd:onCreate()
	self._heroAvatar:updateUI(429)
	self._heroAvatar:setScale(0.6)
	-- self:_setTip()
	local currTime = G_ServerTime:getTime()
	local endTime = GuildAnswerHelper.getGuildAnswerStartTime()
	if self._emptyQuestions and currTime >= endTime then
		self._textTimeDesc:setVisible(false)
		self._textOverTime:setVisible(false)
		self._alreadyOpenDesc:setVisible(true)
	else
		self._textTimeDesc:setVisible(true)
		self._textOverTime:setVisible(true)
		self._alreadyOpenDesc:setVisible(false)
		if GuildAnswerHelper.isTodayOpen() then
			self._textOverTime:setString(
				G_ServerTime:getLeftSecondsString(GuildAnswerHelper.getGuildAnswerStartTime(), "00:00:00")
			)
		else
			self._textOverTime:setString("00:00:00")
		end
		if currTime < endTime and GuildAnswerHelper.isTodayOpen() then
			local action =
				UIActionHelper.createUpdateAction(
				function()
					self:_updateCountDown()
				end,
				0.5
			)
			self._textOverTime:runAction(action)
		end
	end
end

function AnswerClientEnd:_updateCountDown()
	-- body
	local currTime = G_ServerTime:getTime()
	local endTime = GuildAnswerHelper.getGuildAnswerStartTime()
	self._textOverTime:setString(
		G_ServerTime:getLeftSecondsString(GuildAnswerHelper.getGuildAnswerStartTime(), "00:00:00")
	)
	if currTime >= endTime then
		self._textOverTime:stopAllActions()
		if self._callback then
			self._callback()
		end
	end
end

-- Describle：
function AnswerClientEnd:onEnter()
end

-- function AnswerClientEnd:_setTip()
-- 	local index =  GuildAnswerHelper.getGuildAnswerStartIndex()
-- 	local paramStr = ParamConfig.get(143).content
-- 	local times = string.split(paramStr, "|")
-- 	local numTime = tonumber(times[index] or 0) or 0
-- 	local hour = math.floor(numTime/3600)
-- 	local tipStr = Lang.get("lang_guild_answer_end_tip_1", {num = hour})
-- 	local richtext = ccui.RichText:createRichTextByFormatString2(tipStr, Colors.DARK_BG_THREE, 20)
-- 	richtext:setAnchorPoint(0.5, 0.5)
-- 	self._tip:addChild(richtext)
-- end

-- Describle：
function AnswerClientEnd:onExit()
end

return AnswerClientEnd
