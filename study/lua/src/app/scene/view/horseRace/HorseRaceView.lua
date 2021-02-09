local ViewBase = require("app.ui.ViewBase")
local HorseRaceView = class("HorseRaceView", ViewBase)

local HorseRaceMap = require("app.scene.view.horseRace.HorseRaceMap")
local HorseRaceConst = require("app.const.HorseRaceConst")

local AudioConst = require("app.const.AudioConst")

local percentFix = 0
local meterFix = 10

function HorseRaceView:ctor()
	self._raceMap = nil

	self._listenerHorseInfo = nil
	self._listenerHorceRace = nil

	self._runDistance = 0
	self._runPoint = 0

	self._percent = 0

    local resource = {
		file = Path.getCSB("HorseRaceView", "horseRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			-- _btnJump = {events = {{event = "touch", method = "_onJumpClick"}}},
		}
	}
	HorseRaceView.super.ctor(self, resource)
end

function HorseRaceView:onCreate()
	-- self._btnJump:addClickEventListenerEx(handler(self, self._onJumpClick), nil, 100)
	self._btnJump:addTouchEventListener(handler(self, self._onJumpClick))
	self._panelTouch:addTouchEventListener(handler(self, self._onJumpClick))
	self._raceMap = HorseRaceMap.new()
	self._nodeMap:addChild(self._raceMap)
	
	local textureList = {
		"img_runway_star.png",
		"img_runway_star1.png",
		"img_runway_star2.png",
		"img_runway_star3.png",
	}
	self._countDown:setTextureList(textureList)
	self:_initMatch()

end

function HorseRaceView:onEnter()
	if not FAKE_HORCE_RUN then 
		if G_UserData:getHorseRace():isExpired() then
			G_UserData:getHorseRace():c2sWarHorseRideInfo()
		end
	end


	G_AudioManager:playMusicWithId(AudioConst.MUSIC_HORSE_RACE)


	local popupStart = require("app.scene.view.horseRace.PopupHorseRaceNotice").new()
	popupStart:open()

	-- local popupHorseRaceEnd = require("app.scene.view.horseRace.PopupHorseRaceEnd").new(1000, 1000, {}, true)
	-- popupHorseRaceEnd:open()

	self._listenerHorseInfo = G_SignalManager:add(SignalConst.EVENT_HORSE_RACE_RIDE_INFO, handler(self, self._onEventHorseInfo))
	self._listenerHorseRide = G_SignalManager:add(SignalConst.EVENT_HORSE_RACE_RIDE_END, handler(self, self._onEventHorseRide))
	self._listenerHorseGameOver = G_SignalManager:add(SignalConst.EVENT_HORSE_GAME_OVER, handler(self, self._onEventHorseGameOver))
	self._listenerHorseGetPoint = G_SignalManager:add(SignalConst.EVENT_HORSE_GET_POINT, handler(self, self._onEventHorseGetPoint))
	self._listenerHorseMoveX = G_SignalManager:add(SignalConst.EVENT_HORSE_MOVE_X, handler(self, self._onEventHorseMoveX))
	self._listenerCountDown = G_SignalManager:add(SignalConst.EVENT_HORSE_COUNT_DOWN, handler(self, self._onEventCountDown))
	self._listenerRematch = G_SignalManager:add(SignalConst.EVENT_HORSE_REMATCH, handler(self, self._onEventRematch))
	self._listenerHorseRaceStart = G_SignalManager:add(SignalConst.EVENT_HORSE_RACE_TOKEN, handler(self, self._onEventHorseRaceToken))
end

function HorseRaceView:onExit()
	self._listenerHorseInfo:remove()
	self._listenerHorseInfo = nil

	self._listenerHorseRide:remove()
	self._listenerHorseRide = nil

	self._listenerHorseGameOver:remove()
	self._listenerHorseGameOver = nil

	self._listenerHorseGetPoint:remove()
	self._listenerHorseGetPoint = nil

	self._listenerHorseMoveX:remove()
	self._listenerHorseMoveX = nil

	self._listenerCountDown:remove()
	self._listenerCountDown = nil

	self._listenerRematch:remove()
	self._listenerRematch = nil

	self._listenerHorseRaceStart:remove()
	self._listenerHorseRaceStart = nil

	G_AudioManager:playMusicWithId(AudioConst.MUSIC_CITY)
end

function HorseRaceView:_initMatch()
	local manIndex = math.random(1, HorseRaceConst.MAP_COUNT)
	self._raceMap:resetMap(manIndex)
	self._imageNode:setPositionX(0)
	self._textPoint:setString(0)
	self._countDown:setVisible(false)
	self._percentBar:setPercent(percentFix)
	self._textPercent:setString("0%")
	self._textDistance:setString(0)
	self._percent = 0
end

function HorseRaceView:_onJumpClick(sender, state)
	if state == ccui.TouchEventType.began then
		G_SignalManager:dispatch(SignalConst.EVENT_HORSE_JUMP)
	end
end

function HorseRaceView:_onEventHorseInfo()

end

function HorseRaceView:_onEventHorseRide(eventName, award)
	-- SOUND_HORSE_RACE_SUMMARY
	-- G_AudioManager:playMusicWithId(AudioConst.SOUND_HORSE_RACE_SUMMARY)
	local popupHorseRaceEnd = require("app.scene.view.horseRace.PopupHorseRaceEnd").new(self._runDistance, self._runPoint, award, self._percent == 100)
	popupHorseRaceEnd:open()
end

function HorseRaceView:_onEventHorseGameOver(eventName, horsePosX, point)
	if FAKE_HORCE_RUN then
		self:_initMatch()
		self:_onEventCountDown()
		return 
	end

	local mapWidth = self._raceMap:getMapDistance()
	local percent = math.ceil(horsePosX/mapWidth*100)
	if percent > 100 then 
		percent = 100
	end
	self._runDistance = math.floor(horsePosX/meterFix)
	G_UserData:getHorseRace():c2sWarHorseRide(percent, point)
	self._percent = percent
end

function HorseRaceView:_onEventHorseGetPoint(eventName, point)
	self._textPoint:setString(point)
	self._runPoint = point
end

function HorseRaceView:_onEventHorseMoveX(eventName, horsePosX)
	local mapWidth = self._raceMap:getMapDistance()
	local percent = horsePosX/mapWidth
	self._textDistance:setString(math.floor(horsePosX/meterFix))
	local showPercent = math.floor(percent*100)
	if showPercent > 100 then 
		showPercent = 100
	end
	self._textPercent:setString(showPercent.."%")
	local width = self._percentBG:getContentSize().width
	local nodePos = width*percent
	if nodePos > width then 
		nodePos = width
	end
	self._imageNode:setPositionX(nodePos)
	self._percentBar:setPercent(percent*100+percentFix)
end

function HorseRaceView:_onEventCountDown()
	self._countDown:setVisible(true)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_COUNT)
	self._countDown:playAnimation(4, 1, function()
		G_SignalManager:dispatch(SignalConst.EVENT_HORSE_RACE_START)
	end)
	local scheduler = require("cocos.framework.scheduler")
	scheduler.performWithDelayGlobal(function()
		G_SignalManager:dispatch(SignalConst.EVENT_HORSE_START_ACTION)
	end, 3)
end

function HorseRaceView:_onEventHorseRaceToken()
	self:_onEventCountDown()
end



function HorseRaceView:_onEventRematch()
	self:_initMatch()
	G_UserData:getHorseRace():c2sWarHorseRideStart()
end


return HorseRaceView
