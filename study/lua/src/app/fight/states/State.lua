local State = class("State")

--
function State:ctor(entity)
	self._finish = false
	self._start = false
	self._entity = entity
	self._actor = entity:getActor()
    self._bShowName = true
end

--
function State:start()
	self._entity.updateShadow = true
	if self._entity.isPet then 
		self._entity:showBillBoard(false)
	else
		if self._entity.inCombineWatcher then
			self._entity:showBillBoard(false)
		else
            self._entity:showBillBoard(self._bShowName)
		end
	end
	self._finish = false
	self._start = true
	if self.__cname ~= "StateIdle" then
		if self._entity.showIdle2Effect then
			self._entity:showIdle2Effect(false)
		end
	end
	if self.__cname == "StateIdle" or self.__cname == "StateBuff" or self.__cname == "StateWin" then
	else
		if self._entity.stopTalk then
			self._entity:stopTalk()
		end
	end
end

--
function State:stop()
	self._start = false
end

--
function State:isStart()
	return self._start
end

--
function State:isFinish()
	return self._finish
end

--
function State:update(f)

end

--
function State:updateFrame(f)
	
end

--
function State:onFinish()
	self._finish = true
end


return State