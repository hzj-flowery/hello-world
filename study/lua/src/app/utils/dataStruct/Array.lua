local Array = class("Array")

function Array:ctor()
    self._array = {}
end

function Array:push(data)
    table.insert(self._array, data)
end

function Array:pop(data)
    table.remove(self._array)
end

-- 1 2 3 4 5
-- get(-1) 5
-- get(2) 2
function Array:get(index)
    if index < 0 then
        index = #self._array - (-1 * index) + 1
    end
    return self._array[index]
end

function Array:set(index, data)
    if index < 0 then
        index = #self._array - (-1 * index) + 1
    end
    self._array[index] = data
end

function Array:walkThrough(cb)
    for i = 1, #self._array do
        cb(self._array[i])
    end
end

function Array.test()
    local array = Array.new()
    array:push(1)
    array:push(2)
    array:push(3)
    print(array:get(-1))
    array:set(-2, 6)

    local function walk(data)
        print(data)
    end
    array:walkThrough(walk)
end

return Array