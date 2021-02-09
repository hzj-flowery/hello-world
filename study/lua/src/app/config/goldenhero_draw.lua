--goldenhero_draw

-- key
local __key_map = {
  drop_id = 1,    --抽奖库-int 
  type = 2,    --奖品类型-int 
  value = 3,    --奖品类型值-int 
  size = 4,    --奖品数量-int 
  group = 5,    --奖品组数-int 
  time = 6,    --时间-int 

}

-- data
local goldenhero_draw = {
    _data = {
        [1] = {1101,1,152,1,5,0,},
        [2] = {1102,6,555,12,10,1,},
        [3] = {1103,6,705,5,20,8,},
        [4] = {1104,1,251,1,5,9,},
        [5] = {1105,1,453,1,5,10,},
        [6] = {1106,6,705,5,20,11,},
        [7] = {1107,1,350,1,5,12,},
        [8] = {1108,6,555,12,10,13,},
        [9] = {1109,6,705,5,20,14,},
        [10] = {1110,1,452,1,5,15,},
        [11] = {1111,6,556,12,10,16,},
        [12] = {1112,6,705,5,20,17,},
        [13] = {1113,1,151,1,5,18,},
        [14] = {1114,1,353,1,5,19,},
        [15] = {1115,6,705,5,20,20,},
        [16] = {1116,1,250,1,5,21,},
        [17] = {1117,6,556,12,10,22,},
        [18] = {1118,6,705,5,20,23,},
        [19] = {1119,1,352,1,5,0,},
        [20] = {1120,6,555,12,10,1,},
        [21] = {1121,6,705,5,20,8,},
        [22] = {1122,1,451,1,5,9,},
        [23] = {1123,1,253,1,5,10,},
        [24] = {1124,6,705,5,20,11,},
        [25] = {1125,1,150,1,5,12,},
        [26] = {1126,6,555,12,10,13,},
        [27] = {1127,6,705,5,20,14,},
        [28] = {1128,1,252,1,5,15,},
        [29] = {1129,6,556,12,10,16,},
        [30] = {1130,6,705,5,20,17,},
        [31] = {1131,1,351,1,5,18,},
        [32] = {1132,1,153,1,5,19,},
        [33] = {1133,6,705,5,20,20,},
        [34] = {1134,1,450,1,5,21,},
    }
}

-- index
local __index_drop_id = {
    [1101] = 1,
    [1102] = 2,
    [1103] = 3,
    [1104] = 4,
    [1105] = 5,
    [1106] = 6,
    [1107] = 7,
    [1108] = 8,
    [1109] = 9,
    [1110] = 10,
    [1111] = 11,
    [1112] = 12,
    [1113] = 13,
    [1114] = 14,
    [1115] = 15,
    [1116] = 16,
    [1117] = 17,
    [1118] = 18,
    [1119] = 19,
    [1120] = 20,
    [1121] = 21,
    [1122] = 22,
    [1123] = 23,
    [1124] = 24,
    [1125] = 25,
    [1126] = 26,
    [1127] = 27,
    [1128] = 28,
    [1129] = 29,
    [1130] = 30,
    [1131] = 31,
    [1132] = 32,
    [1133] = 33,
    [1134] = 34,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in goldenhero_draw")
        return t._raw[__key_map[k]]
    end
}

-- 
function goldenhero_draw.length()
    return #goldenhero_draw._data
end

-- 
function goldenhero_draw.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function goldenhero_draw.indexOf(index)
    if index == nil or not goldenhero_draw._data[index] then
        return nil
    end

    return setmetatable({_raw = goldenhero_draw._data[index]}, mt)
end

--
function goldenhero_draw.get(drop_id)
    
    return goldenhero_draw.indexOf(__index_drop_id[drop_id])
        
end

--
function goldenhero_draw.set(drop_id, key, value)
    local record = goldenhero_draw.get(drop_id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function goldenhero_draw.index()
    return __index_drop_id
end

return goldenhero_draw