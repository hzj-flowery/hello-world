--道具购买和使用弹框
local UserDataHelper = require("app.utils.UserDataHelper")
local DataConst = require("app.const.DataConst")
local PopupBase = require("app.ui.PopupBase")
local ShopConst = require("app.const.ShopConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local PopupItemBuyUse = class("PopupItemBuyUse", PopupBase)

function PopupItemBuyUse:ctor(callback)
	self._callback = callback
    self._itemType = nil
	self._itemId = nil
	self._shopItemData = nil
    self._maxUserNum = 0
	self._itemNum = 0
	self._btnOk = nil 
	self._itemName = nil -- 物品名称
	self._itemDesc = nil -- 物品描述
	self._itemIcon = nil -- CommonItemIcon
	self._itemOwnerDesc = nil --拥有物品
	self._itemOwnerCount = nil --数量
    self._buyCostResInfo = nil --购买花费资源信息
	local resource = {
		file = Path.getCSB("PopupItemBuyUse", "common"),
		binding = {
			_btnBuy = {
				events = {{event = "touch", method = "_onBtnBuy"}}
			},
            _btnUse = {
				events = {{event = "touch", method = "_onBtnUse"}}
			}
		}
	}
	PopupItemBuyUse.super.ctor(self, resource, true)
end

function PopupItemBuyUse:onCreate()
	self._btnBuy:setString(Lang.get("common_btn_buy"))
    self._btnUse:setString(Lang.get("common_btn_use"))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnClose))
	self._commonNodeBk:hideBtnBg()

end

function PopupItemBuyUse:updateUI(itemType,itemId)
    self._itemId = itemId
    self._itemType = itemType
	self._shopItemData = G_UserData:getShops():getFixShopGoodsByResId(ShopConst.NORMAL_SHOP,self._itemType,self._itemId)
	self._itemIcon:unInitUI()
	self._itemIcon:initUI(itemType, itemId)
	self._itemIcon:setTouchEnabled(false)
    self._itemIcon:setImageTemplateVisible(true)
	local itemParams = self._itemIcon:getItemParams()
	self._itemName:setString(itemParams.name)
	self._itemName:setColor(itemParams.icon_color)
	self._itemDesc:setString(itemParams.cfg.description)

	local resName = DataConst.getItemName(itemId)
    local title = Lang.get("common_item_buy_use_titles")[resName]
	assert(title,"PopupItemBuyUse not find title itemId:"..tostring(itemId))
    self._commonNodeBk:setTitle(title)
	
	

	local itemNum = UserDataHelper.getNumByTypeAndValue(itemType, itemId)
	self:setOwnerCount(itemNum)

    local maxValue = UserDataHelper.getResItemMaxUseNum(itemId)
    self._maxUserNum = math.min(maxValue,itemNum)
	self._itemNum = itemNum
    local canUse = self._maxUserNum ~= -1 --道具不是使用类型
    --self._btnUse:setEnabled(canUse)

  

	if not self._shopItemData then
		self._btnBuy:setString(Lang.get("common_btn_buy"))
		self._btnBuy:setEnabled(false)

		self._buyCostResInfo:setVisible(false)
    else
        --[[self._btnBuy:setEnabled(true)
        if self._shopItemData:getLimitType() == 0 then
            self._btnBuy:setString(Lang.get("common_btn_buy"))
        else
            local remainCount = self._shopItemData:getVipBuyTimes()-self._shopItemData:getBuyCount()
            self._btnBuy:setString(Lang.get("common_item_buy_use_times_hint",{value = remainCount}))
        end]]
        local remainCount = self._shopItemData:getVipBuyTimes()-self._shopItemData:getBuyCount()
		self._btnBuy:setEnabled(true)
		self._btnBuy:setString(Lang.get("common_item_buy_use_times_hint",{value = remainCount}))

		local price1,type1,value1 = self:_getItemPrice(1,1)
		self._buyCostResInfo:updateUI(type1,value1,price1 )
		self._buyCostResInfo:setVisible(true)
	end
	
end

