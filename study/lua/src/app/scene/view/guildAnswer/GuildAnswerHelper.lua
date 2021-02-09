local ParamConfig = require("app.config.parameter")

local GuildAnswerHelper = {}

--获取答题开始时间
function GuildAnswerHelper.getGuildAnswerStartTime()
	if not GuildAnswerHelper.isTodayOpen() then
		return 0
	end
	
	return G_UserData:getGuildAnswer():getStartTime()
end

--questionsData GuildAnswerQuestionUnitData 数组
function GuildAnswerHelper.getGuildAnswerTotalTime()
	local GuildAnswerConst = require("app.const.GuildAnswerConst")
	local respondTime = GuildAnswerHelper.getRespondTime()
	local awardTime = GuildAnswerHelper.getAwardTime()
	local time = respondTime + awardTime
	local totalTime = GuildAnswerConst.QUESTION_NUM * time
	return totalTime
end

--获取答题结束时间
function GuildAnswerHelper.getGuildAnswerEndTime()
	-- body
	local startTime = GuildAnswerHelper.getGuildAnswerStartTime()
	local totalTime = GuildAnswerHelper.getGuildAnswerTotalTime()
	return startTime + totalTime
end

-- 获取工会答题时间索引
function GuildAnswerHelper.getGuildAnswerStartIndex()
	local guildData = G_UserData:getGuild():getMyGuild()
	if not guildData then
		return 3
	end
	return guildData:getAnswer_time()
end

function GuildAnswerHelper.getRespondTime()
	local config = ParamConfig.get(145)
	assert(config ~= nil, "can not find ParamConfig id = 145")
	return tonumber(config.content)
end

function GuildAnswerHelper.getAwardTime()
	local config = ParamConfig.get(146)
	assert(config ~= nil, "can not find ParamConfig id = 146")
	return tonumber(config.content)
end

function GuildAnswerHelper.getRightPoint()
	local config = ParamConfig.get(148)
	assert(config ~= nil, "can not find ParamConfig id = 148")
	return tonumber(config.content)
end

function GuildAnswerHelper.getWrongPoint()
	local config = ParamConfig.get(149)
	assert(config ~= nil, "can not find ParamConfig id = 149")
	return tonumber(config.content)
end

-- function GuildAnswerHelper.getCanChangeTimeLimitNum()
-- 	local config = ParamConfig.get(144)
-- 	assert(config ~= nil, "can not find ParamConfig id = 144")
-- 	return tonumber(config.content)
-- end

--获取军团答题前几名有拍卖奖励参数
function GuildAnswerHelper.getAuctionAwardRank()
	local config = ParamConfig.get(151)
	assert(config ~= nil, "can not find ParamConfig id = 144")
	return tonumber(config.content)
end
-- 获取修改工会答题时间次数
function GuildAnswerHelper.getGuildAnswerChangeTimeCount()
	local guildData = G_UserData:getGuild():getMyGuild()
	if not guildData then
		assert(false, "guildData == nil")
		return 0
	end
	return guildData:getAnswer_time_reset_cnt()
end

function GuildAnswerHelper.getGuildId()
	local guildData = G_UserData:getGuild():getMyGuild()
	if not guildData then
		assert(false, "guildData == nil")
		return 0
	end
	return guildData:getId()
end

--推算当前 题目索引 是否是在结算时间  开始时间
function GuildAnswerHelper.getCurQuestionIndex(questions)
	local startTime = GuildAnswerHelper.getGuildAnswerStartTime()
	local respondTime = GuildAnswerHelper.getRespondTime()
	local awardTime = GuildAnswerHelper.getAwardTime()
	local curTime = G_ServerTime:getTime()
	local tempTime = startTime
	for k, v in ipairs(questions) do
		if curTime < tempTime + respondTime then
			return v:getQuestionNo(), false
		end
		tempTime = tempTime + respondTime
		if curTime < tempTime + awardTime then
			return v:getQuestionNo(), true
		end
		tempTime = tempTime + awardTime
	end
end

function GuildAnswerHelper.getQuestionBeginTime(question)
	local startTime = GuildAnswerHelper.getGuildAnswerStartTime()
	local respondTime = GuildAnswerHelper.getRespondTime()
	local awardTime = GuildAnswerHelper.getAwardTime()
	return startTime + (question:getQuestionNo() - 1) * (respondTime + awardTime)
end

function GuildAnswerHelper.getPreviewRankRewards(randomAwards)
	local allAwards = {}
	local openServerDayNum = G_UserData:getBase():getOpenServerDayNum()
	--logWarn("1111111111111111  "..openServerDayNum)
	local GuildAnswerAward = require("app.config.answer_rank_award")
	local rewardConfig = nil
	for index = 1, GuildAnswerAward.length(), 1 do
		local config = GuildAnswerAward.indexOf(index)
		if openServerDayNum >= config.day_min and openServerDayNum <= config.day_max then
			rewardConfig = config
			break
		end
	end

	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local rewardList = {}
	if rewardConfig ~= nil then
		local UserDataHelper = require("app.utils.UserDataHelper")
		rewardList = UserDataHelper.makeRewards(rewardConfig, 7)
	--最多配置5个奖励
	end

	for k, v in pairs(randomAwards or {}) do
		table.insert(allAwards, v)
	end

	for k, v in pairs(rewardList) do
		table.insert(allAwards, v)
	end
	return allAwards
end

function GuildAnswerHelper.isTodayShowEndDialog()
	local time = tonumber(G_UserData:getUserConfig():getConfigValue("guildAnswer")) or 0
	local date1 = G_ServerTime:getDateObject(time)
	local date2 = G_ServerTime:getDateObject()
	if date1.day == date2.day then
		return true
	end
	return false
end

function GuildAnswerHelper.setTodayShowDialogTime()
	local curTime = G_ServerTime:getTime()
	G_UserData:getUserConfig():setConfigValue("guildAnswer", curTime)
end

-- 是否今天开启
function GuildAnswerHelper.isTodayOpen()
	local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")
	return not GuildServerAnswerHelper.isTodayOpen()
end

return GuildAnswerHelper
