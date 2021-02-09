--guild_cross_war_award

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
local guild_cross_war_award = {
    _data = {
        [1] = {1,30,59,11,1406,1,11,1407,1,11,1408,1,6,555,1,6,556,1,6,721,1,6,722,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [2] = {2,60,119,11,1406,1,11,1407,1,11,1408,1,6,555,1,6,556,1,6,721,1,6,722,1,6,706,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [3] = {3,120,9999,11,1406,1,11,1407,1,11,1408,1,6,555,1,6,556,1,6,721,1,6,722,1,7,140001,1,14,101,1,14,102,1,14,103,1,14,104,1,6,706,1,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in guild_cross_war_award")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_cross_war_award.length()
    return #guild_cross_war_award._data
end

-- 
function guild_cross_war_award.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_cross_war_award.indexOf(index)
    if index == nil or not guild_cross_war_award._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_cross_war_award._data[index]}, mt)
end

--
function guild_cross_war_award.get(id)
    
    return guild_cross_war_award.indexOf(__index_id[id])
        
end

--
function guild_cross_war_award.set(id, tkey, nvalue)
    local record = guild_cross_war_award.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function guild_cross_war_award.index()
    return __index_id
end

return guild_cross_war_award