--fairfight_reward

-- key
local __key_map = {
  id = 1,    --排名-int 
  award_type_1 = 2,    --奖励类型1-int 
  award_value_1 = 3,    --奖励类型值1-int 
  award_size_1 = 4,    --奖励数量1-int 
  award_type_2 = 5,    --奖励类型2-int 
  award_value_2 = 6,    --奖励类型值2-int 
  award_size_2 = 7,    --奖励数量2-int 
  award_type_3 = 8,    --奖励类型3-int 
  award_value_3 = 9,    --奖励类型值3-int 
  award_size_3 = 10,    --奖励数量3-int 
  bet = 11,    --投注成功获得元宝-int 

}

-- data
local fairfight_reward = {
    _data = {
        [1] = {1,5,1,75000,0,0,0,0,0,0,100,},
        [2] = {4,5,1,60000,0,0,0,0,0,0,75,},
        [3] = {8,5,1,50000,0,0,0,0,0,0,50,},
        [4] = {16,5,1,16166,0,0,0,0,0,0,50,},
        [5] = {32,5,1,16083,0,0,0,0,0,0,50,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [16] = 4,
    [32] = 5,
    [4] = 2,
    [8] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in fairfight_reward")
        return t._raw[__key_map[k]]
    end
}

-- 
function fairfight_reward.length()
    return #fairfight_reward._data
end

-- 
function fairfight_reward.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function fairfight_reward.indexOf(index)
    if index == nil or not fairfight_reward._data[index] then
        return nil
    end

    return setmetatable({_raw = fairfight_reward._data[index]}, mt)
end

--
function fairfight_reward.get(id)
    
    return fairfight_reward.indexOf(__index_id[id])
        
end

--
function fairfight_reward.set(id, key, value)
    local record = fairfight_reward.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function fairfight_reward.index()
    return __index_id
end

return fairfight_reward