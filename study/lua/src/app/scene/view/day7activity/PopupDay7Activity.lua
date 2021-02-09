local PopupBase = require("app.ui.PopupBase")
local ViewBase = require("app.ui.ViewBase")
local Day7ActivityItemCell = import(".Day7ActivityItemCell")
local TabButtonGroup = require("app.utils.TabButtonGroup")
local Day7ActivityConst = require("app.const.Day7ActivityConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local UIHelper = require("yoka.utils.UIHelper")
local Day7ActivityDiscountView = import(".Day7ActivityDiscountView")
local PopupDay7Activity = class("PopupDay7Activity", PopupBase)


PopupDay7Activity.MAIN_TAB_SEVEN_DAY_POS = { x = 84.56, y = 43.31}--最后一天TAB名字的位置
PopupDay7Activity.HERO_SHOW_INTERVAL = 3--英雄展示间隔，单位秒

function PopupDay7Activity:ctor()
    --数据
    self._selectedFirstTabIndex = -1
	self._selectedSecondTabIndex = -1
	self._mainTabGroupData = nil
	self._listDatas = {}
	self._currListData = nil
	self._refreshHandler = nil
    --节点
    self._imageBg = nil
	self._nodeLeftTabRoot = nil
	self._listItemSource = nil
	self._nodeDiscount = nil
    self._textActEndTime = nil
	self._textTime = nil
	self._imageListBg = nil--list图片背景


	self._day7ActDiscountNode = nil--折扣节点辅助类
	self._commonTabGroupHorizon = nil
	self._leftTabGroupItemData = nil
	self._finishTags = {}
	-- self._showHeroTime = 0
	-- self._showHeroPageView = nil
	local resource = {
		file = Path.getCSB("PopupDay7Activity", "day7activity"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			},
		},
	}
	PopupDay7Activity.super.ctor(self, resource)
end


function PopupDay7Activity:onCreate()
    self:_initData()
	self:_initListView(self._listItemSource)

	self:_initMainTabGroup()


end


function PopupDay7Activity:onEnter()
	self._signalDay7ActGetInfo = G_SignalManager:add(SignalConst.EVENT_DAY7_ACT_GET_INFO, handler(self, self._onEventDay7ActGetInfo))
	self._signalDay7ActUpdateProgress = G_SignalManager:add(SignalConst.EVENT_DAY7_ACT_UPDATE_PROGRESS, handler(self, self._onEventDay7ActUpdateProgress))
	self._signalDay7ActGetTaskReward = G_SignalManager:add(SignalConst.EVENT_DAY7_ACT_GET_TASK_REWARD, handler(self, self._onEventDay7ActGetTaskReward))
	self._signalDay7ActGetBuyDiscountShop = G_SignalManager:add(SignalConst.EVENT_DAY7_ACT_GET_BUY_DISCOUNT_SHOP,
	 handler(self, self._onEventDay7ActGetBuyDiscountShop))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))

	if G_UserData:getDay7Activity():isExpired() then
		G_UserData:getDay7Activity():pullData()
	end

	self:_refreshActTime()

	self._mainTabGroupData = self:_makeMainTabGroupData()--重取页签数据
	self:_initMainTabGroup()--刷新页签
	local currDay = G_UserData:getDay7Activity():getCurrent_day()
	if currDay > 0 then
		self._selectedFirstTabIndex = -1--设置-1重新刷新
		if currDay <= Day7ActivityConst.DAY_NUM then--G_UserData:getDay7Activity():isInActRunTime()
			self:_setTabIndex(currDay)
		else
			self:_setTabIndex(Day7ActivityConst.DAY_NUM)
		end
	end
	self:_startRefreshHandler()
	self:_refreshFinishTag()
end

function PopupDay7Activity:onExit()
	self._signalDay7ActGetInfo:remove()
	self._signalDay7ActGetInfo = nil
    self._signalDay7ActUpdateProgress:remove()
	self._signalDay7ActUpdateProgress = nil
    self._signalDay7ActGetTaskReward:remove()
	self._signalDay7ActGetTaskReward = nil
    self._signalDay7ActGetBuyDiscountShop:remove()
	self._signalDay7ActGetBuyDiscountShop = nil
	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil
	self:_endRefreshHandler()
