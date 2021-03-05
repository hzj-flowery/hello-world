--boss_legion

-- key
local __key_map = {
  id = 1,    --id-int 
  legion_rank_min = 2,    --军团排名min-int 
  legion_rank_max = 3,    --军团排名max-int 
  reward_type1 = 4,    --奖励类型1-int 
  reward_value1 = 5,    --奖励类型值1-int 
  reward_size1 = 6,    --奖励数量1-int 
  reward_type2 = 7,    --奖励类型2-int 
  reward_value2 = 8,    --奖励类型值2-int 
  reward_size2 = 9,    --奖励数量2-int 

}

-- data
local boss_legion = {
    _data = {
        [1] = {1,1,1,0,0,0,0,0,0,},
        [2] = {2,2,2,0,0,0,0,0,0,},
        [3] = {3,3,3,0,0,0,0,0,0,},
        [4] = {4,4,5,0,0,0,0,0,0,},
        [5] = {5,6,10,0,0,0,0,0,0,},
        [6] = {6,11,20,0,0,0,0,0,0,},
        [7] = {7,21,50,0,0,0,0,0,0,},
        [8] = {8,51,9999,0,0,0,0,0,0,},
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
    [7] = 7,
    [8] = 8,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in boss_legion")
        return t._raw[__key_map[k]]
    end
}

-- 
function boss_legion.length()
    return #boss_legion._data
end

-- 
function boss_legion.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function boss_legion.indexOf(index)
    if index == nil or not boss_legion._data[index] then
        return nil
    end

    return setmetatable({_raw = boss_legion._data[index]}, mt)
end

--
function boss_legion.get(id)
    
    return boss_legion.indexOf(__index_id[id])
        
end

--
function boss_legion.set(id, key, value)
    local record = boss_legion.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function boss_legion.index()
    return __index_id
end

return boss_legion