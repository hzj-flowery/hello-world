-- @Author panhoa
-- @Date 5.15.2019
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local GachaGoldShopView = class("GachaGoldShopView", ViewBase)
local ShopConst = require("app.const.ShopConst")
local GoldHeroShopItemCell = import(".GoldHeroShopItemCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")


function GachaGoldShopView:ctor()
	local resource = {
		file = Path.getCSB("GachaGoldShopView", "gachaGoldShop"),
		size = G_ResolutionManager:getDesignSize(),
	}
	GachaGoldShopView.super.ctor(self, resource)
end

function GachaGoldShopView:onCreate()
	self._selectTabIndex = 1
	self._goodIds = {}

	self._topbarBase:setImageTitle("txt_sys_com_jinjiangshangdian")
	self._commonFullScreen:setTitle(Lang.get("gacha_goldenhero_shop_title"))
    self:_initTopBarRes()
    self:_initTabNode()
	self:_initListView()
end

function GachaGoldShopView:onEnter()
	self._signalUpdateShopGoods = G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventUpdateShopGoods)) 	 -- 刷新状态

	self:_updateData()
	G_UserData:getShops():c2sGetShopInfo(ShopConst.ALL_SERVER_GOLDHERO_SHOP)
end

function GachaGoldShopView:onExit()
	self._signalUpdateShopGoods:remove()
	self._signalUpdateShopGoods = nil
end

function GachaGoldShopView:_initTopBarRes()
	self._shopData = G_UserData:getShops():getShopCfgById(ShopConst.ALL_SERVER_GOLDHERO_SHOP)
	self._shopId = self._shopData.shop_id
    local resList = ShopHelper.getResListByShopCfg(self._shopData)

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
end

function GachaGoldShopView:_initTabNode()    
    local tabNameList = ShopActiveDataHelper.getShopSubTab(ShopConst.ALL_SERVER_GOLDHERO_SHOP)
    local param = {
        isVertical = 2,
        callback = handler(self, self._onTabSelect),
        textList = tabNameList
    }
    self._tabGroup:recreateTabs(param)
end

function GachaGoldShopView:_onTabSelect(index, sender)
    self._selectTabIndex = index
    self:_updateData()
end

function GachaGoldShopView:_initListView()
	self._listView:setTemplate(GoldHeroShopItemCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function GachaGoldShopView:_updateData()
    self._itemList = {}
    self._itemList = G_UserData:getShops():getShopGoodsList(self._shopId, self._selectTabIndex)
    self:_updateView()
end

function GachaGoldShopView:_updateView()
	local lineCount = math.ceil(#self._itemList / 2)
	self._listView:clearAll()
    self._listView:resize(lineCount)
end

function GachaGoldShopView:_onEventUpdateShopGoods(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	if rawget(message, "shop_id") ~= ShopConst.ALL_SERVER_GOLDHERO_SHOP then
		return
	end

	self:_updateData()
end

function GachaGoldShopView:_onItemUpdate(item, index)
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

function GachaGoldShopView:_onItemSelected(item, index)
end

function GachaGoldShopView:_onItemTouch(index, itemPos)
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
	UIPopupHelper.popupFixShopBuyItem(shopItemData, FunctionConst.FUNC_GACHA_GOLDENHERO_SHOP)
end

function GachaGoldShopView:_getItemDataByPos(pos)
	local itemList = self._itemList
	if pos > 0 and pos <= #itemList then
		return itemList[pos]
	end
	return nil
end


return GachaGoldShopView