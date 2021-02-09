-- Author: nieming
-- Date:2018-01-19 15:32:27
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local DailyActivityHint = class("DailyActivityHint", ViewBase)
local TimeLimitActivityConfig = require("app.config.time_limit_activity")
local FunctionLevelConfig = require("app.config.function_level")
local RedPointHelper = require("app.data.RedPointHelper")
function DailyActivityHint:ctor()
	--csb bind var name
	self._award1 = nil --CommonIconTemplate
	self._award2 = nil --CommonIconTemplate
	self._award3 = nil --CommonIconTemplate
	self._richTextNode = nil --SingleNode
	self._listView = nil
	self._curSelectPanelData = nil
	self._curSelectCell = 1
	self._datas = {}
	self._cells = {}
	self._functionsAwards = {}
	local resource = {
		file = Path.getCSB("DailyActivityHint", "achievement"),
		binding = {
			_btnGo = {
				events = {{event = "touch", method = "_onBtnGo"}}
			}
		}
	}
	DailyActivityHint.super.ctor(self, resource)
end

-- Describle：
function DailyActivityHint:onCreate()
	self._btnGo:setString(Lang.get("common_btn_goto"))
	self:_parseConfigData()
	self:_initListView()
end

--对Config特殊处理
--由于某些活动的开启时间不确定，要先判断情况，决定读取哪一行，把不需要的行信息去掉
--比如阵营竞技，可能周一、周四开，也可能只是周一开
function DailyActivityHint:_processConfigSpecial()
	local getInvalidId = function()
		local invalidIds = {}
		--阵营竞技
		if require("app.scene.view.campRace.CampRaceHelper").isReplacedBySingleRace() == true then
			invalidIds[5] = true
		else
			invalidIds[10] = true
		end

		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_GUILD_SERVER_ANSWER)
		if isOpen then
			invalidIds[2] = true
		else
			invalidIds[13] = true
        end
		
		--跨服军团战
        local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
        local _, bOpenToday = GuildCrossWarHelper.isTodayOpen()
        local bQualification,_ = GuildCrossWarHelper.isGuildCrossWarEntry()

        if not bOpenToday or not bQualification then
            invalidIds[15] = true
        else
            invalidIds[7] = true
		end
		
		--老华容道6 暗度陈仓16 新华容道17
		local newRunningManCfg = TimeLimitActivityConfig.indexOf(17)
		local openServerDays = G_UserData:getBase():getOpenServerDayNum()
		if openServerDays >= newRunningManCfg.rule then
			--开服时间大于等于5天 排除老华容道
			invalidIds[6] = true
		else
			--排除新华容道
			invalidIds[17] = true
		end

		--暗度陈仓，替换跑马
		local startTime = G_UserData:getRunningMan():getStart_time()
		if startTime == 0 then
			invalidIds[6] = true
			invalidIds[17] = true
		end

		return invalidIds
	end

	local invalidIds = getInvalidId()
	local indexs = TimeLimitActivityConfig.index()
	for id, index in pairs(indexs) do
		if invalidIds[id] == true then
			indexs[id] = nil
		end
	end
	return indexs
end

function DailyActivityHint:_parseConfigData()
	local crossBossShowDay = FunctionLevelConfig.get(FunctionConst.FUNC_CROSS_WORLD_BOSS).day
	local openServerNum = G_UserData:getBase():getOpenServerDayNum()

	local indexs = self:_processConfigSpecial()
	for k, v in pairs(indexs) do
		local config = TimeLimitActivityConfig.indexOf(v)
		local singleData = {}
		singleData.weeks = {}
		local weeks = string.split(config.start_week, "|")
		for k, v in ipairs(weeks) do
			local day = tonumber(v) or 1
			singleData.weeks[day] = true
		end

		local startTimes = string.split(config.start_time, "|")
		local overTimes = string.split(config.finish_time, "|")
		local times = {}
		for k, v in ipairs(startTimes) do
			local singleTime = {}
			singleTime.startTime = tonumber(v) or 0
			singleTime.overTime = tonumber(overTimes[k]) or 0
			table.insert(times, singleTime)
		end
		singleData.times = times
		singleData.start_des = config.start_des
		singleData.description = config.description
		singleData.function_id = config.function_id
		singleData.title = config.name
		singleData.id = k
		singleData.awards = {}
		singleData.icon = config.icon
		local functionLevelConfig = FunctionLevelConfig.get(config.function_id)
		assert(functionLevelConfig ~= nil, "can not find function level config " .. config.function_id)
		singleData.openServerTimeOpen = tonumber(functionLevelConfig.day) or 0
		for i = 1, 4 do
			if config["reward_type" .. i] and config["reward_type" .. i] ~= 0 then
				local award = {}
				award.type = config["reward_type" .. i]
				award.value = config["reward_value" .. i]
				table.insert(singleData.awards, award)
			end
		end

		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		if config.id == 1 and crossBossShowDay <= openServerNum and LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CROSS_WORLD_BOSS) then
		else
			local showDay = config.rule
			if showDay > 0 then --加了一个配置限制
				if openServerNum >= showDay then -- 开服达到这个值，才显示
					table.insert(self._datas, singleData)
				end
			else
				table.insert(self._datas, singleData)
			end
		end
	end