end

function PopupDay7Activity:_refreshRedPoint()
	self:_refreshTabGroupRedPoint()
	self:_refreshSubTabGroupRedPoint()
end

function PopupDay7Activity:_refreshTabGroupRedPoint()
	local tabDataList = self:_getMainTabGroupData()
	for k,v in ipairs(tabDataList) do
		local redPointShow = G_UserData:getDay7Activity():hasRedPoint({day = v})
		logWarn(k.."------------------------"..tostring(redPointShow))
		self:setRedPointByTabIndex(k,redPointShow)
	end
end

function PopupDay7Activity:_refreshSubTabGroupRedPoint()
	local day = self._selectedFirstTabIndex
	if day <= 0 then
		return
	end
    local tabList = G_UserData:getDay7Activity():getTabListByDay(day)
	for k,v in ipairs(tabList) do
		local redPointShow = G_UserData:getDay7Activity():hasRedPoint(v)
		self._commonTabGroupHorizon :setRedPointByTabIndex(k,redPointShow)
	end
end


function PopupDay7Activity:_onEventRedPointUpdate(event,funcId,param)
	if funcId ~=  FunctionConst.FUNC_WEEK_ACTIVITY then
		return
	end
	if not param or type(param) ~= 'table' then
		return
	end
	self:_refreshRedPoint()
end

function PopupDay7Activity:_startRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function PopupDay7Activity:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function PopupDay7Activity:_onRefreshTick(dt)
	self:_refreshActTime()
	-- self._showHeroTime = self._showHeroTime + dt
	-- if self._showHeroTime > PopupDay7Activity.HERO_SHOW_INTERVAL then
	-- 	self._showHeroTime = 0
	-- 	--切换英雄
	-- 	local currPageIndex = self._showHeroPageView:getCurrentPageIndex()
	-- 	local pages = self._showHeroPageView:getItems()
	-- 	local pageNum  = #pages
	-- 	if currPageIndex < pageNum -1 then
	-- 		self._showHeroPageView:scrollToPage(currPageIndex + 1)
	-- 	else
	-- 		self._showHeroPageView:setCurrentPageIndex(0)
	-- 		self._showHeroPageView:scrollToPage(1)
	-- 	end
	-- end

end


function PopupDay7Activity:_onEventDay7ActGetInfo(event,id,message)
	self:_refreshActTime()

	if self._selectedFirstTabIndex == -1 then
		if G_UserData:getDay7Activity():isInActRunTime() then
			self:_setTabIndex(G_UserData:getDay7Activity():getCurrent_day() )
		else
			self:_setTabIndex(Day7ActivityConst.DAY_NUM)
		end
	else
		self:_refreshListData()
	end

end

function PopupDay7Activity:_onEventDay7ActUpdateProgress(event,id,message)
    self:_refreshListData()
end

function PopupDay7Activity:_onEventDay7ActGetTaskReward(event,id,message)
    self:_showRewards(message)
end


function PopupDay7Activity:_onEventDay7ActGetBuyDiscountShop(event,id,message)
	self:_refreshListData()

    self:_showRewards(message)
end


function PopupDay7Activity:_showRewards(message)
    local awards = rawget(message, "awards")
	if awards then
		local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		PopupGetRewards:showRewards(awards)

	end
end

function PopupDay7Activity:_onClickClose(sender)
    self:close()
end

function PopupDay7Activity:_initData()
	self._selectedFirstTabIndex = -1
	self._selectedSecondTabIndex = -1

	self._mainTabGroupData = {}
	self._listDatas = {}
    self._nodeDiscount:removeAllChildren()
	self._day7ActDiscountNode =  Day7ActivityDiscountView.new()
    self._nodeDiscount:addChild(self._day7ActDiscountNode)
