local CampRaceLookNode = class("CampRaceLookNode")
local CampRaceConst = require("app.const.CampRaceConst")

function CampRaceLookNode:ctor(target, pos1, pos2, callback)
	self._target = target
	self._pos1 = pos1 --比赛双方位置1
	self._pos2 = pos2 --比赛双方位置2
	self._callback = callback
	self._state = 0

	self._imageBg = ccui.Helper:seekNodeByName(self._target, "ImageBg")
	self._imageBg:addClickEventListenerEx(handler(self, self._onClick))
	self._imageSign = ccui.Helper:seekNodeByName(self._target, "ImageSign")
end

function CampRaceLookNode:updateUI(state)
	self._state = state
	if state == CampRaceConst.MATCH_STATE_BEFORE then
		self._imageSign:loadTexture(Path.getCampImg("img_camp_player03c2"))
		self._imageBg:setTouchEnabled(false)
	elseif state == CampRaceConst.MATCH_STATE_ING then
		self._imageSign:loadTexture(Path.getCampImg("img_camp_player03c1"))
		self._imageBg:setTouchEnabled(true)
	elseif state == CampRaceConst.MATCH_STATE_AFTER then
		self._imageSign:loadTexture(Path.getCampImg("img_camp_player03c"))
		self._imageBg:setTouchEnabled(true)
	end
end

function CampRaceLookNode:_onClick()
	if self._callback then
		self._callback(self._pos1, self._pos2, self._state)
	end
end

return CampRaceLookNode