--
-- Author: neo
-- Date: 2017-06-13 13:32:07
--
local ViewBase = require("app.ui.ViewBase")
local AchievementView = class("AchievementView", ViewBase)
local AchievementItemCell = require("app.scene.view.achievement.AchievementItemCell")
local DailyMissionItemCell = require("app.scene.view.achievement.DailyMissionItemCell")
local DailyMissionActiviyValue = require("app.scene.view.achievement.DailyMissionActiviyValue")
local TabScrollView = require("app.utils.TabScrollView")


-- AchievementView.FIRST_MEET_OPEN_DAYS = 40 --开服后40天显示初见标签页 现在读配置了

--[[
function AchievementView:waitEnterMsg(callBack)
	local function onMsgCallBack(id,message)
		if type(message) ~= "table" then return end
		callBack()
	end

	local msgReg = G_SignalManager:add(SignalConst.EVENT_DAILY_TASK_INFO, onMsgCallBack)
	G_UserData:getDailyMission():c2sGetDailyTaskInfo()
	return msgReg
    --return G_SignalManager:add(SignalConst.EVENT_GET_ACHIEVEMENT_INFO, onMsgCallBack)
end
]]

function AchievementView:ctor(selectTab)
	self._listViewList = {}

	self._selectTabIndex = 0
	self._initTabIndex = selectTab or 1

	local resource = {
		file = Path.getCSB("AchievementView", "achievement"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {

		},
	}
	AchievementView.super.ctor(self, resource)
end



function AchievementView:onCreate()
	local scrollViewParam = {
		template = AchievementItemCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView,scrollViewParam)

	local listView = self._listViewDaily
	listView:setTemplate(DailyMissionItemCell)
	listView:setCallback(handler(self, self._onDailyItemUpdate), handler(self, self._onDailyItemSelected))
	listView:setCustomCallback(handler(self, self._onDailyItemTouch))

	self._topbarBase:setImageTitle("txt_sys_com_renwu")

	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self._fullScreenTitles = {
		Lang.get("achievement_tab_title1"),
		Lang.get("achievement_tab_title2"),
		Lang.get("achievement_tab_title3"),
		Lang.get("achievement_tab_title4"),
	}

	--开服80后显示初见标签
	local openServerDays = G_UserData:getBase():getOpenServerDayNum()
	local firstMeetOpenDays = tonumber(require("app.config.parameter").get(871).content)
	if openServerDays >= firstMeetOpenDays then
		table.insert(self._fullScreenTitles, Lang.get("achievement_tab_title5"))
	end

	local param = {
		containerStyle = 1,
		callback = handler(self, self._onTabSelect),
		textList = self._fullScreenTitles
	}

	self._dailyMissionActiviyValue = DailyMissionActiviyValue.new()
	self._nodeDailyValue:addChild(self._dailyMissionActiviyValue)

	self._nodeTabRoot:recreateTabs(param)

end

function AchievementView:onEnter()


	self._getAchievementInfo = G_SignalManager:add(SignalConst.EVENT_GET_ACHIEVEMENT_INFO, handler(self,self._onEventGetAchievementInfo))

	self._getAchievementReward = G_SignalManager:add(SignalConst.EVENT_GET_ACHIEVEMENT_AWARD, handler(self,self._onEventGetAchievementReward))
	self._updateAchievementInfo = G_SignalManager:add(SignalConst.EVENT_GET_ACHIEVEMENT_UPDATE, handler(self,self._onEventUpdateAchievementInfo))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._onEventRedPointUpdate))

	self._getDailyReward  = G_SignalManager:add(SignalConst.EVENT_DAILY_TASK_AWARD, handler(self, self._onEventGetDailyTaskReward))
	self._updateDailyInfo = G_SignalManager:add(SignalConst.EVENT_DAILY_TASK_INFO, handler(self, self._onEventUpdateDailyInfoFunc))
	self._updateDailyMission = G_SignalManager:add(
									SignalConst.EVENT_DAILY_TASK_UPDATE,
									handler(self, self._onEventDailyTaskUpdate))

	self:_onEventRedPointUpdate()

	if self._selectTabIndex > 0 then
		self._nodeTabRoot:setTabIndex(self._selectTabIndex)
		self:_updateListView(self._selectTabIndex)
	else
		self._nodeTabRoot:setTabIndex(self._initTabIndex)
	end
end




function AchievementView:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end

	self._commonFullScreen:setTitle(self._fullScreenTitles[index])
	self._selectTabIndex = index
	self:_updateListView(self._selectTabIndex)
end

