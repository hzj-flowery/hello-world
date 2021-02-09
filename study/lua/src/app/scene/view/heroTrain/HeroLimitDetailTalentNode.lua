local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroLimitDetailTalentNode = class("HeroLimitDetailTalentNode", ListViewCellBase)
local CSHelper = require("yoka.utils.CSHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local HeroConst = require("app.const.HeroConst")

function HeroLimitDetailTalentNode:ctor(heroUnitData)
	self._heroUnitData = heroUnitData

	HeroLimitDetailTalentNode.super.ctor(self)
end

function HeroLimitDetailTalentNode:onCreate()
	self._listView = self:_createListView()
	self:addChild(self._listView)

	self._listView1 = self:_createListView()
	self._listView2 = self:_createListView()
	local rankFilterMap = self:_getSameTalentRank()
	for i = 1, 2 do
		self:_updateSubView(i, rankFilterMap)
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

function HeroLimitDetailTalentNode:_createListView()
	local listView = ccui.ListView:create()
	listView:setScrollBarEnabled(false)
	listView:setSwallowTouches(false)
	listView:setAnchorPoint(cc.p(0, 0))
	listView:setPosition(cc.p(0, 0))
	return listView
end

-- 获取相同天赋的rank列表
function HeroLimitDetailTalentNode:_getSameTalentRank()
	local rankFilterMap = {}
	local desList = {}
	local rankMax = self._heroUnitData:getConfig().rank_max
	local limitDataType = HeroDataHelper.getLimitDataType(self._heroUnitData)
	-- 只有红升金需要过滤
	if limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		return rankFilterMap
	end
	local baseId = self._heroUnitData:getBase_id()
	for index = 1, 2 do
		desList[index] = {}

		local lv1, lv2
		if limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
			if index==1 then
				lv1 = 0
			else
				lv1 = HeroConst.HERO_LIMIT_RED_MAX_LEVEL
			end
			lv2 = 0
		else
			lv1 = self._heroUnitData:getLimit_level()
			if index==1 then
				lv2 = 0
			else
				lv2 = HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL
			end
		end


		for rank = 1, rankMax do
			local limitLevel = lv1
			local limitRedLevel = lv2
		
			local config = HeroDataHelper.getHeroRankConfig(baseId, rank, limitLevel, limitRedLevel)
			if config then
				local des = config.talent_description
				desList[index][rank] = des
			end
		end
	end
	for rank = 1, rankMax do
		if desList[1][rank] == desList[2][rank] then
			rankFilterMap[rank] = true
		end
	end
	return rankFilterMap
end

function HeroLimitDetailTalentNode:_updateSubView(index, rankFilterMap)
	local title = self:_createTitle(index)
	self["_listView"..index]:pushBackCustomItem(title)
	local limitDataType = HeroDataHelper.getLimitDataType(self._heroUnitData)

	local rankMax = self._heroUnitData:getConfig().rank_max
	local lv1, lv2
	if limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		if index==1 then
			lv1 = 0
		else
			lv1 = HeroConst.HERO_LIMIT_RED_MAX_LEVEL
		end
		lv2 = 0
	else
		lv1 = self._heroUnitData:getLimit_level()
		if index==1 then
			lv2 = 0
		else
			lv2 = HeroConst.HERO_LIMIT_GOLD_MAX_LEVEL
		end
	end


	for i = 1, rankMax do
		if not rankFilterMap[i] then
			local des = self:_createDes(i, lv1, lv2)
			if des then
				self["_listView"..index]:pushBackCustomItem(des)
			end
		end
	end
	self["_listView"..index]:doLayout()
	local contentSize = self["_listView"..index]:getInnerContainerSize()
	contentSize.width = 402
	contentSize.height = contentSize.height + 10
	self["_listView"..index]:setContentSize(contentSize)
end

function HeroLimitDetailTalentNode:_createTitle(index)
	local title = CSHelper.loadResourceNode(Path.getCSB("CommonDetailTitleWithBg", "common"))
	title:setFontSize(24)
	title:setTitle(Lang.get("hero_limit_detail_talent_title"))

	local widget = ccui.Widget:create()
	local titleSize = cc.size(402, 34)
	local widgetSize = cc.size(402, 34 + 10)
	widget:setContentSize(widgetSize)
	title:setPosition(201, titleSize.height / 2 + 10)
	widget:addChild(title)

	return widget
end

function HeroLimitDetailTalentNode:_isActiveWithRank(rank)
	local limitDataType = HeroDataHelper.getLimitDataType(self._heroUnitData)
	local needLimitLevel = HeroDataHelper.getNeedLimitLevelWithRank(rank, limitDataType)
	if needLimitLevel == nil then
		return false, needLimitLevel
	end
	local lv
	if limitDataType==HeroConst.HERO_LIMIT_TYPE_RED then
		lv = self._heroUnitData:getLimit_level()
	else
		lv = self._heroUnitData:getLimit_rtg()
	end
	if lv >= needLimitLevel then
		return true, needLimitLevel
	else
		return false, needLimitLevel
	end
end

function HeroLimitDetailTalentNode:_createDes(rank, limitLevel, limitRedLevel)
	local widget = ccui.Widget:create()

	local limitDataType = HeroDataHelper.getLimitDataType(self._heroUnitData)

	local isActive = true
	local needLimitLevel = HeroDataHelper.getNeedLimitLevelWithRank(rank, limitDataType)
	local isTop = (limitDataType==0 and limitLevel==3) or limitRedLevel==4
	if isTop then
		isActive, needLimitLevel = self:_isActiveWithRank(rank)
	end


	local color = Colors.colorToNumber(Colors.BRIGHT_BG_TWO) --Colors.colorToNumber(Colors.BRIGHT_BG_GREEN)

	local baseId = self._heroUnitData:getBase_id()
	local config = HeroDataHelper.getHeroRankConfig(baseId, rank, limitLevel, limitRedLevel)
	if config == nil then
		return nil
	end

	local name = "["..config.talent_name..rank.."] "
	local des = config.talent_description

	local breakDes = ""
	if not isActive and needLimitLevel and isTop then
		breakDes = Lang.get("hero_limit_txt_break_des", {limit = needLimitLevel})
	end
	local isFeature = config.talent_target == 0 --天赋属性目标为0，标记此行描述为“特性”
	local content = ""
	if isFeature then
		content = Lang.get("hero_limit_talent_des_2", {
			urlIcon = Path.getTextSignet("txt_tianfu_texing"),
			name = name,
			des = des,
			breakDes = breakDes,
			color1 = color,
			color2 = Colors.colorToNumber(Colors.SYSTEM_TARGET_RED),
		})
	else
		content = Lang.get("hero_limit_talent_des_1", {
			name = name,
			des = des,
			breakDes = breakDes,
			color1 = color,
			color2 = Colors.colorToNumber(Colors.SYSTEM_TARGET_RED),
		})
	end

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

function HeroLimitDetailTalentNode:_createBg()
	local node = CSHelper.loadResourceNode(Path.getCSB("TreasureTrainLimitBg", "treasure"))
	return node
end

function HeroLimitDetailTalentNode:_setBgSize(node, size)
	local bg = ccui.Helper:seekNodeByName(node, "Image_1")
	bg:setContentSize(size)
end

return HeroLimitDetailTalentNode