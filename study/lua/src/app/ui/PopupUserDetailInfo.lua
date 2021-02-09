--
-- Author: Liangxu
-- Date: 2017-9-12 14:54:28
-- 查看阵容详情弹框
local PopupBase = require("app.ui.PopupBase")
local PopupUserDetailInfo = class("PopupUserDetailInfo", PopupBase)
local UserDetailData = require("app.data.UserDetailData")
local TeamHeroIcon = require("app.scene.view.team.TeamHeroIcon")
local TeamHeroBustIcon = require("app.scene.view.team.TeamHeroBustIcon")
local TeamPartnerButton = require("app.scene.view.team.TeamPartnerButton")
local UserDetailHeroNode = require("app.scene.view.team.UserDetailHeroNode")
local UserYokeNode = require("app.scene.view.team.UserYokeNode")
local TeamConst = require("app.const.TeamConst")
local TeamHeroPageItem = require("app.scene.view.team.TeamHeroPageItem")
local UserDetailViewHelper = require("app.scene.view.team.UserDetailViewHelper")
local UserDetailPetNode = require("app.scene.view.team.UserDetailPetNode")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CSHelper = require("yoka.utils.CSHelper")

local LIST_LINE_WIDTH = 90.00
local LIST_LINE_HEIGHT_NORMAL = 508
local LIST_LINE_HEIGHT_JADE = 416

local SWItCH_HERO_NODE = 1
local SWItCH_PET_NODE = 2
local SWItCH_YOKE_NODE = 3
local SWItCH_JADE_NODE = 4

local LIST_NORMAL = 1
local LIST_JADE = 2

function PopupUserDetailInfo:ctor(message, power)
	self._message = message
	self._power = power

	local resource = {
		file = Path.getCSB("PopupUserDetailInfo", "common"),
		binding = {}
	}

	PopupUserDetailInfo.super.ctor(self, resource)
end

function PopupUserDetailInfo:onCreate()
	self:_initData()
	self:_initView()
end

function PopupUserDetailInfo:onEnter()
	self:_updateLeftIcons()
	self:_updateHeroIconsSelectedState()
	self:_updateHeroPageView()
	self:switchPanelView(1)
end

function PopupUserDetailInfo:onExit()
end

function PopupUserDetailInfo:_initData()
	self._pos = 1 --初始化1
	self._subLayers = {}
	self._curSelectedPanelIndex = 0 --0初始状态，1显示武将信息，2显示援军信息
	self._detailData = UserDetailData.new()
	self._detailData:updateData(self._message)
	self._heroCount = self._detailData:getHeroCount()
	self._isPageViewMoving = false --pageview是否在拖动过程中
end

function PopupUserDetailInfo:_initView()
	self._nodeBg:setTitle(self._detailData:getName())
	self._nodeBg:addCloseEventListener(handler(self, self._onButtonClose))
	self._nodeBg:setTitleSysFont()
	self._nodeBg:setTitleFontSize(28)

	local function createIcon(icon,isHeroBust)
		local iconBg = ccui.Widget:create()
		local iconBgSize = cc.size(90, 90)
		if isHeroBust then
			iconBgSize = cc.size(100,105)
		end
		iconBg:setContentSize(iconBgSize)
		icon:setScale(0.84)
		icon:setPosition(cc.p(iconBgSize.width / 2, iconBgSize.height / 2))
		iconBg:addChild(icon)
		return iconBg, icon
	end

	--武将头像滑动条
	self._listViewLineup:setScrollBarEnabled(false)
	self._leftIcons = {}
	self._heroIcons = {}
	for i = 1, 6 do
		if i <= 6 then
			local icon = TeamHeroBustIcon.new(i, handler(self, self._onLeftIconClicked))
			-- local icon = TeamHeroIcon.new(i, handler(self, self._onLeftIconClicked))
			local iconBg = createIcon(icon,true)
			self._listViewLineup:pushBackCustomItem(iconBg)
			table.insert(self._leftIcons, icon)
			table.insert(self._heroIcons, icon)
		elseif self._detailData:funcIsShow(FunctionConst.FUNC_PET_HOME) then
			local icon = TeamHeroIcon.new(i, handler(self, self._onLeftIconClicked))
			local iconBg = createIcon(icon)
			self._listViewLineup:pushBackCustomItem(iconBg)
			table.insert(self._leftIcons, icon)
		end
	end

	self._petButton = CSHelper.loadResourceNode(Path.getCSB("CommonMainMenu", "common"))
	self._petButton:updateUI(FunctionConst.FUNC_PET_HOME)
	self._petButton:setScale(0.8)
	self._petButton:addClickEventListenerEx(handler(self, self._onClickButtonPet))
	local iconBgPet = createIcon(self._petButton)
	self._listViewLineup:pushBackCustomItem(iconBgPet)

	self._partnerButton = TeamPartnerButton.new(handler(self, self._onButtonJiBanClicked))
	local iconBgPartner = createIcon(self._partnerButton)
	self._listViewLineup:pushBackCustomItem(iconBgPartner)

	--滑动切换武将
	self._pageItems = {}
	self._pageView:setSwallowTouches(false)
	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self, self._onPageViewEvent))
	self._pageView:addTouchEventListener(handler(self, self._onTouchCallBack))

	local showDatas = UserDetailViewHelper.getHeroAndPetShowData(self._detailData)
	local viewSize = self._pageView:getContentSize()
	for i, data in ipairs(showDatas) do
		if self._pageItems[i] == nil then
			local item = TeamHeroPageItem.new(viewSize.width, viewSize.height)
			self._pageItems[i] = item
			self._pageView:insertPage(item, i - 1)
		end
	end

	--总战力
	if self._power then
		self._nodePower:setVisible(true)
		self._nodePower:center()
		self._nodePower:updateUI(self._power)
		self._nodeBg:setPositionY(-20)
		self._nodeBg:offsetCloseButton(0, -20)
	else
		self._nodePower:setVisible(false)
		self._nodeBg:setPositionY(0)
	end