end

function PopupDay7Activity:_s2cBuyShopGoods(id, message)
end

function PopupDay7Activity:_onTabSelect(index)
	local show = G_UserData:getDay7Activity():isDayCanReceive(index)
	if not show then
		G_Prompt:showTip(Lang.get("days7activity_act_open_tip",{day = index}))
		return false
	end
	self:_selectMainTab(index)

	return true
end

function PopupDay7Activity:_onSecondTabSelect(index, sender)
	self:_selectSubTag(index)
	self:_updateFinishTagView()
end

--刷新左侧标签的内容
function PopupDay7Activity:_refreshMainTagContent()
	self._listDatas = {}

	local oldTabData = self:_getMainTabData(self._selectedFirstTabIndex)--刷新前选中的页签数据
	self._mainTabGroupData =  self:_makeMainTabGroupData()--重取页签数据
	self:_initMainTabGroup()--刷新页签

	local newSelectIndex = self:_seekTabIndexByTabData(oldTabData)--旧页签数据在新数据中的索引
	local isResetTabIndex = newSelectIndex == 0 ---旧页签数据在新数据中找不到
	if isResetTabIndex then
		self._selectedFirstTabIndex = -1
		self:_setTabIndex(1)
	else
		if newSelectIndex ~= self._selectedFirstTabIndex then
			self:_setTabIndex(newSelectIndex)
		else
			self:_refreshListData()
		end
	end
end

function PopupDay7Activity:setRedPointByTabIndex(k,show)
   local itemData = self._leftTabGroupItemData[k]
   if itemData.redPoint then
      itemData.redPoint:setVisible(show)
   else
   		local UICreateHelper = require("app.utils.UICreateHelper")
        UICreateHelper.showRedPoint(itemData.panelWiget,show,cc.p(0.85,0.8))
   end
end

function PopupDay7Activity:_refreshTabItem(itemData,bright)
	if itemData.index ~= Day7ActivityConst.DAY_NUM then
		itemData.imageNormal:setVisible(not bright)
		itemData.imageDown:setVisible(bright)
        if itemData.text then
            itemData.text:setColor(bright and Colors.DAY7_TAB_BRIGHT or Colors.DAY7_TAB_NORMAL)
            -- itemData.text:enableOutline(bright and Colors.DAY7_TAB_BRIGHT_OUTLINE or Colors.DAY7_TAB_NORMAL_OUTLINE, 2)
        end
	else
        if itemData.text then
            itemData.text:setColor(Colors.DAY7_TAB_BRIGHT)
            itemData.text:enableOutline(Colors.DAY7_TAB_BRIGHT_OUTLINE, 2)
        end
	end

end



function PopupDay7Activity:_setTabIndex(index)
	if not self._leftTabGroupItemData then
		return false
	end
	local itemData = self._leftTabGroupItemData[index]
	if not itemData then
		return false
	end
	local oldIndex = self._selectedFirstTabIndex
	local success = self:_onTabSelect(index)
	if success then
		for k,itemData in ipairs(self._leftTabGroupItemData) do
			if k ~= index then self:_refreshTabItem(itemData,false) end
		end
		self:_refreshTabItem(itemData,true)
	end
	return success
end

function PopupDay7Activity:_onTabClick(sender)
	local index = sender:getTag()
	self:_setTabIndex(index)
end

