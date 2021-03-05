local CommonShopItemCell = class("CommonShopItemCell")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroConst = require("app.const.HeroConst")
local ShopConst = require("app.const.ShopConst")
local DataConst = require("app.const.DataConst")

-- CommonShopItemCell.SHOP_ITEM_RIGHT_CORNER_FUNC = {
-- 	[TypeConvertHelper.TYPE_INSTRUMENT] = function(self, params)
-- 		if isRandom == true then
-- 			self:updateLightEffect()
-- 		end
-- 		if self:_shopItemInBattle(params.value) then
-- 			return
-- 		end
-- 	end,
-- 	[TypeConvertHelper.TYPE_HERO] = function(self, params)
-- 		if params.isRandom == true and params.itemParams.cfg.type ~= HeroConst.HERO_EXP_TYPE then
-- 			self:updateLightEffect()
-- 		end

-- 		if self:_showHeroTopImage(params.value) then
-- 			return
-- 		end
-- 	end,
-- 	[TypeConvertHelper.TYPE_FRAGMENT] = function(self, params)
-- 		self:_showFragmentNum(params.type, params.value)
-- 		if params.itemParams.cfg.comp_type == 1 then -- 武将合成类型
-- 			if self:_showHeroTopImage(params.itemParams.cfg.comp_value) then
-- 				return
-- 			end
-- 		end

-- 		if params.itemParams.cfg.comp_type == 4 then -- 神兵合成类型
-- 			if self:_shopItemInBattle(params.itemParams.cfg.comp_value) then
-- 				return
-- 			end
-- 		end

-- 		if params.itemParams.cfg.comp_type == 3 then -- 橙色宝物类型
-- 			if params.itemParams.cfg.color == 5 then
-- 				if self:_showTreasureTopImage(params.itemParams.cfg.comp_value) then
-- 					return
-- 				end
-- 			end
-- 		end
-- 	end,
-- 	[TypeConvertHelper.TYPE_ITEM] = function(self, params)
-- 		-- assert(false,"")
-- 		if params.value == DataConst.ITEM_COMMON_INSTRUMENT1 or params.value == DataConst.ITEM_COMMON_INSTRUMENT2 then
-- 			if isRandom == true then
-- 				self:updateLightEffect()
-- 			end
-- 		end
-- 	end
-- }

local EXPORTED_METHODS = {
	"updateUI",
	"showIconTop",
    "setCallBack",
    "updateDiscount",
}

function CommonShopItemCell:ctor()
	self._target = nil
	self._buttonOK = nil -- ok按钮
	self._iconTemplate = nil -- icon模板
	self._iconTopImage = nil -- 顶部icon图片
	self._costRes1 = nil -- 消耗资源1
	self._costRes2 = nil -- 消耗资源2
	self._textItemName = nil -- 物品名称
	---
	self._callBack = nil
end

