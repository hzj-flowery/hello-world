local ListViewCellBase = require("app.ui.ListViewCellBase")
local TreasureLimitDetailStrNode = class("TreasureLimitDetailStrNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local TreasureDataHelper = require("app.utils.data.TreasureDataHelper")
local TextHelper = require("app.utils.TextHelper")
local TreasureConst = require("app.const.TreasureConst")

function TreasureLimitDetailStrNode:ctor(treasureUnitData)
	self._treasureUnitData = treasureUnitData
	TreasureLimitDetailStrNode.super.ctor(self)
	self.bg1 = nil
	self.bg2 = nil
end

function TreasureLimitDetailStrNode:onCreate()
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
	self._listView1:setPosition(cc.p(0, posYListView1))
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
	self:_setBgSize(bg1, cc.size(bgWidth, height))
	self:_setBgSize(bg2, cc.size(bgWidth, height))
	bg1:setPosition(cc.p(posList1X, 0))
	bg2:setPosition(cc.p(posList2X, 0))
end

function TreasureLimitDetailStrNode:_createListView()
	local listView = ccui.ListView:create()
	listView:setScrollBarEnabled(false)
	listView:setSwallowTouches(false)
	listView:setAnchorPoint(cc.p(0, 0))
	listView:setPosition(cc.p(0, 0))
	return listView
end

function TreasureLimitDetailStrNode:_updateSubView(index)
	local title = self:_createTitle(index)
	self["_listView"..index]:pushBackCustomItem(title)

	local configInfo = self._treasureUnitData:getConfig()
	local level = self._treasureUnitData:getLevel()
	local limitCost = self._treasureUnitData:getLimit_cost()

	local showTop = limitCost>=TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL
		or (limitCost==TreasureConst.TREASURE_LIMIT_RED_LEVEL and self._treasureUnitData:isLimitShowTop())
	
	if index==1 then
		if showTop then 	-- 最高级
			local preId = G_UserData:getTreasure():getLimitOrgSrcId(self._treasureUnitData:getBase_id())
			configInfo = TreasureDataHelper.getTreasureConfig(preId)
		end
	elseif index == 2 then
		local limitUpId = self._treasureUnitData:getConfig().limit_up_id
		if showTop then
			limitUpId = self._treasureUnitData:getBase_id()
		end
		configInfo = TreasureDataHelper.getTreasureConfig(limitUpId)
	end
	local attrInfo = TreasureDataHelper.getTreasureStrAttrWithConfigAndLevel(configInfo, level)
	for type, value in pairs(attrInfo) do
		local des = self:_createAttrDes(type, value)
		self["_listView"..index]:pushBackCustomItem(des)
	end
	local des2 = self:_createAddLevel(index)
	if des2 then
		self["_listView"..index]:pushBackCustomItem(des2)
	end

	self["_listView"..index]:doLayout()
	local contentSize = self["_listView"..index]:getInnerContainerSize()
	contentSize.width = 402
	contentSize.height = contentSize.height + 10
	self["_listView"..index]:setContentSize(contentSize)
end

function TreasureLimitDetailStrNode:_createTitle(index)
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("treasure_limit_detail_str_title"))

	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 34)
	local widgetSize = cc.size(402, 34 + 10)
	widget:setContentSize(widgetSize)
	title:setPosition(201, titleSize.height / 2 + 5)
	widget:addChild(title)

	return widget
end

function TreasureLimitDetailStrNode:_createAttrDes(type, value)
	local widget = ccui.Widget:create()
	local name, value = TextHelper.getAttrBasicText(type, value)
	name = TextHelper.expandTextByLen(name, 4)
	local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
	node:setFontSize(20)
	node:updateUI(name.."：", value)
	node:setPosition(24, 20)
	widget:addChild(node)
	widget:setContentSize(cc.size(402, 30))

	return widget
end

function TreasureLimitDetailStrNode:_createAddLevel(index)
	if index == 1 and self._treasureUnitData:getLimit_cost() < TreasureConst.TREASURE_LIMIT_UP_BASE_LEVEL then
		return nil
	end

	local limitCost = self._treasureUnitData:getLimit_cost()
	local showTop = limitCost>=TreasureConst.TREASURE_LIMIT_UP_MAX_LEVEL
		or (limitCost==TreasureConst.TREASURE_LIMIT_RED_LEVEL and self._treasureUnitData:isLimitShowTop())

	local addLevel
	if index==1 then
		if showTop then
			addLevel = self._treasureUnitData:getAddStrLevelByAllLimit(-1)
		else
			addLevel = self._treasureUnitData:getAddStrLevelByAllLimit()
		end
	else
		if showTop then
			addLevel = self._treasureUnitData:getAddStrLevelByAllLimit()
		else
			addLevel = self._treasureUnitData:getAddStrLevelByAllLimit(1)
		end
	end
	if addLevel<=0 then
		return nil
	end
	
	local widget = ccui.Widget:create()
	local node = CSHelper.loadResourceNode(Path.getCSB("CommonDesValue", "common"))
	node:setFontSize(20)

	node:updateUI(Lang.get("treasure_limit_str_level_max_add"), "+".. addLevel)
	node:setPosition(24, 20)
	widget:addChild(node)
	widget:setContentSize(cc.size(402, 30))
	return widget
end

function TreasureLimitDetailStrNode:_createBg()
	local node = CSHelper.loadResourceNode(Path.getCSB("TreasureTrainLimitBg", "treasure"))
	return node
end

function TreasureLimitDetailStrNode:_setBgSize(node, size)
	local bg = ccui.Helper:seekNodeByName(node, "Image_1")
	bg:setContentSize(size)
end

return TreasureLimitDetailStrNode
