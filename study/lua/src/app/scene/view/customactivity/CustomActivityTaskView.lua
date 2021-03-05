local ViewBase = require("app.ui.ViewBase")

local TabButtonGroup = require("app.utils.TabButtonGroup")
local Day7ActivityConst = require("app.const.Day7ActivityConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local UIHelper = require("yoka.utils.UIHelper")
local CustomActivityTaskView = class("CustomActivityTaskView", ViewBase)
local CustomActivityConst = require("app.const.CustomActivityConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

--@isExchangeTask:是否是兑换任务
function CustomActivityTaskView:ctor(actView,actType)
	self._actView = actView
	self._actType = actType
	self._isExchangeTask = isExchangeTask
	self._customActUnitData = nil 
    --数据
	self._listDatas = nil
	self._resetListData = nil
    --节点
    self._imageBg = nil
	self._listItemSource = nil
	self._textActTitle = nil
	self._textActDes = nil
	self._textNode = nil
	local resource = {
		file = Path.getCSB("CustomActivityTaskView", "customactivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		},
	}
	CustomActivityTaskView.super.ctor(self, resource)
end

function CustomActivityTaskView:onCreate()
	self:_initListView(self._listItemSource)
end

function CustomActivityTaskView:onEnter()
	self:_startRefreshHandler()
end

function CustomActivityTaskView:onExit()
	self:_endRefreshHandler()
end

function CustomActivityTaskView:_startRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function CustomActivityTaskView:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end


function CustomActivityTaskView:_onRefreshTick( dt )
	local actUnitdata = self._customActUnitData
	if actUnitdata then
		self:_refreshActTime(actUnitdata)
	end


	--对比ActList决定是否刷新,这样太费性能了
	--G_UserData:getCustomActivity():getShowActUnitDataArr()
	--现在点击按钮触发判断
end

function CustomActivityTaskView:_refreshActTime(actUnitData)
	local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
	if self._listDatas and self._listDatas[1] and self._listDatas[1].actTaskUnitData:getQuest_type() ==  
		CustomActivityConst.CUSTOM_QUEST_TYPE_RESET_GUILD_ACT then	
			local endTime = G_ServerTime:secondsFromZero() + 3600*24
			self._textTimeTitle:setString(Lang.get("activity_guild_sprint_downtime_title"))
			self._textTime:setString(CustomActivityUIHelper.getLeftDHMSFormat(endTime))
			return 
	end	

	local timeStr = ""
	if actUnitData:isActInRunTime() then
		self._textTimeTitle:setString(Lang.get("activity_guild_sprint_downtime_title"))
		timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
		-- text = Lang.get("days7activity_act_end_time",{time = timeStr})
	elseif actUnitData:isActInPreviewTime() then
		self._textTimeTitle:setString(Lang.get("activity_guild_sprint_uptime_title"))
		timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getStart_time())
	else
		self._textTimeTitle:setString(Lang.get("activity_guild_sprint_downtime_title"))
		timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getAward_time())
		-- text = Lang.get("days7activity_act_reward_time",{time = timeStr})
	end
	self._textTime:setString(timeStr)
end

function CustomActivityTaskView:_isExchangeAct()
	return self._actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL
end

function CustomActivityTaskView:_getTemplate(data)
	local CustomActivityTaskItemCell = require("app.scene.view.customactivity.CustomActivityTaskItemCell")
	local CustomActivityExchangeItemCell = require("app.scene.view.customactivity.CustomActivityExchangeItemCell")
	local CustomActivityRechargeTaskItemCell = require("app.scene.view.customactivity.CustomActivityRechargeTaskItemCell")
	local CustomActivityYuBiExchangeCell = require("app.scene.view.customactivity.CustomActivityYuBiExchangeCell")
	local CustomActivitySingleRechargeItemCell = require("app.scene.view.customactivity.CustomActivitySingleRechargeItemCell")
	local CustomActivityBuyGoodsItemCell = require("app.scene.view.customactivity.CustomActivityBuyGoodsItemCell") 

	if data and data.actTaskUnitData:getQuest_type() ==  
		CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then
		return CustomActivityBuyGoodsItemCell
	end
	
	if data and data.actTaskUnitData:getQuest_type() ==  
		CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE then
		return CustomActivitySingleRechargeItemCell
	end

	if data and data.actTaskUnitData:getQuest_type() ==  
		CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE then
		return CustomActivityYuBiExchangeCell
	end

	if self:_isExchangeAct() then
		return CustomActivityExchangeItemCell
	elseif  self._actType ==  CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY  then
		
		return CustomActivityRechargeTaskItemCell
	else
		return CustomActivityTaskItemCell	
	end
	return CustomActivityTaskItemCell
end

--@leftTag
--@secondTag:0表示返回所有数据
function CustomActivityTaskView:_getListViewData()
	if not self._listDatas then
		self:_pullListViewData()
	end
	return self._listDatas
end

function CustomActivityTaskView:_getCurrListViewData()
	return self:_getListViewData() or {}
end

function CustomActivityTaskView:_pullListViewData()
	if not self._customActUnitData then
		self._listDatas = {}
	else
		self._listDatas  = G_UserData:getCustomActivity():getShowTaskUnitDataArrById(
			self._customActUnitData:getAct_id()
		)	
	end
end

function CustomActivityTaskView:_initListView(listView)
	
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
end

function CustomActivityTaskView:_refreshListView(listView,listData)
    self._listDatas  = G_UserData:getCustomActivity():getShowTaskUnitDataArrById(
        self._customActUnitData:getAct_id())
    
	listView:setTemplate(self:_getTemplate(listData[1]))--依据具体任务数据决定模板

	local lineCount = #listData
	listView:clearAll()
	listView:resize(lineCount)
	if self._resetListData then
		listView:jumpToTop()
	end
end

--列表道具更新
--@Item:ItemCell
function CustomActivityTaskView:_onItemUpdate(item, index)
	local itemList = self:_getCurrListViewData()--所有的ListView数据
    local itemData = itemList[index +1]
    if itemData then
        item:updateInfo(itemData)
    end
end

--列表道具被选中
function CustomActivityTaskView:_onItemSelected(item, index)
end

--列表道具被触摸
function CustomActivityTaskView:_onItemTouch(index, itemPos)
	logWarn("CustomActivityTaskView:_onItemTouch "..tostring(index).." "..tostring(itemPos))
    local itemList = self:_getCurrListViewData()--所有的ListView数据
	local itemData = itemList[itemPos+1]
	if not itemData then
		return
	end

	if not self._customActUnitData:checkActIsVisible() then
		G_Prompt:showTip(Lang.get("customactivity_tips_already_finish"))	
		return 
	end

    local actTaskUnitData = itemData.actTaskUnitData

	local reachReceiveCondition = G_UserData:getCustomActivity():isTaskReachReceiveCondition(
			actTaskUnitData:getAct_id(),actTaskUnitData:getId())   --  任务是否到达领取次数
	local canReceive = G_UserData:getCustomActivity():isTaskCanReceived(
			actTaskUnitData:getAct_id(),actTaskUnitData:getId())   -- 活动领取条件限制
	--local hasLimit = G_UserData:getCustomActivity():isHasTaskReceiveLimit(actTaskUnitData:getAct_id(),actTaskUnitData:getId())		
	local functionId = self._customActUnitData:getFunctionId()
-- UserDataHelper.getNumByTypeAndValue UserCheck.enoughValue
	if reachReceiveCondition then
		if canReceive then
			if not self:_checkRes(actTaskUnitData) then
				return
			end
			if self:_isSingleGoodExchange(actTaskUnitData) then
				UIPopupHelper.popupExchangeItemsExt(actTaskUnitData)
				return
			end
			-- local receiveOrExchangeFunc = function()
			-- 	if actTaskUnitData:isSelectReward() then--要弹窗，玩家选奖励　
			-- 		self:_showSelectRewarsPopup(actTaskUnitData)
			-- 	elseif self:_checkPkgFull(actTaskUnitData) then
			-- 		G_UserData:getCustomActivity():c2sGetCustomActivityAward(
			-- 			actTaskUnitData:getAct_id(),actTaskUnitData:getId(),nil,nil)
			-- 	end
			-- end
			-- local goldItem = self:_hasGold(actTaskUnitData) 
			-- if goldItem then
			-- 	local hintStr = Lang.get("customactivity_buy_confirm",{count = goldItem.size})
			-- 	UIPopupHelper.popupConfirm(hintStr,receiveOrExchangeFunc)
			-- else
			-- 	receiveOrExchangeFunc()	
			-- end

			if actTaskUnitData:isSelectReward() then--要弹窗，玩家选奖励　
				self:_showSelectRewarsPopup(actTaskUnitData)
				return
			end

			-- 不是以物易物类型  但是条件达成可以兑换了   例如每日充值领取

			if self:_checkPkgFull(actTaskUnitData) then 
				G_UserData:getCustomActivity():c2sGetCustomActivityAward(
			 	actTaskUnitData:getAct_id(),actTaskUnitData:getId(),nil,nil)
			end

		end
	else
		if functionId ~= 0 then
			--要跳转
			local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
			WayFuncDataHelper.gotoModuleByFuncId(functionId )

		elseif actTaskUnitData:getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then
			local payId = actTaskUnitData:getParam2()
			local VipPay = require("app.config.vip_pay")
			local payCfg = VipPay.get(payId)
			assert(payCfg,"vip_pay not find id "..tostring(payId))

			G_GameAgent:pay(payCfg.id, 
				payCfg.rmb, 
				payCfg.product_id, 
				payCfg.name, 
				payCfg.name)			
		end
	end 
  
--[[
  	if canReceive then
	else
		if hasLimit then
		elseif not reachReceiveCondition then
			if functionId ~= 0 then
			else
			end
		end
	end

]]
end

function CustomActivityTaskView:_checkRes(actTaskUnitData)
	local items = actTaskUnitData:getConsumeItems()
	dump(items)
	-- local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local canBuy = true
	for k,v in ipairs(items) do
		canBuy = G_UserData:getCustomActivity():isEnoughValue(v.type,v.value,v.size)
		if not canBuy then
			if actTaskUnitData and actTaskUnitData:getQuest_type() ==  
			   CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE then
				G_Prompt:showTip(Lang.get("common_jade2_not_enough1"))	
			else
				G_Prompt:showTip(Lang.get("common_res_not_enough"))	
			end
			
			return canBuy
		end
	end
	return canBuy
end

function CustomActivityTaskView:_hasGold(actTaskUnitData)
	local items = actTaskUnitData:getConsumeItems()
	for k,v in ipairs(items) do
		if v.type == TypeConvertHelper.TYPE_RESOURCE or v.value == DataConst.RES_DIAMOND  then
			return v
		end
	end
	return nil
end

function CustomActivityTaskView:_isSingleGoodExchange(actTaskUnitData)
	local fixRewards = actTaskUnitData:getRewardItems()
	local hasSelectRewards = actTaskUnitData:isSelectReward()
	return  self:_isExchangeAct() and (not hasSelectRewards)
end

function CustomActivityTaskView:_checkPkgFull(actTaskUnitData,index)
	local rewards = actTaskUnitData:getRewardItems()
	local selectRewards = actTaskUnitData:getSelectRewardItems()
	if selectRewards and selectRewards[index] then
		local newRewards = {}
		for k,v in ipairs(rewards) do
			table.insert( newRewards, v)
		end
		table.insert( newRewards, selectRewards[index])
		rewards = newRewards
	end
	local UserCheck = require("app.utils.logic.UserCheck")
	local full = UserCheck.checkPackFullByAwards(rewards)
	return  not full
end





function CustomActivityTaskView:_showSelectRewarsPopup(actTaskUnitData)
	local function callBackFunction(awardItem, index, total)
		local function confirmFunction()
			if awardItem == nil then
				G_Prompt:showTip(Lang.get("recruit_choose_first"))
				return true
			end
			if not self:_checkPkgFull(actTaskUnitData,index) then
				return
			end
			local rewardIndex = index

			
			if  G_UserData:getCustomActivity():isActivityExpiredById(actTaskUnitData:getAct_id()) then
				G_Prompt:showTip(Lang.get("customactivity_tips_already_finish"))	
				return 
			end
			G_UserData:getCustomActivity():c2sGetCustomActivityAward(
							actTaskUnitData:getAct_id(),actTaskUnitData:getId(),rewardIndex, total)
		end
		local goldItem = self:_hasGold(actTaskUnitData) 
		if goldItem then
			local hintStr = Lang.get("customactivity_buy_confirm",{count = goldItem.size})
			UIPopupHelper.popupConfirm(hintStr,confirmFunction)
		else
			confirmFunction()
		end
	end
    local awardItems = actTaskUnitData:getSelectRewardItems()
    if CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL == actTaskUnitData:getActType() then
        local maxValue, _, _ = actTaskUnitData:getProgressValue()
        local goldItem = self:_hasGold(actTaskUnitData) 
        if goldItem then
            local resourceNum = UserDataHelper.getNumByTypeAndValue(goldItem.type, goldItem.value)
            maxValue = goldItem.size == 0 and 0 or math.min(math.floor(resourceNum/goldItem.size), maxValue)   
        else
            local items = actTaskUnitData:getConsumeItems()
            for i,v in ipairs(items) do
                local itemNum = UserDataHelper.getNumByTypeAndValue(v.type, v.value)
                maxValue = math.min(itemNum, maxValue)
            end
        end
        local PopupSelectRewardNum = require("app.ui.PopupSelectRewardNum").new(Lang.get("popup_title_select_reward"), callBackFunction)
        PopupSelectRewardNum:updateUI(awardItems)
        PopupSelectRewardNum:setMaxLimit(maxValue)
        PopupSelectRewardNum:openWithAction()
    else
        local PopupSelectReward = require("app.ui.PopupSelectReward").new(Lang.get("days7activity_receive_popup"),callBackFunction)
        PopupSelectReward:setTip(Lang.get("days7activity_receive_popup_tip"))
        PopupSelectReward:updateUI(awardItems)
        PopupSelectReward:openWithAction()
    end
end

function CustomActivityTaskView:_refreshListData()
	if not self._resetListData and self._listDatas then
		G_UserData:getCustomActivity():refreshShowTaskData(self._listDatas)
	else
		self._listDatas = nil
		local listViewData = self:_getListViewData()
	end
	
	
	self:_refreshListView(self._listItemSource ,self._listDatas)
end

function CustomActivityTaskView:_refreshDes()
	if not self._customActUnitData then
		return 
	end
	self._textActTitle:setString(self._customActUnitData:getSub_title())
	--self._textActDes:setString(self._customActUnitData:getDesc())

	self:_createProgressRichText(self._customActUnitData:getDesc())
end

function CustomActivityTaskView:_createProgressRichText(msg)
	local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
	local RichTextHelper = require("app.utils.RichTextHelper")
	local richMsg =  json.encode(CustomActivityUIHelper.getRichMsgListForHashText(
				msg,Colors.CUSTOM_ACT_DES_HILIGHT,nil,Colors.CUSTOM_ACT_DES,nil, 18))
	self._textNode:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richMsg)
    widget:setAnchorPoint(cc.p(0,1))
	widget:ignoreContentAdaptWithSize(false)
	widget:setContentSize(cc.size(450,0))--高度0则高度自适应
    self._textNode:addChild(widget)
end


function CustomActivityTaskView:_refreshData()
	self:_refreshDes()
	self:_refreshListData()
	if self._customActUnitData then
		self:_refreshActTime(self._customActUnitData)
	end

end

function CustomActivityTaskView:refreshView(customActUnitData,resetListData)
	local oldCustomActUnitData = self._customActUnitData
	self._customActUnitData = customActUnitData 

	if not oldCustomActUnitData then
		self._resetListData = true
	elseif  customActUnitData and oldCustomActUnitData:getAct_id() ~= customActUnitData:getAct_id()  then
		self._resetListData = true
	else
		if  resetListData == nil then
			self._resetListData = true
		else
			self._resetListData = resetListData
		end
	end
	self:_refreshData(resetData)
end

return CustomActivityTaskView