function CommonShopItemCell:_init()
	self._iconTemplate = ccui.Helper:seekNodeByName(self._target, "Icon_template")
	cc.bind(self._iconTemplate, "CommonIconTemplate")
	self._iconTopImage = ccui.Helper:seekNodeByName(self._target, "Image_iconTop")
	self._iconTopImage:setVisible(false)

	self._costRes1 = ccui.Helper:seekNodeByName(self._target, "Cost_Res1")
	cc.bind(self._costRes1, "CommonResourceInfoList")
	self._costRes2 = ccui.Helper:seekNodeByName(self._target, "Cost_Res2")
	cc.bind(self._costRes2, "CommonResourceInfoList")

	self._buttonOK = ccui.Helper:seekNodeByName(self._target, "Button_ok")
	cc.bind(self._buttonOK, "CommonButtonLevel1Highlight")

	self._textItemName = ccui.Helper:seekNodeByName(self._target, "Text_item_name")
	self._textItemTimes = ccui.Helper:seekNodeByName(self._target, "Text_item_times")
	self._textBtnDesc = ccui.Helper:seekNodeByName(self._target, "Text_button_desc")
	self._textBtnDesc1 = ccui.Helper:seekNodeByName(self._target, "Text_button_desc_1")
	self._textBtnDesc2 = ccui.Helper:seekNodeByName(self._target, "Text_button_desc_2")
	self._textBtnDesc3 = ccui.Helper:seekNodeByName(self._target, "Text_button_desc_3")
	self._bmpDiscount = ccui.Helper:seekNodeByName(self._target, "BitmapFontLabel_discount")
	self._imageDiscount = ccui.Helper:seekNodeByName(self._target, "Image_discount")
	self._nodeFragment = ccui.Helper:seekNodeByName(self._target, "Node_fragment")
	self._imageBuyed = ccui.Helper:seekNodeByName(self._target, "Image_buyed")
	self._imageCost = ccui.Helper:seekNodeByName(self._target, "Image_cost")
	self._imageCost:setVisible(true)
	self._bmpDiscount:setVisible(false)
	self._imageDiscount:setVisible(false)
    self._imageBuyed:setVisible(false)
	self._seasonOffsetY = self._textBtnDesc:getPositionY()
	
	self._textItemNamePosY = self._textItemName:getPositionY()
	self._costRes1PosY = self._costRes1:getPositionY()

	self._buttonOK:addClickEventListenerEx(handler(self, self._onButtonClick), true, nil, 0)
end

function CommonShopItemCell:bind(target)
	self._target = target
	self:_init()
	cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonShopItemCell:unbind(target)
	cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonShopItemCell:updateUI(shopItem, isShowOutLineColor, tabIndex)
	self._nodeFragment:removeAllChildren()
	self._textFragment = ccui.RichText:create()
	self._nodeFragment:addChild(self._textFragment)
	self._textFragment:setAnchorPoint(cc.p(0, 0.5))
	self._nodeFragment:setVisible(false)
	self:showIconTop(false)
	local shopCfg = shopItem:getConfig()
	local configType = shopItem:getConfigType()
	--dump(shopItem)

	self._textBtnDesc:setVisible(true)
	self._textBtnDesc1:setVisible(false)
	self._textBtnDesc2:setVisible(false)
	self._textBtnDesc3:setVisible(false)

	if configType == "fix" then
		self:_updateFixCell(shopItem, isShowOutLineColor, tabIndex)
		self:_updateFixButton(shopItem)
		self:_updateFixDiscount(shopItem)
	else
		self:_updateRandomCell(shopItem)
		self:_updateRandomBtn(shopItem)
	end
end

function CommonShopItemCell:_updateFixDiscount(shopItem)
	local discount = UserDataHelper.getFixShopDiscount(shopItem)

	if discount > 1 and discount < 10 then
		self._imageDiscount:loadTexture(Path.getDiscountImg(discount))
		self._imageDiscount:setVisible(true)
	else
		self._imageDiscount:setVisible(false)
	end
end

function CommonShopItemCell:updateDiscount(discount)
	if discount > 1 and discount < 10 then
		self._imageDiscount:loadTexture(Path.getDiscountImg(discount))
		self._imageDiscount:setVisible(true)
	else
		self._imageDiscount:setVisible(false)
	end
end

