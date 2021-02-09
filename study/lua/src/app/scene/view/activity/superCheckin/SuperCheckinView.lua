-- Author: nieming
-- Date:2018-04-09 14:05:46
-- @Rebuild 7.9.2018 by panhoa
-- Describle：
local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
local SuperCheckinView = class("SuperCheckinView", ActivitySubView)
local SuperCheckinHelper = require("app.scene.view.activity.superCheckin.SuperCheckinHelper")
local SuperCheckinItemCell = require("app.scene.view.activity.superCheckin.SuperCheckinItemCell")
local TabScrollView = require("app.utils.TabScrollView")
local SuperCheckinConst = require("app.const.SuperCheckinConst")

--local MAXITEMNUM = 6
function SuperCheckinView:ctor()
	self._alreadyGet = nil  --Sprite
	self._btnGet = nil  --CommonButtonSwitchLevel0
	self._curSelect = nil  --Text
	self._curSelectIndexs = {}
	self._curSelectNum = 0
	self._scrollView = nil

	local resource = {
		file = Path.getCSB("SuperCheckinView", "activity/superCheckin"),
		binding = {
			_btnGet = {
				events = {{event = "touch", method = "_onBtnGet"}}
			},
		},
	}
	SuperCheckinView.super.ctor(self, resource)
end

-- Describle：
function SuperCheckinView:onCreate()
	self._btnGet:setString(Lang.get("common_receive"))
	
	-- init scrollview
	local scrollViewParam = {
		template = SuperCheckinItemCell,
		updateFunc = handler(self, self._onCellUpdate),
		selectFunc = handler(self, self._onCellSelected),
		touchFunc = handler(self, self._onCellTouch),
		scrollFunc = handler(self, self._scrollEventCallback),
	}
	self._tabListView = TabScrollView.new(self._scrollView, scrollViewParam)

	-- reset localZorder to strength render
	-- self._maskView:setLocalZOrder(SuperCheckinConst.ZORDER_MASK)
	self._mask:setLocalZOrder(SuperCheckinConst.ZORDER_GETBTN)
	self._moduleFlg:setLocalZOrder(SuperCheckinConst.ZORDER_MODULE)
	self._btnGet:setLocalZOrder(SuperCheckinConst.ZORDER_GETBTN)
	self._alreadyGet:setLocalZOrder(SuperCheckinConst.ZORDER_ALREADYGET)
end