end

function PopupUserDetailInfo:_onButtonClose()
	self:close()
end

function PopupUserDetailInfo:_updateLeftIcons()
	local iconData = UserDetailViewHelper.getHeroAndPetIconData(self._detailData)
	for i, data in ipairs(iconData) do
		local icon = self._leftIcons[i]
		if icon then
			icon:onlyShow(data.type, data.value, data.limitLevel, data.limitRedLevel)
		end
	end
end

function PopupUserDetailInfo:_updateHeroIconsSelectedState()
	local curPos = self._pos
	for i, icon in ipairs(self._leftIcons) do
		if i == curPos then
			icon:setSelected(true)
		else
			icon:setSelected(false)
		end
	end
	-- if curPos >= 1 and curPos <= 4 then
	-- 	self._listViewLineup:jumpToTop()
	-- elseif curPos >= 5 and curPos <= 7 then
	-- 	self._listViewLineup:jumpToBottom()
	-- end
end

function PopupUserDetailInfo:_gotoHeroPageItem()
	local curPos = self._pos
	local pageIndex = UserDetailViewHelper.getPageIndexWithIconPos(curPos, self._detailData)
	self._pageView:setCurrentPageIndex(pageIndex - 1)
end

function PopupUserDetailInfo:_updateHeroPageView()
	local showDatas = UserDetailViewHelper.getHeroAndPetShowData(self._detailData)
	local curPos = self._pos
	local curIndex = UserDetailViewHelper.getPageIndexWithIconPos(curPos, self._detailData)
	local minPos = curIndex - 1
	local maxPos = curIndex + 1
	if minPos < 1 then
		minPos = 1
	end
	if maxPos > #showDatas then
		maxPos = #showDatas
	end
	local viewSize = self._pageView:getContentSize()
	for i = minPos, maxPos do
		if self._pageItems[i] == nil then
			local item = TeamHeroPageItem.new(viewSize.width, viewSize.height)
			self._pageItems[i] = item
			self._pageView:insertPage(item, i - 1)
		end
		local info = showDatas[i]
		self._pageItems[i]:updateUI(info.type, info.value, nil, info.limitLevel, info.limitRedLevel)
		if info.type == TypeConvertHelper.TYPE_HERO then
			self._pageItems[i]:setAvatarScale(1.04)
		else
			self._pageItems[i]:setAvatarScale(0.9)
		end
	end
	self:_gotoHeroPageItem()
	self:_updatePageItemVisible()
end

function PopupUserDetailInfo:switchPanelView(index)
	self._curSelectedPanelIndex = index
	local layer = self._subLayers[self._curSelectedPanelIndex]
	if layer == nil then
		local zorder = 0
		if self._curSelectedPanelIndex == SWItCH_HERO_NODE then
			layer = UserDetailHeroNode.new(self, self._detailData)
			zorder = 2 -- 排除按钮遮挡
		elseif self._curSelectedPanelIndex == SWItCH_PET_NODE then
			layer = UserDetailPetNode.new(self)
		elseif self._curSelectedPanelIndex == SWItCH_YOKE_NODE then
			layer = UserYokeNode.new(self)
		end
		if layer then
			self._nodeContent:addChild(layer, zorder)
			self._subLayers[self._curSelectedPanelIndex] = layer
		end
	end
	for k, subLayer in pairs(self._subLayers) do
		subLayer:setVisible(false)
	end
	layer:setVisible(true)
	self._pageView:setVisible(self._curSelectedPanelIndex == 1)
	self._imageAwakeBg:setVisible(self._curSelectedPanelIndex == 1)
	self:_updateView()