function CommonShopItemCell:_updateFixButton(shopItem)
	local function hardCode()
		--硬编码，装备商店特殊处理
		if shopItem:getShopId() == ShopConst.EQUIP_SHOP or shopItem:getShopId() == ShopConst.AWAKE_SHOP then
			self._textBtnDesc:setPosition(cc.p(439, self._textBtnDesc:getPositionY()))
			self._textBtnDesc:setAnchorPoint(cc.p(1, 0.5))
		elseif shopItem:getShopId() == ShopConst.SEASOON_SHOP then
			self._textBtnDesc:setPosition(cc.p(118, self._seasonOffsetY - 28)) -- 不要再改了！！！
			self._textBtnDesc:setAnchorPoint(cc.p(0.0, 0.5))
		else
			self._textBtnDesc:setPosition(cc.p(385, self._textBtnDesc:getPositionY()))
			self._textBtnDesc:setAnchorPoint(cc.p(0.5, 0.5))
		end
	end
	--local success, errorMsg, funcName = LogicCheckHelper.shopFixBtnCheck(shopItem)
	local success, errorMsgs, funcNames = LogicCheckHelper.shopFixBtnCheckExt(shopItem)
	--终生购买检查
	if funcNames["shopNumBanType"] then
		self._buttonOK:setString(Lang.get("shop_btn_buyed"))
	else
		self._buttonOK:setString(Lang.get("shop_btn_buy"))
		local fixData = shopItem:getConfig()
		local type = fixData["price1_type"]
		local value = fixData["price1_value"]
		local size = fixData["price1_size"]
		local priceAdd = fixData["price1_add"]
		if type == ShopConst.NORMAL_SHOP_SUB_MONEY then --商店充值商品特殊处理
			local VipPay = require("app.config.vip_pay")
			local payCfg = VipPay.get(value)
			local money = payCfg.rmb
			self._buttonOK:setString(Lang.get("common_rmb", {num = money}))
		end
		self:_processBtnDes(self._buttonOK, fixData)
	end

	self._buttonOK:setVisible(true)
	self._imageBuyed:setVisible(false)
	if success == false then
		self._buttonOK:setEnabled(false)
		--self._textBtnDesc:setString(errorMsg)
		self:_setItemLimitDes(errorMsgs, funcNames)
		hardCode()
		local banType = shopItem:getConfig().num_ban_type
		if funcNames["shopNumBanType"] and banType == 1 then
			self._buttonOK:setVisible(false)
			self._imageBuyed:setVisible(true)
		elseif funcNames["shopGoodsLack"] then
			self._buttonOK:setVisible(false)
			self._imageBuyed:setVisible(true)
		end
	else
		self._buttonOK:setEnabled(true)
		local strBuyTimes = UserDataHelper.getShopBuyTimesDesc(shopItem:getShopId(), shopItem:getGoodId())
		self._textBtnDesc:setString(strBuyTimes)
		hardCode()
	end
end

function CommonShopItemCell:_setItemLimitDes( errorMsgs, funcNames )
	local num = #errorMsgs

	if num == 0 then
		self._textBtnDesc:setVisible(false)
		self._textBtnDesc1:setVisible(false)
		self._textBtnDesc2:setVisible(false)
		self._textBtnDesc3:setVisible(false)
		
		return
	elseif num == 1 then
		self._textBtnDesc:setVisible(true)
		self._textBtnDesc1:setVisible(false)
		self._textBtnDesc2:setVisible(false)
		self._textBtnDesc3:setVisible(false)

		if funcNames["shopNumBanType"] or funcNames["shopGoodsLack"] then
			self._textBtnDesc:setString(errorMsgs[1])
		else
			self._textBtnDesc:setString(errorMsgs[1] .. Lang.get("shop_condition_ext"))
		end
	elseif num == 2 then
		self._textBtnDesc:setVisible(false)
		self._textBtnDesc1:setVisible(true)
		self._textBtnDesc2:setVisible(true)
		self._textBtnDesc3:setVisible(true)

		if funcNames["shopNumBanType"] or funcNames["shopGoodsLack"] then
			self._textBtnDesc:setVisible(true)
			self._textBtnDesc1:setVisible(false)
			self._textBtnDesc2:setVisible(false)
			self._textBtnDesc3:setVisible(false)
			self._textBtnDesc:setString(errorMsgs[1])
		else
			self._textBtnDesc1:setString(errorMsgs[1])
			self._textBtnDesc2:setString(errorMsgs[2])
		end
	end
end

