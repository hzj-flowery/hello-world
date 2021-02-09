
local CarnivalActivityTaskLayer = require("app.scene.view.carnivalActivity.CarnivalActivityTaskLayer")
local CarnivalActivityExchangeLayer = class("CarnivalActivityExchangeLayer", CarnivalActivityTaskLayer)
local CustomActivityConst = require("app.const.CustomActivityConst")

function CarnivalActivityExchangeLayer:ctor(actType, questType)
	self._actType = actType
	self._questType = questType
    CarnivalActivityExchangeLayer.super.ctor(self, self._actType, self._questType)
end

function CarnivalActivityExchangeLayer:onInitCsb(resource)
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("CarnivalActivityExchangeLayer", "carnivalActivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		},
	}
    CSHelper.createResourceNode(self, resource)
end

function CarnivalActivityExchangeLayer:_initListView(actType,questType)
	local ItemCell = nil

    if questType == CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE then
        ItemCell = require("app.scene.view.carnivalActivity.CarnivalActivityYuBiExchangeCell")
    else
        ItemCell = require("app.scene.view.carnivalActivity.CarnivalActivityExchangeCell")    
	end
	
	self._listView:setTemplate(ItemCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))
end

function CarnivalActivityExchangeLayer:refreshView(activityData,resetListData)
    self._activityData = activityData
    self:_initListView( self._activityData:getAct_type(),self._activityData:getQuest_type())

	self._curQuests = activityData:getShowQuests()
	self._listView:stopAutoScroll()
	self._listView:resize(#self._curQuests)
	self._listView:jumpToTop()
end


return CarnivalActivityExchangeLayer
