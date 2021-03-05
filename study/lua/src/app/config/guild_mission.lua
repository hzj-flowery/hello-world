--guild_mission

-- key
local __key_map = {
  id = 1,    --序号-int 
  guild_level = 2,    --军团等级-int 
  box_id = 3,    --宝箱id-int 
  need_exp = 4,    --需要声望-int 
  drop = 5,    --掉落组id-int 

}

-- data
local guild_mission = {
    _data = {
        [1] = {1,1,1,5000,7101,},
        [2] = {2,1,2,10000,7102,},
        [3] = {3,1,3,15000,7103,},
        [4] = {4,1,4,20000,7104,},
        [5] = {11,2,1,5000,7105,},
        [6] = {12,2,2,10000,7106,},
        [7] = {13,2,3,15000,7107,},
        [8] = {14,2,4,20000,7108,},
        [9] = {21,3,1,5000,7109,},
        [10] = {22,3,2,10000,7110,},
        [11] = {23,3,3,15000,7111,},
        [12] = {24,3,4,20000,7112,},
        [13] = {31,4,1,5000,7113,},
        [14] = {32,4,2,10000,7114,},
        [15] = {33,4,3,15000,7115,},
        [16] = {34,4,4,20000,7116,},
        [17] = {41,5,1,5000,7117,},
        [18] = {42,5,2,10000,7118,},
        [19] = {43,5,3,15000,7119,},
        [20] = {44,5,4,20000,7120,},
        [21] = {51,6,1,5000,7121,},
        [22] = {52,6,2,10000,7122,},
        [23] = {53,6,3,15000,7123,},
        [24] = {54,6,4,20000,7124,},
        [25] = {61,7,1,5000,7125,},
        [26] = {62,7,2,10000,7126,},
        [27] = {63,7,3,15000,7127,},
        [28] = {64,7,4,20000,7128,},
        [29] = {71,8,1,5000,7129,},
        [30] = {72,8,2,10000,7130,},
        [31] = {73,8,3,15000,7131,},
        [32] = {74,8,4,20000,7132,},
        [33] = {81,9,1,5000,7133,},
        [34] = {82,9,2,10000,7134,},
        [35] = {83,9,3,15000,7135,},
        [36] = {84,9,4,20000,7136,},
        [37] = {91,10,1,5000,7137,},
        [38] = {92,10,2,10000,7138,},
        [39] = {93,10,3,15000,7139,},
        [40] = {94,10,4,20000,7140,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [11] = 5,
    [12] = 6,
    [13] = 7,
    [14] = 8,
    [2] = 2,
    [21] = 9,
    [22] = 10,
    [23] = 11,
    [24] = 12,
    [3] = 3,
    [31] = 13,
    [32] = 14,
    [33] = 15,
    [34] = 16,
    [4] = 4,
    [41] = 17,
    [42] = 18,
    [43] = 19,
    [44] = 20,
    [51] = 21,
    [52] = 22,
    [53] = 23,
    [54] = 24,
    [61] = 25,
    [62] = 26,
    [63] = 27,
    [64] = 28,
    [71] = 29,
    [72] = 30,
    [73] = 31,
    [74] = 32,
    [81] = 33,
    [82] = 34,
    [83] = 35,
    [84] = 36,
    [91] = 37,
    [92] = 38,
    [93] = 39,
    [94] = 40,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in guild_mission")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_mission.length()
    return #guild_mission._data
end

-- 
function guild_mission.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_mission.indexOf(index)
    if index == nil or not guild_mission._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_mission._data[index]}, mt)
end

--
function guild_mission.get(id)
    
    return guild_mission.indexOf(__index_id[id])
        
end

--
function guild_mission.set(id, key, value)
    local record = guild_mission.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_mission.index()
    return __index_id
end

return guild_mission