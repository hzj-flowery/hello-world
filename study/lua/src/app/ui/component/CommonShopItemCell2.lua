-- Author: zhanglinsen
-- Date:2018-08-08 12:50:24
-- Describle：
local CommonShopItemCell = require("app.ui.component.CommonShopItemCell")
local CommonShopItemCell2 = class("CommonShopItemCell2", CommonShopItemCell)
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroConst = require("app.const.HeroConst")
local ShopConst = require("app.const.ShopConst")
local DataConst = require("app.const.DataConst")

local EXPORTED_METHODS = {
	"updateUI",
	"showIconTop",
	"setCallBack",
	"updateBackgroundImge"
}

local BACKGROUND_NORMAL = 0 --正常显示背景
local BACKGROUND_START = 1 -- 开始时显示背景
local BACKGROUND_END = 2 --结束时显示背景

CommonShopItemCell2.NEW_REMIND_EFFECT = "effect_xinpin_faguang"
CommonShopItemCell2.NEW_REMIND_EFFECT_POS = cc.p(64, 0)

function CommonShopItemCell2:ctor()
	self._target = nil
	self._buttonOK = nil -- ok按钮
	self._iconTemplate = nil -- icon模板
	self._iconTopImage = nil -- 顶部icon图片
	self._costRes1 = nil -- 消耗资源1
	self._costRes2 = nil -- 消耗资源2
	self._textItemName = nil -- 物品名称
	self._resCanBuy1 = false 	-- 是否可购买
	self._resCanBuy2 = false
	self._callBack = nil
	CommonShopItemCell2.super.ctor(self)
end

function CommonShopItemCell2:_init()
	CommonShopItemCell2.super._init(self)
    self._imageNewRemind = ccui.Helper:seekNodeByName(self._target, "Image_newRemind")
    self._imageCost = ccui.Helper:seekNodeByName(self._target, "Image_cost")
    self._imageButtonDesc = ccui.Helper:seekNodeByName(self._target, "Text_button_desc")
    self._imageNewRemind:setVisible(false)
    self._imageCost:setVisible(false)
end

function CommonShopItemCell2:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonShopItemCell2:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonShopItemCell2:updateBackgroundImge(status)
end

function CommonShopItemCell2:_updateFixDiscount(shopItem)
	local discount = UserDataHelper.getFixShopDiscount(shopItem)
	if discount > 1 and discount < 10 then
		self._imageDiscount:loadTexture(Path.getDiscountImg(discount))
		self._imageDiscount:setVisible(true)
	else
		self._imageDiscount:setVisible(false)
    end
end

function CommonShopItemCell2:_updateFixButton(shopItem)
	local success, errorMsg, funcName = LogicCheckHelper.shopFixBtnCheck(shopItem)
	local fixData = shopItem:getConfig()
	local type = fixData["price1_type"]
	local value = fixData["price1_value"]
	local size = fixData["price1_size"]
	local priceAdd = fixData["price1_add"]
	--终生购买检查
	-- if funcName == "shopNumBanType" then
	-- 	self._buttonOK:setString(Lang.get("shop_btn_buyed"))
	-- else
		self._buttonOK:setString(Lang.get("shop_btn_buy"))

		if type == ShopConst.NORMAL_SHOP_SUB_MONEY then --商店充值商品特殊处理
			local VipPay = require("app.config.vip_pay")
			local payCfg = VipPay.get(value)
			local money = payCfg.rmb
			self._buttonOK:setString(Lang.get("common_rmb", {num = money}))
		end
	-- end
	if type~=ShopConst.NORMAL_SHOP_SUB_MONEY then
		self._buttonOK:setString("")
	end

	self._buttonOK:setVisible(true)
	self._imageBuyed:setVisible(false)
	if success == false then
		self._buttonOK:setEnabled(false)
		self._costRes1:setGray()
		self._textBtnDesc:setString(errorMsg)
		local banType = shopItem:getConfig().num_ban_type
		if funcName == "shopNumBanType" and banType == 1 then
			self._buttonOK:setVisible(false)
			self._imageBuyed:setVisible(true)
		elseif funcName == "shopGoodsLack" then
			self._buttonOK:setVisible(false)
			self._imageBuyed:setVisible(true)
		end
	else
		self._buttonOK:setEnabled(true)
		self._costRes1:resetFromGray()
		if not self._resCanBuy1 then
			self._costRes1:setTextColorToRed()
		else
			self._costRes1:setTextColorToATypeColor()
		end
		local strBuyTimes = UserDataHelper.getShopBuyTimesDesc(shopItem:getShopId(), shopItem:getGoodId())
		self._textBtnDesc:setString(strBuyTimes)
	end
	if type == ShopConst.NORMAL_SHOP_SUB_MONEY then --商店充值商品特殊处理
		local VipPay = require("app.config.vip_pay")
		local payCfg = VipPay.get(value)
		local money = payCfg.gold
		self._textBtnDesc:setString(Lang.get("common_go_cost", {num = money}))
    end
