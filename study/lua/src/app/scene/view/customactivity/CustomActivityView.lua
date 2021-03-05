local PopupBase = require("app.ui.PopupBase")
local TabButtonGroup = require("app.utils.TabButtonGroup")
local CustomActivityTaskView = import(".CustomActivityTaskView")
local CustomActivityWelfareView = import(".CustomActivityWelfareView")
local CustomActivityConst = require("app.const.CustomActivityConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ActivityGuildSprintView = require("app.scene.view.activityguildsprint.ActivityGuildSprintView")
local CustomActivityAvatarView = require("app.scene.view.customactivity.avatar.CustomActivityAvatarView")
local CustomActivityEquipmentView = require("app.scene.view.customactivity.CustomActivityEquipmentView")
local CustomActivityPetView = require("app.scene.view.customactivity.CustomActivityPetView")
local CustomActivityHorseConquerView = require("app.scene.view.customactivity.CustomActivityHorseConquerView")
local CustomActivityHorseJudgeView = require("app.scene.view.customactivity.CustomActivityHorseJudgeView")
local CustomActivityFundsView = require("app.scene.view.customactivity.CustomActivityFundsView")
local CustomActivityVipRecommendGift = require("app.scene.view.customactivity.CustomActivityVipRecommendGift")
local CustomActivityTenJadeAuction = require("app.scene.view.customactivity.CustomActivityTenJadeAuction")
local CustomActivityReturnGiftView = require("app.scene.view.customactivity.CustomActivityReturnGiftView")
local CustomActivityView = class("CustomActivityView", PopupBase)
local CustomActivityUIHelper = import(".CustomActivityUIHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local DataConst = require("app.const.DataConst")
local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")
local TopBarStyleConst = require("app.const.TopBarStyleConst")

function CustomActivityView:ctor(selectActivityId)
    --数据
    self._selectedFirstTabIndex = -1
	self._selectActivityId = selectActivityId
	self._mainTabGroupData = {}
	--UI
	self._tabGroup = nil
	self._activityModuleUIList = {}


	self._nodeRight = nil
    self._textActEndTime = nil
	self._textTime = nil
	self._isEnterPull = false
	local resource = {
		file = Path.getCSB("CustomActivityView", "customactivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			}
		},
	}
	CustomActivityView.super.ctor(self, resource)
end

function CustomActivityView:onCreate()
   -- self._commonPop:setTitle(Lang.get("customactivity_title"))
	--self._commonPop:addCloseEventListener(handler(self,self._onClickClose))
    if cc.isRegister("CommonTabGroupScrollVertical") then
        cc.bind( self._tabGroup, "CommonTabGroupScrollVertical")
    end


	self._topbarBase:updateUI(TopBarStyleConst.STYLE_MAIN, true)

	self._topbarBase:setBGType(2)
	self._topbarBase:hideBack()

	self._imageBg:setContentSize(G_ResolutionManager:getDesignCCSize())

	self:_initTabGroup()--创建TagGroup
end

function CustomActivityView:_updateTopBar()
	local actUnitdata = self:_getTabDataByIndex()
	if not actUnitdata then
		return
	end
	self:resumeUpdateTopBar()
	if actUnitdata.type == TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT then
		local actType = actUnitdata.srcData:getAct_type()
		if actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR then
			self._topbarBase:updateUIByResList(
				{
					{type = TypeConvertHelper.TYPE_RESOURCE,value = DataConst.RES_JADE2},
					{type = TypeConvertHelper.TYPE_RESOURCE,value = DataConst.RES_DIAMOND  },
					{type = TypeConvertHelper.TYPE_ITEM,value = DataConst.ITEM_AVATAR_ACTIVITY_TOKEN  },
					{type = TypeConvertHelper.TYPE_RESOURCE,value = DataConst.RES_AVATAR_FRAGMENT  }
				}, true
			)
			return
		end

		self._topbarBase:updateUIByResList(actUnitdata.srcData:getTopBarItems(), true)
		return
	end

	self._topbarBase:updateUIByResList(
		{
			{type = 0,value = 0  },
			{type = 0,value = 0  },
			{type = 0,value = 0  },
			{type = TypeConvertHelper.TYPE_RESOURCE,value = DataConst.RES_DIAMOND  }
		}, true
	)
end
function CustomActivityView:pauseUpdateTopBar( )
	-- body
	self._topbarBase:pauseUpdate()
end

function CustomActivityView:resumeUpdateTopBar( )
	-- body
	self._topbarBase:resumeUpdate()
end

function CustomActivityView:onEnter()
	self._signalCustomActInfo = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_INFO, handler(self, self._onEventCustomActInfo))
	self._signalCustomActUpdate = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE, handler(self, self._onEventCustomActUpdate))
	self._signalCustomActUpdateQuest= G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE_QUEST, handler(self, self._onEventCustomActUpdateQuest))
	self._signalCustomActGetAward = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_GET_AWARD, handler(self, self._onEventCustomActGetAward))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalCustomActExpired = G_SignalManager:add(SignalConst.EVENT_CUSTOM_ACTIVITY_EXPIRED, handler(self,self._onEventCustomActExpired))

	self._signalCheckBuyReturnGift = G_SignalManager:add(SignalConst.EVENT_CHECK_BUY_RETURN_GIFT, handler(self, self._onEventCheckBuyReturnGift))
	self._signalReturnGiftGetAward = G_SignalManager:add(SignalConst.EVENT_RETURN_BUY_RETURN_GIFT, handler(self, self._onEventReturnGiftGetAward))

	self:_refreshData()


	if self._isEnterPull  then
		G_UserData:getCustomActivity():pullData()
	end
	self._isEnterPull = true--第一次Enter在onShowFinish里面拉取数据，解决卡顿
	G_UserData:getCustomActivity():checkVipRecommendGift()
	G_ServiceManager:getService("CustomActivityService"):enterModule()
