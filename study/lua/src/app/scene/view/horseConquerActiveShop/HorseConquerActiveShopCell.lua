--
-- Author: Liangxu
-- Date: 2019-2-15
-- 训马商店cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HorseConquerActiveShopCell = class("HorseConquerActiveShopCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

function HorseConquerActiveShopCell:ctor()
	local resource = {
		file = Path.getCSB("EquipActiveShopCell", "equipActiveShop"),
		binding = {
			_button1 = {
				events = {{event = "touch", method = "_onClickButton1"}}
			},
			_button2 = {
				events = {{event = "touch", method = "_onClickButton2"}}
			},
		}
	}
	HorseConquerActiveShopCell.super.ctor(self, resource)
end

function HorseConquerActiveShopCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function HorseConquerActiveShopCell:update(goodId1, goodId2)
	local function updateNode(index, goodId)
		if goodId then
			self["_item"..index]:setVisible(true)
			local data = G_UserData:getShopActive():getUnitDataWithId(goodId)
			local info = data:getConfig()
			local param = TypeConvertHelper.convert(info.type, info.value)
			local costInfo = ShopActiveDataHelper.getCostInfo(goodId)
			local isBought = data:isBought()
			local strButton = isBought and Lang.get("shop_btn_buyed") or Lang.get("shop_btn_buy")

			self["_icon"..index]:unInitUI()
			self["_icon"..index]:initUI(info.type, info.value, info.size)
			self["_icon"..index]:setTouchEnabled(true)
			self["_textName"..index]:setString(param.name)
			self["_textName"..index]:setColor(param.icon_color)
			
			if info.type == TypeConvertHelper.TYPE_FRAGMENT then
				self:_showFragmentNum(info.type, info.value, index)
			end
			
			for i = 1, 2 do
				local cost = costInfo[i]
				if cost then
					self["_cost"..index.."_"..i]:setVisible(true)
					self["_cost"..index.."_"..i]:updateUI(cost.type, cost.value, cost.size)
				else
					self["_cost"..index.."_"..i]:setVisible(false)
				end
			end
			self["_button"..index]:setString(strButton)
			self["_button"..index]:setEnabled(not isBought)
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateNode(1, goodId1)
	updateNode(2, goodId2)
end

function HorseConquerActiveShopCell:_showFragmentNum(type, value, index)
	self["_nodeFragment"..index]:removeAllChildren()
    local textFragment = ccui.RichText:create()
    self["_nodeFragment"..index]:addChild(textFragment)
    textFragment:setAnchorPoint(cc.p(0,0.5))

	local itemParams = TypeConvertHelper.convert(type, value)
	local num = UserDataHelper.getNumByTypeAndValue(type,value)
	local textContent = self["_textName"..index]:getVirtualRendererSize()
	local txtX, txtY = self["_textName"..index]:getPosition()
	self["_nodeFragment"..index]:setVisible(true)

	local richTextColor = Colors.BRIGHT_BG_TWO
	if num >= itemParams.cfg.fragment_num then
		richTextColor = Colors.BRIGHT_BG_GREEN
	else
		richTextColor = Colors.BRIGHT_BG_RED
	end

	local richText = Lang.get("shop_fragment_limit", {
		num = num,
		color =  Colors.colorToNumber(richTextColor),
		max = itemParams.cfg.fragment_num,
	})

	textFragment:setRichTextWithJson(richText)
	self["_nodeFragment"..index]:setPosition(txtX + textContent.width + 4, txtY)--中文括号空隙比较大

end

function HorseConquerActiveShopCell:_onClickButton1()
	self:dispatchCustomCallback(1)
end

function HorseConquerActiveShopCell:_onClickButton2()
	self:dispatchCustomCallback(2)
end

return HorseConquerActiveShopCell