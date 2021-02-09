
--
-- Author: Liangxu
-- Date: 2019-5-15
-- 蛋糕活动商店
local ViewBase = require("app.ui.ViewBase")
local CakeActivityShopView = class("CakeActivityShopView", ViewBase)
local ShopConst = require("app.const.ShopConst")
local CakeActivityShopCell = require("app.scene.view.cakeActivityShop.CakeActivityShopCell")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local CakeActivityConst = require("app.const.CakeActivityConst")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local TabScrollView = require("app.utils.TabScrollView")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

function CakeActivityShopView:ctor()
	local resource = {
		file = Path.getCSB("GachaGoldShopView", "gachaGoldShop"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	
	CakeActivityShopView.super.ctor(self, resource)
end

function CakeActivityShopView:onCreate()
	self._selectTabIndex = 1
	self._goodIds = {}

	local shopCfg = G_UserData:getShops():getShopCfgById(ShopConst.CAKE_ACTIVE_SHOP)
	local resList = ShopHelper.getResListByShopCfg(shopCfg)
	if #resList <= 0 then
		self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	else
		local len = 3 - #resList --需要补充空数据，让图标排到最右侧
		local resTemp = clone(resList)
		for i = 1, len do
			table.insert(resTemp, 1, {type = 0, value = 0})
		end
		self._topbarBase:updateUIByResList(resTemp)
	end
	self._topbarBase:setImageTitle("txt_sys_zhounianqingshangdian")
	self._commonFullScreen:setTitle(Lang.get("shop_cake_activity_title"))

	self:_initTabGroup()
end

function CakeActivityShopView:_initTabGroup()
	local scrollViewParam = {
		template = CakeActivityShopCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam, self._selectTabIndex)
    local tabNameList = ShopActiveDataHelper.getShopSubTab(ShopConst.CAKE_ACTIVE_SHOP)
    local param = {
        isVertical = 2,
        callback = handler(self, self._onTabSelect),
        textList = tabNameList
    }
    self._tabGroup:recreateTabs(param)
end

function CakeActivityShopView:onEnter()
	self._signalUpdateShopGoods = G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventShopUpdate))
	self:_updateData()
	self:_updateView()
	G_UserData:getShops():c2sGetShopInfo(ShopConst.CAKE_ACTIVE_SHOP)
	self:_startCountDown()
end

function CakeActivityShopView:onExit()
	self:_stopCountDown()

	self._signalUpdateShopGoods:remove()
	self._signalUpdateShopGoods = nil
end

function CakeActivityShopView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateData()
	self:_updateView()
	G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_CLICK,
			FunctionConst.FUNC_CAKE_ACTIVITY_SHOP,{index = index})
	self._tabGroup:setRedPointByTabIndex(index, false)
end

function CakeActivityShopView:_updateRedPoint()
	local count = self._tabGroup:getTabCount()
	for i = 1, count do
		local isShow = G_UserData:getCakeActivity():isShowShopRedPointWithIndex(i)
		self._tabGroup:setRedPointByTabIndex(i, isShow)
	end
end

function CakeActivityShopView:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function CakeActivityShopView:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function CakeActivityShopView:_updateCountDown()
	local listView = self._tabListView:getListView(self._selectTabIndex)
	local items = listView:getItems()
	for i, item in ipairs(items) do
		item:updateDes()
	end
end

function CakeActivityShopView:_updateData()
	self._goodIds = {}
	local curBatch = G_UserData:getCakeActivity():getBatchId()
	self._goodIds = G_UserData:getShopActive():getGoodIdsWithShopAndTabIdBySort(ShopConst.CAKE_ACTIVE_SHOP, self._selectTabIndex, curBatch)
end

function CakeActivityShopView:_updateView()
	local count = math.ceil(#self._goodIds / 2)
    self._tabListView:updateListView(self._selectTabIndex, count)
end

function CakeActivityShopView:_onItemUpdate(item, index)
	local index = index * 2
	local isExchange = self._selectTabIndex == 4 --第4个页签是“兑换”
	item:update(self._goodIds[index + 1], self._goodIds[index + 2], isExchange)
end

function CakeActivityShopView:_onItemSelected(item, index)

end

function CakeActivityShopView:_onItemTouch(index, t)
	if not self:_checkFunc() then
		return
	end
	local index = index * 2 + t
	local goodId = self._goodIds[index]
	UIPopupHelper.popupActiveShopBuyItem(goodId, handler(self, self._doBuy))
end

function CakeActivityShopView:_doBuy(goodId, buyCount)
	local shopId = ShopConst.CAKE_ACTIVE_SHOP
	G_UserData:getShops():c2sBuyShopGoods(goodId, shopId, buyCount)
end

function CakeActivityShopView:_checkFunc()
	local actStage = require("app.utils.data.CakeActivityDataHelper").getActStage()
	if actStage == CakeActivityConst.ACT_STAGE_0 then
		G_Prompt:showTip(Lang.get("cake_activity_act_end_tip"))
		return false
	else
		return true
	end
end

function CakeActivityShopView:_onEventShopUpdate(eventName, message)
	if message.shop_id ~= ShopConst.CAKE_ACTIVE_SHOP then
		return
	end
	self:_updateData()
	self:_updateView()
	self:_updateRedPoint()
end

return CakeActivityShopView