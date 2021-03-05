--pet_red_activity

-- key
local __key_map = {
  id = 1,    --id-int 
  depot = 2,    --类型库-int 
  group = 3,    --掉落组-int 
  type = 4,    --掉落类型-int 
  value = 5,    --掉落参数-int 
  size = 6,    --掉落数-int 
  paomadeng = 7,    --跑马灯-int 

}

-- data
local pet_red_activity = {
    _data = {
        [1] = {1,1,1,10,201,1,2401,},
        [2] = {2,1,1,7,100201,1,0,},
        [3] = {3,1,1,7,100201,2,0,},
        [4] = {4,1,1,7,100201,3,0,},
        [5] = {5,2,11,10,6,1,2402,},
        [6] = {6,2,11,7,100006,1,0,},
        [7] = {7,2,11,7,100006,2,0,},
        [8] = {8,2,11,7,100006,3,0,},
        [9] = {9,2,12,10,5,1,2402,},
        [10] = {10,2,12,7,100005,1,0,},
        [11] = {11,2,12,7,100005,2,0,},
        [12] = {12,2,12,7,100005,3,0,},
        [13] = {13,2,13,10,8,1,2402,},
        [14] = {14,2,13,7,100008,1,0,},
        [15] = {15,2,13,7,100008,2,0,},
        [16] = {16,2,13,7,100008,3,0,},
        [17] = {17,2,14,10,7,1,2402,},
        [18] = {18,2,14,7,100007,1,0,},
        [19] = {19,2,14,7,100007,2,0,},
        [20] = {20,2,14,7,100007,3,0,},
        [21] = {21,2,15,10,9,1,2402,},
        [22] = {22,2,15,7,100009,1,0,},
        [23] = {23,2,15,7,100009,2,0,},
        [24] = {24,2,15,7,100009,3,0,},
        [25] = {25,2,16,10,11,1,2402,},
        [26] = {26,2,16,7,100011,1,0,},
        [27] = {27,2,16,7,100011,2,0,},
        [28] = {28,2,16,7,100011,3,0,},
        [29] = {29,2,17,10,10,1,2402,},
        [30] = {30,2,17,7,100010,1,0,},
        [31] = {31,2,17,7,100010,2,0,},
        [32] = {32,2,17,7,100010,3,0,},
        [33] = {33,2,18,10,12,1,2402,},
        [34] = {34,2,18,7,100012,1,0,},
        [35] = {35,2,18,7,100012,2,0,},
        [36] = {36,2,18,7,100012,3,0,},
        [37] = {37,3,21,6,718,1,0,},
        [38] = {38,3,21,6,718,2,0,},
        [39] = {39,3,21,6,718,3,0,},
        [40] = {40,3,21,6,89,1,0,},
        [41] = {41,3,21,6,89,2,0,},
        [42] = {42,3,21,6,89,3,0,},
        [43] = {43,3,21,6,32,500,0,},
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
    [41] = 41,
    [42] = 42,
    [43] = 43,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pet_red_activity")
        return t._raw[__key_map[k]]
    end
}

-- 
function pet_red_activity.length()
    return #pet_red_activity._data
end

-- 
function pet_red_activity.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pet_red_activity.indexOf(index)
    if index == nil or not pet_red_activity._data[index] then
        return nil
    end

    return setmetatable({_raw = pet_red_activity._data[index]}, mt)
end

--
function pet_red_activity.get(id)
    
    return pet_red_activity.indexOf(__index_id[id])
        
end

--
function pet_red_activity.set(id, tkey, nvalue)
    local record = pet_red_activity.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function pet_red_activity.index()
    return __index_id
end

return pet_red_activity