
-- Author: nieming
-- Date:2018-02-16 16:17:37
-- Describle：
local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
-- local ViewBase = require("app.ui.ViewBase")
local ResourceBackView = class("ResourceBackView", ActivitySubView)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
function ResourceBackView:ctor()

	--csb bind var name
	self._actTitle = nil  --CommonFullScreen
	self._listViewTab = nil  --ScrollView
	self._tabGroup2 = nil  --CommonTabGroup
	self._curSelectTabIndex = 0
	self._datas = {}
	self._isPerfect = false
	local resource = {
		file = Path.getCSB("ResourceBackView", "activity/resourceBack"),

	}
	ResourceBackView.super.ctor(self, resource)
end


-- Describle：
function ResourceBackView:onCreate()
	self:_updateData()
	self:_initListViewTab()
	self:_initTab()
end

-- Describle：
function ResourceBackView:onEnter()
	self._signalGetReward = G_SignalManager:add(SignalConst.EVENT_ACT_RESOURCE_BACK_AWARD_SUCCESS, handler(self, self._onEventGetAwards))

end

-- Describle：
function ResourceBackView:onExit()
	self._signalGetReward:remove()
	self._signalGetReward =  nil
end
function ResourceBackView:_onEventGetAwards(event, awards)
	if awards then
		G_Prompt:showAwards(awards)
	end
	self:_updateData()
	self:_refreshView()
end


function ResourceBackView:_initTab()
	local param2 = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		offset = -2,
		textList = {Lang.get("lang_activity_resource_back_tab_perfect"), Lang.get("lang_activity_resource_back_tab_normal")}
	}
	self._tabGroup2:recreateTabs(param2)
	self._tabGroup2:setTabIndex(1)
end

function ResourceBackView:_onTabSelect(index, sender)
	if self._curSelectTabIndex == index then
		return
	end
	self._curSelectTabIndex = index
	self._isPerfect = self._curSelectTabIndex == 1
	self:_refreshView()
end

function ResourceBackView:_initListViewTab()
	-- body
	local ResourceBackCell = require("app.scene.view.activity.resourceBack.ResourceBackCell")
	self._listViewTab:setTemplate(ResourceBackCell)
	self._listViewTab:setCallback(handler(self, self._onListViewTabItemUpdate), handler(self, self._onListViewTabItemSelected))
	self._listViewTab:setCustomCallback(handler(self, self._onListViewTabItemTouch))
end

function ResourceBackView:_updateData()
	self._datas = G_UserData:getActivityResourceBack():getNotBuyItems()
end

function ResourceBackView:_refreshView()
	self._listViewTab:resize(math.ceil(#self._datas/2))
	if #self._datas == 0 then
		self._imageNoTimes:setVisible(true)
	else
		self._imageNoTimes:setVisible(false)
	end
end

-- Describle：
function ResourceBackView:_onListViewTabItemUpdate(item, index)
	local data1 = self._datas[index * 2 + 1]
	local data2 = self._datas[index * 2 + 2]
	item:updateUI(data1, data2, self._isPerfect)
end
-- Describle：
function ResourceBackView:_onListViewTabItemSelected(item, index)

end
-- Describle：
function ResourceBackView:_onListViewTabItemTouch(index, params)
	local data = params
	if data then
		local success
		if self._isPerfect then
			success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE,  DataConst.RES_DIAMOND,  data:getGold(), true)
		else
			success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE,  DataConst.RES_GOLD,  data:getCoin(), true)
		end
	    if success then
	        G_UserData:getActivityResourceBack():c2sActResourceBackAward(data:getId(), self._isPerfect and 0 or 1)
	    end
	end
end


return ResourceBackView
