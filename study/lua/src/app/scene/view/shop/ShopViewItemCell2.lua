-- Author: zhanglinsen
-- Date:2018-08-08 12:50:24
-- Describle：
local ListViewCellBase = require("app.ui.ListViewCellBase")
local ShopViewItemCell2 = class("ShopViewItemCell2", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TOTAL_COUNT = 4
local BACKGROUND_NORMAL = 0 --正常显示背景
local BACKGROUND_START = 1 -- 开始时显示背景
local BACKGROUND_END = 2 --结束时显示背景
function ShopViewItemCell2:ctor()
	self._itemInfo1 = nil
	self._itemInfo2 = nil
	self._itemInfo3 = nil
	self._itemInfo4 = nil

	local resource = {
		file = Path.getCSB("ShopViewItemCell2", "shop"),

	}
	ShopViewItemCell2.super.ctor(self, resource)
end

function ShopViewItemCell2:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	for i=1, TOTAL_COUNT do
		local item = self["_itemInfo"..i]
		if item then
			item:setVisible(false)
		end
	end
end

function ShopViewItemCell2:update(index, itemLine, tabIndex)
	--dump(itemLine)
	self:setName("ShopViewItemCell2"..index+1)
	for i=1, TOTAL_COUNT do
		local item = self["_itemInfo"..i]
		if item then
			item:setVisible(false)
		end
	end

	for i , item in pairs(itemLine) do
		local itemInfo = self["_itemInfo"..i]
		if itemInfo then
			local bgStatus = BACKGROUND_NORMAL;
			if i == 1 then bgStatus = BACKGROUND_START end
			if i == TOTAL_COUNT then bgStatus = BACKGROUND_END end
			itemInfo:updateUI(item, nil, tabIndex)
			itemInfo:setVisible(true)
			itemInfo:updateBackgroundImge(bgStatus)
			itemInfo:setTag(i + index*TOTAL_COUNT)
			itemInfo:setCallBack(handler(self,self._onBtnClick))
		end
	end
end


function ShopViewItemCell2:_onBtnClick(iconNameNode)
	dump(iconNameNode)
	local curSelectedPos = iconNameNode:getTag()
	logWarn(" ShopViewItemCell2:_onBtnClick  "..curSelectedPos)
	
	self:dispatchCustomCallback(curSelectedPos)
end


function ShopViewItemCell2:findItemByPos(pos)
	for i=1 , TOTAL_COUNT  do
		local itemInfo = self["_itemInfo"..i]
		if itemInfo and itemInfo:getTag() == pos then
			return itemInfo
		end
	end
	return nil
end


return ShopViewItemCell2