local PopupBase = require("app.ui.PopupBase")
local PopupHistoryHeroDetail = class("PopupHistoryHeroDetail", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroDataHelper = require("app.utils.data.HeroDataHelper")
local HistoryHeroAttrLayer = require("app.scene.view.historyhero.HistoryHeroAttrLayer")

--[[
   name: ctor
   param heroList 历代名将配置id list
   return: nil
]]
function PopupHistoryHeroDetail:ctor(type, uniqueId, heroList, isPage, limitLevel, value)
	self._type = type
	self._uniqueId = uniqueId
	self._heroList = heroList
	self._isPage = isPage
	self._limitLevel = limitLevel
	self._value = value
	
	local resource = {
		file = Path.getCSB("PopupHistoryHeroDetail", "historyhero"),
		binding = {
			_btnWayGet = {
				events = {{event = "touch", method = "_onBtnWayGetClicked"}}
			},
		}
	}

	PopupHistoryHeroDetail.super.ctor(self, resource)
end

function PopupHistoryHeroDetail:onCreate()
	self._commonBg:addCloseEventListener(handler(self,self._onBtnClose))
	self._commonBg:setTitle(Lang.get("historyhero_book_title"))
	self._btnWayGet:setString(Lang.get("way_type_goto_get"))
	self._isShowDrawing = false
	self._avatarPageItems = nil
	self._storyPageItems = nil
	self._curSelectedPos = 1
	self["historicalDetailView"] = HistoryHeroAttrLayer.new()
	self["historicalDetailView"]:updateScrollHeight()
	self._nodeLayer:addChild(self["historicalDetailView"])
	-- self:_updateDetailLayer()
end

function PopupHistoryHeroDetail:onEnter()
	self:setPageData(self._heroList)
	-- if not self._isPage then
	-- 	local dataList = {}
	-- 	for i = 1, #self._heroList do
	-- 		table.insert(dataList, {cfg = 
	-- 								{id = self._heroList[i]},
	-- 								limitLevel = self._limitLevel
	-- 								})
	-- 	end
	-- 	-- local dataList = {
	-- 	-- 	{cfg = {id = self._value}, limitLevel = self._limitLevel}
	-- 	-- }
	-- 	self:setPageData(dataList)
	-- end

	-- self._value = self._heroList[1]
	self:_updateHeroInfo(self._value, 1)
end

function PopupHistoryHeroDetail:onExit()
end

function PopupHistoryHeroDetail:_updateHeroInfo(heroBaseId, limitLevel, limitRedLevel)
	self._heroBaseId = heroBaseId

	local haveHero = G_UserData:getHistoryHero():isHaveHero(heroBaseId)
	local color = haveHero and Colors.DARK_BG_THREE or Colors.BRIGHT_BG_RED
	self._hasText:setColor(color)
	self._hasText:setString(haveHero and Lang.get("common_have") or  Lang.get("common_not_have")) 
	
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HISTORY_HERO, heroBaseId)
	self._textHeroName:setString(heroParam.name)
	self._textHeroName:setColor(heroParam.icon_color)

	self:_updateHeroState(heroBaseId)

	if self._uniqueId == nil then
		self["historicalDetailView"]:updateUIForNoraml(self._value)
	else
		local heroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(self._uniqueId)
		self["historicalDetailView"]:updateUI(heroData)
	end
	-- self:_playCurHeroVoice()
end

function PopupHistoryHeroDetail:_updateDetailLayer()
	-- if self._type == TypeConvertHelper.TYPE_HISTORY_HERO then
	-- 	if self._uniqueId == nil then
	-- 		self["historicalDetailView"]:updateUIForNoraml(self._value)
	-- 	else
	-- 		local heroData = G_UserData:getHistoryHero():getHisoricalHeroValueById(self._uniqueId)
	-- 		self["historicalDetailView"]:updateUI(heroData)
	-- 	end
	-- end
end

--如果没有立绘，显示普通状态
function PopupHistoryHeroDetail:_updateHeroState(heroBaseId)
	local isHave = self:_isHaveStory(heroBaseId)
	local show = self._isShowDrawing and isHave
	self:_updateDrawing(show)
end

function PopupHistoryHeroDetail:_onBtnClose()
	self:close()
end

function PopupHistoryHeroDetail:_onBtnWayGetClicked()
	--self:close()
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	PopupItemGuider:updateUI(self._type, self._value)
	PopupItemGuider:openWithAction()
end

function PopupHistoryHeroDetail:_showDrawing(show)
	self._isShowDrawing = show
	self:_updateDrawing(show)
end

function PopupHistoryHeroDetail:_updateDrawing(show)
	self._heroStage:setVisible(not show)
	self._scrollPage:setVisible(not show)
	self._scrollPageStory:setVisible(show)
	if show then
		self._scrollPageStory:setCurPage(self._curSelectedPos)
	else
		self._scrollPage:setCurPage(self._curSelectedPos)
	end
end

--使用了翻页功能
function PopupHistoryHeroDetail:setPageData(dataList)
	local selectPos = 0
	for i, data in ipairs(dataList) do
		if data.cfg.id == self._value then
			selectPos = i
		end
	end
	self:_setScrollPage(dataList, selectPos)
	self:_showDrawing(self._isShowDrawing)
end

function PopupHistoryHeroDetail:_setScrollPage(dataList, selectPos)
	self._dataList = dataList
	self._scrollPage:setCallBack(handler(self, self._updateHeroItem))
	self._scrollPage:setUserData(dataList, selectPos)
	self._scrollPageStory:setCallBack(handler(self, self._updateHeroItem))
	self._scrollPageStory:setUserData(dataList, selectPos)
	self._scrollPageStory:setTouchEnabled(false)
end

function PopupHistoryHeroDetail:_updateHeroItem(sender, widget, index, selectPos)
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
				local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHistoryAvatar", "common"))
				avatar:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
				avatar:setScale(1.4)
				avatar:setPosition(cc.p(self._scrollPage:getPageSize().width / 2, self._scrollPage:getPageSize().height / 2 - 150))
				avatarItem:addChild(avatar)
				self:_updateDetailLayer()
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
function PopupHistoryHeroDetail:_isHaveStory(heroBaseId)
	local info = HeroDataHelper.getHeroConfig(heroBaseId)
	local resId = info.res_id
    local resData = HeroDataHelper.getHeroResConfig(resId)
    local isHaveSpine = resData.story_res_spine ~= 0
    local isHaveRes = resData.story_res ~= 0 and resData.story_res ~= 777 --777是阴影图
    return isHaveSpine or isHaveRes
end



return PopupHistoryHeroDetail