end

function CustomActivityView:onExit()
	self._signalCustomActInfo:remove()
	self._signalCustomActInfo = nil
	self._signalCustomActUpdate:remove()
	self._signalCustomActUpdate = nil
	self._signalCustomActUpdateQuest:remove()
	self._signalCustomActUpdateQuest = nil
	self._signalCustomActGetAward:remove()
	self._signalCustomActGetAward = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	self._signalCheckBuyReturnGift:remove()
	self._signalCheckBuyReturnGift = nil
	self._signalReturnGiftGetAward:remove()
	self._signalReturnGiftGetAward = nil

	self._signalCustomActExpired:remove()
	self._signalCustomActExpired = nil



	G_ServiceManager:getService("CustomActivityService"):exitModule()
end

function CustomActivityView:onShowFinish()
	G_UserData:getCustomActivity():c2sGetUserCustomActivityQuest()
end

function CustomActivityView:_refreshRedPoint()
	local actListData = self:_getMainTabGroupData()
	for k,v in ipairs(actListData) do

		--local _,newTagShow,redPointShow = G_UserData:getCustomActivity():hasRedPointByActId(v.srcData:getAct_id())
		local _,newTagShow,redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ACTIVITY,"subActivityRP",{v.type,v.id} )	
		self._tabGroup:setRedPointByTabIndex(k, redPointShow,cc.p(0.90,0.85))
		local tabItem = self._tabGroup:getTabItem(k)
		if tabItem then
			tabItem.imageTag:setVisible(newTagShow)
		end


	end
end

function CustomActivityView:_onEventRedPointUpdate(event,funcId,param)
	if funcId ==  FunctionConst.FUNC_ACTIVITY then
		self:_refreshRedPoint()
    end
end


function CustomActivityView:_onEventCustomActInfo(event,data)
	self:_refreshData()
end

function CustomActivityView:_onEventCustomActExpired(event,data)
	self:_refreshData()
end

function CustomActivityView:_onEventCustomActUpdate(event,data)
	self:_refreshData()
end

function CustomActivityView:_onEventCustomActUpdateQuest(event,data)
	
	self:_refreshModuleUI(false)
end

function CustomActivityView:_onEventCustomActGetAward(event,message)
	local taskUnitData = G_UserData:getCustomActivity():getActTaskUnitDataById(
				message.act_id,message.quest_id)
	local rewards = {}
	local fixRewards = taskUnitData:getRewardItems()
	local selectRewards = taskUnitData:getSelectRewardItems()
	for k,v in ipairs(fixRewards) do
		table.insert(rewards,v)
	end
	logWarn("award_id"..message.award_id)
	local selectReward = selectRewards[message.award_id]--服务器从1开始
	if selectReward then
		table.insert(rewards,selectReward)
	end
	local newRewards = rewards
	if message.award_num > 1 then
		newRewards = {}
		local rate = message.award_num
		for k,v in ipairs(rewards) do
			table.insert(newRewards,{type = v.type,value = v.value,size = v.size * rate})
		end
	end
	self:_showRewards(newRewards)
end

function CustomActivityView:_onEventReturnGiftGetAward(event,awards)
	self:_showRewards(awards)
	self:_refreshModuleUI()
end

