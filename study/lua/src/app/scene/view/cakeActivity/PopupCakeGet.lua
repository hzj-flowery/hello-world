--
-- Author: Liangxu
-- Date: 2019-4-29
-- 蛋糕材料获取弹框

local PopupBase = require("app.ui.PopupBase")
local PopupCakeGet = class("PopupCakeGet", PopupBase)
local CakeActivityConst = require("app.const.CakeActivityConst")
local CakeGetEggCell = require("app.scene.view.cakeActivity.CakeGetEggCell")
local CakeGetCreamCell = require("app.scene.view.cakeActivity.CakeGetCreamCell")
local CakeActivityDataHelper = require("app.utils.data.CakeActivityDataHelper")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local TimeConst = require("app.const.TimeConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local TopBarStyleConst = require("app.const.TopBarStyleConst")

function PopupCakeGet:ctor(index)
	self._selectTabIndex = index or CakeActivityConst.MATERIAL_TYPE_1
	local resource = {
		file = Path.getCSB("PopupCakeGet", "cakeActivity"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			},
		}
	}
	PopupCakeGet.super.ctor(self, resource)
end

function PopupCakeGet:onCreate()
	self._datas1 = {}
	self._datas2 = {}
	self._targetTime = 0

	self:_initTabGroup()
	
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_MAIN, true)
	self._topbarBase:setBGType(2)
	self._topbarBase:hideBack()
	self._topbarBase:updateUIByResList(
		{
			{type = 0,value = 0},
			{type = 0,value = 0},
			{type = 0,value = 0},
			{type = TypeConvertHelper.TYPE_RESOURCE,value = DataConst.RES_JADE2}
		}, true
	)
end

function PopupCakeGet:_initTabGroup()
	self._listView1:setTemplate(CakeGetEggCell)
	self._listView1:setCallback(handler(self, self._onItemUpdate1), handler(self, self._onItemSelected1))
	self._listView1:setCustomCallback(handler(self, self._onItemTouch1))
	self._listView2:setTemplate(CakeGetCreamCell)
	self._listView2:setCallback(handler(self, self._onItemUpdate2), handler(self, self._onItemSelected2))
	self._listView2:setCustomCallback(handler(self, self._onItemTouch2))
	self._textImagePayTip:setVisible(false)

	local tabNameList = CakeActivityDataHelper.getTabTitleNames()
	local param = {
		callback = handler(self, self._onTabSelect),
		textList = tabNameList,
	}
	
	self._nodeTabRoot:setCustomColor({
		{cc.c3b(0x5d, 0x70, 0xa4)},
		{cc.c3b(0xce, 0x68, 0x24)},
	})
	self._nodeTabRoot:recreateTabs(param)
end

function PopupCakeGet:onEnter()
	self._signalGetTaskReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_GET_TASK_REWARD, handler(self, self._onEventGetTaskReward))
	self._signalUpdateTaskInfo = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_TASK_INFO, handler(self, self._onEventUpdateTaskInfo))
	self._signalGetRechargeReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_GET_RECHARGE_REWARD, handler(self, self._onEventGetRechargeReward))
	self._signalEnterSuccess = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS, handler(self, self._onEventEnterSuccess))
	self._signalRechargeReward = G_SignalManager:add(SignalConst.EVENT_CAKE_ACTIVITY_RECHARGE_REWARD, handler(self, self._onEventRechargeReward))
	
	if G_UserData:getCakeActivity():isExpired(TimeConst.RESET_TIME_24) then
		G_UserData:getCakeActivity():c2sEnterCakeActivity()
	end

	self._nodeTabRoot:setTabIndex(self._selectTabIndex)
	self:_updateList()

	local startTime1 = G_UserData:getCakeActivity():getActivityStartTime() --本服阶段开始时间
    local endTime1 = startTime1 + CakeActivityConst.CAKE_LOCAL_TIME --本服阶段结束时间
    local startTime2 = endTime1 + CakeActivityConst.CAKE_TIME_GAP --全服阶段开始时间
    local endTime2 = startTime2 + CakeActivityConst.CAKE_CROSS_TIME --全服阶段结束时间
    self._targetTime = endTime2
    self:_startCountDown()
	self:_updateRp()
end

function PopupCakeGet:onExit()
	self:_stopCountDown()

    self._signalGetTaskReward:remove()
    self._signalGetTaskReward = nil
    self._signalUpdateTaskInfo:remove()
    self._signalUpdateTaskInfo = nil
    self._signalGetRechargeReward:remove()
    self._signalGetRechargeReward = nil
    self._signalEnterSuccess:remove()
    self._signalEnterSuccess = nil
	self._signalRechargeReward:remove()
	self._signalRechargeReward = nil
end

function PopupCakeGet:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function PopupCakeGet:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function PopupCakeGet:_updateCountDown()
	local countDown = self._targetTime - G_ServerTime:getTime()
	if countDown >= 0 then
		self._textCountDownTitle:setString(Lang.get("cake_activity_countdown_common_title"))
		self._textCountDownTitle:setPositionX(58)
		local timeString = G_ServerTime:getLeftDHMSFormatEx(self._targetTime)
    	self._textCountDown:setString(timeString)
    else
		self._textCountDownTitle:setString(Lang.get("cake_activity_countdown_finish"))
		self._textCountDownTitle:setPositionX(100)
    	self._textCountDown:setString("")
    	self:_stopCountDown()
	end
