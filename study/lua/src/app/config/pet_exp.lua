--pet_exp

-- key
local __key_map = {
  lv = 1,    --神兽等级-int 
  color = 2,    --品质-int 
  exp = 3,    --升级经验-int 
  ratio = 4,    --等级成长属性系数-int 

}

-- data
local pet_exp = {
    _data = {
        [1] = {1,2,200,1000,},
        [2] = {2,2,400,1000,},
        [3] = {3,2,600,1000,},
        [4] = {4,2,800,1000,},
        [5] = {5,2,1000,1000,},
        [6] = {6,2,1500,1000,},
        [7] = {7,2,2000,1000,},
        [8] = {8,2,2500,1000,},
        [9] = {9,2,3000,1000,},
        [10] = {10,2,3500,1000,},
        [11] = {11,2,4400,1000,},
        [12] = {12,2,4500,1000,},
        [13] = {13,2,4500,1000,},
        [14] = {14,2,4600,1000,},
        [15] = {15,2,4600,1000,},
        [16] = {16,2,4700,1000,},
        [17] = {17,2,4800,1000,},
        [18] = {18,2,4800,1000,},
        [19] = {19,2,4900,1000,},
        [20] = {20,2,4900,1000,},
        [21] = {21,2,5000,1000,},
        [22] = {22,2,5100,1000,},
        [23] = {23,2,5200,1000,},
        [24] = {24,2,5300,1000,},
        [25] = {25,2,5400,1000,},
        [26] = {26,2,5500,1000,},
        [27] = {27,2,5600,1000,},
        [28] = {28,2,5700,1000,},
        [29] = {29,2,5800,1000,},
        [30] = {30,2,5900,1000,},
        [31] = {31,2,6000,1000,},
        [32] = {32,2,6200,1000,},
        [33] = {33,2,6400,1000,},
        [34] = {34,2,6500,1000,},
        [35] = {35,2,6700,1000,},
        [36] = {36,2,6900,1000,},
        [37] = {37,2,7100,1000,},
        [38] = {38,2,7300,1000,},
        [39] = {39,2,7400,1000,},
        [40] = {40,2,7600,1000,},
        [41] = {41,2,7800,1000,},
        [42] = {42,2,8300,1000,},
        [43] = {43,2,8800,1000,},
        [44] = {44,2,9300,1000,},
        [45] = {45,2,9800,1000,},
        [46] = {46,2,10300,1000,},
        [47] = {47,2,10800,1000,},
        [48] = {48,2,11300,1000,},
        [49] = {49,2,11800,1000,},
        [50] = {50,2,12300,1000,},
        [51] = {51,2,12800,1000,},
        [52] = {52,2,13900,1000,},
        [53] = {53,2,15000,1000,},
        [54] = {54,2,16100,1000,},
        [55] = {55,2,17200,1000,},
        [56] = {56,2,18300,1000,},
        [57] = {57,2,19400,1000,},
        [58] = {58,2,20500,1000,},
        [59] = {59,2,21600,1000,},
        [60] = {60,2,22700,1000,},
        [61] = {61,2,23800,1000,},
        [62] = {62,2,25200,1000,},
        [63] = {63,2,25600,1000,},
        [64] = {64,2,26000,1000,},
        [65] = {65,2,26400,1000,},
        [66] = {66,2,26800,1000,},
        [67] = {67,2,27200,1000,},
        [68] = {68,2,27600,1000,},
        [69] = {69,2,28000,1000,},
        [70] = {70,2,28400,1000,},
        [71] = {71,2,28800,1000,},
        [72] = {72,2,29200,1000,},
        [73] = {73,2,29600,1000,},
        [74] = {74,2,30000,1000,},
        [75] = {75,2,30400,1000,},
        [76] = {76,2,30800,1000,},
        [77] = {77,2,31200,1000,},
        [78] = {78,2,31600,1000,},
        [79] = {79,2,32000,1000,},
        [80] = {80,2,32400,1000,},
        [81] = {81,2,32800,1000,},
        [82] = {82,2,33200,1000,},
        [83] = {83,2,33600,1000,},
        [84] = {84,2,34000,1000,},
        [85] = {85,2,34400,1000,},
        [86] = {86,2,34800,1000,},
        [87] = {87,2,35200,1000,},
        [88] = {88,2,35600,1000,},
        [89] = {89,2,36000,1000,},
        [90] = {90,2,36400,1000,},
        [91] = {91,2,36800,1000,},
        [92] = {92,2,37200,1000,},
        [93] = {93,2,37600,1000,},
        [94] = {94,2,38000,1000,},
        [95] = {95,2,38400,1000,},
        [96] = {96,2,38800,1000,},
        [97] = {97,2,39200,1000,},
        [98] = {98,2,39600,1000,},
        [99] = {99,2,40000,1000,},
        [100] = {100,2,40400,1000,},
        [101] = {101,2,40800,1000,},
        [102] = {102,2,41200,1000,},
        [103] = {103,2,41600,1000,},
        [104] = {104,2,42000,1000,},
        [105] = {105,2,42400,1000,},
        [106] = {106,2,42800,1000,},
        [107] = {107,2,43200,1000,},
        [108] = {108,2,43600,1000,},
        [109] = {109,2,44000,1000,},
        [110] = {110,2,44400,1000,},
        [111] = {111,2,44800,1000,},
        [112] = {112,2,45200,1000,},
        [113] = {113,2,45600,1000,},
        [114] = {114,2,46000,1000,},
        [115] = {115,2,46400,1000,},
        [116] = {116,2,46800,1000,},
        [117] = {117,2,47200,1000,},
        [118] = {118,2,47600,1000,},
        [119] = {119,2,48000,1000,},
        [120] = {120,2,0,1000,},
        [121] = {1,3,200,1000,},
        [122] = {2,3,400,1000,},
        [123] = {3,3,600,1000,},
        [124] = {4,3,800,1000,},
        [125] = {5,3,1000,1000,},
        [126] = {6,3,1500,1000,},
        [127] = {7,3,2000,1000,},
        [128] = {8,3,2500,1000,},
        [129] = {9,3,3000,1000,},
        [130] = {10,3,3500,1000,},
        [131] = {11,3,4400,1000,},
        [132] = {12,3,4500,1000,},
        [133] = {13,3,4500,1000,},
        [134] = {14,3,4600,1000,},
        [135] = {15,3,4600,1000,},
        [136] = {16,3,4700,1000,},
        [137] = {17,3,4800,1000,},
        [138] = {18,3,4800,1000,},
        [139] = {19,3,4900,1000,},
        [140] = {20,3,4900,1000,},
        [141] = {21,3,5000,1000,},
        [142] = {22,3,5100,1000,},
        [143] = {23,3,5200,1000,},
        [144] = {24,3,5300,1000,},
        [145] = {25,3,5400,1000,},
        [146] = {26,3,5500,1000,},
        [147] = {27,3,5600,1000,},
        [148] = {28,3,5700,1000,},
        [149] = {29,3,5800,1000,},
        [150] = {30,3,5900,1000,},
        [151] = {31,3,6000,1000,},
        [152] = {32,3,6200,1000,},
        [153] = {33,3,6400,1000,},
        [154] = {34,3,6500,1000,},
        [155] = {35,3,6700,1000,},
        [156] = {36,3,6900,1000,},
        [157] = {37,3,7100,1000,},
        [158] = {38,3,7300,1000,},
        [159] = {39,3,7400,1000,},
        [160] = {40,3,7600,1000,},
        [161] = {41,3,7800,1000,},
        [162] = {42,3,8300,1000,},
        [163] = {43,3,8800,1000,},
        [164] = {44,3,9300,1000,},
        [165] = {45,3,9800,1000,},
        [166] = {46,3,10300,1000,},
        [167] = {47,3,10800,1000,},
        [168] = {48,3,11300,1000,},
        [169] = {49,3,11800,1000,},
        [170] = {50,3,12300,1000,},
        [171] = {51,3,12800,1000,},
        [172] = {52,3,13900,1000,},
        [173] = {53,3,15000,1000,},
        [174] = {54,3,16100,1000,},
        [175] = {55,3,17200,1000,},
        [176] = {56,3,18300,1000,},
        [177] = {57,3,19400,1000,},
        [178] = {58,3,20500,1000,},
        [179] = {59,3,21600,1000,},
        [180] = {60,3,22700,1000,},
        [181] = {61,3,23800,1000,},
        [182] = {62,3,25200,1000,},
        [183] = {63,3,25600,1000,},
        [184] = {64,3,26000,1000,},
        [185] = {65,3,26400,1000,},
        [186] = {66,3,26800,1000,},
        [187] = {67,3,27200,1000,},
        [188] = {68,3,27600,1000,},
        [189] = {69,3,28000,1000,},
        [190] = {70,3,28400,1000,},
        [191] = {71,3,28800,1000,},
        [192] = {72,3,29200,1000,},
        [193] = {73,3,29600,1000,},
        [194] = {74,3,30000,1000,},
        [195] = {75,3,30400,1000,},
        [196] = {76,3,30800,1000,},
        [197] = {77,3,31200,1000,},
        [198] = {78,3,31600,1000,},
        [199] = {79,3,32000,1000,},
        [200] = {80,3,32400,1000,},
        [201] = {81,3,32800,1000,},
        [202] = {82,3,33200,1000,},
        [203] = {83,3,33600,1000,},
        [204] = {84,3,34000,1000,},
        [205] = {85,3,34400,1000,},
        [206] = {86,3,34800,1000,},
        [207] = {87,3,35200,1000,},
        [208] = {88,3,35600,1000,},
        [209] = {89,3,36000,1000,},
        [210] = {90,3,36400,1000,},
        [211] = {91,3,36800,1000,},
        [212] = {92,3,37200,1000,},
        [213] = {93,3,37600,1000,},
        [214] = {94,3,38000,1000,},
        [215] = {95,3,38400,1000,},
        [216] = {96,3,38800,1000,},
        [217] = {97,3,39200,1000,},
        [218] = {98,3,39600,1000,},
        [219] = {99,3,40000,1000,},
        [220] = {100,3,40400,1000,},
        [221] = {101,3,40800,1000,},
        [222] = {102,3,41200,1000,},
        [223] = {103,3,41600,1000,},
        [224] = {104,3,42000,1000,},
        [225] = {105,3,42400,1000,},
        [226] = {106,3,42800,1000,},
        [227] = {107,3,43200,1000,},
        [228] = {108,3,43600,1000,},
        [229] = {109,3,44000,1000,},
        [230] = {110,3,44400,1000,},
        [231] = {111,3,44800,1000,},
        [232] = {112,3,45200,1000,},
        [233] = {113,3,45600,1000,},
        [234] = {114,3,46000,1000,},
        [235] = {115,3,46400,1000,},
        [236] = {116,3,46800,1000,},
        [237] = {117,3,47200,1000,},
        [238] = {118,3,47600,1000,},
        [239] = {119,3,48000,1000,},
        [240] = {120,3,48400,1000,},
        [241] = {1,4,300,1000,},
        [242] = {2,4,600,1000,},
        [243] = {3,4,900,1000,},
        [244] = {4,4,1200,1000,},
        [245] = {5,4,1500,1000,},
        [246] = {6,4,2300,1000,},
        [247] = {7,4,3000,1000,},
        [248] = {8,4,3800,1000,},
        [249] = {9,4,4500,1000,},
        [250] = {10,4,5300,1000,},
        [251] = {11,4,6600,1000,},
        [252] = {12,4,6700,1000,},
        [253] = {13,4,6800,1000,},
        [254] = {14,4,6900,1000,},
        [255] = {15,4,7000,1000,},
        [256] = {16,4,7100,1000,},
        [257] = {17,4,7100,1000,},
        [258] = {18,4,7200,1000,},
        [259] = {19,4,7300,1000,},
        [260] = {20,4,7400,1000,},
        [261] = {21,4,7500,1000,},
        [262] = {22,4,7700,1000,},
        [263] = {23,4,7800,1000,},
        [264] = {24,4,8000,1000,},
        [265] = {25,4,8100,1000,},
        [266] = {26,4,8300,1000,},
        [267] = {27,4,8400,1000,},
        [268] = {28,4,8600,1000,},
        [269] = {29,4,8700,1000,},
        [270] = {30,4,8900,1000,},
        [271] = {31,4,9000,1000,},
        [272] = {32,4,9300,1000,},
        [273] = {33,4,9500,1000,},
        [274] = {34,4,9800,1000,},
        [275] = {35,4,10100,1000,},
        [276] = {36,4,10400,1000,},
        [277] = {37,4,10600,1000,},
        [278] = {38,4,10900,1000,},
        [279] = {39,4,11200,1000,},
        [280] = {40,4,11400,1000,},
        [281] = {41,4,11700,1000,},
        [282] = {42,4,12500,1000,},
        [283] = {43,4,13200,1000,},
        [284] = {44,4,14000,1000,},
        [285] = {45,4,14700,1000,},
        [286] = {46,4,15500,1000,},
        [287] = {47,4,16200,1000,},
        [288] = {48,4,17000,1000,},
        [289] = {49,4,17700,1000,},
        [290] = {50,4,18500,1000,},
        [291] = {51,4,19200,1000,},
        [292] = {52,4,20900,1000,},
        [293] = {53,4,22500,1000,},
        [294] = {54,4,24200,1000,},
        [295] = {55,4,25800,1000,},
        [296] = {56,4,27500,1000,},
        [297] = {57,4,29100,1000,},
        [298] = {58,4,30800,1000,},
        [299] = {59,4,32400,1000,},
        [300] = {60,4,34100,1000,},
        [301] = {61,4,35700,1000,},
        [302] = {62,4,37800,1000,},
        [303] = {63,4,38400,1000,},
        [304] = {64,4,39000,1000,},
        [305] = {65,4,39600,1000,},
        [306] = {66,4,40200,1000,},
        [307] = {67,4,40800,1000,},
        [308] = {68,4,41400,1000,},
        [309] = {69,4,42000,1000,},
        [310] = {70,4,42600,1000,},
        [311] = {71,4,43200,1000,},
        [312] = {72,4,43800,1000,},
        [313] = {73,4,44400,1000,},
        [314] = {74,4,45000,1000,},
        [315] = {75,4,45600,1000,},
        [316] = {76,4,46200,1000,},
        [317] = {77,4,46800,1000,},
        [318] = {78,4,47400,1000,},
        [319] = {79,4,48000,1000,},
        [320] = {80,4,48600,1000,},
        [321] = {81,4,49200,1000,},
        [322] = {82,4,49800,1000,},
        [323] = {83,4,50400,1000,},
        [324] = {84,4,51000,1000,},
        [325] = {85,4,51600,1000,},
        [326] = {86,4,52200,1000,},
        [327] = {87,4,52800,1000,},
        [328] = {88,4,53400,1000,},
        [329] = {89,4,54000,1000,},
        [330] = {90,4,54600,1000,},
        [331] = {91,4,55200,1000,},
        [332] = {92,4,55800,1000,},
        [333] = {93,4,56400,1000,},
        [334] = {94,4,57000,1000,},
        [335] = {95,4,57600,1000,},
        [336] = {96,4,58200,1000,},
        [337] = {97,4,58800,1000,},
        [338] = {98,4,59400,1000,},
        [339] = {99,4,60000,1000,},
        [340] = {100,4,60600,1000,},
        [341] = {101,4,61200,1000,},
        [342] = {102,4,61800,1000,},
        [343] = {103,4,62400,1000,},
        [344] = {104,4,63000,1000,},
        [345] = {105,4,63600,1000,},
        [346] = {106,4,64200,1000,},
        [347] = {107,4,64800,1000,},
        [348] = {108,4,65400,1000,},
        [349] = {109,4,66000,1000,},
        [350] = {110,4,66600,1000,},
        [351] = {111,4,67200,1000,},
        [352] = {112,4,67800,1000,},
        [353] = {113,4,68400,1000,},
        [354] = {114,4,69000,1000,},
        [355] = {115,4,69600,1000,},
        [356] = {116,4,70200,1000,},
        [357] = {117,4,70800,1000,},
        [358] = {118,4,71400,1000,},
        [359] = {119,4,72000,1000,},
        [360] = {120,4,72600,1000,},
        [361] = {1,5,400,1000,},
        [362] = {2,5,800,1000,},
        [363] = {3,5,1200,1000,},
        [364] = {4,5,1600,1000,},
        [365] = {5,5,2000,1000,},
        [366] = {6,5,3000,1000,},
        [367] = {7,5,4000,1000,},
        [368] = {8,5,5000,1000,},
        [369] = {9,5,6000,1000,},
        [370] = {10,5,7000,1000,},
        [371] = {11,5,8800,1000,},
        [372] = {12,5,8900,1000,},
        [373] = {13,5,9000,1000,},
        [374] = {14,5,9200,1000,},
        [375] = {15,5,9300,1000,},
        [376] = {16,5,9400,1000,},
        [377] = {17,5,9500,1000,},
        [378] = {18,5,9600,1000,},
        [379] = {19,5,9800,1000,},
        [380] = {20,5,9900,1000,},
        [381] = {21,5,10000,1000,},
        [382] = {22,5,10200,1000,},
        [383] = {23,5,10400,1000,},
        [384] = {24,5,10600,1000,},
        [385] = {25,5,10800,1000,},
        [386] = {26,5,11000,1000,},
        [387] = {27,5,11200,1000,},
        [388] = {28,5,11400,1000,},
        [389] = {29,5,11600,1000,},
        [390] = {30,5,11800,1000,},
        [391] = {31,5,12000,1000,},
        [392] = {32,5,12400,1000,},
        [393] = {33,5,12700,1000,},
        [394] = {34,5,13100,1000,},
        [395] = {35,5,13400,1000,},
        [396] = {36,5,13800,1000,},
        [397] = {37,5,14200,1000,},
        [398] = {38,5,14500,1000,},
        [399] = {39,5,14900,1000,},
        [400] = {40,5,15200,1000,},
        [401] = {41,5,15600,1000,},
        [402] = {42,5,16600,1000,},
        [403] = {43,5,17600,1000,},
        [404] = {44,5,18600,1000,},
        [405] = {45,5,19600,1000,},
        [406] = {46,5,20600,1000,},
        [407] = {47,5,21600,1000,},
        [408] = {48,5,22600,1000,},
        [409] = {49,5,23600,1000,},
        [410] = {50,5,24600,1000,},
        [411] = {51,5,25600,1000,},
        [412] = {52,5,27800,1000,},
        [413] = {53,5,30000,1000,},
        [414] = {54,5,32200,1000,},
        [415] = {55,5,34400,1000,},
        [416] = {56,5,36600,1000,},
        [417] = {57,5,38800,1000,},
        [418] = {58,5,41000,1000,},
        [419] = {59,5,43200,1000,},
        [420] = {60,5,45400,1000,},
        [421] = {61,5,47600,1000,},
        [422] = {62,5,50400,1000,},
        [423] = {63,5,51200,1000,},
        [424] = {64,5,52000,1000,},
        [425] = {65,5,52800,1000,},
        [426] = {66,5,53600,1000,},
        [427] = {67,5,54400,1000,},
        [428] = {68,5,55200,1000,},
        [429] = {69,5,56000,1000,},
        [430] = {70,5,56800,1000,},
        [431] = {71,5,57600,1000,},
        [432] = {72,5,58400,1000,},
        [433] = {73,5,59200,1000,},
        [434] = {74,5,60000,1000,},
        [435] = {75,5,60800,1000,},
        [436] = {76,5,61600,1000,},
        [437] = {77,5,62400,1000,},
        [438] = {78,5,63200,1000,},
        [439] = {79,5,64000,1000,},
        [440] = {80,5,64800,1000,},
        [441] = {81,5,65600,1000,},
        [442] = {82,5,66400,1000,},
        [443] = {83,5,67200,1000,},
        [444] = {84,5,68000,1000,},
        [445] = {85,5,68800,1000,},
        [446] = {86,5,69600,1000,},
        [447] = {87,5,70400,1000,},
        [448] = {88,5,71200,1000,},
        [449] = {89,5,72000,1000,},
        [450] = {90,5,72800,1000,},
        [451] = {91,5,73600,1000,},
        [452] = {92,5,74400,1000,},
        [453] = {93,5,75200,1000,},
        [454] = {94,5,76000,1000,},
        [455] = {95,5,76800,1000,},
        [456] = {96,5,77600,1000,},
        [457] = {97,5,78400,1000,},
        [458] = {98,5,79200,1000,},
        [459] = {99,5,80000,1000,},
        [460] = {100,5,80800,1000,},
        [461] = {101,5,81600,1000,},
        [462] = {102,5,82400,1000,},
        [463] = {103,5,83200,1000,},
        [464] = {104,5,84000,1000,},
        [465] = {105,5,84800,1000,},
        [466] = {106,5,85600,1000,},
        [467] = {107,5,86400,1000,},
        [468] = {108,5,87200,1000,},
        [469] = {109,5,88000,1000,},
        [470] = {110,5,88800,1000,},
        [471] = {111,5,89600,1000,},
        [472] = {112,5,90400,1000,},
        [473] = {113,5,91200,1000,},
        [474] = {114,5,92000,1000,},
        [475] = {115,5,92800,1000,},
        [476] = {116,5,93600,1000,},
        [477] = {117,5,94400,1000,},
        [478] = {118,5,95200,1000,},
        [479] = {119,5,96000,1000,},
        [480] = {120,5,96800,1000,},
        [481] = {1,6,500,1000,},
        [482] = {2,6,1000,1000,},
        [483] = {3,6,1400,1000,},
        [484] = {4,6,1900,1000,},
        [485] = {5,6,2400,1000,},
        [486] = {6,6,3600,1000,},
        [487] = {7,6,4800,1000,},
        [488] = {8,6,6000,1000,},
        [489] = {9,6,7200,1000,},
        [490] = {10,6,8400,1000,},
        [491] = {11,6,10600,1000,},
        [492] = {12,6,10700,1000,},
        [493] = {13,6,10800,1000,},
        [494] = {14,6,11000,1000,},
        [495] = {15,6,11100,1000,},
        [496] = {16,6,11300,1000,},
        [497] = {17,6,11400,1000,},
        [498] = {18,6,11600,1000,},
        [499] = {19,6,11700,1000,},
        [500] = {20,6,11900,1000,},
        [501] = {21,6,12000,1000,},
        [502] = {22,6,12200,1000,},
        [503] = {23,6,12500,1000,},
        [504] = {24,6,12700,1000,},
        [505] = {25,6,13000,1000,},
        [506] = {26,6,13200,1000,},
        [507] = {27,6,13400,1000,},
        [508] = {28,6,13700,1000,},
        [509] = {29,6,13900,1000,},
        [510] = {30,6,14200,1000,},
        [511] = {31,6,14400,1000,},
        [512] = {32,6,14800,1000,},
        [513] = {33,6,15300,1000,},
        [514] = {34,6,15700,1000,},
        [515] = {35,6,16100,1000,},
        [516] = {36,6,16600,1000,},
        [517] = {37,6,17000,1000,},
        [518] = {38,6,17400,1000,},
        [519] = {39,6,17900,1000,},
        [520] = {40,6,18300,1000,},
        [521] = {41,6,18700,1000,},
        [522] = {42,6,19900,1000,},
        [523] = {43,6,21100,1000,},
        [524] = {44,6,22300,1000,},
        [525] = {45,6,23500,1000,},
        [526] = {46,6,24700,1000,},
        [527] = {47,6,25900,1000,},
        [528] = {48,6,27100,1000,},
        [529] = {49,6,28300,1000,},
        [530] = {50,6,29500,1000,},
        [531] = {51,6,30700,1000,},
        [532] = {52,6,33400,1000,},
        [533] = {53,6,36000,1000,},
        [534] = {54,6,38600,1000,},
        [535] = {55,6,41300,1000,},
        [536] = {56,6,43900,1000,},
        [537] = {57,6,46600,1000,},
        [538] = {58,6,49200,1000,},
        [539] = {59,6,51800,1000,},
        [540] = {60,6,54500,1000,},
        [541] = {61,6,57100,1000,},
        [542] = {62,6,60500,1000,},
        [543] = {63,6,61400,1000,},
        [544] = {64,6,62400,1000,},
        [545] = {65,6,63400,1000,},
        [546] = {66,6,64300,1000,},
        [547] = {67,6,65300,1000,},
        [548] = {68,6,66200,1000,},
        [549] = {69,6,67200,1000,},
        [550] = {70,6,68200,1000,},
        [551] = {71,6,69100,1000,},
        [552] = {72,6,70100,1000,},
        [553] = {73,6,71000,1000,},
        [554] = {74,6,72000,1000,},
        [555] = {75,6,73000,1000,},
        [556] = {76,6,73900,1000,},
        [557] = {77,6,74900,1000,},
        [558] = {78,6,75800,1000,},
        [559] = {79,6,76800,1000,},
        [560] = {80,6,77800,1000,},
        [561] = {81,6,78700,1000,},
        [562] = {82,6,79700,1000,},
        [563] = {83,6,80600,1000,},
        [564] = {84,6,81600,1000,},
        [565] = {85,6,82600,1000,},
        [566] = {86,6,83500,1000,},
        [567] = {87,6,84500,1000,},
        [568] = {88,6,85400,1000,},
        [569] = {89,6,86400,1000,},
        [570] = {90,6,87400,1000,},
        [571] = {91,6,88300,1000,},
        [572] = {92,6,89300,1000,},
        [573] = {93,6,90200,1000,},
        [574] = {94,6,91200,1000,},
        [575] = {95,6,92200,1000,},
        [576] = {96,6,93100,1000,},
        [577] = {97,6,94100,1000,},
        [578] = {98,6,95000,1000,},
        [579] = {99,6,96000,1000,},
        [580] = {100,6,238500,1000,},
        [581] = {101,6,240900,1000,},
        [582] = {102,6,243200,1000,},
        [583] = {103,6,245600,1000,},
        [584] = {104,6,248000,1000,},
        [585] = {105,6,250300,1000,},
        [586] = {106,6,252700,1000,},
        [587] = {107,6,255000,1000,},
        [588] = {108,6,257400,1000,},
        [589] = {109,6,259800,1000,},
        [590] = {110,6,262100,1000,},
        [591] = {111,6,264500,1000,},
        [592] = {112,6,266800,1000,},
        [593] = {113,6,269200,1000,},
        [594] = {114,6,271600,1000,},
        [595] = {115,6,273900,1000,},
        [596] = {116,6,276300,1000,},
        [597] = {117,6,278700,1000,},
        [598] = {118,6,281000,1000,},
        [599] = {119,6,283400,1000,},
        [600] = {120,6,285000,1000,},
    }
}

