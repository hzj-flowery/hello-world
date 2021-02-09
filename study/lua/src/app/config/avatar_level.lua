--avatar_level

-- key
local __key_map = {
  level = 1,    --等级-int 
  templet = 2,    --模板-int 
  silver = 3,    --消耗银两-int 
  item_id = 4,    --消耗道具id-int 
  item_num = 5,    --消耗道具数量-int 
  levelup_type_1 = 6,    --强化1属性类型-int 
  levelup_value_1 = 7,    --强化1属性数值-int 
  levelup_type_2 = 8,    --强化2属性类型-int 
  levelup_value_2 = 9,    --强化2属性数值-int 
  levelup_type_3 = 10,    --强化3属性类型-int 
  levelup_value_3 = 11,    --强化3属性数值-int 
  levelup_type_4 = 12,    --强化4属性类型-int 
  levelup_value_4 = 13,    --强化4属性数值-int 
  unlock = 14,    --解锁天赋-int 
  talent_name = 15,    --天赋名称-string 
  talent_description = 16,    --天赋描述-string 
  talent_target = 17,    --属性目标-int 
  talent_attr_1 = 18,    --属性类型1-int 
  talent_value_1 = 19,    --属性值1-int 
  talent_attr_2 = 20,    --属性类型2-int 
  talent_value_2 = 21,    --属性值2-int 

}