function CommonShopItemCell:_updateFixCell(shopItem, isShow)
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
		if not canBuy then
			self["_costRes" .. i]:setTextColorToRed()
		else
			self["_costRes" .. i]:setTextColorToATypeColor()
		end
		if type == ShopConst.NORMAL_SHOP_SUB_MONEY and self._imageCost:isVisible() then
			self._imageCost:setVisible(false)
		end
	end
	self:_updateName(itemParams, isShow)
	self:_shopRightCorner(fixData.type, fixData.value, false)
	self._buttonOK:setString(Lang.get("shop_btn_buy"))
	self:_processBtnDes(self._buttonOK, fixData)

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
end

function CommonShopItemCell:_updateRandomBtn(shopItem)
	local success = LogicCheckHelper.shopRandomBtnCheck(shopItem)
	if success == false then
		self._buttonOK:setEnabled(false)
		self._buttonOK:setString(Lang.get("shop_btn_buyed"))
		self._textBtnDesc:setString(" ")
	else
		self._buttonOK:setEnabled(true)
		self._buttonOK:setString(Lang.get("shop_btn_buy"))
		self._textBtnDesc:setString(" ")
	end
	--神兵商店显示“xxx专属”
	local function hardCode()
		if shopItem:getShopId() == ShopConst.INSTRUMENT_SHOP then
			local randomData = shopItem:getConfig()
			if randomData.item_type == TypeConvertHelper.TYPE_INSTRUMENT then
				local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, randomData.item_id)
				self._textBtnDesc:setString(Lang.get("shop_instrument_belong_to_des", {name = param.hero}))
			elseif randomData.item_type == TypeConvertHelper.TYPE_FRAGMENT then
				local info = require("app.config.fragment").get(randomData.item_id)
				assert(info, "fragment config can not find id = %d", randomData.item_id)
				local instrumentId = info.comp_value
				local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId)
				self._textBtnDesc:setString(Lang.get("shop_instrument_belong_to_des", {name = param.hero}))
			end
		end
	end
	hardCode()
end

function CommonShopItemCell:_updateRandomCell(shopItem)
	local randomData = shopItem:getConfig()
	self._iconTemplate:unInitUI()
	self._iconTemplate:initUI(randomData.item_type, randomData.item_id, randomData.item_num)
	self._iconTemplate:setTouchEnabled(true)
	local itemParams = self._iconTemplate:getItemParams()
	if itemParams == nil then
		return
	end

	for i = 1, 2 do
		local type = randomData["type" .. i]
		local value = randomData["value" .. i]
		local size = randomData["size" .. i]

		if type and type > 0 then
			self["_costRes" .. i]:updateUI(type, value, size)
			self["_costRes" .. i]:setVisible(true)
		else
			self["_costRes" .. i]:setVisible(false)
		end

		local canBuy = LogicCheckHelper.enoughValue(type, value, size, false)
		if not canBuy then
			self["_costRes" .. i]:setTextColorToRed()
		else
			self["_costRes" .. i]:setTextColorToATypeColor()
		end
	end
	self:_updateName(itemParams)
	self:_shopRightCorner(randomData.item_type, randomData.item_id, true)
	self._buttonOK:setString(Lang.get("shop_btn_buy"))
end

function CommonShopItemCell:_updateName(itemParams, isOutLineColor)
	self._textItemName:setString(itemParams.name)
    self._textItemName:setColor(itemParams.icon_color)
    if isOutLineColor then
        self._textItemName:enableOutline(itemParams.icon_color_outline)
    end
end

function CommonShopItemCell:showIconTop(needShow)
	if needShow == nil then
		needShow = false
	end

	self._iconTopImage:setVisible(needShow)
end

function CommonShopItemCell:_onButtonClick(sender)
	logWarn("CommonShopItemCell:_onButtonClick")
	if self._callBack and type(self._callBack) == "function" then
		self._callBack(self._target)
	end
end
--
function CommonShopItemCell:setCallBack(callback)
	self._callBack = callback
end

