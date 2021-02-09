-- Author: Liangxu
-- Update: Conley
-- Date: 2017-02-28 15:09:42
-- 武将详情
local PopupBase = require("app.ui.PopupBase")
local PopupHeroDetail = class("PopupHeroDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")

function PopupHeroDetail:ctor(type, value, isPage, limitLevel, limitRedLevel)
	self._type = type
	self._value = value
	self._isPage = isPage
	self._limitLevel = limitLevel
	self._limitRedLevel = limitRedLevel

	local resource = {
		file = Path.getCSB("PopupHeroDetail", "hero"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
			_buttonVoice = {
				events = {{event = "touch", method = "_onButtonVoiceClicked"}}
			},
		}
	}

	PopupHeroDetail.super.ctor(self, resource)
end

function PopupHeroDetail:onCreate()
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._buttonSwitch:setCallback(handler(self, self._showDrawing))
	self._isShowDrawing = false
	self._avatarPageItems = nil
	self._storyPageItems = nil
	self._curSelectedPos = 0
end

function PopupHeroDetail:onEnter()
	self._buttonSwitch:setState(self._isShowDrawing)
	if not self._isPage then
		local dataList = {
			{cfg = {id = self._value}, limitLevel = self._limitLevel, limitRedLevel = self._limitRedLevel}
		}
		self:setPageData(dataList)
	end
end

function PopupHeroDetail:onExit()

end

function PopupHeroDetail:_updateHeroInfo(heroBaseId, limitLevel, limitRedLevel)
	self._heroBaseId = heroBaseId
	self._fileNodeCountry:updateUI(heroBaseId)
	self._fileNodeCountryFlag:updateUI(TypeConvertHelper.TYPE_HERO, heroBaseId, limitLevel, limitRedLevel)

	self._detailWindow:updateUI(nil, heroBaseId, nil, limitLevel, limitRedLevel)
	
	
	local haveHero = G_UserData:getHandBook():isHeroHave(heroBaseId, limitLevel, limitRedLevel)
	local color = haveHero and Colors.DARK_BG_THREE or Colors.BRIGHT_BG_RED
	self._hasText:setColor(color)
	self._hasText:setString(haveHero and Lang.get("common_have") or  Lang.get("common_not_have")) 

	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)
	self._commonVerticalText:setString(heroParam.cfg.feature)

	self:_updateHeroState(heroBaseId)
	self._btnWayGet:setEnabled(heroParam.cfg.type ~= 1) --主角没有获取途径

	self:_playCurHeroVoice()
end

--如果没有立绘，显示普通状态
function PopupHeroDetail:_updateHeroState(heroBaseId)
	local isHave = self:_isHaveStory(heroBaseId)
	self._buttonSwitch:setVisible(isHave)
	local show = self._isShowDrawing and isHave
	self:_updateDrawing(show)
end

function PopupHeroDetail:_onBtnWayGetClicked()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._type,self._value)
	PopupItemGuider:openWithAction()
end

function PopupHeroDetail:_showDrawing(show)
	self._isShowDrawing = show

	self:_updateDrawing(show)
end

function PopupHeroDetail:_updateDrawing(show)
	self._heroStage:setVisible(not show)
	self._scrollPage:setVisible(not show)
	self._scrollPageStory:setVisible(show)
	if show then
		self._scrollPageStory:setCurPage(self._curSelectedPos)
	else
		self._scrollPage:setCurPage(self._curSelectedPos)
	end
end

function PopupHeroDetail:setDrawing(show)
	if not self:_isHaveStory(self._value) then
		return
	end
	self:_showDrawing(show)
	self._buttonSwitch:setState(self._isShowDrawing)
end

function PopupHeroDetail:_onBtnClose()
	self:close()
end

--使用了翻页功能
function PopupHeroDetail:setPageData(dataList)
	local selectPos = 0
	for i, data in ipairs(dataList) do
		if data.cfg.id == self._value and data.limitLevel == self._limitLevel then
			selectPos = i
		end
	end
	self:_setScrollPage(dataList, selectPos)
	self:_showDrawing(self._isShowDrawing)
end

function PopupHeroDetail:_setScrollPage(dataList, selectPos)
	self._dataList = dataList
	-- self._curSelectedPos = selectPos
	self._scrollPage:setCallBack(handler(self, self._updateHeroItem))
	self._scrollPage:setUserData(dataList, selectPos)
	self._scrollPageStory:setCallBack(handler(self, self._updateHeroItem))
	self._scrollPageStory:setUserData(dataList, selectPos)
	self._scrollPageStory:setTouchEnabled(false)
end

function PopupHeroDetail:_updateHeroItem(sender, widget, index, selectPos)
	local data = self._dataList[index]
	if data == nil then
		return
	end
	
	self._avatarPageItems = self._scrollPage:getPageItems()
	self._storyPageItems = self._scrollPageStory:getPageItems()

	local heroBaseId = data.cfg.id
	local limitLevel = data.limitLevel
	local limitRedLevel = data.limitRedLevel
	if self._avatarPageItems then
		local avatarItem = self._avatarPageItems[index]
		if avatarItem then
			local avatarCount = avatarItem:getChildrenCount()
			if avatarCount == 0 then
				local CSHelper = require("yoka.utils.CSHelper")
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
				avatar:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
				avatar:setScale(1.4)
				avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2 - 150))
				avatarItem:addChild(avatar)
			end
		end
	end
	
	if self._storyPageItems then
		local storyItem = self._storyPageItems[index]
		if storyItem then
			local storyCount = storyItem:getChildrenCount()
			if storyCount == 0 then
				local CSHelper = require("yoka.utils.CSHelper")
				local story = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar", "common"))
				story:updateUI(heroBaseId, limitLevel, limitRedLevel)
				story:setScale(0.8)
				story:setPosition(cc.p(self._scrollPageStory:getPageSize().width / 2 + 100, 0))
				storyItem:addChild(story)
			end
		end
	end
	

	if selectPos == index then
		if self._curSelectedPos ~= selectPos then
			self._value = heroBaseId
			self._curSelectedPos = selectPos
			self:_updateHeroInfo(heroBaseId, limitLevel, limitRedLevel)
		end
	end
end

--是否有立绘
function PopupHeroDetail:_isHaveStory(heroBaseId)
	local info = HeroDataHelper.getHeroConfig(heroBaseId)
	local resId = info.res_id
    local resData = HeroDataHelper.getHeroResConfig(resId)
    local isHaveSpine = resData.story_res_spine ~= 0
    local isHaveRes = resData.story_res ~= 0 and resData.story_res ~= 777 --777是阴影图
    return isHaveSpine or isHaveRes
end

function PopupHeroDetail:_onButtonVoiceClicked()
	self:_playCurHeroVoice(true)
end

function PopupHeroDetail:_playCurHeroVoice(must)
	local baseId = self._heroBaseId
	G_HeroVoiceManager:playVoiceWithHeroId(baseId, must)
end

return PopupHeroDetail