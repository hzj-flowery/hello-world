--
-- Author: hyl
-- Date: 2019-7-4
-- 老玩家回归
local ViewBase = require("app.ui.ViewBase")
local ReturnView = class("ReturnView", ViewBase)
local ReturnCommonActivity = require("app.scene.view.return.ReturnCommonActivity")
local ReturnLevelActivity = require("app.scene.view.return.ReturnLevelActivity")
local ReturnConst = require("app.const.ReturnConst")
local SchedulerHelper = require("app.utils.SchedulerHelper")

function ReturnView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end

	G_UserData:getReturnData():c2sGetReturnInfo()

	local signal = G_SignalManager:add(SignalConst.EVENT_RETURN_ACTIVITY_INFO, onMsgCallBack)
	
	return signal
end

function ReturnView:ctor(type)
	self._selectTabIndex = type or ReturnConst.LEVEL_UP_TYPE
	self._activityView = {}
	self._endTime = 0

	local resource = {
		file = Path.getCSB("ReturnView", "return"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	ReturnView.super.ctor(self, resource)
end

function ReturnView:onCreate()
	self:_initTab()

	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)

	self._fileNodeBg:setTitle(Lang.get("return_title"))
end


function ReturnView:onEnter()
	self._signalGetReward = G_SignalManager:add(SignalConst.EVENT_RETURN_SHOW_REWARD, handler(self, self._onGetReward))
	self._endTime = G_UserData:getReturnData():getEndTime()
	self:_startCountDown()
	self:_showActivityView(self._selectTabIndex)
	self._nodeTabRoot:setTabIndex(self._selectTabIndex)
end

function ReturnView:onExit()
	self._signalGetReward:remove()
	self._signalGetReward = nil

	self:_stopCountDown()
end

function ReturnView:_initTab()
	local tabNameList = {
							Lang.get("return_activity1"),
							Lang.get("return_activity2"),
							Lang.get("return_activity3"),
							Lang.get("return_activity4"),
							Lang.get("return_activity5"),
						}

	local param = {
		isVertical = 1,
		callback = handler(self, self._onTabSelect),
		textList = tabNameList
	}

	self._nodeTabRoot:recreateTabs(param)

	self:_refreshRedPoint()
end

function ReturnView:_refreshRedPoint()
	local canGetDailyReward = G_UserData:getReturnData():canGetDailyActivityReward()
    local canGetDiscountReward = G_UserData:getReturnData():canGetDiscountReward()
	local canGetGiftReward = G_UserData:getReturnData():canGetGiftReward()
	
	self._nodeTabRoot:setRedPointByTabIndex(ReturnConst.DAILY_ACTIVITY_TYPE, canGetDailyReward)
	self._nodeTabRoot:setRedPointByTabIndex(ReturnConst.DISCOUNT_ACTIVITY_TYPE, canGetDiscountReward)
	self._nodeTabRoot:setRedPointByTabIndex(ReturnConst.GIFT_ACTIVITY_TYPE, canGetGiftReward)
end

function ReturnView:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function ReturnView:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function ReturnView:_updateCountDown()
	local countDown = self._endTime - G_ServerTime:getTime()
	local curView = self._activityView[self._selectTabIndex]

	if countDown >= 0 then
		local timeString = G_ServerTime:getLeftDHMSFormatEx(self._endTime)
		if curView and curView.setEndTimeLabel then
			curView:setEndTimeLabel(Lang.get("days7activity_act_end_time", { time = timeString }))
		end
	else
		if curView and curView.setEndTimeLabel then
			curView:setEndTimeLabel(Lang.get("customactivity_avatar_act_end_tip"))
		end
	end
end

function ReturnView:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end

	self._selectTabIndex = index

	self:_showActivityView(self._selectTabIndex)
end

function ReturnView:_showActivityView(index)
	print("index "..index)
	local activityView = self._activityView[index]

	if activityView == nil then
		if index == ReturnConst.LEVEL_UP_TYPE then
			activityView = ReturnLevelActivity.new()
		elseif index >= ReturnConst.DAILY_ACTIVITY_TYPE and index <= ReturnConst.GIFT_ACTIVITY_TYPE then
			activityView = ReturnCommonActivity.new(index)
		end

		self._contentNode:addChild(activityView)
		activityView:setCascadeOpacityEnabled(true)
		self._activityView[index] = activityView
	end

	for k, v in pairs(self._activityView) do 
		if v then
			v:setVisible(false)
		end
	end

	activityView:setVisible(true)
	self:_updateCountDown()

	return activityView
end

function ReturnView:_onGetReward(message_id, awards)
	local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	PopupGetRewards:showRewards(awards)

	self:_refreshRedPoint()
end

return ReturnView