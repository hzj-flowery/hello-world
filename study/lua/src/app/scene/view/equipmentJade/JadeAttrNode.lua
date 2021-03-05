--
-- Author: liushiyin
-- 装备详情 精炼模块
local ListViewCellBase = require("app.ui.ListViewCellBase")
local JadeAttrNode = class("JadeAttrNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local TextHelper = require("app.utils.TextHelper")
local EquipConst = require("app.const.EquipConst")

function JadeAttrNode:ctor(jadeConfig, rangeType)
	self._jadeConfig = jadeConfig
	self._rangeType = rangeType or EquipConst.EQUIP_RANGE_TYPE_1

	local resource = {
		file = Path.getCSB("EquipDetailDynamicModule", "equipment"),
		binding = {}
	}
	JadeAttrNode.super.ctor(self, resource)
end

function JadeAttrNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local offset = 0
	self:_addAttrDes()
	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.height = contentSize.height + offset
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function JadeAttrNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("equipment_detail_title_jade"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function JadeAttrNode:_addAttrDes()
	local widget = ccui.Widget:create()
	local labelDes = cc.Label:createWithTTF(self._jadeConfig.description, Path.getCommonFont(), 20)
	labelDes:setAnchorPoint(cc.p(0, 1))
	labelDes:setLineHeight(26)
	labelDes:setWidth(370)
	labelDes:setColor(Colors.BRIGHT_BG_ONE)

	local height = labelDes:getContentSize().height
	labelDes:setPosition(cc.p(20, height + 15))
	widget:addChild(labelDes)
	widget:setContentSize(cc.size(402, height + 10))
	self._listView:pushBackCustomItem(widget)
end

return JadeAttrNode
