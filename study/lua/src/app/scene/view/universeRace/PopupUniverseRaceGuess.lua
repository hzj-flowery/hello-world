--
-- Author: Liangxu
-- Date: 2019-10-28
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupUniverseRaceGuess = class("PopupUniverseRaceGuess", PopupBase)
local UniverseRaceGuessNode = require("app.scene.view.universeRace.UniverseRaceGuessNode")
local UniverseRaceGuessMultipleNode = require("app.scene.view.universeRace.UniverseRaceGuessMultipleNode")
local UniverseRaceGuessResultNode = require("app.scene.view.universeRace.UniverseRaceGuessResultNode")
local UniverseRaceGuessResultMultipleNode = require("app.scene.view.universeRace.UniverseRaceGuessResultMultipleNode")
local UniverseRaceGuessRankNode = require("app.scene.view.universeRace.UniverseRaceGuessRankNode")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")

function PopupUniverseRaceGuess:ctor(index)
	self._selectTabIndex = index or UniverseRaceConst.GUESS_TAB_1

	local resource = {
		file = Path.getCSB("PopupUniverseRaceGuess", "universeRace"),
		binding = {}
	}
	self:setName("PopupUniverseRaceGuess")
	PopupUniverseRaceGuess.super.ctor(self, resource)
end

function PopupUniverseRaceGuess:onCreate()
	self:_initData()
	self:_initView()
end

function PopupUniverseRaceGuess:_initData()
	self._subNodes = {}
	self._curNode = nil
end

function PopupUniverseRaceGuess:_initView()
	self._nodeBg:addCloseEventListener(handler(self, self._onButtonClose))
	self._nodeBg:setTitle(Lang.get("universe_race_guess_title"))
	self._nodeHelp:updateLangName("universe_race_guess_rule")

	local tabNameList = {}
	for i = UniverseRaceConst.GUESS_TAB_1, UniverseRaceConst.GUESS_TAB_5 do
		table.insert(tabNameList, Lang.get("universe_race_guess_tab_title_"..i))
	end

	local param = {
		isVertical = 2,
		callback = handler(self, self._onTabSelect),
		textList = tabNameList,
	}

	self._tabGroup:recreateTabs(param)
end

function PopupUniverseRaceGuess:onEnter()
	self._signalUniverseRaceSupportSuccess = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SUPPORT_SUCCESS, handler(self, self._onEventRaceSupportSuccess))

	self._tabGroup:setTabIndex(self._selectTabIndex)
	self:_updateView()
	self:_updateSingleRP()
	self:_updateMutipleRP()
end

function PopupUniverseRaceGuess:onExit()
	self._signalUniverseRaceSupportSuccess:remove()
    self._signalUniverseRaceSupportSuccess = nil
end

function PopupUniverseRaceGuess:onClose()
	G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_POPUP_STATE, nil)
end

function PopupUniverseRaceGuess:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateView()
end

function PopupUniverseRaceGuess:_updateView()
	self._curNode = self._subNodes[self._selectTabIndex]
	if self._curNode == nil then
		if self._selectTabIndex == UniverseRaceConst.GUESS_TAB_1 then
			self._curNode = UniverseRaceGuessNode.new(handler(self, self._onLookBattle))
		elseif self._selectTabIndex == UniverseRaceConst.GUESS_TAB_2 then
			self._curNode = UniverseRaceGuessMultipleNode.new(handler(self, self._onLookBattle))
		elseif self._selectTabIndex == UniverseRaceConst.GUESS_TAB_3 then
			self._curNode = UniverseRaceGuessResultNode.new()
		elseif self._selectTabIndex == UniverseRaceConst.GUESS_TAB_4 then
			self._curNode = UniverseRaceGuessResultMultipleNode.new()
		elseif self._selectTabIndex == UniverseRaceConst.GUESS_TAB_5 then
			self._curNode = UniverseRaceGuessRankNode.new()
		end
		if self._curNode then
			self._nodeContent:addChild(self._curNode)
			self._subNodes[self._selectTabIndex] = self._curNode
		end
	end
	for index, node in pairs(self._subNodes) do
		node:setVisible(false)
		node:setShow(false)
	end
	self._curNode:setVisible(true)
	self._curNode:setShow(true)
	self._curNode:updateInfo()
end

function PopupUniverseRaceGuess:_onButtonClose()
    self:close()
end

function PopupUniverseRaceGuess:_onLookBattle(pos)
	if UniverseRaceDataHelper.checkCanGuess() == false then
		G_Prompt:showTip(Lang.get("universe_race_guess_can_not_tip"))
		return
	end
	local state = G_UserData:getUniverseRace():getReportStateWithPosition(pos)
	if state == UniverseRaceConst.MATCH_STATE_AFTER then --比完了
		G_Prompt:showTip(Lang.get("universe_race_battle_finish"))
		return
	end
	if state == UniverseRaceConst.MATCH_STATE_ING then --比赛中
		G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_POPUP_STATE, "retain")
		
		G_UserData:getUniverseRace():setCurWatchPos(pos)
		G_SignalManager:dispatch(SignalConst.EVENT_UNIVERSE_RACE_SWITCH_LAYER, UniverseRaceConst.LAYER_STATE_BATTLE, true)
	end
end

function PopupUniverseRaceGuess:_updateSingleRP()
	local round = G_UserData:getUniverseRace():getNow_round()
	local show = UniverseRaceDataHelper.isCanSingleSupportWithRound(round)
	
	self._tabGroup:setRedPointByTabIndex(UniverseRaceConst.GUESS_TAB_1, show)
end

function PopupUniverseRaceGuess:_updateMutipleRP()
	local round = G_UserData:getUniverseRace():getNow_round()
	local show = UniverseRaceDataHelper.isCanMutipleSupportWithRound(round)
	
	self._tabGroup:setRedPointByTabIndex(UniverseRaceConst.GUESS_TAB_2, show)
end

function PopupUniverseRaceGuess:_onEventRaceSupportSuccess(eventName, isSingle)
	if isSingle then
		self:_updateSingleRP()
	else
		self:_updateMutipleRP()
	end
end

return PopupUniverseRaceGuess