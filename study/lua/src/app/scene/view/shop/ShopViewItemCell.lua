--
-- Author: hedl
-- Date: 2017-3-21 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local ShopViewItemCell = class("ShopViewItemCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
function ShopViewItemCell:ctor()
	self._itemInfo1 = nil
	self._itemInfo2 = nil

	local resource = {
		file = Path.getCSB("ShopViewItemCell", "shop"),

	}
	ShopViewItemCell.super.ctor(self, resource)
end

function ShopViewItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	for i=1, 2 do
		local item = self["_itemInfo"..i]
		if item then
			item:setVisible(false)
		end
	end
end

function ShopViewItemCell:update(index, itemLine, tabIndex)
	--dump(itemLine)
	self:setName("ShopViewItemCell"..index+1)
	for i=1, 2 do
		local item = self["_itemInfo"..i]
		if item then
			item:setVisible(false)
		end
	end

	for i , item in pairs(itemLine) do
		local itemInfo = self["_itemInfo"..i]
		if itemInfo then
			itemInfo:updateUI(item)
			itemInfo:setVisible(true)
			itemInfo:setTag(i + index*2)
			itemInfo:setCallBack(handler(self,self._onBtnClick))
		end
	end
end


function ShopViewItemCell:_onBtnClick(iconNameNode)
	dump(iconNameNode)
	local curSelectedPos = iconNameNode:getTag()
	logWarn(" ShopViewItemCell:_onBtnClick  "..curSelectedPos)
	
	self:dispatchCustomCallback(curSelectedPos)
end


function ShopViewItemCell:findItemByPos(pos)
	for i=1 , 2  do
		local itemInfo = self["_itemInfo"..i]
		if itemInfo and itemInfo:getTag() == pos then
			return itemInfo
		end
	end
	return nil
end


return ShopViewItemCell