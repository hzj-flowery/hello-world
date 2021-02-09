--ten_jade_auction_content

-- key
local __key_map = {
  id = 1,    --id-int 
  reward_id = 2,    --奖励组id-int 
  auction_full_tab = 3,    --所属拍卖页签-int 
  type = 4,    --类型-int 
  value = 5,    --类型值id-int 
  size = 6,    --数量-int 
  produce_number = 7,    --产出组数量-int 
  order = 8,    --排序-int 

}

-- data
local ten_jade_auction_content = {
    _data = {
        [1] = {1,101,1,0,0,0,12,1,},
        [2] = {2,102,2,0,0,0,6,2,},
        [3] = {3,103,3,6,555,1,16,3,},
        [4] = {4,104,3,6,556,1,16,4,},
        [5] = {5,201,1,0,0,0,12,1,},
        [6] = {6,202,2,0,0,0,6,2,},
        [7] = {7,203,3,6,555,1,16,3,},
        [8] = {8,204,3,6,556,1,16,4,},
        [9] = {9,301,1,0,0,0,12,1,},
        [10] = {10,302,2,0,0,0,6,2,},
        [11] = {11,303,3,6,555,1,16,3,},
        [12] = {12,304,3,6,556,1,16,4,},
        [13] = {13,401,1,0,0,0,11,1,},
        [14] = {14,402,2,0,0,0,6,2,},
        [15] = {15,403,3,6,555,1,14,3,},
        [16] = {16,404,3,6,556,1,14,4,},
        [17] = {17,501,1,0,0,0,11,1,},
        [18] = {18,502,2,0,0,0,5,2,},
        [19] = {19,503,3,6,555,1,14,3,},
        [20] = {20,504,3,6,556,1,14,4,},
        [21] = {21,601,1,0,0,0,10,1,},
        [22] = {22,602,2,0,0,0,5,2,},
        [23] = {23,603,3,6,555,1,12,3,},
        [24] = {24,604,3,6,556,1,12,4,},
        [25] = {25,701,1,0,0,0,9,1,},
        [26] = {26,702,2,0,0,0,5,2,},
        [27] = {27,703,3,6,555,1,12,3,},
        [28] = {28,704,3,6,556,1,12,4,},
        [29] = {29,801,1,0,0,0,8,1,},
        [30] = {30,802,2,0,0,0,5,2,},
        [31] = {31,803,3,6,555,1,12,3,},
        [32] = {32,804,3,6,556,1,12,4,},
        [33] = {33,901,1,0,0,0,8,1,},
        [34] = {34,902,2,0,0,0,4,2,},
        [35] = {35,903,3,6,555,1,10,3,},
        [36] = {36,904,3,6,556,1,10,4,},
        [37] = {37,1001,1,0,0,0,8,1,},
        [38] = {38,1002,2,0,0,0,3,2,},
        [39] = {39,1003,3,6,555,1,10,3,},
        [40] = {40,1004,3,6,556,1,10,4,},
        [41] = {41,1101,1,0,0,0,7,1,},
        [42] = {42,1102,2,0,0,0,3,2,},
        [43] = {43,1103,3,6,555,1,8,3,},
        [44] = {44,1104,3,6,556,1,8,4,},
        [45] = {45,1201,1,0,0,0,6,1,},
        [46] = {46,1202,2,0,0,0,3,2,},
        [47] = {47,1203,3,6,555,1,8,3,},
        [48] = {48,1204,3,6,556,1,8,4,},
        [49] = {49,1301,1,0,0,0,5,1,},
        [50] = {50,1302,2,0,0,0,3,2,},
        [51] = {51,1303,3,6,555,1,6,3,},
        [52] = {52,1304,3,6,556,1,6,4,},
        [53] = {53,1401,1,0,0,0,5,1,},
        [54] = {54,1402,2,0,0,0,2,2,},
        [55] = {55,1403,3,6,555,1,6,3,},
        [56] = {56,1404,3,6,556,1,6,4,},
        [57] = {57,1501,1,0,0,0,4,1,},
        [58] = {58,1502,2,0,0,0,2,2,},
        [59] = {59,1503,3,6,555,1,4,3,},
        [60] = {60,1504,3,6,556,1,4,4,},
        [61] = {61,1601,1,0,0,0,3,1,},
        [62] = {62,1602,2,0,0,0,2,2,},
        [63] = {63,1603,3,6,555,1,4,3,},
        [64] = {64,1604,3,6,556,1,4,4,},
        [65] = {65,1701,1,0,0,0,3,1,},
        [66] = {66,1702,2,0,0,0,1,2,},
        [67] = {67,1703,3,6,555,1,2,3,},
        [68] = {68,1704,3,6,556,1,2,4,},
        [69] = {69,1801,1,0,0,0,2,1,},
        [70] = {70,1802,2,0,0,0,1,2,},
        [71] = {71,1803,3,6,555,1,2,3,},
        [72] = {72,1804,3,6,556,1,2,4,},
        [73] = {73,1901,1,0,0,0,2,1,},
        [74] = {74,1902,2,0,0,0,1,2,},
        [75] = {75,1903,3,6,555,1,2,3,},
        [76] = {76,1904,3,6,556,1,2,4,},
        [77] = {77,2001,1,0,0,0,1,1,},
        [78] = {78,2002,2,0,0,0,0,2,},
        [79] = {79,2003,3,6,555,1,1,3,},
        [80] = {80,2004,3,6,556,1,1,4,},
        [81] = {81,2101,1,0,0,0,1,1,},
        [82] = {82,2102,2,0,0,0,0,2,},
        [83] = {83,2103,3,6,555,1,1,3,},
        [84] = {84,2104,3,6,556,1,1,4,},
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
    [52] = 52,
    [53] = 53,
    [54] = 54,
    [55] = 55,
    [56] = 56,
    [57] = 57,
    [58] = 58,
    [59] = 59,
    [6] = 6,
    [60] = 60,
    [61] = 61,
    [62] = 62,
    [63] = 63,
    [64] = 64,
    [65] = 65,
    [66] = 66,
    [67] = 67,
    [68] = 68,
    [69] = 69,
    [7] = 7,
    [70] = 70,
    [71] = 71,
    [72] = 72,
    [73] = 73,
    [74] = 74,
    [75] = 75,
    [76] = 76,
    [77] = 77,
    [78] = 78,
    [79] = 79,
    [8] = 8,
    [80] = 80,
    [81] = 81,
    [82] = 82,
    [83] = 83,
    [84] = 84,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in ten_jade_auction_content")
        return t._raw[__key_map[k]]
    end
}

-- 
function ten_jade_auction_content.length()
    return #ten_jade_auction_content._data
end

-- 
function ten_jade_auction_content.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function ten_jade_auction_content.indexOf(index)
    if index == nil or not ten_jade_auction_content._data[index] then
        return nil
    end

    return setmetatable({_raw = ten_jade_auction_content._data[index]}, mt)
end

--
function ten_jade_auction_content.get(id)
    
    return ten_jade_auction_content.indexOf(__index_id[id])
        
end

--
function ten_jade_auction_content.set(id, tkey, nvalue)
    local record = ten_jade_auction_content.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function ten_jade_auction_content.index()
    return __index_id
end

return ten_jade_auction_content