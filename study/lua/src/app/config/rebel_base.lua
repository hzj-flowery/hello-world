--rebel_base

-- key
local __key_map = {
  id = 1,    --叛军id-int 
  run_time = 2,    --逃跑时间（秒）-int 
  find_drop = 3,    --发现并击杀奖励-int 
  kill_drop = 4,    --最终击杀奖励-int 
  kill_attend_award = 5,    --击杀参与奖励-int 
  face = 6,    --表情-int 
  name = 7,    --叛军名称-string 
  res = 8,    --立绘形象-int 
  color = 9,    --强敌品质-int 
  in_res = 10,    --战斗背景-int 

}

-- data
local rebel_base = {
    _data = {
        [1] = {1,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [2] = {2,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [3] = {3,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [4] = {4,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [5] = {5,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [6] = {6,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [7] = {7,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [8] = {8,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [9] = {9,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [10] = {10,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [11] = {11,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [12] = {12,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
        [13] = {13,86400,5313,5413,5414,0,"【神】孟获",213,6,13,},
        [14] = {14,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [15] = {15,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [16] = {16,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [17] = {17,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [18] = {18,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [19] = {19,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [20] = {20,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [21] = {21,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [22] = {22,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [23] = {23,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [24] = {24,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [25] = {25,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
        [26] = {26,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [27] = {27,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [28] = {28,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [29] = {29,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [30] = {30,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [31] = {31,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [32] = {32,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [33] = {33,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [34] = {34,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [35] = {35,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [36] = {36,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [37] = {37,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
        [38] = {38,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [39] = {39,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [40] = {40,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [41] = {41,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [42] = {42,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [43] = {43,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [44] = {44,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [45] = {45,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [46] = {46,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [47] = {47,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [48] = {48,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [49] = {49,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
        [50] = {50,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [51] = {51,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [52] = {52,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [53] = {53,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [54] = {54,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [55] = {55,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [56] = {56,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [57] = {57,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [58] = {58,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [59] = {59,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [60] = {60,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [61] = {61,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
        [62] = {62,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [63] = {63,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [64] = {64,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [65] = {65,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [66] = {66,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [67] = {67,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [68] = {68,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [69] = {69,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [70] = {70,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [71] = {71,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [72] = {72,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [73] = {73,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
        [74] = {74,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [75] = {75,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [76] = {76,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [77] = {77,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [78] = {78,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [79] = {79,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [80] = {80,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [81] = {81,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [82] = {82,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [83] = {83,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [84] = {84,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [85] = {85,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
        [86] = {86,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [87] = {87,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [88] = {88,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [89] = {89,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [90] = {90,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [91] = {91,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [92] = {92,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [93] = {93,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [94] = {94,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [95] = {95,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [96] = {96,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [97] = {97,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
        [98] = {98,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [99] = {99,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [100] = {100,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [101] = {101,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [102] = {102,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [103] = {103,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [104] = {104,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [105] = {105,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [106] = {106,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [107] = {107,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [108] = {108,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [109] = {109,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
        [110] = {110,3600,5301,5401,0,0,"【常胜】兀突骨",428,3,13,},
        [111] = {111,3600,5302,5402,0,0,"【常胜】沙摩柯",231,3,13,},
        [112] = {112,3600,5303,5403,0,0,"【常胜】祝融",214,3,13,},
        [113] = {113,3600,5304,5404,0,0,"【常胜】孟获",213,3,13,},
        [114] = {114,7200,5305,5405,0,0,"【百战】兀突骨",428,4,13,},
        [115] = {115,7200,5306,5406,0,0,"【百战】沙摩柯",231,4,13,},
        [116] = {116,7200,5307,5407,0,0,"【百战】祝融",214,4,13,},
        [117] = {117,7200,5308,5408,0,0,"【百战】孟获",213,4,13,},
        [118] = {118,14400,5309,5409,0,0,"【不败】兀突骨",428,5,13,},
        [119] = {119,14400,5310,5410,0,0,"【不败】沙摩柯",231,5,13,},
        [120] = {120,14400,5311,5411,0,0,"【不败】祝融",214,5,13,},
        [121] = {121,14400,5312,5412,0,0,"【不败】孟获",213,5,13,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [100] = 100,
    [101] = 101,
    [102] = 102,
    [103] = 103,
    [104] = 104,
    [105] = 105,
    [106] = 106,
    [107] = 107,
    [108] = 108,
    [109] = 109,
    [11] = 11,
    [110] = 110,
    [111] = 111,
    [112] = 112,
    [113] = 113,
    [114] = 114,
    [115] = 115,
    [116] = 116,
    [117] = 117,
    [118] = 118,
    [119] = 119,
    [12] = 12,
    [120] = 120,
    [121] = 121,
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
    [85] = 85,
    [86] = 86,
    [87] = 87,
    [88] = 88,
    [89] = 89,
    [9] = 9,
    [90] = 90,
    [91] = 91,
    [92] = 92,
    [93] = 93,
    [94] = 94,
    [95] = 95,
    [96] = 96,
    [97] = 97,
    [98] = 98,
    [99] = 99,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in rebel_base")
        return t._raw[__key_map[k]]
    end
}

-- 
function rebel_base.length()
    return #rebel_base._data
end

-- 
function rebel_base.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function rebel_base.indexOf(index)
    if index == nil or not rebel_base._data[index] then
        return nil
    end

    return setmetatable({_raw = rebel_base._data[index]}, mt)
end

--
function rebel_base.get(id)
    
    return rebel_base.indexOf(__index_id[id])
        
end

--
function rebel_base.set(id, tkey, nvalue)
    local record = rebel_base.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function rebel_base.index()
    return __index_id
end

return rebel_base