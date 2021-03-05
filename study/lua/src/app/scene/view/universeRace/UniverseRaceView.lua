--
-- Author: Liangxu
-- Date: 2019-10-24
-- 

local ViewBase = require("app.ui.ViewBase")
local UniverseRaceView = class("UniverseRaceView", ViewBase)
local UniverseRaceBattleLayer = require("app.scene.view.universeRace.UniverseRaceBattleLayer")
local UniverseRaceMapLayer = require("app.scene.view.universeRace.UniverseRaceMapLayer")
local UniverseRaceChampionLayer = require("app.scene.view.universeRace.UniverseRaceChampionLayer")
local UniverseRacePastChampionLayer = require("app.scene.view.universeRace.UniverseRacePastChampionLayer")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local AudioConst = require("app.const.AudioConst")
local PopupUniverseRaceGuess = require("app.scene.view.universeRace.PopupUniverseRaceGuess")

function UniverseRaceView:waitEnterMsg(callBack)
	local function onMsgCallBack()
		callBack()
	end
	local msgReg = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_GET_PK_INFO_SUCCESS, onMsgCallBack)
	G_UserData:getUniverseRace():c2sGetUniverseRacePkInfo()
	
	return msgReg
end

function UniverseRaceView:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceView", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	UniverseRaceView.super.ctor(self, resource)
end

function UniverseRaceView:onCreate()
    self._subLayers = {} --存储子layer
    self._curState = UniverseRaceConst.LAYER_STATE_MAP
	local curLayerInfo = {state = self._curState}
	self._layerStates = {curLayerInfo}
	
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
	self._topbarBase:setItemListVisible(false)
	self._topbarBase:hideBG()
	self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))
	self._nodeHelp:updateUI(FunctionConst.FUNC_UNIVERSE_RACE)
end

function UniverseRaceView:onCleanup()
	G_UserData:getUniverseRace():setCurWatchPos(0) --退出时，清除跟看比赛的记录，再次进入时，重新选择观看的比赛
end

