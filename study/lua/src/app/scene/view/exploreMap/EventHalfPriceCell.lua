local ViewBase = require("app.ui.ViewBase")
local EventHalfPriceCell = class("EventHalfPriceCell", ViewBase)

local ShopRandomItems = require("app.config.shop_random_items")

local TOPIMAGERES = {
	"img_iconsign_shangzhen", --上阵
	"img_iconsign_mingjiangce", --名将册
	"img_iconsign_jiban", --羁绊
}

function EventHalfPriceCell:ctor(itemId, index, callback)
    --问题详细
    self._index = index
    self._callback = callback
    self._itemId = itemId
    self._itemData = ShopRandomItems.get(self._itemId)
    assert(self._callback, "call back should not be nil!!")

    --ui
    self._item = nil        --物品
    self._resInfo = nil     --购买资源
    self._btnBuy = nil      --购买按钮

    local resource = {
		file = Path.getCSB("EventHalfPriceCell", "exploreMap"),
        binding = {
            _btnBuy = {
				events = {{event = "touch", method = "_onBuyClick"}}
			},
        }
	}
	EventHalfPriceCell.super.ctor(self, resource)
end

function EventHalfPriceCell:onCreate()
    self._btnBuy:setString(Lang.get("explore_half_buy"))
    self:_setItemDetail()
end

function EventHalfPriceCell:onEnter()
end

function EventHalfPriceCell:onExit()
end

function EventHalfPriceCell:_setItemDetail()
    self._item:initUI(self._itemData.item_type, self._itemData.item_id, self._itemData.item_num)
    self._item:showName(true)
    self._resInfo:updateUI(self._itemData.type1, self._itemData.value1, self._itemData.size1)
    self:_showTopImage()
end

function EventHalfPriceCell:_onBuyClick()
    self._callback(self._index, self._itemData)
end

function EventHalfPriceCell:setHasBuy()
    self._btnBuy:setEnabled(false)
    self._btnBuy:setString(Lang.get("explore_half_bought"))
    self._item:setIconDark(true)
end

function EventHalfPriceCell:_showTopImage()
    local heroID
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    if self._itemData.item_type == TypeConvertHelper.TYPE_FRAGMENT then
        local Fragment = require("app.config.fragment")
        local fragmentData = Fragment.get(self._itemData.item_id)
        assert(fragmentData ~= nil, "can not find frament data id = "..(self._itemData.item_id or "nil"))
        if fragmentData.comp_type == TypeConvertHelper.TYPE_HERO then
            heroID = fragmentData.comp_value
        end
    elseif self._itemData.item_type == TypeConvertHelper.TYPE_HERO then
        heroID = self._itemData.item_id
    end

    if not heroID then
        self._topImage:setVisible(false)
        return
    end

    local UserDataHelper = require("app.utils.UserDataHelper")
    local res = UserDataHelper.getHeroTopImage(heroID)
    if res then
        self._topImage:loadTexture(res)
		self._topImage:setVisible(true)
    else
        self._topImage:setVisible(false)
    end
end

return EventHalfPriceCell