--刷新主标签TagGroup
function PopupDay7Activity:_initMainTabGroup()
	if not self._leftTabGroupItemData then
		self._leftTabGroupItemData = {}
		local names = Lang.get("days7activity_tab_names")
		local children = self._nodeLeftTabRoot:getChildren()
		for k,instNode in ipairs(children) do
			local itemData = {index = k,panelWiget = instNode}
			if k ~= Day7ActivityConst.DAY_NUM then
				itemData.imageNormal = ccui.Helper:seekNodeByName(instNode, "Image_normal")
				itemData.imageDown = ccui.Helper:seekNodeByName(instNode, "Image_down")
				itemData.text = ccui.Helper:seekNodeByName(instNode, "Text")
				itemData.finishTag = ccui.Helper:seekNodeByName(instNode, "FinishTag")
                if itemData.text then
    				itemData.text:setString(names[k])
                end
				itemData.imageNormal:setTag(k)
				itemData.imageDown:setTag(k)
				itemData.imageNormal:addClickEventListenerEx(handler(self,self._onTabClick))
				itemData.imageDown:addClickEventListenerEx(handler(self,self._onTabClick))
				itemData.redPoint = ccui.Helper:seekNodeByName(instNode, "redPoint")
			else
				itemData.imageBg = ccui.Helper:seekNodeByName(instNode, "Image_bg")
				-- itemData.pageView = ccui.Helper:seekNodeByName(instNode, "PageView")
				itemData.redPoint = ccui.Helper:seekNodeByName(instNode, "redPoint")
				itemData.text = ccui.Helper:seekNodeByName(instNode, "Text")
				itemData.imageBg:setTag(k)
				itemData.imageBg:addClickEventListenerEx(handler(self,self._onTabClick))
				itemData.finishTag = ccui.Helper:seekNodeByName(instNode, "FinishTag")
				-- self:_initHeroPageView(itemData.pageView)
			end
			self:_refreshTabItem(itemData,false)
			table.insert( self._leftTabGroupItemData, itemData )
		end
	end

	self:_refreshTabGroupRedPoint()
end


