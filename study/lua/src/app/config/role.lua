--role

-- key
local __key_map = {
  level = 1,    --角色等级-int 
  exp = 2,    --升级经验-int 
  lvup_power = 3,    --升级恢复体力-int 
  lvup_energy = 4,    --升级恢复精力-int 
  hero_limit = 5,    --武将上限-int 
  equipment_limit = 6,    --装备上限-int 
  treasure_limit = 7,    --宝物上限-int 
  instrument_limit = 8,    --神兵上限-int 
  pet_limit = 9,    --神兽等级上限-int 
  horse_limit = 10,    --战马上限-int 
  historical_hero_limit = 11,    --历代名将上限-int 
  arena_card = 12,    --竞技场翻盘-int 
  silver_para = 13,    --摇钱树参数-int 
  recommend_hero_lv = 14,    --推荐武将等级-int 
  recommend_equipment_lv = 15,    --推荐装备强化等级-int 
  recommend_equipment_refine_lv = 16,    --推荐装备精炼等级-int 
  recommend_treasure_lv = 17,    --推荐宝物强化等级-int 
  recommend_treasure_refine_lv = 18,    --推荐宝物精炼等级-int 
  recommend_instrument_refine_lv = 19,    --推荐神兵进阶等级-int 
  recommend_pet_lv = 20,    --推荐神兽等级-int 

}

