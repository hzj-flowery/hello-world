--
-- Author: Liangxu
-- Date: 2017-02-28 15:09:42
-- 武将详情
local ViewBase = require("app.ui.ViewBase")
local HeroDetailView = class("HeroDetailView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local HeroDetailBaseView = require("app.scene.view.heroDetail.HeroDetailBaseView")
local HeroConst = require("app.const.HeroConst")
local CSHelper = require("yoka.utils.CSHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

function HeroDetailView:ctor(heroId, rangeType)
	G_UserData:getHero():setCurHeroId(heroId)
	self._rangeType = rangeType
	self._allHeroIds = {}

	local resource = {
		file = Path.getCSB("HeroDetailView", "hero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonLeft = {
				events = {{event = "touch", method = "_onButtonLeftClicked"}}
			},
			_buttonRight = {
				events = {{event = "touch", method = "_onButtonRightClicked"}}
			},
			_buttonVoice = {
				events = {{event = "touch", method = "_onButtonVoiceClicked"}}
			}
		}
	}
	HeroDetailView.super.ctor(self, resource)
end

function HeroDetailView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_wujiang")

	self._pageView:setScrollDuration(0.3)
	self._pageView:addEventListener(handler(self, self._onPageViewEvent))
	self._pageView:addTouchEventListener(handler(self, self._onPageTouch))
	self._pageViewSize = self._pageView:getContentSize()
end

function HeroDetailView:onEnter()
	self:_updateHeroIds()
	self:_initPageView()
	self:_updateArrowBtn()
	self:_updateInfo()
	self:_setCurPos()

	--抛出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function HeroDetailView:_updateHeroIds()
	if self._rangeType == HeroConst.HERO_RANGE_TYPE_1 then
		self._allHeroIds = G_UserData:getHero():getRangeDataBySort()
	elseif self._rangeType == HeroConst.HERO_RANGE_TYPE_2 then
		self._allHeroIds = G_UserData:getTeam():getHeroIdsInBattle()
	end

	self._selectedPos = 1

	local heroId = G_UserData:getHero():getCurHeroId()
	for i, id in ipairs(self._allHeroIds) do
		if id == heroId then
			self._selectedPos = i
		end
	end
	self._heroCount = #self._allHeroIds
end

function HeroDetailView:onExit()
end

function HeroDetailView:_setCurPos()
	if self._rangeType == HeroConst.HERO_RANGE_TYPE_2 then
		G_UserData:getTeam():setCurPos(self._selectedPos)
	end
end

--只创建widget，减少开始的加载量
function HeroDetailView:_createPageItem()
	local widget = ccui.Widget:create()
	widget:setContentSize(self._pageViewSize.width, self._pageViewSize.height)

	return widget
end

function HeroDetailView:_updatePageItem()
	local index = self._selectedPos
	for i = index - 1, index + 1 do
		local widget = self._pageItems[i]
		if widget then --如果当前位置左右没有加Avatar，加上
			local count = widget:getChildrenCount()
			if count == 0 then
				local heroId = self._allHeroIds[i]
				local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
				local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(unitData)
				local limitLevel = avatarLimitLevel or unitData:getLimit_level()
				local limitRedLevel = arLimitLevel or unitData:getLimit_rtg()
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
				avatar:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
				avatar:setScale(1.4)
				avatar:setPosition(cc.p(self._pageViewSize.width*0.57, 190))
				widget:addChild(avatar)
			end
		end
	end
end

function HeroDetailView:_initPageView()
	self._pageItems = {}
	self._pageView:removeAllPages()
	for i = 1, self._heroCount do
		local item = self:_createPageItem()
		self._pageView:addPage(item)
		table.insert(self._pageItems, item)
	end
	self:_updatePageItem()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
end

function HeroDetailView:_updateInfo()
	self._nodeHeroDetailView:removeAllChildren()
	local curHeroId = G_UserData:getHero():getCurHeroId()
	local heroDetail = HeroDetailBaseView.new(curHeroId, nil, self._rangeType, self)
	self._nodeHeroDetailView:addChild(heroDetail)
	self:_playCurHeroVoice()
end

function HeroDetailView:_playCurHeroVoice(must)
	local curHeroId = G_UserData:getHero():getCurHeroId()
	local curHeroData = G_UserData:getHero():getUnitDataWithId(curHeroId)
	local baseId = curHeroData:getBase_id()
	G_HeroVoiceManager:playVoiceWithHeroId(baseId, must)
end

function HeroDetailView:_updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._heroCount)
end

function HeroDetailView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end

	self._selectedPos = self._selectedPos - 1
	self:_setCurPos()
	local curHeroId = self._allHeroIds[self._selectedPos]
	G_UserData:getHero():setCurHeroId(curHeroId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
	self:_updatePageItem()
end

function HeroDetailView:_onButtonRightClicked()
	if self._selectedPos >= self._heroCount then
		return
	end

	self._selectedPos = self._selectedPos + 1
	self:_setCurPos()
	local curHeroId = self._allHeroIds[self._selectedPos]
	G_UserData:getHero():setCurHeroId(curHeroId)
	self:_updateArrowBtn()
	self._pageView:setCurrentPageIndex(self._selectedPos - 1)
	self:_updateInfo()
	self:_updatePageItem()
end

function HeroDetailView:_onPageTouch(sender, state)
	if state == ccui.TouchEventType.began then
		return true
	elseif state == ccui.TouchEventType.moved then
	elseif state == ccui.TouchEventType.ended or state == ccui.TouchEventType.canceled then
	end
end

function HeroDetailView:_onPageViewEvent(sender, event)
	if event == ccui.PageViewEventType.turning and sender == self._pageView then
		local targetPos = self._pageView:getCurrentPageIndex() + 1
		if targetPos ~= self._selectedPos then
			self._selectedPos = targetPos
			self:_setCurPos()
			local curHeroId = self._allHeroIds[self._selectedPos]
			G_UserData:getHero():setCurHeroId(curHeroId)
			self:_updateArrowBtn()
			self:_updateInfo()
			self:_updatePageItem()
		end
	end
end

function HeroDetailView:_onButtonVoiceClicked()
	self:_playCurHeroVoice(true)
end

return HeroDetailView
