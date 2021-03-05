--
-- Author: Liangxu
-- Date: 2017-07-17 13:35:20
-- 复选装备Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupCheckEquipCell = class("PopupCheckEquipCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")

function PopupCheckEquipCell:ctor()
	local resource = {
		file = Path.getCSB("PopupCheckEquipCell", "common"),
		binding = {

		}
	}
	PopupCheckEquipCell.super.ctor(self, resource)
end

function PopupCheckEquipCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._checkBox1:addEventListener(handler(self, self._onCheckBoxClicked1))
	self._checkBox2:addEventListener(handler(self, self._onCheckBoxClicked2))
	self._checkBox1:setSwallowTouches(false)
	self._checkBox2:setSwallowTouches(false)
end

function PopupCheckEquipCell:update(data1, data2, isAdded1, isAdded2)
	local function updateCell(index, data, isAdded)
		if data then
			self["_item"..index]:setVisible(true)

			local baseId = data:getBase_id()
			local level = data:getLevel()
			local rank = data:getR_level()
			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_EQUIPMENT, baseId)
			self["_item"..index]:setTouchEnabled(true)
			local icon = self["_item"..index]:getCommonIcon()
			local params = icon:getItemParams()
			self["_imageLevel"..index]:loadTexture(Path.getUICommonFrame("img_iconsmithingbg_0"..params.color))
			self["_textLevel"..index]:setString(level)
			self["_imageLevel"..index]:setVisible(level > 0)
			self["_textRank"..index]:setString("+"..rank)
			self["_textRank"..index]:setVisible(rank > 0)

			for i = 1, 2 do
				local info = data.desValue[i]
				if info then
					self["_nodeDes"..index.."_"..i]:updateUI(info.des, info.value)
					self["_nodeDes"..index.."_"..i]:setValueColor(info.colorValue)
					self["_nodeDes"..index.."_"..i]:setVisible(true)
				else
					self["_nodeDes"..index.."_"..i]:setVisible(false)
				end
			end
			self["_checkBox"..index]:setSelected(isAdded)
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateCell(1, data1, isAdded1)
	updateCell(2, data2, isAdded2)
end

function PopupCheckEquipCell:_onCheckBoxClicked1(sender)
	local selected = self._checkBox1:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(1, selected, self)
	else
		self._checkBox1:setSelected(not selected)
	end
end

function PopupCheckEquipCell:_onCheckBoxClicked2(sender)
	local selected = self._checkBox2:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(2, selected, self)
	else
		self._checkBox2:setSelected(not selected)
	end
end

function PopupCheckEquipCell:setCheckBoxSelected(t, selected)
	self["_checkBox"..t]:setSelected(selected)
end

return PopupCheckEquipCell
