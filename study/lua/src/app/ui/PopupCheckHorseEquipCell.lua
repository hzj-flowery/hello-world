--
-- Author: JerryHe
-- Date: 2019-01-29
-- 复选战马装备Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupCheckHorseEquipCell = class("PopupCheckHorseEquipCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupCheckHorseEquipCell:ctor()
	local resource = {
		file = Path.getCSB("PopupCheckHorseEquipCell", "common"),
		binding = {

		}
	}
	PopupCheckHorseEquipCell.super.ctor(self, resource)
end

function PopupCheckHorseEquipCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._checkBox1:addEventListener(handler(self, self._onCheckBoxClicked1))
	self._checkBox2:addEventListener(handler(self, self._onCheckBoxClicked2))
	self._checkBox1:setSwallowTouches(false)
	self._checkBox2:setSwallowTouches(false)
end

function PopupCheckHorseEquipCell:update(data1, data2, isAdded1, isAdded2)
	local function updateCell(index, data, isAdded)
		if data then
			self["_item"..index]:setVisible(true)

			local baseId = data:getBase_id()
			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_HORSE_EQUIP, baseId)
			self["_item"..index]:setTouchEnabled(true)

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

function PopupCheckHorseEquipCell:_onCheckBoxClicked1(sender)
	local selected = self._checkBox1:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(1, selected, self)
	else
		self._checkBox1:setSelected(not selected)
	end
end

function PopupCheckHorseEquipCell:_onCheckBoxClicked2(sender)
	local selected = self._checkBox2:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(2, selected, self)
	else
		self._checkBox2:setSelected(not selected)
	end
end

function PopupCheckHorseEquipCell:setCheckBoxSelected(t, selected)
	self["_checkBox"..t]:setSelected(selected)
end

return PopupCheckHorseEquipCell
