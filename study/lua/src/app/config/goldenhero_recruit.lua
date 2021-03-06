--goldenhero_recruit

-- key
local __key_map = {
  order = 1,    --排序-int 
  hero = 2,    --金将id-int 

}

-- data
local goldenhero_recruit = {
    _data = {
        [1] = {1,150,},
        [2] = {2,150,},
        [3] = {3,150,},
        [4] = {4,150,},
        [5] = {5,150,},
        [6] = {6,150,},
        [7] = {7,150,},
        [8] = {8,150,},
        [9] = {9,150,},
        [10] = {10,150,},
        [11] = {11,150,},
        [12] = {12,150,},
        [13] = {13,150,},
        [14] = {14,150,},
        [15] = {15,150,},
        [16] = {16,150,},
        [17] = {17,150,},
        [18] = {18,150,},
        [19] = {19,150,},
        [20] = {20,150,},
        [21] = {21,150,},
        [22] = {22,150,},
        [23] = {23,150,},
        [24] = {24,250,},
        [25] = {25,250,},
        [26] = {26,250,},
        [27] = {27,250,},
        [28] = {28,250,},
        [29] = {29,250,},
        [30] = {30,250,},
        [31] = {31,250,},
        [32] = {32,250,},
        [33] = {33,250,},
        [34] = {34,250,},
        [35] = {35,250,},
        [36] = {36,250,},
        [37] = {37,250,},
        [38] = {38,250,},
        [39] = {39,250,},
        [40] = {40,250,},
        [41] = {41,250,},
        [42] = {42,250,},
        [43] = {43,250,},
        [44] = {44,250,},
        [45] = {45,250,},
        [46] = {46,250,},
        [47] = {47,350,},
        [48] = {48,350,},
        [49] = {49,350,},
        [50] = {50,350,},
        [51] = {51,350,},
        [52] = {52,350,},
        [53] = {53,350,},
        [54] = {54,350,},
        [55] = {55,350,},
        [56] = {56,350,},
        [57] = {57,350,},
        [58] = {58,350,},
        [59] = {59,350,},
        [60] = {60,350,},
        [61] = {61,350,},
        [62] = {62,350,},
        [63] = {63,350,},
        [64] = {64,350,},
        [65] = {65,350,},
        [66] = {66,350,},
        [67] = {67,350,},
        [68] = {68,350,},
        [69] = {69,350,},
        [70] = {70,450,},
        [71] = {71,450,},
        [72] = {72,450,},
        [73] = {73,450,},
        [74] = {74,450,},
        [75] = {75,450,},
        [76] = {76,450,},
        [77] = {77,450,},
        [78] = {78,450,},
        [79] = {79,450,},
        [80] = {80,450,},
        [81] = {81,450,},
        [82] = {82,450,},
        [83] = {83,450,},
        [84] = {84,450,},
        [85] = {85,450,},
        [86] = {86,450,},
        [87] = {87,450,},
        [88] = {88,450,},
        [89] = {89,450,},
        [90] = {90,450,},
        [91] = {91,450,},
        [92] = {92,450,},
        [93] = {93,151,},
        [94] = {94,151,},
        [95] = {95,151,},
        [96] = {96,151,},
        [97] = {97,151,},
        [98] = {98,151,},
        [99] = {99,151,},
        [100] = {100,151,},
        [101] = {101,151,},
        [102] = {102,151,},
        [103] = {103,151,},
        [104] = {104,151,},
        [105] = {105,151,},
        [106] = {106,151,},
        [107] = {107,151,},
        [108] = {108,151,},
        [109] = {109,151,},
        [110] = {110,151,},
        [111] = {111,151,},
        [112] = {112,151,},
        [113] = {113,151,},
        [114] = {114,151,},
        [115] = {115,151,},
        [116] = {116,251,},
        [117] = {117,251,},
        [118] = {118,251,},
        [119] = {119,251,},
        [120] = {120,251,},
        [121] = {121,251,},
        [122] = {122,251,},
        [123] = {123,251,},
        [124] = {124,251,},
        [125] = {125,251,},
        [126] = {126,251,},
        [127] = {127,251,},
        [128] = {128,251,},
        [129] = {129,251,},
        [130] = {130,251,},
        [131] = {131,251,},
        [132] = {132,251,},
        [133] = {133,251,},
        [134] = {134,251,},
        [135] = {135,251,},
        [136] = {136,251,},
        [137] = {137,251,},
        [138] = {138,251,},
        [139] = {139,351,},
        [140] = {140,351,},
        [141] = {141,351,},
        [142] = {142,351,},
        [143] = {143,351,},
        [144] = {144,351,},
        [145] = {145,351,},
        [146] = {146,351,},
        [147] = {147,351,},
        [148] = {148,351,},
        [149] = {149,351,},
        [150] = {150,351,},
        [151] = {151,351,},
        [152] = {152,351,},
        [153] = {153,351,},
        [154] = {154,351,},
        [155] = {155,351,},
        [156] = {156,351,},
        [157] = {157,351,},
        [158] = {158,351,},
        [159] = {159,351,},
        [160] = {160,351,},
        [161] = {161,351,},
        [162] = {162,451,},
        [163] = {163,451,},
        [164] = {164,451,},
        [165] = {165,451,},
        [166] = {166,451,},
        [167] = {167,451,},
        [168] = {168,451,},
        [169] = {169,451,},
        [170] = {170,451,},
        [171] = {171,451,},
        [172] = {172,451,},
        [173] = {173,451,},
        [174] = {174,451,},
        [175] = {175,451,},
        [176] = {176,451,},
        [177] = {177,451,},
        [178] = {178,451,},
        [179] = {179,451,},
        [180] = {180,451,},
        [181] = {181,451,},
        [182] = {182,451,},
        [183] = {183,451,},
        [184] = {184,451,},
        [185] = {185,152,},
        [186] = {186,152,},
        [187] = {187,152,},
        [188] = {188,152,},
        [189] = {189,152,},
        [190] = {190,152,},
        [191] = {191,152,},
        [192] = {192,152,},
        [193] = {193,152,},
        [194] = {194,152,},
        [195] = {195,152,},
        [196] = {196,152,},
        [197] = {197,152,},
        [198] = {198,152,},
        [199] = {199,152,},
        [200] = {200,152,},
        [201] = {201,152,},
        [202] = {202,152,},
        [203] = {203,152,},
        [204] = {204,152,},
        [205] = {205,152,},
        [206] = {206,152,},
        [207] = {207,152,},
        [208] = {208,252,},
        [209] = {209,252,},
        [210] = {210,252,},
        [211] = {211,252,},
        [212] = {212,252,},
        [213] = {213,252,},
        [214] = {214,252,},
        [215] = {215,252,},
        [216] = {216,252,},
        [217] = {217,252,},
        [218] = {218,252,},
        [219] = {219,252,},
        [220] = {220,252,},
        [221] = {221,252,},
        [222] = {222,252,},
        [223] = {223,252,},
        [224] = {224,252,},
        [225] = {225,252,},
        [226] = {226,252,},
        [227] = {227,252,},
        [228] = {228,252,},
        [229] = {229,252,},
        [230] = {230,252,},
        [231] = {231,352,},
        [232] = {232,352,},
        [233] = {233,352,},
        [234] = {234,352,},
        [235] = {235,352,},
        [236] = {236,352,},
        [237] = {237,352,},
        [238] = {238,352,},
        [239] = {239,352,},
        [240] = {240,352,},
        [241] = {241,352,},
        [242] = {242,352,},
        [243] = {243,352,},
        [244] = {244,352,},
        [245] = {245,352,},
        [246] = {246,352,},
        [247] = {247,352,},
        [248] = {248,352,},
        [249] = {249,352,},
        [250] = {250,352,},
        [251] = {251,352,},
        [252] = {252,352,},
        [253] = {253,352,},
        [254] = {254,452,},
        [255] = {255,452,},
        [256] = {256,452,},
        [257] = {257,452,},
        [258] = {258,452,},
        [259] = {259,452,},
        [260] = {260,452,},
        [261] = {261,452,},
        [262] = {262,452,},
        [263] = {263,452,},
        [264] = {264,452,},
        [265] = {265,452,},
        [266] = {266,452,},
        [267] = {267,452,},
        [268] = {268,452,},
        [269] = {269,452,},
        [270] = {270,452,},
        [271] = {271,452,},
        [272] = {272,452,},
        [273] = {273,452,},
        [274] = {274,452,},
        [275] = {275,452,},
        [276] = {276,452,},
        [277] = {277,153,},
        [278] = {278,153,},
        [279] = {279,153,},
        [280] = {280,153,},
        [281] = {281,153,},
        [282] = {282,153,},
        [283] = {283,153,},
        [284] = {284,153,},
        [285] = {285,153,},
        [286] = {286,153,},
        [287] = {287,153,},
        [288] = {288,153,},
        [289] = {289,153,},
        [290] = {290,153,},
        [291] = {291,153,},
        [292] = {292,153,},
        [293] = {293,153,},
        [294] = {294,153,},
        [295] = {295,153,},
        [296] = {296,153,},
        [297] = {297,153,},
        [298] = {298,153,},
        [299] = {299,153,},
        [300] = {300,253,},
        [301] = {301,253,},
        [302] = {302,253,},
        [303] = {303,253,},
        [304] = {304,253,},
        [305] = {305,253,},
        [306] = {306,253,},
        [307] = {307,253,},
        [308] = {308,253,},
        [309] = {309,253,},
        [310] = {310,253,},
        [311] = {311,253,},
        [312] = {312,253,},
        [313] = {313,253,},
        [314] = {314,253,},
        [315] = {315,253,},
        [316] = {316,253,},
        [317] = {317,253,},
        [318] = {318,253,},
        [319] = {319,253,},
        [320] = {320,253,},
        [321] = {321,253,},
        [322] = {322,253,},
        [323] = {323,353,},
        [324] = {324,353,},
        [325] = {325,353,},
        [326] = {326,353,},
        [327] = {327,353,},
        [328] = {328,353,},
        [329] = {329,353,},
        [330] = {330,353,},
        [331] = {331,353,},
        [332] = {332,353,},
        [333] = {333,353,},
        [334] = {334,353,},
        [335] = {335,353,},
        [336] = {336,353,},
        [337] = {337,353,},
        [338] = {338,353,},
        [339] = {339,353,},
        [340] = {340,353,},
        [341] = {341,353,},
        [342] = {342,353,},
        [343] = {343,353,},
        [344] = {344,353,},
        [345] = {345,353,},
        [346] = {346,453,},
        [347] = {347,453,},
        [348] = {348,453,},
        [349] = {349,453,},
        [350] = {350,453,},
        [351] = {351,453,},
        [352] = {352,453,},
        [353] = {353,453,},
        [354] = {354,453,},
        [355] = {355,453,},
        [356] = {356,453,},
        [357] = {357,453,},
        [358] = {358,453,},
        [359] = {359,453,},
        [360] = {360,453,},
        [361] = {361,453,},
        [362] = {362,453,},
        [363] = {363,453,},
        [364] = {364,453,},
        [365] = {365,453,},
        [366] = {366,453,},
        [367] = {367,453,},
        [368] = {368,453,},
    }
}

