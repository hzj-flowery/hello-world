--guild_cross_war_show

-- key
local __key_map = {
  id = 1,    --编号-int 
  x_position = 2,    --人X轴坐标-int 
  y_position = 3,    --人Y轴坐标-int 

}

-- data
local guild_cross_war_show = {
    _data = {
        [1] = {1,900,100,},
        [2] = {2,800,300,},
        [3] = {3,1000,300,},
        [4] = {4,800,500,},
        [5] = {5,1000,500,},
        [6] = {6,650,500,},
        [7] = {7,1150,500,},
        [8] = {8,800,700,},
        [9] = {9,1000,700,},
        [10] = {10,650,700,},
        [11] = {11,1150,700,},
        [12] = {12,500,700,},
        [13] = {13,1300,700,},
        [14] = {14,800,900,},
        [15] = {15,1000,900,},
        [16] = {16,650,900,},
        [17] = {17,1150,900,},
        [18] = {18,500,900,},
        [19] = {19,1300,900,},
        [20] = {20,800,1100,},
        [21] = {21,1000,1100,},
        [22] = {22,650,1100,},
        [23] = {23,1150,1100,},
        [24] = {24,500,1100,},
        [25] = {25,1300,1100,},
        [26] = {26,800,1300,},
        [27] = {27,1000,1300,},
        [28] = {28,650,1300,},
        [29] = {29,1150,1300,},
        [30] = {30,500,1300,},
        [31] = {31,1300,1300,},
        [32] = {32,800,1500,},
        [33] = {33,1000,1500,},
        [34] = {34,650,1500,},
        [35] = {35,1150,1500,},
        [36] = {36,500,1500,},
        [37] = {37,1300,1500,},
        [38] = {38,800,1700,},
        [39] = {39,1000,1700,},
        [40] = {40,650,1700,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
    [13] = 13,
    [14] = 14,
    [15] = 15,
    [16] = 16,
    [17] = 17,
    [18] = 18,
    [19] = 19,
    [2] = 2,
    [20] = 20,
    [21] = 21,
    [22] = 22,
    [23] = 23,
    [24] = 24,
    [25] = 25,
    [26] = 26,
    [27] = 27,
    [28] = 28,
    [29] = 29,
    [3] = 3,
    [30] = 30,
    [31] = 31,
    [32] = 32,
    [33] = 33,
    [34] = 34,
    [35] = 35,
    [36] = 36,
    [37] = 37,
    [38] = 38,
    [39] = 39,
    [4] = 4,
    [40] = 40,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in guild_cross_war_show")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_cross_war_show.length()
    return #guild_cross_war_show._data
end

-- 
function guild_cross_war_show.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_cross_war_show.indexOf(index)
    if index == nil or not guild_cross_war_show._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_cross_war_show._data[index]}, mt)
end

--
function guild_cross_war_show.get(id)
    
    return guild_cross_war_show.indexOf(__index_id[id])
        
end

--
function guild_cross_war_show.set(id, key, value)
    local record = guild_cross_war_show.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_cross_war_show.index()
    return __index_id
end

return guild_cross_war_show