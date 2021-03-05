local LinkedList = class("LinkedList")

function LinkedList.node(data)
    return {data = data, next = nil, pre = nil}
end

function LinkedList:ctor()
    self._head = nil
    self._tail = nil
    self._count = 0
end

function LinkedList:count()
    return self._count
end

function LinkedList:addAtTail(node)
    local p = self._head
    if not p then
        self._head = node
        self._tail = node
        self._count = 1
    else
        node.pre = self._tail
        self._tail.next = node
        self._tail = node
        self._count = self._count + 1
    end
end

function LinkedList:addAtHead(node)
    if not self._head then
        self._head = node
        self._tail = node
        self._count = 1
        return
    end
    self._head.pre = node
    node.next = self._head
    self._head = node
    self._count = self._count + 1
end

--在第index个节点前添加
function LinkedList:addAtIndex(node, index)
    if index > self._count then
        self:addAtTail(node.data)
    elseif index <= 1 then
        self:addAtHead(node.data)
    else
        local i = 1
        local p = self._head
        local pre = self._head
        while i < index do
            pre = p
            p = p.next
            i = i + 1
        end
        node.next = p
        pre.next = node
        self._count = self._count + 1
    end
end

function LinkedList:get(index)
    local p = self._head
    if self._count == 0 or index > self._count or index <= 0 then
        return -1
    else
        local i = 1
        while i < index do
            p = p.next
            i = i + 1
        end
        return p.data
    end
end

function LinkedList:getFirst()
    return self._head
end

function LinkedList:getLast()
    return self._tail
end

function LinkedList:removeAtIndex(index)
    if index > self._count or index <= 0 then
        return -1
    end
    if index == 1 then
        self._head = self._head.next
        self._count = self._count - 1
        return
    end
    local p = self._head
    local pre = self._head
    local i = 1
    while i < index do
        pre = p
        p = p.next
        i = i + 1
    end
    pre.next = p.next
    p = nil
    self._count = self._count - 1
end

function LinkedList:remove(node)
    if self._count == 1 then
        self._head = nil
        self._tail = nil
        self._count = 0
        return
    end
    if not node.next then
        if node.pre then
            node.pre.next = nil
            self._tail = node.pre
            self._count = self._count - 1
        end
    elseif not node.pre then
        if node.next then
            node.next.pre = nil
            self._head = node.next
            self._count = self._count - 1
        end
    else
        node.pre.next = node.next
        node.next.pre = node.pre
        self._count = self._count - 1
    end
end

function LinkedList:filter(cond, proc)
    if not self._head then
        return
    end

    local p = self._head
    while p do
        if cond(p.data) then
            proc(p.data)
        end
        p = p.next
    end
end

function LinkedList:walkThrough(cb)
    if not self._head then
        return
    end

    local p = self._head
    while p do
        cb(p, p.data)
        p = p.next
    end
end

function LinkedList.test()
    local list = LinkedList.new()

    local a = {id = 1}
    local b = {id = 2}
    local c = {id = 3}
    local d = {id = 4}
    local e = {id = 5}
    local nodeA = LinkedList.node(a)
    local nodeB = LinkedList.node(b)
    local nodeC = LinkedList.node(c)
    local nodeD = LinkedList.node(d)
    local nodeE = LinkedList.node(e)
    list:addAtTail(nodeA)
    list:addAtTail(nodeB)
    list:addAtTail(nodeC)
    list:addAtTail(nodeD)
    list:addAtTail(nodeE)
    list:remove(nodeE)


    local function walk(node, data)
        print(data.id)
    end
    list:walkThrough(walk)

    local firstArrow = list:getFirst()
	while firstArrow do
		list:remove(firstArrow)
		firstArrow = list:getFirst()
	end

    local function walk(node, data)
        print(data.id)
    end
    list:walkThrough(walk)


    -- local function cond(data)
    --     return data.id > 1
    -- end    
    -- local function proc(data)
    --     print(data.id)
    -- end
    -- list:filter(cond, proc)

end
return LinkedList