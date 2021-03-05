--ten_jade_auction_price

-- key
local __key_map = {
  id = 1,    --id-int 
  price_add = 2,    --价格加值-int 

}

-- data
local ten_jade_auction_price = {
    _data = {
        [1] = {0,10,},
        [2] = {1,10,},
        [3] = {2,20,},
        [4] = {3,30,},
        [5] = {4,30,},
        [6] = {5,50,},
        [7] = {6,50,},
        [8] = {7,50,},
        [9] = {8,70,},
        [10] = {9,70,},
        [11] = {10,70,},
        [12] = {11,70,},
        [13] = {12,70,},
        [14] = {13,180,},
        [15] = {14,180,},
        [16] = {15,180,},
        [17] = {16,180,},
        [18] = {17,180,},
        [19] = {18,420,},
        [20] = {19,420,},
        [21] = {20,420,},
        [22] = {21,420,},
        [23] = {22,420,},
        [24] = {23,900,},
        [25] = {24,900,},
        [26] = {25,900,},
        [27] = {26,900,},
        [28] = {27,900,},
        [29] = {28,900,},
        [30] = {29,2250,},
        [31] = {30,2250,},
        [32] = {31,2250,},
        [33] = {32,2250,},
        [34] = {33,2250,},
        [35] = {34,2250,},
        [36] = {35,4500,},
        [37] = {36,4500,},
        [38] = {37,4500,},
        [39] = {38,4500,},
        [40] = {39,4500,},
        [41] = {40,4500,},
        [42] = {41,4500,},
        [43] = {42,9000,},
        [44] = {43,9000,},
        [45] = {44,9000,},
        [46] = {45,9000,},
        [47] = {46,9000,},
        [48] = {47,9000,},
        [49] = {48,9000,},
        [50] = {49,9000,},
        [51] = {50,9000,},
        [52] = {51,15000,},
    }
}

-- index
local __index_id = {
    [0] = 1,
    [1] = 2,
    [10] = 11,
    [11] = 12,
    [12] = 13,
    [13] = 14,
    [14] = 15,
    [15] = 16,
    [16] = 17,
    [17] = 18,
    [18] = 19,
    [19] = 20,
    [2] = 3,
    [20] = 21,
    [21] = 22,
    [22] = 23,
    [23] = 24,
    [24] = 25,
    [25] = 26,
    [26] = 27,
    [27] = 28,
    [28] = 29,
    [29] = 30,
    [3] = 4,
    [30] = 31,
    [31] = 32,
    [32] = 33,
    [33] = 34,
    [34] = 35,
    [35] = 36,
    [36] = 37,
    [37] = 38,
    [38] = 39,
    [39] = 40,
    [4] = 5,
    [40] = 41,
    [41] = 42,
    [42] = 43,
    [43] = 44,
    [44] = 45,
    [45] = 46,
    [46] = 47,
    [47] = 48,
    [48] = 49,
    [49] = 50,
    [5] = 6,
    [50] = 51,
    [51] = 52,
    [6] = 7,
    [7] = 8,
    [8] = 9,
    [9] = 10,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in ten_jade_auction_price")
        return t._raw[__key_map[k]]
    end
}

-- 
function ten_jade_auction_price.length()
    return #ten_jade_auction_price._data
end

-- 
function ten_jade_auction_price.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function ten_jade_auction_price.indexOf(index)
    if index == nil or not ten_jade_auction_price._data[index] then
        return nil
    end

    return setmetatable({_raw = ten_jade_auction_price._data[index]}, mt)
end

--
function ten_jade_auction_price.get(id)
    
    return ten_jade_auction_price.indexOf(__index_id[id])
        
end

--
function ten_jade_auction_price.set(id, tkey, nvalue)
    local record = ten_jade_auction_price.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function ten_jade_auction_price.index()
    return __index_id
end

return ten_jade_auction_price