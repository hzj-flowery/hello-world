--goldenhero_rank

-- key
local __key_map = {
  order = 1,    --排序-int 
  rank_type = 2,    --排行奖励类型-int 
  rank_min = 3,    --名次min-int 
  rank_max = 4,    --名次max-int 
  involvement = 5,    --是否显示参与奖-int 
  type_1 = 6,    --类型1-int 
  value_1 = 7,    --类型值1-int 
  size_1 = 8,    --数量1-int 
  type_2 = 9,    --类型2-int 
  value_2 = 10,    --类型值2-int 
  size_2 = 11,    --数量2-int 
  type_3 = 12,    --类型3-int 
  value_3 = 13,    --类型值3-int 
  size_3 = 14,    --数量3-int 
  type_4 = 15,    --类型4-int 
  value_4 = 16,    --类型值4-int 
  size_4 = 17,    --数量4-int 
  type_5 = 18,    --类型5-int 
  value_5 = 19,    --类型值5-int 
  size_5 = 20,    --数量5-int 
  type_6 = 21,    --类型6-int 
  value_6 = 22,    --类型值6-int 
  size_6 = 23,    --数量6-int 
  type_7 = 24,    --类型7-int 
  value_7 = 25,    --类型值7-int 
  size_7 = 26,    --数量7-int 
  type_8 = 27,    --类型8-int 
  value_8 = 28,    --类型值8-int 
  size_8 = 29,    --数量8-int 
  type_9 = 30,    --类型9-int 
  value_9 = 31,    --类型值9-int 
  size_9 = 32,    --数量9-int 
  type_10 = 33,    --类型10-int 
  value_10 = 34,    --类型值10-int 
  size_10 = 35,    --数量10-int 

}

-- data
local goldenhero_rank = {
    _data = {
        [1] = {1,1,1,1,0,18,30,1,17,21,1,6,167,1,6,170,2,5,32,120000,6,10,50000,6,19,100000,0,0,0,0,0,0,0,0,0,},
        [2] = {2,1,2,2,0,18,29,1,17,21,1,6,167,1,6,170,1,5,32,90000,6,10,40000,6,19,80000,0,0,0,0,0,0,0,0,0,},
        [3] = {3,1,3,3,0,18,29,1,17,21,1,6,167,1,6,170,1,5,32,60000,6,10,30000,6,19,60000,0,0,0,0,0,0,0,0,0,},
        [4] = {4,1,4,10,0,18,29,1,17,20,1,6,167,1,6,169,80,5,32,32000,6,10,20000,6,19,40000,0,0,0,0,0,0,0,0,0,},
        [5] = {5,1,11,30,0,18,29,1,17,20,1,6,169,40,5,32,16000,6,10,15000,6,19,30000,0,0,0,0,0,0,0,0,0,0,0,0,},
        [6] = {6,1,31,100,0,6,169,20,5,32,8000,6,10,10000,6,19,20000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [7] = {7,1,101,99999,1,5,32,3200,6,10,5000,6,19,10000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [8] = {8,2,1,1,0,18,28,1,17,19,1,6,168,1,6,170,1,5,32,30000,6,10,20000,6,19,40000,0,0,0,0,0,0,0,0,0,},
        [9] = {9,2,2,2,0,17,19,1,6,168,1,6,169,120,5,32,20000,6,10,15000,6,19,30000,0,0,0,0,0,0,0,0,0,0,0,0,},
        [10] = {10,2,3,3,0,17,19,1,6,168,1,6,169,80,5,32,15000,6,10,10000,6,19,20000,0,0,0,0,0,0,0,0,0,0,0,0,},
        [11] = {11,2,4,10,0,17,19,1,6,169,40,5,32,8000,6,10,5000,6,19,10000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [12] = {12,2,11,30,0,6,169,20,5,32,6000,6,10,2500,6,19,5000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [13] = {13,2,31,100,0,6,169,10,5,32,4000,6,10,1250,6,19,2500,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [14] = {14,2,101,99999,1,5,32,2000,6,10,500,6,19,1000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
    }
}

-- index
local __index_order = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
    [13] = 13,
    [14] = 14,
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
        assert(__key_map[k], "cannot find " .. k .. " in goldenhero_rank")
        return t._raw[__key_map[k]]
    end
}

-- 
function goldenhero_rank.length()
    return #goldenhero_rank._data
end

-- 
function goldenhero_rank.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function goldenhero_rank.indexOf(index)
    if index == nil or not goldenhero_rank._data[index] then
        return nil
    end

    return setmetatable({_raw = goldenhero_rank._data[index]}, mt)
end

--
function goldenhero_rank.get(order)
    
    return goldenhero_rank.indexOf(__index_order[order])
        
end

--
function goldenhero_rank.set(order, key, value)
    local record = goldenhero_rank.get(order)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function goldenhero_rank.index()
    return __index_order
end

return goldenhero_rank