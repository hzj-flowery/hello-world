local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroLimitDetailAttrNode = class("HeroLimitDetailAttrNode", ListViewCellBase)
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local AttributeConst = require("app.const.AttributeConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local HeroConst = require("app.const.HeroConst")

function HeroLimitDetailAttrNode:ctor(heroUnitData)
	self._heroUnitData = heroUnitData

	local resource = {
		file = Path.getCSB("HeroLimitDetailAttrNode", "hero"),
		binding = {
			
		},
	}

	HeroLimitDetailAttrNode.super.ctor(self, resource)
end

function HeroLimitDetailAttrNode:onCreate()
	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)
	for i = 1, 2 do
		self:_update(self._heroUnitData, i)
	end
end

function HeroLimitDetailAttrNode:_update(heroUnitData, index)
	self["_nodeTitle"..index]:setFontSize(24)
	self["_nodeTitle"..index]:setTitle(Lang.get("hero_detail_title_attr"))
	local limitDataType = HeroDataHelper.getLimitDataType(heroUnitData)
	local lv1, lv2
	if limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		if index==1 then
			lv1 = 0
		else
			lv1 = HeroConst.HERO_LIMIT_RED_MAX_LEVEL
		end
		lv2 = 0
	else
		lv1 = heroUnitData:getLimit_level()
		if index==1 then
			lv2 = 0
		else
			lv2 = HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL
		end
	end

	local attr1 = HeroDataHelper.getBasicAttrWithLevel(heroUnitData:getConfig(), 1)
	local attr2 = {}
	if index == 2 then
		local heroBaseId = heroUnitData:getBase_id()
		local rank = 10 --写死10级
		local attrMin
		if lv2>0 then
			attrMin = HeroDataHelper.getBreakAttrWithBaseIdAndRank(heroBaseId, rank, lv1, 0)
		else
			attrMin = HeroDataHelper.getBreakAttrWithBaseIdAndRank(heroBaseId, rank, 0, lv2)
		end
		local attrMax = HeroDataHelper.getBreakAttrWithBaseIdAndRank(heroBaseId, rank, lv1, lv2)
		for attrType, valueMax in pairs(attrMax) do
			local valueMin = attrMin[attrType]
			local value = valueMax - valueMin
			AttrDataHelper.formatAttr(attr2, attrType, value)
		end
	end
	
	local attr3 = HeroDataHelper.getLimitAttr(heroUnitData, lv1, lv2)
	local attrInfo = {}
	AttrDataHelper.appendAttr(attrInfo, attr1)
	AttrDataHelper.appendAttr(attrInfo, attr2)
	AttrDataHelper.appendAttr(attrInfo, attr3)
	self["_nodeAttr"..index.."_1"]:updateView(AttributeConst.ATK, attrInfo[AttributeConst.ATK], nil, 4)
	self["_nodeAttr"..index.."_2"]:updateView(AttributeConst.HP, attrInfo[AttributeConst.HP], nil, 4)
	self["_nodeAttr"..index.."_3"]:updateView(AttributeConst.PD, attrInfo[AttributeConst.PD], nil, 4)
	self["_nodeAttr"..index.."_4"]:updateView(AttributeConst.MD, attrInfo[AttributeConst.MD], nil, 4)
end

return HeroLimitDetailAttrNode
