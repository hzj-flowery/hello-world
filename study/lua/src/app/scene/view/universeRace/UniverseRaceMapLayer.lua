
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceMapLayer = class("UniverseRaceMapLayer", ViewBase)
local UniverseRaceMapNode = require("app.scene.view.universeRace.UniverseRaceMapNode")
local ParallaxNode = require("app.ui.ParallaxNode")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local PopupUniverseRaceGuess = require("app.scene.view.universeRace.PopupUniverseRaceGuess")
local PopupUniverseRaceAward = require("app.scene.view.universeRace.PopupUniverseRaceAward")
local PopupUniverseRaceAwardPool = require("app.scene.view.universeRace.PopupUniverseRaceAwardPool")
local BullectScreenConst = require("app.const.BullectScreenConst")

local farBgSize = cc.size(1680, 868) --背景图尺寸
local mapNodeSize = cc.size(2384, 1186) --对战图尺寸

local ROUND_EFFECT = {
	[1] = "effect_qiangsai_24",	
	[2] = "effect_qiangsai_16",
	[3] = "effect_qiangsai_8",
	[4] = "effect_qiangsai_4",
	[5] = "effect_qiangsai_banjuesai",
	[6] = "effect_qiangsai_juesai",
}

function UniverseRaceMapLayer:ctor(parentView)
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("UniverseRaceMapLayer", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonAward = {
				events = {{event = "touch", method = "_onButtonAwardClicked"}}
			},
			_buttonGuess = {
				events = {{event = "touch", method = "_onButtonGuessClicked"}}
			},
			_buttonPool = {
				events = {{event = "touch", method = "_onButtonPoolClicked"}}
			},
			_buttonShop = {
				events = {{event = "touch", method = "_onButtonShopClicked"}}
			},
		},
	}
	UniverseRaceMapLayer.super.ctor(self, resource)
end

function UniverseRaceMapLayer:onCreate()
	self:_initData()
	self:_initView()
end

function UniverseRaceMapLayer:_initData()
	self._raceState = UniverseRaceConst.RACE_STATE_NONE
	self._targetTime = 0
	self._isFirstEnter = true
	self._lastRound = 0
end

function UniverseRaceMapLayer:_initView()
	local node = ParallaxNode.new()
	local farBg = cc.Sprite:create("ui3/pvp_universe/img_pvp_universe_bigbg01.jpg")
	self._mapNode = UniverseRaceMapNode.new()
	farBg:setContentSize(farBgSize)
	G_EffectGfxMgr:createPlayMovingGfx(farBg, "moving_shenxiandajiachangjing_back", nil, nil, false)
	G_EffectGfxMgr:createPlayMovingGfx(farBg, "moving_shenxiandajiachangjing_front", nil, nil, false)

    self._scrollView:setInnerContainerSize(mapNodeSize)
    local innerContainer = self._scrollView:getInnerContainer()
    innerContainer:setAnchorPoint(cc.p(0.5, 0.5))
    local scrollViewSize = self._scrollView:getContentSize()
	self._scrollView:setInnerContainerPosition(cc.p(scrollViewSize.width/2, scrollViewSize.height/2))
	
    local ratio = cc.p((farBgSize.width-scrollViewSize.width)/(mapNodeSize.width-scrollViewSize.width), (farBgSize.height-scrollViewSize.height)/(mapNodeSize.height-scrollViewSize.height))
    node:addSubNode(farBg, 0, ratio, cc.p(0, 0), "farBg")
    node:addSubNode(self._mapNode, 1, cc.p(1, 1), cc.p(0, 56), "mapNode")
    innerContainer:addChild(node)
    node:setPosition(cc.p(mapNodeSize.width/2, mapNodeSize.height/2))
end

function UniverseRaceMapLayer:onEnter()
	self._signalUniverseRaceUpdatePkInfo = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_UPDATE_PK_INFO_SUCCESS, handler(self, self._onEventRaceUpdatePkInfo))
	self._signalUniverseRaceSupportSuccess = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SUPPORT_SUCCESS, handler(self, self._onEventRaceSupportSuccess))
	if self._isFirstEnter then --只有第一次进来，找焦点定位
		self:_focusPos()
		self._isFirstEnter = false
	end
end

function UniverseRaceMapLayer:onExit()
	G_BulletScreenManager:clearBulletLayer()
	self:_stopCountDown()
	
    self._signalUniverseRaceUpdatePkInfo:remove()
    self._signalUniverseRaceUpdatePkInfo = nil
	self._signalUniverseRaceSupportSuccess:remove()
    self._signalUniverseRaceSupportSuccess = nil
end

function UniverseRaceMapLayer:onShow()
	self:_updateTimeData()
	self:_startCountDown()
	G_BulletScreenManager:setBulletScreenOpen(BullectScreenConst.UNIVERSE_RACE_TYPE, true)
end

function UniverseRaceMapLayer:onHide()
	self:_stopCountDown()
	G_BulletScreenManager:clearBulletLayer()
end

function UniverseRaceMapLayer:updateInfo()
	self._mapNode:updateUI()
	if self._raceState == UniverseRaceConst.RACE_STATE_CHAMPION_SHOW then
		self:_focusPos() --冠军阶段再定位一次，定位到冠军
	end
end