function AchievementView:_onEventRedPointUpdate()
	local RedPointHelper = require("app.data.RedPointHelper")
	local dailyPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_DAILY_MISSION,"dailyRP")
	dump(dailyPoint)
	self._nodeTabRoot:setRedPointByTabIndex(1,dailyPoint)

	local limitTimePoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAMP_RACE) --直接取阵营竞技的红点规则
	self._nodeTabRoot:setRedPointByTabIndex(2,limitTimePoint)
	local targetPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ACHIEVEMENT,"targetRP")
	self._nodeTabRoot:setRedPointByTabIndex(3,targetPoint)
	local gamePoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ACHIEVEMENT,"gameRP")
	self._nodeTabRoot:setRedPointByTabIndex(4,gamePoint)
	local firstMeetPoint = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ACHIEVEMENT,"firstMeetRP")
	self._nodeTabRoot:setRedPointByTabIndex(5,firstMeetPoint)
end

function AchievementView:onExit()
	self._getAchievementInfo:remove()
	self._getAchievementInfo = nil
	self._getAchievementReward:remove()
	self._getAchievementReward = nil
	self._updateAchievementInfo:remove()
	self._updateAchievementInfo = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	self._getDailyReward:remove()
	self._getDailyReward = nil
	self._updateDailyInfo:remove()
	self._updateDailyInfo = nil
	self._updateDailyMission:remove()
	self._updateDailyMission = nil
end

function AchievementView:_updateListView(tabIndex)

	tabIndex = tabIndex or 1
	self._nodeDaily:setVisible(false)
	self._nodeAchievement:setVisible(false)
	self._nodeActivityHint:setVisible(false)
	if tabIndex == 1 then
		if G_UserData:getDailyMission():isExpired() == true then
			G_UserData:getDailyMission():c2sGetDailyTaskInfo()
		end
		self._nodeDaily:setVisible(true)
		self._dataList = G_UserData:getDailyMission():getDailyMissionDatas(false)
		self._dailyMissionActiviyValue:updateUI()
		self._tabListView:stopAllScroll()
		self._listViewDaily:resize(#self._dataList)
	elseif tabIndex == 2 then
		self._nodeActivityHint:setVisible(true)
		if not self._dailyActivityHintView then
			local DailyActivityHint = require("app.scene.view.achievement.DailyActivityHint")
			self._dailyActivityHintView = DailyActivityHint.new()
			self._nodeActivityHint:addChild(self._dailyActivityHintView)
		end
		self._dailyActivityHintView:onReEnterModule()
	else
		--成就/趣味
		if G_UserData:getAchievement():isExpired() == true then
			G_UserData:getAchievement():c2sGetAchievementInfo()
		end

		self._listViewDaily:stopAutoScroll()
		self._nodeAchievement:setVisible(true)
		self._dataList = G_UserData:getAchievement():getAchievementListData(tabIndex-2) or {}
		self._tabListView:updateListView(tabIndex,#self._dataList)
	end

end

function AchievementView:_onDailyItemUpdate(item, index)
	local data = self._dataList[index+1]
	if data then
		item:updateUI(index,data)
	end
end

function AchievementView:_onDailyItemSelected(item, index)

end

function AchievementView:_onDailyItemTouch(index, missonId)
	G_UserData:getDailyMission():c2sGetDailyTaskAward(missonId)
end

function AchievementView:_onItemUpdate(item, index)
	local data = self._dataList[index+1]
	if data then
		item:updateUI(index,data)
	end
end

function AchievementView:_onItemSelected(item, index)

end

function AchievementView:_onItemTouch(index, achId)
	--self._listView:setLocation(10)

	G_UserData:getAchievement():c2sGetAchievementReward(achId)
end

function AchievementView:_onEventGetAchievementReward(eventId, message)
	if message.ret ~= 1 then
		return
	end

	local awards = rawget(message, "awards") or {}
	G_Prompt:showAwards(awards)
end


function AchievementView:_onEventUpdateAchievementInfo(eventId, message)
	self:_updateListView(self._selectTabIndex)
end

function AchievementView:_onEventGetAchievementInfo(eventId, message)
	self:_updateListView(self._selectTabIndex)
end


function AchievementView:_onEventUpdateDailyInfoFunc()
	self:_updateListView(self._selectTabIndex)
end

function AchievementView:_onEventDailyTaskUpdate()
	self:_updateListView(self._selectTabIndex)
end

function AchievementView:_onEventGetDailyTaskReward(id, message)
	local awards = rawget(message, "awards") or {}
	G_Prompt:showAwards(awards)
	self:_updateListView(self._selectTabIndex)


	--升级检查
	local UserCheck = require("app.utils.logic.UserCheck")
	UserCheck.isLevelUp()

	--领取最后一个宝箱，弹出去评论对话框
	local id = rawget(message, "id") or 0
	local activityItemList = self._dailyMissionActiviyValue:getActivityItemList()--G_UserData:getDailyMission():getDailyMissionDatas(true)
	local lastActivity = activityItemList[#activityItemList]
	--[[
	if lastActivity then
		dump(lastActivity)
	end
	]]


	if lastActivity and lastActivity.id == id then
		local UIPopupHelper = require("app.utils.UIPopupHelper")
		UIPopupHelper.popupCommentGuide()
	end

end


return AchievementView