function PopupItemBuyUse:_getItemPrice(index,useNum)
	index = index or 1
    local shopItemData = self._shopItemData
	local itemCfg = shopItemData:getConfig()
	local buyCount = shopItemData:getBuyCount()
	local itemPrice = itemCfg[string.format("price%d_size", index)]
	local itemPriceAdd = itemCfg[string.format("price%d_add", index)]
	local itemPriceValue = itemCfg[string.format("price%d_value", index)]
	local itemPriceType = itemCfg[string.format("price%d_type",index)]
	if itemPriceAdd > 0 then
		itemPrice = UserDataHelper.getTotalPriceByAdd(itemPriceAdd,buyCount,useNum)
	else
		itemPrice = itemPrice * useNum
	end

	return itemPrice, itemPriceType, itemPriceValue
end

function PopupItemBuyUse:setOwnerCount(count)
	self._itemOwnerCount:setString(""..count)
end

function PopupItemBuyUse:onEnter()
    self._signalBuyShopGoods = G_SignalManager:add(SignalConst.EVENT_BUY_ITEM, handler(self, self._onEventBuyItem))
    self._signalUseItemMsg = G_SignalManager:add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(self, self._onEventUseItem))
end

function PopupItemBuyUse:onExit()
    self._signalBuyShopGoods:remove()
	self._signalBuyShopGoods = nil
    
    self._signalUseItemMsg:remove()
    self._signalUseItemMsg = nil
end

function PopupItemBuyUse:_onEventBuyItem(eventName)
    self:updateUI(self._itemType,self._itemId)
end

function PopupItemBuyUse:_onEventUseItem(eventName)
    self:updateUI(self._itemType,self._itemId)
end

function PopupItemBuyUse:_onBtnBuy()
   if not self:_checkShopBuyRes(self._itemType,self._itemId) then
        return
   end
    --背包检测
    local isFull, leftCount = LogicCheckHelper.isPackFull(self._itemType,self._itemId)
    if isFull == true then
        return
    end

    local function callBackFunction()
        local shopItemData = self._shopItemData
        --是否能购买检测
        if LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, false) == false then--检查资源
			G_Prompt:showTip(Lang.get("common_diamond_not_enough_tip")) 
            return
        end
        G_UserData:getShops():c2sBuyShopGoods(shopItemData:getGoodId(),shopItemData:getShopId(),1)
    end

    callBackFunction()
end

function PopupItemBuyUse:_checkShopBuyRes(itemType,itemValue)
	local success = LogicCheckHelper.shopCheckShopBuyRes(itemType,itemValue,true)
	return success
end

function PopupItemBuyUse:_onBtnUse()
	if self._itemNum <= 0 then
	   if self._itemId == DataConst.ITEM_VIT then
            G_Prompt:showTip(Lang.get("common_use_vit_no_have"))
        end
        if self._itemId == DataConst.ITEM_SPIRIT then
            G_Prompt:showTip(Lang.get("common_use_spirit_no_have"))
        end
		if self._itemId == DataConst.ITEM_ARMY_FOOD then
            G_Prompt:showTip(Lang.get("common_use_armyfood_no_have"))
        end
		return
	end
	if self._maxUserNum == -1 then-- -1道具不是使用类型（不会走到这里），0使用后会超出
		G_Prompt:showTip(Lang.get("common_item_not_use"))
		return
	end
	
    if self._maxUserNum <= 0 then-- -1道具不是使用类型（不会走到这里），0使用后会超出
        if self._itemId == DataConst.ITEM_VIT then
            G_Prompt:showTip(Lang.get("common_use_vit_max"))
        end
        if self._itemId == DataConst.ITEM_SPIRIT then
            G_Prompt:showTip(Lang.get("common_use_spirit_max"))
        end
		if self._itemId == DataConst.ITEM_ARMY_FOOD then
            G_Prompt:showTip(Lang.get("common_use_armyfood_max"))
        end
		
        return
    end
    G_UserData:getItems():c2sUseItem(self._itemId, 1, 0, 0)
    logWarn("confirm PopupBuyOnce item id is id: "..self._itemId.."  count: 1")
end

function PopupItemBuyUse:_onBtnClose()
    if self._callback then
		self._callback(self._itemId)
	end
	self:close()
end

return PopupItemBuyUse