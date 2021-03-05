local SlotList = class("SlotList")

SlotList.NIL = SlotList.new(nil, nil)
--
function SlotList:ctor(head, tail)
	if not head and not tail then
		self.nonEmpty = false
	elseif not head then
	else
		self.head = head
		self.tail = tail or SlotList.NIL
		self.nonEmpty = true
	end
end

--
function SlotList:getLength()
	if not self.nonEmpty then return 0 end
	if self.tail == SlotList.NIL then return 1 end

	local result = 0
	local p = self
	while p.nonEmpty do
		result = result + 1
		p = p.tail
	end

	return result
end

--
function SlotList:prepend(slot)
	return SlotList.new(slot, self)
end

--
function SlotList:append(slot)
	if not slot then return self end
	if not self.nonEmpty then return SlotList.new(slot) end

	if self.tail == SlotList.NIL then
		return SlotList.new(slot):prepend(self.head)
	end

	local wholeClone = SlotList.new(self.head)
	local subClone = wholeClone
	local current = self.tail

	while current.nonEmpty do
		local currentClone = SlotList.new(current.head)
		subClone.tail = currentClone
		subClone = currentClone
		current = current.tail
	end

	subClone.tail = SlotList.new(slot)
	return wholeClone
end

--
function SlotList:insertWithPriority(slot)
	if not self.nonEmpty then return SlotList.new(slot) end

	local priority = slot:getPriority()
	if priority > self.head:getPriority() then return self:prepend(slot) end

	local wholeClone = SlotList.new(self.head)
	local subClone = wholeClone
	local current = self.tail

	while current.nonEmpty do
		if priority > current.head:getPriority() then
			subClone.tail = current:prepend(slot)
			return wholeClone
		end
		local currentClone = SlotList.new(current.head)
		subClone.tail = currentClone
		subClone = currentClone
		current = current.tail
	end

	subClone.tail = SlotList.new(slot)
	return wholeClone
end

--
function SlotList:filterNot(listener)
	if not self.nonEmpty or listener == nil then return self end

	if listener == self.head:getListener() then return self.tail end

	local wholeClone = SlotList.new(self.head)
	local subClone = wholeClone
	local current = self.tail

	while current.nonEmpty do
		if current.head:getListener() == listener then
			subClone.tail = current.tail
			return wholeClone
		end
		local currentClone = SlotList.new(current.head)
		subClone.tail = currentClone
		subClone = currentClone
		current = current.tail
	end

	return self
end

--
function SlotList:contains(listener)
	if not self.nonEmpty then return false end

	local p = self
	while p.nonEmpty do
		if p.head:getListener() == listener then return true end
		p = p.tail
	end

	return false
end

--
function SlotList:find(listener)
	if not self.nonEmpty then return nil end

	local p = self
	while p.nonEmpty do
		if p.head:getListener() == listener then return p.head end
		p = p.tail
	end

	return nil
end



return SlotList