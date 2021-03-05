--
-- Author: Liangxu
-- Date: 2018-11-26
-- 跨服个人竞技

local ViewBase = require("app.ui.ViewBase")
local SingleRaceView = class("SingleRaceView", ViewBase)
local SingleRaceBattleLayer = require("app.scene.view.singleRace.SingleRaceBattleLayer")
local SingleRaceMapLayer = require("app.scene.view.singleRace.SingleRaceMapLayer")
local SingleRaceChampionLayer = require("app.scene.view.singleRace.SingleRaceChampionLayer")
local SingleRaceConst = require("app.const.SingleRaceConst")
local SingleRaceDataHelper = require("app.utils.data.SingleRaceDataHelper")
local AudioConst = require("app.const.AudioConst")

function SingleRaceView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	local msgReg = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_GET_PK_INFO_SUCCESS, onMsgCallBack)
	G_UserData:getSingleRace():c2sGetSingleRacePkInfo()
	
	return msgReg
end

function SingleRaceView:ctor()
	local resource = {
		file = Path.getCSB("SingleRaceView", "singleRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	SingleRaceView.super.ctor(self, resource)
end

function SingleRaceView:onCreate()
	self._subLayers = {} --存储子layer
	self._curState = 0

	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setItemListVisible(false)
	self._topbarBase:hideBG()
	self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))
	self._nodeHelp:updateUI(FunctionConst.FUNC_SINGLE_RACE)
end

function SingleRaceView:onCleanup()
	G_UserData:getSingleRace():setCurWatchPos(0) --退出时，清除跟看比赛的记录，再次进入时，重新选择观看的比赛
end

function SingleRaceView:onEnter()
	self._signalSwitchLayer = G_SignalManager:add(SignalConst.EVENT_SINGLE_RACE_SWITCH_LAYER, handler(self, self._onEventSwitchLayer)) --切换界面

	self:_updateData()
	self:_updateView()
end

function SingleRaceView:onExit()
    self._signalSwitchLayer:remove()
    self._signalSwitchLayer = nil
end

function SingleRaceView:_setCallback()
	if self._curState == SingleRaceConst.LAYER_STATE_BATTLE then
		self._curState = SingleRaceConst.LAYER_STATE_MAP
		self:_updateView()
	else
		G_SceneManager:popScene()
	end
end

function SingleRaceView:_updateData()
	--如果之前战报弹框开着，强行进入进程图界面
	local popup= G_SceneManager:getRunningScene():getPopupByName("PopupSingleRaceReplay")
	if popup then
		self._curState = SingleRaceConst.LAYER_STATE_MAP
		return
	end

	local raceState = G_UserData:getSingleRace():getStatus()
	if raceState == SingleRaceConst.RACE_STATE_PRE then
		self._curState = SingleRaceConst.LAYER_STATE_MAP
	elseif raceState == SingleRaceConst.RACE_STATE_ING then
		if G_UserData:getSingleRace():isSelfEliminated() == false then --没被淘汰
			local racePos = G_UserData:getSingleRace():findSelfRacePos()
			G_UserData:getSingleRace():setCurWatchPos(racePos)
			self._curState = SingleRaceConst.LAYER_STATE_BATTLE
		elseif G_UserData:getSingleRace():getCurWatchPos() > 0 then --之前有跟看的比赛
			self._curState = SingleRaceConst.LAYER_STATE_BATTLE
		else
			self._curState = SingleRaceConst.LAYER_STATE_MAP
		end
	elseif raceState == SingleRaceConst.RACE_STATE_FINISH then
		self._curState = SingleRaceConst.LAYER_STATE_CHAMPION
	else
		assert(false, string.format("SingleRaceView raceState is wrong = %d", raceState))
	end
end

function SingleRaceView:_updateView()
	self:_checkGuessPopup()
	local layer = self._subLayers[self._curState]
	if layer == nil then
		if self._curState == SingleRaceConst.LAYER_STATE_MAP then
			layer = SingleRaceMapLayer.new()
		elseif self._curState == SingleRaceConst.LAYER_STATE_BATTLE then
			layer = SingleRaceBattleLayer.new(self)
		elseif self._curState == SingleRaceConst.LAYER_STATE_CHAMPION then
			layer = SingleRaceChampionLayer.new()
		end
		if layer then
			self._nodeSub:addChild(layer)
			self._subLayers[self._curState] = layer
		end
	end
	for state, subLayer in pairs(self._subLayers) do
		subLayer:setVisible(false)
		subLayer:onHide()
	end
	layer:setVisible(true)
	layer:onShow()
	layer:updateInfo()
	self:updateTitle()
	self:_updateBGM()
	self._nodeHelp:setVisible(self._curState ~= SingleRaceConst.LAYER_STATE_BATTLE)
end

function SingleRaceView:updateTitle()
	local str = ""
	if self._curState == SingleRaceConst.LAYER_STATE_BATTLE then
		local nowRound = G_UserData:getSingleRace():getNow_round()
		str = Lang.get("single_race_round_title")[nowRound] or ""
	else
		str = Lang.get("single_race_title")
	end
	self._topbarBase:setTitle(str, 30, cc.c3b(0xff, 0xaf, 0x00), cc.c4b(0x50, 0x25, 0x09, 0xff))
end

function SingleRaceView:_updateBGM()
	if self._curState == SingleRaceConst.LAYER_STATE_MAP then
		G_AudioManager:playMusicWithId(AudioConst.SOUND_SINGLE_BGM_32)
	elseif self._curState == SingleRaceConst.LAYER_STATE_BATTLE then
		G_AudioManager:playMusicWithId(AudioConst.SOUND_SINGLE_BGM_32)
	elseif self._curState == SingleRaceConst.LAYER_STATE_CHAMPION then
		G_AudioManager:stopMusic(true)
    	G_AudioManager:playSoundWithId(AudioConst.SOUND_SINGLE_BGM_WINNER)
	end
end

function SingleRaceView:_onEventSwitchLayer(eventName, layerState)
	self._curState = layerState
	self:_updateView()
end

--检测竞猜弹框是否开着，如果开着，关掉
function SingleRaceView:_checkGuessPopup()
	local popup = G_SceneManager:getRunningScene():getPopupByName("PopupSingleRaceGuess")
	if popup then
		popup:close()
	end
end

return SingleRaceView