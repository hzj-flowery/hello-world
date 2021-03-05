--cross_boss_reward_personal

-- key
local __key_map = {
  id = 1,    --id-int 
  personal_rank_min = 2,    --个人排名min-int 
  personal_rank_max = 3,    --个人排名max-int 
  reward_type1 = 4,    --奖励类型1-int 
  reward_value1 = 5,    --奖励类型值1-int 
  reward_size1 = 6,    --奖励数量1-int 

}

-- data
local cross_boss_reward_personal = {
    _data = {
        [1] = {1,1,1,5,13,5000,},
        [2] = {2,2,2,5,13,4000,},
        [3] = {3,3,3,5,13,3000,},
        [4] = {4,4,5,5,13,2400,},
        [5] = {5,6,10,5,13,2000,},
        [6] = {6,11,20,5,13,1600,},
        [7] = {7,21,50,5,13,1200,},
        [8] = {8,51,100,5,13,800,},
        [9] = {9,101,300,5,13,600,},
        [10] = {10,301,1000,5,13,400,},
        [11] = {11,1001,99999,5,13,200,},
    }
}

-- index
local __index_id = {
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
        assert(__key_map[k], "cannot find " .. k .. " in cross_boss_reward_personal")
        return t._raw[__key_map[k]]
    end
}

-- 
function cross_boss_reward_personal.length()
    return #cross_boss_reward_personal._data
end

-- 
function cross_boss_reward_personal.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function cross_boss_reward_personal.indexOf(index)
    if index == nil or not cross_boss_reward_personal._data[index] then
        return nil
    end

    return setmetatable({_raw = cross_boss_reward_personal._data[index]}, mt)
end

--
function cross_boss_reward_personal.get(id)
    
    return cross_boss_reward_personal.indexOf(__index_id[id])
        
end

--
function cross_boss_reward_personal.set(id, tkey, nvalue)
    local record = cross_boss_reward_personal.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function cross_boss_reward_personal.index()
    return __index_id
end

return cross_boss_reward_personal