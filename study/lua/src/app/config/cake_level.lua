--cake_level

-- key
local __key_map = {
  type = 1,    --活动类型-int 
  lv = 2,    --蛋糕等级-int 
  exp = 3,    --经验值-int 
  cake_pic_effect = 4,    --蛋糕动画-string 
  type_1 = 5,    --物品1type-int 
  id_1 = 6,    --物品1id-int 
  size_1 = 7,    --物品1size-int 
  type_2 = 8,    --物品2type-int 
  id_2 = 9,    --物品2id-int 
  size_2 = 10,    --物品2size-int 
  type_3 = 11,    --物品3type-int 
  id_3 = 12,    --物品3id-int 
  size_3 = 13,    --物品3size-int 
  type_4 = 14,    --物品4type-int 
  id_4 = 15,    --物品4id-int 
  size_4 = 16,    --物品4size-int 

}

-- data
local cake_level = {
    _data = {
        [1] = {1,1,24000,"moving_dangao_dangao1xx",0,0,0,0,0,0,0,0,0,0,0,0,},
        [2] = {1,2,48000,"moving_dangao_dangao2xx",5,31,300,6,570,100,0,0,0,0,0,0,},
        [3] = {1,3,80000,"moving_dangao_dangao3xx",5,31,500,6,570,150,6,161,1,0,0,0,},
        [4] = {1,4,120000,"moving_dangao_dangao4xx",5,31,800,6,570,300,6,161,1,0,0,0,},
        [5] = {1,5,160000,"moving_dangao_dangao5xx",5,31,1000,6,570,350,6,161,2,6,14,50,},
        [6] = {1,6,200000,"moving_dangao_dangao6xx",5,31,1200,6,570,400,6,161,2,6,146,5,},
        [7] = {1,7,240000,"moving_dangao_dangao7xx",5,31,1500,6,570,500,6,161,3,6,146,10,},
        [8] = {1,8,300000,"moving_dangao_dangao8xx",5,31,2000,6,570,650,6,161,4,6,705,2,},
        [9] = {1,9,360000,"moving_dangao_dangao9xx",5,31,2500,6,570,850,6,161,5,6,139,1,},
        [10] = {1,10,0,"moving_dangao_dangao10xx",5,31,3000,6,570,1050,6,161,6,6,705,5,},
        [11] = {2,1,24000,"moving_huoguo_1",0,0,0,0,0,0,0,0,0,0,0,0,},
        [12] = {2,2,48000,"moving_huoguo_2",5,31,300,6,573,100,0,0,0,0,0,0,},
        [13] = {2,3,80000,"moving_huoguo_3",5,31,500,6,573,150,6,161,1,0,0,0,},
        [14] = {2,4,120000,"moving_huoguo_4",5,31,800,6,573,300,6,161,1,0,0,0,},
        [15] = {2,5,160000,"moving_huoguo_5",5,31,1000,6,573,350,6,161,2,6,14,50,},
        [16] = {2,6,200000,"moving_huoguo_6",5,31,1200,6,573,400,6,161,2,6,146,5,},
        [17] = {2,7,240000,"moving_huoguo_7",5,31,1500,6,573,500,6,161,3,6,146,10,},
        [18] = {2,8,300000,"moving_huoguo_8",5,31,2000,6,573,650,6,161,4,6,705,2,},
        [19] = {2,9,360000,"moving_huoguo_9",5,31,2500,6,573,850,6,161,5,6,139,1,},
        [20] = {2,10,0,"moving_huoguo_10",5,31,3000,6,573,1050,6,161,6,6,705,5,},
        [21] = {3,1,24000,"moving_kaorou_1",0,0,0,0,0,0,0,0,0,0,0,0,},
        [22] = {3,2,48000,"moving_kaorou_2",5,31,300,6,576,100,0,0,0,0,0,0,},
        [23] = {3,3,80000,"moving_kaorou_3",5,31,500,6,576,150,6,161,1,0,0,0,},
        [24] = {3,4,120000,"moving_kaorou_4",5,31,800,6,576,300,6,161,1,0,0,0,},
        [25] = {3,5,160000,"moving_kaorou_5",5,31,1000,6,576,350,6,161,2,6,14,50,},
        [26] = {3,6,200000,"moving_kaorou_6",5,31,1200,6,576,400,6,161,2,6,146,5,},
        [27] = {3,7,240000,"moving_kaorou_7",5,31,1500,6,576,500,6,161,3,6,146,10,},
        [28] = {3,8,300000,"moving_kaorou_8",5,31,2000,6,576,650,6,161,4,6,705,2,},
        [29] = {3,9,360000,"moving_kaorou_9",5,31,2500,6,576,850,6,161,5,6,139,1,},
        [30] = {3,10,0,"moving_kaorou_10",5,31,3000,6,576,1050,6,161,6,6,705,5,},
        [31] = {4,1,24000,"moving_nianyefan_1",0,0,0,0,0,0,0,0,0,0,0,0,},
        [32] = {4,2,48000,"moving_nianyefan_2",5,31,300,6,579,100,0,0,0,0,0,0,},
        [33] = {4,3,80000,"moving_nianyefan_3",5,31,500,6,579,150,6,161,1,0,0,0,},
        [34] = {4,4,120000,"moving_nianyefan_4",5,31,800,6,579,300,6,161,1,0,0,0,},
        [35] = {4,5,160000,"moving_nianyefan_5",5,31,1000,6,579,350,6,161,2,6,14,50,},
        [36] = {4,6,200000,"moving_nianyefan_6",5,31,1200,6,579,400,6,161,2,6,146,5,},
        [37] = {4,7,240000,"moving_nianyefan_7",5,31,1500,6,579,500,6,161,3,6,146,10,},
        [38] = {4,8,300000,"moving_nianyefan_8",5,31,2000,6,579,650,6,161,4,6,705,2,},
        [39] = {4,9,360000,"moving_nianyefan_9",5,31,2500,6,579,850,6,161,5,6,139,1,},
        [40] = {4,10,0,"moving_nianyefan_10",5,31,3000,6,579,1050,6,161,6,6,705,5,},
    }
}

