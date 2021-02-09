--pvpsingle_auction_content

-- key
local __key_map = {
  id = 1,    --编号-int 
  reward_id = 2,    --奖励组id-int 
  auction_full_tab = 3,    --所属全服拍卖页签-int 
  type = 4,    --类型-int 
  value = 5,    --类型值id-int 
  size = 6,    --数量-int 
  produce_number1 = 7,    --产出组1数量-int 
  produce_probability1 = 8,    --产出组1权重-int 
  produce_number2 = 9,    --产出组2数量-int 
  produce_probability2 = 10,    --产出组2权重-int 
  produce_number3 = 11,    --产出组3数量-int 
  produce_probability3 = 12,    --产出组3权重-int 
  produce_number4 = 13,    --产出组4数量-int 
  produce_probability4 = 14,    --产出组4权重-int 
  produce_number5 = 15,    --产出组5数量-int 
  produce_probability5 = 16,    --产出组5权重-int 
  hero_order = 17,    --全服拍卖整将排序-int 
  order = 18,    --排序-int 
  price_id = 19,    --竞拍货币-int 
  start_price = 20,    --起拍价-int 
  fare = 21,    --加价-int 
  net = 22,    --一口价-int 

}

-- data
local pvpsingle_auction_content = {
    _data = {
        [1] = {1,101,10,0,0,1,19,1000,20,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [2] = {2,102,10,6,555,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [3] = {3,102,10,6,556,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [4] = {4,103,5,0,0,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [5] = {5,104,10,6,43,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [6] = {6,201,10,0,0,1,19,1000,20,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [7] = {7,202,10,6,555,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [8] = {8,202,10,6,556,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [9] = {9,203,5,0,0,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [10] = {10,204,10,6,43,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [11] = {11,301,10,0,0,1,19,1000,20,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [12] = {12,302,10,6,555,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [13] = {13,302,10,6,556,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [14] = {14,303,5,0,0,1,5,600,6,400,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [15] = {15,304,10,6,43,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [16] = {16,401,10,0,0,1,18,1000,19,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [17] = {17,402,10,6,555,1,11,100,12,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [18] = {18,402,10,6,556,1,10,100,11,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [19] = {19,403,5,0,0,1,5,600,6,400,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [20] = {20,404,10,6,43,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [21] = {21,501,10,0,0,1,18,1000,19,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [22] = {22,502,10,6,555,1,10,1000,11,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [23] = {23,502,10,6,556,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [24] = {24,503,5,0,0,1,5,800,6,200,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [25] = {25,504,10,6,43,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [26] = {26,601,10,0,0,1,16,1000,17,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [27] = {27,602,10,6,555,1,10,1000,11,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [28] = {28,602,10,6,556,1,9,1000,10,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [29] = {29,603,5,0,0,1,5,800,6,200,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [30] = {30,604,10,6,43,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [31] = {31,701,10,0,0,1,16,1000,17,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [32] = {32,702,10,6,555,1,9,1000,10,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [33] = {33,702,10,6,556,1,10,1000,11,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [34] = {34,703,5,0,0,1,4,200,5,800,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [35] = {35,704,10,6,43,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [36] = {36,801,10,0,0,1,15,1000,16,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [37] = {37,802,10,6,555,1,9,1000,10,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [38] = {38,802,10,6,556,1,9,1000,10,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [39] = {39,803,5,0,0,1,4,200,5,800,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [40] = {40,804,10,6,43,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [41] = {41,901,10,0,0,1,15,1000,16,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [42] = {42,902,10,6,555,1,9,1000,10,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [43] = {43,902,10,6,556,1,9,1000,10,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [44] = {44,903,5,0,0,1,4,600,5,400,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [45] = {45,904,10,6,43,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [46] = {46,1001,10,0,0,1,14,1000,15,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [47] = {47,1002,10,6,555,1,8,1000,9,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [48] = {48,1002,10,6,556,1,8,1000,9,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [49] = {49,1003,5,0,0,1,4,600,5,400,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [50] = {50,1004,10,6,43,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [51] = {51,1101,10,0,0,1,14,1000,15,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [52] = {52,1102,10,6,555,1,8,1000,9,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [53] = {53,1102,10,6,556,1,8,1000,9,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [54] = {54,1103,5,0,0,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [55] = {55,1104,10,6,43,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [56] = {56,1201,10,0,0,1,12,1000,13,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [57] = {57,1202,10,6,555,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [58] = {58,1202,10,6,556,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [59] = {59,1203,5,0,0,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [60] = {60,1204,10,6,43,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [61] = {61,1301,10,0,0,1,12,1000,13,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [62] = {62,1302,10,6,555,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [63] = {63,1302,10,6,556,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [64] = {64,1303,5,0,0,1,3,600,4,400,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [65] = {65,1304,10,6,43,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [66] = {66,1401,10,0,0,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [67] = {67,1402,10,6,555,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [68] = {68,1402,10,6,556,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [69] = {69,1403,5,0,0,1,3,600,4,400,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [70] = {70,1404,10,6,43,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [71] = {71,1501,10,0,0,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [72] = {72,1502,10,6,555,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [73] = {73,1502,10,6,556,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [74] = {74,1503,5,0,0,1,3,800,4,200,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [75] = {75,1504,10,6,43,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [76] = {76,1601,10,0,0,1,9,1000,10,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [77] = {77,1602,10,6,555,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [78] = {78,1602,10,6,556,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [79] = {79,1603,5,0,0,1,3,800,4,200,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [80] = {80,1604,10,6,43,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [81] = {81,1701,10,0,0,1,9,1000,10,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [82] = {82,1702,10,6,555,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [83] = {83,1702,10,6,556,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [84] = {84,1703,5,0,0,1,2,800,3,200,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [85] = {85,1704,10,6,43,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [86] = {86,1801,10,0,0,1,8,1000,9,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [87] = {87,1802,10,6,555,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [88] = {88,1802,10,6,556,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [89] = {89,1803,5,0,0,1,2,800,3,200,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [90] = {90,1804,10,6,43,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [91] = {91,1901,10,0,0,1,8,1000,9,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [92] = {92,1902,10,6,555,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [93] = {93,1902,10,6,556,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [94] = {94,1903,5,0,0,1,2,600,3,400,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [95] = {95,1904,10,6,43,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [96] = {96,2001,10,0,0,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [97] = {97,2002,10,6,555,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [98] = {98,2002,10,6,556,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [99] = {99,2003,5,0,0,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [100] = {100,2004,10,6,43,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [101] = {101,2101,10,0,0,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [102] = {102,2102,10,6,555,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [103] = {103,2102,10,6,556,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [104] = {104,2103,5,0,0,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [105] = {105,2104,10,6,43,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [106] = {106,2201,10,0,0,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [107] = {107,2202,10,6,555,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [108] = {108,2202,10,6,556,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [109] = {109,2203,5,0,0,1,1,600,2,400,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [110] = {110,2204,10,6,43,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [111] = {111,2301,10,0,0,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [112] = {112,2302,10,6,555,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [113] = {113,2302,10,6,556,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [114] = {114,2303,5,0,0,1,1,600,2,400,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [115] = {115,2304,10,6,43,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [116] = {116,2401,10,0,0,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [117] = {117,2402,10,6,555,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [118] = {118,2402,10,6,556,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [119] = {119,2403,5,0,0,1,1,800,2,200,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [120] = {120,2404,10,6,43,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [121] = {121,2501,10,0,0,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [122] = {122,2502,10,6,555,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [123] = {123,2502,10,6,556,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [124] = {124,2503,5,0,0,1,1,800,2,200,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [125] = {125,2504,10,6,43,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [126] = {126,2601,10,0,0,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [127] = {127,2602,10,6,555,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [128] = {128,2602,10,6,556,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [129] = {129,2603,5,0,0,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [130] = {130,2604,10,6,43,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [131] = {131,2701,10,0,0,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [132] = {132,2702,10,6,555,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [133] = {133,2702,10,6,556,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [134] = {134,2703,5,0,0,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [135] = {135,2704,10,6,43,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [136] = {136,2801,10,0,0,1,0,1000,1,0,0,0,0,0,0,0,0,0,0,3200,480,8000,},
        [137] = {137,2802,10,6,555,1,0,1000,1,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [138] = {138,2802,10,6,556,1,0,1000,1,0,0,0,0,0,0,0,0,0,0,2700,405,6750,},
        [139] = {139,2803,5,0,0,1,0,1000,1,0,0,0,0,0,0,0,0,0,0,27000,4050,67500,},
        [140] = {140,2804,10,6,43,1,0,1000,1,0,0,0,0,0,0,0,0,0,0,6480,972,16200,},
        [141] = {141,105,4,6,706,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [142] = {142,205,4,6,706,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [143] = {143,305,4,6,706,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [144] = {144,405,4,6,706,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [145] = {145,505,4,6,706,1,11,1000,12,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [146] = {146,605,4,6,706,1,10,1000,9,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [147] = {147,705,4,6,706,1,10,1000,9,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [148] = {148,805,4,6,706,1,9,1000,8,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [149] = {149,905,4,6,706,1,9,1000,8,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [150] = {150,1005,4,6,706,1,8,1000,7,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [151] = {151,1105,4,6,706,1,8,1000,7,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [152] = {152,1205,4,6,706,1,7,1000,6,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [153] = {153,1305,4,6,706,1,7,1000,6,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [154] = {154,1405,4,6,706,1,7,1000,6,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [155] = {155,1505,4,6,706,1,7,1000,6,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [156] = {156,1605,4,6,706,1,6,1000,5,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [157] = {157,1705,4,6,706,1,6,1000,5,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [158] = {158,1805,4,6,706,1,5,1000,4,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [159] = {159,1905,4,6,706,1,5,1000,4,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [160] = {160,2005,4,6,706,1,4,1000,3,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [161] = {161,2105,4,6,706,1,4,1000,3,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [162] = {162,2205,4,6,706,1,3,1000,2,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [163] = {163,2305,4,6,706,1,3,1000,2,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [164] = {164,2405,4,6,706,1,3,1000,2,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [165] = {165,2505,4,6,706,1,3,1000,2,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [166] = {166,2605,4,6,706,1,2,1000,1,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [167] = {167,2705,4,6,706,1,2,1000,1,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [168] = {168,2805,4,6,706,1,1,1000,0,0,0,0,0,0,0,0,0,0,0,3000,450,7500,},
        [169] = {169,106,6,0,0,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [170] = {170,206,6,0,0,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [171] = {171,306,6,0,0,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [172] = {172,406,6,0,0,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [173] = {173,506,6,0,0,1,7,1000,8,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [174] = {174,606,6,0,0,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [175] = {175,706,6,0,0,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [176] = {176,806,6,0,0,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [177] = {177,906,6,0,0,1,6,1000,7,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [178] = {178,1006,6,0,0,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [179] = {179,1106,6,0,0,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [180] = {180,1206,6,0,0,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [181] = {181,1306,6,0,0,1,5,1000,6,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [182] = {182,1406,6,0,0,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [183] = {183,1506,6,0,0,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [184] = {184,1606,6,0,0,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [185] = {185,1706,6,0,0,1,4,1000,5,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [186] = {186,1806,6,0,0,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [187] = {187,1906,6,0,0,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [188] = {188,2006,6,0,0,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [189] = {189,2106,6,0,0,1,3,1000,4,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [190] = {190,2206,6,0,0,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [191] = {191,2306,6,0,0,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [192] = {192,2406,6,0,0,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [193] = {193,2506,6,0,0,1,2,1000,3,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [194] = {194,2606,6,0,0,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [195] = {195,2706,6,0,0,1,1,1000,2,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [196] = {196,2806,6,0,0,1,0,1000,1,0,0,0,0,0,0,0,0,0,0,8000,1200,20000,},
        [197] = {197,107,6,7,130001,1,18,1000,17,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [198] = {198,207,6,7,130001,1,18,1000,17,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [199] = {199,307,6,7,130001,1,17,1000,16,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [200] = {200,407,6,7,130001,1,17,1000,16,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [201] = {201,507,6,7,130001,1,17,1000,16,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [202] = {202,607,6,7,130001,1,15,1000,14,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [203] = {203,707,6,7,130001,1,15,1000,14,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [204] = {204,807,6,7,130001,1,15,1000,14,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [205] = {205,907,6,7,130001,1,14,1000,13,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [206] = {206,1007,6,7,130001,1,14,1000,13,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [207] = {207,1107,6,7,130001,1,14,1000,13,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [208] = {208,1207,6,7,130001,1,12,1000,11,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [209] = {209,1307,6,7,130001,1,12,1000,11,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [210] = {210,1407,6,7,130001,1,12,1000,11,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [211] = {211,1507,6,7,130001,1,11,1000,10,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [212] = {212,1607,6,7,130001,1,11,1000,10,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [213] = {213,1707,6,7,130001,1,11,1000,10,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [214] = {214,1807,6,7,130001,1,9,1000,8,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [215] = {215,1907,6,7,130001,1,9,1000,8,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [216] = {216,2007,6,7,130001,1,9,1000,8,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [217] = {217,2107,6,7,130001,1,8,1000,7,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [218] = {218,2207,6,7,130001,1,8,1000,7,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [219] = {219,2307,6,7,130001,1,8,1000,7,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [220] = {220,2407,6,7,130001,1,6,1000,5,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [221] = {221,2507,6,7,130001,1,6,1000,5,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [222] = {222,2607,6,7,130001,1,6,1000,5,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [223] = {223,2707,6,7,130001,1,5,1000,4,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
        [224] = {224,2807,6,7,130001,1,0,1000,1,0,0,0,0,0,0,0,0,0,1,3000,450,7500,},
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
        assert(__key_map[k], "cannot find " .. k .. " in pvpsingle_auction_content")
        return t._raw[__key_map[k]]
    end
}

-- 
function pvpsingle_auction_content.length()
    return #pvpsingle_auction_content._data
end

-- 
function pvpsingle_auction_content.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pvpsingle_auction_content.indexOf(index)
    if index == nil or not pvpsingle_auction_content._data[index] then
        return nil
    end

    return setmetatable({_raw = pvpsingle_auction_content._data[index]}, mt)
end

--
function pvpsingle_auction_content.get(id)
    
    return pvpsingle_auction_content.indexOf(__index_id[id])
        
end

--
function pvpsingle_auction_content.set(id, tkey, nvalue)
    local record = pvpsingle_auction_content.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function pvpsingle_auction_content.index()
    return __index_id
end

return pvpsingle_auction_content