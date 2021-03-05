--guild_stage_award

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

}

-- data
local guild_stage_award = {
    _data = {
        [1] = {1,1,3,6,24,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [2] = {2,4,6,6,24,1,6,81,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [3] = {3,7,13,6,24,1,6,81,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,11,1106,1,11,1102,1,0,0,0,0,0,0,},
        [4] = {4,14,20,6,25,1,6,81,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,11,1106,1,11,1102,1,6,530,1,0,0,0,},
        [5] = {5,21,23,6,25,1,6,81,1,6,44,1,6,41,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,11,1106,1,6,530,1,},
        [6] = {6,24,26,6,25,1,6,81,1,6,93,1,6,44,1,6,41,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,6,530,1,},
        [7] = {7,27,39,6,25,1,6,81,1,6,93,1,6,44,1,6,41,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,6,531,1,},
        [8] = {8,40,48,6,26,1,6,81,1,6,93,1,6,44,1,6,41,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,6,531,1,},
        [9] = {9,49,84,6,26,1,6,81,1,6,93,1,6,44,1,6,41,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,6,532,1,},
        [10] = {10,85,117,6,26,1,6,81,1,6,93,1,6,44,1,6,41,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,6,533,1,},
        [11] = {11,118,147,6,27,1,6,81,1,6,93,1,6,44,1,6,41,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,6,533,1,},
        [12] = {12,148,999,6,27,1,6,81,1,6,93,1,6,44,1,6,41,1,11,1205,1,11,1208,1,11,1215,1,11,1219,1,6,534,1,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_stage_award")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_stage_award.length()
    return #guild_stage_award._data
end

-- 
function guild_stage_award.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_stage_award.indexOf(index)
    if index == nil or not guild_stage_award._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_stage_award._data[index]}, mt)
end

--
function guild_stage_award.get(id)
    
    return guild_stage_award.indexOf(__index_id[id])
        
end

--
function guild_stage_award.set(id, key, value)
    local record = guild_stage_award.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_stage_award.index()
    return __index_id
end

return guild_stage_award