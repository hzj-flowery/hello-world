
--
-- Author: Liangxu
-- Date: 2018-8-31
-- 复选战马Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupCheckHorseCell = class("PopupCheckHorseCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseDataHelper = require("app.utils.data.HorseDataHelper")
local TextHelper = require("app.utils.TextHelper")
local AttributeConst = require("app.const.AttributeConst")
local HorseConst = require("app.const.HorseConst")

function PopupCheckHorseCell:ctor()
	local resource = {
		file = Path.getCSB("PopupCheckHorseCell", "common"),
		binding = {
			
		}
	}
	PopupCheckHorseCell.super.ctor(self, resource)
end

function PopupCheckHorseCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._checkBox1:addEventListener(handler(self, self._onCheckBoxClicked1))
	self._checkBox2:addEventListener(handler(self, self._onCheckBoxClicked2))
	self._checkBox1:setSwallowTouches(false)
	self._checkBox2:setSwallowTouches(false)
end

function PopupCheckHorseCell:update(data1, data2, isAdded1, isAdded2)
	local function updateCell(index, data, isAdded)
		if data then
			self["_item"..index]:setVisible(true)

			local baseId = data:getBase_id()
			local star = data:getStar()
			local name = HorseDataHelper.getHorseName(baseId, star)
			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_HORSE, baseId)
			self["_item"..index]:setName(name)
			self["_item"..index]:setTouchEnabled(true)
			self["_nodeStar"..index]:setCount(star, HorseConst.HORSE_STAR_MAX)
			self["_checkBox"..index]:setSelected(isAdded)

			self:_showAttrDes(index, data)
		else
			self["_item"..index]:setVisible(false)
		end
	end
	
	updateCell(1, data1, isAdded1)
	updateCell(2, data2, isAdded2)
end

function PopupCheckHorseCell:_showAttrDes(index, data)
	local showAttrIds = {AttributeConst.ATK, AttributeConst.HP} --需要显示的2种属性
	local info = HorseDataHelper.getHorseAttrInfo(data)

	for i = 1, 2 do
		local attrId = showAttrIds[i]
		local value = info[attrId]
		if value then
			local attrName, attrValue = TextHelper.getAttrBasicText(attrId, value)
			attrName = TextHelper.expandTextByLen(attrName, 4)
			self["_nodeAttr"..index.."_"..i]:updateUI(attrName, "+"..attrValue)
			self["_nodeAttr"..index.."_"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)
			self["_nodeAttr"..index.."_"..i]:setVisible(true)
		else
			self["_nodeAttr"..index.."_"..i]:setVisible(false)
		end
	end
end

function PopupCheckHorseCell:_onCheckBoxClicked1(sender)
	local selected = self._checkBox1:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(1, selected, self)
	else
		self._checkBox1:setSelected(not selected)
	end
end

function PopupCheckHorseCell:_onCheckBoxClicked2(sender)
	local selected = self._checkBox2:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(2, selected, self)
	else
		self._checkBox2:setSelected(not selected)
	end
end

function PopupCheckHorseCell:setCheckBoxSelected(t, selected)
	self["_checkBox"..t]:setSelected(selected)
end

return PopupCheckHorseCell