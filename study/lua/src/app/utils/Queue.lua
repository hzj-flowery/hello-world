-- 双向链表
-- capacity 容量  当超过容量时 push 会覆盖最早push进来的数据
-- capacity 超过容量之后 总体原则：保持最新的 丢弃老的
-- 用法 参考 单元测试例子 unitTest
-- options:
-- notReplace --不允许替换最早push进入的变量

local function newQueueNode(value)
	return {
		value = value,
		next = nil,
		last = nil
	}
end

local Queue = class("Queue")
function Queue:ctor(capacity, options)
	-- body
	self._capacity = capacity
	if capacity then
		assert(capacity > 0, " capacity must > 0 ")
	end
	self._size = 0 --大小
	self._head = nil
	self._end = nil
	self._options = options
end


function Queue:_checkCapacity()
	if self._capacity and self._size >= self._capacity then
		if self._options and self._options.notReplace then
			return true
		else
			self:pop()
		end
	end
	return false
end

function Queue:push(data)
	-- body
	if self:_checkCapacity() then
		return
	end
	local queueNode = newQueueNode(data)
	-- 正常push
	if not self._end then
		self._head = queueNode
		self._end = queueNode
		self._size = 1
	else

		self._end.next = queueNode
		queueNode.last = self._end
		self._end = queueNode
		self._size = self._size + 1
	end
	return true
end


function Queue:insert(index , data)
	if self:_checkCapacity() then
		return
	end

	if index > self._size then
		return self:push(data)
	end

	local queueNode = newQueueNode(data)

	if not self._end then
		self._head = queueNode
		self._end = queueNode
		self._size = 1
	else
		if index == 1 then
			self._head.last = queueNode
			queueNode.next = self._head
			self._head = queueNode
			self._size = self._size + 1
		else
			local count = 2
			local last = nil
			local temp = self._head.next
			while(temp)do
				if count == index then
					local last = temp.last
					assert(last ~= nil, "last is nil")
					last.next = queueNode
					queueNode.last = last
					queueNode.next = temp
					temp.last = queueNode
					self._size = self._size + 1
					break
				end
				count = count + 1
				temp = temp.next
			end
		end
	end
	return true
end

-- 弹出 头
function Queue:pop()
	-- body
	if self._head then
		local tHead = self._head
		self._head = tHead.next
		self._size = self._size - 1
		if not self._head then
			self._end = nil
		else
			self._head.last = nil
		end
		return tHead.value
	end
	return nil
end

-- 弹出 尾
function Queue:stack()
	if self._end then
		local t = self._end
		self._end = self._end.last
		self._size = self._size - 1
		if not self._end then
			self._head = nil
		else
			self._end.next = nil
		end
		return t.value
	end
	return nil
end

function Queue:size()
    return self._size
end

function Queue:clear()
	self._size = 0 --大小
	self._head = nil
	self._end = nil
end

function Queue:foreach(callback)
	local t = self._head
	while(t) do
		local isBreak = callback(t.value)
		if isBreak then
			break
		end
		t = t.next
	end
end

function Queue:getValueByIndex(i)
	local count = 1
	local t = self._head
	while(t) do
		if count == i then
			return t.value
		end
		t = t.next
		count = count + 1
	end
end

function Queue:setValueByIndex(i, value)
	local count = 1
	local t = self._head
	while(t) do
		if count == i then
			t.value = value
			return
		end
		t = t.next
		count = count + 1
	end
end

function Queue:removeValueByIndex(i)
	if i == 1 then
		return self:pop()
	elseif i == self._size then
		return self:stack()
	end

	local count = 2
	local t = self._head.next
	while(t) do
		if count == i then
			local lastNode = t.last
			local nextNode = t.next
			lastNode.next = nextNode
			nextNode.last = lastNode
			self._size = self._size - 1
			return
		end
		t = t.next
		count = count + 1
	end
end

