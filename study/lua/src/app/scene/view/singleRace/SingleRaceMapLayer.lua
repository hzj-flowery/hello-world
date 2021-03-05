--
-- Author: Liangxu
-- Date: 2018-11-26
-- 跨服个人竞技赛程图
local ViewBase = require("app.ui.ViewBase")
local SingleRaceMapLayer = class("SingleRaceMapLayer", ViewBase)
local SingleRaceMapNode = require("app.scene.view.singleRace.SingleRaceMapNode")
local SingleRaceConst = require("app.const.SingleRaceConst")
local SchedulerHelper = require ("app.utils.SchedulerHelper")
local SingleRaceDataHelper = require("app.utils.data.SingleRaceDataHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local PopupSingleRaceGuess = require("app.scene.view.singleRace.PopupSingleRaceGuess")

local LIGHT_COLOR = cc.c3b(0xff, 0xe3, 0xcb)
local LIGHT_COLOR_OUTLINE = cc.c4b(0xc8, 0x82, 0x19, 0xff)
local DARK_COLOR = cc.c3b(0xa5, 0x71, 0x56)

function SingleRaceMapLayer:ctor(parentView)
	self._parentView = parentView

	local resource = {
		file = Path.getCSB("SingleRaceMapLayer", "singleRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_buttonBig = {
				events = {{event = "touch", method = "_onClickBig"}}
			},
			_buttonSmall = {
				events = {{event = "touch", method = "_onClickSmall"}}
			},
			_buttonGuess = {
				events = {{event = "touch", method = "_onClickGuess"}}
			},
		},
	}
	SingleRaceMapLayer.super.ctor(self, resource)
end

function SingleRaceMapLayer:onCreate()
	self._curState = SingleRaceConst.MAP_STATE_SMALL
	self._mapNode = SingleRaceMapNode.new(self)
	self._scrollView:getInnerContainer():addChild(self._mapNode)
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeBg, "moving_kuafujingji", nil, nil, false)
end

function SingleRaceMapLayer:onEnter()
	self._signalSingleRaceGuessSuccess = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_GUESS_SUCCESS, handler(self, self._onEventGuessSuccess))

	self._targetTime = SingleRaceDataHelper.getStartTime()
	self:_startCountDown()
	self:_startMatchCountDown()
	self:updateProcessTitle()
end

function SingleRaceMapLayer:onExit()
	self:_stopCountDown()
	self:_stopMatchCountDown()

	self._signalSingleRaceGuessSuccess:remove()
	self._signalSingleRaceGuessSuccess = nil
end

function SingleRaceMapLayer:onShow()
	self._mapNode:onShow()
	self._nodeCount:setVisible(false)
	self:playFire()
	self:updateGuessRedPoint()
end

function SingleRaceMapLayer:onHide()
	self._mapNode:onHide()
end

function SingleRaceMapLayer:updateInfo(state)
	if state then
		self._curState = state
	end
	self:_updateChangeButton()
end

function SingleRaceMapLayer:playFire()
	self._nodeFire:removeAllChildren()
	if G_UserData:getSingleRace():getStatus() == SingleRaceConst.RACE_STATE_ING then
		local effect = EffectGfxNode.new("effect_tujietiaozi_2")
		self._nodeFire:addChild(effect)
		effect:play()
	end
end

function SingleRaceMapLayer:updateGuessRedPoint()
	local has = G_UserData:getSingleRace():hasRedPoint()
	self._imageRP:setVisible(has)
end

function SingleRaceMapLayer:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function SingleRaceMapLayer:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function SingleRaceMapLayer:_updateCountDown()
	local status = G_UserData:getSingleRace():getStatus()
	if status ~= SingleRaceConst.RACE_STATE_PRE then
		self._textCountDown:setVisible(false)
    	self._textCountDownTitle:setVisible(false)
    	self._nodeCount:setVisible(false)
    	self:_stopCountDown()
        return
    end
	local countDown = self._targetTime - G_ServerTime:getTime()
	self:_playCountDownEffect(countDown)
	if countDown > 0 then
		self._textCountDown:setVisible(true)
    	self._textCountDownTitle:setVisible(true)
		local timeString = G_ServerTime:getLeftDHMSFormatEx(self._targetTime)
    	self._textCountDown:setString(timeString)
    else
    	self._textCountDown:setVisible(false)
    	self._textCountDownTitle:setVisible(false)
	end
end

