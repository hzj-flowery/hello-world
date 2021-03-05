local Attenuator = class("Attenuator")
local scheduler = require("cocos.framework.scheduler")

--
function Attenuator:ctor(target, fixed)
	self._target = target
	self._fixed = fixed or true
	local x, y =  self._target:getPosition()
	self._targetX = x
	self._targetY = y
	self._attenuating = false
	self._ampX = 4
	self._ampY = 4
	self._atteCoef = 0.4
	self._timeCoef = 0.05
	self._x = 0
	self._y = 0

	self._scheduler = nil
end

--
function Attenuator:start(ampX, ampY, atteCoef, timeCoef)
	if not self._fixed then
		if not self._attenuating then
			local x, y =  self._target:getPosition()
			self._targetX = x
			self._targetY = y
		end
	end

	self._ampX = ampX or 20
	self._ampY = ampY or 20
	self._atteCoef = atteCoef or 0.6
	self._timeCoef = timeCoef or 0.05

	self._x = self._ampX
	self._y = self._ampY

	if self._scheduler ~= nil then
		scheduler.unscheduleGlobal(self._scheduler)
		self._scheduler = nil
	end
	self._scheduler = scheduler.scheduleGlobal(handler(self, self.onAtteTimer), self._timeCoef)
end

--
function Attenuator:onAtteTimer(f)
	self._attenuating = true
	local y = self._y * self._atteCoef
	local x = self._y * self._atteCoef
	self._target:setPosition(self._targetX + x, self._targetY + y)

	self._x = -x
	self._y = -y

	if x < 0.01 and x > -0.01 and y < 0.01 and y > -0.01 then
		self._attenuating = false
		self._target:setPosition(self._targetX, self._targetY)
		scheduler.unscheduleGlobal(self._scheduler)
		self._scheduler = nil
	end
end

return Attenuator