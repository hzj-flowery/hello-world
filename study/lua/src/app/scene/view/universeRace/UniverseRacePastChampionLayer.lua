--
-- Author: Liangxu
-- Date: 2019-10-28
-- 
local ViewBase = require("app.ui.ViewBase")
local UniverseRacePastChampionLayer = class("UniverseRacePastChampionLayer", ViewBase)
local UniverseRacePastChampionCell = require("app.scene.view.universeRace.UniverseRacePastChampionCell")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local PopupUniverseRacePastChampion = require("app.scene.view.universeRace.PopupUniverseRacePastChampion")

function UniverseRacePastChampionLayer:ctor()
	local resource = {
		file = Path.getCSB("UniverseRacePastChampionLayer", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	UniverseRacePastChampionLayer.super.ctor(self, resource)
end

function UniverseRacePastChampionLayer:onCreate()
    self._listView:setTemplate(UniverseRacePastChampionCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function UniverseRacePastChampionLayer:onEnter()
	self._signalUniverseRaceGetWinner = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_GET_WINNER, handler(self, self._onEventUniverseRaceGetWinner))
	self._signalUniverseRaceGetWinnerDetail = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_GET_WINNER_DETAIL, handler(self, self._onEventUniverseRaceGetWinnerDetail))
end

function UniverseRacePastChampionLayer:onExit()
	self._signalUniverseRaceGetWinner:remove()
	self._signalUniverseRaceGetWinner = nil
	self._signalUniverseRaceGetWinnerDetail:remove()
    self._signalUniverseRaceGetWinnerDetail = nil
end

function UniverseRacePastChampionLayer:onShow()
	
end

function UniverseRacePastChampionLayer:onHide()
	
end

function UniverseRacePastChampionLayer:updateInfo()
	self._datas = {}
	self:_updateList()
	G_UserData:getUniverseRace():c2sGetUniverseRaceWiner()
end

function UniverseRacePastChampionLayer:_updateList()
	self._listView:clearAll()
    self._listView:resize(#self._datas)
end

function UniverseRacePastChampionLayer:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._datas[index]
	if data then
		item:update(data, index)
	end
end

function UniverseRacePastChampionLayer:_onItemSelected(item, index)
	
end

function UniverseRacePastChampionLayer:_onItemTouch(index, t)
	local index = index + t
	local data = self._datas[index]
	local actId = data:getAct_id()
	G_UserData:getUniverseRace():c2sGetUniverseRaceWinerDetail(actId)
end

function UniverseRacePastChampionLayer:_onEventUniverseRaceGetWinner(eventName)
	self._datas = G_UserData:getUniverseRace():getPastChampionList()
	self:_updateList()
end

function UniverseRacePastChampionLayer:_onEventUniverseRaceGetWinnerDetail(eventName, detailUser, actId)
	local championData = G_UserData:getUniverseRace():getPastChampionDataWithActId(actId)
	local popup = PopupUniverseRacePastChampion.new(detailUser, championData)
    popup:openWithAction()
end

return UniverseRacePastChampionLayer