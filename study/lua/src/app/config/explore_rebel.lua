--explore_rebel

-- key
local __key_map = {
  id = 1,    --id-int 
  level = 2,    --怪物等级-int 
  type = 3,    --类型-int 
  cost = 4,    --消耗体力-int 
  monster_team = 5,    --怪物组-int 
  kill_type = 6,    --击杀奖励类型-int 
  kill_resource = 7,    --击杀奖励ID-int 
  kill_size = 8,    --击杀奖励数量-int 
  kill2_type = 9,    --击杀奖励类型2-int 
  kill2_resource = 10,    --击杀奖励ID2-int 
  kill2_size = 11,    --击杀奖励数量2-int 
  name = 12,    --反贼名称-string 
  color = 13,    --反贼品质-int 
  in_res = 14,    --战斗背景-int 

}

-- data
local explore_rebel = {
    _data = {
        [1] = {1,10,1,10,5201001,6,72,10,0,0,0,"西凉军",4,1,},
        [2] = {2,11,1,10,5201101,6,72,10,0,0,0,"西凉军",4,1,},
        [3] = {3,12,1,10,5201201,6,72,10,0,0,0,"西凉军",4,1,},
        [4] = {4,13,1,10,5201301,6,72,10,0,0,0,"西凉军",4,1,},
        [5] = {5,14,1,10,5201401,6,72,10,0,0,0,"西凉军",4,1,},
        [6] = {6,15,1,10,5201501,6,72,10,0,0,0,"西凉军",4,1,},
        [7] = {7,16,1,10,5201601,6,72,10,0,0,0,"西凉军",4,1,},
        [8] = {8,17,1,10,5201701,6,72,10,0,0,0,"西凉军",4,1,},
        [9] = {9,18,1,10,5201801,6,72,10,0,0,0,"西凉军",4,1,},
        [10] = {10,19,1,10,5201901,6,72,10,0,0,0,"西凉军",4,1,},
        [11] = {11,20,1,10,5202001,6,72,10,0,0,0,"西凉军",4,1,},
        [12] = {12,21,1,10,5202101,6,72,10,0,0,0,"西凉军",4,1,},
        [13] = {13,22,1,10,5202201,6,72,10,0,0,0,"西凉军",4,1,},
        [14] = {14,23,1,10,5202301,6,72,10,0,0,0,"西凉军",4,1,},
        [15] = {15,24,1,10,5202401,6,72,10,0,0,0,"西凉军",4,1,},
        [16] = {16,25,1,10,5202501,6,72,10,0,0,0,"西凉军",4,1,},
        [17] = {17,26,1,10,5202601,6,72,10,0,0,0,"西凉军",4,1,},
        [18] = {18,27,1,10,5202701,6,72,10,0,0,0,"西凉军",4,1,},
        [19] = {19,28,1,10,5202801,6,72,10,0,0,0,"西凉军",4,1,},
        [20] = {20,29,1,10,5202901,6,72,10,0,0,0,"西凉军",4,1,},
        [21] = {21,30,1,10,5203001,6,72,15,0,0,0,"西凉军",4,1,},
        [22] = {22,31,1,10,5203101,6,72,15,0,0,0,"西凉军",4,1,},
        [23] = {23,32,1,10,5203201,6,72,15,0,0,0,"西凉军",4,1,},
        [24] = {24,33,1,10,5203301,6,72,15,0,0,0,"西凉军",4,1,},
        [25] = {25,34,1,10,5203401,6,72,15,0,0,0,"西凉军",4,1,},
        [26] = {26,35,1,10,5203501,6,72,15,0,0,0,"西凉军",4,1,},
        [27] = {27,36,1,10,5203601,6,72,15,0,0,0,"西凉军",4,1,},
        [28] = {28,37,1,10,5203701,6,72,15,0,0,0,"西凉军",4,1,},
        [29] = {29,38,1,10,5203801,6,72,15,0,0,0,"西凉军",4,1,},
        [30] = {30,39,1,10,5203901,6,72,15,0,0,0,"西凉军",4,1,},
        [31] = {31,40,1,10,5204001,6,72,15,0,0,0,"西凉军",4,1,},
        [32] = {32,41,1,10,5204101,6,72,15,0,0,0,"西凉军",4,1,},
        [33] = {33,42,1,10,5204201,6,72,15,0,0,0,"西凉军",4,1,},
        [34] = {34,43,1,10,5204301,6,72,15,0,0,0,"西凉军",4,1,},
        [35] = {35,44,1,10,5204401,6,72,15,0,0,0,"西凉军",4,1,},
        [36] = {36,45,1,10,5204501,6,72,15,0,0,0,"西凉军",4,1,},
        [37] = {37,46,1,10,5204601,6,72,15,0,0,0,"西凉军",4,1,},
        [38] = {38,47,1,10,5204701,6,72,15,0,0,0,"西凉军",4,1,},
        [39] = {39,48,1,10,5204801,6,72,15,0,0,0,"西凉军",4,1,},
        [40] = {40,49,1,10,5204901,6,72,15,0,0,0,"西凉军",4,1,},
        [41] = {41,50,1,10,5205001,6,72,20,6,10,10,"西凉军",4,1,},
        [42] = {42,51,1,10,5205101,6,72,20,6,10,10,"西凉军",4,1,},
        [43] = {43,52,1,10,5205201,6,72,20,6,10,10,"西凉军",4,1,},
        [44] = {44,53,1,10,5205301,6,72,20,6,10,10,"西凉军",4,1,},
        [45] = {45,54,1,10,5205401,6,72,20,6,10,10,"西凉军",4,1,},
        [46] = {46,55,1,10,5205501,6,72,20,6,10,10,"西凉军",4,1,},
        [47] = {47,56,1,10,5205601,6,72,20,6,10,10,"西凉军",4,1,},
        [48] = {48,57,1,10,5205701,6,72,20,6,10,10,"西凉军",4,1,},
        [49] = {49,58,1,10,5205801,6,72,20,6,10,10,"西凉军",4,1,},
        [50] = {50,59,1,10,5205901,6,72,20,6,10,10,"西凉军",4,1,},
        [51] = {51,60,1,10,5206001,6,72,20,6,10,12,"西凉军",4,1,},
        [52] = {52,61,1,10,5206101,6,72,20,6,10,12,"西凉军",4,1,},
        [53] = {53,62,1,10,5206201,6,72,20,6,10,12,"西凉军",4,1,},
        [54] = {54,63,1,10,5206301,6,72,20,6,10,12,"西凉军",4,1,},
        [55] = {55,64,1,10,5206401,6,72,20,6,10,12,"西凉军",4,1,},
        [56] = {56,65,1,10,5206501,6,72,20,6,10,12,"西凉军",4,1,},
        [57] = {57,66,1,10,5206601,6,72,20,6,10,12,"西凉军",4,1,},
        [58] = {58,67,1,10,5206701,6,72,20,6,10,12,"西凉军",4,1,},
        [59] = {59,68,1,10,5206801,6,72,20,6,10,12,"西凉军",4,1,},
        [60] = {60,69,1,10,5206901,6,72,20,6,10,12,"西凉军",4,1,},
        [61] = {61,70,1,10,5207001,6,73,5,6,10,14,"西凉军",4,1,},
        [62] = {62,71,1,10,5207101,6,73,5,6,10,14,"西凉军",4,1,},
        [63] = {63,72,1,10,5207201,6,73,5,6,10,14,"西凉军",4,1,},
        [64] = {64,73,1,10,5207301,6,73,5,6,10,14,"西凉军",4,1,},
        [65] = {65,74,1,10,5207401,6,73,5,6,10,14,"西凉军",4,1,},
        [66] = {66,75,1,10,5207501,6,73,5,6,10,14,"西凉军",4,1,},
        [67] = {67,76,1,10,5207601,6,73,5,6,10,14,"西凉军",4,1,},
        [68] = {68,77,1,10,5207701,6,73,5,6,10,14,"西凉军",4,1,},
        [69] = {69,78,1,10,5207801,6,73,5,6,10,14,"西凉军",4,1,},
        [70] = {70,79,1,10,5207901,6,73,5,6,10,14,"西凉军",4,1,},
        [71] = {71,80,1,10,5208001,6,73,5,6,10,16,"西凉军",4,1,},
        [72] = {72,81,1,10,5208101,6,73,5,6,10,16,"西凉军",4,1,},
        [73] = {73,82,1,10,5208201,6,73,5,6,10,16,"西凉军",4,1,},
        [74] = {74,83,1,10,5208301,6,73,5,6,10,16,"西凉军",4,1,},
        [75] = {75,84,1,10,5208401,6,73,5,6,10,16,"西凉军",4,1,},
        [76] = {76,85,1,10,5208501,6,73,5,6,10,16,"西凉军",4,1,},
        [77] = {77,86,1,10,5208601,6,73,5,6,10,16,"西凉军",4,1,},
        [78] = {78,87,1,10,5208701,6,73,5,6,10,16,"西凉军",4,1,},
        [79] = {79,88,1,10,5208801,6,73,5,6,10,16,"西凉军",4,1,},
        [80] = {80,89,1,10,5208901,6,73,5,6,10,16,"西凉军",4,1,},
        [81] = {81,90,1,10,5209001,6,73,6,6,10,18,"西凉军",4,1,},
        [82] = {82,91,1,10,5209101,6,73,6,6,10,18,"西凉军",4,1,},
        [83] = {83,92,1,10,5209201,6,73,6,6,10,18,"西凉军",4,1,},
        [84] = {84,93,1,10,5209301,6,73,6,6,10,18,"西凉军",4,1,},
        [85] = {85,94,1,10,5209401,6,73,6,6,10,18,"西凉军",4,1,},
        [86] = {86,95,1,10,5209501,6,73,6,6,10,18,"西凉军",4,1,},
        [87] = {87,96,1,10,5209601,6,73,6,6,10,18,"西凉军",4,1,},
        [88] = {88,97,1,10,5209701,6,73,6,6,10,18,"西凉军",4,1,},
        [89] = {89,98,1,10,5209801,6,73,6,6,10,18,"西凉军",4,1,},
        [90] = {90,99,1,10,5209901,6,73,6,6,10,18,"西凉军",4,1,},
        [91] = {91,100,1,10,5210001,6,73,6,6,10,18,"西凉军",4,1,},
        [92] = {1001,101,1,10,5210101,6,73,6,6,10,20,"西凉军",4,1,},
        [93] = {1002,102,1,10,5210201,6,73,6,6,10,20,"西凉军",4,1,},
        [94] = {1003,103,1,10,5210301,6,73,6,6,10,20,"西凉军",4,1,},
        [95] = {1004,104,1,10,5210401,6,73,6,6,10,20,"西凉军",4,1,},
        [96] = {1005,105,1,10,5210501,6,73,6,6,10,20,"西凉军",4,1,},
        [97] = {1006,106,1,10,5210601,6,73,6,6,10,20,"西凉军",4,1,},
        [98] = {1007,107,1,10,5210701,6,73,6,6,10,20,"西凉军",4,1,},
        [99] = {1008,108,1,10,5210801,6,73,6,6,10,20,"西凉军",4,1,},
        [100] = {1009,109,1,10,5210901,6,73,6,6,10,20,"西凉军",4,1,},
        [101] = {1010,110,1,10,5211001,6,73,7,6,10,22,"西凉军",4,1,},
        [102] = {1011,111,1,10,5211101,6,73,7,6,10,22,"西凉军",4,1,},
        [103] = {1012,112,1,10,5211201,6,73,7,6,10,22,"西凉军",4,1,},
        [104] = {1013,113,1,10,5211301,6,73,7,6,10,22,"西凉军",4,1,},
        [105] = {1014,114,1,10,5211401,6,73,7,6,10,22,"西凉军",4,1,},
        [106] = {1015,115,1,10,5211501,6,73,7,6,10,22,"西凉军",4,1,},
        [107] = {1016,116,1,10,5211601,6,73,7,6,10,22,"西凉军",4,1,},
        [108] = {1017,117,1,10,5211701,6,73,7,6,10,22,"西凉军",4,1,},
        [109] = {1018,118,1,10,5211801,6,73,7,6,10,22,"西凉军",4,1,},
        [110] = {1019,119,1,10,5211901,6,73,7,6,10,22,"西凉军",4,1,},
        [111] = {1020,120,1,10,5212001,6,73,7,6,10,22,"西凉军",4,1,},
        [112] = {92,10,2,10,5201002,5,17,1000,0,0,0,"董卓",5,2,},
        [113] = {93,11,2,10,5201102,5,17,1000,0,0,0,"董卓",5,2,},
        [114] = {94,12,2,10,5201202,5,17,1000,0,0,0,"董卓",5,2,},
        [115] = {95,13,2,10,5201302,5,17,1000,0,0,0,"董卓",5,2,},
        [116] = {96,14,2,10,5201402,5,17,1000,0,0,0,"董卓",5,2,},
        [117] = {97,15,2,10,5201502,5,17,1000,0,0,0,"董卓",5,2,},
        [118] = {98,16,2,10,5201602,5,17,1000,0,0,0,"董卓",5,2,},
        [119] = {99,17,2,10,5201702,5,17,1000,0,0,0,"董卓",5,2,},
        [120] = {100,18,2,10,5201802,5,17,1000,0,0,0,"董卓",5,2,},
        [121] = {101,19,2,10,5201902,5,17,1000,0,0,0,"董卓",5,2,},
        [122] = {102,20,2,10,5202002,5,17,1000,0,0,0,"董卓",5,2,},
        [123] = {103,21,2,10,5202102,5,17,1000,0,0,0,"董卓",5,2,},
        [124] = {104,22,2,10,5202202,5,17,1000,0,0,0,"董卓",5,2,},
        [125] = {105,23,2,10,5202302,5,17,1000,0,0,0,"董卓",5,2,},
        [126] = {106,24,2,10,5202402,5,17,1000,0,0,0,"董卓",5,2,},
        [127] = {107,25,2,10,5202502,5,17,1000,0,0,0,"董卓",5,2,},
        [128] = {108,26,2,10,5202602,5,17,1000,0,0,0,"董卓",5,2,},
        [129] = {109,27,2,10,5202702,5,17,1000,0,0,0,"董卓",5,2,},
        [130] = {110,28,2,10,5202802,5,17,1000,0,0,0,"董卓",5,2,},
        [131] = {111,29,2,10,5202902,5,17,1000,0,0,0,"董卓",5,2,},
        [132] = {112,30,2,10,5203002,5,17,1250,0,0,0,"董卓",5,2,},
        [133] = {113,31,2,10,5203102,5,17,1250,0,0,0,"董卓",5,2,},
        [134] = {114,32,2,10,5203202,5,17,1250,0,0,0,"董卓",5,2,},
        [135] = {115,33,2,10,5203302,5,17,1250,0,0,0,"董卓",5,2,},
        [136] = {116,34,2,10,5203402,5,17,1250,0,0,0,"董卓",5,2,},
        [137] = {117,35,2,10,5203502,5,17,1250,0,0,0,"董卓",5,2,},
        [138] = {118,36,2,10,5203602,5,17,1250,0,0,0,"董卓",5,2,},
        [139] = {119,37,2,10,5203702,5,17,1250,0,0,0,"董卓",5,2,},
        [140] = {120,38,2,10,5203802,5,17,1250,0,0,0,"董卓",5,2,},
        [141] = {121,39,2,10,5203902,5,17,1250,0,0,0,"董卓",5,2,},
        [142] = {122,40,2,10,5204002,5,17,1250,0,0,0,"董卓",5,2,},
        [143] = {123,41,2,10,5204102,5,17,1250,0,0,0,"董卓",5,2,},
        [144] = {124,42,2,10,5204202,5,17,1250,0,0,0,"董卓",5,2,},
        [145] = {125,43,2,10,5204302,5,17,1250,0,0,0,"董卓",5,2,},
        [146] = {126,44,2,10,5204402,5,17,1250,0,0,0,"董卓",5,2,},
        [147] = {127,45,2,10,5204502,5,17,1250,0,0,0,"董卓",5,2,},
        [148] = {128,46,2,10,5204602,5,17,1250,0,0,0,"董卓",5,2,},
        [149] = {129,47,2,10,5204702,5,17,1250,0,0,0,"董卓",5,2,},
        [150] = {130,48,2,10,5204802,5,17,1250,0,0,0,"董卓",5,2,},
        [151] = {131,49,2,10,5204902,5,17,1250,0,0,0,"董卓",5,2,},
        [152] = {132,50,2,10,5205002,5,17,1500,0,0,0,"董卓",5,2,},
        [153] = {133,51,2,10,5205102,5,17,1500,0,0,0,"董卓",5,2,},
        [154] = {134,52,2,10,5205202,5,17,1500,0,0,0,"董卓",5,2,},
        [155] = {135,53,2,10,5205302,5,17,1500,0,0,0,"董卓",5,2,},
        [156] = {136,54,2,10,5205402,5,17,1500,0,0,0,"董卓",5,2,},
        [157] = {137,55,2,10,5205502,5,17,1500,0,0,0,"董卓",5,2,},
        [158] = {138,56,2,10,5205602,5,17,1500,0,0,0,"董卓",5,2,},
        [159] = {139,57,2,10,5205702,5,17,1500,0,0,0,"董卓",5,2,},
        [160] = {140,58,2,10,5205802,5,17,1500,0,0,0,"董卓",5,2,},
        [161] = {141,59,2,10,5205902,5,17,1500,0,0,0,"董卓",5,2,},
        [162] = {142,60,2,10,5206002,5,17,1500,0,0,0,"董卓",5,2,},
        [163] = {143,61,2,10,5206102,5,17,1500,0,0,0,"董卓",5,2,},
        [164] = {144,62,2,10,5206202,5,17,1500,0,0,0,"董卓",5,2,},
        [165] = {145,63,2,10,5206302,5,17,1500,0,0,0,"董卓",5,2,},
        [166] = {146,64,2,10,5206402,5,17,1500,0,0,0,"董卓",5,2,},
        [167] = {147,65,2,10,5206502,5,17,1500,0,0,0,"董卓",5,2,},
        [168] = {148,66,2,10,5206602,5,17,1500,0,0,0,"董卓",5,2,},
        [169] = {149,67,2,10,5206702,5,17,1500,0,0,0,"董卓",5,2,},
        [170] = {150,68,2,10,5206802,5,17,1500,0,0,0,"董卓",5,2,},
        [171] = {151,69,2,10,5206902,5,17,1500,0,0,0,"董卓",5,2,},
        [172] = {152,70,2,10,5207002,5,17,1750,0,0,0,"董卓",5,2,},
        [173] = {153,71,2,10,5207102,5,17,1750,0,0,0,"董卓",5,2,},
        [174] = {154,72,2,10,5207202,5,17,1750,0,0,0,"董卓",5,2,},
        [175] = {155,73,2,10,5207302,5,17,1750,0,0,0,"董卓",5,2,},
        [176] = {156,74,2,10,5207402,5,17,1750,0,0,0,"董卓",5,2,},
        [177] = {157,75,2,10,5207502,5,17,1750,0,0,0,"董卓",5,2,},
        [178] = {158,76,2,10,5207602,5,17,1750,0,0,0,"董卓",5,2,},
        [179] = {159,77,2,10,5207702,5,17,1750,0,0,0,"董卓",5,2,},
        [180] = {160,78,2,10,5207802,5,17,1750,0,0,0,"董卓",5,2,},
        [181] = {161,79,2,10,5207902,5,17,1750,0,0,0,"董卓",5,2,},
        [182] = {162,80,2,10,5208002,5,17,1750,0,0,0,"董卓",5,2,},
        [183] = {163,81,2,10,5208102,5,17,1750,0,0,0,"董卓",5,2,},
        [184] = {164,82,2,10,5208202,5,17,1750,0,0,0,"董卓",5,2,},
        [185] = {165,83,2,10,5208302,5,17,1750,0,0,0,"董卓",5,2,},
        [186] = {166,84,2,10,5208402,5,17,1750,0,0,0,"董卓",5,2,},
        [187] = {167,85,2,10,5208502,5,17,1750,0,0,0,"董卓",5,2,},
        [188] = {168,86,2,10,5208602,5,17,1750,0,0,0,"董卓",5,2,},
        [189] = {169,87,2,10,5208702,5,17,1750,0,0,0,"董卓",5,2,},
        [190] = {170,88,2,10,5208802,5,17,1750,0,0,0,"董卓",5,2,},
        [191] = {171,89,2,10,5208902,5,17,1750,0,0,0,"董卓",5,2,},
        [192] = {172,90,2,10,5209002,5,17,2000,0,0,0,"董卓",5,2,},
        [193] = {173,91,2,10,5209102,5,17,2000,0,0,0,"董卓",5,2,},
        [194] = {174,92,2,10,5209202,5,17,2000,0,0,0,"董卓",5,2,},
        [195] = {175,93,2,10,5209302,5,17,2000,0,0,0,"董卓",5,2,},
        [196] = {176,94,2,10,5209402,5,17,2000,0,0,0,"董卓",5,2,},
        [197] = {177,95,2,10,5209502,5,17,2000,0,0,0,"董卓",5,2,},
        [198] = {178,96,2,10,5209602,5,17,2000,0,0,0,"董卓",5,2,},
        [199] = {179,97,2,10,5209702,5,17,2000,0,0,0,"董卓",5,2,},
        [200] = {180,98,2,10,5209802,5,17,2000,0,0,0,"董卓",5,2,},
        [201] = {181,99,2,10,5209902,5,17,2000,0,0,0,"董卓",5,2,},
        [202] = {182,100,2,10,5210002,5,17,2000,0,0,0,"董卓",5,2,},
        [203] = {2001,101,2,10,5210102,5,17,2000,0,0,0,"董卓",5,2,},
        [204] = {2002,102,2,10,5210202,5,17,2000,0,0,0,"董卓",5,2,},
        [205] = {2003,103,2,10,5210302,5,17,2000,0,0,0,"董卓",5,2,},
        [206] = {2004,104,2,10,5210402,5,17,2000,0,0,0,"董卓",5,2,},
        [207] = {2005,105,2,10,5210502,5,17,2000,0,0,0,"董卓",5,2,},
        [208] = {2006,106,2,10,5210602,5,17,2000,0,0,0,"董卓",5,2,},
        [209] = {2007,107,2,10,5210702,5,17,2000,0,0,0,"董卓",5,2,},
        [210] = {2008,108,2,10,5210802,5,17,2000,0,0,0,"董卓",5,2,},
        [211] = {2009,109,2,10,5210902,5,17,2000,0,0,0,"董卓",5,2,},
        [212] = {2010,110,2,10,5211002,5,17,2250,0,0,0,"董卓",5,2,},
        [213] = {2011,111,2,10,5211102,5,17,2250,0,0,0,"董卓",5,2,},
        [214] = {2012,112,2,10,5211202,5,17,2250,0,0,0,"董卓",5,2,},
        [215] = {2013,113,2,10,5211302,5,17,2250,0,0,0,"董卓",5,2,},
        [216] = {2014,114,2,10,5211402,5,17,2250,0,0,0,"董卓",5,2,},
        [217] = {2015,115,2,10,5211502,5,17,2250,0,0,0,"董卓",5,2,},
        [218] = {2016,116,2,10,5211602,5,17,2250,0,0,0,"董卓",5,2,},
        [219] = {2017,117,2,10,5211702,5,17,2250,0,0,0,"董卓",5,2,},
        [220] = {2018,118,2,10,5211802,5,17,2250,0,0,0,"董卓",5,2,},
        [221] = {2019,119,2,10,5211902,5,17,2250,0,0,0,"董卓",5,2,},
        [222] = {2020,120,2,10,5212002,5,17,2250,0,0,0,"董卓",5,2,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [100] = 120,
    [1001] = 92,
    [1002] = 93,
    [1003] = 94,
    [1004] = 95,
    [1005] = 96,
    [1006] = 97,
    [1007] = 98,
    [1008] = 99,
    [1009] = 100,
    [101] = 121,
    [1010] = 101,
    [1011] = 102,
    [1012] = 103,
    [1013] = 104,
    [1014] = 105,
    [1015] = 106,
    [1016] = 107,
    [1017] = 108,
    [1018] = 109,
    [1019] = 110,
    [102] = 122,
    [1020] = 111,
    [103] = 123,
    [104] = 124,
    [105] = 125,
    [106] = 126,
    [107] = 127,
    [108] = 128,
    [109] = 129,
    [11] = 11,
    [110] = 130,
    [111] = 131,
    [112] = 132,
    [113] = 133,
    [114] = 134,
    [115] = 135,
    [116] = 136,
    [117] = 137,
    [118] = 138,
    [119] = 139,
    [12] = 12,
    [120] = 140,
    [121] = 141,
    [122] = 142,
    [123] = 143,
    [124] = 144,
    [125] = 145,
    [126] = 146,
    [127] = 147,
    [128] = 148,
    [129] = 149,
    [13] = 13,
    [130] = 150,
    [131] = 151,
    [132] = 152,
    [133] = 153,
    [134] = 154,
    [135] = 155,
    [136] = 156,
    [137] = 157,
    [138] = 158,
    [139] = 159,
    [14] = 14,
    [140] = 160,
    [141] = 161,
    [142] = 162,
    [143] = 163,
    [144] = 164,
    [145] = 165,
    [146] = 166,
    [147] = 167,
    [148] = 168,
    [149] = 169,
    [15] = 15,
    [150] = 170,
    [151] = 171,
    [152] = 172,
    [153] = 173,
    [154] = 174,
    [155] = 175,
    [156] = 176,
    [157] = 177,
    [158] = 178,
    [159] = 179,
    [16] = 16,
    [160] = 180,
    [161] = 181,
    [162] = 182,
    [163] = 183,
    [164] = 184,
    [165] = 185,
    [166] = 186,
    [167] = 187,
    [168] = 188,
    [169] = 189,
    [17] = 17,
    [170] = 190,
    [171] = 191,
    [172] = 192,
    [173] = 193,
    [174] = 194,
    [175] = 195,
    [176] = 196,
    [177] = 197,
    [178] = 198,
    [179] = 199,
    [18] = 18,
    [180] = 200,
    [181] = 201,
    [182] = 202,
    [19] = 19,
    [2] = 2,
    [20] = 20,
    [2001] = 203,
    [2002] = 204,
    [2003] = 205,
    [2004] = 206,
    [2005] = 207,
    [2006] = 208,
    [2007] = 209,
    [2008] = 210,
    [2009] = 211,
    [2010] = 212,
    [2011] = 213,
    [2012] = 214,
    [2013] = 215,
    [2014] = 216,
    [2015] = 217,
    [2016] = 218,
    [2017] = 219,
    [2018] = 220,
    [2019] = 221,
    [2020] = 222,
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
    [92] = 112,
    [93] = 113,
    [94] = 114,
    [95] = 115,
    [96] = 116,
    [97] = 117,
    [98] = 118,
    [99] = 119,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in explore_rebel")
        return t._raw[__key_map[k]]
    end
}

-- 
function explore_rebel.length()
    return #explore_rebel._data
end

-- 
function explore_rebel.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function explore_rebel.indexOf(index)
    if index == nil or not explore_rebel._data[index] then
        return nil
    end

    return setmetatable({_raw = explore_rebel._data[index]}, mt)
end

--
function explore_rebel.get(id)
    
    return explore_rebel.indexOf(__index_id[id])
        
end

--
function explore_rebel.set(id, key, value)
    local record = explore_rebel.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function explore_rebel.index()
    return __index_id
end

return explore_rebel