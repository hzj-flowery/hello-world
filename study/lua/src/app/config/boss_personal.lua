--boss_personal

-- key
local __key_map = {
  id = 1,    --id-int 
  personal_rank_min = 2,    --个人排名min-int 
  personal_rank_max = 3,    --个人排名max-int 
  reward_type1 = 4,    --奖励类型1-int 
  reward_value1 = 5,    --奖励类型值1-int 
  reward_size1 = 6,    --奖励数量1-int 
  reward_type2 = 7,    --奖励类型2-int 
  reward_value2 = 8,    --奖励类型值2-int 
  reward_size2 = 9,    --奖励数量2-int 

}

-- data
local boss_personal = {
    _data = {
        [1] = {1,1,1,5,13,2500,0,0,0,},
        [2] = {2,2,2,5,13,2000,0,0,0,},
        [3] = {3,3,3,5,13,1500,0,0,0,},
        [4] = {4,4,5,5,13,1200,0,0,0,},
        [5] = {5,6,10,5,13,1000,0,0,0,},
        [6] = {6,11,20,5,13,800,0,0,0,},
        [7] = {7,21,50,5,13,600,0,0,0,},
        [8] = {8,51,100,5,13,400,0,0,0,},
        [9] = {9,101,300,5,13,300,0,0,0,},
        [10] = {10,301,1000,5,13,200,0,0,0,},
        [11] = {11,1001,99999,5,13,100,0,0,0,},
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
        assert(__key_map[k], "cannot find " .. k .. " in boss_personal")
        return t._raw[__key_map[k]]
    end
}

-- 
function boss_personal.length()
    return #boss_personal._data
end

-- 
function boss_personal.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function boss_personal.indexOf(index)
    if index == nil or not boss_personal._data[index] then
        return nil
    end

    return setmetatable({_raw = boss_personal._data[index]}, mt)
end

--
function boss_personal.get(id)
    
    return boss_personal.indexOf(__index_id[id])
        
end

--
function boss_personal.set(id, key, value)
    local record = boss_personal.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function boss_personal.index()
    return __index_id
end

return boss_personal