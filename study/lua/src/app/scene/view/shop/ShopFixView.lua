local ViewBase = require("app.ui.ViewBase")
local ShopFixView = class("ShopFixView", ViewBase)
local ShopViewItemCell = require("app.scene.view.shop.ShopViewItemCell")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local ShopConst = require("app.const.ShopConst")

function ShopFixView:ctor(mainView, shopId, callback)
	--左边控件
	self._listViewTab = nil --列表控件
	self._tabGroup2 = nil --子标签页控件
	--数据
	self._itemList = {}
	self._shopId = shopId
	self._mainView = mainView

	self._selectItemPos = 1 --选中物品index
	self._selectSubTabIndex = 0
	self._callBackFunc = callback or nil
	self._isFirstCreate = true

	self._ccAlertEnable = false 	-- 货币变更提醒
	--self._selectSubTabIndex = 1 -- 子标签
	local resource = {
		file = Path.getCSB("ShopFixView", "shop"),
		binding = {}
	}
	self:setName("ShopFixView")
	ShopFixView.super.ctor(self, resource)
end

function ShopFixView:onCreate()
	local TabScrollView = require("app.utils.TabScrollView")
	local tabType = ShopHelper.getTabTypeByTab(self._shopId, 1)
	self._scrollViewParam = {
		template = ShopConst.SHOP_FIX_VIEW_CELL[tabType],
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch)
	}
	self._tabListView = TabScrollView.new(self._listViewTab, self._scrollViewParam)

	local shopCfg = G_UserData:getShops():getShopCfgById(self._shopId)
	self._commonFullScreen:setTitle(shopCfg.shop_name)
	self._subSelectTimes = 0
	self:_initTab()
end

function ShopFixView:onEnter()
	self._enterEventTimes = 0
	self._signalCurrencyChange = G_SignalManager:add(SignalConst.EVENT_RECHARGE_GET_INFO, handler(self, self._onEventCurrencyChange))
end

function ShopFixView:onExit()
	self._signalCurrencyChange:remove()
	self._signalCurrencyChange = nil
end

-- 充值完成后，更新价格文字颜色
function ShopFixView:_onEventCurrencyChange(eventName, message)
	if self._ccAlertEnable then
		self:refreshView()
	end
end

function ShopFixView:_initTab()
	local shopId = self._shopId
	local param2 = {
		callback = handler(self, self._onTabSelect2),
		isVertical = 2,
		offset = -2,
		textList = UserDataHelper.getShopSubTab(shopId)
	}

	self._tabGroup2:recreateTabs(param2)

	self._tabGroup2:setTabIndex(1)
end

function ShopFixView:setRedPointByTabIndex(index, redValue)
	self._tabGroup2:setRedPointByTabIndex(index, redValue)
end

function ShopFixView:setImageTipByTabIndex(index, redValue, posPercent, texture)
	self._tabGroup2:setImageTipByTabIndex(index, redValue, posPercent, texture)
end

--
function ShopFixView:setCallBack(callback)
	self._callBackFunc = callback
end

function ShopFixView:_onTabSelect2(index, sender)
	if self._selectSubTabIndex == index then
		return
	end
	local lastIndex = self._selectSubTabIndex
	self._selectSubTabIndex = index
	--子标签切换，直接做刷新
	-- self:refreshView()
	if self._selectSubTabIndex > 0 then
		self:refreshView()
	end
	--在第一次create的时候不调用playSubRefreshEffect
	if self._subSelectTimes >= 1 then
		self:playSubRefreshEffect()
    end
    
	self._subSelectTimes = self._subSelectTimes + 1
    local tabType = ShopHelper.getTabTypeByTab(self._shopId, self._selectSubTabIndex)
    if tabType == ShopConst.TABL_TYPE_NEW then
        ShopHelper.saveNewRemindShop(self:_getSelectItemList(), index)
		self._imageBg2:setVisible(false)
	else
		self._imageBg2:setVisible(false)
	end
end

function ShopFixView:getSubIndex( ... )
    return self._selectSubTabIndex
end

function ShopFixView:setTabIndex(index)
	self._tabGroup2:setTabIndex(index)
end

function ShopFixView:_getSelectItemList()
	local selectItemList = self._itemList

	return selectItemList
end

function ShopFixView:_onItemTouch(index, itemPos)
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
	if type == ShopConst.NORMAL_SHOP_SUB_MONEY then --商店充值商品特殊处理
		local VipPay = require("app.config.vip_pay")
		local Item = require("app.config.item")
		local payCfg = VipPay.get(value)
		local itemCfg = Item.get(itemId)
		G_GameAgent:pay(payCfg.id, payCfg.rmb, payCfg.product_id, itemCfg.name, itemCfg.name)
		return
	end

	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local success, erroMsg, funcName = LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true)
	if success == false then
		--检查函数没返回错误，先临时处理
		--G_Prompt:showTip(Lang.get("common_res_not_enough"))
		return
	end
	UIPopupHelper.popupFixShopBuyItem(shopItemData)
