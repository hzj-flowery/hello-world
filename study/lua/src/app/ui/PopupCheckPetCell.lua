--
-- Author: Liangxu
-- Date: 2017-07-15 15:39:09
-- 复选武将Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupCheckPetCell = class("PopupCheckPetCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupCheckPetCell:ctor()
	local resource = {
		file = Path.getCSB("PopupCheckPetCell", "common"),
		binding = {
			
		}
	}
	PopupCheckPetCell.super.ctor(self, resource)
end

function PopupCheckPetCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._checkBox1:addEventListener(handler(self, self._onCheckBoxClicked1))
	self._checkBox2:addEventListener(handler(self, self._onCheckBoxClicked2))
	self._checkBox1:setSwallowTouches(false)
	self._checkBox2:setSwallowTouches(false)
end

function PopupCheckPetCell:update(data1, data2, isAdded1, isAdded2)
	local function updateCell(index, data, isAdded)
		if data then
			local TypeConvertHelper = require("app.utils.TypeConvertHelper")
			local type = TypeConvertHelper.TYPE_PET
			self["_item"..index]:setVisible(true)
			self["_item"..index]:updateUI(type, data:getBase_id())
			local icon = self["_item"..index]:getCommonIcon()
			local params = icon:getItemParams()
	
			local starLevel = data:getStar()
			self["_item"..index]:setName(params.name)

			self["_imageMark"..index]:setVisible(data.isYoke)
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

function PopupCheckPetCell:_onCheckBoxClicked1(sender)
	local selected = self._checkBox1:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(1, selected, self)
	else
		self._checkBox1:setSelected(not selected)
	end
end

function PopupCheckPetCell:_onCheckBoxClicked2(sender)
	local selected = self._checkBox2:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(2, selected, self)
	else
		self._checkBox2:setSelected(not selected)
	end
end

function PopupCheckPetCell:setCheckBoxSelected(t, selected)
	self["_checkBox"..t]:setSelected(selected)
	self:dispatchCustomCallback(t, selected, self)
end

return PopupCheckPetCell