--answer_rank_reward

-- key
local __key_map = {
  id = 1,    --id-int 
  answer_rank_min = 2,    --军团排名min-int 
  answer_rank_max = 3,    --军团排名max-int 
  reward_type1 = 4,    --奖励类型1-int 
  reward_value1 = 5,    --奖励类型值1-int 
  reward_size1 = 6,    --奖励数量1-int 
  reward_type2 = 7,    --奖励类型2-int 
  reward_value2 = 8,    --奖励类型值2-int 
  reward_size2 = 9,    --奖励数量2-int 

}

-- data
local answer_rank_reward = {
    _data = {
        [1] = {1,1,1,5,13,1000,0,0,0,},
        [2] = {2,2,5,5,13,800,0,0,0,},
        [3] = {3,6,10,5,13,600,0,0,0,},
        [4] = {4,11,50,5,13,400,0,0,0,},
        [5] = {5,51,9999,5,13,200,0,0,0,},
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
        assert(__key_map[k], "cannot find " .. k .. " in answer_rank_reward")
        return t._raw[__key_map[k]]
    end
}

-- 
function answer_rank_reward.length()
    return #answer_rank_reward._data
end

-- 
function answer_rank_reward.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function answer_rank_reward.indexOf(index)
    if index == nil or not answer_rank_reward._data[index] then
        return nil
    end

    return setmetatable({_raw = answer_rank_reward._data[index]}, mt)
end

--
function answer_rank_reward.get(id)
    
    return answer_rank_reward.indexOf(__index_id[id])
        
end

--
function answer_rank_reward.set(id, key, value)
    local record = answer_rank_reward.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function answer_rank_reward.index()
    return __index_id
end

return answer_rank_reward