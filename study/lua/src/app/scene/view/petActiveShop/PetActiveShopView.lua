--
-- Author: Liangxu
-- Date: 2018-6-6 14:14:30
-- 神兽活动商店
local ViewBase = require("app.ui.ViewBase")
local PetActiveShopView = class("PetActiveShopView", ViewBase)
local ShopConst = require("app.const.ShopConst")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local PetActiveShopCell = require("app.scene.view.petActiveShop.PetActiveShopCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")

function PetActiveShopView:ctor()
	local resource = {
		file = Path.getCSB("EquipActiveShopView", "equipActiveShop"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	
	PetActiveShopView.super.ctor(self, resource)
end

function PetActiveShopView:onCreate()
	self._selectTabIndex = 1
	self._goodIds = {}

	local shopCfg = G_UserData:getShops():getShopCfgById(ShopConst.LOOKSTAR_SHOP)
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
	self._nodeBg:setTitle(Lang.get("shop_pet_title"))
	--self._nodeBg:hideCloseBtn()

	self:_initListView()
end

function PetActiveShopView:_initListView()
	self._listView:setTemplate(PetActiveShopCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PetActiveShopView:onEnter()
	self._signalUpdateShopGoods = G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventShopUpdate))
	self:_updateData()
	self:_updateView()
	G_UserData:getShops():c2sGetShopInfo(ShopConst.LOOKSTAR_SHOP)
end

function PetActiveShopView:onExit()
	self._signalUpdateShopGoods:remove()
	self._signalUpdateShopGoods = nil
end

function PetActiveShopView:_updateData()
	self._goodIds = {}
	local actUnitData = G_UserData:getCustomActivity():getPetActivity()
	if actUnitData then
		local curBatch = actUnitData:getBatch()
		self._goodIds = G_UserData:getShopActive():getGoodIdsWithShopAndTabIdBySort(ShopConst.LOOKSTAR_SHOP, self._selectTabIndex, curBatch)
	end
end

function PetActiveShopView:_updateView()
	local lineCount = math.ceil(#self._goodIds / 2)
	self._listView:clearAll()
    self._listView:resize(lineCount)
end

function PetActiveShopView:_onItemUpdate(item, index)
	local index = index * 2
	item:update(self._goodIds[index + 1], self._goodIds[index + 2])
end

function PetActiveShopView:_onItemSelected(item, index)

end

function PetActiveShopView:_onItemTouch(index, t)
	if not self:_checkFunc() then
		return
	end
	local index = index * 2 + t
	local goodId = self._goodIds[index]
	UIPopupHelper.popupActiveShopBuyItem(goodId, handler(self, self._doBuy))
end

function PetActiveShopView:_doBuy(goodId, buyCount)
	local shopId = ShopConst.LOOKSTAR_SHOP
	G_UserData:getShops():c2sBuyShopGoods(goodId, shopId, buyCount)
end

function PetActiveShopView:_checkFunc()
	local isVisible = G_UserData:getCustomActivity():isPetActivityVisible()
	if isVisible then
		return true
	else
		G_Prompt:showTip(Lang.get("customactivity_pet_act_end_tip"))
		return false
	end
end

function PetActiveShopView:_onEventShopUpdate(eventName, message)
	if message.shop_id ~= ShopConst.LOOKSTAR_SHOP then
		return
	end
	self:_updateData()
	self:_updateView()
end

return PetActiveShopView