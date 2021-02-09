--pvpuniverse_reward_guess

-- key
local __key_map = {
  id = 1,    --id-int 
  award_type_1 = 2,    --奖励类型1-int 
  award_value_1 = 3,    --奖励类型值1-int 
  award_size_1 = 4,    --奖励数量1-int 

}

-- data
local pvpuniverse_reward_guess = {
    _data = {
        [1] = {1,5,35,200,},
        [2] = {2,5,35,200,},
        [3] = {3,5,35,200,},
        [4] = {4,5,35,200,},
        [5] = {5,5,35,400,},
        [6] = {6,5,35,600,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pvpuniverse_reward_guess")
        return t._raw[__key_map[k]]
    end
}

-- 
function pvpuniverse_reward_guess.length()
    return #pvpuniverse_reward_guess._data
end

-- 
function pvpuniverse_reward_guess.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pvpuniverse_reward_guess.indexOf(index)
    if index == nil or not pvpuniverse_reward_guess._data[index] then
        return nil
    end

    return setmetatable({_raw = pvpuniverse_reward_guess._data[index]}, mt)
end

--
function pvpuniverse_reward_guess.get(id)
    
    return pvpuniverse_reward_guess.indexOf(__index_id[id])
        
end

--
function pvpuniverse_reward_guess.set(id, tkey, nvalue)
    local record = pvpuniverse_reward_guess.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function pvpuniverse_reward_guess.index()
    return __index_id
end

return pvpuniverse_reward_guess