-- index
local __index_type_lv = {
    ["1_1"] = 1,
    ["1_10"] = 10,
    ["1_2"] = 2,
    ["1_3"] = 3,
    ["1_4"] = 4,
    ["1_5"] = 5,
    ["1_6"] = 6,
    ["1_7"] = 7,
    ["1_8"] = 8,
    ["1_9"] = 9,
    ["2_1"] = 11,
    ["2_10"] = 20,
    ["2_2"] = 12,
    ["2_3"] = 13,
    ["2_4"] = 14,
    ["2_5"] = 15,
    ["2_6"] = 16,
    ["2_7"] = 17,
    ["2_8"] = 18,
    ["2_9"] = 19,
    ["3_1"] = 21,
    ["3_10"] = 30,
    ["3_2"] = 22,
    ["3_3"] = 23,
    ["3_4"] = 24,
    ["3_5"] = 25,
    ["3_6"] = 26,
    ["3_7"] = 27,
    ["3_8"] = 28,
    ["3_9"] = 29,
    ["4_1"] = 31,
    ["4_10"] = 40,
    ["4_2"] = 32,
    ["4_3"] = 33,
    ["4_4"] = 34,
    ["4_5"] = 35,
    ["4_6"] = 36,
    ["4_7"] = 37,
    ["4_8"] = 38,
    ["4_9"] = 39,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in cake_level")
        return t._raw[__key_map[k]]
    end
}

-- 
function cake_level.length()
    return #cake_level._data
end

-- 
function cake_level.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function cake_level.indexOf(index)
    if index == nil or not cake_level._data[index] then
        return nil
    end

    return setmetatable({_raw = cake_level._data[index]}, mt)
end

--
function cake_level.get(type,lv)
    
    local k = type .. '_' .. lv
    return cake_level.indexOf(__index_type_lv[k])
        
end

--
function cake_level.set(type,lv, tkey, nvalue)
    local record = cake_level.get(type,lv)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function cake_level.index()
    return __index_type_lv
end

return cake_level