end

function DailyActivityHint:_fixTime()
	for k, v in pairs(self._datas) do
		if v.function_id == FunctionConst.FUNC_COUNTRY_BOSS then
			local startTime, endTime =
				G_UserData:getLimitTimeActivity():getStartAndEndTimeByFunctionId(FunctionConst.FUNC_COUNTRY_BOSS)
			local todayZeroTime = G_ServerTime:secondsFromZero()
			startTime = math.ceil(startTime - todayZeroTime)
			endTime = math.ceil(endTime - todayZeroTime)
			if startTime and startTime > 0 and endTime and endTime > 0 then
				v.times = {{startTime = startTime, overTime = endTime}}
			end
		end
	end
end

function DailyActivityHint:_getActivityAward(cellData)
	local functionId = cellData.function_id
	if functionId == FunctionConst.FUNC_WORLD_BOSS then
		if not self._functionsAwards[functionId] then
			local WorldBossHelper = require("app.scene.view.worldBoss.WorldBossHelper")
			self._functionsAwards[functionId] = WorldBossHelper.getPreviewRewards() or {}
		end
		return self._functionsAwards[functionId]
	elseif functionId == FunctionConst.FUNC_GUILD_ANSWER then
		if not self._functionsAwards[functionId] then
			local GuildAnswerHelper = require("app.scene.view.guildAnswer.GuildAnswerHelper")
			local awards = GuildAnswerHelper.getPreviewRankRewards(G_UserData:getGuildAnswer():getRandomAward())
			self._functionsAwards[functionId] = awards
		end

		return self._functionsAwards[functionId]
	elseif functionId == FunctionConst.FUNC_GUILD_DUNGEON then
		if not self._functionsAwards[functionId] then
			local UserDataHelper = require("app.utils.UserDataHelper")
			local awards = UserDataHelper.getGuildDungeonPreviewRewards()
			self._functionsAwards[functionId] = awards
		end

		return self._functionsAwards[functionId]
	elseif functionId == FunctionConst.FUNC_COUNTRY_BOSS then
		if not self._functionsAwards[functionId] then
			local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
			local awards = CountryBossHelper.getPreviewRankRewards()
			self._functionsAwards[functionId] = awards
		end
		return self._functionsAwards[functionId]
	elseif functionId == FunctionConst.FUNC_CAMP_RACE then
		if not self._functionsAwards[functionId] then
			local CampRaceHelper = require("app.scene.view.campRace.CampRaceHelper")
			local awards = CampRaceHelper.getPreviewRankRewards()
			self._functionsAwards[functionId] = awards
		end
		return self._functionsAwards[functionId]
	elseif functionId == FunctionConst.FUNC_GUILD_WAR then
		if not self._functionsAwards[functionId] then
			local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
			local awards = GuildWarDataHelper.getGuildWarPreviewRewards()
			self._functionsAwards[functionId] = awards
		end

		return self._functionsAwards[functionId]
	elseif functionId == FunctionConst.FUNC_SINGLE_RACE then
		if not self._functionsAwards[functionId] then
			local SingleRaceDataHelper = require("app.utils.data.SingleRaceDataHelper")
			local awards = SingleRaceDataHelper.getPreviewRankRewards()
			self._functionsAwards[functionId] = awards
		end
		return self._functionsAwards[functionId]
	elseif functionId == FunctionConst.FUNC_GUILD_SERVER_ANSWER then
		if not self._functionsAwards[functionId] then
			local GuildAnswerHelper = require("app.scene.view.guildAnswer.GuildAnswerHelper")
			local awards = GuildAnswerHelper.getPreviewRankRewards(G_UserData:getGuildServerAnswer():getRandomAward())
			self._functionsAwards[functionId] = awards
		end

        return self._functionsAwards[functionId]
        
    elseif functionId == FunctionConst.FUNC_GUILD_CROSS_WAR then
        if not self._functionsAwards[functionId] then
            local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")
            local awards = GuildCrossWarHelper.getLimitAwards()
            self._functionsAwards[functionId] = awards
        end
		return self._functionsAwards[functionId]
	elseif functionId == FunctionConst.FUNC_CROSS_WORLD_BOSS then
        if not self._functionsAwards[functionId] then
			local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")
			local bossInfo = CrossWorldBossHelper.getBossInfo()
			local awards = {}

			if bossInfo then
				awards = CrossWorldBossHelper.getPreviewRewards()
			else
				awards = CrossWorldBossHelper.getAllBossPreviewRewards()
			end

            self._functionsAwards[functionId] = awards
        end
        return self._functionsAwards[functionId]
	else
		return cellData.awards
	end