function UniverseRaceMapLayer:_updateTimeData()
	self._raceState, self._targetTime = UniverseRaceDataHelper.getRaceStateAndTime()
	self:_updateGuessRP()
end

function UniverseRaceMapLayer:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function UniverseRaceMapLayer:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function UniverseRaceMapLayer:_updateCountDown()
	if self._raceState == UniverseRaceConst.RACE_STATE_NONE or self._raceState == UniverseRaceConst.RACE_STATE_CHAMPION_SHOW then
		self._imageGuessBg:setVisible(false)
		self._nodeRaceEffect:setVisible(false)
		self:_stopCountDown()
		return
	end

	if self._raceState == UniverseRaceConst.RACE_STATE_BREAK then
		self._nodeRaceEffect:setVisible(false)
		local countDown = self._targetTime - G_ServerTime:getTime()
		if countDown >= 0 then
			self._imageGuessBg:setVisible(true)
			local timeString = G_ServerTime:getLeftDHMSFormatEx(self._targetTime)
			self._textCountDown:setString(timeString)
		else
			self:_updateTimeData()
			self._mapNode:updateState()
			self._imageGuessBg:setVisible(false)
		end
	elseif self._raceState == UniverseRaceConst.RACE_STATE_ING then
		self._nodeRaceEffect:setVisible(true)
		self._imageGuessBg:setVisible(false)
		local round = G_UserData:getUniverseRace():getNow_round()
		if self._lastRound ~= round then
			self._nodeRaceEffect:removeAllChildren()
			local effectName = ROUND_EFFECT[round]
			if effectName then
				G_EffectGfxMgr:createPlayGfx(self._nodeRaceEffect, effectName)
			end
			self._lastRound = round
		end
	end
end

function UniverseRaceMapLayer:_onEventRaceUpdatePkInfo(eventName, pkInfos, reports, isChangeRound)
	if isChangeRound then
		self:_updateTimeData()
	end
end

function UniverseRaceMapLayer:_onEventRaceSupportSuccess(eventName)
	self:_updateGuessRP()
end

function UniverseRaceMapLayer:_onButtonAwardClicked()
	local popup = PopupUniverseRaceAward.new()
	popup:openWithAction()
end

function UniverseRaceMapLayer:_onButtonGuessClicked()
	local popup = PopupUniverseRaceGuess.new()
	popup:openWithAction()
end

function UniverseRaceMapLayer:_onButtonPoolClicked()
	local popup = PopupUniverseRaceAwardPool.new()
	popup:openWithAction()
end

function UniverseRaceMapLayer:_onButtonShopClicked()
	local state = UniverseRaceDataHelper.getRaceStateAndTime()
	if self._raceState == UniverseRaceConst.RACE_STATE_NONE then
		G_Prompt:showTip(Lang.get("universe_race_act_end_tip"))
	else
		G_SceneManager:showScene("universeRaceShop")
	end
end

function UniverseRaceMapLayer:_updateGuessRP()
	local round = G_UserData:getUniverseRace():getNow_round()
	local isCanSingleSupport = UniverseRaceDataHelper.isCanSingleSupportWithRound(round)
	local isCanMutipleSupport = UniverseRaceDataHelper.isCanMutipleSupportWithRound(round)
	local isCan = isCanSingleSupport or isCanMutipleSupport
	self._imageGuessRP:setVisible(isCan)
	self._nodeGuessEffect:removeAllChildren()
	if isCan then
		G_EffectGfxMgr:createPlayGfx(self._nodeGuessEffect, "effect_qizi_baobei")
	end
end

function UniverseRaceMapLayer:_alignText(text, type)
	if type == "left" then
		text:setPositionX(0)
	elseif type == "center" then
		local size = text:getContentSize()
		local posX = size.width/2
		text:setPositionX(posX)
	end
end

--定位位置
function UniverseRaceMapLayer:_focusPos()
	local focusIndex = G_UserData:getUniverseRace():getCurFocusIndex()
	local focusNode = nil
	if focusIndex == 0 then --定位冠军
		focusNode = self._mapNode._nodeChampion
	else
		focusNode = self._mapNode["_nodeReport"..focusIndex]
	end
	if focusNode then
		local oldPos = self._scrollView:getInnerContainerPosition()
		local pos1 = focusNode:convertToWorldSpace(cc.p(0,0))
		local pos2 = display.center
		local diffX = pos2.x - pos1.x
		local diffY = pos2.y - pos1.y
		local tarPosX = oldPos.x + diffX
		local tarPosY = oldPos.y + diffY

		local scrollViewSize = self._scrollView:getContentSize()
		local minX = pos2.x - (mapNodeSize.width/2 - scrollViewSize.width/2)
		local maxX = pos2.x + (mapNodeSize.width/2 - scrollViewSize.width/2)
		local minY = pos2.y - (mapNodeSize.height/2 - scrollViewSize.height/2)
		local maxY = pos2.y + (mapNodeSize.height/2 - scrollViewSize.height/2)
		tarPosX = math.max(minX, tarPosX)
		tarPosX = math.min(maxX, tarPosX)
		tarPosY = math.max(minY, tarPosY)
		tarPosY = math.min(maxY, tarPosY)
		self._scrollView:setInnerContainerPosition(cc.p(tarPosX, tarPosY))
	end
end

return UniverseRaceMapLayer