--guild_stage_rank_reward

-- key
local __key_map = {
  id = 1,    --id-int 
  number = 2,    --积分-int 
  plus_ratio = 3,    --对应加成系数-int 
  legion_rank_min_1 = 4,    --军团排名1min-int 
  legion_rank_max_1 = 5,    --军团排名1max-int 
  experience_1 = 6,    --军团声望-int 
  legion_rank_min_2 = 7,    --军团排名2min-int 
  legion_rank_max_2 = 8,    --军团排名2max-int 
  experience_2 = 9,    --军团排名2声望-int 
  legion_rank_min_3 = 10,    --军团排名3min-int 
  legion_rank_max_3 = 11,    --军团排名3max-int 
  experience_3 = 12,    --军团排名3声望-int 
  legion_rank_min_4 = 13,    --军团排名4min-int 
  legion_rank_max_4 = 14,    --军团排名4max-int 
  experience_4 = 15,    --军团排名4声望-int 
  legion_rank_min_5 = 16,    --军团排名5min-int 
  legion_rank_max_5 = 17,    --军团排名5max-int 
  experience_5 = 18,    --军团排名5声望-int 

}

-- data
local guild_stage_rank_reward = {
    _data = {
        [1] = {1,1,1000,1,5,500,6,10,500,11,20,500,21,50,500,51,9999,500,},
        [2] = {2,2,1000,1,5,500,6,10,500,11,20,500,21,50,500,51,9999,500,},
        [3] = {3,3,1000,1,5,500,6,10,500,11,20,500,21,50,500,51,9999,500,},
        [4] = {4,4,1000,1,5,500,6,10,500,11,20,500,21,50,500,51,9999,500,},
        [5] = {5,5,1000,1,5,500,6,10,500,11,20,500,21,50,500,51,9999,500,},
        [6] = {6,6,1000,1,5,500,6,10,500,11,20,500,21,50,500,51,9999,500,},
        [7] = {7,7,1000,1,5,600,6,10,600,11,20,600,21,50,600,51,9999,600,},
        [8] = {8,8,1000,1,5,600,6,10,600,11,20,600,21,50,600,51,9999,600,},
        [9] = {9,9,1000,1,5,600,6,10,600,11,20,600,21,50,600,51,9999,600,},
        [10] = {10,10,1000,1,5,600,6,10,600,11,20,600,21,50,600,51,9999,600,},
        [11] = {11,11,1000,1,5,600,6,10,600,11,20,600,21,50,600,51,9999,600,},
        [12] = {12,12,1000,1,5,600,6,10,600,11,20,600,21,50,600,51,9999,600,},
        [13] = {13,13,1000,1,5,700,6,10,700,11,20,700,21,50,700,51,9999,700,},
        [14] = {14,14,1000,1,5,700,6,10,700,11,20,700,21,50,700,51,9999,700,},
        [15] = {15,15,1000,1,5,700,6,10,700,11,20,700,21,50,700,51,9999,700,},
        [16] = {16,16,1000,1,5,700,6,10,700,11,20,700,21,50,700,51,9999,700,},
        [17] = {17,17,1000,1,5,700,6,10,700,11,20,700,21,50,700,51,9999,700,},
        [18] = {18,18,1000,1,5,700,6,10,700,11,20,700,21,50,700,51,9999,700,},
        [19] = {19,19,1000,1,5,800,6,10,800,11,20,800,21,50,800,51,9999,800,},
        [20] = {20,20,1000,1,5,800,6,10,800,11,20,800,21,50,800,51,9999,800,},
        [21] = {21,21,1000,1,5,800,6,10,800,11,20,800,21,50,800,51,9999,800,},
        [22] = {22,22,1000,1,5,800,6,10,800,11,20,800,21,50,800,51,9999,800,},
        [23] = {23,23,1000,1,5,800,6,10,800,11,20,800,21,50,800,51,9999,800,},
        [24] = {24,24,1000,1,5,800,6,10,800,11,20,800,21,50,800,51,9999,800,},
        [25] = {25,25,1000,1,5,900,6,10,900,11,20,900,21,50,900,51,9999,900,},
        [26] = {26,26,1000,1,5,900,6,10,900,11,20,900,21,50,900,51,9999,900,},
        [27] = {27,27,1000,1,5,900,6,10,900,11,20,900,21,50,900,51,9999,900,},
        [28] = {28,28,1000,1,5,900,6,10,900,11,20,900,21,50,900,51,9999,900,},
        [29] = {29,29,1000,1,5,900,6,10,900,11,20,900,21,50,900,51,9999,900,},
        [30] = {30,30,1000,1,5,900,6,10,900,11,20,900,21,50,900,51,9999,900,},
        [31] = {31,31,1000,1,5,1000,6,10,1000,11,20,1000,21,50,1000,51,9999,1000,},
        [32] = {32,32,1000,1,5,1000,6,10,1000,11,20,1000,21,50,1000,51,9999,1000,},
        [33] = {33,33,1000,1,5,1000,6,10,1000,11,20,1000,21,50,1000,51,9999,1000,},
        [34] = {34,34,1000,1,5,1000,6,10,1000,11,20,1000,21,50,1000,51,9999,1000,},
        [35] = {35,35,1000,1,5,1000,6,10,1000,11,20,1000,21,50,1000,51,9999,1000,},
        [36] = {36,36,1000,1,5,1000,6,10,1000,11,20,1000,21,50,1000,51,9999,1000,},
        [37] = {37,37,1000,1,5,1100,6,10,1100,11,20,1100,21,50,1100,51,9999,1100,},
        [38] = {38,38,1000,1,5,1100,6,10,1100,11,20,1100,21,50,1100,51,9999,1100,},
        [39] = {39,39,1000,1,5,1100,6,10,1100,11,20,1100,21,50,1100,51,9999,1100,},
        [40] = {40,40,1000,1,5,1100,6,10,1100,11,20,1100,21,50,1100,51,9999,1100,},
        [41] = {41,41,1000,1,5,1100,6,10,1100,11,20,1100,21,50,1100,51,9999,1100,},
        [42] = {42,42,1000,1,5,1100,6,10,1100,11,20,1100,21,50,1100,51,9999,1100,},
        [43] = {43,43,1000,1,5,1200,6,10,1200,11,20,1200,21,50,1200,51,9999,1200,},
        [44] = {44,44,1000,1,5,1200,6,10,1200,11,20,1200,21,50,1200,51,9999,1200,},
        [45] = {45,45,1000,1,5,1200,6,10,1200,11,20,1200,21,50,1200,51,9999,1200,},
        [46] = {46,46,1000,1,5,1200,6,10,1200,11,20,1200,21,50,1200,51,9999,1200,},
        [47] = {47,47,1000,1,5,1200,6,10,1200,11,20,1200,21,50,1200,51,9999,1200,},
        [48] = {48,48,1000,1,5,1200,6,10,1200,11,20,1200,21,50,1200,51,9999,1200,},
        [49] = {49,49,1000,1,5,1300,6,10,1300,11,20,1300,21,50,1300,51,9999,1300,},
        [50] = {50,50,1000,1,5,1300,6,10,1300,11,20,1300,21,50,1300,51,9999,1300,},
        [51] = {51,51,1000,1,5,1300,6,10,1300,11,20,1300,21,50,1300,51,9999,1300,},
        [52] = {52,52,1000,1,5,1300,6,10,1300,11,20,1300,21,50,1300,51,9999,1300,},
        [53] = {53,53,1000,1,5,1300,6,10,1300,11,20,1300,21,50,1300,51,9999,1300,},
        [54] = {54,54,1000,1,5,1300,6,10,1300,11,20,1300,21,50,1300,51,9999,1300,},
        [55] = {55,55,1000,1,5,1400,6,10,1400,11,20,1400,21,50,1400,51,9999,1400,},
        [56] = {56,56,1000,1,5,1400,6,10,1400,11,20,1400,21,50,1400,51,9999,1400,},
        [57] = {57,57,1000,1,5,1400,6,10,1400,11,20,1400,21,50,1400,51,9999,1400,},
        [58] = {58,58,1000,1,5,1400,6,10,1400,11,20,1400,21,50,1400,51,9999,1400,},
        [59] = {59,59,1000,1,5,1400,6,10,1400,11,20,1400,21,50,1400,51,9999,1400,},
        [60] = {60,60,1000,1,5,1400,6,10,1400,11,20,1400,21,50,1400,51,9999,1400,},
        [61] = {61,61,1000,1,5,1500,6,10,1500,11,20,1500,21,50,1500,51,9999,1500,},
        [62] = {62,62,1000,1,5,1500,6,10,1500,11,20,1500,21,50,1500,51,9999,1500,},
        [63] = {63,63,1000,1,5,1500,6,10,1500,11,20,1500,21,50,1500,51,9999,1500,},
        [64] = {64,64,1000,1,5,1500,6,10,1500,11,20,1500,21,50,1500,51,9999,1500,},
        [65] = {65,65,1000,1,5,1500,6,10,1500,11,20,1500,21,50,1500,51,9999,1500,},
        [66] = {66,66,1000,1,5,1500,6,10,1500,11,20,1500,21,50,1500,51,9999,1500,},
        [67] = {67,67,1000,1,5,1600,6,10,1600,11,20,1600,21,50,1600,51,9999,1600,},
        [68] = {68,68,1000,1,5,1600,6,10,1600,11,20,1600,21,50,1600,51,9999,1600,},
        [69] = {69,69,1000,1,5,1600,6,10,1600,11,20,1600,21,50,1600,51,9999,1600,},
        [70] = {70,70,1000,1,5,1600,6,10,1600,11,20,1600,21,50,1600,51,9999,1600,},
        [71] = {71,71,1000,1,5,1600,6,10,1600,11,20,1600,21,50,1600,51,9999,1600,},
        [72] = {72,72,1000,1,5,1600,6,10,1600,11,20,1600,21,50,1600,51,9999,1600,},
        [73] = {73,73,1000,1,5,1700,6,10,1700,11,20,1700,21,50,1700,51,9999,1700,},
        [74] = {74,74,1000,1,5,1700,6,10,1700,11,20,1700,21,50,1700,51,9999,1700,},
        [75] = {75,75,1000,1,5,1700,6,10,1700,11,20,1700,21,50,1700,51,9999,1700,},
        [76] = {76,76,1000,1,5,1700,6,10,1700,11,20,1700,21,50,1700,51,9999,1700,},
        [77] = {77,77,1000,1,5,1700,6,10,1700,11,20,1700,21,50,1700,51,9999,1700,},
        [78] = {78,78,1000,1,5,1700,6,10,1700,11,20,1700,21,50,1700,51,9999,1700,},
        [79] = {79,79,1000,1,5,1800,6,10,1800,11,20,1800,21,50,1800,51,9999,1800,},
        [80] = {80,80,1000,1,5,1800,6,10,1800,11,20,1800,21,50,1800,51,9999,1800,},
        [81] = {81,81,1000,1,5,1800,6,10,1800,11,20,1800,21,50,1800,51,9999,1800,},
        [82] = {82,82,1000,1,5,1800,6,10,1800,11,20,1800,21,50,1800,51,9999,1800,},
        [83] = {83,83,1000,1,5,1800,6,10,1800,11,20,1800,21,50,1800,51,9999,1800,},
        [84] = {84,84,1000,1,5,1800,6,10,1800,11,20,1800,21,50,1800,51,9999,1800,},
        [85] = {85,85,1000,1,5,2000,6,10,2000,11,20,2000,21,50,2000,51,9999,2000,},
        [86] = {86,86,1000,1,5,2000,6,10,2000,11,20,2000,21,50,2000,51,9999,2000,},
        [87] = {87,87,1000,1,5,2000,6,10,2000,11,20,2000,21,50,2000,51,9999,2000,},
        [88] = {88,88,1000,1,5,2000,6,10,2000,11,20,2000,21,50,2000,51,9999,2000,},
        [89] = {89,89,1000,1,5,2000,6,10,2000,11,20,2000,21,50,2000,51,9999,2000,},
        [90] = {90,90,1000,1,5,2000,6,10,2000,11,20,2000,21,50,2000,51,9999,2000,},
        [91] = {91,91,1000,1,5,2200,6,10,2200,11,20,2200,21,50,2200,51,9999,2200,},
        [92] = {92,92,1000,1,5,2200,6,10,2200,11,20,2200,21,50,2200,51,9999,2200,},
        [93] = {93,93,1000,1,5,2200,6,10,2200,11,20,2200,21,50,2200,51,9999,2200,},
        [94] = {94,94,1000,1,5,2200,6,10,2200,11,20,2200,21,50,2200,51,9999,2200,},
        [95] = {95,95,1000,1,5,2200,6,10,2200,11,20,2200,21,50,2200,51,9999,2200,},
        [96] = {96,96,1000,1,5,2200,6,10,2200,11,20,2200,21,50,2200,51,9999,2200,},
        [97] = {97,97,1000,1,5,2400,6,10,2400,11,20,2400,21,50,2400,51,9999,2400,},
        [98] = {98,98,1000,1,5,2400,6,10,2400,11,20,2400,21,50,2400,51,9999,2400,},
        [99] = {99,99,1000,1,5,2400,6,10,2400,11,20,2400,21,50,2400,51,9999,2400,},
        [100] = {100,100,1000,1,5,2400,6,10,2400,11,20,2400,21,50,2400,51,9999,2400,},
        [101] = {101,101,1000,1,5,2400,6,10,2400,11,20,2400,21,50,2400,51,9999,2400,},
        [102] = {102,102,1000,1,5,2400,6,10,2400,11,20,2400,21,50,2400,51,9999,2400,},
        [103] = {103,103,1000,1,5,2600,6,10,2600,11,20,2600,21,50,2600,51,9999,2600,},
        [104] = {104,104,1000,1,5,2600,6,10,2600,11,20,2600,21,50,2600,51,9999,2600,},
        [105] = {105,105,1000,1,5,2600,6,10,2600,11,20,2600,21,50,2600,51,9999,2600,},
        [106] = {106,106,1000,1,5,2600,6,10,2600,11,20,2600,21,50,2600,51,9999,2600,},
        [107] = {107,107,1000,1,5,2600,6,10,2600,11,20,2600,21,50,2600,51,9999,2600,},
        [108] = {108,108,1000,1,5,2600,6,10,2600,11,20,2600,21,50,2600,51,9999,2600,},
        [109] = {109,109,1000,1,5,2800,6,10,2800,11,20,2800,21,50,2800,51,9999,2800,},
        [110] = {110,110,1000,1,5,2800,6,10,2800,11,20,2800,21,50,2800,51,9999,2800,},
        [111] = {111,111,1000,1,5,2800,6,10,2800,11,20,2800,21,50,2800,51,9999,2800,},
        [112] = {112,112,1000,1,5,2800,6,10,2800,11,20,2800,21,50,2800,51,9999,2800,},
        [113] = {113,113,1000,1,5,2800,6,10,2800,11,20,2800,21,50,2800,51,9999,2800,},
        [114] = {114,114,1000,1,5,2800,6,10,2800,11,20,2800,21,50,2800,51,9999,2800,},
        [115] = {115,115,1000,1,5,3000,6,10,3000,11,20,3000,21,50,3000,51,9999,3000,},
        [116] = {116,116,1000,1,5,3000,6,10,3000,11,20,3000,21,50,3000,51,9999,3000,},
        [117] = {117,117,1000,1,5,3000,6,10,3000,11,20,3000,21,50,3000,51,9999,3000,},
        [118] = {118,118,1000,1,5,3000,6,10,3000,11,20,3000,21,50,3000,51,9999,3000,},
        [119] = {119,119,1000,1,5,3000,6,10,3000,11,20,3000,21,50,3000,51,9999,3000,},
        [120] = {120,120,1000,1,5,3000,6,10,3000,11,20,3000,21,50,3000,51,9999,3000,},
        [121] = {121,121,1000,1,5,3200,6,10,3200,11,20,3200,21,50,3200,51,9999,3200,},
        [122] = {122,122,1000,1,5,3200,6,10,3200,11,20,3200,21,50,3200,51,9999,3200,},
        [123] = {123,123,1000,1,5,3200,6,10,3200,11,20,3200,21,50,3200,51,9999,3200,},
        [124] = {124,124,1000,1,5,3200,6,10,3200,11,20,3200,21,50,3200,51,9999,3200,},
        [125] = {125,125,1000,1,5,3200,6,10,3200,11,20,3200,21,50,3200,51,9999,3200,},
        [126] = {126,126,1000,1,5,3200,6,10,3200,11,20,3200,21,50,3200,51,9999,3200,},
        [127] = {127,127,1000,1,5,3400,6,10,3400,11,20,3400,21,50,3400,51,9999,3400,},
        [128] = {128,128,1000,1,5,3400,6,10,3400,11,20,3400,21,50,3400,51,9999,3400,},
        [129] = {129,129,1000,1,5,3400,6,10,3400,11,20,3400,21,50,3400,51,9999,3400,},
        [130] = {130,130,1000,1,5,3400,6,10,3400,11,20,3400,21,50,3400,51,9999,3400,},
        [131] = {131,131,1000,1,5,3400,6,10,3400,11,20,3400,21,50,3400,51,9999,3400,},
        [132] = {132,132,1000,1,5,3400,6,10,3400,11,20,3400,21,50,3400,51,9999,3400,},
        [133] = {133,133,1000,1,5,3600,6,10,3600,11,20,3600,21,50,3600,51,9999,3600,},
        [134] = {134,134,1000,1,5,3600,6,10,3600,11,20,3600,21,50,3600,51,9999,3600,},
        [135] = {135,135,1000,1,5,3600,6,10,3600,11,20,3600,21,50,3600,51,9999,3600,},
        [136] = {136,136,1000,1,5,3600,6,10,3600,11,20,3600,21,50,3600,51,9999,3600,},
        [137] = {137,137,1000,1,5,3600,6,10,3600,11,20,3600,21,50,3600,51,9999,3600,},
        [138] = {138,138,1000,1,5,3600,6,10,3600,11,20,3600,21,50,3600,51,9999,3600,},
        [139] = {139,139,1000,1,5,3800,6,10,3800,11,20,3800,21,50,3800,51,9999,3800,},
        [140] = {140,140,1000,1,5,3800,6,10,3800,11,20,3800,21,50,3800,51,9999,3800,},
        [141] = {141,141,1000,1,5,3800,6,10,3800,11,20,3800,21,50,3800,51,9999,3800,},
        [142] = {142,142,1000,1,5,3800,6,10,3800,11,20,3800,21,50,3800,51,9999,3800,},
        [143] = {143,143,1000,1,5,3800,6,10,3800,11,20,3800,21,50,3800,51,9999,3800,},
        [144] = {144,144,1000,1,5,3800,6,10,3800,11,20,3800,21,50,3800,51,9999,3800,},
        [145] = {145,145,1000,1,5,4000,6,10,4000,11,20,4000,21,50,4000,51,9999,4000,},
        [146] = {146,146,1000,1,5,4000,6,10,4000,11,20,4000,21,50,4000,51,9999,4000,},
        [147] = {147,147,1000,1,5,4000,6,10,4000,11,20,4000,21,50,4000,51,9999,4000,},
        [148] = {148,148,1000,1,5,4000,6,10,4000,11,20,4000,21,50,4000,51,9999,4000,},
        [149] = {149,149,1000,1,5,4000,6,10,4000,11,20,4000,21,50,4000,51,9999,4000,},
        [150] = {150,150,1000,1,5,4000,6,10,4000,11,20,4000,21,50,4000,51,9999,4000,},
        [151] = {151,151,1000,1,5,4200,6,10,4200,11,20,4200,21,50,4200,51,9999,4200,},
        [152] = {152,152,1000,1,5,4200,6,10,4200,11,20,4200,21,50,4200,51,9999,4200,},
        [153] = {153,153,1000,1,5,4200,6,10,4200,11,20,4200,21,50,4200,51,9999,4200,},
        [154] = {154,154,1000,1,5,4200,6,10,4200,11,20,4200,21,50,4200,51,9999,4200,},
        [155] = {155,155,1000,1,5,4200,6,10,4200,11,20,4200,21,50,4200,51,9999,4200,},
        [156] = {156,156,1000,1,5,4200,6,10,4200,11,20,4200,21,50,4200,51,9999,4200,},
        [157] = {157,157,1000,1,5,4400,6,10,4400,11,20,4400,21,50,4400,51,9999,4400,},
        [158] = {158,158,1000,1,5,4400,6,10,4400,11,20,4400,21,50,4400,51,9999,4400,},
        [159] = {159,159,1000,1,5,4400,6,10,4400,11,20,4400,21,50,4400,51,9999,4400,},
        [160] = {160,160,1000,1,5,4400,6,10,4400,11,20,4400,21,50,4400,51,9999,4400,},
        [161] = {161,161,1000,1,5,4400,6,10,4400,11,20,4400,21,50,4400,51,9999,4400,},
        [162] = {162,162,1000,1,5,4400,6,10,4400,11,20,4400,21,50,4400,51,9999,4400,},
        [163] = {163,163,1000,1,5,4600,6,10,4600,11,20,4600,21,50,4600,51,9999,4600,},
        [164] = {164,164,1000,1,5,4600,6,10,4600,11,20,4600,21,50,4600,51,9999,4600,},
        [165] = {165,165,1000,1,5,4600,6,10,4600,11,20,4600,21,50,4600,51,9999,4600,},
        [166] = {166,166,1000,1,5,4600,6,10,4600,11,20,4600,21,50,4600,51,9999,4600,},
        [167] = {167,167,1000,1,5,4600,6,10,4600,11,20,4600,21,50,4600,51,9999,4600,},
        [168] = {168,168,1000,1,5,4600,6,10,4600,11,20,4600,21,50,4600,51,9999,4600,},
        [169] = {169,169,1000,1,5,4800,6,10,4800,11,20,4800,21,50,4800,51,9999,4800,},
        [170] = {170,170,1000,1,5,4800,6,10,4800,11,20,4800,21,50,4800,51,9999,4800,},
        [171] = {171,171,1000,1,5,4800,6,10,4800,11,20,4800,21,50,4800,51,9999,4800,},
        [172] = {172,172,1000,1,5,4800,6,10,4800,11,20,4800,21,50,4800,51,9999,4800,},
        [173] = {173,173,1000,1,5,4800,6,10,4800,11,20,4800,21,50,4800,51,9999,4800,},
        [174] = {174,174,1000,1,5,4800,6,10,4800,11,20,4800,21,50,4800,51,9999,4800,},
        [175] = {175,175,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [176] = {176,176,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [177] = {177,177,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [178] = {178,178,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [179] = {179,179,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [180] = {180,180,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [181] = {181,181,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [182] = {182,182,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [183] = {183,183,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [184] = {184,184,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [185] = {185,185,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [186] = {186,186,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [187] = {187,187,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [188] = {188,188,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [189] = {189,189,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [190] = {190,190,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [191] = {191,191,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [192] = {192,192,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [193] = {193,193,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [194] = {194,194,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [195] = {195,195,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [196] = {196,196,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [197] = {197,197,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [198] = {198,198,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [199] = {199,199,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [200] = {200,200,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [201] = {201,201,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [202] = {202,202,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [203] = {203,203,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [204] = {204,204,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [205] = {205,205,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [206] = {206,206,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [207] = {207,207,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [208] = {208,208,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [209] = {209,209,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [210] = {210,210,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [211] = {211,211,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [212] = {212,212,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [213] = {213,213,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [214] = {214,214,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [215] = {215,215,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [216] = {216,216,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [217] = {217,217,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [218] = {218,218,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [219] = {219,219,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [220] = {220,220,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [221] = {221,221,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [222] = {222,222,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [223] = {223,223,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [224] = {224,224,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [225] = {225,225,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [226] = {226,226,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [227] = {227,227,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [228] = {228,228,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [229] = {229,229,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [230] = {230,230,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [231] = {231,231,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [232] = {232,232,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [233] = {233,233,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [234] = {234,234,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [235] = {235,235,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [236] = {236,236,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [237] = {237,237,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [238] = {238,238,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [239] = {239,239,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
        [240] = {240,240,1000,1,5,5000,6,10,5000,11,20,5000,21,50,5000,51,9999,5000,},
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_stage_rank_reward")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_stage_rank_reward.length()
    return #guild_stage_rank_reward._data
end

-- 
function guild_stage_rank_reward.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_stage_rank_reward.indexOf(index)
    if index == nil or not guild_stage_rank_reward._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_stage_rank_reward._data[index]}, mt)
end

--
function guild_stage_rank_reward.get(id)
    
    return guild_stage_rank_reward.indexOf(__index_id[id])
        
end

--
function guild_stage_rank_reward.set(id, key, value)
    local record = guild_stage_rank_reward.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_stage_rank_reward.index()
    return __index_id
end

return guild_stage_rank_reward