-- function PopupDay7Activity:_initHeroPageView(pageView)
-- 	local CSHelper  = require("yoka.utils.CSHelper")
-- 	local showHeroIds = G_UserData:getDay7Activity():getShowHeroIds()
-- 	table.insert(showHeroIds,1,showHeroIds[#showHeroIds])--用来循环播放
-- 	for k,heroBaseId in ipairs(showHeroIds) do
-- 		local widget = ccui.Widget:create()
-- 		local commonHeroAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
-- 		commonHeroAvatar:updateUI(heroBaseId)
-- 		commonHeroAvatar:setScale(0.5)
-- 		local size = pageView:getContentSize()
-- 		widget:setContentSize(size)
-- 		widget:addChild(commonHeroAvatar)
-- 		commonHeroAvatar:setPosition(size.width * 0.5,0)
-- 		pageView:addPage(widget)
-- 	end
-- 	pageView:setCurrentPageIndex(1)
-- 	self._showHeroPageView = pageView
-- end
function PopupDay7Activity:_initSecondTabGroup(textList)
	local param = {
		offset   = 0,
		isVertical = 2,
		callback = handler(self, self._onSecondTabSelect),
		textList = textList or {},
	}

	self._commonTabGroupHorizon :recreateTabs(param)

	self:_refreshSubTabGroupRedPoint()
end

--通过标签数据查找标签索引
--@return:查找不到返回0
function PopupDay7Activity:_seekTabIndexByTabData(tabData)
	if not tabData then
		return 0
	end
	local actListData = self:_getMainTabGroupData()
	for k,v in ipairs(actListData) do
		if v == tabData then
			return k
		end
	end
	return 0
end

function PopupDay7Activity:_makeMainTabGroupData()
	return {1,2,3,4,5,6,7}
end

function PopupDay7Activity:_getMainTabGroupData()
	return self._mainTabGroupData
end


--@tabIndex :nil 默认当前页签
function PopupDay7Activity:_getMainTabData(tabIndex)
	local mainTabGroupData = self:_getMainTabGroupData()
	if not mainTabGroupData then
		return nil
	end
	if not tabIndex then
		tabIndex = self._selectedFirstTabIndex
	end
	if tabIndex < 0 then
		return nil
	end
	return mainTabGroupData[tabIndex]
end

--@leftTag
--@secondTag:0表示返回所有数据
function PopupDay7Activity:_getListViewData(leftTag,secondTag)
	if leftTag == -1 or secondTag == -1 then
		return nil
	end
	if not self._listDatas[leftTag] then
		self._listDatas[leftTag] = {}
	end
	if not self._listDatas[leftTag][secondTag] then
		self:_pullListViewData(leftTag,secondTag)
	end
	return self._listDatas[leftTag][secondTag] or {}
end

function PopupDay7Activity:_getCurrListViewData()
	return self:_getListViewData(self._selectedFirstTabIndex, self._selectedSecondTabIndex )
end

function PopupDay7Activity:_pullListViewData(leftTag,secondTag)
	--标签转换成可识别shopId
	local day =  self:_getMainTabData(leftTag)
	assert(day,"handle a unknow leftTag:"..tostring(leftTag))
	--从数据类取数据
	local shopListData =  G_UserData:getDay7Activity():getActUnitDataList(leftTag,secondTag)
	self._listDatas[leftTag][secondTag] = shopListData
end

function PopupDay7Activity:_initListView(listView)
	listView:setTemplate(Day7ActivityItemCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupDay7Activity:_refreshListView(listView,listData)
	self._currListData = listData
	local lineCount = #listData
	listView:clearAll()
	listView:resize(lineCount)
	listView:jumpToTop()
end

--列表道具更新
--@Item:Day7ActivityItemCell
function PopupDay7Activity:_onItemUpdate(item, index)
	if not self._currListData then
		return
	end

	local itemList = self._currListData
	--[[
	local itemList = self:_getCurrListViewData()--所有的ListView数据
]]
    local itemData = itemList[index +1]

    if itemData then
        item:updateInfo(itemData)
    end
end

--列表道具被选中
function PopupDay7Activity:_onItemSelected(item, index)
end

--列表道具被触摸
function PopupDay7Activity:_onItemTouch(index, itemPos)
	logWarn("PopupDay7Activity:_onItemTouch "..tostring(index).." "..tostring(itemPos))
    local itemList = self:_getCurrListViewData()--所有的ListView数据
    local actTaskUnitData = itemList[itemPos+1]
    if actTaskUnitData then
		local reachReceiveCondition = G_UserData:getDay7Activity():isTaskReachReceiveCondition(actTaskUnitData:getId())
    	local canReceive = G_UserData:getDay7Activity():isTaskCanReceived(actTaskUnitData:getId())

        local cfg = actTaskUnitData:getConfig()
        if reachReceiveCondition then
			if canReceive then
				--可领取
				--要弹窗，玩家选奖励　
				local rewardType = actTaskUnitData:getConfig().reward_type
				if rewardType == Day7ActivityConst.REWARD_TYPE_ALL and self:_checkPack(actTaskUnitData) then
					G_UserData:getDay7Activity():c2sSevenDaysReward(actTaskUnitData:getId(),nil)
				elseif rewardType == Day7ActivityConst.REWARD_TYPE_SELECT then
					self:_showSelectRewarsPopup(actTaskUnitData)
				end
			end
		else
			if cfg.function_id ~= 0 then
				--要跳转
				logWarn("PopupDay7Activity:function skip "..tostring(cfg.function_id))
				local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
				WayFuncDataHelper.gotoModuleByFuncId(cfg.function_id )
			end
		end
    end
end

function PopupDay7Activity:_checkPack(actTaskUnitData,index)
	local rewards = actTaskUnitData:getRewards()
	local oneReward = rewards[index]
	rewards = oneReward and {oneReward} or rewards
	local UserCheck = require("app.utils.logic.UserCheck")
	local full = UserCheck.checkPackFullByAwards(rewards)
	return  not full
end


function PopupDay7Activity:_showSelectRewarsPopup(actTaskUnitData)
	local function callBackFunction(awardItem, index)
		if awardItem == nil then
			G_Prompt:showTip(Lang.get("common_choose_item"))
			return true
		end
		if not self:_checkPack(actTaskUnitData,index)  then
			return
		end
		local rewardIndex = index
		G_UserData:getDay7Activity():c2sSevenDaysReward(actTaskUnitData:getId(),rewardIndex)
		return false
	end
	local awardItems = actTaskUnitData:getRewards()
	local PopupSelectReward = require("app.ui.PopupSelectReward").new(Lang.get("days7activity_receive_popup"),callBackFunction)
	PopupSelectReward:setTip(Lang.get("days7activity_receive_popup_tip"))
	PopupSelectReward:updateUI(awardItems)
	PopupSelectReward:openWithAction()
end

function PopupDay7Activity:_selectMainTab(tagIndex)
	if self._selectedFirstTabIndex == tagIndex then
		return
	end
	self._selectedFirstTabIndex = tagIndex

	self:_refreshSubTabGroup()
	--切换时二级页签不变
	local secondTabIndex = self._selectedSecondTabIndex
	self._selectedSecondTabIndex = -1
	secondTabIndex = math.max(secondTabIndex,1)
	secondTabIndex = secondTabIndex > self._commonTabGroupHorizon :getTabCount() and 1 or secondTabIndex
	if self._commonTabGroupHorizon :getTabCount() > 0 then
		self._commonTabGroupHorizon :setVisible(true)
		self._commonTabGroupHorizon :setTabIndex(secondTabIndex)
	else
	   	self._commonTabGroupHorizon :setVisible(false)
	end
	--local day = self:_getMainTabData()
	--local picName = Path.getDay7ActivityRes(Day7ActivityConst.BG_IMG_ARR[day])
	--self._imageBg:loadTexture(picName)
end

--刷新商店子标签
function PopupDay7Activity:_refreshSubTabGroup()
	local day = self:_getMainTabData()
    local tabList = G_UserData:getDay7Activity():getTabListByDay(day)
    local makeTabNames = function(tabList)
        local textList = {}
        for k,v in ipairs(tabList) do
            table.insert( textList, v.name)
        end
        return textList
    end
    local textList = makeTabNames(tabList)


	self:_initSecondTabGroup(textList)
end


function PopupDay7Activity:_selectSubTag(tagIndex)
	--刷新列表
	if self._selectedSecondTabIndex == tagIndex then
		return
	end
	self._selectedSecondTabIndex = tagIndex

    local tabData = G_UserData:getDay7Activity():getTabData(self._selectedFirstTabIndex ,self._selectedSecondTabIndex)

    if tabData.type ==  Day7ActivityConst.TAB_TYPE_TASK then
        self._listItemSource:setVisible(true)
	    self._day7ActDiscountNode:setVisible(false)

        local listViewData = self:_getListViewData(self._selectedFirstTabIndex ,self._selectedSecondTabIndex)
	    self:_refreshListView(self._listItemSource ,listViewData)
    elseif tabData.type ==  Day7ActivityConst.TAB_TYPE_DISCOUNT then
        self._listItemSource:setVisible(false)
	    self._day7ActDiscountNode:setVisible(true)

        local listViewData = self:_getListViewData(self._selectedFirstTabIndex ,self._selectedSecondTabIndex)
	    self._day7ActDiscountNode:refreshDiscountView(listViewData[1])
    end
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
		FunctionConst.FUNC_WEEK_ACTIVITY,{day = self._selectedFirstTabIndex ,sheet = self._selectedSecondTabIndex})
end

function PopupDay7Activity:_onClickBtn(sender)
    local id = sender:getTag()
  	--判断资源是否满足
	local listViewData = self:_getCurrListViewData()
	local data = listViewData[1]
	assert(data,"PopupDay7Activity buy discount item fail")
	local success, popFunc = LogicCheckHelper.enoughCash(data.gold_price)
	if success then
		G_UserData:getDay7Activity():c2sSevenDaysShop(id)
	else
		popFunc()
	end
end

function PopupDay7Activity:_refreshListData()
	--数据变更
	self._listDatas = {}
	--考虑标签没有情况
	local currSecondTagIndex = self._selectedSecondTabIndex
	self._selectedSecondTabIndex = -1
	if self._selectedFirstTabIndex ~= -1 and currSecondTagIndex ~= -1 then
		self:_selectSubTag(currSecondTagIndex)
	end
	self:_refreshFinishTag()
end

function PopupDay7Activity:refreshData()
	self:_refreshMainTagContent()
	self:_refreshActTime()

end

function PopupDay7Activity:_refreshActTime()
	if not G_UserData:getDay7Activity():isHasData() then
		self._textTime:setVisible(false)
		self._imageActivityEnd:setVisible(false)
		return
	end

	local text = ""
	if G_UserData:getDay7Activity():isInActRunTime() then
		local timeStr = G_ServerTime:getLeftDHMSFormatEx(G_UserData:getDay7Activity():getActEndTime())
		text = Lang.get("days7activity_act_end_time",{time = timeStr})
		self._imageActivityEnd:setVisible(false)
	else
		local timeStr = G_ServerTime:getLeftDHMSFormatEx(G_UserData:getDay7Activity():getActRewardEndTime())
		text = Lang.get("days7activity_act_reward_time",{time = timeStr})
		self._imageActivityEnd:setVisible(true)
	end
	self._textTime:setVisible(true)
	self._textTime:setString(text)
end

function PopupDay7Activity:_refreshFinishTag()
	local function isFinish(firstTabInde, secondTabInde)
		local tabData = G_UserData:getDay7Activity():getTabData(firstTabInde ,secondTabInde)
		local listViewData = self:_getListViewData(firstTabInde ,secondTabInde)
		if tabData and listViewData then
			if tabData.type ==  Day7ActivityConst.TAB_TYPE_TASK then
				local isAllFinish = true
				--判断每个cell 是否都领取了
				for _, unitData in ipairs(listViewData) do
					local hasReceived =  G_UserData:getDay7Activity():isTaskReceivedReward(unitData:getId())
					if not hasReceived then
						isAllFinish = false
						break
					end
				end
				return isAllFinish

			elseif tabData.type ==  Day7ActivityConst.TAB_TYPE_DISCOUNT then
				local unitData = listViewData[1]
				local reachBuyCondition = G_UserData:getDay7Activity():isShopDiscountReachBuyCondition(unitData.id)
				local canBuy = G_UserData:getDay7Activity():isShopDiscountCanBuy(unitData.id)
				if reachBuyCondition and not canBuy then
					return true
				end
			end
		end
		return false
	end
	--刷新数据
	for k, _ in ipairs(self._leftTabGroupItemData) do
		if not self._finishTags[k] then
			self._finishTags[k] = {}
			self._finishTags[k].children = {}
			self._finishTags[k].isAllFinish = false
		end
		local children = self._finishTags[k].children
		-- 如果没有全部完成  每次数据变化 需要 更新数据
		if not self._finishTags[k].isAllFinish then
			local show = G_UserData:getDay7Activity():isDayCanReceive(k)
			if show then
				local tabList = G_UserData:getDay7Activity():getTabListByDay(k) or {}
				for j, _ in ipairs(tabList) do
					if not children[j] then
						--获取每个子项数据
						children[j] = isFinish(k, j)
					end
				end
				local isAllFinish = true
				for _, v in pairs(children) do
					if not v then
						isAllFinish = false
						break
					end
				end
				self._finishTags[k].isAllFinish = isAllFinish
			end

		end
	end
	--刷新界面
	self:_updateFinishTagView()
end

function PopupDay7Activity:_updateFinishTagView()
	for k, v in ipairs(self._finishTags) do
		local itemData = self._leftTabGroupItemData[k]
		print( itemData, itemData.finishTag)
		if itemData and itemData.finishTag then
			itemData.finishTag:setVisible(v.isAllFinish)
		end
		if self._selectedFirstTabIndex == k then
			for i, j in ipairs(v.children)do
				if j then
					self._commonTabGroupHorizon :addCustomTag(i, {texture = Path.getTextSignet("txt_7day_done"), position = cc.p(121, 43)})
				else
					self._commonTabGroupHorizon :removeCustomTag(i)
				end
			end
		end
	end
end

return PopupDay7Activity
