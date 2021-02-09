local ViewBase = require("app.ui.ViewBase")
local ActivityView = class("ActivityView", ViewBase)
local TabButtonGroup = require("app.utils.TabButtonGroup")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local MonthlyCardView = import(".monthlycard.MonthlyCardView")
local DailySigninView = import(".dailysignin.DailySigninView")
local MoneyTreeView = import(".moneytree.MoneyTreeView")
local OpenServerFundView = import(".openserverfund.OpenServerFundView")
local LuxuryGiftPkgView = import(".luxurygiftpkg.LuxuryGiftPkgView")
local WeeklyGiftPkgView = import(".weeklygiftpkg.WeeklyGiftPkgView")
local DinnerView = import(".dinner.DinnerView")
local LevelGiftView = import("app.scene.view.activity.levelGift.LevelGiftView")
local ActivityConst = require("app.const.ActivityConst")
local TextHelper = require("app.utils.TextHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local ReturnConst = require("app.const.ReturnConst")


function ActivityView:ctor(activityId)
	self._paramActivityId = activityId
	self._topbarBase = nil
	self._scrollViewTab = nil
	self._panelRight = nil
	self._tabGroup = nil
	self._activityModuleUIList = {}
	self._selectTabIndex = 0
	self._activityDataList = {}

	self._commonFullScreen = nil
    local resource = {
        file = Path.getCSB("ActivityView", "activity"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {

		}
    }
    ActivityView.super.ctor(self, resource)
end

function ActivityView:onCreate()
	self._topbarBase:setImageTitle("txt_sys_com_fuli")--Lang.get("lang_activity_title")
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_ACTIVITY)
    self._commonFullScreen:showCount(false)

    self._commonFullScreen:setTitle("")
    
	self:setName("ActivityView")
end

function ActivityView:onEnter()

	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalReturnUpdate = G_SignalManager:add(SignalConst.EVENT_RETURN_UPDATE, handler(self, self._refreshDoubelTips))
	self._activityDataList = G_UserData:getActivity():getOpenActivityCfgList()
	self:_refreshActTagGroup()

	local actId = self._paramActivityId or G_UserData:getActivity():getLastSelectActId()
	self._paramActivityId = nil
	local tabIndex = self:_seekTabIndexByActivityId(actId)
	if tabIndex == 0 then
		self._tabGroup:setTabIndex(1)
	else
		local success = self._tabGroup:setTabIndex(tabIndex)
		if not success then
			self:_resetTabIndex()
			self._tabGroup:setTabIndex(1)
		end
	end

	self:_refreshRedPoint()

	self:_refreshDoubelTips()
end

function ActivityView:onExit()
	G_UserData:getActivity():setLastSelectTabIndex(self._selectTabIndex)
	G_UserData:getActivity():setLastSelectActId(self:_seekActIdByTabIndex(self._selectTabIndex))

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	self._signalReturnUpdate:remove()
	self._signalReturnUpdate = nil

	
end

function ActivityView:_refreshDoubelTips()
	local isRegression = G_UserData:getBase():isIs_regression()
    if isRegression == false then
        return
	end
	
	local actListData = self:_getActListData()
	for k,v in ipairs(actListData) do
		local restTimes = 0

		if v.id == ActivityConst.ACT_ID_SIGNIN then
			restTimes = G_UserData:getReturnData():getPrivilegeRestTimes(ReturnConst.PRIVILEGE_DAILY_SIGN)
		elseif v.id == ActivityConst.ACT_ID_SUPER_CHECKIN then
			restTimes = G_UserData:getReturnData():getPrivilegeRestTimes(ReturnConst.PRIVILEGE_WUGUFENGDENG)
		else
		end
		
		self._tabGroup:setDoubleTipsByTabIndex(k, restTimes > 0)
	end
end


function ActivityView:_refreshRedPoint()
	local actListData = self:_getActListData()
	for k,v in ipairs(actListData) do
		local redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_WELFARE,"subActivity",v.id)
		self._tabGroup:setRedPointByTabIndex(k,redPointShow)
	end
end