-- data
local avatar_level = {
    _data = {
        [1] = {1,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [2] = {2,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [3] = {3,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [4] = {4,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [5] = {5,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [6] = {6,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [7] = {7,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [8] = {8,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [9] = {9,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [10] = {10,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [11] = {11,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [12] = {12,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [13] = {13,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [14] = {14,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [15] = {15,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [16] = {16,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [17] = {17,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [18] = {18,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [19] = {19,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [20] = {20,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [21] = {21,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [22] = {22,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [23] = {23,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [24] = {24,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [25] = {25,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [26] = {26,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [27] = {27,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [28] = {28,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [29] = {29,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [30] = {30,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [31] = {31,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [32] = {32,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [33] = {33,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [34] = {34,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [35] = {35,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [36] = {36,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [37] = {37,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [38] = {38,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [39] = {39,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [40] = {40,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [41] = {41,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [42] = {42,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [43] = {43,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [44] = {44,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [45] = {45,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [46] = {46,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [47] = {47,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [48] = {48,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [49] = {49,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [50] = {50,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [51] = {51,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [52] = {52,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [53] = {53,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [54] = {54,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [55] = {55,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [56] = {56,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [57] = {57,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [58] = {58,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [59] = {59,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [60] = {60,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [61] = {61,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [62] = {62,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [63] = {63,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [64] = {64,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [65] = {65,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [66] = {66,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [67] = {67,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [68] = {68,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [69] = {69,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [70] = {70,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [71] = {71,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [72] = {72,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [73] = {73,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [74] = {74,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [75] = {75,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [76] = {76,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [77] = {77,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [78] = {78,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [79] = {79,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [80] = {80,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [81] = {81,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [82] = {82,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [83] = {83,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [84] = {84,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [85] = {85,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [86] = {86,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [87] = {87,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [88] = {88,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [89] = {89,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [90] = {90,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [91] = {91,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [92] = {92,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [93] = {93,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [94] = {94,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [95] = {95,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [96] = {96,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [97] = {97,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [98] = {98,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [99] = {99,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [100] = {100,1,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [101] = {1,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [102] = {2,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [103] = {3,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [104] = {4,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [105] = {5,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [106] = {6,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [107] = {7,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [108] = {8,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [109] = {9,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [110] = {10,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [111] = {11,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [112] = {12,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [113] = {13,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [114] = {14,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [115] = {15,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [116] = {16,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [117] = {17,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [118] = {18,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [119] = {19,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [120] = {20,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [121] = {21,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [122] = {22,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [123] = {23,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [124] = {24,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [125] = {25,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [126] = {26,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [127] = {27,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [128] = {28,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [129] = {29,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [130] = {30,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [131] = {31,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [132] = {32,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [133] = {33,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [134] = {34,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [135] = {35,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [136] = {36,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [137] = {37,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [138] = {38,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [139] = {39,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [140] = {40,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [141] = {41,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [142] = {42,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [143] = {43,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [144] = {44,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [145] = {45,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [146] = {46,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [147] = {47,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [148] = {48,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [149] = {49,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [150] = {50,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [151] = {51,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [152] = {52,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [153] = {53,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [154] = {54,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [155] = {55,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [156] = {56,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [157] = {57,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [158] = {58,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [159] = {59,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [160] = {60,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [161] = {61,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [162] = {62,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [163] = {63,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [164] = {64,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [165] = {65,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [166] = {66,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [167] = {67,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [168] = {68,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [169] = {69,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [170] = {70,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [171] = {71,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [172] = {72,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [173] = {73,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [174] = {74,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [175] = {75,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [176] = {76,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [177] = {77,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [178] = {78,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [179] = {79,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [180] = {80,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [181] = {81,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [182] = {82,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [183] = {83,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [184] = {84,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [185] = {85,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [186] = {86,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [187] = {87,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [188] = {88,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [189] = {89,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [190] = {90,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [191] = {91,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [192] = {92,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [193] = {93,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [194] = {94,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [195] = {95,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [196] = {96,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [197] = {97,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [198] = {98,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [199] = {99,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [200] = {100,2,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [201] = {1,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [202] = {2,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [203] = {3,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [204] = {4,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [205] = {5,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [206] = {6,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [207] = {7,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [208] = {8,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [209] = {9,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [210] = {10,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [211] = {11,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [212] = {12,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [213] = {13,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [214] = {14,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [215] = {15,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [216] = {16,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [217] = {17,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [218] = {18,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [219] = {19,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [220] = {20,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [221] = {21,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [222] = {22,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [223] = {23,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [224] = {24,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [225] = {25,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [226] = {26,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [227] = {27,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [228] = {28,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [229] = {29,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [230] = {30,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [231] = {31,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [232] = {32,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [233] = {33,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [234] = {34,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [235] = {35,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [236] = {36,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [237] = {37,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [238] = {38,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [239] = {39,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [240] = {40,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [241] = {41,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [242] = {42,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [243] = {43,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [244] = {44,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [245] = {45,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [246] = {46,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [247] = {47,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [248] = {48,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [249] = {49,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [250] = {50,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [251] = {51,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [252] = {52,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [253] = {53,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [254] = {54,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [255] = {55,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [256] = {56,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [257] = {57,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [258] = {58,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [259] = {59,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [260] = {60,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [261] = {61,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [262] = {62,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [263] = {63,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [264] = {64,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [265] = {65,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [266] = {66,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [267] = {67,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [268] = {68,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [269] = {69,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [270] = {70,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [271] = {71,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [272] = {72,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [273] = {73,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [274] = {74,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [275] = {75,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [276] = {76,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [277] = {77,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [278] = {78,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [279] = {79,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [280] = {80,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [281] = {81,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [282] = {82,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [283] = {83,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [284] = {84,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [285] = {85,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [286] = {86,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [287] = {87,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [288] = {88,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [289] = {89,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [290] = {90,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [291] = {91,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [292] = {92,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [293] = {93,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [294] = {94,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [295] = {95,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [296] = {96,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [297] = {97,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [298] = {98,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [299] = {99,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
        [300] = {100,3,0,0,0,0,0,0,0,0,0,0,0,0,"","",0,0,0,0,0,},
    }
}

-- index
local __index_level_templet = {
    ["100_1"] = 100,
    ["100_2"] = 200,
    ["100_3"] = 300,
    ["10_1"] = 10,
    ["10_2"] = 110,
    ["10_3"] = 210,
    ["11_1"] = 11,
    ["11_2"] = 111,
    ["11_3"] = 211,
    ["12_1"] = 12,
    ["12_2"] = 112,
    ["12_3"] = 212,
    ["13_1"] = 13,
    ["13_2"] = 113,
    ["13_3"] = 213,
    ["14_1"] = 14,
    ["14_2"] = 114,
    ["14_3"] = 214,
    ["15_1"] = 15,
    ["15_2"] = 115,
    ["15_3"] = 215,
    ["16_1"] = 16,
    ["16_2"] = 116,
    ["16_3"] = 216,
    ["17_1"] = 17,
    ["17_2"] = 117,
    ["17_3"] = 217,
    ["18_1"] = 18,
    ["18_2"] = 118,
    ["18_3"] = 218,
    ["19_1"] = 19,
    ["19_2"] = 119,
    ["19_3"] = 219,
    ["1_1"] = 1,
    ["1_2"] = 101,
    ["1_3"] = 201,
    ["20_1"] = 20,
    ["20_2"] = 120,
    ["20_3"] = 220,
    ["21_1"] = 21,
    ["21_2"] = 121,
    ["21_3"] = 221,
    ["22_1"] = 22,
    ["22_2"] = 122,
    ["22_3"] = 222,
    ["23_1"] = 23,
    ["23_2"] = 123,
    ["23_3"] = 223,
    ["24_1"] = 24,
    ["24_2"] = 124,
    ["24_3"] = 224,
    ["25_1"] = 25,
    ["25_2"] = 125,
    ["25_3"] = 225,
    ["26_1"] = 26,
    ["26_2"] = 126,
    ["26_3"] = 226,
    ["27_1"] = 27,
    ["27_2"] = 127,
    ["27_3"] = 227,
    ["28_1"] = 28,
    ["28_2"] = 128,
    ["28_3"] = 228,
    ["29_1"] = 29,
    ["29_2"] = 129,
    ["29_3"] = 229,
    ["2_1"] = 2,
    ["2_2"] = 102,
    ["2_3"] = 202,
    ["30_1"] = 30,
    ["30_2"] = 130,
    ["30_3"] = 230,
    ["31_1"] = 31,
    ["31_2"] = 131,
    ["31_3"] = 231,
    ["32_1"] = 32,
    ["32_2"] = 132,
    ["32_3"] = 232,
    ["33_1"] = 33,
    ["33_2"] = 133,
    ["33_3"] = 233,
    ["34_1"] = 34,
    ["34_2"] = 134,
    ["34_3"] = 234,
    ["35_1"] = 35,
    ["35_2"] = 135,
    ["35_3"] = 235,
    ["36_1"] = 36,
    ["36_2"] = 136,
    ["36_3"] = 236,
    ["37_1"] = 37,
    ["37_2"] = 137,
    ["37_3"] = 237,
    ["38_1"] = 38,
    ["38_2"] = 138,
    ["38_3"] = 238,
    ["39_1"] = 39,
    ["39_2"] = 139,
    ["39_3"] = 239,
    ["3_1"] = 3,
    ["3_2"] = 103,
    ["3_3"] = 203,
    ["40_1"] = 40,
    ["40_2"] = 140,
    ["40_3"] = 240,
    ["41_1"] = 41,
    ["41_2"] = 141,
    ["41_3"] = 241,
    ["42_1"] = 42,
    ["42_2"] = 142,
    ["42_3"] = 242,
    ["43_1"] = 43,
    ["43_2"] = 143,
    ["43_3"] = 243,
    ["44_1"] = 44,
    ["44_2"] = 144,
    ["44_3"] = 244,
    ["45_1"] = 45,
    ["45_2"] = 145,
    ["45_3"] = 245,
    ["46_1"] = 46,
    ["46_2"] = 146,
    ["46_3"] = 246,
    ["47_1"] = 47,
    ["47_2"] = 147,
    ["47_3"] = 247,
    ["48_1"] = 48,
    ["48_2"] = 148,
    ["48_3"] = 248,
    ["49_1"] = 49,
    ["49_2"] = 149,
    ["49_3"] = 249,
    ["4_1"] = 4,
    ["4_2"] = 104,
    ["4_3"] = 204,
    ["50_1"] = 50,
    ["50_2"] = 150,
    ["50_3"] = 250,
    ["51_1"] = 51,
    ["51_2"] = 151,
    ["51_3"] = 251,
    ["52_1"] = 52,
    ["52_2"] = 152,
    ["52_3"] = 252,
    ["53_1"] = 53,
    ["53_2"] = 153,
    ["53_3"] = 253,
    ["54_1"] = 54,
    ["54_2"] = 154,
    ["54_3"] = 254,
    ["55_1"] = 55,
    ["55_2"] = 155,
    ["55_3"] = 255,
    ["56_1"] = 56,
    ["56_2"] = 156,
    ["56_3"] = 256,
    ["57_1"] = 57,
    ["57_2"] = 157,
    ["57_3"] = 257,
    ["58_1"] = 58,
    ["58_2"] = 158,
    ["58_3"] = 258,
    ["59_1"] = 59,
    ["59_2"] = 159,
    ["59_3"] = 259,
    ["5_1"] = 5,
    ["5_2"] = 105,
    ["5_3"] = 205,
    ["60_1"] = 60,
    ["60_2"] = 160,
    ["60_3"] = 260,
    ["61_1"] = 61,
    ["61_2"] = 161,
    ["61_3"] = 261,
    ["62_1"] = 62,
    ["62_2"] = 162,
    ["62_3"] = 262,
    ["63_1"] = 63,
    ["63_2"] = 163,
    ["63_3"] = 263,
    ["64_1"] = 64,
    ["64_2"] = 164,
    ["64_3"] = 264,
    ["65_1"] = 65,
    ["65_2"] = 165,
    ["65_3"] = 265,
    ["66_1"] = 66,
    ["66_2"] = 166,
    ["66_3"] = 266,
    ["67_1"] = 67,
    ["67_2"] = 167,
    ["67_3"] = 267,
    ["68_1"] = 68,
    ["68_2"] = 168,
    ["68_3"] = 268,
    ["69_1"] = 69,
    ["69_2"] = 169,
    ["69_3"] = 269,
    ["6_1"] = 6,
    ["6_2"] = 106,
    ["6_3"] = 206,
    ["70_1"] = 70,
    ["70_2"] = 170,
    ["70_3"] = 270,
    ["71_1"] = 71,
    ["71_2"] = 171,
    ["71_3"] = 271,
    ["72_1"] = 72,
    ["72_2"] = 172,
    ["72_3"] = 272,
    ["73_1"] = 73,
    ["73_2"] = 173,
    ["73_3"] = 273,
    ["74_1"] = 74,
    ["74_2"] = 174,
    ["74_3"] = 274,
    ["75_1"] = 75,
    ["75_2"] = 175,
    ["75_3"] = 275,
    ["76_1"] = 76,
    ["76_2"] = 176,
    ["76_3"] = 276,
    ["77_1"] = 77,
    ["77_2"] = 177,
    ["77_3"] = 277,
    ["78_1"] = 78,
    ["78_2"] = 178,
    ["78_3"] = 278,
    ["79_1"] = 79,
    ["79_2"] = 179,
    ["79_3"] = 279,
    ["7_1"] = 7,
    ["7_2"] = 107,
    ["7_3"] = 207,
    ["80_1"] = 80,
    ["80_2"] = 180,
    ["80_3"] = 280,
    ["81_1"] = 81,
    ["81_2"] = 181,
    ["81_3"] = 281,
    ["82_1"] = 82,
    ["82_2"] = 182,
    ["82_3"] = 282,
    ["83_1"] = 83,
    ["83_2"] = 183,
    ["83_3"] = 283,
    ["84_1"] = 84,
    ["84_2"] = 184,
    ["84_3"] = 284,
    ["85_1"] = 85,
    ["85_2"] = 185,
    ["85_3"] = 285,
    ["86_1"] = 86,
    ["86_2"] = 186,
    ["86_3"] = 286,
    ["87_1"] = 87,
    ["87_2"] = 187,
    ["87_3"] = 287,
    ["88_1"] = 88,
    ["88_2"] = 188,
    ["88_3"] = 288,
    ["89_1"] = 89,
    ["89_2"] = 189,
    ["89_3"] = 289,
    ["8_1"] = 8,
    ["8_2"] = 108,
    ["8_3"] = 208,
    ["90_1"] = 90,
    ["90_2"] = 190,
    ["90_3"] = 290,
    ["91_1"] = 91,
    ["91_2"] = 191,
    ["91_3"] = 291,
    ["92_1"] = 92,
    ["92_2"] = 192,
    ["92_3"] = 292,
    ["93_1"] = 93,
    ["93_2"] = 193,
    ["93_3"] = 293,
    ["94_1"] = 94,
    ["94_2"] = 194,
    ["94_3"] = 294,
    ["95_1"] = 95,
    ["95_2"] = 195,
    ["95_3"] = 295,
    ["96_1"] = 96,
    ["96_2"] = 196,
    ["96_3"] = 296,
    ["97_1"] = 97,
    ["97_2"] = 197,
    ["97_3"] = 297,
    ["98_1"] = 98,
    ["98_2"] = 198,
    ["98_3"] = 298,
    ["99_1"] = 99,
    ["99_2"] = 199,
    ["99_3"] = 299,
    ["9_1"] = 9,
    ["9_2"] = 109,
    ["9_3"] = 209,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in avatar_level")
        return t._raw[__key_map[k]]
    end
}

-- 
function avatar_level.length()
    return #avatar_level._data
end

-- 
function avatar_level.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function avatar_level.indexOf(index)
    if index == nil or not avatar_level._data[index] then
        return nil
    end

    return setmetatable({_raw = avatar_level._data[index]}, mt)
end

--
function avatar_level.get(level,templet)
    
    local k = level .. '_' .. templet
    return avatar_level.indexOf(__index_level_templet[k])
        
end

--
function avatar_level.set(level,templet, key, value)
    local record = avatar_level.get(level,templet)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function avatar_level.index()
    return __index_level_templet
end

return avatar_level