-- @Role Init ScrollView
function SuperCheckinView:_updateListView()
	-- body
	local scrollViewParam = {
		template = SuperCheckinItemCell,
		updateFunc = handler(self, self._onCellUpdate),
		selectFunc = handler(self, self._onCellSelected),
		touchFunc = handler(self, self._onCellTouch),
		scrollFunc = handler(self, self._scrollEventCallback),
	}

	local awards = SuperCheckinHelper.getAwardList()
	local lineCount = math.ceil(#awards / SuperCheckinConst.CELLITEM_NUM)
	self._tabListView:updateListView(self._scrollView, lineCount, scrollViewParam)
end

-- @Role 
function SuperCheckinView:_onCellUpdate(cellItem, cellIndex)
	local curCellFirstItemIndex = cellIndex * SuperCheckinConst.CELLITEM_NUM + SuperCheckinConst.CELLITEM_FIRST
	local curCelllastItemIndex = (cellIndex + 1) * SuperCheckinConst.CELLITEM_NUM

	local cellData = {}
	local awards = SuperCheckinHelper.getAwardList()
	if #awards > 0 then
		for index = curCellFirstItemIndex, curCelllastItemIndex do
			local award = awards[index]
			if award then
				if self._curSelectIndexs[index] then
					award.selected = true
				else
					award.selected = false
				end
				table.insert(cellData, award)
			end
		end
		cellItem:updateUI(cellIndex, cellData)
	end
end

-- @Role
function SuperCheckinView:_onCellSelected(cellItem, cellIndex)
	-- body
end

-- @Role select
function SuperCheckinView:_onCellTouch(cellIndex, itemTag)
	self:selectIndex(itemTag)
end

-- @Role scroll
function SuperCheckinView:_scrollEventCallback(sender, eventType)
	-- body
	-- if eventType == ccui.ScrollviewEventType.scrollToTop then
	-- 	self._maskView:setVisible(true)
	-- elseif eventType == ccui.ScrollviewEventType.scrollToBottom then
	-- 	self._maskView:setVisible(false)
	-- elseif eventType == ccui.ScrollviewEventType.scrolling then
	-- 	self._maskView:setVisible(true)
	-- end	
end

function SuperCheckinView:enterModule()
	self:_refreshAwards()
end

function SuperCheckinView:_refreshAwards()
	local isTodayCheckin = G_UserData:getActivitySuperCheckin():isTodayCheckin()
	if isTodayCheckin then
		self._curSelectIndexs = G_UserData:getActivitySuperCheckin():getLastCheckinIndexs()
		self._curSelectNum = SuperCheckinHelper.getMaxSelectNum()
	else
		self._curSelectIndexs = {}
		self._curSelectNum = 0
	end

	self:_refreshItemsState()
	if isTodayCheckin then
		self._btnGet:setVisible(false)
		self._alreadyGet:setVisible(true)
	else
		self._btnGet:setVisible(true)
		self._alreadyGet:setVisible(false)
	end
end

function SuperCheckinView:selectIndex(itemTag)
	local isTodayCheckin = G_UserData:getActivitySuperCheckin():isTodayCheckin()
	if isTodayCheckin then
		return
	end
	if self._curSelectIndexs[itemTag] then
		self._curSelectIndexs[itemTag] = false
		self._curSelectNum = self._curSelectNum - 1
	else
		local maxNum = SuperCheckinHelper.getMaxSelectNum()
		if self._curSelectNum >= maxNum then
			G_Prompt:showTip(Lang.get("lang_activity_super_checkin_full", {num = maxNum}))
			return
		end
		self._curSelectIndexs[itemTag] = true
		self._curSelectNum = self._curSelectNum + 1
	end
	self:_refreshItemsState()
end

function SuperCheckinView:_refreshItemsState()
	self:_updateListView()

	self._curSelect:setString(self._curSelectNum)
	self._curSelect2:setString(SuperCheckinHelper.getMaxSelectNum())
end

-- Describle：
function SuperCheckinView:onEnter()
	self._signalGetReward = G_SignalManager:add(SignalConst.EVENT_ACT_CHECKIN_SUPER_SUCCESS, handler(self, self._onEventCheckin))
	self._signalCleanData = G_SignalManager:add(SignalConst.EVENT_CLEAN_DATA_CLOCK, handler(self, self._onEventCleanData))
	self:_updateListView()
end

-- Describle：
function SuperCheckinView:onExit()
	self._signalGetReward:remove()
	self._signalGetReward = nil

	self._signalCleanData:remove()
	self._signalCleanData = nil
end

function SuperCheckinView:_onEventCheckin(event, awards)
	self:_refreshAwards()
	if awards then
		G_Prompt:showAwards(awards)
	end
end

function SuperCheckinView:_onEventCleanData()
	self:_refreshAwards()
end

-- Describle：
function SuperCheckinView:_onBtnGet()
	-- body
	local isTodayCheckin = G_UserData:getActivitySuperCheckin():isTodayCheckin()
	if isTodayCheckin then
		return
	end
	local maxNum = SuperCheckinHelper.getMaxSelectNum()
	if self._curSelectNum ~=  maxNum then
		G_Prompt:showTip(Lang.get("lang_activity_super_checkin_not_enough", {num = maxNum}))
		return
	end
	local selectIndexs = {}
	local awards = SuperCheckinHelper.getAwardList()
	for i = 1, #awards do
		if self._curSelectIndexs[i] then
			table.insert(selectIndexs, i)
		end
	end
	G_UserData:getActivitySuperCheckin():c2sActCheckinSuper(selectIndexs)
end

return SuperCheckinView
