
local PopupBase = require("app.ui.PopupBase")
local PopupUniverseRaceAwardPool = class("PopupUniverseRaceAwardPool", PopupBase)
local UniverseRaceAwardPoolCell = require("app.scene.view.universeRace.UniverseRaceAwardPoolCell")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")

function PopupUniverseRaceAwardPool:ctor()
	local resource = {
		file = Path.getCSB("PopupUniverseRaceAwardPool", "universeRace"),
		binding = {}
	}
	self:setName("PopupUniverseRaceAwardPool")
	PopupUniverseRaceAwardPool.super.ctor(self, resource)
end

function PopupUniverseRaceAwardPool:onCreate()
	self._nodeBg:addCloseEventListener(handler(self, self._onButtonClose))
	self._nodeBg:setTitle(Lang.get("universe_race_reward_pot_title"))

	self._listView:setTemplate(UniverseRaceAwardPoolCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupUniverseRaceAwardPool:onEnter()
    self._signalSyncGuessPot = G_SignalManager:add(SignalConst.EVENT_UNIVERSE_RACE_SYNC_GUESS_POT, handler(self, self._onEventSyncGuessPot))
    self:_updateList()
end

function PopupUniverseRaceAwardPool:onExit()
    self._signalSyncGuessPot:remove()
	self._signalSyncGuessPot = nil
end

function PopupUniverseRaceAwardPool:_updateList()
    local totalNum = G_UserData:getUniverseRace():getJackpot()
    self._labelNum:setString(totalNum)
    self._listDatas = UniverseRaceDataHelper.getGuessRewardPotList(totalNum)
	self._listView:clearAll()
    self._listView:resize(#self._listDatas)
end

function PopupUniverseRaceAwardPool:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._listDatas[index]
	if data then
		item:update(data.num, data.rate, index)
	end
end

function PopupUniverseRaceAwardPool:_onItemSelected(item, index)
	
end

function PopupUniverseRaceAwardPool:_onItemTouch(index, t)
	
end

function PopupUniverseRaceAwardPool:_onButtonClose()
    self:close()
end

function PopupUniverseRaceAwardPool:_onEventSyncGuessPot()
    self:_updateList()
end

return PopupUniverseRaceAwardPool