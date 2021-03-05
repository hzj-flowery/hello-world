--guild_war_award

-- key
local __key_map = {
  id = 1,    --id-int 
  day_min = 2,    --开服天数min-int 
  day_max = 3,    --开服天数max-int 
  type_1 = 4,    --类型1-int 
  value_1 = 5,    --类型值1-int 
  size_1 = 6,    --数量1-int 
  type_2 = 7,    --类型2-int 
  value_2 = 8,    --类型值2-int 
  size_2 = 9,    --数量2-int 
  type_3 = 10,    --类型3-int 
  value_3 = 11,    --类型值3-int 
  size_3 = 12,    --数量3-int 
  type_4 = 13,    --类型4-int 
  value_4 = 14,    --类型值4-int 
  size_4 = 15,    --数量4-int 
  type_5 = 16,    --类型5-int 
  value_5 = 17,    --类型值5-int 
  size_5 = 18,    --数量5-int 
  type_6 = 19,    --类型6-int 
  value_6 = 20,    --类型值6-int 
  size_6 = 21,    --数量6-int 
  type_7 = 22,    --类型7-int 
  value_7 = 23,    --类型值7-int 
  size_7 = 24,    --数量7-int 
  type_8 = 25,    --类型8-int 
  value_8 = 26,    --类型值8-int 
  size_8 = 27,    --数量8-int 
  type_9 = 28,    --类型9-int 
  value_9 = 29,    --类型值9-int 
  size_9 = 30,    --数量9-int 
  type_10 = 31,    --类型10-int 
  value_10 = 32,    --类型值10-int 
  size_10 = 33,    --数量10-int 
  type_11 = 34,    --类型11-int 
  value_11 = 35,    --类型值11-int 
  size_11 = 36,    --数量11-int 
  type_12 = 37,    --类型12-int 
  value_12 = 38,    --类型值12-int 
  size_12 = 39,    --数量12-int 
  type_13 = 40,    --类型13-int 
  value_13 = 41,    --类型值13-int 
  size_13 = 42,    --数量13-int 

}

-- data
local guild_war_award = {
    _data = {
        [1] = {1,1,23,11,1313,1,11,1314,1,11,1224,1,11,1225,1,11,1227,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [2] = {2,24,999,11,1313,1,11,1314,1,11,1224,1,11,1225,1,11,1227,1,6,81,1,6,92,1,6,93,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_war_award")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_war_award.length()
    return #guild_war_award._data
end

-- 
function guild_war_award.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_war_award.indexOf(index)
    if index == nil or not guild_war_award._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_war_award._data[index]}, mt)
end

--
function guild_war_award.get(id)
    
    return guild_war_award.indexOf(__index_id[id])
        
end

--
function guild_war_award.set(id, key, value)
    local record = guild_war_award.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_war_award.index()
    return __index_id
end

return guild_war_award