function ActivityView:_onEventRedPointUpdate(event,funcId,param)
	if funcId ~= FunctionConst.FUNC_WELFARE then
		return
	end
	if not param or type(param) ~= 'table' then
		return
	end

	local actId = param.actId

	if actId == ActivityConst.ACT_ID_OPEN_SERVER_FUND then
		self:_refreshRedPoint()
		return
	end

	local tabIndex = self:_seekTabIndexByActivityId(actId)
	if tabIndex ~= 0 then
		local redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_WELFARE,"subActivity",actId)
		self._tabGroup:setRedPointByTabIndex(tabIndex,redPointShow)
	end

end


function ActivityView:_makeTabTextListFromTabData(actDataList)
	local textList = {}
    for k,v in ipairs(actDataList) do
        local name = TextHelper.byteAlignment(v.name, 2, 4)
		table.insert(textList, name)
	end
	return textList
end

--通过活动ID查找标签索引
--@return:查找不到返回0
function ActivityView:_seekTabIndexByActivityId(activityId)
	local actListData = self:_getActListData()
	for k,v in ipairs(actListData) do
		if v.id == activityId then
			return k
		end
	end
	return 0
end


function ActivityView:_seekActIdByTabIndex(index)
	local actData = self:_getActDataByIndex(index)
	if actData then
		return actData.id
	end
	return -1--活动从0开始
end

function ActivityView:_getActListData()

	return self._activityDataList
end

--@index:传入nil返回当前活动数据
function ActivityView:_getActDataByIndex(index)
	if not index then
		index = self._selectTabIndex
	end
	local actListData = self:_getActListData()
	local data =  actListData[index]
	return data
end

function ActivityView:_refreshActTagGroup()
	local param = {
		rootNode = self._scrollViewTab,
		containerStyle = 2,
		offset = 0,
		callback = handler(self, self._onTabSelect),
		textList =  self:_makeTabTextListFromTabData(self:_getActListData()),
		--openStateList = {{noOpen=false,noOpenTips=""},{noOpen = true,noOpenTips="xxx"}}
	}
	self._tabGroup:recreateTabs(param)
end

function ActivityView:_resetTabIndex()
	self._selectTabIndex = 0
end

function ActivityView:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index
	--右边内容视图切换
	for i,view in pairs(self._activityModuleUIList) do
		view:setVisible(false)
		if i ~= index then
			view:exitModule()
		end
	end

	local activityModuleUI,newCreate = self:_getActivityModuleUI(index)
	activityModuleUI:setVisible(true)
	if activityModuleUI.enterModule then activityModuleUI:enterModule() end

	--设置标题
	self:_refreshTitle(activityModuleUI)

	if not newCreate then--新创建的View在自己的onEnter里有判断零点刷新
		self:_resetDataForZero()
	end

	self:_sendClickRedPointEvent()
end

function ActivityView:_refreshTitle(activityModuleUI)
	local data = self:_getActDataByIndex()
	local actCfg = G_UserData:getActivity():getActivityDataById(data.id):getBaseActivityData():getConfig()
	activityModuleUI:setTitle(TextHelper.expandTextByLen(actCfg.name, 3))
end

function ActivityView:_resetDataForZero()
	local data = self:_getActDataByIndex()
	local activityData = G_UserData:getActivity():getActivityDataById(data.id)
	if activityData:isExpired() then
		G_UserData:getActivity():pullActivityData(data.id)
	end
end


