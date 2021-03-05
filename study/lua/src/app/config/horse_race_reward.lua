--horse_race_reward

-- key
local __key_map = {
  id = 1,    --编号-int 
  type = 2,    --奖励类型-int 
  value = 3,    --奖励数值-int 
  type_1 = 4,    --奖励1type-int 
  value_1 = 5,    --奖励1value-int 
  size_1 = 6,    --奖励1size-int 
  type_2 = 7,    --奖励2type-int 
  value_2 = 8,    --奖励2value-int 
  size_2 = 9,    --奖励2size-int 

}

-- data
local horse_race_reward = {
    _data = {
        [1] = {1,1,5,5,28,2,0,0,0,},
        [2] = {2,1,10,5,28,10,0,0,0,},
        [3] = {3,1,25,5,28,20,6,97,1,},
        [4] = {4,1,50,5,28,40,6,97,2,},
        [5] = {5,1,75,5,28,50,6,97,3,},
        [6] = {6,1,100,5,28,70,6,97,4,},
        [7] = {11,2,100,5,28,5,0,0,0,},
        [8] = {12,2,500,5,28,30,0,0,0,},
        [9] = {13,2,1000,5,28,50,0,0,0,},
        [10] = {14,2,2000,5,28,70,6,97,1,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [11] = 7,
    [12] = 8,
    [13] = 9,
    [14] = 10,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in horse_race_reward")
        return t._raw[__key_map[k]]
    end
}

-- 
function horse_race_reward.length()
    return #horse_race_reward._data
end

-- 
function horse_race_reward.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function horse_race_reward.indexOf(index)
    if index == nil or not horse_race_reward._data[index] then
        return nil
    end

    return setmetatable({_raw = horse_race_reward._data[index]}, mt)
end

--
function horse_race_reward.get(id)
    
    return horse_race_reward.indexOf(__index_id[id])
        
end

--
function horse_race_reward.set(id, key, value)
    local record = horse_race_reward.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function horse_race_reward.index()
    return __index_id
end

return horse_race_reward