function CustomActivityView:_onEventCheckBuyReturnGift(event,giftId)
	local return_charge_active = require("app.config.return_charge_active")
	local giftInfo = return_charge_active.get(giftId)
    
    local payId = giftInfo.vip_pay_id
    local VipPay = require("app.config.vip_pay")
    local payCfg = VipPay.get(payId)
    assert(payCfg,"vip_pay not find id "..tostring(payId))

    G_GameAgent:pay(payCfg.id, 
        payCfg.rmb, 
        payCfg.product_id, 
        payCfg.name, 
        payCfg.name)
end

function CustomActivityView:_showRewards(awards)
	if awards then
        G_Prompt:showAwards(awards)
		-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		-- PopupGetRewards:showRewards(awards)
	end
end


function CustomActivityView:_onClickClose(sender)
    self:close()
end

function CustomActivityView:_onTabSelect(tabIndex, sender)
	if self._selectedFirstTabIndex == tabIndex then
		return false
	end
	self._selectedFirstTabIndex = tabIndex

	local actUnitdata = self:_getTabDataByIndex(tabIndex)
	--刷新任务
	self:_refreshModuleUI()

	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_ACTIVITY,{actId = actUnitdata.id,actType = actUnitdata.type  })


	return true
end

function CustomActivityView:_createTabItem(tabNode)
    local tabItem = {}
    local instNode = tabNode
    tabItem.normalImage = ccui.Helper:seekNodeByName(instNode, "Image_normal")
    tabItem.downImage = ccui.Helper:seekNodeByName(instNode, "Image_down")
    tabItem.textWidget = ccui.Helper:seekNodeByName(instNode, "Text_desc")
	tabItem.imageWidget = ccui.Helper:seekNodeByName(instNode, "Image_icon")
	tabItem.imageSelect = ccui.Helper:seekNodeByName(instNode, "Image_select")
	tabItem.imageTag = ccui.Helper:seekNodeByName(instNode, "Image_tag")
	tabItem.imageWidget:ignoreContentAdaptWithSize(true)
    return tabItem
end

function CustomActivityView:_updateTabItem(tabItem)
    local index = tabItem.index
	local customActUnitData = self:_getTabDataByIndex(index)
	if customActUnitData then
		tabItem.textWidget:setString(customActUnitData.title)
		tabItem.imageWidget:setVisible(false)
		--[[
		if customActUnitData:getIcon_type() == 0 then
			tabItem.imageWidget:setVisible(false)
		else
			tabItem.imageWidget:setVisible(true)
			local itemParams = TypeConvertHelper.convert(customActUnitData:getIcon_type(),
				customActUnitData:getIcon_value())
			if itemParams.icon ~= nil then
				tabItem.imageWidget:loadTexture(itemParams.icon)
			end
		end
]]

	end

end

function CustomActivityView:_brightTabItem(tabItem,bright)
	local textWidget = tabItem.textWidget
    local normalImage = tabItem.normalImage
    local downImage =  tabItem.downImage
    normalImage:setVisible(not bright)
    downImage:setVisible(bright)
    textWidget:setColor(bright and  Colors.CUSTOM_ACT_TAB_BRIGHT or Colors.CUSTOM_ACT_TAB_NORMAL)
   -- textWidget:enableOutline(bright and Colors.CUSTOM_ACT_TAB_BRIGHT_OUTLINE or Colors.CUSTOM_ACT_TAB_NORMAL_OUTLINE ,2)
	--textWidget:setPositionX(bright and 42 or 26)
end

function CustomActivityView:_getTabCount()
	local groupData = self:_getMainTabGroupData()
    return #groupData
end

--刷新左侧标签的内容
function CustomActivityView:_refreshData()
	local oldTabData = self:_getTabDataByIndex(self._selectedFirstTabIndex)--刷新前选中的页签数据
	self._mainTabGroupData =  CustomActivityUIHelper.getTabDatas()-- G_UserData:getCustomActivity():getShowActUnitDataArr()--重取页签数据
	self:_initTabGroup()--刷新页签

	local newSelectIndex = self:_seekTabIndexByTabData(oldTabData)--旧页签数据在新数据中的索引
	local isResetTabIndex = newSelectIndex == 0 ---旧页签数据在新数据中找不到
	if isResetTabIndex then
		--跳转到指定activity 页签
		local targetIndex = 1
		if self._selectActivityId then
			for k ,v in pairs(self._mainTabGroupData) do
				if self._selectActivityId == v.id then
					targetIndex = k
				end
			end
			self._selectActivityId = nil
		end

		self._selectedFirstTabIndex = -1
		self._tabGroup:setTabIndex(targetIndex)
	else
		local success = self._tabGroup:setTabIndex(newSelectIndex)
		if not success then--新页签和旧页签一样
			self:_refreshModuleUI()
		else
		end
	end