function ActivityView:_getActivityModuleUI(index)
	local activityModuleUI = self._activityModuleUIList[index]
	if activityModuleUI == nil then
		local listData =  self:_getActListData()
		local data = listData[index]
		if data.id == ActivityConst.ACT_ID_MONTHLY_CARD  then
			activityModuleUI = MonthlyCardView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_SIGNIN  then
			activityModuleUI = DailySigninView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_OPEN_SERVER_FUND then
			activityModuleUI = OpenServerFundView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_LUXURY_GIFT_PKG then
			activityModuleUI = LuxuryGiftPkgView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_WEEKLY_GIFT_PKG then
			activityModuleUI = WeeklyGiftPkgView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_DINNER then
			activityModuleUI = DinnerView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_MONEY_TREE then
			activityModuleUI = MoneyTreeView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_LEVEL_GIFT_PKG then
			activityModuleUI = LevelGiftView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_BETA_APPOINTMENT then
			--公测预约活动id
			local BetaAppointmentView = require("app.scene.view.activity.betaAppointment.BetaAppointmentView")
			activityModuleUI = BetaAppointmentView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_RECHARGE_REBATE then
			--充值返利活动id
			local RechargeRebateView = require("app.scene.view.activity.rechargeRebate.RechargeRebateView")
			activityModuleUI = RechargeRebateView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_RESROUCE_BACK then
			--公测预约活动id
			local ResourceBackView = require("app.scene.view.activity.resourceBack.ResourceBackView")
			activityModuleUI = ResourceBackView.new(self, data.id)
		elseif data.id == ActivityConst.ACT_ID_SUPER_CHECKIN then
			local SuperCheckinView = require("app.scene.view.activity.superCheckin.SuperCheckinView")
			activityModuleUI = SuperCheckinView.new(self, data.id)
		elseif data.id > ActivityConst.ACT_ID_OPEN_SERVER_FUND  then
			activityModuleUI = OpenServerFundView.new(self, data.id,
				UserDataHelper.getFundGroupByFundActivityId(data.id))
		end

		self._panelRight:addChild(activityModuleUI)
		self._activityModuleUIList[index] = activityModuleUI

		return activityModuleUI,true
	end
	return activityModuleUI,false
end

function ActivityView:_sendClickRedPointEvent()
	local actData = self:_getActDataByIndex()

	if actData.id == ActivityConst.ACT_ID_MONTHLY_CARD  then
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_WELFARE,{actId = actData.id,"buyMonthCardHint"})
	elseif actData.id == ActivityConst.ACT_ID_OPEN_SERVER_FUND then
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_WELFARE,{actId = actData.id,"vipHint"})
	elseif actData.id == ActivityConst.ACT_ID_LUXURY_GIFT_PKG then
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_WELFARE,{actId = actData.id})
	elseif actData.id == ActivityConst.ACT_ID_WEEKLY_GIFT_PKG then
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_WELFARE,{actId = actData.id})
	elseif actData.id == ActivityConst.ACT_ID_MONEY_TREE then
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_WELFARE,{actId = actData.id})
	elseif actData.id == ActivityConst.ACT_ID_LEVEL_GIFT_PKG then
		local redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_WELFARE,"subActivity",ActivityConst.ACT_ID_LEVEL_GIFT_PKG)
		if redPointShow then
			G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
				FunctionConst.FUNC_WELFARE,{actId = actData.id})
		end
	elseif actData.id == ActivityConst.ACT_ID_BETA_APPOINTMENT then
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_WELFARE,{actId = actData.id})
	elseif actData.id == ActivityConst.ACT_ID_RECHARGE_REBATE then
			G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
				FunctionConst.FUNC_WELFARE,{actId = actData.id})
	elseif actData.id == ActivityConst.ACT_ID_RESROUCE_BACK then
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK_MEMORY,
			FunctionConst.FUNC_WELFARE,{actId = actData.id})
	elseif actData.id == ActivityConst.ACT_ID_SUPER_CHECKIN then
			G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
				FunctionConst.FUNC_WELFARE,{actId = actData.id})
	elseif actData.id > ActivityConst.ACT_ID_OPEN_SERVER_FUND then
		G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_WELFARE,{actId = ActivityConst.ACT_ID_OPEN_SERVER_FUND,"vipHint"})
	end
end

--获得活动id
function ActivityView:getActivityId( ... )
	-- body
	local actData = self:_getActDataByIndex()
	return actData.id
end

function ActivityView:showMoneyTreeTab()
	local actId = ActivityConst.ACT_ID_MONEY_TREE
	local tabIndex = self:_seekTabIndexByActivityId(actId)
	self._tabGroup:setTabIndex(tabIndex)
end
return ActivityView
