--@Author:Conley
local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local DailySigninItemCell = import(".DailySigninItemCell")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local ActivityConst = require("app.const.ActivityConst")
local DailySigninView = class("DailySigninView", ActivitySubView)


function DailySigninView:ctor(mainView,activityId)
	self._mainView = mainView
	self._activityId = activityId
	self._richTextNode = nil--富文本父节点
	self._textTitle = nil--标题
	self._listView = nil
	self._scrollView = nil
	self._listDatas = nil
	self._todaySignUnitData = nil--当天的签到数据
	self._todayItemNode = nil--当天的签到节点
    local resource = {
        file = Path.getCSB("DailySigninView", "activity/dailysignin"),
        binding = {

		}
    }
    DailySigninView.super.ctor(self, resource)
end

function DailySigninView:_pullData()
	local hasActivityServerData = G_UserData:getActivity():hasActivityData(self._activityId)
	if not hasActivityServerData  then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end
	return hasActivityServerData
end

function DailySigninView:onCreate()
	self:_initListView(self._listView)
end

function DailySigninView:onEnter()
	self._signalWelfareSigninGetInfo = G_SignalManager:add(SignalConst.EVENT_WELFARE_SIGNIN_GET_INFO, handler(self, self._onEventWelfareSigninGetInfo))
    self._signalWelfareSigninDoSignin = G_SignalManager:add(SignalConst.EVENT_WELFARE_SIGNIN_DO_SIGNIN, handler(self, self._onEventWelfareSigninDoSignin))

	local hasServerData = self:_pullData()
	if hasServerData and G_UserData:getActivityDailySignin():isExpired() then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end

	if hasServerData then
		self:refreshData()
	end
end

function DailySigninView:onExit()
	self._signalWelfareSigninGetInfo:remove()
	self._signalWelfareSigninGetInfo = nil
	self._signalWelfareSigninDoSignin:remove()
	self._signalWelfareSigninDoSignin = nil
end

function DailySigninView:enterModule()
	
end

function DailySigninView:_onEventWelfareSigninGetInfo(event,id,message)
	self:refreshData()
end

function DailySigninView:_onEventWelfareSigninDoSignin(event,id,message)
	self:_refreshTotalSigninDayView()
	self:_refreshItemNodeByIndex(message.day+1)
	self:_onShowRewardItems(message)

	self:_refreshTodaySignUnitData()
end

function DailySigninView:_initListView(listView)
	listView:setTemplate(DailySigninItemCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected),
		handler(self, self._scrollEvent))
	listView:setCustomCallback(handler(self, self._onItemTouch))
end



