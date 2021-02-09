--
-- Author: Liangxu
-- Date: 2017-03-08 15:32:58
-- 武将培养界面
local ViewBase = require("app.ui.ViewBase")
local HeroTrainView = class("HeroTrainView", ViewBase)
local HeroTrainUpgradeLayer = require("app.scene.view.heroTrain.HeroTrainUpgradeLayer")
local HeroTrainBreakLayer = require("app.scene.view.heroTrain.HeroTrainBreakLayer")
local HeroTrainAwakeLayer = require("app.scene.view.heroTrain.HeroTrainAwakeLayer")
local HeroConst = require("app.const.HeroConst")
local RedPointHelper = require("app.data.RedPointHelper")
local CSHelper = require("yoka.utils.CSHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local HeroTrainLimitLayer = require("app.scene.view.heroTrain.HeroTrainLimitLayer")

function HeroTrainView:ctor(heroId, trainType, rangeType, isJumpWhenBack)
	G_UserData:getHero():setCurHeroId(heroId)
	self._selectTabIndex = trainType or HeroConst.HERO_TRAIN_UPGRADE
	self._rangeType = rangeType or HeroConst.HERO_RANGE_TYPE_1
	self._isJumpWhenBack = isJumpWhenBack --当点返回时，是否要跳过上一个场景

	local resource = {
		file = Path.getCSB("HeroTrainView", "hero"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonLeft = {
				events = {{event = "touch", method = "_onButtonLeftClicked"}}
			},
			_buttonRight = {
				events = {{event = "touch", method = "_onButtonRightClicked"}}
			}
		}
	}
	HeroTrainView.super.ctor(self, resource)
end

function HeroTrainView:onCreate()
	self._subLayers = {} --存储子layer
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setImageTitle("txt_sys_com_wujiang")
	if self._isJumpWhenBack then
		self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))
	end

	self:_initTab()
end

function HeroTrainView:onEnter()
	self._signalHeroRankUp = G_SignalManager:add(SignalConst.EVENT_HERO_RANKUP, handler(self, self._heroRankUpSuccess))
	self._signalHeroLimitUpWithHero = G_SignalManager:add(SignalConst.EVENT_HERO_LIMIT_LV_PUT_RES_WITH_HERO, handler(self, self._heroRankUpSuccess))

	self:_updateHeroIds()
	self:_calCurSelectedPos()
	self:updateArrowBtn()

	self:updateTabIcons()
	self:_updateView()

	--抛出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function HeroTrainView:onExit()
	G_UserData:getTeamCache():setShowHeroTrainFlag(true)
	self._signalHeroRankUp:remove()
	self._signalHeroRankUp = nil
	self._signalHeroLimitUpWithHero:remove()
	self._signalHeroLimitUpWithHero = nil
end

function HeroTrainView:_updateHeroIds()
	local allHeroIds = {}
	if self._rangeType == HeroConst.HERO_RANGE_TYPE_1 then
		allHeroIds = G_UserData:getHero():getRangeDataBySort()
	elseif self._rangeType == HeroConst.HERO_RANGE_TYPE_2 then
		allHeroIds = G_UserData:getTeam():getHeroIdsInBattle()
	end
	self._allHeroIds = self:_filterHero(allHeroIds)
	self._heroCount = #self._allHeroIds
end

function HeroTrainView:_filterHero(allHeroIds)
	local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
	local filters = {}
	for index = 1, #allHeroIds do
		local heroId = allHeroIds[index]
		local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
		if not HeroGoldHelper.isPureHeroGold(unitData) then
			table.insert(filters, heroId)
		end
	end
	return filters
end

function HeroTrainView:_calCurSelectedPos()
	self._selectedPos = 1
	local heroId = G_UserData:getHero():getCurHeroId()
	for i, id in ipairs(self._allHeroIds) do
		if id == heroId then
			self._selectedPos = i
		end
	end
end

function HeroTrainView:_initTab()
	for i = 1, 4 do
		self["_nodeTabIcon" .. i]:setCallback(handler(self, self._onClickTabIcon))
	end
end

