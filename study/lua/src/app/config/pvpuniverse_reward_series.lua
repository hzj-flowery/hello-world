--pvpuniverse_reward_series

-- key
local __key_map = {
  id = 1,    --id-int 
  award_type_1 = 2,    --奖励类型1-int 
  award_value_1 = 3,    --奖励类型值1-int 
  award_size_1 = 4,    --奖励数量1-int 

}

-- data
local pvpuniverse_reward_series = {
    _data = {
        [1] = {1,5,35,1600,},
        [2] = {2,5,35,1600,},
        [3] = {3,5,35,1600,},
        [4] = {4,5,35,1600,},
        [5] = {5,5,35,1600,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pvpuniverse_reward_series")
        return t._raw[__key_map[k]]
    end
}

-- 
function pvpuniverse_reward_series.length()
    return #pvpuniverse_reward_series._data
end

-- 
function pvpuniverse_reward_series.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pvpuniverse_reward_series.indexOf(index)
    if index == nil or not pvpuniverse_reward_series._data[index] then
        return nil
    end

    return setmetatable({_raw = pvpuniverse_reward_series._data[index]}, mt)
end

--
function pvpuniverse_reward_series.get(id)
    
    return pvpuniverse_reward_series.indexOf(__index_id[id])
        
end

--
function pvpuniverse_reward_series.set(id, tkey, nvalue)
    local record = pvpuniverse_reward_series.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function pvpuniverse_reward_series.index()
    return __index_id
end

return pvpuniverse_reward_series