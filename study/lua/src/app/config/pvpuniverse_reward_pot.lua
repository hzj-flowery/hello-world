--pvpuniverse_reward_pot

-- key
local __key_map = {
  id = 1,    --id-int 
  rank_min = 2,    --排行区间上限-int 
  rank_max = 3,    --排行区间下限-int 
  award_rate = 4,    --奖金池瓜分比例-int 

}

-- data
local pvpuniverse_reward_pot = {
    _data = {
        [1] = {1,1,1,50,},
        [2] = {2,2,3,30,},
        [3] = {3,4,10,20,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pvpuniverse_reward_pot")
        return t._raw[__key_map[k]]
    end
}

-- 
function pvpuniverse_reward_pot.length()
    return #pvpuniverse_reward_pot._data
end

-- 
function pvpuniverse_reward_pot.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pvpuniverse_reward_pot.indexOf(index)
    if index == nil or not pvpuniverse_reward_pot._data[index] then
        return nil
    end

    return setmetatable({_raw = pvpuniverse_reward_pot._data[index]}, mt)
end

--
function pvpuniverse_reward_pot.get(id)
    
    return pvpuniverse_reward_pot.indexOf(__index_id[id])
        
end

--
function pvpuniverse_reward_pot.set(id, tkey, nvalue)
    local record = pvpuniverse_reward_pot.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function pvpuniverse_reward_pot.index()
    return __index_id
end

return pvpuniverse_reward_pot