-- index
local __index_lv_color = {
    ["100_2"] = 100,
    ["100_3"] = 220,
    ["100_4"] = 340,
    ["100_5"] = 460,
    ["100_6"] = 580,
    ["101_2"] = 101,
    ["101_3"] = 221,
    ["101_4"] = 341,
    ["101_5"] = 461,
    ["101_6"] = 581,
    ["102_2"] = 102,
    ["102_3"] = 222,
    ["102_4"] = 342,
    ["102_5"] = 462,
    ["102_6"] = 582,
    ["103_2"] = 103,
    ["103_3"] = 223,
    ["103_4"] = 343,
    ["103_5"] = 463,
    ["103_6"] = 583,
    ["104_2"] = 104,
    ["104_3"] = 224,
    ["104_4"] = 344,
    ["104_5"] = 464,
    ["104_6"] = 584,
    ["105_2"] = 105,
    ["105_3"] = 225,
    ["105_4"] = 345,
    ["105_5"] = 465,
    ["105_6"] = 585,
    ["106_2"] = 106,
    ["106_3"] = 226,
    ["106_4"] = 346,
    ["106_5"] = 466,
    ["106_6"] = 586,
    ["107_2"] = 107,
    ["107_3"] = 227,
    ["107_4"] = 347,
    ["107_5"] = 467,
    ["107_6"] = 587,
    ["108_2"] = 108,
    ["108_3"] = 228,
    ["108_4"] = 348,
    ["108_5"] = 468,
    ["108_6"] = 588,
    ["109_2"] = 109,
    ["109_3"] = 229,
    ["109_4"] = 349,
    ["109_5"] = 469,
    ["109_6"] = 589,
    ["10_2"] = 10,
    ["10_3"] = 130,
    ["10_4"] = 250,
    ["10_5"] = 370,
    ["10_6"] = 490,
    ["110_2"] = 110,
    ["110_3"] = 230,
    ["110_4"] = 350,
    ["110_5"] = 470,
    ["110_6"] = 590,
    ["111_2"] = 111,
    ["111_3"] = 231,
    ["111_4"] = 351,
    ["111_5"] = 471,
    ["111_6"] = 591,
    ["112_2"] = 112,
    ["112_3"] = 232,
    ["112_4"] = 352,
    ["112_5"] = 472,
    ["112_6"] = 592,
    ["113_2"] = 113,
    ["113_3"] = 233,
    ["113_4"] = 353,
    ["113_5"] = 473,
    ["113_6"] = 593,
    ["114_2"] = 114,
    ["114_3"] = 234,
    ["114_4"] = 354,
    ["114_5"] = 474,
    ["114_6"] = 594,
    ["115_2"] = 115,
    ["115_3"] = 235,
    ["115_4"] = 355,
    ["115_5"] = 475,
    ["115_6"] = 595,
    ["116_2"] = 116,
    ["116_3"] = 236,
    ["116_4"] = 356,
    ["116_5"] = 476,
    ["116_6"] = 596,
    ["117_2"] = 117,
    ["117_3"] = 237,
    ["117_4"] = 357,
    ["117_5"] = 477,
    ["117_6"] = 597,
    ["118_2"] = 118,
    ["118_3"] = 238,
    ["118_4"] = 358,
    ["118_5"] = 478,
    ["118_6"] = 598,
    ["119_2"] = 119,
    ["119_3"] = 239,
    ["119_4"] = 359,
    ["119_5"] = 479,
    ["119_6"] = 599,
    ["11_2"] = 11,
    ["11_3"] = 131,
    ["11_4"] = 251,
    ["11_5"] = 371,
    ["11_6"] = 491,
    ["120_2"] = 120,
    ["120_3"] = 240,
    ["120_4"] = 360,
    ["120_5"] = 480,
    ["120_6"] = 600,
    ["12_2"] = 12,
    ["12_3"] = 132,
    ["12_4"] = 252,
    ["12_5"] = 372,
    ["12_6"] = 492,
    ["13_2"] = 13,
    ["13_3"] = 133,
    ["13_4"] = 253,
    ["13_5"] = 373,
    ["13_6"] = 493,
    ["14_2"] = 14,
    ["14_3"] = 134,
    ["14_4"] = 254,
    ["14_5"] = 374,
    ["14_6"] = 494,
    ["15_2"] = 15,
    ["15_3"] = 135,
    ["15_4"] = 255,
    ["15_5"] = 375,
    ["15_6"] = 495,
    ["16_2"] = 16,
    ["16_3"] = 136,
    ["16_4"] = 256,
    ["16_5"] = 376,
    ["16_6"] = 496,
    ["17_2"] = 17,
    ["17_3"] = 137,
    ["17_4"] = 257,
    ["17_5"] = 377,
    ["17_6"] = 497,
    ["18_2"] = 18,
    ["18_3"] = 138,
    ["18_4"] = 258,
    ["18_5"] = 378,
    ["18_6"] = 498,
    ["19_2"] = 19,
    ["19_3"] = 139,
    ["19_4"] = 259,
    ["19_5"] = 379,
    ["19_6"] = 499,
    ["1_2"] = 1,
    ["1_3"] = 121,
    ["1_4"] = 241,
    ["1_5"] = 361,
    ["1_6"] = 481,
    ["20_2"] = 20,
    ["20_3"] = 140,
    ["20_4"] = 260,
    ["20_5"] = 380,
    ["20_6"] = 500,
    ["21_2"] = 21,
    ["21_3"] = 141,
    ["21_4"] = 261,
    ["21_5"] = 381,
    ["21_6"] = 501,
    ["22_2"] = 22,
    ["22_3"] = 142,
    ["22_4"] = 262,
    ["22_5"] = 382,
    ["22_6"] = 502,
    ["23_2"] = 23,
    ["23_3"] = 143,
    ["23_4"] = 263,
    ["23_5"] = 383,
    ["23_6"] = 503,
    ["24_2"] = 24,
    ["24_3"] = 144,
    ["24_4"] = 264,
    ["24_5"] = 384,
    ["24_6"] = 504,
    ["25_2"] = 25,
    ["25_3"] = 145,
    ["25_4"] = 265,
    ["25_5"] = 385,
    ["25_6"] = 505,
    ["26_2"] = 26,
    ["26_3"] = 146,
    ["26_4"] = 266,
    ["26_5"] = 386,
    ["26_6"] = 506,
    ["27_2"] = 27,
    ["27_3"] = 147,
    ["27_4"] = 267,
    ["27_5"] = 387,
    ["27_6"] = 507,
    ["28_2"] = 28,
    ["28_3"] = 148,
    ["28_4"] = 268,
    ["28_5"] = 388,
    ["28_6"] = 508,
    ["29_2"] = 29,
    ["29_3"] = 149,
    ["29_4"] = 269,
    ["29_5"] = 389,
    ["29_6"] = 509,
    ["2_2"] = 2,
    ["2_3"] = 122,
    ["2_4"] = 242,
    ["2_5"] = 362,
    ["2_6"] = 482,
    ["30_2"] = 30,
    ["30_3"] = 150,
    ["30_4"] = 270,
    ["30_5"] = 390,
    ["30_6"] = 510,
    ["31_2"] = 31,
    ["31_3"] = 151,
    ["31_4"] = 271,
    ["31_5"] = 391,
    ["31_6"] = 511,
    ["32_2"] = 32,
    ["32_3"] = 152,
    ["32_4"] = 272,
    ["32_5"] = 392,
    ["32_6"] = 512,
    ["33_2"] = 33,
    ["33_3"] = 153,
    ["33_4"] = 273,
    ["33_5"] = 393,
    ["33_6"] = 513,
    ["34_2"] = 34,
    ["34_3"] = 154,
    ["34_4"] = 274,
    ["34_5"] = 394,
    ["34_6"] = 514,
    ["35_2"] = 35,
    ["35_3"] = 155,
    ["35_4"] = 275,
    ["35_5"] = 395,
    ["35_6"] = 515,
    ["36_2"] = 36,
    ["36_3"] = 156,
    ["36_4"] = 276,
    ["36_5"] = 396,
    ["36_6"] = 516,
    ["37_2"] = 37,
    ["37_3"] = 157,
    ["37_4"] = 277,
    ["37_5"] = 397,
    ["37_6"] = 517,
    ["38_2"] = 38,
    ["38_3"] = 158,
    ["38_4"] = 278,
    ["38_5"] = 398,
    ["38_6"] = 518,
    ["39_2"] = 39,
    ["39_3"] = 159,
    ["39_4"] = 279,
    ["39_5"] = 399,
    ["39_6"] = 519,
    ["3_2"] = 3,
    ["3_3"] = 123,
    ["3_4"] = 243,
    ["3_5"] = 363,
    ["3_6"] = 483,
    ["40_2"] = 40,
    ["40_3"] = 160,
    ["40_4"] = 280,
    ["40_5"] = 400,
    ["40_6"] = 520,
    ["41_2"] = 41,
    ["41_3"] = 161,
    ["41_4"] = 281,
    ["41_5"] = 401,
    ["41_6"] = 521,
    ["42_2"] = 42,
    ["42_3"] = 162,
    ["42_4"] = 282,
    ["42_5"] = 402,
    ["42_6"] = 522,
    ["43_2"] = 43,
    ["43_3"] = 163,
    ["43_4"] = 283,
    ["43_5"] = 403,
    ["43_6"] = 523,
    ["44_2"] = 44,
    ["44_3"] = 164,
    ["44_4"] = 284,
    ["44_5"] = 404,
    ["44_6"] = 524,
    ["45_2"] = 45,
    ["45_3"] = 165,
    ["45_4"] = 285,
    ["45_5"] = 405,
    ["45_6"] = 525,
    ["46_2"] = 46,
    ["46_3"] = 166,
    ["46_4"] = 286,
    ["46_5"] = 406,
    ["46_6"] = 526,
    ["47_2"] = 47,
    ["47_3"] = 167,
    ["47_4"] = 287,
    ["47_5"] = 407,
    ["47_6"] = 527,
    ["48_2"] = 48,
    ["48_3"] = 168,
    ["48_4"] = 288,
    ["48_5"] = 408,
    ["48_6"] = 528,
    ["49_2"] = 49,
    ["49_3"] = 169,
    ["49_4"] = 289,
    ["49_5"] = 409,
    ["49_6"] = 529,
    ["4_2"] = 4,
    ["4_3"] = 124,
    ["4_4"] = 244,
    ["4_5"] = 364,
    ["4_6"] = 484,
    ["50_2"] = 50,
    ["50_3"] = 170,
    ["50_4"] = 290,
    ["50_5"] = 410,
    ["50_6"] = 530,
    ["51_2"] = 51,
    ["51_3"] = 171,
    ["51_4"] = 291,
    ["51_5"] = 411,
    ["51_6"] = 531,
    ["52_2"] = 52,
    ["52_3"] = 172,
    ["52_4"] = 292,
    ["52_5"] = 412,
    ["52_6"] = 532,
    ["53_2"] = 53,
    ["53_3"] = 173,
    ["53_4"] = 293,
    ["53_5"] = 413,
    ["53_6"] = 533,
    ["54_2"] = 54,
    ["54_3"] = 174,
    ["54_4"] = 294,
    ["54_5"] = 414,
    ["54_6"] = 534,
    ["55_2"] = 55,
    ["55_3"] = 175,
    ["55_4"] = 295,
    ["55_5"] = 415,
    ["55_6"] = 535,
    ["56_2"] = 56,
    ["56_3"] = 176,
    ["56_4"] = 296,
    ["56_5"] = 416,
    ["56_6"] = 536,
    ["57_2"] = 57,
    ["57_3"] = 177,
    ["57_4"] = 297,
    ["57_5"] = 417,
    ["57_6"] = 537,
    ["58_2"] = 58,
    ["58_3"] = 178,
    ["58_4"] = 298,
    ["58_5"] = 418,
    ["58_6"] = 538,
    ["59_2"] = 59,
    ["59_3"] = 179,
    ["59_4"] = 299,
    ["59_5"] = 419,
    ["59_6"] = 539,
    ["5_2"] = 5,
    ["5_3"] = 125,
    ["5_4"] = 245,
    ["5_5"] = 365,
    ["5_6"] = 485,
    ["60_2"] = 60,
    ["60_3"] = 180,
    ["60_4"] = 300,
    ["60_5"] = 420,
    ["60_6"] = 540,
    ["61_2"] = 61,
    ["61_3"] = 181,
    ["61_4"] = 301,
    ["61_5"] = 421,
    ["61_6"] = 541,
    ["62_2"] = 62,
    ["62_3"] = 182,
    ["62_4"] = 302,
    ["62_5"] = 422,
    ["62_6"] = 542,
    ["63_2"] = 63,
    ["63_3"] = 183,
    ["63_4"] = 303,
    ["63_5"] = 423,
    ["63_6"] = 543,
    ["64_2"] = 64,
    ["64_3"] = 184,
    ["64_4"] = 304,
    ["64_5"] = 424,
    ["64_6"] = 544,
    ["65_2"] = 65,
    ["65_3"] = 185,
    ["65_4"] = 305,
    ["65_5"] = 425,
    ["65_6"] = 545,
    ["66_2"] = 66,
    ["66_3"] = 186,
    ["66_4"] = 306,
    ["66_5"] = 426,
    ["66_6"] = 546,
    ["67_2"] = 67,
    ["67_3"] = 187,
    ["67_4"] = 307,
    ["67_5"] = 427,
    ["67_6"] = 547,
    ["68_2"] = 68,
    ["68_3"] = 188,
    ["68_4"] = 308,
    ["68_5"] = 428,
    ["68_6"] = 548,
    ["69_2"] = 69,
    ["69_3"] = 189,
    ["69_4"] = 309,
    ["69_5"] = 429,
    ["69_6"] = 549,
    ["6_2"] = 6,
    ["6_3"] = 126,
    ["6_4"] = 246,
    ["6_5"] = 366,
    ["6_6"] = 486,
    ["70_2"] = 70,
    ["70_3"] = 190,
    ["70_4"] = 310,
    ["70_5"] = 430,
    ["70_6"] = 550,
    ["71_2"] = 71,
    ["71_3"] = 191,
    ["71_4"] = 311,
    ["71_5"] = 431,
    ["71_6"] = 551,
    ["72_2"] = 72,
    ["72_3"] = 192,
    ["72_4"] = 312,
    ["72_5"] = 432,
    ["72_6"] = 552,
    ["73_2"] = 73,
    ["73_3"] = 193,
    ["73_4"] = 313,
    ["73_5"] = 433,
    ["73_6"] = 553,
    ["74_2"] = 74,
    ["74_3"] = 194,
    ["74_4"] = 314,
    ["74_5"] = 434,
    ["74_6"] = 554,
    ["75_2"] = 75,
    ["75_3"] = 195,
    ["75_4"] = 315,
    ["75_5"] = 435,
    ["75_6"] = 555,
    ["76_2"] = 76,
    ["76_3"] = 196,
    ["76_4"] = 316,
    ["76_5"] = 436,
    ["76_6"] = 556,
    ["77_2"] = 77,
    ["77_3"] = 197,
    ["77_4"] = 317,
    ["77_5"] = 437,
    ["77_6"] = 557,
    ["78_2"] = 78,
    ["78_3"] = 198,
    ["78_4"] = 318,
    ["78_5"] = 438,
    ["78_6"] = 558,
    ["79_2"] = 79,
    ["79_3"] = 199,
    ["79_4"] = 319,
    ["79_5"] = 439,
    ["79_6"] = 559,
    ["7_2"] = 7,
    ["7_3"] = 127,
    ["7_4"] = 247,
    ["7_5"] = 367,
    ["7_6"] = 487,
    ["80_2"] = 80,
    ["80_3"] = 200,
    ["80_4"] = 320,
    ["80_5"] = 440,
    ["80_6"] = 560,
    ["81_2"] = 81,
    ["81_3"] = 201,
    ["81_4"] = 321,
    ["81_5"] = 441,
    ["81_6"] = 561,
    ["82_2"] = 82,
    ["82_3"] = 202,
    ["82_4"] = 322,
    ["82_5"] = 442,
    ["82_6"] = 562,
    ["83_2"] = 83,
    ["83_3"] = 203,
    ["83_4"] = 323,
    ["83_5"] = 443,
    ["83_6"] = 563,
    ["84_2"] = 84,
    ["84_3"] = 204,
    ["84_4"] = 324,
    ["84_5"] = 444,
    ["84_6"] = 564,
    ["85_2"] = 85,
    ["85_3"] = 205,
    ["85_4"] = 325,
    ["85_5"] = 445,
    ["85_6"] = 565,
    ["86_2"] = 86,
    ["86_3"] = 206,
    ["86_4"] = 326,
    ["86_5"] = 446,
    ["86_6"] = 566,
    ["87_2"] = 87,
    ["87_3"] = 207,
    ["87_4"] = 327,
    ["87_5"] = 447,
    ["87_6"] = 567,
    ["88_2"] = 88,
    ["88_3"] = 208,
    ["88_4"] = 328,
    ["88_5"] = 448,
    ["88_6"] = 568,
    ["89_2"] = 89,
    ["89_3"] = 209,
    ["89_4"] = 329,
    ["89_5"] = 449,
    ["89_6"] = 569,
    ["8_2"] = 8,
    ["8_3"] = 128,
    ["8_4"] = 248,
    ["8_5"] = 368,
    ["8_6"] = 488,
    ["90_2"] = 90,
    ["90_3"] = 210,
    ["90_4"] = 330,
    ["90_5"] = 450,
    ["90_6"] = 570,
    ["91_2"] = 91,
    ["91_3"] = 211,
    ["91_4"] = 331,
    ["91_5"] = 451,
    ["91_6"] = 571,
    ["92_2"] = 92,
    ["92_3"] = 212,
    ["92_4"] = 332,
    ["92_5"] = 452,
    ["92_6"] = 572,
    ["93_2"] = 93,
    ["93_3"] = 213,
    ["93_4"] = 333,
    ["93_5"] = 453,
    ["93_6"] = 573,
    ["94_2"] = 94,
    ["94_3"] = 214,
    ["94_4"] = 334,
    ["94_5"] = 454,
    ["94_6"] = 574,
    ["95_2"] = 95,
    ["95_3"] = 215,
    ["95_4"] = 335,
    ["95_5"] = 455,
    ["95_6"] = 575,
    ["96_2"] = 96,
    ["96_3"] = 216,
    ["96_4"] = 336,
    ["96_5"] = 456,
    ["96_6"] = 576,
    ["97_2"] = 97,
    ["97_3"] = 217,
    ["97_4"] = 337,
    ["97_5"] = 457,
    ["97_6"] = 577,
    ["98_2"] = 98,
    ["98_3"] = 218,
    ["98_4"] = 338,
    ["98_5"] = 458,
    ["98_6"] = 578,
    ["99_2"] = 99,
    ["99_3"] = 219,
    ["99_4"] = 339,
    ["99_5"] = 459,
    ["99_6"] = 579,
    ["9_2"] = 9,
    ["9_3"] = 129,
    ["9_4"] = 249,
    ["9_5"] = 369,
    ["9_6"] = 489,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pet_exp")
        return t._raw[__key_map[k]]
    end
}

-- 
function pet_exp.length()
    return #pet_exp._data
end

-- 
function pet_exp.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pet_exp.indexOf(index)
    if index == nil or not pet_exp._data[index] then
        return nil
    end

    return setmetatable({_raw = pet_exp._data[index]}, mt)
end

--
function pet_exp.get(lv,color)
    
    local k = lv .. '_' .. color
    return pet_exp.indexOf(__index_lv_color[k])
        
end

--
function pet_exp.set(lv,color, tkey, nvalue)
    local record = pet_exp.get(lv,color)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function pet_exp.index()
    return __index_lv_color
end

return pet_exp