function UniverseRaceView:onEnter()
	self._signalSwitchLayer = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SWITCH_LAYER, handler(self, self._onEventSwitchLayer)) --切换界面
	self._signalPopupState = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_POPUP_STATE, handler(self, self._onEventPopupState))
    self:_updateData()
	table.remove(self._layerStates, #self._layerStates)
	self._layerStates[#self._layerStates + 1] = {state = self._curState}
	self:_updateView()
end

function UniverseRaceView:onExit()
    self._signalSwitchLayer:remove()
    self._signalSwitchLayer = nil
	self._signalPopupState:remove()
	self._signalPopupState = nil
end

function UniverseRaceView:_setCallback()
	if #self._layerStates > 1 then
		table.remove(self._layerStates, #self._layerStates)
		local curLayerInfo = self._layerStates[#self._layerStates]
		self._curState = curLayerInfo.state
		self:_updateView()
	else
		local curLayerInfo = self._layerStates[#self._layerStates]
		self._curState = curLayerInfo.state
		if #self._layerStates == 1 and self._curState == UniverseRaceConst.LAYER_STATE_BATTLE then --如果只有一个，且是战斗界面，则切换成地图界面
			G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SWITCH_LAYER, UniverseRaceConst.LAYER_STATE_MAP, false)
		else
			G_SceneManager:popScene()	
		end
	end
end

function UniverseRaceView:_updateData()
    --如果之前战报弹框开着，强行进入进程图界面
	local popup = G_SceneManager:getRunningScene():getPopupByName("PopupUniverseRaceReplay")
	if popup then
		self._curState = UniverseRaceConst.LAYER_STATE_MAP
		return
	end

	local raceState = UniverseRaceDataHelper.getRaceStateAndTime()
	if raceState == UniverseRaceConst.RACE_STATE_BREAK then
		self._curState = UniverseRaceConst.LAYER_STATE_MAP
	elseif raceState == UniverseRaceConst.RACE_STATE_ING then
		local racePos = G_UserData:getUniverseRace():findSelfRacePosOfCurRound()
		if racePos > 0 then --找到了，说明在此轮正在参加比赛
			G_UserData:getUniverseRace():setCurWatchPos(racePos)
			self._curState = UniverseRaceConst.LAYER_STATE_BATTLE
		elseif G_UserData:getUniverseRace():getCurWatchPos() > 0 then --之前有跟看的比赛
			self._curState = UniverseRaceConst.LAYER_STATE_BATTLE
		else
			self._curState = UniverseRaceConst.LAYER_STATE_MAP
		end
	elseif raceState == UniverseRaceConst.RACE_STATE_CHAMPION_SHOW then
		self._curState = UniverseRaceConst.LAYER_STATE_CHAMPION
	else
		self._curState = UniverseRaceConst.LAYER_STATE_MAP --默认是进程图界面
	end
end

function UniverseRaceView:_updateView()
    self:_checkPopup()
	local layer = self._subLayers[self._curState]
	if layer == nil then
		if self._curState == UniverseRaceConst.LAYER_STATE_MAP then
			layer = UniverseRaceMapLayer.new()
		elseif self._curState == UniverseRaceConst.LAYER_STATE_BATTLE then
			layer = UniverseRaceBattleLayer.new(self)
		elseif self._curState == UniverseRaceConst.LAYER_STATE_CHAMPION then
			layer = UniverseRaceChampionLayer.new()
		elseif self._curState == UniverseRaceConst.LAYER_STATE_PAST_CHAMPION then
			layer = UniverseRacePastChampionLayer.new()
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
end

function UniverseRaceView:updateTitle()
	if self._curState == UniverseRaceConst.LAYER_STATE_PAST_CHAMPION then
		self._topbarBase:setImageTitle("txt_sys_lidaiguanjun")
	else
		self._topbarBase:setImageTitle("txt_sys_zhenwuzhanshen")
	end
end

function UniverseRaceView:_updateBGM()
	if self._curState == UniverseRaceConst.LAYER_STATE_MAP then
		G_AudioManager:playMusicWithId(AudioConst.SOUND_UNIVERSE_RACE_BGM)
	elseif self._curState == UniverseRaceConst.LAYER_STATE_BATTLE then
		G_AudioManager:playMusicWithId(AudioConst.SOUND_UNIVERSE_RACE_BGM)
	elseif self._curState == UniverseRaceConst.LAYER_STATE_CHAMPION then
		G_AudioManager:stopMusic(true)
		G_AudioManager:playSoundWithId(AudioConst.SOUND_UNIVERSE_RACE_CHAMPION_BGM)
	elseif self._curState == UniverseRaceConst.LAYER_STATE_PAST_CHAMPION then
		G_AudioManager:stopMusic(true)
		G_AudioManager:playSoundWithId(AudioConst.SOUND_UNIVERSE_RACE_CHAMPION_BGM)
	end
end

function UniverseRaceView:_onEventSwitchLayer(eventName, layerState, isAdd)
	self._curState = layerState
	local layerInfo = {state = self._curState}
	if isAdd then --加入队列，用于点返回时，退回到之前的界面
		table.insert(self._layerStates, layerInfo)
	else
		table.remove(self._layerStates, #self._layerStates)
		self._layerStates[#self._layerStates + 1] = layerInfo
	end
	self:_updateView()
end

function UniverseRaceView:_onEventPopupState(eventName, state)
	local curLayer = self._layerStates[#self._layerStates]
	local tempLayer = {state = curLayer.state, popupState = state}
	table.remove(self._layerStates, #self._layerStates)
	self._layerStates[#self._layerStates + 1] = tempLayer
end

--检测弹框是否开着，如果开着，关掉
function UniverseRaceView:_checkPopup()
	local curLayerInfo = self._layerStates[#self._layerStates]
	local popupState = curLayerInfo.popupState
	local popup1 = G_SceneManager:getRunningScene():getPopupByName("PopupUniverseRaceGuess")
	if popupState == "retain" then
		if popup1 == nil then
			popup1 = PopupUniverseRaceGuess.new()
			popup1:open()
		end
	else
		if popup1 then
			popup1:close()
		end
	end
	
	local popup2 = G_SceneManager:getRunningScene():getPopupByName("PopupUniverseRaceAward")
	if popup2 then
		popup2:close()
	end

	local popup3 = G_SceneManager:getRunningScene():getPopupByName("PopupUniverseRaceAwardPool")
	if popup3 then
		popup3:close()
	end
end

return UniverseRaceView