--右上角图表
function CommonShopItemCell:_shopRightCorner(type, value, isRandom)
	local itemParams = TypeConvertHelper.convert(type, value)
	if type == TypeConvertHelper.TYPE_INSTRUMENT then
		logWarn("CommonShopItemCell:_shopRightCorner")
		if isRandom == true then
			self:_shopLightEffect()
		end
		if self:_shopItemInBattle(value) then
			return
		end
	end
	if type == TypeConvertHelper.TYPE_HERO then
		if isRandom == true and itemParams.cfg.type ~= HeroConst.HERO_EXP_TYPE then
			self:_shopLightEffect()
		end
		if self:_showHeroTopImage(value) then
			return
		end
	elseif type == TypeConvertHelper.TYPE_FRAGMENT then
		self:_showFragmentNum(type, value)
		if itemParams.cfg.comp_type == 1 then -- 武将合成类型
			if self:_showHeroTopImage(itemParams.cfg.comp_value) then
				return
			end
		end
		if itemParams.cfg.comp_type == 4 then -- 神兵合成类型
			if self:_shopItemInBattle(itemParams.cfg.comp_value) then
				return
			end
		end
		if itemParams.cfg.comp_type == 3 then -- 橙色宝物类型
			if itemParams.cfg.color == 5 then
				if self._showTreasureTopImage(itemParams.cfg.comp_value) then
					return
				end
			end
		end
	elseif
		type == TypeConvertHelper.TYPE_ITEM and value == DataConst.ITEM_COMMON_INSTRUMENT1 or
			value == DataConst.ITEM_COMMON_INSTRUMENT2
	 then --万能神兵
		if isRandom == true then
			self:_shopLightEffect()
		end
	end
end

function CommonShopItemCell:_shopLightEffect()
	self._iconTemplate:removeLightEffect()
	self._iconTemplate:showLightEffect()
end

function CommonShopItemCell:_showHeroTopImage(heroId)
	local res = UserDataHelper.getHeroTopImage(heroId)
	if res then
		self._iconTopImage:loadTexture(res)
		self._iconTopImage:setVisible(true)
		return true
	end
	return false
end

function CommonShopItemCell:_showTreasureTopImage(treasureId)
	local res = UserDataHelper.getTreasureTopImage(treasureId)
	if res then
		self._iconTopImage:loadTexture(res)
		self._iconTopImage:setVisible(true)
		return true
	end
	return false
end

function CommonShopItemCell:_shopItemInBattle(baseId)
	local needShow = UserDataHelper.isInBattleHeroWithBaseId(baseId)
	if needShow then
		local res = Path.getTextSignet("img_iconsign_shangzhen")
		self._iconTopImage:loadTexture(res)
		self._iconTopImage:setVisible(true)
	end
	return needShow
end

function CommonShopItemCell:_showFragmentNum(type, value)
	local itemParams = TypeConvertHelper.convert(type, value)
	local num = UserDataHelper.getNumByTypeAndValue(type, value)
	local textContent = self._textItemName:getVirtualRendererSize()
	local txtX, txtY = self._textItemName:getPosition()
	self._nodeFragment:setVisible(true)

	local richTextColor = Colors.BRIGHT_BG_TWO
	if num >= itemParams.cfg.fragment_num then
		richTextColor = Colors.BRIGHT_BG_GREEN
	else
		richTextColor = Colors.BRIGHT_BG_RED
	end

	local richText =
		Lang.get(
		"shop_fragment_limit",
		{
			num = num,
			color = Colors.colorToNumber(richTextColor),
			max = itemParams.cfg.fragment_num
		}
	)

	self._textFragment:setRichTextWithJson(richText)
	self._nodeFragment:setPosition(txtX + textContent.width + 4, txtY)
	--中文括号空隙比较大
end

--根据shop_fix的"button"字段显示按钮描述
function CommonShopItemCell:_processBtnDes(btn, configInfo)
	if configInfo.button ~= "" then
		btn:setString(configInfo.button)
	end
end

return CommonShopItemCell
