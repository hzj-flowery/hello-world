--
-- Author: Liangxu
-- Date: 2017-9-16 14:52:22
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local InstrumentDetailBriefNode = class("InstrumentDetailBriefNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")

function InstrumentDetailBriefNode:ctor(data)
	self._data = data
	local resource = {
		file = Path.getCSB("InstrumentDetailDynamicModule", "instrument"),
		binding = {

		}
	}
	InstrumentDetailBriefNode.super.ctor(self, resource)
end

function InstrumentDetailBriefNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	local des = self:_createDes()
	self._listView:pushBackCustomItem(des)

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function InstrumentDetailBriefNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("instrument_detail_title_brief"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function InstrumentDetailBriefNode:_createDes()
	local briefDes = self._data:getConfig().instrument_description
	local color = Colors.BRIGHT_BG_TWO

	local widget = ccui.Widget:create()
	local labelDes = cc.Label:createWithTTF(briefDes, Path.getCommonFont(), 20)
	labelDes:setAnchorPoint(cc.p(0, 1))
	labelDes:setLineHeight(26)
	labelDes:setWidth(354)
	labelDes:setColor(color)

	local height = labelDes:getContentSize().height
	labelDes:setPosition(cc.p(24, height + 15))
	widget:addChild(labelDes)

	local size = cc.size(402, height + 20)
	widget:setContentSize(size)

	return widget
end

return InstrumentDetailBriefNode