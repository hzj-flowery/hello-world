--
-- Author: Liangxu
-- Date: 2019-2-15
-- 训马活动商店
local ViewBase = require("app.ui.ViewBase")
local HorseConquerActiveShopView = class("HorseConquerActiveShopView", ViewBase)
local ShopConst = require("app.const.ShopConst")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local HorseConquerActiveShopCell = require("app.scene.view.horseConquerActiveShop.HorseConquerActiveShopCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")

function HorseConquerActiveShopView:ctor()
	local resource = {
		file = Path.getCSB("EquipActiveShopView", "equipActiveShop"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	
	HorseConquerActiveShopView.super.ctor(self, resource)
end

function HorseConquerActiveShopView:onCreate()
	self._selectTabIndex = 1
	self._goodIds = {}

	local shopCfg = G_UserData:getShops():getShopCfgById(ShopConst.HORSE_CONQUER_SHOP)
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
	self._topbarBase:setImageTitle("txt_sys_com_stargazing")
	self._nodeBg:setTitle(Lang.get("shop_horse_conquer_title"))
	--self._nodeBg:hideCloseBtn()
	self:_initListView()
end

function HorseConquerActiveShopView:_initListView()
	self._listView:setTemplate(HorseConquerActiveShopCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function HorseConquerActiveShopView:onEnter()
	self._signalUpdateShopGoods = G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventShopUpdate))
	self:_updateData()
	self:_updateView()
	G_UserData:getShops():c2sGetShopInfo(ShopConst.HORSE_CONQUER_SHOP)
end

function HorseConquerActiveShopView:onExit()
	self._signalUpdateShopGoods:remove()
	self._signalUpdateShopGoods = nil
end

function HorseConquerActiveShopView:_updateData()
	self._goodIds = {}
	local actUnitData = G_UserData:getCustomActivity():getHorseConquerActivity()
	if actUnitData then
		local curBatch = actUnitData:getBatch()
		self._goodIds = G_UserData:getShopActive():getGoodIdsWithShopAndTabIdBySort(ShopConst.HORSE_CONQUER_SHOP, self._selectTabIndex, curBatch)
	end
end

function HorseConquerActiveShopView:_updateView()
	local lineCount = math.ceil(#self._goodIds / 2)
	self._listView:clearAll()
    self._listView:resize(lineCount)
end

function HorseConquerActiveShopView:_onItemUpdate(item, index)
	local index = index * 2
	item:update(self._goodIds[index + 1], self._goodIds[index + 2])
end

function HorseConquerActiveShopView:_onItemSelected(item, index)

end

function HorseConquerActiveShopView:_onItemTouch(index, t)
	if not self:_checkFunc() then
		return
	end
	local index = index * 2 + t
	local goodId = self._goodIds[index]
	UIPopupHelper.popupActiveShopBuyItem(goodId, handler(self, self._doBuy))
end

function HorseConquerActiveShopView:_doBuy(goodId, buyCount)
	local shopId = ShopConst.HORSE_CONQUER_SHOP
	G_UserData:getShops():c2sBuyShopGoods(goodId, shopId, buyCount)
end

function HorseConquerActiveShopView:_checkFunc()
	local isVisible = G_UserData:getCustomActivity():isHorseConquerActivityVisible()
	if isVisible then
		return true
	else
		G_Prompt:showTip(Lang.get("customactivity_horse_conquer_act_end_tip"))
		return false
	end
end

function HorseConquerActiveShopView:_onEventShopUpdate(eventName, message)
	if message.shop_id ~= ShopConst.HORSE_CONQUER_SHOP then
		return
	end
	self:_updateData()
	self:_updateView()
end

return HorseConquerActiveShopView