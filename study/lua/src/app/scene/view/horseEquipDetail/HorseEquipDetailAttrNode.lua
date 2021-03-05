--
-- Author: JerryHe
-- Date: 2019-01-28
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HorseEquipDetailAttrNode = class("HorseEquipDetailAttrNode", ListViewCellBase)
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")
local TextHelper = require("app.utils.TextHelper")
local AttributeConst = require("app.const.AttributeConst")
local RedPointHelper = require("app.data.RedPointHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")

function HorseEquipDetailAttrNode:ctor(equipData, rangeType)
	self._equipData = equipData
	self._rangeType = rangeType

	local resource = {
		file = Path.getCSB("HorseEquipDetailAttrNode", "horse"),
		binding = {
		},
	}
	HorseEquipDetailAttrNode.super.ctor(self, resource)
end

function HorseEquipDetailAttrNode:onCreate()
	local contentSize = self._panelBg:getContentSize()
	local posY = self._nodeCommon:getPositionY()

	self:setContentSize(contentSize)
	self._nodeTitle:setFontSize(24)
	self._nodeTitle:setTitle(Lang.get("horse_detail_title_attr"))

	self:_updateAttrDes()
	self._nodeCommon:setPositionY(posY)
end

function HorseEquipDetailAttrNode:_updateAttrDes()
	local attrInfo = HorseEquipDataHelper.getHorseEquipAttrInfo(self._equipData)
	local desInfo = TextHelper.getAttrInfoBySort(attrInfo)
	for i = 1, 2 do             --战马装备属性，目前只配置了2种
		local info = desInfo[i]
		if info then
			self["_nodeAttr"..i]:updateView(info.id, info.value, nil, 4)
			self["_nodeAttr"..i]:setVisible(true)
		else
			self["_nodeAttr"..i]:setVisible(false)
		end
	end
end

return HorseEquipDetailAttrNode