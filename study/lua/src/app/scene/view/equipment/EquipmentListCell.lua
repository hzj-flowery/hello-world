--
-- Author: Liangxu
-- Date: 2017-04-06 15:34:16
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local EquipmentListCell = class("EquipmentListCell", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

EquipmentListCell.R_LEVEL_NORMAL_POSY = 30 -- 精炼等级正常时y坐标
EquipmentListCell.R_LEVEL_JADE_POSY = 36 -- 精炼等级有玉石槽y坐标

function EquipmentListCell:ctor()
	local resource = {
		file = Path.getCSB("EquipmentListCell", "equipment"),
		binding = {
			_buttonStrengthen1 = {
				events = {{event = "touch", method = "_onButtonStrengthenClicked1"}}
			},
			_buttonStrengthen2 = {
				events = {{event = "touch", method = "_onButtonStrengthenClicked2"}}
			}
		}
	}
	EquipmentListCell.super.ctor(self, resource)
end

function EquipmentListCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._buttonStrengthen1:setString(Lang.get("equipment_btn_strengthen"))
	self._buttonStrengthen2:setString(Lang.get("equipment_btn_strengthen"))
end

function EquipmentListCell:update(equipId1, equipId2)
	local function updateCell(index, equipId)
		if equipId then
			if type(equipId) ~= "number" then
				return
			end
			self["_item" .. index]:setVisible(true)
			local data = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
			local baseId = data:getBase_id()
			local level = data:getLevel()
			local rank = data:getR_level()

			self["_item" .. index]:updateUI(TypeConvertHelper.TYPE_EQUIPMENT, baseId)
			self["_item" .. index]:setTouchEnabled(true)
			local icon = self["_item" .. index]:getCommonIcon()
			icon:getIconTemplate():setId(equipId)
			local equipmenticon = icon:getIconTemplate()
			local FunctionCheck = require("app.utils.logic.FunctionCheck")
			self["_textRank" .. index]:setPositionY(EquipmentListCell.R_LEVEL_NORMAL_POSY)
			if FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) then
				local UserDataHelper = require("app.utils.UserDataHelper")
				local _, convertHeroBaseId = UserDataHelper.getHeroBaseIdWithEquipId(equipId)
				if equipmenticon:updateJadeSlot(data:getJadeSysIds(), convertHeroBaseId) then
					self["_textRank" .. index]:setPositionY(EquipmentListCell.R_LEVEL_JADE_POSY)
				end
			end
			local params = icon:getItemParams()
			self["_imageLevel" .. index]:loadTexture(Path.getUICommonFrame("img_iconsmithingbg_0" .. params.color))
			self["_textLevel" .. index]:setString(level)
			self["_textLevel" .. index]:setColor(Colors.getNumberColor(params.color))
			self["_textLevel" .. index]:enableOutline(Colors.getNumberColorOutline(params.color))
			self["_imageLevel" .. index]:setVisible(level > 0)
			self["_textRank" .. index]:setString("+" .. rank)
			self["_textRank" .. index]:setVisible(rank > 0)

			self:_showAttrDes(index, data)

			local heroUnitData = UserDataHelper.getHeroDataWithEquipId(data:getId())
			if heroUnitData then
				local baseId = heroUnitData:getBase_id()
				local limitLevel = heroUnitData:getLimit_level()
				local limitRedLevel = heroUnitData:getLimit_rtg()
				local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)
				self["_textHeroName" .. index]:setString(heroParam.name)
				self["_textHeroName" .. index]:setColor(heroParam.icon_color)
				-- self["_textHeroName"..index]:enableOutline(heroParam.icon_color_outline, 2)
				require("yoka.utils.UIHelper").updateTextOutline(self["_textHeroName" .. index], heroParam)
				self["_textHeroName" .. index]:setVisible(true)
			else
				self["_textHeroName" .. index]:setVisible(false)
			end
		else
			self["_item" .. index]:setVisible(false)
		end
	end

	updateCell(1, equipId1)
	updateCell(2, equipId2)
end

function EquipmentListCell:_showAttrDes(index, data)
	local info = UserDataHelper.getEquipAttrInfo(data)
	local desInfo = TextHelper.getAttrInfoBySort(info)

	for i = 1, 2 do
		local one = desInfo[i]
		if one then
			local attrName, attrValue = TextHelper.getAttrBasicText(one.id, one.value)
			attrName = TextHelper.expandTextByLen(attrName, 4)
			self["_nodeAttr" .. index .. "_" .. i]:updateUI(attrName, "+" .. attrValue)
			self["_nodeAttr" .. index .. "_" .. i]:setValueColor(Colors.BRIGHT_BG_GREEN)
			self["_nodeAttr" .. index .. "_" .. i]:setVisible(true)
		else
			self["_nodeAttr" .. index .. "_" .. i]:setVisible(false)
		end
	end
end

function EquipmentListCell:_onButtonStrengthenClicked1()
	self:dispatchCustomCallback(1)
end

function EquipmentListCell:_onButtonStrengthenClicked2()
	self:dispatchCustomCallback(2)
end

return EquipmentListCell
