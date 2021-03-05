
-- Author: nieming
-- Date:2018-02-06 17:35:22
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local CrystalShopFixClient = class("CrystalShopFixClient", ViewBase)
local CrystalChargeShopCell = require("app.scene.view.crystalShop.CrystalChargeShopCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TimeConst = require("app.const.TimeConst")

function CrystalShopFixClient:ctor(shopCfg)

	--csb bind var name
	self._listViewParent = nil  --SingleNode
	self._listViewTab = nil  --ScrollView
	self._shopCfg = shopCfg
	local resource = {
		file = Path.getCSB("CrystalShopFixClient", "crystalShop"),

	}
	CrystalShopFixClient.super.ctor(self, resource)
end

-- Describle：
function CrystalShopFixClient:onCreate()
	-- self._commonTitle:setTitle(Lang.get("lang_crystal_shop_title"))
	self:_initListViewTab()
	self:_initCountdown()
	self:_startCountDown()
end

-- Describle：

function CrystalShopFixClient:onEnter()

end

-- Describle：
function CrystalShopFixClient:onExit()


end
function CrystalShopFixClient:_initListViewTab()
	-- body
	self._listViewTab:setTemplate(CrystalChargeShopCell)
	self._listViewTab:setCallback(handler(self, self._onListViewTabItemUpdate), handler(self, self._onListViewTabItemSelected))
	self._listViewTab:setCustomCallback(handler(self, self._onListViewTabItemTouch))
end


function CrystalShopFixClient:_initCountdown()
	-- self._countdownTime:setCountdownLableParam({color = Colors.DARK_BG_THREE})
	-- self._countdownTime:setCountdownTimeParam({color = Colors.DARK_BG_ONE})
	-- _countdownTime
end

function CrystalShopFixClient:_startCountDown()
	local t = G_ServerTime:secondsFromZero(openServerTime)
	local date = G_ServerTime:getDateObject(t)
	local dayNum = 0
	if date.wday > 2 then
		dayNum = 2 + 7 - date.wday
	elseif date.wday == 2 then
		if G_ServerTime:getTime() >= t then
			dayNum = 7
		else
			dayNum = 0
		end
	else
		dayNum = 2 - date.wday
	end
	t = t + dayNum * 24 * 3600

	self._countdownTime:startCountDown(Lang.get("lang_crystal_shop_countdown_label"), t, function()
		G_UserData:getCrystalShop():requestShopData(true)
		self:_startCountDown()
	end, function(t)
		local leftTime = t - G_ServerTime:getTime()
		local day,hour,min,second = G_ServerTime:convertSecondToDayHourMinSecond(leftTime)
		if day >= 1 then
		   return  string.format(Lang.get("common_time_DHMS"), day, hour, min, second)
		end
		local time =  string.format(Lang.get("common_time_DHM"), hour, min,second)
		return time
	end)
end

-- Describle：
function CrystalShopFixClient:_onListViewTabItemUpdate(item, index)
	local cellData = {}
	for i=1, 2 do
		local j = (index*2 + i)
		if self._itemList[j] then
			table.insert(cellData, {data = self._itemList[j]})
		end
	end

	item:updateUI(cellData)
end

-- Describle：
function CrystalShopFixClient:_onListViewTabItemSelected(item, index)

end
-- Describle：
function CrystalShopFixClient:_onListViewTabItemTouch(index, data)
	if not data then
		return
	end
	local leftBuyCount = data:getLeftBuyCount()
	if leftBuyCount == -1 or leftBuyCount > 0 then
		local cfg = data:getConfig()
		for i = 1, 2 do
			local canBuy = LogicCheckHelper.enoughValue(cfg["price_type_"..i],cfg["price_value_"..i],cfg["price_size_"..i],true)
			if not canBuy then
				return
			end
		end
		local PopupCrystalShopItemBuy = require("app.scene.view.crystalShop.PopupCrystalShopItemBuy")
		local p = PopupCrystalShopItemBuy.new(Lang.get("lang_crystal_shop_popup_buy_title"), function(shopItemData, num)
			G_UserData:getCrystalShop():c2sShopCrystalBuy(shopItemData:getId(), num)
		end)
		p:updateUI(data)
		p:openWithAction()
	end
end

function CrystalShopFixClient:setPlayEnterEffectTag(trueOrFalse)
	self._playerEnterFlag = trueOrFalse
	if self._playerEnterFlag then
		self:setListViewVisible(false)
	end
end

function CrystalShopFixClient:playEnterEffect()
	if self._playerEnterFlag then
		self:setListViewVisible(true)
		self._listViewTab:playEnterEffect()
		self._playerEnterFlag = nil
	end
end

function CrystalShopFixClient:setListViewVisible(trueOrFalse)
	self._listViewTab:setVisible(trueOrFalse)
end

function CrystalShopFixClient:refreshClient()
	local itemList = G_UserData:getCrystalShop():getShopData()
	self._itemList =  itemList
	local lineCount = math.ceil( #itemList / 2 )
	self._listViewTab:resize(lineCount)
	self:playEnterEffect()

end

return CrystalShopFixClient
