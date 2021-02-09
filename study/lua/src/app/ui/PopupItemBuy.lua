--弹出界面
--通用物品购买弹窗
local PopupItemUse = require("app.ui.PopupItemUse")
local Path = require("app.utils.Path")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupItemBuy = class("PopupItemBuy", PopupItemUse)
local UserDataHelper = require("app.utils.UserDataHelper")
local ShopConst = require("app.const.ShopConst")

function PopupItemBuy:ctor(title, callback )
	self._title = title or Lang.get("common_title_buy_item") 
	self._callback = callback
	self._costResInfo1 = nil --消耗资源
	self._shopItemData = nil
	self._useNum  = 1 
	self._itemPriceByBuff1 = nil --神树祈福buff生效后的价格1
	self._itemPriceByBuff2 = nil --神树祈福buff生效后的价格2

	PopupItemBuy.super.ctor(self, title, callback)
end

function PopupItemBuy:onInitCsb()
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("PopupItemBuy", "common"),
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
function PopupItemBuy:onCreate()
	-- button

	PopupItemBuy.super.onCreate(self)

	self._costResInfo2:setVisible(false)
    --self._costResInfo1:showResName(true,Lang.get("lang_common_buy_item_total_price_desc"))
end


function PopupItemBuy:onEnter()
    
end

function PopupItemBuy:onExit()
    
end

function PopupItemBuy:_onNumSelect(num, add)
    add = add or false
    logDebug("_onNumSelect :"..num)
    self._useNum = num
    
	local price1,type1,value1 = self:_getItemPrice(1)
	self:setCostInfo1(type1,value1, price1)

    local price2,type2,value2 = self:_getItemPrice(2)
	if value2 > 0 then
		self:setCostInfo2(type2,value2, price2)
    end
    if add and PopupItemBuy.super.checkSlectNum(self, false) then
        return
    end
end

function PopupItemBuy:_getItemPrice(index)
	index = index or 1
	local itemCfg = self._shopItemData:getConfig()
	local buyCount = self._shopItemData:getBuyCount()
	local itemPrice = itemCfg[string.format("price%d_size", index)]
	local itemPriceAdd = itemCfg[string.format("price%d_add", index)]
	local itemPriceValue = itemCfg[string.format("price%d_value", index)]
	local itemPriceType = itemCfg[string.format("price%d_type",index)]
	local isUseBuff = false
	itemPrice, isUseBuff = self:_getPriceWithHomelandBuff(itemPrice, itemCfg, self._useNum, itemPriceAdd, buyCount)
	if isUseBuff then
		self["_itemPriceByBuff"..index] = itemPrice
	end

	return itemPrice, itemPriceType, itemPriceValue
end

--神树祈福Buff
function PopupItemBuy:_getPriceWithHomelandBuff(itemPrice, itemCfg, useNum, itemPriceAdd, buyCount)
	local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
	local HomelandConst = require("app.const.HomelandConst")
	self._textBuff:setString("")
	local itemType = itemCfg.type
	local itemValue = itemCfg.value
	local buffBaseId = HomelandConst.getBuffBaseId(itemType, itemValue)
	local isUseBuff = false
	if buffBaseId then
		local isCanUse, buffData = HomelandHelp.checkBuffIsCanUse(buffBaseId) 
		if isCanUse then
			local restCount = buffData:getRestCount()
			local disCount = math.min(useNum, restCount)--打折的数量
			local CommonCount = math.max(useNum-restCount, 0) --正常的数量
			local info = buffData:getConfig()
			local ratio = HomelandHelp.getRealValueOfBuff(info)
			local disPrice = itemPrice * (1-ratio) --打折的价格
			itemPrice = itemPrice*CommonCount + disPrice*disCount
			local name = TypeConvertHelper.convert(itemType, itemValue).name
			self._textBuff:setString(Lang.get("homeland_buff_tips_des_1", {restCount = restCount, name = name, value = (ratio*100).."%"}))
			isUseBuff = true
		else
			if itemPriceAdd > 0 then
				itemPrice = UserDataHelper.getTotalPriceByAdd(itemPriceAdd,buyCount,useNum )
			else
				itemPrice = itemPrice * useNum
			end
		end
	else
		if itemPriceAdd > 0 then
			itemPrice = UserDataHelper.getTotalPriceByAdd(itemPriceAdd,buyCount,useNum )
		else
			itemPrice = itemPrice * useNum
		end
	end

	return itemPrice, isUseBuff
end

function PopupItemBuy:updateUI( shopId,shopItemId )
	
	local shopMgr = G_UserData:getShops()
	local shopItemData = shopMgr:getShopGoodsById(shopId, shopItemId)

	if shopItemData and type(shopItemData) ~="table" then
		return
	end
	
	self._shopItemData = shopItemData

	local surplus = shopItemData:getSurplusTimes() -- 剩余购买次数
	local itemCfg = shopItemData:getConfig()
	local itemOwnerNum = UserDataHelper.getNumByTypeAndValue(itemCfg.type,itemCfg.value)
	PopupItemBuy.super.updateUI(self,itemCfg.type,itemCfg.value,itemCfg.size)

   if surplus > 0 then
		self:setMaxLimit(surplus)
		--self:setTextTips(Lang.get("shop_buy_limit_day", {num = surplus}))
	else
        --self:setTextTips(" ")
	end

	--[[if shopId == ShopConst.SEASOON_SHOP then
		self:setTextTips(Lang.get("shop_condition_season_buynum", {num = surplus}))
	end]]
	
	self:setOwnerCount(itemOwnerNum)
    self:_onNumSelect(self._useNum)

end

function PopupItemBuy:onBtnOk()
    if not PopupItemBuy.super.checkSlectNum(self, true) then
        return
    end
	local isBreak
	if self._callback then
		isBreak = self._callback(self._itemId, self._useNum, self._itemPriceByBuff1, self._itemPriceByBuff2)
	end
	if not isBreak then
		self:close()
	end
end


function PopupItemBuy:setCostInfo1(costType,costValue, costSize)
	self._costResInfo1:updateUI(costType,costValue,costSize)
end

function PopupItemBuy:setCostInfo2(costType,costValue, costSize)
	self._costResInfo2:updateUI(costType,costValue,costSize)
	self._costResInfo2:setVisible(true)
end

function PopupItemBuy:setShopConst(shopType)
    PopupItemBuy.super.setShopConst(self, shopType)
end

return PopupItemBuy