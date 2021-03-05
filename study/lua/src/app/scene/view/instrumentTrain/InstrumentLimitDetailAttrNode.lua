
local ListViewCellBase = require("app.ui.ListViewCellBase")
local InstrumentLimitDetailAttrNode = class("InstrumentLimitDetailAttrNode", ListViewCellBase)
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")
local AttributeConst = require("app.const.AttributeConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local TextHelper = require("app.utils.TextHelper")

function InstrumentLimitDetailAttrNode:ctor(level, templateId1, templateId2)
	self._level = level
	self._templateId1 = templateId1
	self._templateId2 = templateId2

	local resource = {
		file = Path.getCSB("HeroLimitDetailAttrNode", "hero"),
		binding = {
			
		},
	}

	InstrumentLimitDetailAttrNode.super.ctor(self, resource)
end

function InstrumentLimitDetailAttrNode:onCreate()
	local contentSize = self._panelBg:getContentSize()
	self:setContentSize(contentSize)
	for i = 1, 2 do
		self:_update(self._level, i)
	end
end

function InstrumentLimitDetailAttrNode:_update(level, index)
	self["_nodeTitle"..index]:setFontSize(24)
	self["_nodeTitle"..index]:setTitle(Lang.get("instrument_detail_title_attr"))

	local templateId = self["_templateId"..index]
	local attrInfo = InstrumentDataHelper.getInstrumentLevelAttr(level, templateId)
	local infos = TextHelper.getAttrInfoBySort(attrInfo)
	for i = 1, 4 do
		local info = infos[i]
		if info then
			self["_nodeAttr"..index.."_"..i]:setVisible(true)
			self["_nodeAttr"..index.."_"..i]:updateView(info.id, info.value, nil, 4)
		else
			self["_nodeAttr"..index.."_"..i]:setVisible(false)
		end
	end
end

return InstrumentLimitDetailAttrNode