-- index
local __index_order = {
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
    [122] = 122,
    [123] = 123,
    [124] = 124,
    [125] = 125,
    [126] = 126,
    [127] = 127,
    [128] = 128,
    [129] = 129,
    [13] = 13,
    [130] = 130,
    [131] = 131,
    [132] = 132,
    [133] = 133,
    [134] = 134,
    [135] = 135,
    [136] = 136,
    [137] = 137,
    [138] = 138,
    [139] = 139,
    [14] = 14,
    [140] = 140,
    [141] = 141,
    [142] = 142,
    [143] = 143,
    [144] = 144,
    [145] = 145,
    [146] = 146,
    [147] = 147,
    [148] = 148,
    [149] = 149,
    [15] = 15,
    [150] = 150,
    [151] = 151,
    [152] = 152,
    [153] = 153,
    [154] = 154,
    [155] = 155,
    [156] = 156,
    [157] = 157,
    [158] = 158,
    [159] = 159,
    [16] = 16,
    [160] = 160,
    [161] = 161,
    [162] = 162,
    [163] = 163,
    [164] = 164,
    [165] = 165,
    [166] = 166,
    [167] = 167,
    [168] = 168,
    [169] = 169,
    [17] = 17,
    [170] = 170,
    [171] = 171,
    [172] = 172,
    [173] = 173,
    [174] = 174,
    [175] = 175,
    [176] = 176,
    [177] = 177,
    [178] = 178,
    [179] = 179,
    [18] = 18,
    [180] = 180,
    [181] = 181,
    [182] = 182,
    [183] = 183,
    [184] = 184,
    [185] = 185,
    [186] = 186,
    [187] = 187,
    [188] = 188,
    [189] = 189,
    [19] = 19,
    [190] = 190,
    [191] = 191,
    [192] = 192,
    [193] = 193,
    [194] = 194,
    [195] = 195,
    [196] = 196,
    [197] = 197,
    [198] = 198,
    [199] = 199,
    [2] = 2,
    [20] = 20,
    [200] = 200,
    [201] = 201,
    [202] = 202,
    [203] = 203,
    [204] = 204,
    [205] = 205,
    [206] = 206,
    [207] = 207,
    [208] = 208,
    [209] = 209,
    [21] = 21,
    [210] = 210,
    [211] = 211,
    [212] = 212,
    [213] = 213,
    [214] = 214,
    [215] = 215,
    [216] = 216,
    [217] = 217,
    [218] = 218,
    [219] = 219,
    [22] = 22,
    [220] = 220,
    [221] = 221,
    [222] = 222,
    [223] = 223,
    [224] = 224,
    [225] = 225,
    [226] = 226,
    [227] = 227,
    [228] = 228,
    [229] = 229,
    [23] = 23,
    [230] = 230,
    [231] = 231,
    [232] = 232,
    [233] = 233,
    [234] = 234,
    [235] = 235,
    [236] = 236,
    [237] = 237,
    [238] = 238,
    [239] = 239,
    [24] = 24,
    [240] = 240,
    [241] = 241,
    [242] = 242,
    [243] = 243,
    [244] = 244,
    [245] = 245,
    [246] = 246,
    [247] = 247,
    [248] = 248,
    [249] = 249,
    [25] = 25,
    [250] = 250,
    [251] = 251,
    [252] = 252,
    [253] = 253,
    [254] = 254,
    [255] = 255,
    [256] = 256,
    [257] = 257,
    [258] = 258,
    [259] = 259,
    [26] = 26,
    [260] = 260,
    [261] = 261,
    [262] = 262,
    [263] = 263,
    [264] = 264,
    [265] = 265,
    [266] = 266,
    [267] = 267,
    [268] = 268,
    [269] = 269,
    [27] = 27,
    [270] = 270,
    [271] = 271,
    [272] = 272,
    [273] = 273,
    [274] = 274,
    [275] = 275,
    [276] = 276,
    [277] = 277,
    [278] = 278,
    [279] = 279,
    [28] = 28,
    [280] = 280,
    [281] = 281,
    [282] = 282,
    [283] = 283,
    [284] = 284,
    [285] = 285,
    [286] = 286,
    [287] = 287,
    [288] = 288,
    [289] = 289,
    [29] = 29,
    [290] = 290,
    [291] = 291,
    [292] = 292,
    [293] = 293,
    [294] = 294,
    [295] = 295,
    [296] = 296,
    [297] = 297,
    [298] = 298,
    [299] = 299,
    [3] = 3,
    [30] = 30,
    [300] = 300,
    [301] = 301,
    [302] = 302,
    [303] = 303,
    [304] = 304,
    [305] = 305,
    [306] = 306,
    [307] = 307,
    [308] = 308,
    [309] = 309,
    [31] = 31,
    [310] = 310,
    [311] = 311,
    [312] = 312,
    [313] = 313,
    [314] = 314,
    [315] = 315,
    [316] = 316,
    [317] = 317,
    [318] = 318,
    [319] = 319,
    [32] = 32,
    [320] = 320,
    [321] = 321,
    [322] = 322,
    [323] = 323,
    [324] = 324,
    [325] = 325,
    [326] = 326,
    [327] = 327,
    [328] = 328,
    [329] = 329,
    [33] = 33,
    [330] = 330,
    [331] = 331,
    [332] = 332,
    [333] = 333,
    [334] = 334,
    [335] = 335,
    [336] = 336,
    [337] = 337,
    [338] = 338,
    [339] = 339,
    [34] = 34,
    [340] = 340,
    [341] = 341,
    [342] = 342,
    [343] = 343,
    [344] = 344,
    [345] = 345,
    [346] = 346,
    [347] = 347,
    [348] = 348,
    [349] = 349,
    [35] = 35,
    [350] = 350,
    [351] = 351,
    [352] = 352,
    [353] = 353,
    [354] = 354,
    [355] = 355,
    [356] = 356,
    [357] = 357,
    [358] = 358,
    [359] = 359,
    [36] = 36,
    [360] = 360,
    [361] = 361,
    [362] = 362,
    [363] = 363,
    [364] = 364,
    [365] = 365,
    [366] = 366,
    [367] = 367,
    [368] = 368,
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
        assert(__key_map[k], "cannot find " .. k .. " in goldenhero_recruit")
        return t._raw[__key_map[k]]
    end
}

-- 
function goldenhero_recruit.length()
    return #goldenhero_recruit._data
end

-- 
function goldenhero_recruit.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function goldenhero_recruit.indexOf(index)
    if index == nil or not goldenhero_recruit._data[index] then
        return nil
    end

    return setmetatable({_raw = goldenhero_recruit._data[index]}, mt)
end

--
function goldenhero_recruit.get(order)
    
    return goldenhero_recruit.indexOf(__index_order[order])
        
end

--
function goldenhero_recruit.set(order, key, value)
    local record = goldenhero_recruit.get(order)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function goldenhero_recruit.index()
    return __index_order
end

return goldenhero_recruit