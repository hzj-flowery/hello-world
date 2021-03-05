--弹出界面
--物品购买弹窗
--主要用于商店界面
local PopupItemUse = require("app.ui.PopupItemUse")
local PopupShopItemBuy = class("PopupShopItemBuy", PopupItemUse)
local UserDataHelper = require("app.utils.UserDataHelper")
local Path = require("app.utils.Path")
local ShopConst = require("app.const.ShopConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupShopItemBuy:ctor(title, callback )
	--
	self._title = title or Lang.get("common_title_buy_item") 
	self._callback = callback
	self._costResInfo1 = nil --消耗资源
	self._shopItemData = nil
	self._useNum  = 1 

	PopupShopItemBuy.super.ctor(self, title, callback)
end

function PopupShopItemBuy:onInitCsb()
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("PopupShopItemBuy", "common"),
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
function PopupShopItemBuy:onCreate()
	-- button

	PopupShopItemBuy.super.onCreate(self)

	self._costResInfo2:setVisible(false)
	--self._costResInfo1:showResName(true,Lang.get("lang_common_buy_item_total_price_desc"))
end


function PopupShopItemBuy:onEnter()
    
end

function PopupShopItemBuy:onExit()
    
end

function PopupShopItemBuy:_onNumSelect(num)
	logDebug("_onNumSelect :"..num)
	self._useNum = num
	local price1,type1,value1 = self:_getItemPrice(1)
	self:setCostInfo1(type1,value1, price1)

    local price2,type2,value2 = self:_getItemPrice(2)
	if value2 > 0 then
		self:setCostInfo2(type2,value2, price2)
	end
end

function PopupShopItemBuy:_getItemPrice(index)
	index = index or 1
	local itemCfg = self._shopItemData:getConfig()
	local buyCount = self._shopItemData:getBuyCount()
	local itemPrice = itemCfg[string.format("price%d_size", index)]
	local itemPriceAdd = itemCfg[string.format("price%d_add", index)]
	local itemPriceValue = itemCfg[string.format("price%d_value", index)]
	local itemPriceType = itemCfg[string.format("price%d_type",index)]
	if itemPriceAdd > 0 then
		itemPrice = UserDataHelper.getTotalPriceByAdd(itemPriceAdd,buyCount,self._useNum )
	else
		itemPrice = itemPrice * self._useNum
	end

	return itemPrice, itemPriceType, itemPriceValue
end

function PopupShopItemBuy:updateUI( shopId,shopItemId )
	
	local shopMgr = G_UserData:getShops()
	local shopItemData = shopMgr:getShopGoodsById(shopId, shopItemId)

	if shopItemData and type(shopItemData) ~="table" then
		return
	end
	
	self._shopItemData = shopItemData

	local surplus = shopItemData:getSurplusTimes() -- 剩余购买次数
	local itemCfg = shopItemData:getConfig()
	local itemOwnerNum = UserDataHelper.getNumByTypeAndValue(itemCfg.type,itemCfg.value)
	PopupShopItemBuy.super.updateUI(self,itemCfg.type,itemCfg.value,itemCfg.size)

	if surplus > 0 then
		self:setMaxLimit(surplus)
		if itemCfg.num_ban_type == 1 then--0无限制，1终生，2每日
			self:setTextTips(Lang.get("shop_buy_limit_final", {num = surplus}))
        elseif itemCfg.num_ban_type == 5 then -- 赛季
            if shopId == ShopConst.ALL_SERVER_GOLDHERO_SHOP then    -- 金将
                self:setTextTips(Lang.get("shop_condition_acticity_buynum", {num = surplus}))
            else
                self:setTextTips(Lang.get("shop_condition_season_buynum", {num = surplus}))
            end
		else
			self:setTextTips(Lang.get("shop_buy_limit_day", {num = surplus}))
		end
	
	else
		self:setTextTips(" ")
	end
	
	self:setOwnerCount(itemOwnerNum)
	self:_onNumSelect(self._useNum)

end


function PopupShopItemBuy:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback(self._itemId, self._useNum)
	end
	if not isBreak then
		self:close()
	end
end


function PopupShopItemBuy:setCostInfo1(costType,costValue, costSize)
	self._costResInfo1:updateUI(costType,costValue,costSize)
end



function PopupShopItemBuy:setCostInfo2(costType,costValue, costSize)
	self._costResInfo2:updateUI(costType,costValue,costSize)
	self._costResInfo2:setVisible(true)
end

return PopupShopItemBuy