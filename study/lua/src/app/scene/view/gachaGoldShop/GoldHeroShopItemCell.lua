-- Author: Panhao
-- Date: 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local GoldHeroShopItemCell = class("GoldHeroShopItemCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function GoldHeroShopItemCell:ctor()
	self._itemInfo1 = nil
	self._itemInfo2 = nil

	local resource = {
		file = Path.getCSB("GoldHeroShopItemCell", "gachaGoldShop"),

	}
	GoldHeroShopItemCell.super.ctor(self, resource)
end

function GoldHeroShopItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self:_initResourceView()
end

function GoldHeroShopItemCell:_initResourceView( ... )
    for i=1, 2 do
		local item = self["_itemInfo"..i]
		if item then
			item:setVisible(false)
		end
	end
end

function GoldHeroShopItemCell:update(index, itemLine, tabIdx)
	for i=1, 2 do
		local item = self["_itemInfo"..i]
		if item then
			item:setVisible(false)
		end
	end

	for i , item in pairs(itemLine) do
		local itemInfo = self["_itemInfo"..i]
        if itemInfo then
            itemInfo:updateUI(item, tabIdx == 1)
			itemInfo:setVisible(true)
			itemInfo:setTag(i + index*2)
            itemInfo:setCallBack(handler(self,self._onBtnClick))
            local discount = (item:getConfig().discount or 0)
            itemInfo:updateDiscount(tonumber(discount))
		end
	end
end

function GoldHeroShopItemCell:_onBtnClick(iconNameNode)
	local curSelectedPos = iconNameNode:getTag()
	self:dispatchCustomCallback(curSelectedPos)
end

function GoldHeroShopItemCell:findItemByPos(pos)
	for i=1 , 2  do
		local itemInfo = self["_itemInfo"..i]
		if itemInfo and itemInfo:getTag() == pos then
			return itemInfo
		end
	end
	return nil
end


return GoldHeroShopItemCell