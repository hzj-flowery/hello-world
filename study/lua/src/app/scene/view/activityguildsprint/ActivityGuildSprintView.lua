
-- Author:
-- Date:2018-04-05 14:45:18
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local ActivityGuildSprintView = class("ActivityGuildSprintView", ViewBase)
local UserDataHelper =  require("app.utils.UserDataHelper")
local ActivityGuildSprintItemCell = import(".ActivityGuildSprintItemCell")

function ActivityGuildSprintView:ctor(mainView,actUnitData)

	--csb bind var name\

	self._actUnitData = actUnitData
	self._listItemSource = nil  --ScrollView
	self._textActDes = nil  --Text
	self._textActTitle = nil  --Text
	self._textNode = nil  --SingleNode
	self._textTimeTitle = nil
	self._textTitleName = nil

	self._buttonRank = nil
	self._textMyRank = nil

	local resource = {
		file = Path.getCSB("ActivityGuildSprintView", "activityguildsprint"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonRank = {
				events = {{event = "touch", method = "_onButtonRank"}}
			}
		},
	}
	ActivityGuildSprintView.super.ctor(self, resource)
end

-- Describle：
function ActivityGuildSprintView:onCreate()
	self:_initListItemSource()

	self:_refreshDes()
	self._buttonRank:setString(Lang.get("activity_guild_sprint_goto_rank"))
end

-- Describle：
function ActivityGuildSprintView:onEnter()
	 G_UserData:getGuildSprint():c2sGetSevenDaysSprintGuild()
	 self:_startRefreshHandler()
	 self._signalActivityGuildSprintInfo = G_SignalManager:add(SignalConst.EVENT_ACTIVITY_GUILD_SPRINT_INFO, 
		handler(self,self._onEventActivityGuildSprintInfo ))
end

-- Describle：
function ActivityGuildSprintView:onExit()
	self._signalActivityGuildSprintInfo:remove()
	self._signalActivityGuildSprintInfo = nil
	self:_endRefreshHandler()
end


function ActivityGuildSprintView:_onEventActivityGuildSprintInfo(event)
	self:refreshView()
end

function ActivityGuildSprintView:_startRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function ActivityGuildSprintView:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function ActivityGuildSprintView:_onRefreshTick( dt )
	self:_refreshActTime()
	self:_refreshMyRank()--活动比赛时间结束需要隐藏自己排名
end

function ActivityGuildSprintView:_refreshActTime()
	local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
	local startTime,endTime,competitionEndTime = self._actUnitData.srcData:getActivityStartEndTime()
	local currTime = G_ServerTime:getTime()
	local timeStr = ""
	if currTime < competitionEndTime then
		timeStr = CustomActivityUIHelper.getLeftDHMSFormat(competitionEndTime)
		self._textTimeTitle:setString(Lang.get("activity_guild_sprint_downtime_title"))
	else
		timeStr = Lang.get("activity_guild_sprint_already_finish")
		self._textTimeTitle:setString(Lang.get("activity_guild_sprint_downtime_title"))
	end
	self._textTime:setString(timeStr)
	local x = self._textTimeTitle:getContentSize().width + self._textTimeTitle:getPositionX() + 11
	self._textTime:setPositionX(x)
end


function ActivityGuildSprintView:_initListItemSource()
	-- body
	self._listItemSource:setTemplate(ActivityGuildSprintItemCell)
	self._listItemSource:setCallback(handler(self, self._onListItemSourceItemUpdate), handler(self, self._onListItemSourceItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onListItemSourceItemTouch))

	-- self._listItemSource:resize()
end

-- Describle：
function ActivityGuildSprintView:_onListItemSourceItemUpdate(item, index)
	local itemData = self._listData[ index + 1 ]
	if itemData then
		item:updateUI(itemData,index + 1 )
	end
end

-- Describle：
function ActivityGuildSprintView:_onListItemSourceItemSelected(item, index)

end

-- Describle：
function ActivityGuildSprintView:_onListItemSourceItemTouch(index, params)

end

function ActivityGuildSprintView:_updateList(listData)
	local lineCount = #listData
	local listView = self._listItemSource
	listView:resize(lineCount)
end

function ActivityGuildSprintView:refreshView()
	local isHasData = G_UserData:getGuildSprint():isHasData()
	if isHasData then
		local rankDataList = G_UserData:getGuildSprint():getShowGuilds()
		self._listData = UserDataHelper.getGuildSprintRankRewardList(rankDataList)
		self:_updateList(self._listData)
	end

	self:_refreshMyRank()
	self:_refreshActTime()
end

function ActivityGuildSprintView:_refreshMyRank()
	--logWarn(" xx oo ----------------- "..tostring(self._actUnitData.id))
	local isActCompetitionTimeEnd = self._actUnitData.srcData:isActivityCompetitionTimeEnd()
	local showRank =  not isActCompetitionTimeEnd
	local myRank = G_UserData:getGuildSprint():getGuild_rank()
	self._textMyRank:setVisible(showRank)
	self._textRankTitle:setVisible(showRank)
	if myRank <= 0 then
		self._textMyRank:setString(Lang.get("activity_guild_sprint_no_crops"))
	else
		self._textMyRank:setString(tostring(myRank))	
	end

	self._textTitleName:setString(showRank and Lang.get("activity_guild_sprint_title_01") 
		or Lang.get("activity_guild_sprint_title_02") )

end

function ActivityGuildSprintView:_refreshDes()
	self._textActDes:setString(self._actUnitData.srcData:getDescription())
end


function ActivityGuildSprintView:_onButtonRank(sender,state)
	local isActCompetitionTimeEnd = self._actUnitData.srcData:isActivityCompetitionTimeEnd() 
	if isActCompetitionTimeEnd then 

		G_SceneManager:showDialog("app.scene.view.activityguildsprint.PopupGuildSprintRank")
	else	
		local ComplexRankConst = require("app.const.ComplexRankConst")
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RANK,ComplexRankConst.USER_GUILD_RANK )    
	
	end
end



return ActivityGuildSprintView