end

--刷新主标签TagGroup
function CustomActivityView:_initTabGroup()
	local param = {
		tabIndex = self._selectedFirstTabIndex < 1 and nil or self._selectedFirstTabIndex ,
		callback = handler(self, self._onTabSelect),
		containerStyle = 2,
        offset = -6,
		tabStyle =  1,
        createTabItemCallback = handler(self,self._createTabItem),
        updateTabItemCallback = handler(self,self._updateTabItem),
        getTabCountCallback = handler(self,self._getTabCount),
		brightTabItemCallback = handler(self,self._brightTabItem),
	}

	self._tabGroup:recreateTabs(param)


	self:_refreshRedPoint()
end

function CustomActivityView:_getMainTabGroupData()
	return self._mainTabGroupData
end

--通过标签数据查找标签索引
--@return:查找不到返回0
function CustomActivityView:_seekTabIndexByTabData(tabData)
	if not tabData then
		return 0
	end
	local actListData = self:_getMainTabGroupData()
	for k,v in ipairs(actListData) do
		if v.id == tabData.id and  v.type == tabData.type  then
			return k
		end
	end
	return 0
end

--@tabIndex :nil 默认当前页签
function CustomActivityView:_getTabDataByIndex(tabIndex)
	local mainTabGroupData = self:_getMainTabGroupData()
	if not mainTabGroupData then
		return nil
	end
	if not tabIndex then
		tabIndex = self._selectedFirstTabIndex
	end
	if tabIndex <= 0 then
		return nil
	end
	return mainTabGroupData[tabIndex]
end

function CustomActivityView:_checkShowConsumptionTips(actUnitdata)
	local type = actUnitdata.type

	if TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == type then
		local actType = actUnitdata.srcData:getAct_type()
		if actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR then
			self._consumptionTips:setVisible(true)
		elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP then
			self._consumptionTips:setVisible(true)
		elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER then
			self._consumptionTips:setVisible(true)
		elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET then
			self._consumptionTips:setVisible(true)
		elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS then
			self._consumptionTips:setVisible(true)
		elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT then
			self._consumptionTips:setVisible(true)
		elseif actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_WEAL then
			self._consumptionTips:setVisible(true)
		elseif actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY then
			self._consumptionTips:setVisible(true)
		else
			self._consumptionTips:setVisible(false)
		end
	elseif TimeLimitActivityConst.ID_TYPE_AVATAR_ACT_INTRO == type then
		self._consumptionTips:setVisible(true)
	else	
		self._consumptionTips:setVisible(false)
	end
end

function CustomActivityView:_refreshModuleUI(resetListData)
	local actUnitdata = self:_getTabDataByIndex()
	if not actUnitdata then
		return
	end
	--右边内容视图切换
	for i,view in pairs(self._activityModuleUIList) do
		view:setVisible(false)
		if view.stopBGM then
			view:stopBGM() --关闭背景音
		end
	end

	self._helpBg:setVisible(true)
	self._helpInfo:setVisible(true)

	if TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == actUnitdata.type then
		local actType = actUnitdata.srcData:getAct_type()
		if actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR then
			self._helpInfo:updateUI(FunctionConst.FUNC_AVATAR_ACTIVITY)
		elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP then
			self._helpInfo:updateUI(FunctionConst.FUNC_EQUIP_ACTIVITY)
		elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER then
			self._helpInfo:updateUI(FunctionConst.FUNC_HORSE_CONQUER_ACTIVITY)
		elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET then
			self._helpInfo:updateUI(FunctionConst.FUNC_PET_ACTIVITY)
		else
			self._helpBg:setVisible(false)
			self._helpInfo:setVisible(false)
		end
	else	
		self._helpBg:setVisible(false)
		self._helpInfo:setVisible(false)
	end

	self:_checkShowConsumptionTips(actUnitdata)  -- 是否显示 理性消费提示

	--刷新任务
	local activityModuleUI = self:_getActivityModuleUI(actUnitdata)
	assert(activityModuleUI, "CustomActivityView not find activityModuleUI "..actUnitdata.type.."_"..actUnitdata.id)
	activityModuleUI:setVisible(true)
	if activityModuleUI.startBGM then
		activityModuleUI:startBGM() --开启背景音
	end
	if activityModuleUI.enterModule then
		activityModuleUI:enterModule()
	end
	self:_updateLanternImage(actUnitdata)

	if TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == actUnitdata.type then
		activityModuleUI:refreshView(actUnitdata.srcData,resetListData)
	elseif TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT == actUnitdata.type then
		activityModuleUI:refreshView(actUnitdata.srcData,resetListData)
	elseif TimeLimitActivityConst.ID_TYPE_THREEKINDOMS == actUnitdata.type then
		activityModuleUI:refreshView(actUnitdata.srcData,resetListData)
	end
	self:_updateTopBar()
