-- Author: nieming
-- Date:2018-03-22 16:20:08
-- Describle：

local BaseData = require("app.data.BaseData")
local LimitTimeActivityData = class("LimitTimeActivityData", BaseData)

local schema = {}
--schema
LimitTimeActivityData.schema = schema

function LimitTimeActivityData:ctor(properties)
	LimitTimeActivityData.super.ctor(self, properties)
end

function LimitTimeActivityData:_initMainMenuLayerActivityIcons()
	-- body
	--添加偏差 避免出现 icon闪动
	local offset = 3
	local GuildAnswerHelper = require("app.scene.view.guildAnswer.GuildAnswerHelper")
	local GuildDungeonDataHelper = require("app.utils.data.GuildDungeonDataHelper")
	local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
	local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")
	local SingleRaceDataHelper = require("app.utils.data.SingleRaceDataHelper")
	local TimeConst = require("app.const.TimeConst")
	local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
	local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
	local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")
	local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")

	self._mainMenuActivityTimes = {
		{
			funcId = FunctionConst.FUNC_WORLD_BOSS,
			getStartTime = function()
				return G_UserData:getWorldBoss():getStart_time()
			end,
			getEndTime = function()
				return G_UserData:getWorldBoss():getEnd_time()
			end,
			showEffectTime = 300, --倒计时5分钟和进行中 显示特效
			weight = 1,
			isTodayOpen = function()
				return true
			end,
			isGuildAct = true
		},
		{
			funcId = FunctionConst.FUNC_GUILD_ANSWER,
			getStartTime = function()
				--body
				return GuildAnswerHelper.getGuildAnswerStartTime()
			end,
			getEndTime = function()
				--body
				return GuildAnswerHelper.getGuildAnswerEndTime()
			end,
			showEffectTime = 300, --倒计时5分钟和进行中 显示特效
			weight = 1,
			isTodayOpen = function()
				return GuildAnswerHelper.isTodayOpen()
			end,
			isGuildAct = true
		},
		{
			funcId = FunctionConst.FUNC_GUILD_SERVER_ANSWER,
			getStartTime = function()
		-- 		-- body
				return GuildServerAnswerHelper.getServerAnswerStartTime()
			end,
			getEndTime = function()
		-- 		-- body
				return GuildServerAnswerHelper.getServerAnswerEndTime()
			end,
			showEffectTime = 300, --倒计时5分钟和进行中 显示特效
			weight = 1,
			isTodayOpen = function()
				return GuildServerAnswerHelper.isTodayOpen()
			end,
			isGuildAct = true
		},
		{
			funcId = FunctionConst.FUNC_GUILD_DUNGEON,
			getStartTime = function()
				local startTime = GuildDungeonDataHelper.getGuildDungeonStartTimeAndEndTime()
		-- 		-- assert(false, startTime)
				return startTime
			end,
			getEndTime = function()
		-- 		-- body
				local _, endTime = GuildDungeonDataHelper.getGuildDungeonStartTimeAndEndTime()
				return endTime
			end,
			showEffectTime = 300,
			weight = 1,
			isTodayOpen = function()
				return true
			end,
			isGuildAct = true
		},
		{
			funcId = FunctionConst.FUNC_COUNTRY_BOSS,
			getStartTime = function()
				local startTime = CountryBossHelper.getStartTime()
				return startTime
			end,
			getEndTime = function()
		-- 		-- body
				local endTime = CountryBossHelper.getEndTime()
				return endTime
			end,
			showEffectTime = 300,
			weight = 1,
			isTodayOpen = function()
				local open = CountryBossHelper.isTodayOpen(TimeConst.RESET_TIME_SECOND)
				return open
			end,
			isGuildAct = true
		},
		{
			funcId = FunctionConst.FUNC_CAMP_RACE,
			getStartTime = function()
				local startTime = CampRaceHelper.getStartTime()
				return startTime
			end,
			getEndTime = function()
		-- 		-- body
				local endTime = CampRaceHelper.getEndTime()
				return endTime
			end,
			showEffectTime = 300,
			weight = 1,
			isTodayOpen = function()
				local open = CampRaceHelper.isTodayOpen(TimeConst.RESET_TIME_SECOND)
				return open
			end,
			isGuildAct = false
		},
		--跑男数据
		{
			funcId = FunctionConst.FUNC_RUNNING_MAN,
			getStartTime = function()
				local startTime = G_UserData:getRunningMan():getStart_time()
				return startTime
			end,
			getEndTime = function()
				local endTime = G_UserData:getRunningMan():getEnd_time() + 5 --跑马多显示5秒
				return endTime
			end,
			showEffectTime = 300,
			weight = 1,
			isTodayOpen = function()
				return true
			end,
			isGuildAct = false
		},
		{
			funcId = FunctionConst.FUNC_GUILD_WAR,
			getStartTime = function()
				local open = GuildWarDataHelper.isTodayOpen()
				if not open then
					return 0
				end
				local timeData = GuildWarDataHelper.getGuildWarTimeRegion()
				return timeData.startTime
			end,
			getEndTime = function()
		-- 		-- body
				local open = GuildWarDataHelper.isTodayOpen()
				if not open then
					return 0
				end
				local timeData = GuildWarDataHelper.getGuildWarTimeRegion()
				return timeData.endTime
			end,
			showEffectTime = 300,
			weight = 1,
			isTodayOpen = function()
				local open = GuildWarDataHelper.isTodayOpen()
				return open
			end,
			isGuildAct = false
		},
		{
			funcId = FunctionConst.FUNC_CROSS_WORLD_BOSS,
			getStartTime = function()
				return G_UserData:getCrossWorldBoss():getStart_time()
			end,
			getEndTime = function()
				return G_UserData:getCrossWorldBoss():getEnd_time()
			end,
			showEffectTime = 300, --倒计时5分钟和进行中 显示特效
			weight = 1,
			isTodayOpen = function()
				return true
			end,
			isGuildAct = true
		},
	}
