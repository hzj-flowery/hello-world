--act_admin

-- key
local __key_map = {
  id = 1,    --id-int 
  name = 2,    --活动名称-string 
  order = 3,    --排序-int 
  function_id = 4,    --开启等级-int 
  is_work = 5,    --是否生效-int 
  value_1 = 6,    --参数1-int 
  value_2 = 7,    --参数2-int 
  value_3 = 8,    --参数3-int 
  show_control = 9,    --显示控制-int 

}

-- data
local act_admin = {
    _data = {
        [1] = {1,"签到",1,0,1,50,0,0,0,},
        [2] = {2,"宴会",3,0,1,0,0,0,0,},
        [3] = {3,"豪华卡",5,0,1,0,0,0,0,},
        [4] = {40,"成长基金",6,0,1,0,0,0,1,},
        [5] = {41,"成长基金1",91,0,1,0,0,0,2,},
        [6] = {42,"成长基金2",92,0,1,0,0,0,2,},
        [7] = {43,"成长基金3",93,0,1,0,0,0,2,},
        [8] = {44,"成长基金4",94,0,1,0,0,0,2,},
        [9] = {45,"成长基金5",95,0,1,0,0,0,2,},
        [10] = {46,"成长基金6",96,0,1,0,0,0,2,},
        [11] = {47,"成长基金7",97,0,1,0,0,0,2,},
        [12] = {48,"成长基金8",98,0,1,0,0,0,2,},
        [13] = {49,"成长基金9",99,0,1,0,0,0,2,},
        [14] = {50,"成长基金10",100,0,1,0,0,0,2,},
        [15] = {51,"成长基金11",101,0,1,0,0,0,2,},
        [16] = {52,"成长基金12",102,0,1,0,0,0,2,},
        [17] = {53,"成长基金13",103,0,1,0,0,0,2,},
        [18] = {54,"成长基金14",104,0,1,0,0,0,2,},
        [19] = {55,"成长基金15",105,0,1,0,0,0,2,},
        [20] = {56,"成长基金16",106,0,1,0,0,0,2,},
        [21] = {57,"成长基金17",107,0,1,0,0,0,2,},
        [22] = {5,"每日礼包",14,605,1,1,10026,3,0,},
        [23] = {6,"聚宝盆",4,0,1,55,2,0,0,},
        [24] = {7,"每周礼包",15,604,1,0,0,0,0,},
        [25] = {8,"等级礼包",16,0,1,0,0,0,0,},
        [26] = {9,"公测预约",17,0,0,0,0,0,1,},
        [27] = {10,"充值返利",18,0,0,0,0,0,1,},
        [28] = {11,"资源找回",19,0,1,0,0,0,0,},
        [29] = {12,"五谷丰登",2,95,1,0,0,0,0,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 27,
    [11] = 28,
    [12] = 29,
    [2] = 2,
    [3] = 3,
    [40] = 4,
    [41] = 5,
    [42] = 6,
    [43] = 7,
    [44] = 8,
    [45] = 9,
    [46] = 10,
    [47] = 11,
    [48] = 12,
    [49] = 13,
    [5] = 22,
    [50] = 14,
    [51] = 15,
    [52] = 16,
    [53] = 17,
    [54] = 18,
    [55] = 19,
    [56] = 20,
    [57] = 21,
    [6] = 23,
    [7] = 24,
    [8] = 25,
    [9] = 26,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in act_admin")
        return t._raw[__key_map[k]]
    end
}

-- 
function act_admin.length()
    return #act_admin._data
end

-- 
function act_admin.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function act_admin.indexOf(index)
    if index == nil or not act_admin._data[index] then
        return nil
    end

    return setmetatable({_raw = act_admin._data[index]}, mt)
end

--
function act_admin.get(id)
    
    return act_admin.indexOf(__index_id[id])
        
end

--
function act_admin.set(id, key, value)
    local record = act_admin.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function act_admin.index()
    return __index_id
end

return act_admin