end

function CommonShopItemCell2:_updateFixCell(shopItem, isShowOutLineColor, tabIndex)
	local fixData = shopItem:getConfig()
	self._iconTemplate:unInitUI()
	self._iconTemplate:initUI(fixData.type, fixData.value, fixData.size)
	self._iconTemplate:setTouchEnabled(true)
	local itemParams = self._iconTemplate:getItemParams()
	if itemParams == nil then
		return
	end
	local buyCount = shopItem:getBuyCount()
	for i = 1, 2 do
		local type = fixData["price" .. i .. "_type"]
		local value = fixData["price" .. i .. "_value"]
		local size = fixData["price" .. i .. "_size"]
		local priceAdd = fixData["price" .. i .. "_add"]

		local priceSize = UserDataHelper.getTotalPriceByAdd(priceAdd, buyCount, 1, size)

		if type and type > 0 and type ~= ShopConst.NORMAL_SHOP_SUB_MONEY then
			self["_costRes" .. i]:updateUI(type, value, priceSize)
			self["_costRes" .. i]:setVisible(true)
		else
			self["_costRes" .. i]:setVisible(false)
		end
		local canBuy = LogicCheckHelper.enoughValue(type, value, priceSize, false)
		self["_resCanBuy"..i] = canBuy
		if not canBuy then
			self["_costRes" .. i]:setTextColorToRed()
		else
			self["_costRes" .. i]:setTextColorToATypeColor()
		end
		if type == ShopConst.NORMAL_SHOP_SUB_MONEY and self._imageCost:isVisible() then
			self._imageCost:setVisible(false)
		end
	end
	
	local times = UserDataHelper.getShopItemCanBuyTimes(shopItem)
	if fixData.num_ban_type~=0 then
		self._textItemName:setPositionY(self._textItemNamePosY)
		self._textItemTimes:setVisible(true)
		if times>0 then
			self._textItemTimes:setString(Lang.get("shop_times_tip", {times=times}))
		else
			self._textItemTimes:setString(Lang.get("shop_times_end_tip"))
		end
	else
		self._textItemName:setPositionY(self._textItemNamePosY-10)
		self._textItemTimes:setVisible(false)
	end
	self:_updateName(itemParams)
	self:_shopRightCorner(fixData.type, fixData.value, false)
	if self._costRes1:isVisible() then
		self._buttonOK:setString("")
		self._costRes1:setPositionY(self._costRes1PosY-40)
	else
		self._buttonOK:setString(Lang.get("shop_btn_buy"))
	end
	self:_updateNewRemind(fixData)

	self._buttonOK:showRedPoint(false)
	local function hardCodeRedPoint()
		local checkType = {
			type = TypeConvertHelper.TYPE_RESOURCE,
			value = DataConst.RES_GOLD
		}
		local redPoint = G_UserData:getShops():isFixShopItemDataCanBuy(shopItem, checkType)
		self._buttonOK:showRedPoint(redPoint)
	end
    hardCodeRedPoint()
    if type(tabIndex) and tabIndex == 3 then
        self._imageButtonDesc:setVisible(false)
    end
end

-- 显示上新提示
function CommonShopItemCell2:_updateNewRemind(fixData)
	local ShopHelper = require("app.scene.view.shop.ShopHelper")
	self._imageNewRemind:removeAllChildren()
	if fixData.new_remind == 1 then
		self._imageNewRemind:setVisible(ShopHelper.isNeedNewRemind(fixData.id))
		G_EffectGfxMgr:createPlayGfx(
			self._imageNewRemind,
			CommonShopItemCell2.NEW_REMIND_EFFECT,
			nil,
			nil,
			CommonShopItemCell2.NEW_REMIND_EFFECT_POS
		)
	else
		self._imageNewRemind:setVisible(false)
	end
end

return CommonShopItemCell2