end

function ShopFixView:_onItemSelected(item, index)
end

function ShopFixView:_onItemUpdate(item, index)
	local tabType = ShopHelper.getTabTypeByTab(self._shopId, self._selectSubTabIndex)
	local item_count = ShopConst.SHOP_FIX_VEWI_CELL_ITEM_COUNT[tabType]
	local startIndex = index * item_count
	logWarn("ShopFixView:_onItemUpdate  startIndex :: " .. startIndex .. "       index :: " .. index)
	-- local endIndex = startIndex + 1

	local itemList = self:_getSelectItemList()

	if self._itemList and #self._itemList > 0 then
		local itemLine = {}
		for i = 1, item_count do
			local itemData = self._itemList[startIndex + i]
			if itemData then
				table.insert(itemLine, itemData)
			end
		end
		item:update(index, itemLine, self._selectSubTabIndex)
	end
end

function ShopFixView:refreshView(needAnimation)
	self._itemList = {}
	local shopMgr = G_UserData:getShops()
	local shopId = self._shopId

	local subIndex = ShopHelper.convertSubIndexToSubId(shopId, self._selectSubTabIndex)
	local itemList = shopMgr:getShopGoodsList(shopId, subIndex)
	self._itemList = itemList

	self:_updateCurrencyChangeAlert()

	local tabType = ShopHelper.getTabTypeByTab(self._shopId, self._selectSubTabIndex)
	self._scrollViewParam.template = ShopConst.SHOP_FIX_VIEW_CELL[tabType]
	local item_count = ShopConst.SHOP_FIX_VEWI_CELL_ITEM_COUNT[tabType]
	--刷新数据
	local lineCount = math.ceil(#itemList / item_count)
	if lineCount > 0 then
		self._tabListView:updateListView(self._selectSubTabIndex, lineCount, self._scrollViewParam)
	end
end

-- 更新货币变更提醒的标志位
function ShopFixView:_updateCurrencyChangeAlert()
	local alert = false
	for i,v in ipairs(self._itemList) do
		local item = v:getConfig()
		for j=1,2 do
			local type = item["price" .. j .. "_type"]
			local value = item["price" .. j .. "_value"]
			if type==5 and (value==1 or value==33) then
				alert = true
				break
			end
		end
		if alert then
			break
		end
	end
	self._ccAlertEnable = alert
end

function ShopFixView:findCellItem(cellRow, cellCol)
	-- body
	local listView = self._tabListView:getListView(self._selectSubTabIndex)
	local ShopViewItemCell = listView:getSubNodeByName("ShopViewItemCell" .. cellRow)
	local shopItemCell = listView:getSubNodeByName("_itemInfo" .. cellCol)

	return shopItemCell
end

function ShopFixView:_getItemDataByPos(pos)
	local itemList = self._itemList
	if pos > 0 and pos <= #itemList then
		return itemList[pos]
	end
	return nil
end

function ShopFixView:_updateShopRes()
	--取到第一个Item
	local shopCfg = G_UserData:getShops():getShopCfgById(self._shopId)

	local size1 = UserDataHelper.getNumByTypeAndValue(shopCfg.price1_type, shopCfg.price1_value)

	self._shopRes1:setVisible(false)
	if shopCfg.price1_type > 0 then
		self._shopRes1:updateUI(shopCfg.price1_type, shopCfg.price1_value, size1)
		self._shopRes1:setVisible(true)
	end

	if shopCfg.price2_type > 0 and shopCfg.price2_value > 0 then
		local size2 = UserDataHelper.getNumByTypeAndValue(shopCfg.price2_type, shopCfg.price2_value)
		self._shopRes2:updateUI(shopCfg.price2_type, shopCfg.price2_value, size2)
		self._shopRes2:setVisible(true)
	else
		self._shopRes2:setVisible(false)
	end
end

function ShopFixView:playSubRefreshEffect()
	local listView = self._tabListView:getListView(self._selectSubTabIndex)
	if listView then
		local function postEvent(...)
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "playSubRefreshEffect")
		end
		listView:playEnterEffect(postEvent)
	end
end

function ShopFixView:playEnterEffect()
	local listView = self._tabListView:getListView(self._selectSubTabIndex)
	if listView then
		local function postEvent(...)
			if self._enterEventTimes == 0 then
				G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "playEnterEffect")
				self._enterEventTimes = self._enterEventTimes + 1
			end
		end
		listView:playEnterEffect(postEvent)
	end
end

function ShopFixView:setListViewParentVisible(trueOrFalse)
	self._listViewParent:setVisible(trueOrFalse)
end

function ShopFixView:getAndResetPlayRefeshEffectTag()
	return false
end

return ShopFixView
