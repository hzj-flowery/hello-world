-- @Author panhoa
-- @Date 10.15.2018
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local SeasonShopCell = class("SeasonShopCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")

function SeasonShopCell:ctor()
	local resource = {
		file = Path.getCSB("SeasonShopCell", "seasonShop"),
	}
	SeasonShopCell.super.ctor(self, resource)
end

function SeasonShopCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function SeasonShopCell:update(cellIndex, cellData)
	for index = 1, 2 do
        self["_itemInfo"..index]:setVisible(false)
    end
    
    local function updateItem(index, itemData)
        local itemInfo = self["_itemInfo"..index]
		if itemInfo then
			itemInfo:updateUI(itemData)
			itemInfo:setVisible(true)
			itemInfo:setTag(cellIndex*2 + index)
			itemInfo:setCallBack(handler(self,self._onBtnClick))
		end
    end

	for itemIndex, itemData in ipairs(cellData) do
        updateItem(itemIndex, itemData) 
     end
end

function SeasonShopCell:_onBtnClick(iconNameNode)
	local curSelectedPos = iconNameNode:getTag()
	self:dispatchCustomCallback(curSelectedPos)
end


return SeasonShopCell