end

function PopupUserDetailInfo:_updateView()
	local layer = self._subLayers[self._curSelectedPanelIndex]
	if layer then
		self._imageBackground:loadTexture(Path.getStageBG("img_chakanjiban_bg"))
		if self._curSelectedPanelIndex == SWItCH_HERO_NODE then
			layer:updateInfo(self._pos)
		elseif self._curSelectedPanelIndex == SWItCH_PET_NODE then
			layer:updateInfo(self._detailData)
		elseif self._curSelectedPanelIndex == SWItCH_YOKE_NODE then
			self._imageBackground:loadTexture(Path.getBackground("img_chakanjiban_bg"))
			layer:updateView(self._detailData)
			layer:updatePanel()
		end
	end
end

function PopupUserDetailInfo:_onPageViewEvent(sender, event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetIndex = self._pageView:getCurrentPageIndex() + 1
		local targetPos = UserDetailViewHelper.getIconPosWithPageIndex(targetIndex, self._detailData)
		local curPos = self._pos
		if targetPos ~= curPos then
			self._pos = targetPos
			self:_updateHeroIconsSelectedState()
			self:_updateHeroPageView()
			if targetPos == TeamConst.PET_POS then
				self:switchPanelView(SWItCH_PET_NODE)
			else
				self:switchPanelView(SWItCH_HERO_NODE)
			end
		end
	end
end

function PopupUserDetailInfo:_onTouchCallBack(sender, state)
	if state == ccui.TouchEventType.began then
		self._isPageViewMoving = true
		self:_updatePageItemVisible()
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
		self._isPageViewMoving = false
	end
end

function PopupUserDetailInfo:_updatePageItemVisible()
	local curPos = self._pos
	local curIndex = UserDetailViewHelper.getPageIndexWithIconPos(curPos, self._detailData)
	for i, item in ipairs(self._pageItems) do
		local show = i == curIndex or self._isPageViewMoving
		item:setVisible(show)
	end
end

--点击Icon
function PopupUserDetailInfo:_onLeftIconClicked(pos)
	local iconData = UserDetailViewHelper.getHeroAndPetIconData(self._detailData)
	local info = iconData[pos]
	if info.type == TypeConvertHelper.TYPE_HERO then
		local state = self._detailData:getPosState(pos)
		if state == TeamConst.STATE_HERO then
			if pos == self._pos then
				return
			end
			self._pos = pos
			self:_updateHeroIconsSelectedState()
			self:_updateHeroPageView()
			self:switchPanelView(SWItCH_HERO_NODE)
		end
	elseif info.type == TypeConvertHelper.TYPE_PET then
		if info.value > 0 then
			self._pos = pos
			self:_updateHeroIconsSelectedState()
			self:_updateHeroPageView()
			self:switchPanelView(SWItCH_PET_NODE)
		end
	end
end

function PopupUserDetailInfo:switchToHeroNode()
	self:switchListLineUp(LIST_NORMAL)
	self:switchPanelView(SWItCH_HERO_NODE)
end

--点击羁绊
function PopupUserDetailInfo:_onButtonJiBanClicked()
	if self._curSelectedPanelIndex == SWItCH_YOKE_NODE then
		return
	end
	self._pos = 0
	self:switchListLineUp(LIST_NORMAL)
	self._listViewLineup:jumpToBottom()
	self:_updateHeroIconsSelectedState()
	self:switchPanelView(SWItCH_YOKE_NODE)
end

function PopupUserDetailInfo:_onClickButtonPet()
	if self._curSelectedPanelIndex == SWItCH_PET_NODE then
		return
	end
	self._pos = 0
	self:switchListLineUp(LIST_NORMAL)
	self._listViewLineup:jumpToBottom()
	self:_updateHeroIconsSelectedState()
	self:switchPanelView(SWItCH_PET_NODE)
end

function PopupUserDetailInfo:switchListLineUp(flag)
	if flag == LIST_NORMAL then
		self._listViewLineup:setContentSize(LIST_LINE_WIDTH, LIST_LINE_HEIGHT_NORMAL)
		self._listViewLineup:setPositionY(0)
	else
		self._listViewLineup:setContentSize(LIST_LINE_WIDTH, LIST_LINE_HEIGHT_JADE)
		self._listViewLineup:setPositionY(LIST_LINE_HEIGHT_NORMAL - LIST_LINE_HEIGHT_JADE)
	end
end

--刷新镜像觉醒星星
--为了防止高个武将把觉醒星星挡掉，在上层加入一个同样的觉醒控件
function PopupUserDetailInfo:updateAwake(visible, star)
	self._imageAwakeBg:setVisible(visible)
	if star then
		self._nodeHeroStar:setStarOrMoon(star)
	end
end

return PopupUserDetailInfo