end

function CustomActivityView:_getActivityModuleUI(actUnitdata)
	local type = actUnitdata.type
	local activityModuleUI = self._activityModuleUIList[actUnitdata.type.."_"..actUnitdata.id]
	if activityModuleUI == nil then
		if TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == type then
			local actType = actUnitdata.srcData:getAct_type()
			if actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PUSH then
				activityModuleUI = CustomActivityTaskView.new(self,actType)
			elseif actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_WEAL then
				activityModuleUI = CustomActivityWelfareView.new(self,actType)
			elseif actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL then
				activityModuleUI = CustomActivityTaskView.new(self,actType)
			elseif actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY then
				activityModuleUI = CustomActivityTaskView.new(self,actType)
			elseif actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR then
				activityModuleUI = CustomActivityAvatarView.new(self,actUnitdata.srcData)
			elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP then
				activityModuleUI = CustomActivityEquipmentView.new(self)
			elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET then
				activityModuleUI = CustomActivityPetView.new(self)
			elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE then
				activityModuleUI = CustomActivityHorseJudgeView.new(self)
			elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS then
				activityModuleUI = CustomActivityFundsView.new()
			elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER then
				activityModuleUI = CustomActivityHorseConquerView.new()
			elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT then
				activityModuleUI = CustomActivityVipRecommendGift.new(self)
            elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_TEN_JADE_AUCTION then
				activityModuleUI = CustomActivityTenJadeAuction.new(self)
			elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_RETURN_SERVER_GIFT then
				activityModuleUI = CustomActivityReturnGiftView.new(self)
			end
		elseif TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT == type then
			local id =  actUnitdata.id
			local TimeLimitActivityConst = require("app.const.TimeLimitActivityConst")
			if id ==  TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT then
				activityModuleUI = ActivityGuildSprintView.new(self,actUnitdata)
			end
		elseif TimeLimitActivityConst.ID_TYPE_AVATAR_ACT_INTRO == type then
			local CustomActivityAvatarAdView = require("app.scene.view.customactivity.avatar.CustomActivityAvatarAdView")
			activityModuleUI = CustomActivityAvatarAdView.new(self)
		elseif TimeLimitActivityConst.ID_TYPE_THREEKINDOMS == type then
			local CustomActivityThreeKindomsView = require("app.scene.view.customactivity.CustomActivityThreeKindomsView")
			activityModuleUI = CustomActivityThreeKindomsView.new(self)
		end
		assert(activityModuleUI, "CustomActivityView _getActivityModuleUI not find activityModuleUI "..actUnitdata.type.."_"..actUnitdata.id)
		local point = G_ResolutionManager:getDesignCCPoint()
		activityModuleUI:setPosition(-point.x,-point.y)
		self._nodeRight:addChild(activityModuleUI)
		self._activityModuleUIList[actUnitdata.type.."_"..actUnitdata.id] = activityModuleUI
	end
	return activityModuleUI
end


--跳转到 变身卡活动
function CustomActivityView:jumpToAvatarActivity()
	local avatarActUnitData = G_UserData:getCustomActivity():getAvatarActivity()
    if not avatarActUnitData then
        G_Prompt:showTip(Lang.get("customactivity_avatar_act_end_tip"))
        return
    end
	local targetActId = avatarActUnitData:getAct_id()
	local targetIndex
	for k ,v in pairs(self._mainTabGroupData) do
		if targetActId == v.id then
			targetIndex = k
		end
	end
	if targetIndex then
		self._tabGroup:setTabIndex(targetIndex)
	end
end

--处理灯笼图,有的切页不显示
function CustomActivityView:_updateLanternImage(actUnitdata)
	local hideImageType = {
		CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE
	}
	local function isHide(actType)
		for i, type in ipairs(hideImageType) do
			if actType == type then
				return true
			end
		end
		return false
	end
	self._imageLantern:setVisible(true)
	if actUnitdata.srcData and actUnitdata.srcData.getAct_type then
		local actType = actUnitdata.srcData:getAct_type()
		if isHide(actType) then
			self._imageLantern:setVisible(false)
		end
	end
end


return CustomActivityView
