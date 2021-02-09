--pvpuniverse_guess_cost

-- key
local __key_map = {
  round = 1,    --轮次-int 
  guess = 2,    --竞猜类型-int 
  type = 3,    --消耗材料type-int 
  value = 4,    --消耗材料value-int 
  size = 5,    --消耗材料size-int 

}

-- data
local pvpuniverse_guess_cost = {
    _data = {
        [1] = {1,1,5,36,1,},
        [2] = {2,1,5,36,1,},
        [3] = {3,1,5,36,1,},
        [4] = {4,1,5,36,1,},
        [5] = {5,1,5,36,2,},
        [6] = {6,1,5,36,3,},
        [7] = {1,2,5,36,4,},
        [8] = {2,2,5,36,4,},
        [9] = {3,2,5,36,4,},
        [10] = {4,2,5,36,4,},
        [11] = {5,2,5,36,4,},
    }
}

-- index
local __index_round_guess = {
    ["1_1"] = 1,
    ["1_2"] = 7,
    ["2_1"] = 2,
    ["2_2"] = 8,
    ["3_1"] = 3,
    ["3_2"] = 9,
    ["4_1"] = 4,
    ["4_2"] = 10,
    ["5_1"] = 5,
    ["5_2"] = 11,
    ["6_1"] = 6,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pvpuniverse_guess_cost")
        return t._raw[__key_map[k]]
    end
}

-- 
function pvpuniverse_guess_cost.length()
    return #pvpuniverse_guess_cost._data
end

-- 
function pvpuniverse_guess_cost.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pvpuniverse_guess_cost.indexOf(index)
    if index == nil or not pvpuniverse_guess_cost._data[index] then
        return nil
    end

    return setmetatable({_raw = pvpuniverse_guess_cost._data[index]}, mt)
end

--
function pvpuniverse_guess_cost.get(round,guess)
    
    local k = round .. '_' .. guess
    return pvpuniverse_guess_cost.indexOf(__index_round_guess[k])
        
end

--
function pvpuniverse_guess_cost.set(round,guess, tkey, nvalue)
    local record = pvpuniverse_guess_cost.get(round,guess)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function pvpuniverse_guess_cost.index()
    return __index_round_guess
end

return pvpuniverse_guess_cost