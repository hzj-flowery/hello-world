--
-- Author: Liangxu
-- Date: 2017-9-16 14:13:03
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local InstrumentDetailTalentNode = class("InstrumentDetailTalentNode", ListViewCellBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local CSHelper = require("yoka.utils.CSHelper")

function InstrumentDetailTalentNode:ctor(instrumentData)
	self._instrumentData = instrumentData
	local resource = {
		file = Path.getCSB("InstrumentDetailDynamicModule", "instrument"),
		binding = {

		},
	}
	InstrumentDetailTalentNode.super.ctor(self, resource)
end

function InstrumentDetailTalentNode:onCreate()
	local title = self:_createTitle()
	self._listView:pushBackCustomItem(title)

	self:_buildDes()

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)
end

function InstrumentDetailTalentNode:_createTitle()
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("instrument_detail_title_talent"))
	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 50)
	widget:setContentSize(titleSize)
	title:setPosition(titleSize.width / 2, 30)
	widget:addChild(title)

	return widget
end

function InstrumentDetailTalentNode:_buildDes()
	local templet = self._instrumentData:getAdvacneTemplateId()
	local talentInfo = UserDataHelper.getInstrumentTalentInfo(templet)
	for i, one in ipairs(talentInfo) do
		local des = self:_createDes(one)
		self._listView:pushBackCustomItem(des)
	end
end

function InstrumentDetailTalentNode:_createDes(info)
	local level = self._instrumentData:getLevel()
	local unlockLevel = info.level
	local isActive = level >= unlockLevel
	local color = isActive and Colors.SYSTEM_TARGET_RED or Colors.BRIGHT_BG_TWO
	local name = info.name
	local des = info.des
	local unlockDes = ""
	if not isActive then
		unlockDes = Lang.get("instrument_detail_talent_unlock_des", {level = unlockLevel})
	end

	local widget = ccui.Widget:create()
	local txt = Lang.get("instrument_detail_talent_des", {
		name = name, 
		des = des, 
		unlock = unlockDes
	})
	local label = cc.Label:createWithTTF(txt, Path.getCommonFont(), 20)
	label:setAnchorPoint(cc.p(0, 1))
	label:setLineHeight(26)
	label:setWidth(354)
	label:setColor(color)
	local height = label:getContentSize().height
	label:setPosition(cc.p(24, height + 10))
	widget:addChild(label)

	local size = cc.size(402, height + 10)
	widget:setContentSize(size)

	return widget
end

return InstrumentDetailTalentNode