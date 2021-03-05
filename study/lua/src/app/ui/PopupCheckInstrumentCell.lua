--
-- Author: Liangxu
-- Date: 2017-9-19 14:47:51
-- 复选神兵Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupCheckInstrumentCell = class("PopupCheckInstrumentCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local AttributeConst = require("app.const.AttributeConst")

function PopupCheckInstrumentCell:ctor()
	local resource = {
		file = Path.getCSB("PopupCheckInstrumentCell", "common"),
		binding = {
			
		}
	}
	PopupCheckInstrumentCell.super.ctor(self, resource)
end

function PopupCheckInstrumentCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._checkBox1:addEventListener(handler(self, self._onCheckBoxClicked1))
	self._checkBox2:addEventListener(handler(self, self._onCheckBoxClicked2))
	self._checkBox1:setSwallowTouches(false)
	self._checkBox2:setSwallowTouches(false)
end

function PopupCheckInstrumentCell:update(data1, data2, isAdded1, isAdded2)
	local function updateCell(index, data, isAdded)
		if data then
			self["_item"..index]:setVisible(true)

			local baseId = data:getBase_id()
			local level = data:getLevel()
			local limitLevel = data:getLimit_level()
			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_INSTRUMENT, baseId)
			self["_item"..index]:setTouchEnabled(true)
			local icon = self["_item"..index]:getCommonIcon()
			icon:getIconTemplate():updateUI(baseId, nil, limitLevel)
			local params = icon:getItemParams()
			self["_item"..index]:setName(params.name, params.icon_color, params)
			self["_textRank"..index]:setString("+"..level)
			self["_textRank"..index]:setVisible(level > 0)

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

function PopupCheckInstrumentCell:_showAttrDes(index, data)
	local showAttrIds = {AttributeConst.ATK, AttributeConst.HP} --需要显示的2种属性
	local info = UserDataHelper.getInstrumentAttrInfo(data)

	for i = 1, 2 do
		local attrId = showAttrIds[i]
		local value = info[i]
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

function PopupCheckInstrumentCell:_onCheckBoxClicked1(sender)
	local selected = self._checkBox1:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(1, selected, self)
	else
		self._checkBox1:setSelected(not selected)
	end
end

function PopupCheckInstrumentCell:_onCheckBoxClicked2(sender)
	local selected = self._checkBox2:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(2, selected, self)
	else
		self._checkBox2:setSelected(not selected)
	end
end

function PopupCheckInstrumentCell:setCheckBoxSelected(t, selected)
	self["_checkBox"..t]:setSelected(selected)
end

return PopupCheckInstrumentCell