-- data
local role = {
    _data = {
        [1] = {1,6,5,5,500,500,500,500,1,500,500,12,1000,1,0,0,0,0,0,1,},
        [2] = {2,18,5,5,500,500,500,500,2,500,500,12,1010,1,0,0,0,0,0,2,},
        [3] = {3,25,5,5,500,500,500,500,3,500,500,12,1020,1,0,0,0,0,0,3,},
        [4] = {4,36,5,5,500,500,500,500,4,500,500,12,1030,1,0,0,0,0,0,4,},
        [5] = {5,140,5,5,500,500,500,500,5,500,500,12,1040,1,10,0,0,0,0,5,},
        [6] = {6,170,10,5,500,500,500,500,6,500,500,12,1050,6,10,0,0,0,0,6,},
        [7] = {7,200,10,5,500,500,500,500,7,500,500,12,1060,7,10,0,0,0,0,7,},
        [8] = {8,240,10,5,500,500,500,500,8,500,500,12,1070,8,10,0,0,0,0,8,},
        [9] = {9,360,10,5,500,500,500,500,9,500,500,12,1080,9,10,0,0,0,0,9,},
        [10] = {10,400,10,5,500,500,500,500,10,500,500,12,1090,10,20,0,0,0,0,10,},
        [11] = {11,500,10,5,500,500,500,500,11,500,500,12,1100,11,20,0,0,0,0,11,},
        [12] = {12,600,15,5,500,500,500,500,12,500,500,12,1110,12,20,0,2,0,0,12,},
        [13] = {13,650,15,5,500,500,500,500,13,500,500,12,1120,13,20,0,2,0,0,13,},
        [14] = {14,840,15,5,500,500,500,500,14,500,500,12,1130,14,20,0,2,0,0,14,},
        [15] = {15,1050,15,10,500,500,500,500,15,500,500,12,1140,15,30,0,2,0,0,15,},
        [16] = {16,1280,15,10,500,500,500,500,16,500,500,12,1150,16,30,0,2,0,0,16,},
        [17] = {17,1530,15,10,500,500,500,500,17,500,500,12,1160,17,30,0,3,0,0,17,},
        [18] = {18,1800,15,10,500,500,500,500,18,500,500,12,1170,18,30,0,3,0,0,18,},
        [19] = {19,2280,15,10,500,500,500,500,19,500,500,12,1180,19,30,0,4,0,0,19,},
        [20] = {20,2860,15,10,500,500,500,500,20,500,500,12,1190,20,40,0,4,0,0,20,},
        [21] = {21,3470,15,10,500,500,500,500,21,500,500,12,1200,21,40,0,5,0,0,21,},
        [22] = {22,4130,15,10,500,500,500,500,22,500,500,12,1210,22,40,0,5,0,0,22,},
        [23] = {23,4850,15,10,500,500,500,500,23,500,500,12,1220,23,40,0,5,0,0,23,},
        [24] = {24,5620,15,10,500,500,500,500,24,500,500,12,1230,24,40,0,5,0,0,24,},
        [25] = {25,6440,15,10,500,500,500,500,25,500,500,12,1240,25,50,0,5,0,0,25,},
        [26] = {26,7320,15,10,500,500,500,500,26,500,500,12,1250,25,50,0,5,0,0,26,},
        [27] = {27,8250,15,10,500,500,500,500,27,500,500,12,1260,25,50,0,5,0,0,27,},
        [28] = {28,9240,15,10,500,500,500,500,28,500,500,12,1270,25,50,0,5,0,0,28,},
        [29] = {29,10360,15,10,500,500,500,500,29,500,500,12,1280,25,50,0,5,0,0,29,},
        [30] = {30,11560,15,10,500,500,500,500,30,500,500,12,1290,26,60,0,5,0,0,30,},
        [31] = {31,12090,20,10,500,500,500,500,31,500,500,12,1300,27,60,0,5,0,0,31,},
        [32] = {32,12570,20,10,500,500,500,500,32,500,500,12,1310,28,60,0,6,0,0,32,},
        [33] = {33,20400,20,10,500,500,500,500,33,500,500,12,1320,29,60,0,6,0,0,33,},
        [34] = {34,22500,20,10,500,500,500,500,34,500,500,12,1330,30,60,0,7,0,0,34,},
        [35] = {35,22800,20,10,500,500,500,500,35,500,500,12,1340,35,70,0,7,0,0,35,},
        [36] = {36,23100,20,10,500,500,500,500,36,500,500,12,1350,35,70,0,8,0,0,36,},
        [37] = {37,23500,20,10,500,500,500,500,37,500,500,12,1360,35,70,0,8,0,0,37,},
        [38] = {38,23800,20,10,500,500,500,500,38,500,500,12,1370,35,70,0,9,0,0,38,},
        [39] = {39,24200,20,10,500,500,500,500,39,500,500,12,1380,35,70,0,9,0,0,39,},
        [40] = {40,24500,20,10,500,500,500,500,40,500,500,12,1390,40,80,10,10,0,0,40,},
        [41] = {41,24800,30,10,500,500,500,500,41,500,500,12,1400,41,80,10,10,0,0,41,},
        [42] = {42,33800,30,10,500,500,500,500,42,500,500,12,1410,42,80,10,11,0,0,42,},
        [43] = {43,34300,30,10,500,500,500,500,43,500,500,12,1420,43,80,10,11,0,0,43,},
        [44] = {44,34700,30,10,500,500,500,500,44,500,500,12,1430,44,80,11,12,0,0,44,},
        [45] = {45,35200,30,10,500,500,500,500,45,500,500,12,1440,45,90,11,12,0,0,45,},
        [46] = {46,35800,30,10,500,500,500,500,46,500,500,12,1450,46,90,11,13,0,50,46,},
        [47] = {47,36100,30,10,500,500,500,500,47,500,500,12,1460,47,90,11,13,0,50,47,},
        [48] = {48,55100,30,10,500,500,500,500,48,500,500,12,1470,48,90,12,14,0,50,48,},
        [49] = {49,55800,30,10,500,500,500,500,49,500,500,12,1480,49,90,12,14,0,50,49,},
        [50] = {50,56500,30,10,500,500,500,500,50,500,500,12,1490,50,100,12,15,6,50,50,},
        [51] = {51,57200,40,10,500,500,500,500,51,500,500,12,1500,51,100,12,15,6,50,51,},
        [52] = {52,79300,40,10,500,500,500,500,52,500,500,12,1510,52,100,13,15,6,50,52,},
        [53] = {53,80400,40,10,500,500,500,500,53,500,500,12,1520,53,100,13,15,6,50,53,},
        [54] = {54,81300,40,10,500,500,500,500,54,500,500,12,1530,54,100,13,16,6,50,54,},
        [55] = {55,83400,40,10,500,500,500,500,55,500,500,12,1540,55,110,13,16,6,50,55,},
        [56] = {56,84300,40,10,500,500,500,500,56,500,500,12,1550,56,110,14,16,6,50,56,},
        [57] = {57,85200,40,10,500,500,500,500,57,500,500,12,1560,57,110,14,16,6,50,57,},
        [58] = {58,87400,40,10,500,500,500,500,58,500,500,12,1570,58,110,14,17,6,50,58,},
        [59] = {59,88300,40,10,500,500,500,500,59,500,500,12,1580,59,110,14,17,7,50,59,},
        [60] = {60,94300,40,10,500,500,500,500,60,500,500,12,1590,60,120,15,17,7,50,60,},
        [61] = {61,99200,50,10,500,500,500,500,61,500,500,12,1600,61,120,15,18,7,50,61,},
        [62] = {62,117900,50,10,500,500,500,500,62,500,500,12,1610,62,120,15,18,7,50,62,},
        [63] = {63,138200,50,10,500,500,500,500,63,500,500,12,1620,63,120,15,19,7,50,63,},
        [64] = {64,152700,50,10,500,500,500,500,64,500,500,12,1630,64,120,16,19,7,50,64,},
        [65] = {65,176800,50,10,500,500,500,500,65,500,500,12,1640,65,130,16,20,7,50,65,},
        [66] = {66,219900,50,10,500,500,500,500,66,500,500,12,1650,66,130,16,20,7,50,66,},
        [67] = {67,275600,50,10,500,500,500,500,67,500,500,12,1660,67,130,16,21,8,50,67,},
        [68] = {68,305000,50,10,500,500,500,500,68,500,500,12,1670,68,130,17,21,8,50,68,},
        [69] = {69,313500,50,10,500,500,500,500,69,500,500,12,1680,69,130,17,22,8,50,69,},
        [70] = {70,316700,50,10,500,500,500,500,70,500,500,12,1690,70,140,17,22,8,50,70,},
        [71] = {71,323800,50,10,500,500,500,500,71,500,500,12,1700,71,140,17,23,8,50,71,},
        [72] = {72,325300,50,10,500,500,500,500,72,500,500,12,1710,72,140,18,23,8,50,72,},
        [73] = {73,328500,50,10,500,500,500,500,73,500,500,12,1720,73,140,18,24,8,50,73,},
        [74] = {74,335500,50,10,500,500,500,500,74,500,500,12,1730,74,140,18,24,8,50,74,},
        [75] = {75,338700,50,10,500,500,500,500,75,500,500,12,1740,75,150,18,25,9,50,75,},
        [76] = {76,363700,50,10,500,500,500,500,76,500,500,12,1750,76,150,19,25,9,50,76,},
        [77] = {77,375200,50,10,500,500,500,500,77,500,500,12,1760,77,150,19,26,9,50,77,},
        [78] = {78,387300,50,10,500,500,500,500,78,500,500,12,1770,78,150,19,26,9,50,78,},
        [79] = {79,448800,50,10,500,500,500,500,79,500,500,12,1780,79,150,19,27,9,50,79,},
        [80] = {80,450900,50,10,500,500,500,500,80,500,500,12,1790,80,160,20,27,9,50,80,},
        [81] = {81,458500,50,10,500,500,500,500,81,500,500,12,1800,81,160,20,28,9,50,81,},
        [82] = {82,461200,50,10,500,500,500,500,82,500,500,12,1810,82,160,20,28,9,50,82,},
        [83] = {83,478900,50,10,500,500,500,500,83,500,500,12,1820,83,160,20,29,9,50,83,},
        [84] = {84,505000,50,10,500,500,500,500,84,500,500,12,1830,84,160,21,29,10,50,84,},
        [85] = {85,540000,50,10,500,500,500,500,85,500,500,12,1840,85,170,21,30,10,50,85,},
        [86] = {86,552600,50,10,500,500,500,500,86,500,500,12,1850,86,170,21,30,10,50,86,},
        [87] = {87,571800,50,10,500,500,500,500,87,500,500,12,1860,87,170,21,31,10,50,87,},
        [88] = {88,591300,50,10,500,500,500,500,88,500,500,12,1870,88,170,22,31,11,50,88,},
        [89] = {89,655300,50,10,500,500,500,500,89,500,500,12,1880,89,170,22,32,11,50,89,},
        [90] = {90,811700,50,10,500,500,500,500,90,500,500,12,1890,90,180,22,32,11,50,90,},
        [91] = {91,920000,50,10,500,500,500,500,91,500,500,12,1900,91,180,22,33,11,50,91,},
        [92] = {92,1028300,50,10,500,500,500,500,92,500,500,12,1910,92,180,23,33,11,50,92,},
        [93] = {93,1136500,50,10,500,500,500,500,93,500,500,12,1920,93,180,23,34,11,50,93,},
        [94] = {94,1244800,50,10,500,500,500,500,94,500,500,12,1930,94,180,23,34,11,50,94,},
        [95] = {95,1353100,50,10,500,500,500,500,95,500,500,12,1940,95,190,23,35,11,50,95,},
        [96] = {96,1461400,50,10,500,500,500,500,96,500,500,12,1950,96,190,24,35,12,50,96,},
        [97] = {97,1569600,50,10,500,500,500,500,97,500,500,12,1960,97,190,24,36,12,50,97,},
        [98] = {98,1677900,50,10,500,500,500,500,98,500,500,12,1970,98,190,24,36,12,50,98,},
        [99] = {99,1786200,50,10,500,500,500,500,99,500,500,12,1980,99,190,24,37,12,50,99,},
        [100] = {100,1880000,50,10,500,500,500,500,100,500,500,12,1990,100,200,25,37,12,50,100,},
        [101] = {101,1890000,50,10,500,500,500,500,101,500,500,12,2000,101,200,25,38,12,50,101,},
        [102] = {102,1900000,50,10,500,500,500,500,102,500,500,12,2010,102,200,25,38,12,75,102,},
        [103] = {103,2000000,50,10,500,500,500,500,103,500,500,12,2020,103,200,25,39,12,75,103,},
        [104] = {104,2160000,50,10,500,500,500,500,104,500,500,12,2030,104,200,26,39,13,75,104,},
        [105] = {105,2420000,50,10,500,500,500,500,105,500,500,12,2040,105,210,26,40,13,75,105,},
        [106] = {106,2460000,50,10,500,500,500,500,106,500,500,12,2050,106,210,26,40,13,75,106,},
        [107] = {107,2470000,50,10,500,500,500,500,107,500,500,12,2060,107,210,26,41,13,75,107,},
        [108] = {108,2500000,50,10,500,500,500,500,108,500,500,12,2070,108,210,27,41,13,75,108,},
        [109] = {109,2520000,50,10,500,500,500,500,109,500,500,12,2080,109,210,27,42,13,75,109,},
        [110] = {110,2550000,50,10,500,500,500,500,110,500,500,12,2090,110,220,27,42,18,75,110,},
        [111] = {111,2560000,50,10,500,500,500,500,111,500,500,12,2100,111,220,27,43,18,75,111,},
        [112] = {112,2580000,50,10,500,500,500,500,112,500,500,12,2110,112,220,28,43,19,75,112,},
        [113] = {113,2590000,50,10,500,500,500,500,113,500,500,12,2120,113,220,28,44,19,75,113,},
        [114] = {114,2610000,50,10,500,500,500,500,114,500,500,12,2130,114,220,28,44,19,75,114,},
        [115] = {115,2620000,50,10,500,500,500,500,115,500,500,12,2140,115,230,28,45,19,75,115,},
        [116] = {116,2630000,50,10,500,500,500,500,116,500,500,12,2150,116,230,29,45,19,75,116,},
        [117] = {117,2650000,50,10,500,500,500,500,117,500,500,12,2160,117,230,29,46,19,75,117,},
        [118] = {118,2660000,50,10,500,500,500,500,118,500,500,12,2170,118,230,29,46,19,75,118,},
        [119] = {119,2670000,50,10,500,500,500,500,119,500,500,12,2180,119,230,29,47,19,75,119,},
        [120] = {120,2690000,50,10,500,500,500,500,120,500,500,12,2190,120,240,30,100,25,100,120,},
    }
}

-- index
local __index_level = {
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
        assert(__key_map[k], "cannot find " .. k .. " in role")
        return t._raw[__key_map[k]]
    end
}

-- 
function role.length()
    return #role._data
end

-- 
function role.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function role.indexOf(index)
    if index == nil or not role._data[index] then
        return nil
    end

    return setmetatable({_raw = role._data[index]}, mt)
end

--
function role.get(level)
    
    return role.indexOf(__index_level[level])
        
end

--
function role.set(level, tkey, nvalue)
    local record = role.get(level)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function role.index()
    return __index_level
end

return role