--
-- Author: Liangxu
-- Date: 2017-07-07 11:22:36
-- 选择装备Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupChooseJadeStoneCell = class("PopupChooseJadeStoneCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")

function PopupChooseJadeStoneCell:ctor()
	local resource = {
		file = Path.getCSB("PopupChooseJadeCell", "common"),
		binding = {
			_buttonChoose1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_buttonChoose2 = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			}
		}
	}
	PopupChooseJadeStoneCell.super.ctor(self, resource)
end

function PopupChooseJadeStoneCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function PopupChooseJadeStoneCell:update(data1, data2, isChange)
	local function updateCell(index, data)
		if data then
			if data.showRP == true then
				self["_buttonChoose" .. index]:showRedPoint(true)
			else
				self["_buttonChoose" .. index]:showRedPoint(false)
			end
			self["_item" .. index]:setVisible(true)

			local baseId = data:getSys_id()

			self["_item" .. index]:updateUI(TypeConvertHelper.TYPE_JADE_STONE, baseId)
			self["_item" .. index]:setTouchEnabled(true)
			local icon = self["_item" .. index]:getCommonIcon()
			local params = icon:getItemParams()

			self:_showAttrDes(index, data)

			local heroUnitData = data:getEquipHeroBaseData()
			if heroUnitData then
				local heroBaseId = heroUnitData:getBase_id()
				local limitLevel = heroUnitData:getLimit_level()
				local limitRedLevel = heroUnitData:getLimit_rtg()
				local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
				self["_textHeroName" .. index]:setString(heroParam.name)
				self["_textHeroName" .. index]:setColor(heroParam.icon_color)
				self["_textHeroName" .. index]:setVisible(true)
				UIHelper.updateTextOutline(self["_textHeroName" .. index], heroParam)
			else
				self["_textHeroName" .. index]:setVisible(false)
			end

			if data:isInEquipment() then
				self["_buttonChoose" .. index]:setString(Lang.get("equipment_choose_jade_cell_btn1"))
				self["_buttonChoose" .. index]:switchToNormal()
			else
				local text = Lang.get("equipment_choose_jade_cell_btn2")
				if isChange then
					text = Lang.get("equipment_choose_jade_cell_btn4")
				end
				self["_buttonChoose" .. index]:setString(text)
				self["_buttonChoose" .. index]:switchToHightLight()
			end
		else
			self["_item" .. index]:setVisible(false)
		end
	end

	updateCell(1, data1)
	updateCell(2, data2)
end

function PopupChooseJadeStoneCell:_showAttrDes(index, data)
	local desInfo = data:getConfig().profile

	self["_nodeAttr" .. index .. "_" .. 1]:updateUI("", "", nil, 5)
	-- self["_nodeAttr" .. index .. "_" .. 1]:setValueColor(Colors.BRIGHT_BG_GREEN)
	self["_nodeAttr" .. index .. "_" .. 1]:setValueToRichText(desInfo, 160)
	self["_nodeAttr" .. index .. "_" .. 1]:setVisible(true)
	self["_nodeAttr" .. index .. "_" .. 2]:setVisible(false)
end

function PopupChooseJadeStoneCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PopupChooseJadeStoneCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return PopupChooseJadeStoneCell
