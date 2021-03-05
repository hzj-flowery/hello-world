
--
-- Author: Liangxu
-- Date: 2018-5-8 14:01:51
-- 装备活动商店
local ViewBase = require("app.ui.ViewBase")
local EquipActiveShopView = class("EquipActiveShopView", ViewBase)
local ShopConst = require("app.const.ShopConst")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local EquipActiveShopCell = require("app.scene.view.equipActiveShop.EquipActiveShopCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local ShopHelper = require("app.scene.view.shop.ShopHelper")

function EquipActiveShopView:ctor()
	local resource = {
		file = Path.getCSB("EquipActiveShopView", "equipActiveShop"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		}
	}
	
	EquipActiveShopView.super.ctor(self, resource)
end

function EquipActiveShopView:onCreate()
	self._selectTabIndex = 1
	self._goodIds = {}

	local shopCfg = G_UserData:getShops():getShopCfgById(ShopConst.SUIT_SHOP)
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
	self._nodeBg:setTitle(Lang.get("shop_suit_title"))
	--self._nodeBg:hideCloseBtn()
	self:_initListView()
end

function EquipActiveShopView:_initListView()
	self._listView:setTemplate(EquipActiveShopCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function EquipActiveShopView:onEnter()
	self._signalUpdateShopGoods = G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventShopUpdate))
	self:_updateData()
	self:_updateView()
	G_UserData:getShops():c2sGetShopInfo(ShopConst.SUIT_SHOP)
end

function EquipActiveShopView:onExit()
	self._signalUpdateShopGoods:remove()
	self._signalUpdateShopGoods = nil
end

function EquipActiveShopView:_updateData()
	self._goodIds = {}
	local actUnitData = G_UserData:getCustomActivity():getEquipActivity()
	if actUnitData then
		local curBatch = actUnitData:getBatch()
		self._goodIds = G_UserData:getShopActive():getGoodIdsWithShopAndTabIdBySort(ShopConst.SUIT_SHOP, self._selectTabIndex, curBatch)
	end
end

function EquipActiveShopView:_updateView()
	local lineCount = math.ceil(#self._goodIds / 2)
	self._listView:clearAll()
    self._listView:resize(lineCount)
end

function EquipActiveShopView:_onItemUpdate(item, index)
	local index = index * 2
	item:update(self._goodIds[index + 1], self._goodIds[index + 2])
end

function EquipActiveShopView:_onItemSelected(item, index)

end

function EquipActiveShopView:_onItemTouch(index, t)
	if not self:_checkFunc() then
		return
	end
	local index = index * 2 + t
	local goodId = self._goodIds[index]
	local costInfo = ShopActiveDataHelper.getCostInfo(goodId)
	local info = costInfo[1]
	if info then
		local isEnough = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false)
		if isEnough then
			self:_doBuy(goodId)
			return true
		else
			local popup = require("app.ui.PopupItemGuider").new()
			popup:updateUI(info.type, info.value)
			popup:openWithAction()
			return false
		end
	end
end

function EquipActiveShopView:_doBuy(goodId)
	local shopId = ShopConst.SUIT_SHOP
	local buyCount = 1
	G_UserData:getShops():c2sBuyShopGoods(goodId, shopId, buyCount)
end

function EquipActiveShopView:_checkFunc()
	local isVisible = G_UserData:getCustomActivity():isEquipActivityVisible()
	if isVisible then
		return true
	else
		G_Prompt:showTip(Lang.get("customactivity_equip_act_end_tip"))
		return false
	end
end

function EquipActiveShopView:_onEventShopUpdate(eventName, message)
	if message.shop_id ~= ShopConst.SUIT_SHOP then
		return
	end
	self:_updateData()
	self:_updateView()
end

return EquipActiveShopView