function SingleRaceMapLayer:_playCountDownEffect(countDown)
	if countDown < 1 or countDown > 10 then
		self._nodeCount:setVisible(false)
		return
	end
	self._nodeCount:setVisible(true)
	if countDown >= 1 and countDown <= 3 then
		self._textCount:setString("")
    	G_EffectGfxMgr:createPlayGfx(self._nodeCount, "effect_jingjijishi_"..countDown, nil, true)
    else
    	self._textCount:setString(countDown)
	end
end

function SingleRaceMapLayer:_startMatchCountDown()
    self:_stopMatchCountDown()
    self._scheduleHandlerMatch = SchedulerHelper.newSchedule(handler(self, self._updateMatchCountDown), 1)
    self:_updateMatchCountDown()
end

function SingleRaceMapLayer:_stopMatchCountDown()
    if self._scheduleHandlerMatch ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandlerMatch)
        self._scheduleHandlerMatch = nil
    end
end

function SingleRaceMapLayer:_updateMatchCountDown()
	local status = G_UserData:getSingleRace():getStatus()
	if status ~= SingleRaceConst.RACE_STATE_ING then
		self._textCountDownMatchTitle:setVisible(false)
		self._textCountDownMatch:setVisible(false)
		self._imageCountDownMatchTitle:setVisible(false)
        return
    end
	local beginTime = G_UserData:getSingleRace():getRound_begin_time()
    local intervalPerRound = SingleRaceConst.getIntervalPerRound()
    local nowTime = G_ServerTime:getTime()
    local matchCount = 0 --第几场
    while beginTime <= nowTime do
    	matchCount = matchCount + 1
        beginTime = beginTime + intervalPerRound
    end
    local countDown = beginTime - nowTime - 1
	if matchCount >= 1 and matchCount <= 5 and countDown > 0 then --场次1~5，做个保护
		self._textCountDownMatchTitle:setVisible(true)
		self._textCountDownMatch:setVisible(true)
		self._imageCountDownMatchTitle:setVisible(true)
    	self._textCountDownMatchTitle:setString(Lang.get("single_race_countdown_match_title", {num = matchCount}))
		local timeString = G_ServerTime:_secondToString(countDown)
    	self._textCountDownMatch:setString(timeString)
    else
    	self._textCountDownMatchTitle:setVisible(false)
		self._textCountDownMatch:setVisible(false)
		self._imageCountDownMatchTitle:setVisible(false)
	end
end

function SingleRaceMapLayer:updateProcessTitle()
	local nowRound = G_UserData:getSingleRace():getNow_round()
	self._textProcess:setString(Lang.get("single_race_round_title")[nowRound] or "")
end

function SingleRaceMapLayer:playRoundEffect()
	local textNames = {
		"txt_camp_01_shiliuqiang",
		"txt_camp_02_baqiang",
		"txt_camp_03_siqiang",
		"txt_camp_04_banjuesai",
		"txt_camp_05_juesai",
	}
	local nowRound = G_UserData:getSingleRace():getNow_round()
	local textName = textNames[nowRound]
	if textName then
		local function effectFunction(effect)
        if effect == "gongke_txt" then 
            local node = cc.Sprite:create(Path.getTextCampRace(textName))
            return node                       
        end
	    end
	    local function eventFunction(event)
	        if event == "finish" then
	            
	        end
	    end
	    G_EffectGfxMgr:createPlayMovingGfx(self._nodeRoundEffect, "moving_gongkexiaocheng", effectFunction, eventFunction, true)
	end
end

function SingleRaceMapLayer:_onClickBig()
	self._curState = SingleRaceConst.MAP_STATE_LARGE
	self:_updateChangeButton()
	self._mapNode:changeScale(self._curState)
end

function SingleRaceMapLayer:_onClickSmall()
	self._curState = SingleRaceConst.MAP_STATE_SMALL
	self:_updateChangeButton()
	self._mapNode:changeScale(self._curState)
end

function SingleRaceMapLayer:_updateChangeButton()
	if self._curState == SingleRaceConst.MAP_STATE_LARGE then
		self._buttonBig:setEnabled(false)
		self._buttonSmall:setEnabled(true)
	elseif self._curState == SingleRaceConst.MAP_STATE_SMALL then
		self._buttonBig:setEnabled(true)
		self._buttonSmall:setEnabled(false)
	end
end

function SingleRaceMapLayer:_onClickGuess()
	local popup = PopupSingleRaceGuess.new()
	popup:openWithAction()
end

function SingleRaceMapLayer:_onEventGuessSuccess(eventName)
	self:updateGuessRedPoint()
end

return SingleRaceMapLayer