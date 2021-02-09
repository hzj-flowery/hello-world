--return_charge_award

-- key
local __key_map = {
  id = 1,    --id-int 
  type = 2,    --类型-int 
  value = 3,    --类型值-int 
  size = 4,    --数量-int 

}

-- data
local return_charge_award = {
    _data = {
        [1] = {1,6,2,10,},
        [2] = {2,6,20,18,},
        [3] = {3,6,21,18,},
        [4] = {4,6,20,8,},
        [5] = {5,6,21,8,},
        [6] = {6,6,109,1,},
        [7] = {7,6,107,1,},
        [8] = {8,6,108,1,},
        [9] = {9,6,80,2,},
        [10] = {10,6,80,4,},
        [11] = {11,6,80,6,},
        [12] = {12,6,81,1,},
        [13] = {13,6,81,2,},
        [14] = {14,6,81,3,},
        [15] = {15,11,1205,1,},
        [16] = {16,11,1220,1,},
        [17] = {17,6,95,3,},
        [18] = {18,6,95,6,},
        [19] = {19,6,95,9,},
        [20] = {20,6,85,6,},
        [21] = {21,6,85,12,},
        [22] = {22,6,85,18,},
        [23] = {23,6,94,3,},
        [24] = {24,6,94,6,},
        [25] = {25,6,94,9,},
        [26] = {26,6,159,3,},
        [27] = {27,6,159,6,},
        [28] = {28,6,159,9,},
        [29] = {29,6,141,1,},
        [30] = {30,6,141,2,},
        [31] = {31,6,141,3,},
        [32] = {32,6,142,1,},
        [33] = {33,6,142,2,},
        [34] = {34,6,142,3,},
        [35] = {35,6,143,1,},
        [36] = {36,6,143,2,},
        [37] = {37,6,143,3,},
        [38] = {38,6,92,1,},
        [39] = {39,6,92,2,},
        [40] = {40,6,92,3,},
        [41] = {41,6,93,1,},
        [42] = {42,6,93,2,},
        [43] = {43,6,93,3,},
        [44] = {44,6,146,1,},
        [45] = {45,6,146,2,},
        [46] = {46,6,146,3,},
        [47] = {47,6,13,30,},
        [48] = {48,6,13,70,},
        [49] = {49,6,14,50,},
        [50] = {50,6,172,1,},
        [51] = {51,6,174,1,},
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
    [44] = 44,
    [45] = 45,
    [46] = 46,
    [47] = 47,
    [48] = 48,
    [49] = 49,
    [5] = 5,
    [50] = 50,
    [51] = 51,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in return_charge_award")
        return t._raw[__key_map[k]]
    end
}

-- 
function return_charge_award.length()
    return #return_charge_award._data
end

-- 
function return_charge_award.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function return_charge_award.indexOf(index)
    if index == nil or not return_charge_award._data[index] then
        return nil
    end

    return setmetatable({_raw = return_charge_award._data[index]}, mt)
end

--
function return_charge_award.get(id)
    
    return return_charge_award.indexOf(__index_id[id])
        
end

--
function return_charge_award.set(id, tkey, nvalue)
    local record = return_charge_award.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function return_charge_award.index()
    return __index_id
end

return return_charge_award