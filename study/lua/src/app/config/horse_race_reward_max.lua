--horse_race_reward_max

-- key
local __key_map = {
  id = 1,    --编号-int 
  type = 2,    --奖励type-int 
  value = 3,    --奖励value-int 
  size = 4,    --奖励size上限-int 

}

-- data
local horse_race_reward_max = {
    _data = {
        [1] = {1,5,28,150,},
        [2] = {2,6,97,5,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in horse_race_reward_max")
        return t._raw[__key_map[k]]
    end
}

-- 
function horse_race_reward_max.length()
    return #horse_race_reward_max._data
end

-- 
function horse_race_reward_max.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function horse_race_reward_max.indexOf(index)
    if index == nil or not horse_race_reward_max._data[index] then
        return nil
    end

    return setmetatable({_raw = horse_race_reward_max._data[index]}, mt)
end

--
function horse_race_reward_max.get(id)
    
    return horse_race_reward_max.indexOf(__index_id[id])
        
end

--
function horse_race_reward_max.set(id, key, value)
    local record = horse_race_reward_max.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function horse_race_reward_max.index()
    return __index_id
end

return horse_race_reward_max