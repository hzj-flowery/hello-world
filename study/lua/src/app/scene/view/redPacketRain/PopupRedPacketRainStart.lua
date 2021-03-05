
--红包雨开始界面
local PopupBase = require("app.ui.PopupBase")
local PopupRedPacketRainStart = class("PopupRedPacketRainStart", PopupBase)

function PopupRedPacketRainStart:ctor(callbackStart, callbackQuit)
	self._callbackStart = callbackStart
	self._callbackQuit = callbackQuit

	local resource = {
		file = Path.getCSB("PopupRedPacketRainStart", "redPacketRain"),
		binding = {
			_buttonStart = {
				events = {{event = "touch", method = "_onClickStart"}}
			},
			_buttonQuit = {
				events = {{event = "touch", method = "_onClickQuit"}}
			},
		}
	}
	PopupRedPacketRainStart.super.ctor(self, resource)
end

function PopupRedPacketRainStart:onCreate()
	
end

function PopupRedPacketRainStart:_onClickStart()
	local ret = true
	if self._callbackStart then
		ret = self._callbackStart()
	end
	if ret then
		self:close()
	end
end

function PopupRedPacketRainStart:_onClickQuit()
	if self._callbackQuit then
		self._callbackQuit()
	end
	self:close()
end

return PopupRedPacketRainStart