end

function LimitTimeActivityData:getStartAndEndTimeByFunctionId(funcId)
	if not self._mainMenuActivityTimes then
		self:_initMainMenuLayerActivityIcons()
	end
	for k, v in pairs(self._mainMenuActivityTimes) do
		if v.funcId == funcId then
			return v.getStartTime(), v.getEndTime()
		end
	end
end
-- 获取当前主界面正在进行的活动
-- 返回活动id
function LimitTimeActivityData:getCurMainMenuLayerActivityIcon()
	if not self._mainMenuActivityTimes then
		self:_initMainMenuLayerActivityIcons()
	end

	local curTime = G_ServerTime:getTime()
	-- local minStartTime = 0
	-- local minEndTime = 0
	-- local funcId = 0
	-- local showEffectTime
	--找到最早开的活动

	local datas = {}

	--判断是否下次开启隔天了 隔天了不显示
	local nextCleanTime = G_ServerTime:getNextCleanDataTime()
	for k, v in pairs(self._mainMenuActivityTimes) do
		local startTime = v.getStartTime()
		local endTime = v.getEndTime()
		--startTime <= 0  表示不开放  就不放进入列表中
		if startTime > 0 and startTime < nextCleanTime then
			table.insert(
				datas,
				{startTime = startTime, endTime = endTime, funcId = v.funcId, showEffectTime = v.showEffectTime, weight = v.weight}
			)
		end
	end

	table.sort(
		datas,
		function(a, b)
			if a.weight == b.weight then
				return a.startTime < b.startTime
			else
				return a.weight < b.weight
			end
		end
	)

	local curInfo = {}
	for _, v in ipairs(datas) do
		if curTime < v.endTime then
			if v.funcId == FunctionConst.FUNC_GUILD_WAR then
                local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
                local bQualification,_ = GuildCrossWarHelper.isGuildCrossWarEntry()
                local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
				if not bOpenToday or not bQualification then
					curInfo = v
					break
				end
			else
				curInfo = v
				break
			end
		end
	end

	local minStartTime = curInfo.startTime or 0
	local minEndTime = curInfo.endTime or 0
	local funcId = curInfo.funcId or 0
	local showEffectTime = curInfo.showEffectTime

	local isNeedShowEffect = false
	--注册一个活动结束 刷新主界面图标的事件
	if funcId ~= 0 then
		G_ServiceManager:registerOneAlarmClock(
			"LIMIT_TIME_ACTIVITY_DATA_MAINMENULAYER_ICON_END",
			minEndTime,
			function()
				G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, funcId)
				G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_AUCTION)
			end
		)
		--在倒计时前显示特效
		if showEffectTime ~= nil then
			local showEffectStartTime = minStartTime - showEffectTime
			assert(showEffectStartTime > 0, "showEffectStartTime <= 0 ")
			if curTime < showEffectStartTime then
				isNeedShowEffect = false
				--替换之前 通知变化时间
				G_ServiceManager:registerOneAlarmClock(
					"LIMIT_TIME_ACTIVITY_DATA_MAINMENULAYER_ICON",
					showEffectStartTime,
					function()
						G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, funcId)
					end
				)
			else
				isNeedShowEffect = true
			end
		end
	end

	return funcId, minStartTime, minEndTime, isNeedShowEffect
