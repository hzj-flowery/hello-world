-- 秦始皇陵增加时间道具购买和使用弹框
local UserDataHelper = require("app.utils.UserDataHelper")
local DataConst = require("app.const.DataConst")
local PopupBase = require("app.ui.PopupBase")
local ShopConst = require("app.const.ShopConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local ShopFix = require("app.config.shop_fix")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local QinTombItemBuyUse = class("QinTombItemBuyUse", PopupBase)

function QinTombItemBuyUse:ctor(callback)
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
    self._shopFixId = 0
    self._goldNum = nil 
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
	QinTombItemBuyUse.super.ctor(self, resource, true)
end

function QinTombItemBuyUse:onCreate()
	self._btnBuy:setString(Lang.get("common_btn_buy"))
    self._btnUse:setString(Lang.get("common_btn_use"))
	self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnClose))
	self._commonNodeBk:hideBtnBg()

end

function QinTombItemBuyUse:updateUI(shop_fix_id)
    self._shopFixId = shop_fix_id
    local shopFixConfig = ShopFix.get(self._shopFixId)
    self._itemId = shopFixConfig.value
    self._itemType = shopFixConfig.type
	self._shopItemData = G_UserData:getShops():getFixShopGoodsByResId(ShopConst.NORMAL_SHOP,self._itemType,self._itemId)
	self._itemIcon:unInitUI()
	self._itemIcon:initUI(self._itemType, self._itemId)
	self._itemIcon:setTouchEnabled(false)
    self._itemIcon:setImageTemplateVisible(true)
	local itemParams = self._itemIcon:getItemParams()
	self._itemName:setString(itemParams.name)
	self._itemName:setColor(itemParams.icon_color)
	self._itemDesc:setString(itemParams.cfg.bag_description)

	-- local resName = DataConst.getItemName(self._itemId)
    local title = Lang.get("groups_time_add_title")
	-- assert(title,"QinTombItemBuyUse not find title itemId:"..tostring(self._itemId))
    self._commonNodeBk:setTitle(title)
	
	

	local itemNum = UserDataHelper.getNumByTypeAndValue(self._itemType, self._itemId)
	self:setOwnerCount(itemNum)

    local maxValue = UserDataHelper.getResItemMaxUseNum(self._itemId)
    self._maxUserNum = 0 --math.min(maxValue,itemNum)
	self._itemNum = itemNum
    local canUse = self._maxUserNum ~= -1 --道具不是使用类型
    --self._btnUse:setEnabled(canUse)

    self._buyCostResInfo:setVisible(false)
    self._yubiNode:setVisible(false)

	if not self._shopItemData then
		self._btnBuy:setString(Lang.get("common_btn_buy"))
		self._btnBuy:setEnabled(false)
    else
        local remainCount = shopFixConfig.num_ban_value - self._shopItemData:getBuyCount()
        if remainCount > 0 then
            self._btnBuy:setEnabled(true)

            if shopFixConfig.price1_type == ShopConst.NORMAL_SHOP_SUB_MONEY then --商店充值商品特殊处理
                local VipPay = require("app.config.vip_pay")
                local payCfg = VipPay.get(shopFixConfig.price1_value)
                local money = payCfg.rmb
                self._btnBuy:setString(Lang.get("common_rmb", {num = money}))
                
                self._goldNum:setVisible(true)
                self._goldNum:setString(Lang.get("common_go_cost", {num = payCfg.gold}))
            elseif shopFixConfig.price1_type == TypeConvertHelper.TYPE_RESOURCE and 
               shopFixConfig.price1_value == DataConst.RES_JADE2 then
                self._yubiNode:setVisible(true)
                self._yubiNum:setString(shopFixConfig.price1_size)

                self._goldNum:setVisible(false)

                self._btnBuy:setString(Lang.get("common_item_buy_use_times_hint", {value = remainCount}))
            end
        else
            self._btnBuy:setEnabled(false)
            self._btnBuy:setString(Lang.get("shop_btn_buyed"))

            self._goldNum:setVisible(false)
        end
	end
	
end

