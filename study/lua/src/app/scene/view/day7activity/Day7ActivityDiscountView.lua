
-- Author: nieming
-- Date:2017-12-06 17:40:31
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local Day7ActivityDiscountView = class("Day7ActivityDiscountView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local DataConst = require("app.const.DataConst")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")

Day7ActivityDiscountView.MAX_WIDTH = 384
Day7ActivityDiscountView.ITEM_GAP = 128

function Day7ActivityDiscountView:ctor()

	--csb bind var name
	self._btnBuy = nil  --CommonButtonHighLight
	self._itemParent = nil  --SingleNode
	self._newPrice = nil  --Text
	self._newResIcon = nil  --ImageView
	self._oldPrice = nil  --Text
	self._oldResIcon = nil  --ImageView

	local resource = {
		file = Path.getCSB("Day7ActivityDiscountView", "day7activity"),
		binding = {
			_btnBuy = {
				events = {{event = "touch", method = "_onBtnBuy"}}
			},
		},
	}
	Day7ActivityDiscountView.super.ctor(self, resource)
end

function Day7ActivityDiscountView:_createItem(tp, value, size)
	local item = ComponentIconHelper.createIcon(tp, value, size)
	item:showName(true, 98)
	item:setNameFontSize(20)
	item:addBgImageForName(Path.getUICommon("img_com_andi_wenzi"), 100, 6)
	item:setTouchEnabled(true)
	return item
end


function Day7ActivityDiscountView:refreshDiscountView(data)
	assert(data ~= nil, "refreshDiscountView data is nil")
	self._data = data
	self._newPrice:setString(data.gold_price)
	self._oldPrice:setString(data.show_price)
	self._itemParent:removeAllChildren()
	local items = {}
	for i = 1, 4 do
		if data["type_"..i] ~= 0 and data["value_"..i] ~= 0 and data["size_"..i] ~= 0  then
			local item = self:_createItem(data["type_"..i], data["value_"..i], data["size_"..i])
			table.insert(items, item)
		end
	end

	local itemNum = #items
	local left = (Day7ActivityDiscountView.MAX_WIDTH - (itemNum-1)*Day7ActivityDiscountView.ITEM_GAP)/2
	for k, v in ipairs(items) do
		self._itemParent:addChild(v)
		v:setPositionX(left + (k-1)*Day7ActivityDiscountView.ITEM_GAP)
	end

   -- self._data = data
   --
   -- logError("==========================================")
   -- dump(data)



   -- self._btnBuy:setButtonTag(data.id)
   --
   -- self._commonPriceDiscountInfo:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,data.gold_price)
   -- self._commonPriceShowInfo:updateUI(TypeConvertHelper.TYPE_RESOURCE,DataConst.RES_DIAMOND,data.show_price)
   -- self._commonPriceDiscountInfo:showDiscountLine(false)
   -- self._commonPriceShowInfo:showDiscountLine(true)
   --
   -- self._commonIconTemplate:unInitUI()
   -- self._commonIconTemplate:initUI( data.type_1, data.value_1, data.size_1)
   -- self._commonIconTemplate:setTouchEnabled(true)
   -- self._commonIconTemplate:showCount(false)
   --
   --
   -- self._textItemNum:setString(Lang.get("days7activity_discount_item_count",{ count = data.size_1}))
   --
   -- local itemParams = self._commonIconTemplate:getItemParams()
   -- self._textItemName:setString(data.name)
   -- self._textItemName:setColor(itemParams.icon_color)
   -- self._textItemName:enableOutline(itemParams.icon_color_outline,2)
   -- local itemNamePox,itemNamePoy = self._textItemName:getPosition()
   -- local nameSize =  self._textItemName:getContentSize()
   -- self._textItemNum:setPositionX(itemNamePox + Day7ActivityDiscountNode.DISCOUNT_ITEM_COUNT_LEFT_GAP + nameSize.width)
   --
	self._btnBuy:setString(Lang.get("days7activity_btn_buy"))
	local reachBuyCondition = G_UserData:getDay7Activity():isShopDiscountReachBuyCondition(data.id)
	local canBuy = G_UserData:getDay7Activity():isShopDiscountCanBuy(data.id)

	if reachBuyCondition then
		if canBuy then
			self._btnBuy:setEnabled(true)
		else--已经购买了
			self._btnBuy:setString(Lang.get("days7activity_btn_already_buy"))
			self._btnBuy:setEnabled(false)
		end
	else
	    self._btnBuy:setEnabled(false)
	end
end

-- Describle：
function Day7ActivityDiscountView:_onBtnBuy(sender)
	-- body
	if not self._data then
        return
    end

	local data = self._data
	assert(data,"Day7ActivityView buy null discount item ")
    local UserCheck = require("app.utils.logic.UserCheck")
    local isFull = UserCheck.isPackFull(data.type_1, data.value_1)
    if isFull then
        return
    end

	local success, popFunc = LogicCheckHelper.enoughCash(data.gold_price)
	if success then
		G_UserData:getDay7Activity():c2sSevenDaysShop(data.id)
	else
		popFunc()
	end
end

return Day7ActivityDiscountView
