--boss_award

-- key
local __key_map = {
  id = 1,    --id-int 
  day_min = 2,    --开服天数min-int 
  day_max = 3,    --开服天数max-int 
  reward_type_1 = 4,    --奖励类型1-int 
  reward_type_2 = 5,    --奖励类型2-int 
  reward_type_3 = 6,    --奖励类型3-int 
  reward_type_4 = 7,    --奖励类型4-int 
  type_1 = 8,    --类型1-int 
  value_1 = 9,    --类型值1-int 
  size_1 = 10,    --数量1-int 
  type_2 = 11,    --类型2-int 
  value_2 = 12,    --类型值2-int 
  size_2 = 13,    --数量2-int 
  type_3 = 14,    --类型3-int 
  value_3 = 15,    --类型值3-int 
  size_3 = 16,    --数量3-int 
  type_4 = 17,    --类型4-int 
  value_4 = 18,    --类型值4-int 
  size_4 = 19,    --数量4-int 
  type_5 = 20,    --类型5-int 
  value_5 = 21,    --类型值5-int 
  size_5 = 22,    --数量5-int 

}

-- data
local boss_award = {
    _data = {
        [1] = {1,1,2,2,3,0,0,6,23,1,0,0,0,0,0,0,0,0,0,0,0,0,},
        [2] = {2,3,3,2,3,0,0,6,24,1,6,23,1,0,0,0,0,0,0,0,0,0,},
        [3] = {3,4,6,2,3,4,0,6,24,1,6,23,1,0,0,0,0,0,0,0,0,0,},
        [4] = {4,7,13,2,4,101,102,6,24,1,0,0,0,0,0,0,0,0,0,0,0,0,},
        [5] = {5,14,26,2,4,101,102,6,25,1,6,500,1,0,0,0,0,0,0,0,0,0,},
        [6] = {6,27,39,2,4,101,102,6,25,1,6,501,1,0,0,0,0,0,0,0,0,0,},
        [7] = {7,40,48,2,4,101,102,6,26,1,6,501,1,0,0,0,0,0,0,0,0,0,},
        [8] = {8,49,84,2,4,101,102,6,26,1,6,502,1,0,0,0,0,0,0,0,0,0,},
        [9] = {9,85,117,2,4,101,102,6,26,1,6,503,1,0,0,0,0,0,0,0,0,0,},
        [10] = {10,118,147,2,4,101,102,6,27,1,6,503,1,0,0,0,0,0,0,0,0,0,},
        [11] = {11,148,999,2,4,101,102,6,27,1,6,504,1,0,0,0,0,0,0,0,0,0,},
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
        assert(__key_map[k], "cannot find " .. k .. " in boss_award")
        return t._raw[__key_map[k]]
    end
}

-- 
function boss_award.length()
    return #boss_award._data
end

-- 
function boss_award.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function boss_award.indexOf(index)
    if index == nil or not boss_award._data[index] then
        return nil
    end

    return setmetatable({_raw = boss_award._data[index]}, mt)
end

--
function boss_award.get(id)
    
    return boss_award.indexOf(__index_id[id])
        
end

--
function boss_award.set(id, key, value)
    local record = boss_award.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function boss_award.index()
    return __index_id
end

return boss_award