
local ViewBase = require("app.ui.ViewBase")
local UniverseRaceGuessRankNode = class("UniverseRaceGuessRankNode", ViewBase)
local UniverseRaceGuessRankCell = require("app.scene.view.universeRace.UniverseRaceGuessRankCell")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local SchedulerHelper = require ("app.utils.SchedulerHelper")

function UniverseRaceGuessRankNode:ctor()
	local resource = {
		file = Path.getCSB("UniverseRaceGuessRankNode", "universeRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			
		},
	}
	UniverseRaceGuessRankNode.super.ctor(self, resource)
end

function UniverseRaceGuessRankNode:onCreate()
	self._isShow = false
	self._listData = {}
	self._awardTime = UniverseRaceDataHelper.getAwardTime()

	self._listView:setTemplate(UniverseRaceGuessRankCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function UniverseRaceGuessRankNode:onEnter()
	self._signalUniverseRaceSyncGuess = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SYNC_GUESS, handler(self, self._onEventRaceSyncGuess))
    self:_startCountDown()
end

function UniverseRaceGuessRankNode:onExit()
	self._signalUniverseRaceSyncGuess:remove()
	self._signalUniverseRaceSyncGuess = nil
    self:_stopCountDown()
end

function UniverseRaceGuessRankNode:setShow(show)
	self._isShow = show
end

function UniverseRaceGuessRankNode:updateInfo()
	self:_updateList()
	self:_updateMyRank()
end

function UniverseRaceGuessRankNode:_updateMyRank()
	local myRankData = G_UserData:getUniverseRace():getMyGuessRank()
	local rank = myRankData and myRankData:getRank() or Lang.get("universe_race_guess_rank_no_name")
	local count = myRankData and myRankData:getSource() or "0"
	self._textRank:setString(rank)
	self._textCount:setString(count)
end

function UniverseRaceGuessRankNode:_startCountDown()
    self:_stopCountDown()
    self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._updateCountDown), 1)
    self:_updateCountDown()
end

function UniverseRaceGuessRankNode:_stopCountDown()
    if self._scheduleHandler ~= nil then
        SchedulerHelper.cancelSchedule(self._scheduleHandler)
        self._scheduleHandler = nil
    end
end

function UniverseRaceGuessRankNode:_updateCountDown()
	local countDownTime = self._awardTime - G_ServerTime:getTime()
	if countDownTime >= 0 then
		local timeString = G_ServerTime:secToString(countDownTime)
        self._textCountDown:setString(timeString)
	end
end

function UniverseRaceGuessRankNode:_updateList()
	self._listData = G_UserData:getUniverseRace():getGuessRankList()
	self._listView:clearAll()
    self._listView:resize(#self._listData)
end

function UniverseRaceGuessRankNode:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._listData[index]
	if data then
		item:update(data, index)
	end
end

function UniverseRaceGuessRankNode:_onItemSelected(item, index)
	
end

function UniverseRaceGuessRankNode:_onItemTouch(index, t)
	
end

function UniverseRaceGuessRankNode:_onEventRaceSyncGuess(eventName)
	self:_updateList()
	self:_updateMyRank()
end

return UniverseRaceGuessRankNode