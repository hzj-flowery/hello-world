-- @Author panhoa
-- @Date 10.15.2018
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local SeasonShopView = class("SeasonShopView", ViewBase)
local ShopConst = require("app.const.ShopConst")
local SeasonShopCell = require("app.scene.view.seasonShop.SeasonShopCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")

-- @Role Get Connected-Info while Entry(Obsolutly in SeasonShopView.lua
function SeasonShopView:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
		callBack()
	end

	G_UserData:getSeasonSport():c2sFightsEntrance()
	local signal = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, onMsgCallBack)
	return signal
end

function SeasonShopView:ctor()
	local resource = {
		file = Path.getCSB("SeasonShopView", "seasonShop"),
		size = G_ResolutionManager:getDesignSize(),
	}
	SeasonShopView.super.ctor(self, resource)
end

function SeasonShopView:onCreate()
	self._selectTabIndex = 1
	self._goodIds = {}

	self._topbarBase:setImageTitle("txt_sys_fight_shangdian")
	self._textTitle:setString(Lang.get("season_shop_title"))
	self:_initTopBarRes()
	self:_initListView()
end

function SeasonShopView:_initTopBarRes()
	self._shopData = G_UserData:getShops():getShopCfgById(ShopConst.SEASOON_SHOP)
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

function SeasonShopView:_initListView()
	self._listView:setTemplate(SeasonShopCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function SeasonShopView:onEnter()
	self._signalUpdateShopGoods = G_SignalManager:add(SignalConst.EVENT_SHOP_INFO_NTF, handler(self, self._onEventUpdateShopGoods)) 	 -- 刷新状态
	self._signalListnerSeasonEnd = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_END, handler(self, self._onEventListnerSeasonEnd)) -- 监听赛季结束

	self:_updateData()
	self:_updateView()
	G_UserData:getShops():c2sGetShopInfo(ShopConst.SEASOON_SHOP)
end

function SeasonShopView:onExit()
	self._signalUpdateShopGoods:remove()
	self._signalListnerSeasonEnd:remove()
	self._signalUpdateShopGoods = nil
	self._signalListnerSeasonEnd = nil
end

function SeasonShopView:_onEventListnerSeasonEnd()
	G_SceneManager:popScene()
	G_UserData:getSeasonSport():c2sFightsEntrance()
end

function SeasonShopView:_updateData()
	self._itemList = {}
	self._itemList = G_UserData:getShops():getShopGoodsList(self._shopId, 1)
end

function SeasonShopView:_updateView()
	local lineCount = math.ceil(#self._itemList / 2)
	self._listView:clearAll()
    self._listView:resize(lineCount)
end

function SeasonShopView:_onEventUpdateShopGoods(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	if rawget(message, "shop_id") ~= ShopConst.SEASOON_SHOP then
		return
	end

	self:_updateData()
	self:_updateView()
end

function SeasonShopView:_onItemUpdate(item, index)
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

		item:update(index, itemLine)
	end
end

function SeasonShopView:_onItemSelected(item, index)
end

function SeasonShopView:_onItemTouch(index, itemPos)
	local lineIndex = index
	local shopItemData = self:_getItemDataByPos(itemPos)
	if shopItemData == nil then
		return
	end
	local fixData = shopItemData:getConfig()

	local type = fixData["price1_type"]
	local value = fixData["price1_value"]
	local size = fixData["price1_size"]
	local itemId = fixData["value"]
	if type == ShopConst.NORMAL_SHOP_SUB_MONEY then   --商店充值商品特殊处理
		local VipPay = require("app.config.vip_pay")
		local Item = require("app.config.item")
		local payCfg = VipPay.get(value)
		local itemCfg = Item.get(itemId)

		G_GameAgent:pay(payCfg.id, payCfg.rmb, payCfg.product_id, itemCfg.name, itemCfg.name)
		return
	end

	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local success,erroMsg,funcName = LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true)
	if success == false then
		return
	end
	UIPopupHelper.popupFixShopBuyItem(shopItemData)
end

function SeasonShopView:_getItemDataByPos(pos)
	local itemList = self._itemList
	if pos > 0 and pos <= #itemList then
		return itemList[pos]
	end
	return nil
end


return SeasonShopView