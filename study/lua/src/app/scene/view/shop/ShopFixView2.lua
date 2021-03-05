local ViewBase = require("app.ui.ViewBase")
local ShopFixView2 = class("ShopFixView2", ViewBase)
local ShopViewItemCell2 = require("app.scene.view.shop.ShopViewItemCell2")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local ShopHelper = require("app.scene.view.shop.ShopHelper")
local ShopConst = require("app.const.ShopConst")
local ITEM_COUNT = 4

function ShopFixView2:ctor(mainView, shopId,callback)
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
	--self._selectSubTabIndex = 1 -- 子标签
    local resource = {
        file = Path.getCSB("ShopFixView2", "shop"),
        binding = {

		}
    }
	self:setName("ShopFixView2")
    ShopFixView2.super.ctor(self, resource)
end


function ShopFixView2:onCreate()
	local TabScrollView = require("app.utils.TabScrollView")
	local scrollViewParam = {
		template = ShopViewItemCell2,
		updateFunc = handler(self, self._onItemUpdate),
		selectFunc = handler(self, self._onItemSelected),
		touchFunc = handler(self, self._onItemTouch),
	}
	self._tabListView = TabScrollView.new(self._listViewTab,scrollViewParam)



	local shopCfg = G_UserData:getShops():getShopCfgById(self._shopId)
	self._commonFullScreen:setTitle(shopCfg.shop_name)
	self._subSelectTimes = 0
	self:_initTab()
end



function ShopFixView2:onEnter()
	self._enterEventTimes = 0
end

function ShopFixView2:onExit()

end

function ShopFixView2:_initTab()
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
function ShopFixView2:setRedPointByTabIndex(index,redValue)
	self._tabGroup2:setRedPointByTabIndex(index, redValue)
end
--
function ShopFixView2:setCallBack(callback)
	self._callBackFunc = callback
end

function ShopFixView2:_onTabSelect2(index, sender)
	if self._selectSubTabIndex == index then
		return
	end
	
	local lastIndex = self._selectSubTabIndex
	self._selectSubTabIndex = index
	-- self._selectSubTabIndex = index
	-- --子标签切换，直接做刷新
	-- self:refreshView()
	if self._selectSubTabIndex > 0 then
		local oldTabType = ShopHelper.getTabTypeByTab(self._shopId,lastIndex)  -- 当前使用UI类型
		local newTabType = ShopHelper.getTabTypeByTab(self._shopId,index) -- 切换使用UI类型
		if oldTabType == newTabType then
			--子标签切换，直接做刷新
			self:refreshView()
		else 	--不同tabType切换，父级刷新
			if self._callBackFunc and type(self._callBackFunc) == "function" then
				self._callBackFunc(index,self._shopId)
			end
			return
		end
	end
	--在第一次create的时候不调用playSubRefreshEffect
	if self._subSelectTimes >= 1 then
		self:playSubRefreshEffect()
	end
	self._subSelectTimes = self._subSelectTimes + 1	
end

function ShopFixView2:getSubIndex( ... )
    return self._selectSubTabIndex
end

function ShopFixView2:setTabIndex(index)
	self._tabGroup2:setTabIndex(index)
end

function ShopFixView2:_getSelectItemList()
	local selectItemList = self._itemList

	return selectItemList
end


function ShopFixView2:_onItemTouch(index, itemPos)
	local lineIndex = index
	local shopItemData = self:_getItemDataByPos(itemPos)
	if shopItemData == nil then
		return
	end
	local fixData = shopItemData:getConfig()
	-- dump(fixData)
	local type = fixData["price1_type"]
	local value = fixData["price1_value"]
	local size = fixData["price1_size"]
	local itemId = fixData["value"]
	if type == ShopConst.NORMAL_SHOP_SUB_MONEY then   --商店充值商品特殊处理
		local VipPay = require("app.config.vip_pay")
		local Item = require("app.config.item")
		local payCfg = VipPay.get(value)
		local itemCfg = Item.get(itemId)
		-- dump(payCfg)
		-- dump(itemCfg.name)
		G_GameAgent:pay(payCfg.id, payCfg.rmb, payCfg.product_id, itemCfg.name, itemCfg.name)
		return
	end

	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local success,erroMsg,funcName = LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true)
	if success == false then
		--检查函数没返回错误，先临时处理
	  	--G_Prompt:showTip(Lang.get("common_res_not_enough"))
		return
	end
	UIPopupHelper.popupFixShopBuyItem(shopItemData)
