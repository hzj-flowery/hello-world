--act_daily_discount

-- key
local __key_map = {
  id = 1,    --id-int 
  pay_type = 2,    --充值档次-int 
  vip_limit = 3,    --VIP限制-int 
  type_1 = 4,    --奖励类型1-int 
  value_1 = 5,    --类型值1-int 
  size_1 = 6,    --数量1-int 
  type_2 = 7,    --奖励类型2-int 
  value_2 = 8,    --类型值2-int 
  size_2 = 9,    --数量2-int 
  type_3 = 10,    --奖励类型3-int 
  value_3 = 11,    --类型值3-int 
  size_3 = 12,    --数量3-int 
  type_4 = 13,    --奖励类型4-int 
  value_4 = 14,    --类型值4-int 
  size_4 = 15,    --数量4-int 
  show_type_1 = 16,    --显示类型1-int 
  show_value_1 = 17,    --显示类型值1-int 
  show_size_1 = 18,    --显示数量1-int 
  show_type_2 = 19,    --显示类型2-int 
  show_value_2 = 20,    --显示类型值2-int 
  show_size_2 = 21,    --显示数量2-int 
  show_type_3 = 22,    --显示类型3-int 
  show_value_3 = 23,    --显示类型值3-int 
  show_size_3 = 24,    --显示数量3-int 

}

-- data
local act_daily_discount = {
    _data = {
        [1] = {1,1,1,5,1,20,6,3,100,5,2,100000,0,0,0,6,23,1,0,0,0,0,0,0,},
        [2] = {2,2,2,5,1,60,6,1,2,6,63,10,0,0,0,6,23,1,0,0,0,0,0,0,},
        [3] = {3,3,3,5,1,120,6,2,2,6,73,15,0,0,0,6,23,1,0,0,0,0,0,0,},
        [4] = {4,1,1,5,1,20,6,3,100,5,2,150000,0,0,0,6,24,1,0,0,0,0,0,0,},
        [5] = {5,2,2,5,1,60,6,1,2,6,73,10,0,0,0,6,24,1,0,0,0,0,0,0,},
        [6] = {6,3,3,5,1,120,6,2,2,6,13,10,0,0,0,6,24,1,0,0,0,0,0,0,},
        [7] = {7,1,1,5,1,20,6,3,100,5,2,200000,0,0,0,6,24,1,0,0,0,0,0,0,},
        [8] = {8,2,2,5,1,60,6,1,2,6,13,10,0,0,0,6,24,1,0,0,0,0,0,0,},
        [9] = {9,3,3,5,1,120,6,2,2,6,80,1,0,0,0,6,24,1,0,0,0,0,0,0,},
        [10] = {10,1,1,5,1,20,6,3,100,5,2,200000,0,0,0,6,25,1,0,0,0,0,0,0,},
        [11] = {11,2,2,5,1,60,6,1,2,6,13,10,0,0,0,6,25,1,0,0,0,0,0,0,},
        [12] = {12,3,3,5,1,120,6,2,2,6,80,1,0,0,0,6,25,1,0,0,0,0,0,0,},
        [13] = {19,1,1,6,85,1,6,3,100,5,2,200000,5,1,20,6,25,1,6,92,1,6,93,1,},
        [14] = {20,2,2,6,95,1,6,1,2,6,13,10,5,1,60,6,25,1,6,92,1,6,93,1,},
        [15] = {21,3,3,6,94,2,6,2,2,6,80,1,5,1,120,6,25,1,6,92,1,6,93,1,},
        [16] = {13,1,1,6,85,1,6,3,100,5,2,200000,5,1,20,6,26,1,6,92,1,6,93,1,},
        [17] = {14,2,2,6,95,1,6,1,2,6,13,10,5,1,60,6,26,1,6,92,1,6,93,1,},
        [18] = {15,3,3,6,94,2,6,2,2,6,14,10,5,1,120,6,26,1,6,92,1,6,93,1,},
        [19] = {16,1,1,6,85,1,6,3,100,5,2,200000,5,1,20,6,27,1,6,92,1,6,93,1,},
        [20] = {17,2,2,6,95,1,6,1,2,6,13,10,5,1,60,6,27,1,6,92,1,6,93,1,},
        [21] = {18,3,3,6,94,2,6,2,2,6,14,10,5,1,120,6,27,1,6,92,1,6,93,1,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
    [13] = 16,
    [14] = 17,
    [15] = 18,
    [16] = 19,
    [17] = 20,
    [18] = 21,
    [19] = 13,
    [2] = 2,
    [20] = 14,
    [21] = 15,
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
        assert(__key_map[k], "cannot find " .. k .. " in act_daily_discount")
        return t._raw[__key_map[k]]
    end
}

-- 
function act_daily_discount.length()
    return #act_daily_discount._data
end

-- 
function act_daily_discount.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function act_daily_discount.indexOf(index)
    if index == nil or not act_daily_discount._data[index] then
        return nil
    end

    return setmetatable({_raw = act_daily_discount._data[index]}, mt)
end

--
function act_daily_discount.get(id)
    
    return act_daily_discount.indexOf(__index_id[id])
        
end

--
function act_daily_discount.set(id, key, value)
    local record = act_daily_discount.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function act_daily_discount.index()
    return __index_id
end

return act_daily_discount