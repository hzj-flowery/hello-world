--
-- Author: Liangxu
-- Date: 2017-07-07 11:22:36
-- 选择装备Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupChooseEquipCell = class("PopupChooseEquipCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper  = require("yoka.utils.UIHelper")

PopupChooseEquipCell.R_LEVEL_NORMAL_POSY = 30 -- 精炼等级正常时y坐标
PopupChooseEquipCell.R_LEVEL_JADE_POSY = 36 -- 精炼等级有玉石槽y坐标

function PopupChooseEquipCell:ctor()
	local resource = {
		file = Path.getCSB("PopupChooseEquipCell", "common"),
		binding = {
			_buttonChoose1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_buttonChoose2 = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			}
		}
	}
	PopupChooseEquipCell.super.ctor(self, resource)
end

function PopupChooseEquipCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function PopupChooseEquipCell:update(data1, data2, notSlot)
	local function updateCell(index, data)
		if data then
			self["_item" .. index]:setVisible(true)

			local baseId = data:getBase_id()
			local level = data:getLevel()
			local rank = data:getR_level()

			self["_item" .. index]:updateUI(TypeConvertHelper.TYPE_EQUIPMENT, baseId)
			self["_item" .. index]:setTouchEnabled(true)
			local icon = self["_item" .. index]:getCommonIcon()
			local params = icon:getItemParams()
			local equipmenticon = icon:getIconTemplate()
			self["_textRank" .. index]:setPositionY(PopupChooseEquipCell.R_LEVEL_NORMAL_POSY)
			local FunctionCheck = require("app.utils.logic.FunctionCheck")
			if FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) and (not notSlot) then
				if equipmenticon:updateJadeSlot(data:getJadeSysIds()) then
					self["_textRank" .. index]:setPositionY(PopupChooseEquipCell.R_LEVEL_JADE_POSY)
				end
			end
			self["_imageLevel" .. index]:loadTexture(Path.getUICommonFrame("img_iconsmithingbg_0" .. params.color))
			self["_textLevel" .. index]:setString(level)
			self["_imageLevel" .. index]:setVisible(level > 0)
			self["_textRank" .. index]:setString("+" .. rank)
			self["_textRank" .. index]:setVisible(rank > 0)

			self:_showAttrDes(index, data)

			local heroBaseId = data.heroBaseId
			local limitLevel = data.limitLevel
			local limitRedLevel = data.limitRedLevel
			if heroBaseId then
				local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
				self["_textHeroName" .. index]:setString(heroParam.name)
				self["_textHeroName" .. index]:setColor(heroParam.icon_color)
				self["_textHeroName" .. index]:setVisible(true)
				UIHelper.updateTextOutline(self["_textHeroName" .. index], heroParam)
			else
				self["_textHeroName" .. index]:setVisible(false)
			end

			self["_buttonChoose" .. index]:setString(data.btnDesc)
			if data.btnIsHightLight == false then
				self["_buttonChoose" .. index]:switchToNormal()
			else
				self["_buttonChoose" .. index]:switchToHightLight()
			end

			if data.showRP == true then
				self["_buttonChoose" .. index]:showRedPoint(true)
			else
				self["_buttonChoose" .. index]:showRedPoint(false)
			end

			if data.isYoke then
				local width = self["_item" .. index]:getNameSizeWidth()
				self["_textYoke" .. index]:setPositionX(120 + width)
				self["_textYoke" .. index]:setVisible(true)
			else
				self["_textYoke" .. index]:setVisible(false)
			end
		else
			self["_item" .. index]:setVisible(false)
		end
	end

	updateCell(1, data1)
	updateCell(2, data2)
end

function PopupChooseEquipCell:_showAttrDes(index, data)
	local info = UserDataHelper.getEquipAttrInfo(data)
	local desInfo = TextHelper.getAttrInfoBySort(info)

	for i = 1, 2 do
		local one = desInfo[i]
		if one then
			local attrName, attrValue = TextHelper.getAttrBasicText(one.id, one.value)
			attrName = TextHelper.expandTextByLen(attrName, 4)
			self["_nodeAttr" .. index .. "_" .. i]:updateUI(attrName, "+" .. attrValue, nil, 5)
			self["_nodeAttr" .. index .. "_" .. i]:setValueColor(Colors.BRIGHT_BG_GREEN)
			self["_nodeAttr" .. index .. "_" .. i]:setVisible(true)
		else
			self["_nodeAttr" .. index .. "_" .. i]:setVisible(false)
		end
	end
end

function PopupChooseEquipCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PopupChooseEquipCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return PopupChooseEquipCell
