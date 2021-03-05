
-- Author: nieming
-- Date:2018-02-06 17:35:20
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CrystalShopRandomClient = class("CrystalShopRandomClient", ViewBase)
local ShopViewItemCell = require("app.scene.view.shop.ShopViewItemCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

function CrystalShopRandomClient:ctor(shopCfg)

	--csb bind var name
	self._btnRefresh = nil  --CommonButtonNormal
	self._listViewParent = nil  --SingleNode
	self._listViewTab = nil  --ScrollView
	self._textHaveCount = nil  --Text
	self._shopCfg = shopCfg
	local resource = {
		file = Path.getCSB("CrystalShopRandomClient", "crystalShop"),
		binding = {
			_btnRefresh = {
				events = {{event = "touch", method = "_onBtnRefresh"}}
			},
		},
	}
	CrystalShopRandomClient.super.ctor(self, resource)
end

-- Describle：
function CrystalShopRandomClient:onCreate()
	self:_initListViewTab()
	self._btnRefresh:setString(Lang.get("shop_btn_refresh"))
end

-- Describle：
function CrystalShopRandomClient:onEnter()

end

-- Describle：
function CrystalShopRandomClient:onExit()

end
-- Describle：
function CrystalShopRandomClient:_onBtnRefresh()
	-- body
	local shopID  = self._shopCfg.shop_id
	local function sendCall(refreshType)
		logWarn("_onButtonRefresh   "..refreshType)
		G_UserData:getShops():c2sShopRefresh(shopID, refreshType)
		-- self._isNeedPlayRefeshEffect = true
	end
	self:setPlayEnterEffectTag(true)
	LogicCheckHelper.shopRefreshBtnCheck(shopID,sendCall)
end

function CrystalShopRandomClient:_initListViewTab()
	-- body
	self._listViewTab:setTemplate(ShopViewItemCell)
	self._listViewTab:setCallback(handler(self, self._onListViewTabItemUpdate), handler(self, self._onListViewTabItemSelected))
	self._listViewTab:setCustomCallback(handler(self, self._onListViewTabItemTouch))
	-- self._listViewTab:resize()
end

function CrystalShopRandomClient:_getSelectItemList()
	return self._itemList or {}
end

function CrystalShopRandomClient:_getItemDataByPos(pos)
	local itemList = self._itemList
	if pos > 0 and pos <= #itemList then
		return itemList[pos]
	end
	return nil
end
-- Describle：
function CrystalShopRandomClient:_onListViewTabItemUpdate(item, index)
	local startIndex = index * 2 + 1
	logWarn("ShopRandomView:_onItemUpdate  "..startIndex)
	local endIndex = startIndex + 2
	local itemLine = {}

	local itemList = self:_getSelectItemList()

	if itemList and #itemList > 0 then
		for i = startIndex, endIndex do
			local itemData = itemList[i]
			if itemData then
				table.insert(itemLine, itemData)
			end
		end
		item:update(index,itemLine)
	end
end

-- Describle：
function CrystalShopRandomClient:_onListViewTabItemSelected(item, index)

end

-- Describle：
function CrystalShopRandomClient:_onListViewTabItemTouch(index, itemPos)
	local lineIndex = index
	local shopItemData = self:_getItemDataByPos(itemPos)
	--dump(shopItemData)

	if LogicCheckHelper.shopRandomBuyCheck(shopItemData) == false then
		return
	end

	UIPopupHelper.popupRandomShopBuyItem(shopItemData)
end

function CrystalShopRandomClient:refreshClient()
	local shopID = self._shopCfg.shop_id
	self._itemList = {}
	local shopMgr = G_UserData:getShops()
	local itemList = shopMgr:getShopGoodsList(shopID) or {}
	self._itemList =  itemList
	local lineCount = math.ceil( #itemList / 2 )
	self._listViewTab:resize(lineCount)

	local shopInfo = UserDataHelper.getRandomShopInfo(shopID)
	if shopInfo and shopInfo.freeCnt then
		self._textHaveCount:setString(shopInfo.freeCnt.."/"..shopInfo.freeCntTotal)
	end
	self:playEnterEffect()
end

function CrystalShopRandomClient:setWaitForFirstEnterTag(trueOrFalse)
	self._waitForFirstEnterTag = trueOrFalse
	if self._waitForFirstEnterTag then
		self:setListViewVisible(false)
	end
end

function CrystalShopRandomClient:setPlayEnterEffectTag(trueOrFalse)
	if self._waitForFirstEnterTag then
		return
	end
	self._playerEnterFlag = trueOrFalse
	if self._playerEnterFlag then
		self:setListViewVisible(false)
	end
end

function CrystalShopRandomClient:playEnterEffect()
	if self._playerEnterFlag then
		self:setListViewVisible(true)
		self._listViewTab:playEnterEffect()
		self._playerEnterFlag = nil
	end
end

function CrystalShopRandomClient:setListViewVisible(trueOrFalse)
	self._listViewTab:setVisible(trueOrFalse)
end

return CrystalShopRandomClient
