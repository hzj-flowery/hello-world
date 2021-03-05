--@Author:Conley
local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local WeeklyGiftPkgItemCell = import(".WeeklyGiftPkgItemCell")
local ActivityConst = require("app.const.ActivityConst")
local WeeklyGiftPkgView = class("WeeklyGiftPkgView", ActivitySubView)

function WeeklyGiftPkgView:ctor(mainView,activityId)
	self._mainView = mainView
	self._activityId = activityId
	self._textTitle = nil--标题
	self._commonBubble = nil--NPC对话
	self._listView = nil
	self._textTime = nil--礼包刷新时间

	self._listDatas = nil
    local resource = {
        file = Path.getCSB("WeeklyGiftPkgView", "activity/weeklygiftpkg"),
        binding = {
		}
    }
    WeeklyGiftPkgView.super.ctor(self, resource)
end

function WeeklyGiftPkgView:_pullData()
	local hasActivityServerData = G_UserData:getActivity():hasActivityData(self._activityId)
	if not hasActivityServerData  then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end
	return hasActivityServerData
end

function WeeklyGiftPkgView:onCreate()
	--local actCfg = G_UserData:getActivityWeeklyGiftPkg():getBaseActivityData():getConfig()
	--self._textTitle:setString(actCfg.name)
	--local imgPath = Path.getChatRoleRes("216")
	--self._imageJc:loadTexture(imgPath)

	self._commonBubble:setBubbleColor(Colors.BRIGHT_BG_ONE)
	self._commonBubble:setString(Lang.get("lang_activity_weeklygiftpkg_talk"),325,true,325,76)

	self:_initListView(self._listView)
end

function WeeklyGiftPkgView:onEnter()
	self._signalWelfareGiftPkgGetInfo = G_SignalManager:add(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_INFO, handler(self, self._onEventWelfareGiftPkgGetInfo))
	self._signalWelfareGiftPkgGetReward = G_SignalManager:add(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_REWARD, handler(self, self._onEventWelfareGiftPkgGetReward))

	local hasServerData = self:_pullData()
	if hasServerData and G_UserData:getActivityWeeklyGiftPkg():isExpired() then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end

	self:refreshData()
	self:_startRefreshHandler()
end

function WeeklyGiftPkgView:onExit()
	self._signalWelfareGiftPkgGetInfo:remove()
	self._signalWelfareGiftPkgGetInfo = nil

	self._signalWelfareGiftPkgGetReward:remove()
	self._signalWelfareGiftPkgGetReward = nil


	self:_endRefreshHandler()

end

function WeeklyGiftPkgView:_startRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function WeeklyGiftPkgView:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function WeeklyGiftPkgView:_onRefreshTick( dt )
	self:_refreshActTime()
end

function WeeklyGiftPkgView:_onEventWelfareGiftPkgGetInfo(event,id,message)
	if message.discount_type ~= ActivityConst.GIFT_PKG_TYPE_WEEKLY then
		return
	end
    self:refreshData()

end

function WeeklyGiftPkgView:_onEventWelfareGiftPkgGetReward(event,id,message,giftId)
	if message.discount_type ~= ActivityConst.GIFT_PKG_TYPE_WEEKLY then
		return
	end
	--self:_refreshListData()
	local index = nil
	local listDatas = self:_getListDatas()
	for k,v in ipairs(listDatas) do
		if v:getId() == giftId then
			index = k
		end
	end
	if index then
		self:_refreshItemNodeByIndex(index)
	end
	

	self:_onShowRewardItems(message)
end

function WeeklyGiftPkgView:_onShowRewardItems(message)
    local ids = rawget(message,"id") or {}
	local awards = G_UserData:getActivityWeeklyGiftPkg():getRewards(ids)
	if awards then
		G_Prompt:showAwards(awards)
		-- local popupGetRewards = require("app.ui.PopupGetRewards").new()
		-- popupGetRewards:show(awards,nil,nil,nil)
	end
end

function WeeklyGiftPkgView:_initListView(listView)
	listView:setTemplate(WeeklyGiftPkgItemCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
end

function WeeklyGiftPkgView:_refreshListView(listView,itemList)
	local lineCount = #itemList
	logWarn("WeeklyGiftPkgView:line  "..lineCount)
	listView:clearAll()
	listView:resize(lineCount)
end

function WeeklyGiftPkgView:_getListDatas()
	return  self._listDatas
end

function WeeklyGiftPkgView:_onItemUpdate(item, index)
	logWarn("WeeklyGiftPkgView:_onItemUpdate  "..(index+1))
	local itemList = self:_getListDatas()
	item:updateInfo(itemList[index+1])

end

function WeeklyGiftPkgView:_onItemSelected(item, index)
	logWarn("WeeklyGiftPkgView:_onItemSelected ")
end

function WeeklyGiftPkgView:_onItemTouch(index, itemPos)
	logWarn("WeeklyGiftPkgView:_onItemTouch "..tostring(index).." "..tostring(itemPos))
	local data = self._listDatas[itemPos+1]
	local id = data:getId()

	--逻辑检测，判断是否VIP满足条件
	local success,errorMsg,funcName = data:checkIsCanBuy()
	if success then
		local ActivityDataHelper = require("app.utils.data.ActivityDataHelper")
		if ActivityDataHelper.checkPackBeforeGetActReward(data) then
			G_UserData:getActivityWeeklyGiftPkg():c2sActDiscount(id)
		end
	elseif funcName == "enoughVip" then
	  	local UIPopupHelper = require("app.utils.UIPopupHelper")
	    --local hintText = Lang.get("lang_activity_weeklygiftpkg_not_enough_vip_hint",{vip = data:getConfig().vip})
		--UIPopupHelper.popupConfirm(hintText,function()
		--end)
		UIPopupHelper.popupVIPNoEnough()
	elseif funcName == "enoughCash" then
		errorMsg()
	end
end

function WeeklyGiftPkgView:_refreshActTime()
	local updateTime = G_UserData:getActivityWeeklyGiftPkg():getExpiredTime()
	local isShowUpdateTime = updateTime > 0
	
--	local timeStr = G_ServerTime:getRefreshTimeString(updateTime)
	local timeStr = G_ServerTime:getLeftDHMSFormat(updateTime)
	local text = Lang.get("lang_activity_weeklygiftpkg_refresh_time",{date = timeStr})
	self._textTime:setString(text)
	self._textTime:setVisible(isShowUpdateTime)
end

function WeeklyGiftPkgView:_refreshListData()
	local allData =  G_UserData:getActivityWeeklyGiftPkg():getAllShowUnitDatas()
	self._listDatas  = allData--重置数据
	self:_refreshListView(self._listView,self._listDatas)
end

--刷新页面，有无周礼包数据都可调用
function WeeklyGiftPkgView:refreshData()
	self:_refreshActTime()
    self:_refreshListData()
end

function WeeklyGiftPkgView:enterModule()
	self._commonBubble:doAnim()
end


function WeeklyGiftPkgView:_refreshItemNodeByIndex(index)
	local itemNode = self:_findItemNodeByIndex(index)
	if itemNode then
		local unitData = self._listDatas[index]
		itemNode:updateInfo(unitData)
	end
end

function WeeklyGiftPkgView:_findItemNodeByIndex(index)
	local lineIndex = index
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
	return itemCellNode
end


return WeeklyGiftPkgView
