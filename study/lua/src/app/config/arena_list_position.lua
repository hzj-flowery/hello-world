--arena_list_position

-- key
local __key_map = {
  position = 1,    --位置编号-int 
  position_x = 2,    --x轴坐标（像素）-int 
  position_y = 3,    --y轴坐标（像素）-int 

}

-- data
local arena_list_position = {
    _data = {
        [1] = {1,480,2542,},
        [2] = {2,270,2230,},
        [3] = {3,480,2185,},
        [4] = {4,255,1635,},
        [5] = {5,480,1590,},
        [6] = {6,250,1320,},
        [7] = {7,475,1250,},
        [8] = {8,270,975,},
        [9] = {9,475,930,},
        [10] = {10,235,650,},
        [11] = {11,470,600,},
    }
}

-- index
local __index_position = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in arena_list_position")
        return t._raw[__key_map[k]]
    end
}

-- 
function arena_list_position.length()
    return #arena_list_position._data
end

-- 
function arena_list_position.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function arena_list_position.indexOf(index)
    if index == nil or not arena_list_position._data[index] then
        return nil
    end

    return setmetatable({_raw = arena_list_position._data[index]}, mt)
end

--
function arena_list_position.get(position)
    
    return arena_list_position.indexOf(__index_position[position])
        
end

--
function arena_list_position.set(position, key, value)
    local record = arena_list_position.get(position)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function arena_list_position.index()
    return __index_position
end

return arena_list_position