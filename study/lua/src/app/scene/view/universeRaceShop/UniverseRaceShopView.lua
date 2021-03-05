
-- Author: Liangxu
-- Date: 2020-4-30
-- 真武战神商店
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceShopView = class("UniverseRaceShopView", ViewBase)
local ShopConst = require("app.const.ShopConst")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local UniverseRaceShopCell = require("app.scene.view.universeRaceShop.UniverseRaceShopCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local TabScrollView = require("app.utils.TabScrollView")

function UniverseRaceShopView:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceShopView", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	
	UniverseRaceShopView.super.ctor(self, resource)
end

function UniverseRaceShopView:onCreate()
	self._selectTabIndex = 1
	self._goodIds = {}

	local shopCfg = G_UserData:getShops():getShopCfgById(ShopConst.UNIVERSE_RACE_SHOP)
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
	self._topbarBase:setImageTitle("txt_sys_com_hongzhuangshangdian")
	self._nodeBg:setTitle(Lang.get("shop_universe_race_title"))
	self:_initTabGroup()
end

function UniverseRaceShopView:_initTabGroup()
	local scrollViewParam = {
		template = UniverseRaceShopCell,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listView, scrollViewParam, self._selectTabIndex)
    local tabNameList = ShopActiveDataHelper.getShopSubTab(ShopConst.UNIVERSE_RACE_SHOP)
    local param = {
        isVertical = 2,
        callback = handler(self, self._onTabSelect),
        textList = tabNameList
    }
    self._tabGroup:recreateTabs(param)
end

function UniverseRaceShopView:onEnter()
	self._signalUpdateShopGoods = G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventShopUpdate))
	self:_updateData()
	self:_updateView()
	G_UserData:getShops():c2sGetShopInfo(ShopConst.UNIVERSE_RACE_SHOP)
end

function UniverseRaceShopView:onExit()
	self._signalUpdateShopGoods:remove()
	self._signalUpdateShopGoods = nil
end

function UniverseRaceShopView:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateData()
	self:_updateView()
end

function UniverseRaceShopView:_updateData()
	self._goodIds = G_UserData:getShopActive():getGoodIdsWithShopAndTabIdBySort(ShopConst.UNIVERSE_RACE_SHOP, self._selectTabIndex, 0)
end

function UniverseRaceShopView:_updateView()
	local lineCount = math.ceil(#self._goodIds / 2)
	self._tabListView:updateListView(self._selectTabIndex, lineCount)
end

function UniverseRaceShopView:_onItemUpdate(item, index)
	local index = index * 2
	local isExchange = self._selectTabIndex == 2 --第2个页签是“兑换”
	item:update(self._goodIds[index + 1], self._goodIds[index + 2], isExchange)
end

function UniverseRaceShopView:_onItemSelected(item, index)

end

function UniverseRaceShopView:_onItemTouch(index, t)
	if not self:_checkFunc() then
		return
	end
	local index = index * 2 + t
	local goodId = self._goodIds[index]
	UIPopupHelper.popupActiveShopBuyItem(goodId, handler(self, self._doBuy))
end

function UniverseRaceShopView:_doBuy(goodId, buyCount)
	local shopId = ShopConst.UNIVERSE_RACE_SHOP
	G_UserData:getShops():c2sBuyShopGoods(goodId, shopId, buyCount)
end

function UniverseRaceShopView:_checkFunc()
	local state = UniverseRaceDataHelper.getRaceStateAndTime()
	if state == UniverseRaceConst.RACE_STATE_NONE then
		G_Prompt:showTip(Lang.get("customactivity_equip_act_end_tip"))
        return false
    else
        return true
	end
end

function UniverseRaceShopView:_onEventShopUpdate(eventName, message)
	if message.shop_id ~= ShopConst.UNIVERSE_RACE_SHOP then
		return
	end
	self:_updateData()
	self:_updateView()
end

return UniverseRaceShopView