end

--刷新数据
function DailyActivityHint:refreshDataAndRegisterClock()
	self:_fixTime()

	local date = G_ServerTime:getDateObject()
	--量表填写 星期一 是 1
	--date 星期天 是1
	local day = date.wday - 1
	if day == 0 then
		day = 7
	end
	local tomorrowDay = date.wday
	local curTodayTime = date.hour * 3600 + date.min * 60 + date.sec

	local openServerNum = G_UserData:getBase():getOpenServerDayNum()
	--当天开放
	local todayZeroTime = G_ServerTime:getTime() - date.hour * 3600 - date.min * 60 - date.sec
	for k, v in ipairs(self._datas) do
		local isTodayOpen = v.weeks[day]
		local isTomorrowOpen = v.weeks[tomorrowDay]
		v.isTodayOpen = isTodayOpen and v.openServerTimeOpen <= openServerNum
		v.isTomorrowOpen = isTomorrowOpen and v.openServerTimeOpen <= openServerNum + 1

		v.startTime = 0
		v.overTime = 0
		v.isTodayEnd = false
		if isTodayOpen then
			local clockTime = 0
			local curTimeIndex = nil
			local isOpenIng = false
			for i, j in ipairs(v.times) do
				if curTodayTime <= j.overTime then
					--未开始
					curTimeIndex = i
					if curTodayTime < j.startTime then
						clockTime = todayZeroTime + j.startTime
					else
						isOpenIng = true
						--开始
						clockTime = todayZeroTime + (j.overTime + 1)
					end
					break
				end
			end
			-- 注册刷新界面回调
			if clockTime ~= 0 then
				G_ServiceManager:registerOneAlarmClock(
					"DailyActivityHint_" .. k,
					clockTime,
					function()
						if self._datas then
							self:_refreshView()
						end
					end
				)
			end
			if curTimeIndex then
				v.startTime = v.times[curTimeIndex].startTime
				v.overTime = v.times[curTimeIndex].overTime
				v.isOpenIng = isOpenIng
				v.isTodayEnd = false
			else
				v.isOpenIng = isOpenIng
				v.isTodayEnd = true
			end
		else
			-- end
			-- if isTomorrowOpen then
			v.startTime = v.times[1].startTime
			v.overTime = v.times[1].overTime
		end
	end

	--排序
	table.sort(
		self._datas,
		function(a, b)
			if a.isTodayOpen == b.isTodayOpen then
				--今天开启
				if a.isTodayOpen then
					--2个都开启
					if a.isTodayEnd == b.isTodayEnd then
						if a.startTime == b.startTime then
							return a.id < b.id
						else
							return a.startTime < b.startTime
						end
					else
						return a.isTodayEnd ~= true
					end
				else
					--明天开启
					if a.isTomorrowOpen == b.isTomorrowOpen then
						if a.startTime == b.startTime then
							return a.id < b.id
						else
							return a.startTime < b.startTime
						end
					else
						return a.isTomorrowOpen == true
					end
				end
			else
				return a.isTodayOpen == true
			end
		end
	)
end

function DailyActivityHint:clearRegisterClock()
	for k, _ in ipairs(self._datas) do
		G_ServiceManager:DeleteOneAlarmClock("DailyActivityHint_" .. k)
	end
end

function DailyActivityHint:refreshCells()
	--由于发生排序 需要确定
	self._curSelectCell = nil
	if self._curSelectPanelData then
		for k, v in ipairs(self._datas) do
			if v.id == self._curSelectPanelData.id then
				self._curSelectCell = k
				break
			end
		end
	end

	if self._curSelectCell then
		self._listView = self._listView:setBounceEnabled(false)
		self._listView = self._listView:jumpToItem(self._curSelectCell - 1, cc.p(0, 0), cc.p(0, 0))
		self._listView = self._listView:setBounceEnabled(true)
	else
		self._curSelectPanelData = self._datas[1]
		self._curSelectCell = 1
	end

	self._isInAction = nil
	for k, v in ipairs(self._datas) do
		local cell = self._cells[k]
		cell:stopAllActions()
		cell:updateUI(v, self._curSelectCell)
	end

	-- Update Redpoint
	if self._curSelectPanelData then
		self:_showBtnGoRedPoint(self._curSelectPanelData.function_id)
	end
