--
-- Author: hyl
-- Date: 2020-3-10 14:14:30
-- 红神兽商店
local ViewBase = require("app.ui.ViewBase")
local PetPetShopView = class("PetPetShopView", ViewBase)
local ShopConst = require("app.const.ShopConst")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local ShopViewItemCell = require("app.scene.view.shop.ShopViewItemCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")

function PetPetShopView:ctor()
	local resource = {
		file = Path.getCSB("EquipActiveShopView", "equipActiveShop"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	
	PetPetShopView.super.ctor(self, resource)
end

function PetPetShopView:onCreate()
	self._selectTabIndex = 1
	self._itemList = {}

	local shopCfg = G_UserData:getShops():getShopCfgById(ShopConst.RED_PET_SHOP)
	local resList = ShopHelper.getResListByShopCfg(shopCfg)
	if #resList <= 0 then
		self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	else
		local len = 3 - #resList
		local resTemp = clone(resList)
		for i = 1, len do
			table.insert(resTemp, 1, {type = 0, value = 0})
		end
		self._topbarBase:updateUIByResList(resTemp)
	end

	self._topbarBase:setImageTitle("txt_sys_qilingshangdian")
	self._nodeBg:setTitle(Lang.get("shop_tab_RedPet"))

	self:_initListView()
end

function PetPetShopView:_initListView()
	self._listView:setTemplate(ShopViewItemCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PetPetShopView:onEnter()
	self._signalUpdateShopGoods = G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventShopUpdate))

	self:_updateData()
	self:_updateView()

	G_UserData:getShops():c2sGetShopInfo(ShopConst.RED_PET_SHOP)
end

function PetPetShopView:onExit()
	self._signalUpdateShopGoods:remove()
	self._signalUpdateShopGoods = nil
end

function PetPetShopView:_updateData()
	self._itemList = {}
	self._itemList = G_UserData:getShops():getShopGoodsList(ShopConst.RED_PET_SHOP, 1)
end

function PetPetShopView:_updateView()
	local lineCount = math.ceil(#self._itemList / 2)
	self._listView:clearAll()
    self._listView:resize(lineCount)
end

function PetPetShopView:_onItemUpdate(item, index)
	local startIndex = index * 2

	if self._itemList and #self._itemList > 0 then
		local itemLine = {}
		local itemData1, itemData2 = self._itemList[startIndex + 1], self._itemList[startIndex + 2]
		if itemData1 then
			table.insert(itemLine, itemData1)
		end
		if itemData2 then
			table.insert(itemLine, itemData2)
		end

		item:update(index, itemLine, self._selectTabIndex)
	end
end

function PetPetShopView:_onItemSelected(item, index)

end

function PetPetShopView:_getItemDataByPos(pos)
	local itemList = self._itemList
	if pos > 0 and pos <= #itemList then
		return itemList[pos]
	end
	return nil
end

function PetPetShopView:_onItemTouch(index, itemPos)
	local lineIndex = index
	local shopItemData = self:_getItemDataByPos(itemPos)
	if shopItemData == nil then
		return
    end
    
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local success,erroMsg,funcName = LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true)
	if success == false then
		return
	end

	UIPopupHelper.popupFixShopBuyItem(shopItemData, FunctionConst.FUNC_RED_PET_SHOP)
end

function PetPetShopView:_onEventShopUpdate(eventName, message)
	if message.shop_id ~= ShopConst.RED_PET_SHOP then
		return
	end
	self:_updateData()
	self:_updateView()
end

return PetPetShopView