function DailySigninView:_refreshListView(listView,itemList)
	local lineCount = math.ceil( #itemList /DailySigninItemCell.LINE_ITEM_NUM  )
	listView:clearAll()
	listView:resize(lineCount)
	--
end

function DailySigninView:_refreshItemNodeByIndex(index)
	local itemNode = self:_findItemNodeByIndex(index)
	if itemNode then
		local dailySigninUnitData = self._listDatas[index]
		itemNode:updateInfo(dailySigninUnitData)
	end
end

function DailySigninView:_findItemNodeByIndex(index)
	local lineIndex = math.ceil(index / DailySigninItemCell.LINE_ITEM_NUM )
	local items = self._listView:getItems()
	if not items then
		return nil
	end
	local itemCellNode = nil
	for k,v in ipairs(items) do
		if v:getTag() + 1 == lineIndex then
			itemCellNode = v
		end
	end
	if not itemCellNode then
		return nil
	end
	local secondIndex = index - (lineIndex-1) * DailySigninItemCell.LINE_ITEM_NUM
	return itemCellNode:getItemNodeByIndex(secondIndex)
end

function DailySigninView:_getListDatas()
	return  self._listDatas
end

function DailySigninView:_scrollEvent(sender,eventType)
	if eventType == ccui.ScrollviewEventType.containerMoved then
		self:_refreshLightZorder()
	end
end

function DailySigninView:_refreshLightZorder()
	local signUnitData = self._todaySignUnitData
	if not signUnitData then
		return
	end

	local item = self._todayItemNode
	if not item then
		item = self:_findItemNodeByIndex(signUnitData:getDay())
		self._todayItemNode  = item
	end
	if  self:_isItemInListView(item,self._listView) then
		item:setLightEffectGlobalZorder(1)
	else
		item:setLightEffectGlobalZorder(0)
	end
end

function DailySigninView:_isItemInListView(item,listView)
	local size = {width = 131,height = 123}--item:getContentSize()
	local listSize = listView:getContentSize()
	local worldPos = item:getParent():convertToWorldSpaceAR(cc.p(item:getPosition()))
	local viewPos = listView:convertToNodeSpaceAR(cc.p(worldPos))
	viewPos.y = viewPos.y - size.height * 0.5
	if viewPos.y < -1 or viewPos.y + size.height > listSize.height + 1 then
		return false
	end
	return true
end

function DailySigninView:_onItemUpdate(item, index)
	local startIndex = index * DailySigninItemCell.LINE_ITEM_NUM  + 1
	logWarn("DailySigninView:_onItemUpdate  "..startIndex)
	local endIndex = startIndex + DailySigninItemCell.LINE_ITEM_NUM  -1
	local itemLine = {}
	local itemList = self:_getListDatas()
	if #itemList > 0 then
		for i = startIndex, endIndex do
			local itemData = itemList[i]
			if itemData then
				table.insert(itemLine, itemData)
			end
		end
		item:updateUI(index,itemLine)
	end
end

function DailySigninView:_onItemSelected(item, index)
	logWarn("DailySigninView:_onItemSelected ")
end

function DailySigninView:_onItemTouch(index, itemPos)
	logWarn("DailySigninView:_onItemTouch "..tostring(index).." "..tostring(itemPos))
	local data = self._listDatas[itemPos]
	local ActivityDataHelper = require("app.utils.data.ActivityDataHelper")
	if data:getState() == ActivityConst.CHECKIN_STATE_RIGHT_TIME and
		ActivityDataHelper.checkPackBeforeGetActReward(data) then
		G_UserData:getActivityDailySignin():c2sActCheckin()
	elseif data:getState() == ActivityConst.CHECKIN_STATE_OVER_TIME and
		ActivityDataHelper.checkPackBeforeGetActReward(data) then
		local needGold = G_UserData:getActivityDailySignin():getReSigninCostGold()
		local warnText = Lang.get("lang_activity_dailysign_resignin_warn",{gold = needGold})
		UIPopupHelper.popupConfirm(warnText,function()
			local success, popFunc = LogicCheckHelper.enoughCash(needGold)
			if success then
				G_UserData:getActivityDailySignin():c2sActReCheckin(data:getDay())
			else
				popFunc()
			end
		end)
	end
end

function DailySigninView:_onShowRewardItems(message)
    local awards = rawget(message, "reward")
	if awards then
		G_Prompt:showAwards(awards)
	end
end

function DailySigninView:_refreshTotalSigninDayView(dayCount)
    dayCount = dayCount or G_UserData:getActivityDailySignin():getCheckinCount()
	self._bitmapFontLabel:setString(tostring(dayCount))

	local size = self._bitmapFontLabel:getContentSize()
	self._textTian:setPositionX(self._bitmapFontLabel:getPositionX()+ size.width+4)
end

function DailySigninView:refreshData()
	local allData =  G_UserData:getActivityDailySignin():getAllSigninUnitDatas()
	self._listDatas  = allData
	self:_refreshTodaySignUnitData()
	self:_refreshListView(self._listView,self._listDatas)
	self:_refreshLightZorder()
	local dayCount = G_UserData:getActivityDailySignin():getCheckinCount()
	self:_refreshTotalSigninDayView(dayCount)

	local currSignDay = G_UserData:getActivityDailySignin():getCurrSignDay()
	if currSignDay and currSignDay > 21 then--在第4排的时候（21 = 7 *3）
		--self._listView:scrollToBottom(0, false)
		self._listView:getInnerContainer():setPositionY(0)
	end 

end

function DailySigninView:_refreshTodaySignUnitData()
	self._todaySignUnitData = self:_getTodaySignUnitData()
	self._todayItemNode = nil
end

function DailySigninView:_getTodaySignUnitData()
	for k,v in ipairs(self._listDatas) do
		if v:getState() ==  ActivityConst.CHECKIN_STATE_RIGHT_TIME then
			return v
		end
	end
	return nil
end

return DailySigninView
