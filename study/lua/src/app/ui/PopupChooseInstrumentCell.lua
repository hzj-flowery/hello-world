--
-- Author: Liangxu
-- Date: 2017-9-15 10:11:03
-- 选择神兵Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupChooseInstrumentCell = class("PopupChooseInstrumentCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AttributeConst = require("app.const.AttributeConst")

function PopupChooseInstrumentCell:ctor()
	local resource = {
		file = Path.getCSB("PopupChooseInstrumentCell", "common"),
		binding = {
			_buttonChoose1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_buttonChoose2  = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			},
		}
	}
	PopupChooseInstrumentCell.super.ctor(self, resource)
end

function PopupChooseInstrumentCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function PopupChooseInstrumentCell:update(data1, data2)
	local function updateCell(index, data)
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

			self:_showAttrDes(index, data)
			
			local heroBaseId = data.heroBaseId
			local limitLevel = data.limitLevel
			local limitRedLevel = data.limitRedLevel
			if heroBaseId then
				local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
				self["_textHeroName"..index]:setString(heroParam.name)
				self["_textHeroName"..index]:setColor(heroParam.icon_color)
				self["_textHeroName"..index]:enableOutline(heroParam.icon_color_outline, 2)
				self["_textHeroName"..index]:setVisible(true)
			else
				self["_textHeroName"..index]:setVisible(false)
			end

			self["_buttonChoose"..index]:setString(data.btnDesc)
			self["_buttonChoose"..index]:switchToNormal()

			dump(data)
			if data.showRP == true then
				self["_buttonChoose"..index]:showRedPoint(true)
			else
				self["_buttonChoose"..index]:showRedPoint(false)
			end
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateCell(1, data1)
	updateCell(2, data2)
end

function PopupChooseInstrumentCell:_showAttrDes(index, data)
	local showAttrIds = {AttributeConst.ATK, AttributeConst.HP} --需要显示的2种属性
	local info = UserDataHelper.getInstrumentAttrInfo(data)

	for i = 1, 2 do
		local attrId = showAttrIds[i]
		local value = info[attrId]
		if value then
			local attrName, attrValue = TextHelper.getAttrBasicText(attrId, value)
			attrName = TextHelper.expandTextByLen(attrName, 4)
			self["_nodeAttr"..index.."_"..i]:updateUI(attrName, "+"..attrValue, nil, 5)
			self["_nodeAttr"..index.."_"..i]:setValueColor(Colors.BRIGHT_BG_GREEN)
			self["_nodeAttr"..index.."_"..i]:setVisible(true)
		else
			self["_nodeAttr"..index.."_"..i]:setVisible(false)
		end
	end
end

function PopupChooseInstrumentCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PopupChooseInstrumentCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return PopupChooseInstrumentCell