function QinTombItemBuyUse:updateUIExt(shop_fix_id)
    self._shopFixId = shop_fix_id
    local shopFixConfig = ShopFix.get(self._shopFixId)
    self._itemId = shopFixConfig.value
    self._itemType = shopFixConfig.type
	self._shopItemData = G_UserData:getShops():getShopGoodsById(ShopConst.NORMAL_SHOP, self._shopFixId)
	self._itemIcon:unInitUI()
	self._itemIcon:initUI(self._itemType, self._itemId)
	self._itemIcon:setTouchEnabled(false)
    self._itemIcon:setImageTemplateVisible(true)
	local itemParams = self._itemIcon:getItemParams()
	self._itemName:setString(itemParams.name)
	self._itemName:setColor(itemParams.icon_color)
	self._itemDesc:setString(itemParams.cfg.bag_description)

	-- local resName = DataConst.getItemName(self._itemId)
    local title = Lang.get("groups_time_add_title")
	-- assert(title,"QinTombItemBuyUse not find title itemId:"..tostring(self._itemId))
    self._commonNodeBk:setTitle(title)
	
	

	local itemNum = UserDataHelper.getNumByTypeAndValue(self._itemType, self._itemId)
	self:setOwnerCount(itemNum)

    local maxValue = UserDataHelper.getResItemMaxUseNum(self._itemId)
    self._maxUserNum = 0 --math.min(maxValue,itemNum)
	self._itemNum = itemNum
    local canUse = self._maxUserNum ~= -1 --道具不是使用类型
    --self._btnUse:setEnabled(canUse)

    self._buyCostResInfo:setVisible(false)
    self._yubiNode:setVisible(false)

	if not self._shopItemData then
		self._btnBuy:setString(Lang.get("common_btn_buy"))
		self._btnBuy:setEnabled(false)
    else
        local remainCount = shopFixConfig.num_ban_value - self._shopItemData:getBuyCount()
        if remainCount > 0 then
            self._btnBuy:setEnabled(true)

            if shopFixConfig.price1_type == ShopConst.NORMAL_SHOP_SUB_MONEY then --商店充值商品特殊处理
                local VipPay = require("app.config.vip_pay")
                local payCfg = VipPay.get(shopFixConfig.price1_value)
                local money = payCfg.rmb
                self._btnBuy:setString(Lang.get("common_rmb", {num = money}))
                
                self._goldNum:setVisible(true)
                self._goldNum:setString(Lang.get("common_go_cost", {num = payCfg.gold}))
            elseif shopFixConfig.price1_type == TypeConvertHelper.TYPE_RESOURCE and 
               shopFixConfig.price1_value == DataConst.RES_JADE2 then
                self._yubiNode:setVisible(true)
                self._yubiNum:setString(shopFixConfig.price1_size)

                self._goldNum:setVisible(false)

                self._btnBuy:setString(Lang.get("common_item_buy_use_times_hint", {value = remainCount}))
            end
        else
            self._btnBuy:setEnabled(false)
            self._btnBuy:setString(Lang.get("shop_btn_buyed"))

            self._goldNum:setVisible(false)
        end
	end
	
end

function QinTombItemBuyUse:setOwnerCount(count)
	self._itemOwnerCount:setString(""..count)
end

function QinTombItemBuyUse:onEnter()
    self._signalBuyShopGoods = G_SignalManager:add(SignalConst.EVENT_BUY_ITEM, handler(self, self._onEventBuyItem))
    self._signalUseItemMsg = G_SignalManager:add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(self, self._onEventUseItem))
end

function QinTombItemBuyUse:onExit()
    self._signalBuyShopGoods:remove()
    self._signalBuyShopGoods = nil
    
    self._signalUseItemMsg:remove()
    self._signalUseItemMsg = nil
end

function QinTombItemBuyUse:_onEventBuyItem(eventName)
    self:updateUIExt(self._shopFixId)
end

function QinTombItemBuyUse:_onEventUseItem(eventName)
    self:updateUIExt(self._shopFixId)
end

function QinTombItemBuyUse:_onBtnBuy()
   if not self:_checkShopBuyRes(self._itemType,self._itemId) then
        return
   end
    --背包检测
    local isFull, leftCount = LogicCheckHelper.isPackFull(self._itemType,self._itemId)
    if isFull == true then
        return
    end

    local function callBackFunction()
        local shopFixConfig = ShopFix.get(self._shopFixId)

        if shopFixConfig.price1_type == ShopConst.NORMAL_SHOP_SUB_MONEY then --商店充值商品特殊处理
            local VipPay = require("app.config.vip_pay")
			local payCfg = VipPay.get(shopFixConfig.price1_value)
            local vipPayInfo = VipPay.get(payCfg.id)
            G_GameAgent:pay(vipPayInfo.id, 
                vipPayInfo.rmb, 
                vipPayInfo.product_id, 
                vipPayInfo.name, 
                vipPayInfo.name
            )
        else
            local shopItemData = self._shopItemData
            --是否能购买检测
            if LogicCheckHelper.shopFixBuyCheck(shopItemData, 1, true) == false then--检查资源
                --G_Prompt:showTip(Lang.get("common_diamond_not_enough_tip")) 
                return
            end
            G_UserData:getShops():c2sBuyShopGoods(shopItemData:getGoodId(),shopItemData:getShopId(),1)
        end
    end

    callBackFunction()
end

function QinTombItemBuyUse:_checkShopBuyRes(itemType,itemValue)
	local success = LogicCheckHelper.shopCheckShopBuyRes(itemType,itemValue,true)
	return success
end

function QinTombItemBuyUse:_onBtnUse()
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
        if self._itemId == DataConst.ITEM_QINTOMB_ADDTIME then
            G_Prompt:showTip(Lang.get("common_use_qintomb_item_no_have"))
        end
		return
	end
	-- if self._maxUserNum == -1 then-- -1道具不是使用类型（不会走到这里），0使用后会超出
	-- 	G_Prompt:showTip(Lang.get("common_item_not_use"))
	-- 	return
	-- end
	
    -- if self._maxUserNum == 0 then-- -1道具不是使用类型（不会走到这里），0使用后会超出
    --     if self._itemId == DataConst.ITEM_VIT then
    --         G_Prompt:showTip(Lang.get("common_use_vit_max"))
    --     end
    --     if self._itemId == DataConst.ITEM_SPIRIT then
    --         G_Prompt:showTip(Lang.get("common_use_spirit_max"))
    --     end
	-- 	if self._itemId == DataConst.ITEM_ARMY_FOOD then
    --         G_Prompt:showTip(Lang.get("common_use_armyfood_max"))
    --     end
		
    --     return
    -- end
    G_UserData:getItems():c2sUseItem(self._itemId, 1, 0, 0)
    logWarn("confirm PopupBuyOnce item id is id: "..self._itemId.."  count: 1")
end

function QinTombItemBuyUse:_onBtnClose()
    if self._callback then
		self._callback(self._itemId)
	end
	self:close()
end

return QinTombItemBuyUse