end

function PopupCakeGet:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateList()
	if self._selectTabIndex == CakeActivityConst.MATERIAL_TYPE_2 then --获取奶油页签红点判断
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_CAKE_ACTIVITY_GET_MATERIAL,{index = CakeActivityConst.MATERIAL_TYPE_2})
		self._nodeTabRoot:setRedPointByTabIndex(index, false)
	end
end

function PopupCakeGet:_updateList()
	if self._selectTabIndex == CakeActivityConst.MATERIAL_TYPE_1 then
		self:_updateList1()
	else
		self:_updateList2()
	end
end

function PopupCakeGet:_updateList1()
	self._listView1:setVisible(true)
	self._listView2:setVisible(false)
	self._textImagePayTip:setVisible(false)
	self._imageDes:loadTexture(Path.getTextAnniversaryImg("txt_anniversary04"))
	self._imageTip:setVisible(true)
	self._datas1 = G_UserData:getCakeActivity():getTaskList()
	self._listView1:clearAll()
	self._listView1:resize(#self._datas1)
end

function PopupCakeGet:_updateList2()
	self._listView1:setVisible(false)
	self._listView2:setVisible(true)
	self._textImagePayTip:setVisible(true)
	self._imageDes:loadTexture(Path.getTextAnniversaryImg("txt_anniversary05"))
	self._imageTip:setVisible(false)
	self._datas2 = G_UserData:getCakeActivity():getChargeList()
	self._listView2:clearAll()
	self._listView2:resize(#self._datas2)
end

function PopupCakeGet:_onItemUpdate1(item, index)
	local data = self._datas1[index + 1]
	if data then
		item:update(data)
	end
end

function PopupCakeGet:_onItemSelected1(item, index)

end

function PopupCakeGet:_onItemTouch1(index, t, state)
	local index = index + t
	local data = self._datas1[index]
	local taskId = data:getCurShowId()
	if state == CakeActivityConst.TASK_STATE_1 then
		local actStage = CakeActivityDataHelper.getActStage()
		if actStage == CakeActivityConst.ACT_STAGE_0 or actStage == CakeActivityConst.ACT_STAGE_4 then
			G_Prompt:showTip(Lang.get("cake_activity_act_end_tip"))
			return
		end
		local info = CakeActivityDataHelper.getCurCakeTaskConfig(taskId)
		local functionId = 0
		if taskId == 600 then --此处写死，600是答题活动，有2个参数，要特殊处理
			local ids = string.split(info.function_id, "|")
			local GuildServerAnswerHelper = require("app.scene.view.guildServerAnswer.GuildServerAnswerHelper")
			local isToday = GuildServerAnswerHelper.isTodayOpen()
			if isToday then --是全服答题的当天
				functionId = tonumber(ids[2])
			else
				functionId = tonumber(ids[1])
			end
		else
			functionId = tonumber(info.function_id)
		end
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
		WayFuncDataHelper.gotoModuleByFuncId(functionId)
	elseif state == CakeActivityConst.TASK_STATE_2 then
		G_UserData:getCakeActivity():c2sGetCakeActivityTaskReward(taskId)
	end
end

function PopupCakeGet:_onItemUpdate2(item, index)
	local data = self._datas2[index + 1]
	if data then
		item:update(data)
	end
end

function PopupCakeGet:_onItemSelected2(item, index)

end

function PopupCakeGet:_onItemTouch2(index, t)
	local index = index + t
	local id = self._datas2[index]
	G_UserData:getCakeActivity():c2sExchargeReward(id)
end

function PopupCakeGet:_onClickClose()
	self:close()
end

function PopupCakeGet:_onEventGetTaskReward(eventName, taskId, awards)
	G_Prompt:showAwards(awards)
	if self._selectTabIndex == CakeActivityConst.MATERIAL_TYPE_1 then
		self:_updateList1()
	end
	self:_updateRp()
end

function PopupCakeGet:_onEventUpdateTaskInfo(eventName)
	if self._selectTabIndex == CakeActivityConst.MATERIAL_TYPE_1 then
		self:_updateList1()
	end
end

function PopupCakeGet:_onEventGetRechargeReward(eventName, awards)
	G_Prompt:showAwards(awards)
end

function PopupCakeGet:_onEventEnterSuccess()
	self:_updateList()
end

function PopupCakeGet:_updateRp()
	local show1 = G_UserData:getCakeActivity():isHaveCanGetMaterial()
	self._nodeTabRoot:setRedPointByTabIndex(CakeActivityConst.MATERIAL_TYPE_1, show1)
	local show2 = G_UserData:getCakeActivity():isPromptRecharge()
	self._nodeTabRoot:setRedPointByTabIndex(CakeActivityConst.MATERIAL_TYPE_2, show2)
end

function PopupCakeGet:_onEventRechargeReward(eventName, awards)
	G_Prompt:showAwards(awards)
end

return PopupCakeGet