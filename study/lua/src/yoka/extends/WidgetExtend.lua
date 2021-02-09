local Widget = ccui.Widget

--
function Widget.setClickSoundCallback(callback)
	Widget._clickSoundCallback = callback
end

--
function Widget:addTouchEventListenerEx(callback, sound_id)
	print("widget:addTouchEventListenerEx 1")
	self:addTouchEventListener(function(sender, state)
		--
		if Widget._clickSoundCallback then
			Widget._clickSoundCallback(soundID)
		end

		-- callback
		if callback ~= nil and type(callback) == "function" then
			callback(sender, state)
		end
	end)
end

--
function Widget:addClickEventListenerEx(callback, sound_id, delay)
	self._delayStamp = timer:getms()
	self._delaySec = delay or 500
	self:addClickEventListener(function(sender)
		local currStamp = timer:getms()
		if math.abs(currStamp - self._delayStamp) >= self._delaySec then
			--
			if Widget._clickSoundCallback then
				Widget._clickSoundCallback(soundID)
			end

			-- callback
			if callback ~= nil and type(callback) == "function" then
				callback(sender)
			end

			self._delayStamp = currStamp
		end
	end)
end