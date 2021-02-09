--pvppro_reward

-- key
local __key_map = {
  id = 1,    --奖励id-int 
  type_1 = 2,    --类型1-int 
  value_1 = 3,    --类型值1-int 
  size_1 = 4,    --数量1-int 
  type_2 = 5,    --类型2-int 
  value_2 = 6,    --类型值2-int 
  size_2 = 7,    --数量2-int 
  type_3 = 8,    --类型3-int 
  value_3 = 9,    --类型值3-int 
  size_3 = 10,    --数量3-int 
  type_4 = 11,    --类型4-int 
  value_4 = 12,    --类型值4-int 
  size_4 = 13,    --数量4-int 
  type_5 = 14,    --类型5-int 
  value_5 = 15,    --类型值5-int 
  size_5 = 16,    --数量5-int 
  type_6 = 17,    --类型6-int 
  value_6 = 18,    --类型值6-int 
  size_6 = 19,    --数量6-int 
  type_7 = 20,    --类型7-int 
  value_7 = 21,    --类型值7-int 
  size_7 = 22,    --数量7-int 
  type_8 = 23,    --类型8-int 
  value_8 = 24,    --类型值8-int 
  size_8 = 25,    --数量8-int 
  type_9 = 26,    --类型9-int 
  value_9 = 27,    --类型值9-int 
  size_9 = 28,    --数量9-int 
  type_10 = 29,    --类型10-int 
  value_10 = 30,    --类型值10-int 
  size_10 = 31,    --数量10-int 

}

-- data
local pvppro_reward = {
    _data = {
        [1] = {99,6,121,1,11,1314,1,11,1315,1,11,1313,1,11,1305,1,11,1302,1,11,1309,1,11,1310,1,11,1311,1,0,0,0,},
        [2] = {1,6,153,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [3] = {2,6,152,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [4] = {3,6,151,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [5] = {4,6,150,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [6] = {5,6,149,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
    }
}

-- index
local __index_id = {
    [1] = 2,
    [2] = 3,
    [3] = 4,
    [4] = 5,
    [5] = 6,
    [99] = 1,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pvppro_reward")
        return t._raw[__key_map[k]]
    end
}

-- 
function pvppro_reward.length()
    return #pvppro_reward._data
end

-- 
function pvppro_reward.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pvppro_reward.indexOf(index)
    if index == nil or not pvppro_reward._data[index] then
        return nil
    end

    return setmetatable({_raw = pvppro_reward._data[index]}, mt)
end

--
function pvppro_reward.get(id)
    
    return pvppro_reward.indexOf(__index_id[id])
        
end

--
function pvppro_reward.set(id, key, value)
    local record = pvppro_reward.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function pvppro_reward.index()
    return __index_id
end

return pvppro_reward