end

function ShopFixView2:_onItemSelected(item, index)

end

function ShopFixView2:_onItemUpdate(item, index)

	local startIndex = index * ITEM_COUNT
	logWarn("ShopFixView2:_onItemUpdate  startIndex :: "..startIndex.."       index :: "..index)


	local itemList = self:_getSelectItemList()

	if self._itemList and #self._itemList > 0 then
		local itemLine = {}
		local itemData1, itemData2, itemData3, itemData4 = self._itemList[startIndex + 1], self._itemList[startIndex + 2],self._itemList[startIndex + 3], self._itemList[startIndex + 4]
		if itemData1 then
			table.insert(itemLine, itemData1)
		end
		if itemData2 then
			table.insert(itemLine, itemData2)
		end
		if itemData3 then
			table.insert(itemLine, itemData3)
		end
		if itemData4 then
			table.insert(itemLine, itemData4)
		end

		--dump(itemLine)
		item:update(index, itemLine, self._selectSubTabIndex)
	end
end


function ShopFixView2:refreshView(needAnimation)
	self._itemList = {}
	local shopMgr = G_UserData:getShops()
	local shopId = self._shopId

	local subIndex = ShopHelper.convertSubIndexToSubId(shopId,self._selectSubTabIndex)

	local itemList = shopMgr:getShopGoodsList(shopId,subIndex)

	--dump(itemList)
	self._itemList =  itemList


	--刷新数据
	local lineCount = math.ceil( #itemList / ITEM_COUNT )
	if lineCount > 0 then
		self._tabListView:updateListView(self._selectSubTabIndex,lineCount)
	end
end

function ShopFixView2:findCellItem(cellRow, cellCol )
	-- body
	local listView  = self._tabListView:getListView(self._selectSubTabIndex)
	local ShopViewItemCell2 = listView:getSubNodeByName("ShopViewItemCell2"..cellRow)
	local shopItemCell = listView:getSubNodeByName("_itemInfo"..cellCol)

	return shopItemCell
end

function ShopFixView2:_getItemDataByPos(pos)
	local itemList = self._itemList
	if pos > 0 and pos <= #itemList then
		return itemList[pos]
	end
	return nil
end


function ShopFixView2:_updateShopRes()
	--取到第一个Item
	local shopCfg = G_UserData:getShops():getShopCfgById(self._shopId)

	local size1 = UserDataHelper.getNumByTypeAndValue(shopCfg.price1_type, shopCfg.price1_value)

	self._shopRes1:setVisible(false)
	if shopCfg.price1_type > 0 then
		self._shopRes1:updateUI(shopCfg.price1_type,shopCfg.price1_value,size1)
		self._shopRes1:setVisible(true)
	end

	if shopCfg.price2_type > 0 and shopCfg.price2_value > 0 then
		local size2 = UserDataHelper.getNumByTypeAndValue(shopCfg.price2_type, shopCfg.price2_value)
		self._shopRes2:updateUI(shopCfg.price2_type,shopCfg.price2_value,size2)
		self._shopRes2:setVisible(true)
	else
		self._shopRes2:setVisible(false)
	end
end

function ShopFixView2:playSubRefreshEffect()
	local listView = self._tabListView:getListView(self._selectSubTabIndex)
	if listView then
		local function postEvent( ... )
     		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "playSubRefreshEffect")
		end
		listView:playEnterEffect(postEvent)
	end
end


function ShopFixView2:playEnterEffect()
	local listView = self._tabListView:getListView(self._selectSubTabIndex)
	if listView then
		local function postEvent( ... )
			if self._enterEventTimes == 0 then
				G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"playEnterEffect")
				self._enterEventTimes = self._enterEventTimes + 1
			end
		end
		listView:playEnterEffect(postEvent)
	end
end


function ShopFixView2:setListViewParentVisible(trueOrFalse)
	self._listViewParent:setVisible(trueOrFalse)
end

function ShopFixView2:getAndResetPlayRefeshEffectTag()
	return false
end

return ShopFixView2