-- --单元测试
local function unitTest()
	local function getVaule(q)
		local value = ""

		q:foreach(function(data)
			if value ~= "" then
				value = value.."-"
			end
			value = value..data
		end)
		return value
	end

	local q = Queue.new(5)
	local value = ""
	--push test
	q:push(1)
	q:push(2)
	q:push(3)
	assert(getVaule(q) == "1-2-3", "push test 1 fail value = "..getVaule(q))
	print("push test 1 success value = "..getVaule(q))
	q:push(4)
	q:push(5)
	assert(getVaule(q) == "1-2-3-4-5", "push test 2 fail value = "..getVaule(q))
	print("push test 2 success value = "..getVaule(q))
	--超过容量之后push
	q:push(6)
	assert(getVaule(q) == "2-3-4-5-6", "push test 3 fail value = "..getVaule(q))
	print("push test 3 success value = "..getVaule(q))
	--pop test
	q:pop()
	assert(getVaule(q) == "3-4-5-6", "pop test 1 fail value = "..getVaule(q))
	print("pop test 1 success value = "..getVaule(q))
	--pop
	q:pop()
	q:pop()
	assert(getVaule(q) == "5-6", "pop test 2 fail value = "..getVaule(q))
	print("pop test 2 success value = "..getVaule(q))
	q:clear()
	assert(getVaule(q) == "", "clear test  fail value = "..getVaule(q))
	print("clear test success value = "..getVaule(q))
	-- 步长超过容量 测试
	q:push(1)

	q:push(2)
	q:push(3)
	q:push(4)
	q:push(5)

	q:push(6) --size 超过 capacity
	q:push(7)
	q:push(8)
	q:push(9)
	q:push(10)
	q:push(11) --步长 超过 capacity 步长重置

	assert(getVaule(q) == "7-8-9-10-11", "step > capacity test 1 fail value = "..getVaule(q))
	print("step > capacity test 1 success value = "..getVaule(q))
	q:pop()
	assert(getVaule(q) == "8-9-10-11", "step > capacity test 2 fail value = "..getVaule(q))
	print("step > capacity test 2 success value = "..getVaule(q))
	q:push(12)
	assert(getVaule(q) == "8-9-10-11-12", "other test 1 fail value = "..getVaule(q))
	print("other test 1 success value = "..getVaule(q))
	q:push(13)
	assert(getVaule(q) == "9-10-11-12-13", "other test 2 fail value = "..getVaule(q))
	print("other test 2 success value = "..getVaule(q))
	q:push(14)
	assert(getVaule(q) == "10-11-12-13-14", "other test 3 fail value = "..getVaule(q))
	print("other test 3 success value = "..getVaule(q))
	q:pop()
	assert(getVaule(q) == "11-12-13-14", "other test 4 fail value = "..getVaule(q))
	print("other test 4 success value = "..getVaule(q))
	q:pop()
	assert(getVaule(q) == "12-13-14", "other test 5 fail value = "..getVaule(q))
	print("other test 5 success value = "..getVaule(q))
	q:pop()
	assert(getVaule(q) == "13-14", "other test 6 fail value = "..getVaule(q))
	print("other test 6 success value = "..getVaule(q))

	assert(q:size() == 2, "other test 7 fail value = "..q:size())
	print("other test 7 success size = "..q:size())

	local value  = q:pop()
	assert(value == 13, "other test 8 fail value = 13")
	print("other test 8 success value = "..getVaule(q))
	q:pop()
	assert(getVaule(q) == "", "other test 9 fail value = "..getVaule(q))
	print("other test 9 success value = "..getVaule(q))
	q:pop()
	q:pop()
	q:pop()
	assert(getVaule(q) == "", "other test 10 fail value = "..getVaule(q))
	print("other test 10 success value = "..getVaule(q))
	q:push(1)
	q:pop()
	q:push(2)
	local value3 = q:pop()
	assert(value3 == 2, "other test 11 fail value = "..2)
	print("other test 11 success value = 2")

	q:clear()
	q:push(3)
	q:insert(1, 1)
	q:insert(2, 2)
	assert(getVaule(q) == "1-2-3", "insert test 1 fail value = "..getVaule(q))
	print("insert test 1 success value = "..getVaule(q))
	q:insert(4, 4)
	q:insert(5, 5)
	assert(getVaule(q) == "1-2-3-4-5", "insert test 2 fail value = "..getVaule(q))
	print("insert test 2 success value = "..getVaule(q))
	q:insert(1, 0)
	print(getVaule(q))
	assert(getVaule(q) == "0-2-3-4-5", "insert test 3 fail value = "..getVaule(q))
	print("insert test 3 success value = "..getVaule(q))
	assert(q:size() == 5, "insert test 4 fail value = "..q:size())

	local vaule5 = q:stack()
	assert(vaule5 == 5, "stack test 1 fail value = "..vaule5)
	assert(q:size() == 4, "stack test 2 fail value = "..q:size())
	assert(getVaule(q) == "0-2-3-4", "stack test 3 fail value = "..getVaule(q))
	print("stack test 3 success value = "..getVaule(q))
	q:stack()
	q:stack()
	q:stack()
	assert(getVaule(q) == "0", "insert test 4 fail value = "..getVaule(q))
	print("stack test 4 success value = "..getVaule(q))
	q:stack()
	q:stack()
	q:stack()
	assert(getVaule(q) == "", "insert test 5 fail value = "..getVaule(q))
	print("stack test 5 success value = "..getVaule(q))

	q:clear()
	q:push(1)
	q:push(2)
	q:push(3)
	q:push(4)
	q:push(5)
	q:removeValueByIndex(1)
	print("============== ", getVaule(q))
	assert(getVaule(q) == "2-3-4-5", "removeValueByIndex test 1 fail value = "..getVaule(q))
	print("removeValueByIndex test 1 success value = "..getVaule(q))
	q:removeValueByIndex(4)
	assert(getVaule(q) == "2-3-4", "removeValueByIndex test 2 fail value = "..getVaule(q))
	print("removeValueByIndex test 2 success value = "..getVaule(q))
	q:removeValueByIndex(2)
	assert(getVaule(q) == "2-4", "removeValueByIndex test 3 fail value = "..getVaule(q))
	print("removeValueByIndex test 3 success value = "..getVaule(q))
	q:removeValueByIndex(1)
	assert(getVaule(q) == "4", "removeValueByIndex test 4 fail value = "..getVaule(q))
	print("removeValueByIndex test 4 success value = "..getVaule(q))
	q:removeValueByIndex(1)
	assert(getVaule(q) == "", "removeValueByIndex test 5 fail value = "..getVaule(q))
	print("removeValueByIndex test 5 success value = "..getVaule(q))
	assert(q:size() == 0, "removeValueByIndex test 6 fail value = "..q:size())

	q:push(1)
	q:push(2)
	q:push(3)
	q:push(4)
	q:push(5)
	assert(q:getValueByIndex(1) == 1, "getValueByIndex test 1 fail ")
	print("getValueByIndex test 1 success")
	assert(q:getValueByIndex(2) == 2, "getValueByIndex test 2 fail ")
	print("getValueByIndex test 2 success")
	assert(q:getValueByIndex(3) == 3, "getValueByIndex test 3 fail ")
	print("getValueByIndex test 3 success")
	assert(q:getValueByIndex(4) == 4, "getValueByIndex test 4 fail ")
	print("getValueByIndex test 4 success")
	assert(q:getValueByIndex(5) == 5, "getValueByIndex test 5 fail ")
	print("getValueByIndex test 5 success")
	assert(q:getValueByIndex(6) == nil, "getValueByIndex test 6 fail ")
	print("getValueByIndex test 6 success")
	assert(q:size() == 5, "getValueByIndex test 7 fail ")
	print("getValueByIndex test 7 success")

	q:setValueByIndex(1, 6)
	q:setValueByIndex(2, 7)
	q:setValueByIndex(3, 8)
	q:setValueByIndex(4, 9)
	q:setValueByIndex(5, 10)
	q:setValueByIndex(6, 11)
	assert(getVaule(q) == "6-7-8-9-10", "setValueByIndex test 1 fail value = "..getVaule(q))
	print("setValueByIndex test 1 success value = "..getVaule(q))
	assert(q:size() == 5, "setValueByIndex test 2 fail ")
	print("setValueByIndex test 2 success")
	print("unit test success")
end
-- unitTest()
--Queue.unitTest = unitTest


return Queue