end

function LimitTimeActivityData:getCurGuildActivityIcon()
	if not self._mainMenuActivityTimes then
		self:_initMainMenuLayerActivityIcons()
	end
	local curTime = G_ServerTime:getTime()
	local datas = {}

	--判断是否下次开启隔天了 隔天了不显示
	local nextCleanTime = G_ServerTime:getNextCleanDataTime()
	for k, v in pairs(self._mainMenuActivityTimes) do
		local startTime = v.getStartTime()
		local endTime = v.getEndTime()
		--startTime <= 0  表示不开放  就不放进入列表中
		if startTime > 0 and startTime < nextCleanTime and v.isGuildAct == true then
			table.insert(
				datas,
				{startTime = startTime, endTime = endTime, funcId = v.funcId, showEffectTime = v.showEffectTime, weight = v.weight}
			)
		end
	end

	table.sort(
		datas,
		function(a, b)
			if a.weight == b.weight then
				return a.startTime < b.startTime
			else
				return a.weight < b.weight
			end
		end
	)
	local curInfo = {}
	for _, v in ipairs(datas) do
		if curTime < v.endTime then
			curInfo = v
			break
		end
	end

	local minStartTime = curInfo.startTime or 0
	local minEndTime = curInfo.endTime or 0
	local funcId = curInfo.funcId or 0
	local showEffectTime = curInfo.showEffectTime

	local isNeedShowEffect = false
	return funcId, minStartTime, minEndTime, isNeedShowEffect
end

function LimitTimeActivityData:clear()
	self._mainMenuActivityTimes = nil
end

function LimitTimeActivityData:reset()
	self._mainMenuActivityTimes = nil
end

function LimitTimeActivityData:hasActivityNum()
	if not self._mainMenuActivityTimes then
		self:_initMainMenuLayerActivityIcons()
	end
	local count = 0
	for k, v in pairs(self._mainMenuActivityTimes) do
		if v.isTodayOpen() and v.isGuildAct then
			if v.funcId == FunctionConst.FUNC_WORLD_BOSS then
				count = count + 2
			else
				count = count + 1
			end
		end
	end
	return count
end

function LimitTimeActivityData:isActivityOpen(funcId)
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	if not self._mainMenuActivityTimes then
		self:_initMainMenuLayerActivityIcons()
	end
	local curTime = G_ServerTime:getTime()
	for k, v in pairs(self._mainMenuActivityTimes) do
		if v.funcId == funcId then
			local startTime = v.getStartTime()
			local endTime = v.getEndTime()
			local isOpen = v.isTodayOpen()
			local functionOpen = FunctionCheck.funcIsOpened(funcId)

			return isOpen and curTime >= startTime and curTime < endTime and startTime > 0 and functionOpen
		end
	end
	return false
end

return LimitTimeActivityData
