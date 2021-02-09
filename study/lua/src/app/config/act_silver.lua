--act_silver

-- key
local __key_map = {
  count = 1,    --点金次数-int 
  cost = 2,    --消耗元宝-int 
  basic_silver = 3,    --基础银币-int 

}

-- data
local act_silver = {
    _data = {
        [1] = {0,0,25000,},
        [2] = {1,20,25000,},
        [3] = {2,20,25000,},
        [4] = {3,20,25000,},
        [5] = {4,20,25000,},
        [6] = {5,20,25000,},
        [7] = {6,20,25000,},
        [8] = {7,20,25000,},
        [9] = {8,20,25000,},
        [10] = {9,20,25000,},
        [11] = {10,20,25000,},
        [12] = {11,20,25000,},
        [13] = {12,20,25000,},
        [14] = {13,20,25000,},
        [15] = {14,20,25000,},
        [16] = {15,20,25000,},
        [17] = {16,20,25000,},
        [18] = {17,20,25000,},
        [19] = {18,20,25000,},
        [20] = {19,20,25000,},
        [21] = {20,20,25000,},
        [22] = {21,20,25000,},
        [23] = {22,20,25000,},
        [24] = {23,20,25000,},
        [25] = {24,20,25000,},
        [26] = {25,20,25000,},
        [27] = {26,20,25000,},
        [28] = {27,20,25000,},
        [29] = {28,20,25000,},
        [30] = {29,20,25000,},
        [31] = {30,20,25000,},
    }
}

-- index
local __index_count = {
    [0] = 1,
    [1] = 2,
    [10] = 11,
    [11] = 12,
    [12] = 13,
    [13] = 14,
    [14] = 15,
    [15] = 16,
    [16] = 17,
    [17] = 18,
    [18] = 19,
    [19] = 20,
    [2] = 3,
    [20] = 21,
    [21] = 22,
    [22] = 23,
    [23] = 24,
    [24] = 25,
    [25] = 26,
    [26] = 27,
    [27] = 28,
    [28] = 29,
    [29] = 30,
    [3] = 4,
    [30] = 31,
    [4] = 5,
    [5] = 6,
    [6] = 7,
    [7] = 8,
    [8] = 9,
    [9] = 10,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in act_silver")
        return t._raw[__key_map[k]]
    end
}

-- 
function act_silver.length()
    return #act_silver._data
end

-- 
function act_silver.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function act_silver.indexOf(index)
    if index == nil or not act_silver._data[index] then
        return nil
    end

    return setmetatable({_raw = act_silver._data[index]}, mt)
end

--
function act_silver.get(count)
    
    return act_silver.indexOf(__index_count[count])
        
end

--
function act_silver.set(count, key, value)
    local record = act_silver.get(count)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function act_silver.index()
    return __index_count
end

return act_silver