--弹出界面
--物品购买弹窗
--主要用于商店界面
local PopupItemUse = require("app.ui.PopupItemUse")
local PopupCrystalShopItemBuy = class("PopupCrystalShopItemBuy", PopupItemUse)
local UserDataHelper = require("app.utils.UserDataHelper")
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupCrystalShopItemBuy:ctor(title, callback )
	--
	self._title = title or Lang.get("common_title_buy_item")
	self._callback = callback
	self._costResInfo1 = nil --消耗资源
	self._shopItemData = nil
	self._useNum  = 1

	PopupCrystalShopItemBuy.super.ctor(self, title, callback)
end

function PopupCrystalShopItemBuy:onInitCsb()
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("PopupCrystalShopItemBuy", "crystalShop"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "onBtnCancel"}}
			},
		}
	}
   if resource then
        CSHelper.createResourceNode(self, resource)
    end
end

--
function PopupCrystalShopItemBuy:onCreate()
	-- button

	PopupCrystalShopItemBuy.super.onCreate(self)

	self._costResInfo2:setVisible(false)
	--self._costResInfo1:showResName(true,Lang.get("lang_common_buy_item_total_price_desc"))
end


function PopupCrystalShopItemBuy:onEnter()

end

function PopupCrystalShopItemBuy:onExit()

end

function PopupCrystalShopItemBuy:_onNumSelect(num)
	logDebug("_onNumSelect :"..num)
	self._useNum = num
	local price1,type1,value1 = self:_getItemPrice(1)
	self:setCostInfo1(type1,value1, price1)

    local price2,type2,value2 = self:_getItemPrice(2)
	if value2 > 0 then
		self:setCostInfo2(type2,value2, price2)
	end
end

function PopupCrystalShopItemBuy:_getItemPrice(index)
	index = index or 1
	local itemCfg = self._shopItemData:getConfig()
	local itemPriceType = itemCfg[string.format("price_type_%d",index)]
	if itemPriceType == 0 then
		return 0, 0, 0
	end
	local itemPriceValue = itemCfg[string.format("price_value_%d", index)]
	local itemPrice = itemCfg[string.format("price_size_%d", index)]
	itemPrice = itemPrice * self._useNum
	return itemPrice, itemPriceType, itemPriceValue
end


function PopupCrystalShopItemBuy:_fixMaxLimit()
	local leftBuyCount = self._shopItemData:getLeftBuyCount()
	local cfg = self._shopItemData:getConfig()

	local max = 99999
	for i = 1, 2 do
		if cfg["price_value_"..i] ~= 0 then
			local num = UserDataHelper.getNumByTypeAndValue(cfg["price_type_"..i], cfg["price_value_"..i])
			num = math.floor(num/cfg["price_size_"..i])
			if num < max then
				max = num
			end
		end
	end

	if leftBuyCount > 0 and  leftBuyCount < max then
		max = leftBuyCount
	end
	self:setMaxLimit(max)
end


function PopupCrystalShopItemBuy:updateUI( shopItemData )
	self._shopItemData = shopItemData

	local leftBuyCount = shopItemData:getLeftBuyCount()
	local itemCfg = shopItemData:getConfig()

	local itemOwnerNum = UserDataHelper.getNumByTypeAndValue(itemCfg.good_type,itemCfg.good_value)
	PopupCrystalShopItemBuy.super.updateUI(self,itemCfg.good_type,itemCfg.good_value,itemCfg.good_size)

	if leftBuyCount > 0 then
		self:setTextTips(Lang.get("lang_crystal_shop_buy_limit_final", {num = leftBuyCount}))
	else
		self:setTextTips(" ")
	end
	self:_fixMaxLimit()
	self:setOwnerCount(itemOwnerNum)
	self:_onNumSelect(self._useNum)
end

function PopupCrystalShopItemBuy:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback(self._shopItemData, self._useNum)
	end
	if not isBreak then
		self:close()
	end
end

function PopupCrystalShopItemBuy:setCostInfo1(costType,costValue, costSize)
	self._costResInfo1:updateUI(costType,costValue,costSize)
end

function PopupCrystalShopItemBuy:setCostInfo2(costType,costValue, costSize)
	self._costResInfo2:updateUI(costType,costValue,costSize)
	self._costResInfo2:setVisible(true)
end

return PopupCrystalShopItemBuy
