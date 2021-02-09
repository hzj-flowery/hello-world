
local CarnivalActivityTaskLayer = require("app.scene.view.carnivalActivity.CarnivalActivityTaskLayer")
local CarnivalActivityRechargeLayer = class("CarnivalActivityRechargeLayer", CarnivalActivityTaskLayer)
local CustomActivityConst = require("app.const.CustomActivityConst")

function CarnivalActivityRechargeLayer:ctor(actType)
    self._actType = actType
    self._activityData = nil
    CarnivalActivityRechargeLayer.super.ctor(self)
end

function CarnivalActivityRechargeLayer:onInitCsb(resource)
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("CarnivalActivityRechargeLayer", "carnivalActivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		},
	}
    CSHelper.createResourceNode(self, resource)
end

function CarnivalActivityRechargeLayer:onCreate()
end

function CarnivalActivityRechargeLayer:_initListView(actType,questType)
	local ItemCell = nil
    if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE  then
        ItemCell = require("app.scene.view.carnivalActivity.CarnivalActivitySingleRechargeItemCell")
	elseif questType == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then	
		ItemCell = require("app.scene.view.carnivalActivity.CarnivalActivitySingleRechargeItemCell")  		
    elseif actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY then
        ItemCell = require("app.scene.view.carnivalActivity.CarnivalActivityRechargeTaskItemCell")    
    else
        ItemCell = require("app.scene.view.carnivalActivity.CarnivalActivityTaskCell")    
    end
	self._listView:setTemplate(ItemCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))
end

function CarnivalActivityTaskLayer:refreshView(activityData,resetListData)
    self._activityData = activityData
    self:_initListView( self._activityData:getAct_type(),self._activityData:getQuest_type())

	self._curQuests = activityData:getShowQuests()
	self._listView:stopAutoScroll()
	self._listView:resize(#self._curQuests)
	self._listView:jumpToTop()
end



return CarnivalActivityRechargeLayer