function HeroTrainView:_onClickTabIcon(index)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateTabIconSelectedState()
	self:_updateView()
end

function HeroTrainView:_updateTabIconSelectedState()
	for i = 1, 4 do
		self["_nodeTabIcon" .. i]:setSelected(i == self._selectTabIndex)
	end
end

function HeroTrainView:updateTabIcons()
	self:_doLayoutTabIcons()
	self:_updateTabIconSelectedState()
	self:_updateRedPoint()
end

function HeroTrainView:_updateView()
	local layer = self._subLayers[self._selectTabIndex]
	if layer == nil then
		if self._selectTabIndex == HeroConst.HERO_TRAIN_UPGRADE then
			layer = HeroTrainUpgradeLayer.new(self)
		elseif self._selectTabIndex == HeroConst.HERO_TRAIN_BREAK then
			layer = HeroTrainBreakLayer.new(self)
		elseif self._selectTabIndex == HeroConst.HERO_TRAIN_AWAKE then
			layer = HeroTrainAwakeLayer.new(self)
		elseif self._selectTabIndex == HeroConst.HERO_TRAIN_LIMIT then
			layer = HeroTrainLimitLayer.new(self)
		end
		if layer then
			self._panelContent:addChild(layer)
			self._subLayers[self._selectTabIndex] = layer
		end
	end
	for k, subLayer in pairs(self._subLayers) do
		subLayer:setVisible(false)
	end
	layer:setVisible(true)
	layer:initInfo()
end

function HeroTrainView:_setCallback()
	G_SceneManager:popSceneByTimes(2) --pop2次，返回阵容界面
end

function HeroTrainView:checkRedPoint(index)
	local heroId = G_UserData:getHero():getCurHeroId()
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local reach = RedPointHelper.isModuleReach(FunctionConst["FUNC_HERO_TRAIN_TYPE" .. index], heroUnitData)
	self["_nodeTabIcon" .. index]:showRedPoint(reach)
end

function HeroTrainView:_updateRedPoint()
	for i = 1, 4 do
		self:checkRedPoint(i)
	end
end

function HeroTrainView:updateArrowBtn()
	self._buttonLeft:setVisible(self._selectedPos > 1)
	self._buttonRight:setVisible(self._selectedPos < self._heroCount)
end

function HeroTrainView:setArrowBtnVisible(visible)
	self._buttonLeft:setVisible(visible)
	self._buttonRight:setVisible(visible)
end

function HeroTrainView:_onButtonLeftClicked()
	if self._selectedPos <= 1 then
		return
	end

	self._selectedPos = self._selectedPos - 1
	local curHeroId = self._allHeroIds[self._selectedPos]
	G_UserData:getHero():setCurHeroId(curHeroId)
	self:updateArrowBtn()
	self:_updateView()
	self:updateTabIcons()
end

function HeroTrainView:_onButtonRightClicked()
	if self._selectedPos >= self._heroCount then
		return
	end

	self._selectedPos = self._selectedPos + 1
	local curHeroId = self._allHeroIds[self._selectedPos]
	G_UserData:getHero():setCurHeroId(curHeroId)
	self:updateArrowBtn()
	self:_updateView()
	self:updateTabIcons()
end

function HeroTrainView:getAllHeroIds()
	return self._allHeroIds
end

function HeroTrainView:getHeroCount()
	return self._heroCount
end

function HeroTrainView:setSelectedPos(pos)
	self._selectedPos = pos
end

function HeroTrainView:getSelectedPos()
	return self._selectedPos
end

function HeroTrainView:setArrowBtnEnable(enable)
	self._buttonLeft:setEnabled(enable)
	self._buttonRight:setEnabled(enable)
end

function HeroTrainView:_heroRankUpSuccess()
	--全范围的情况，突破如果消耗同名卡，要重新更新列表
	if self._rangeType == HeroConst.HERO_RANGE_TYPE_1 then
		self:_updateHeroIds()
		self:_calCurSelectedPos()
		if self._selectTabIndex ~= HeroConst.HERO_TRAIN_LIMIT then
			self:updateArrowBtn()
		end
		local layer = self._subLayers[self._selectTabIndex]
		if layer and layer.updatePageView then
			layer:updatePageView()
		end
	end
