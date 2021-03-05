--answer_rank_award

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

}

-- data
local answer_rank_award = {
    _data = {
        [1] = {1,2,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [2] = {2,7,13,11,1209,1,11,1213,1,11,1217,1,11,1218,1,11,1105,1,11,1107,1,0,0,0,},
        [3] = {3,14,23,11,1209,1,11,1213,1,11,1217,1,11,1218,1,11,1105,1,11,1107,1,6,510,1,},
        [4] = {4,24,26,11,1209,1,11,1213,1,11,1217,1,11,1218,1,11,1105,1,6,92,1,6,511,1,},
        [5] = {5,27,48,11,1209,1,11,1213,1,11,1217,1,11,1218,1,11,1105,1,6,92,1,6,511,1,},
        [6] = {6,49,84,11,1209,1,11,1213,1,11,1217,1,11,1218,1,6,92,1,6,512,1,0,0,0,},
        [7] = {7,85,147,11,1209,1,11,1213,1,11,1217,1,11,1218,1,6,92,1,6,513,1,0,0,0,},
        [8] = {8,148,365,11,1209,1,11,1213,1,11,1217,1,11,1218,1,6,92,1,6,514,1,0,0,0,},
        [9] = {9,366,999,11,1209,1,11,1213,1,11,1217,1,11,1218,1,6,92,1,6,514,1,0,0,0,},
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
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in answer_rank_award")
        return t._raw[__key_map[k]]
    end
}

-- 
function answer_rank_award.length()
    return #answer_rank_award._data
end

-- 
function answer_rank_award.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function answer_rank_award.indexOf(index)
    if index == nil or not answer_rank_award._data[index] then
        return nil
    end

    return setmetatable({_raw = answer_rank_award._data[index]}, mt)
end

--
function answer_rank_award.get(id)
    
    return answer_rank_award.indexOf(__index_id[id])
        
end

--
function answer_rank_award.set(id, key, value)
    local record = answer_rank_award.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function answer_rank_award.index()
    return __index_id
end

return answer_rank_award