end

function DailyActivityHint:_initListView()
	local HintCell = require("app.scene.view.achievement.DailyActivityHintCell")
	for k, v in ipairs(self._datas) do
		local cell = HintCell.new(k, handler(self, self._onSelcetPanel))
		self._listView:pushBackCustomItem(cell)
		table.insert(self._cells, cell)
	end

	-- Init Redpoint
	if self._datas[1] then
		self:_showBtnGoRedPoint(self._datas[1].function_id)
	end
end

function DailyActivityHint:_onSelcetPanel(index)
	if self._isInAction then
		return
	end
	if index == self._curSelectCell then
		return
	end
	self._curSelectPanelData = self._datas[index]
	self._isInAction = true
	local oldCell = self._cells[self._curSelectCell]
	if oldCell then
		-- oldCell:setHighlight(false)
		oldCell:playActionOut(0.15, false)
	end
	self._curSelectCell = index
	local newCell = self._cells[self._curSelectCell]
	if newCell then
		-- newCell:setHighlight(true)
		newCell:playActionIn(
			0.15,
			function()
				self._isInAction = nil
			end
		)
	end
	self:refreshPanel()

	-- show redpoint
	if self._curSelectPanelData then
		self:_showBtnGoRedPoint(self._curSelectPanelData.function_id)
	end
end

function DailyActivityHint:_updateAwards(rewards)
	self._rankRewardListViewItem:updateUI(rewards, 1)
	self._rankRewardListViewItem:setMaxItemSize(5)
	self._rankRewardListViewItem:setListViewSize(580, 100)
	self._rankRewardListViewItem:setItemsMargin(2)
end

function DailyActivityHint:refreshPanel()
	local cellData = self._datas[self._curSelectCell]
	if not cellData then
		return
	end
	self._richTextNode:removeAllChildren()
	local richtext = ccui.RichText:createRichTextByFormatString2(cellData.description, Colors.DARK_BG_ONE, 20)
	richtext:ignoreContentAdaptWithSize(false)
	richtext:setVerticalSpace(4)
	richtext:setAnchorPoint(cc.p(0, 1))
	richtext:setContentSize(cc.size(630, 0))
	--高度0则高度自适应
	richtext:formatText()
	self._richTextNode:addChild(richtext)

	local awards = self:_getActivityAward(cellData)
	self:_updateAwards(awards)
	--
	-- if cellData.isTodayOpen and not cellData.isTodayEnd and cellData.isOpenIng then
	-- 	self._btnGo:setString(Lang.get("common_btn_goto"))
	-- else
	-- 	self._btnGo:setString(Lang.get("common_btn_go_look"))
	-- end
end

function DailyActivityHint:_onBtnGo()
	local cellData = self._datas[self._curSelectCell]
	if not cellData then
		return
	end

	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(cellData.function_id, "DailyActivityHint")
end

-- Describle：
function DailyActivityHint:onEnter()
	self._signalSyncBoss =
		G_SignalManager:add(SignalConst.EVENT_SYNC_COUNTRY_BOSS_SUCCESS, handler(self, self._refreshView))
	self._signalEnter = G_SignalManager:add(SignalConst.EVENT_ENTER_COUNTRY_BOSS_SUCCESS, handler(self, self._refreshView))
	self:_refreshView()
end

-- Describle：
function DailyActivityHint:onExit()
	self:clearRegisterClock()
	self._signalSyncBoss:remove()
	self._signalSyncBoss = nil
	self._signalEnter:remove()
	self._signalEnter = nil
end

function DailyActivityHint:onReEnterModule()
	self:_refreshView()
end

function DailyActivityHint:_refreshView()
	self:refreshDataAndRegisterClock()
	self:refreshCells()
	self:refreshPanel()
end

function DailyActivityHint:_showBtnGoRedPoint(funcId)
	local redImg = self._btnGo:getChildByName("RedPoint")
	if not redImg then
		local UIHelper = require("yoka.utils.UIHelper")
		redImg = UIHelper.createImage({texture = Path.getUICommon("img_redpoint")})
		redImg:setName("RedPoint")
		redImg:setPosition(10, 10)
		self._btnGo:addChild(redImg)
	end

	--Enum Func just for FUNC_CAMP_RACE
	if funcId == FunctionConst.FUNC_CAMP_RACE then
		local showCmpRaceRedPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE)
		redImg:setVisible(showCmpRaceRedPoint)
	else
		redImg:setVisible(false)
	end
end

return DailyActivityHint