end

function HeroTrainView:_doLayoutTabIcons()
	local dynamicTabs = {} --需要动态排版的
	local dynamicRopes = {}
	local showCount = 2
	for i = 1, 4 do
		local txt = Lang.get("hero_train_tab_icon_" .. i)
		local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_HERO_TRAIN_TYPE" .. i])
		local curHeroId = G_UserData:getHero():getCurHeroId()
		local curHeroData = G_UserData:getHero():getUnitDataWithId(curHeroId)
		if i == 2 then
			local canBreak = curHeroData:isCanBreak()
			isOpen = isOpen and canBreak
		end
		if i == 3 then
			local canAwake = curHeroData:isCanAwake()
			isOpen = isOpen and canAwake
			self._nodeTabIcon3:setVisible(isOpen)
			self._imageRope3:setVisible(isOpen)
			if isOpen then
				showCount = showCount + 1
				local funcLevelInfo = require("app.config.function_level").get(FunctionConst.FUNC_HERO_TRAIN_TYPE3)
				assert(funcLevelInfo, "Invalid function_level can not find funcId " .. FunctionConst.FUNC_HERO_TRAIN_TYPE3)
				table.insert(dynamicTabs, {tab = self._nodeTabIcon3, displayOpenLevel=funcLevelInfo.level, openLevel = funcLevelInfo.level})
				table.insert(dynamicRopes, {rope = self._imageRope3, displayOpenLevel=funcLevelInfo.level, openLevel = funcLevelInfo.level})
			end
		end
		if i == 4 then
			local canLimit, limitType = curHeroData:isCanLimitBreak()
			isOpen = isOpen and canLimit
			local funcLimitType = FunctionConst.FUNC_HERO_TRAIN_TYPE4
			local funcLimitType2 = funcLimitType
			if limitType==HeroConst.HERO_LIMIT_TYPE_GOLD then
				funcLimitType = FunctionConst.FUNC_HERO_TRAIN_TYPE4_RED
			end
			local limitIsOpen = LogicCheckHelper.funcIsOpened(funcLimitType)
			isOpen = isOpen and limitIsOpen

			self._nodeTabIcon4:setVisible(isOpen)
			self._imageRope4:setVisible(isOpen)
			if isOpen then
				showCount = showCount + 1
				local funcLevelInfo = require("app.config.function_level").get(funcLimitType)
				assert(funcLevelInfo, "Invalid function_level can not find funcId " .. funcLimitType)
				local funcLevelInfo2 = require("app.config.function_level").get(funcLimitType2)
				assert(funcLevelInfo2, "Invalid function_level can not find funcId " .. funcLimitType2)
				table.insert(dynamicTabs, {tab = self._nodeTabIcon4, displayOpenLevel=funcLevelInfo2.level, openLevel = funcLevelInfo.level})
				table.insert(dynamicRopes, {rope = self._imageRope4, displayOpenLevel=funcLevelInfo2.level, openLevel = funcLevelInfo.level})
			end
		end

		self["_nodeTabIcon" .. i]:updateUI(txt, isOpen, i)
	end

	table.sort(
		dynamicTabs,
		function(a, b)
			return a.displayOpenLevel < b.displayOpenLevel
		end
	)

	table.sort( 		
		dynamicRopes,
		function(a, b)
			return a.displayOpenLevel < b.displayOpenLevel
		end 
	)

	if dynamicTabs[1] then
		dynamicTabs[1].tab:setPositionY(208)
		dynamicRopes[1].rope:setPositionY(295)
	end
	if dynamicTabs[2] then
		dynamicTabs[2].tab:setPositionY(62)
		dynamicRopes[2].rope:setPositionY(150)
	end

	if showCount == 2 then
		self._imageRopeTail:setPositionY(296)
	elseif showCount == 3 then
		self._imageRopeTail:setPositionY(150)
	elseif showCount == 4 then
		self._imageRopeTail:setPositionY(4)
	end
end

return HeroTrainView
