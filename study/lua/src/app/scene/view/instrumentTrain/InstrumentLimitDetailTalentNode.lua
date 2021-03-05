
local ListViewCellBase = require("app.ui.ListViewCellBase")
local InstrumentLimitDetailTalentNode = class("InstrumentLimitDetailTalentNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local InstrumentDataHelper = require("app.utils.data.InstrumentDataHelper")

function InstrumentLimitDetailTalentNode:ctor(instrumentUnitData, templateId1, templateId2)
	self._instrumentUnitData = instrumentUnitData
	self._templateId1 = templateId1
	self._templateId2 = templateId2

	InstrumentLimitDetailTalentNode.super.ctor(self)
end

function InstrumentLimitDetailTalentNode:onCreate()
	self._listView = self:_createListView()
	self:addChild(self._listView)

	self._listView1 = self:_createListView()
	self._listView2 = self:_createListView()
	for i = 1, 2 do
		self:_updateSubView(i)
	end

	local widget = ccui.Widget:create()

	local bg1 = self:_createBg()
	local bg2 = self:_createBg()
	widget:addChild(bg1)
	widget:addChild(bg2)

	widget:addChild(self._listView1)
	widget:addChild(self._listView2)
	local height1 = self._listView1:getContentSize().height
	local height2 = self._listView2:getContentSize().height
	local height = math.max(height1, height2)

	local posYListView1 = height1 == height and 0 or height-height1
	local posYListView2 = height2 == height and 0 or height-height2
	local posList1X = 7
	local posList2X = 456+73
	self._listView1:setPosition(cc.p(posList1X, posYListView1))
	self._listView2:setPosition(cc.p(posList2X, posYListView2))
	local size = cc.size(940, height)
	widget:setContentSize(size)

	self._listView:pushBackCustomItem(widget)

	self._listView:doLayout()
	local contentSize = self._listView:getInnerContainerSize()
	contentSize.width = 940
	contentSize.height = contentSize.height + 10
	
	self._listView:setContentSize(contentSize)
	self:setContentSize(contentSize)

	local bgWidth = self._listView1:getContentSize().width
	self:_setBgSize(bg1, cc.size(bgWidth, height1))
	self:_setBgSize(bg2, cc.size(bgWidth, height2))
	bg1:setPosition(cc.p(posList1X, posYListView1))
	bg2:setPosition(cc.p(posList2X, posYListView2))
end

function InstrumentLimitDetailTalentNode:_createListView()
	local listView = ccui.ListView:create()
	listView:setScrollBarEnabled(false)
	listView:setSwallowTouches(false)
	listView:setAnchorPoint(cc.p(0, 0))
	listView:setPosition(cc.p(0, 0))
	return listView
end

function InstrumentLimitDetailTalentNode:_updateSubView(index)
	local title = self:_createTitle(index)
	self["_listView"..index]:pushBackCustomItem(title)

	local templet = self["_templateId"..index]
	local talentInfo = InstrumentDataHelper.getInstrumentTalentInfo(templet)
	for i, one in ipairs(talentInfo) do
		local des = self:_createDes(one)
		self["_listView"..index]:pushBackCustomItem(des)
	end

	self["_listView"..index]:doLayout()
	local contentSize = self["_listView"..index]:getInnerContainerSize()
	contentSize.width = 402
	contentSize.height = contentSize.height + 10
	self["_listView"..index]:setContentSize(contentSize)
end

function InstrumentLimitDetailTalentNode:_createTitle(index)
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("instrument_limit_detail_talent_title"))

	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 34)
	local widgetSize = cc.size(402, 34 + 10)
	widget:setContentSize(widgetSize)
	title:setPosition(201, titleSize.height / 2 + 10)
	widget:addChild(title)

	return widget
end

function InstrumentLimitDetailTalentNode:_createDes(info)
	-- local level = self._instrumentUnitData:getLevel()
	-- local unlockLevel = info.level
	-- local isActive = level >= unlockLevel
	-- local color = isActive and Colors.SYSTEM_TARGET_RED or Colors.BRIGHT_BG_TWO
	local name = info.name
	local des = info.des
	local unlockDes = ""
	-- if not isActive then
	-- 	unlockDes = Lang.get("instrument_detail_talent_unlock_des", {level = unlockLevel})
	-- end

	local widget = ccui.Widget:create()
	local content = Lang.get("instrument_limit_talent_des", {
		name = name,
		des = des,
		unlock = unlockDes
	})
	local widget = ccui.Widget:create()

	local label = ccui.RichText:createWithContent(content)
	label:setAnchorPoint(cc.p(0, 1))
	label:ignoreContentAdaptWithSize(false)
	label:setContentSize(cc.size(360,0))
	label:formatText()

	local height = label:getContentSize().height
	label:setPosition(cc.p(24, height + 10))
	widget:addChild(label)
 
	local size = cc.size(402, height + 10)
	widget:setContentSize(size)

	return widget
end

function InstrumentLimitDetailTalentNode:_createBg()
	local node = CSHelper.loadResourceNode(Path.getCSB("TreasureTrainLimitBg", "treasure"))
	return node
end

function InstrumentLimitDetailTalentNode:_setBgSize(node, size)
	local bg = ccui.Helper:seekNodeByName(node, "Image_1")
	bg:setContentSize(size)
end

return InstrumentLimitDetailTalentNode