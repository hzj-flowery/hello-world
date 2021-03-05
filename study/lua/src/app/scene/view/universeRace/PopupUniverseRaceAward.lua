--
-- Author: Liangxu
-- Date: 2019-10-28
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupUniverseRaceAward = class("PopupUniverseRaceAward", PopupBase)
local UniverseRaceAwardCell = require("app.scene.view.universeRace.UniverseRaceAwardCell")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")

function PopupUniverseRaceAward:ctor()
	local resource = {
		file = Path.getCSB("PopupUniverseRaceAward", "universeRace"),
		binding = {}
	}
	self:setName("PopupUniverseRaceAward")
	PopupUniverseRaceAward.super.ctor(self, resource)
end

function PopupUniverseRaceAward:onCreate()
	self._nodeBg:addCloseEventListener(handler(self, self._onButtonClose))
	self._nodeBg:setTitle(Lang.get("universe_race_award_title"))

	self._listView:setTemplate(UniverseRaceAwardCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupUniverseRaceAward:onEnter()
    self:_updateList()
end

function PopupUniverseRaceAward:onExit()
    
end

function PopupUniverseRaceAward:_updateList()
    self._listDatas = UniverseRaceDataHelper.getRewardList()
	self._listView:clearAll()
    self._listView:resize(#self._listDatas)
end

function PopupUniverseRaceAward:_onItemUpdate(item, index)
	local index = index + 1
	local data = self._listDatas[index]
	if data then
		item:update(data, index)
	end
end

function PopupUniverseRaceAward:_onItemSelected(item, index)
	
end

function PopupUniverseRaceAward:_onItemTouch(index, t)
	
end

function PopupUniverseRaceAward:_onButtonClose()
    self:close()
end

return PopupUniverseRaceAward