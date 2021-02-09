--system_sound

-- key
local __key_map = {
  id = 1,    --编号-int 
  file_name = 2,    --文件路径-string 
  run_type = 3,    --播放类型1单次2循环-int 
  time = 4,    --音效时长，填0无效，单位为秒，主要用于主城背景音乐-int 

}

-- data
local system_sound = {
    _data = {
        [1] = {1,"audio/BGM_city4.mp3",2,181,},
        [2] = {2,"audio/BGM_pve.mp3",2,0,},
        [3] = {3,"audio/BGM_pvp.mp3",2,0,},
        [4] = {4,"audio/BGM_fight.mp3",2,0,},
        [5] = {5,"audio/BGM_boss.mp3",2,0,},
        [6] = {6,"audio/BGM_outgame.mp3",2,0,},
        [7] = {7,"audio/BGM_horsejump.mp3",2,0,},
        [8] = {8,"audio/BGM_arena.mp3",2,0,},
        [9] = {9,"audio/BGM_login.mp3",2,0,},
        [10] = {10,"audio/BGM_newcity.mp3",2,154,},
        [11] = {11,"audio/ui/30clickpzh1.mp3",1,0,},
        [12] = {12,"audio/ui/Passbutton.mp3",1,0,},
        [13] = {13,"audio/BGM_huangling.mp3",2,0,},
        [14] = {14,"audio/BGM_huangchengfight.mp3",2,0,},
        [15] = {15,"audio/BGM_chengshifight.mp3",2,0,},
        [16] = {16,"audio/BGM_jiangbianfight.mp3",2,0,},
        [17] = {17,"audio/BGM_jiaowaifight.mp3",2,0,},
        [18] = {18,"audio/BGM_yingzhaifight.mp3",2,0,},
        [19] = {19,"audio/BGM_city3.mp3",2,176,},
        [20] = {101,"audio/fight/Sha.mp3",1,0,},
        [21] = {102,"audio/fight/Fail.mp3",1,0,},
        [22] = {103,"audio/fight/Win.mp3",1,0,},
        [23] = {201,"audio/ui/1nvzhuruchang.mp3",1,0,},
        [24] = {202,"audio/ui/2nanzhuruchang.mp3",1,0,},
        [25] = {203,"audio/ui/3herolv.mp3",1,0,},
        [26] = {204,"audio/ui/4herotp.mp3",1,0,},
        [27] = {205,"audio/ui/5gongxi1.mp3",1,0,},
        [28] = {206,"audio/ui/5gongxi2.mp3",1,0,},
        [29] = {207,"audio/ui/6jiangli.mp3",1,0,},
        [30] = {208,"audio/ui/7shenbinjj.mp3",1,0,},
        [31] = {209,"audio/ui/8equiplv.mp3",1,0,},
        [32] = {210,"audio/ui/9num.mp3",1,0,},
        [33] = {211,"audio/ui/10equipmaster.mp3",1,0,},
        [34] = {212,"audio/ui/11herobook.mp3",1,0,},
        [35] = {213,"audio/ui/12herohs.mp3",1,0,},
        [36] = {214,"audio/ui/13herocs.mp3",1,0,},
        [37] = {215,"audio/ui/14gacha1.mp3",1,0,},
        [38] = {216,"audio/ui/15gacha101.mp3",1,0,},
        [39] = {217,"audio/ui/15gacha102.mp3",1,0,},
        [40] = {218,"audio/ui/16youliz1.mp3",1,0,},
        [41] = {219,"audio/ui/16youliz2.mp3",1,0,},
        [42] = {220,"audio/ui/17youliqy.mp3",1,0,},
        [43] = {223,"audio/ui/20pvps.mp3",1,0,},
        [44] = {224,"audio/ui/21pvpwin.mp3",1,0,},
        [45] = {225,"audio/ui/22pvpnum.mp3",1,0,},
        [46] = {226,"audio/ui/23richangnew.mp3",1,0,},
        [47] = {228,"audio/ui/25jubao.mp3",1,0,},
        [48] = {229,"audio/ui/26saodang.mp3",1,0,},
        [49] = {230,"audio/ui/27nanman.mp3",1,0,},
        [50] = {231,"audio/ui/28zhujuelv.mp3",1,0,},
        [51] = {232,"audio/ui/29guanxianlv.mp3",1,0,},
        [52] = {233,"audio/ui/4lvburuc.mp3",1,0,},
        [53] = {234,"audio/ui/10uiduijue.mp3",1,0,},
        [54] = {235,"audio/ui/11fudaokaiqi.mp3",1,0,},
        [55] = {236,"audio/ui/12shengfuyijue.mp3",1,0,},
        [56] = {237,"audio/ui/13xingongneng.mp3",1,0,},
        [57] = {238,"audio/ui/238zhuanpanhuode.mp3",1,0,},
        [58] = {239,"audio/ui/239zhuanpanyixia.mp3",1,0,},
        [59] = {240,"audio/ui/240hongbaohuode.mp3",1,0,},
        [60] = {241,"audio/ui/241hongbaokaiqi.mp3",1,0,},
        [61] = {242,"audio/ui/242gxqpmati.mp3",2,0,},
        [62] = {243,"audio/ui/243gxqpsheji.mp3",1,0,},
        [63] = {244,"audio/ui/244shenshouzhaomu.mp3",1,0,},
        [64] = {245,"audio/ui/245gaojishi.mp3",1,0,},
        [65] = {246,"audio/ui/246zhuangxian.mp3",1,0,},
        [66] = {247,"audio/ui/247caozaoyin.mp3",2,0,},
        [67] = {248,"audio/ui/248paobu.mp3",2,0,},
        [68] = {249,"audio/ui/249yusaiwin.mp3",1,0,},
        [69] = {250,"audio/ui/250yusailost.mp3",1,0,},
        [70] = {251,"audio/ui/251daojishi.mp3",1,0,},
        [71] = {252,"audio/ui/252matisheng.mp3",2,0,},
        [72] = {253,"audio/ui/253jinbi.mp3",1,0,},
        [73] = {254,"audio/ui/254tiaoyue.mp3",1,0,},
        [74] = {255,"audio/ui/255siwang.mp3",1,0,},
        [75] = {256,"audio/ui/256win.mp3",1,0,},
        [76] = {257,"audio/ui/257jiesuanjiemian.mp3",1,0,},
        [77] = {258,"audio/ui/258shengxing.mp3",1,0,},
        [78] = {259,"audio/ui/259jiangxing.mp3",1,0,},
        [79] = {260,"audio/ui/260duanweiup.mp3",1,0,},
        [80] = {261,"audio/ui/261duanweidowm.mp3",1,0,},
        [81] = {262,"audio/ui/262xiangma.mp3",1,0,},
        [82] = {263,"audio/ui/263login.mp3",1,0,},
        [83] = {264,"audio/ui/264tianchong.mp3",1,0,},
        [84] = {265,"audio/ui/265yingman.mp3",1,0,},
        [85] = {266,"audio/ui/266tupo.mp3",1,0,},
        [86] = {267,"audio/ui/267shibai.mp3",1,0,},
        [87] = {268,"audio/ui/268good.mp3",1,0,},
        [88] = {269,"audio/ui/269chenggong.mp3",1,0,},
        [89] = {270,"audio/BGM_pvpsingle32.mp3",2,0,},
        [90] = {271,"audio/BGM_pvpsinglewinner.mp3",1,0,},
        [91] = {272,"audio/BGM_allanswer.mp3",2,0,},
        [92] = {273,"audio/ui/30right.mp3",1,0,},
        [93] = {274,"audio/ui/31wrong.mp3",1,0,},
        [94] = {275,"audio/fight/fy_1_at_2.mp3",1,0,},
        [95] = {276,"audio/fight/fy_106_at_1.mp3",1,0,},
        [96] = {277,"audio/fight/fy_205_at_1.mp3",1,0,},
        [97] = {278,"audio/ui/32ganning.mp3",1,0,},
        [98] = {279,"audio/ui/33huangyueyin.mp3",1,0,},
        [99] = {280,"audio/ui/34lvbu.mp3",1,0,},
        [100] = {290,"audio/ui/290qinglong.mp3",1,0,},
        [101] = {291,"audio/ui/291xuanwu.mp3",1,0,},
        [102] = {292,"audio/ui/292baihu.mp3",1,0,},
        [103] = {293,"audio/ui/293zhuque.mp3",1,0,},
        [104] = {294,"audio/ui/294golden_open.mp3",1,0,},
        [105] = {295,"audio/ui/295golden_recruit.mp3",1,0,},
        [106] = {296,"audio/BGM_golden_hero.mp3",2,0,},
        [107] = {297,"audio/BGM_cake_main.mp3",2,0,},
        [108] = {298,"audio/ui/cake_egg.mp3",1,0,},
        [109] = {299,"audio/ui/cake_cream.mp3",1,0,},
        [110] = {300,"audio/ui/cake_fruit.mp3",1,0,},
        [111] = {301,"audio/ui/cake_lvup.mp3",1,0,},
        [112] = {302,"audio/ui/golden_win.mp3",1,0,},
        [113] = {303,"audio/ui/synthesis.mp3",1,0,},
        [114] = {304,"audio/BGM_guildcrosswar.mp3",2,0,},
        [115] = {305,"audio/ui/wei1.mp3",1,0,},
        [116] = {306,"audio/ui/wei2.mp3",1,0,},
        [117] = {307,"audio/ui/shu1.mp3",1,0,},
        [118] = {308,"audio/ui/shu2.mp3",1,0,},
        [119] = {309,"audio/ui/wu1.mp3",1,0,},
        [120] = {310,"audio/ui/wu2.mp3",1,0,},
        [121] = {311,"audio/ui/qun1.mp3",1,0,},
        [122] = {312,"audio/ui/qun2.mp3",1,0,},
        [123] = {313,"audio/ui/313qifu.mp3",1,0,},
        [124] = {314,"audio/ui/314jieqian.mp3",1,0,},
        [125] = {315,"audio/ui/historical_hero_open.mp3",1,0,},
        [126] = {316,"audio/fight/purple_historical_hero_fight.mp3",1,0,},
        [127] = {317,"audio/BGM_guildcrosswar2.mp3",2,0,},
        [128] = {318,"audio/ui/294golden_open_1.mp3",1,0,},
        [129] = {319,"audio/ui/319zhulong.mp3",1,0,},
        [130] = {320,"audio/ui/320jingwei.mp3",1,0,},
        [131] = {321,"audio/BGM_graincar.mp3",2,0,},
        [132] = {322,"audio/BGM_crossboss1.mp3",1,0,},
        [133] = {323,"audio/BGM_crossboss2.mp3",2,0,},
        [134] = {324,"audio/ui/324hudunidle.mp3",1,0,},
        [135] = {325,"audio/ui/325hudunshouji.mp3",1,0,},
        [136] = {326,"audio/ui/326hudunfantan.mp3",1,0,},
        [137] = {327,"audio/ui/327hudunposui.mp3",1,0,},
        [138] = {328,"audio/ui/328hudunbaozha.mp3",1,0,},
        [139] = {329,"audio/ui/329xuli.mp3",1,0,},
        [140] = {330,"audio/ui/330chenggong.mp3",1,0,},
        [141] = {331,"audio/ui/331shibai.mp3",1,0,},
        [142] = {332,"audio/BGM_pvpuniverse.mp3",2,0,},
        [143] = {333,"audio/BGM_universewinner.mp3",1,0,},
        [144] = {334,"audio/BGM_ten_jade_auction.mp3",2,0,},
        [145] = {335,"audio/ui/335zhanfawei.mp3",1,0,},
        [146] = {336,"audio/ui/336zhanfa.mp3",1,0,},
        [147] = {337,"audio/ui/337yanxi.mp3",1,0,},
        [148] = {338,"audio/ui/338shuliandu.mp3",1,0,},
        [149] = {339,"audio/BGM_pet_red_activity.mp3",2,0,},
        [150] = {340,"audio/ui/340pet_red_fly.mp3",1,0,},
        [151] = {341,"audio/ui/341pet_red_hit.mp3",1,0,},
        [152] = {342,"audio/ui/342pet_red_renovate.mp3",1,0,},
        [153] = {343,"audio/ui/343pet_red_xuli.mp3",2,0,},
        [154] = {344,"audio/ui/344bout_jihuo.mp3",1,0,},
        [155] = {345,"audio/ui/345bout_feixing.mp3",1,0,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [101] = 20,
    [102] = 21,
    [103] = 22,
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
    [201] = 23,
    [202] = 24,
    [203] = 25,
    [204] = 26,
    [205] = 27,
    [206] = 28,
    [207] = 29,
    [208] = 30,
    [209] = 31,
    [210] = 32,
    [211] = 33,
    [212] = 34,
    [213] = 35,
    [214] = 36,
    [215] = 37,
    [216] = 38,
    [217] = 39,
    [218] = 40,
    [219] = 41,
    [220] = 42,
    [223] = 43,
    [224] = 44,
    [225] = 45,
    [226] = 46,
    [228] = 47,
    [229] = 48,
    [230] = 49,
    [231] = 50,
    [232] = 51,
    [233] = 52,
    [234] = 53,
    [235] = 54,
    [236] = 55,
    [237] = 56,
    [238] = 57,
    [239] = 58,
    [240] = 59,
    [241] = 60,
    [242] = 61,
    [243] = 62,
    [244] = 63,
    [245] = 64,
    [246] = 65,
    [247] = 66,
    [248] = 67,
    [249] = 68,
    [250] = 69,
    [251] = 70,
    [252] = 71,
    [253] = 72,
    [254] = 73,
    [255] = 74,
    [256] = 75,
    [257] = 76,
    [258] = 77,
    [259] = 78,
    [260] = 79,
    [261] = 80,
    [262] = 81,
    [263] = 82,
    [264] = 83,
    [265] = 84,
    [266] = 85,
    [267] = 86,
    [268] = 87,
    [269] = 88,
    [270] = 89,
    [271] = 90,
    [272] = 91,
    [273] = 92,
    [274] = 93,
    [275] = 94,
    [276] = 95,
    [277] = 96,
    [278] = 97,
    [279] = 98,
    [280] = 99,
    [290] = 100,
    [291] = 101,
    [292] = 102,
    [293] = 103,
    [294] = 104,
    [295] = 105,
    [296] = 106,
    [297] = 107,
    [298] = 108,
    [299] = 109,
    [3] = 3,
    [300] = 110,
    [301] = 111,
    [302] = 112,
    [303] = 113,
    [304] = 114,
    [305] = 115,
    [306] = 116,
    [307] = 117,
    [308] = 118,
    [309] = 119,
    [310] = 120,
    [311] = 121,
    [312] = 122,
    [313] = 123,
    [314] = 124,
    [315] = 125,
    [316] = 126,
    [317] = 127,
    [318] = 128,
    [319] = 129,
    [320] = 130,
    [321] = 131,
    [322] = 132,
    [323] = 133,
    [324] = 134,
    [325] = 135,
    [326] = 136,
    [327] = 137,
    [328] = 138,
    [329] = 139,
    [330] = 140,
    [331] = 141,
    [332] = 142,
    [333] = 143,
    [334] = 144,
    [335] = 145,
    [336] = 146,
    [337] = 147,
    [338] = 148,
    [339] = 149,
    [340] = 150,
    [341] = 151,
    [342] = 152,
    [343] = 153,
    [344] = 154,
    [345] = 155,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in system_sound")
        return t._raw[__key_map[k]]
    end
}

-- 
function system_sound.length()
    return #system_sound._data
end

-- 
function system_sound.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function system_sound.indexOf(index)
    if index == nil or not system_sound._data[index] then
        return nil
    end

    return setmetatable({_raw = system_sound._data[index]}, mt)
end

--
function system_sound.get(id)
    
    return system_sound.indexOf(__index_id[id])
        
end

--
function system_sound.set(id, tkey, nvalue)
    local record = system_sound.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function system_sound.index()
    return __index_id
end

return system_sound