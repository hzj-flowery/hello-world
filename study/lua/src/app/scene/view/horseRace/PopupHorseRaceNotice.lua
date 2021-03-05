local PopupBase = require("app.ui.PopupBase")
local PopupHorseRaceNotice = class("PopupHorseRaceNotice", PopupBase)
local HorseRaceHelper = require("app.scene.view.horseRace.HorseRaceHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

function PopupHorseRaceNotice:ctor()
	local resource = {
		file = Path.getCSB("PopupHorseRaceNotice", "horseRace"),
		binding = {
            _btnStart = {
				events = {{event = "touch", method = "_onBtnStartClick"}}
			},
		}
	}
	PopupHorseRaceNotice.super.ctor(self, resource, false, false)
end


function PopupHorseRaceNotice:onCreate()
    self._popupBG:addCloseEventListener(handler(self, self._onCloseClick))
    self._popupBG:setTitle(Lang.get("horse_race_title"))
    self._btnStart:setString(Lang.get("horse_race_start"))
   
    local raceCount = G_UserData:getHorseRace():getRaceCount() + 1
    self._textRaceCount:setString(Lang.get("horse_race_count", {count = raceCount}))
    self._textGotToday:setString(Lang.get("horse_race_reward_title"))
    self._textTodayFull:setVisible(false)
end

function PopupHorseRaceNotice:onEnter()
    local soul = G_UserData:getHorseRace():getHorseSoul()
    self._reward1:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_HORSE_SOUL, soul)

    local book = G_UserData:getHorseRace():getHorseBook()
    self._reward2:updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS, book)


    local isFull = HorseRaceHelper.isRewardFull()
    self._textTodayFull:setVisible(isFull)

    self._listenerHorseRaceStart = G_SignalManager:add(SignalConst.EVENT_HORSE_RACE_TOKEN, handler(self, self._onEventHorseRaceToken))
end

function PopupHorseRaceNotice:onExit()
	self._listenerHorseRaceStart:remove()
	self._listenerHorseRaceStart = nil
end

function PopupHorseRaceNotice:_onBtnStartClick()
    -- G_SignalManager:dispatch(SignalConst.EVENT_HORSE_COUNT_DOWN)
    G_UserData:getHorseRace():c2sWarHorseRideStart()
end

function PopupHorseRaceNotice:_onEventHorseRaceToken()
	self:close()
end

function PopupHorseRaceNotice:_onCloseClick()
    G_SceneManager:popScene()
end


return PopupHorseRaceNotice



