--
-- Author: hedl
-- Date: 2017-3-21 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PackageItemCell = class("PackageItemCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
function PackageItemCell:ctor()
	self._item1 = nil
	self._item2 = nil
	self._buttonReplace1 = nil
	self._buttonReplace2 = nil
	self._textDes1 = nil
	self._textDes2 = nil

	local resource = {
		file = Path.getCSB("PackageItemCell", "package"),

	}
	PackageItemCell.super.ctor(self, resource)
end

function PackageItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	for i=1, 2 do
		local item = self["_item"..i]
		local button = self["_buttonReplace"..i]
		if item and button then
			item:setVisible(false)
			button:addClickEventListenerEx(handler(self, self._onBtnClick))
		end
	end


end

function PackageItemCell:updateUI(index, itemLine)
	for i=1, 2 do
		local item = self["_item"..i]
		item:setVisible(false)
	end

	local function updateItemCell(i, item)
		local type = item:getType()
		local value = item:getId()
		local size = item:getNum()

		if self["_item"..i] then
			self["_item"..i]:updateUI(type, value, size)
			self["_item"..i]:setVisible(true)
			self["_item"..i]:setTag(i + index*2)
		end

		if type == TypeConvertHelper.TYPE_ITEM then
			self["_nodeCount"..i]:setVisible(false)
			self["_textDes"..i]:setVisible(true)
			
			local itemConfig = item:getConfig()
			if itemConfig then
				self["_textDes"..i]:setString(itemConfig.bag_description)
				self["_textDes"..i]:getVirtualRenderer():setLineSpacing(6) 
			end

			local button = self["_buttonReplace"..i]
			if button then
				if itemConfig.button_type == 0 then
					button:setVisible(false)
				else
					local showRedPoint = G_UserData:getItems():hasRedPointByItemID(item:getId())
					button:setVisible(true)
					button:switchToHightLight()
					button:setString(itemConfig.button_txt)
					button:setButtonTag(i + index*2)
					button:showRedPoint(showRedPoint)
				end
			end
		elseif type == TypeConvertHelper.TYPE_FRAGMENT then
			self["_nodeCount"..i]:setVisible(true)
			self["_textDes"..i]:setVisible(false)

			local fragmentNum = item:getConfig().fragment_num
			local isEnough = size >= fragmentNum
			self["_nodeCount"..i]:updateUI(Lang.get("hero_list_cell_frag_des"), size, fragmentNum)
			local btnDes = isEnough and Lang.get("fragment_list_cell_btn_compose") or Lang.get("fragment_list_cell_btn_get")
			self["_buttonReplace"..i]:setString(btnDes)
			self["_buttonReplace"..i]:setButtonTag(i + index*2)
			self["_buttonReplace"..i]:showRedPoint(isEnough)
			if isEnough then
				self["_buttonReplace"..i]:switchToHightLight()
				self["_nodeCount"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)
				self["_nodeCount"..i]:setMaxColor(Colors.BRIGHT_BG_GREEN)
			else
				self["_buttonReplace"..i]:switchToNormal()
				self["_nodeCount"..i]:setValueColor(Colors.BRIGHT_BG_ONE)
				self["_nodeCount"..i]:setMaxColor(Colors.BRIGHT_BG_ONE)
			end
		end
	end

	for i , item in ipairs(itemLine) do
		updateItemCell(i, item)
	end

end


function PackageItemCell:_onBtnClick(sender)
	local curSelectedPos = sender:getTag()
	logWarn(" PackageItemCell:_onBtnClick  "..curSelectedPos)

	self:dispatchCustomCallback(curSelectedPos)
end


function PackageItemCell:updateItemNum(id, num)

	for i=1 , 2  do
		local itemInfo = self["_item"..i]
		if itemInfo and itemInfo:getIconId() == id then
			itemInfo:setIconCount(num)
			return true
		end
	end
	return false
end


return PackageItemCell
