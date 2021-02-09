local OnceSignal = class("OnceSignal")
local SlotList = require("yoka.event.SlotList")
local Slot = require("yoka.event.Slot")
--
function OnceSignal:ctor(...)
	self._valueClasses = {...}
	self._slots = SlotList.NIL
end

--
function OnceSignal:getValueClasses()
	return self._valueClasses
end

--
function OnceSignal:setValueClasses(...)
	self._valueClasses = {...}
end

--
function OnceSignal:getListenersLength()
	return self._slots:getLength()
end

--
function OnceSignal:addOnce(listener)
	return self:registerListener(listener, true)
end

--
function OnceSignal:remove(listener)
	local slot = self._slots:find(listener)
	if not slot then return nil end

	self._slots = self._slots:filterNot(listener)
	return slot
end

--
function OnceSignal:removeAll()
	self._slots = SlotList.NIL
end

--
function OnceSignal:dispatch(...)
	local valueObjects = {...}

	--local valueClassesLength = #self._valueClasses
	--local valueObjectsLength = #valueObjects

	--[[assert(valueObjectsLength >= valueClassesLength, 
		'Incorrect number of arguments. Expected at least ' .. valueClassesLength .. 
		' but received ' .. valueObjectsLength .. '.')]]
	
	--[[for i=1,valueClassesLength do
		local c = false
		if type(self._valueClasses[i]) == "string" then
			c = type(valueObjects[i]) == self._valueClasses[i]
		elseif type(self._valueClasses[i]) == "table" and self._valueClasses[i].__cname ~= nil then
			c = valueObjects[i].__cname == nil and false or valueObjects[i].__cname == self._valueClasses[i].__cname
		end
		assert(c, 'Value object <' .. valueObjects[i] .. '> is not an instance of <' .. self._valueClasses[i] .. '>.')
	end]]

	local slotsToProcess = self._slots
	if slotsToProcess.nonEmpty then
		while slotsToProcess.nonEmpty do
			slotsToProcess.head:execute(valueObjects)
			slotsToProcess = slotsToProcess.tail
		end
	end
end

--
function OnceSignal:registerListener(listener, once)
	local newSlot = Slot.new(listener, self, once or false)
	self._slots = self._slots:prepend(newSlot)
	return newSlot
end



return OnceSignal