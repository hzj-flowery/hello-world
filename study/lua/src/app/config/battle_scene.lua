--battle_scene

-- key
local __key_map = {
  id = 1,    --地图id-int 
  background = 2,    --背景图-string 
  farground = 3,    --远景-string 
  front_eft = 4,    --前层特效（最前面）-string 
  middle_eft = 5,    --中层特效（背景前，人物后）-string 
  back_eft = 6,    --远景特效（远景前，中景后）-string 
  is_turn = 7,    --是否翻转，1翻转，0不翻转-int 

}

-- data
local battle_scene = {
    _data = {
        [1] = {1,"fight/scene/1_front.png","fight/scene/1_back.jpg","","gongchengmenzhandou_middle","gongchengmenzhandou_back",0,},
        [2] = {2,"fight/scene/2_middle.png","fight/scene/2_back.jpg","jiangbianzhandou_front","jiangbianzhandou_middle","jiangbianzhandou_back",0,},
        [3] = {3,"fight/scene/3_middle.png","fight/scene/3_back.jpg","huanggongzhandou_front","","huanggongzhandou_back",0,},
        [4] = {4,"fight/scene/4_middle.png","fight/scene/4_back.jpg","chengqiangzhandou_front","chengqiangzhandou_middle","chengqiangzhandou_back",0,},
        [5] = {5,"fight/scene/5.jpg","","fengyitingzhandou_front","fengyitingzhandou_middle","",0,},
        [6] = {6,"fight/scene/6_middle.png","fight/scene/6_back.jpg","","chuanshangzhandou_middle","chuanshangzhandou_back",0,},
        [7] = {7,"fight/scene/7.jpg","","taohuayuan_front","taohuayuan","",0,},
        [8] = {8,"fight/scene/8.jpg","","xiapizhandou_frnot","xiapizhandou_middle","",0,},
        [9] = {9,"fight/scene/9_middle.png","fight/scene/9_back.jpg","sanling_front","sanling_middle","sanling_back",0,},
        [10] = {10,"fight/scene/10_middle.png","fight/scene/10_back.jpg","","huangjinzhandou_middle","huangjinzhandou_back",0,},
        [11] = {11,"fight/scene/11_middle.png","fight/scene/11_back.jpg","changbanqiaozhandou_front","","changbanqiaozhandou_back",0,},
        [12] = {12,"fight/scene/12.jpg","","luoyangzhandou_front","luoyangzhandou_middle","",0,},
        [13] = {13,"fight/scene/13_middle.png","fight/scene/13_back.jpg","nanmanzhandou_front","nanmanzhandou_middle","nanmanzhandou_back",0,},
        [14] = {14,"fight/scene/14_middle.png","fight/scene/14_back.png","changbanpozhandou2_front","changbanpozhandou2_middle","changbanpozhandou2_back",0,},
        [15] = {15,"fight/scene/15_middle.png","fight/scene/15_back.jpg","junyingzhandou_front","junyingzhandou_middle","junyingzhandou_back",0,},
        [16] = {16,"fight/scene/16_middle.png","fight/scene/16_back.jpg","huanggongzoulang_front","","huanggongzoulang_back",0,},
        [17] = {17,"fight/scene/kuafujingjizhandou.jpg","","","kuafujingjizhandou","",0,},
        [18] = {18,"fight/scene/img_cross_boss_01b.png","fight/scene/img_cross_boss_bg01.jpg","","","kuafuboss_changjing",0,},
        [19] = {19,"fight/scene/img_cross_boss_02b.png","fight/scene/img_cross_boss_bg02.jpg","","","kuafuboss_changjing",0,},
        [20] = {101,"ui3/stage/dailymap_middle.png","ui3/stage/dailymap_back.jpg","","richangfuben_middle","richangfuben_back",0,},
        [21] = {102,"ui3/stage/city_winter_middle.png","ui3/stage/city_winter_back.jpg","newzhucheng_front","newzhucheng_middle","newzhucheng_back",0,},
        [22] = {103,"ui3/background/img_hs02_middle.png","ui3/background/img_hs02_back.jpg","","huishou_middle","huishou_back",0,},
        [23] = {104,"ui3/stage/city_night_middle.png","ui3/stage/city_night_back.jpg","zhucheng3_front","zhucheng3_middle","zhucheng3_back",0,},
        [24] = {105,"ui3/background/img_hs01.jpg","","","chongsheng_middle","",0,},
        [25] = {106,"ui3/stage/city_spring_middle.png","ui3/stage/city_spring_back.jpg","zhucheng4_front","zhucheng4_middle","",0,},
        [26] = {107,"ui3/stage/zhaomu_bj_middle.png","ui3/stage/zhaomu_bj_back.jpg","","zhaomu_middle","zhaomu_back",0,},
        [27] = {108,"ui3/stage/tower_bg_middle.png","ui3/stage/tower_bg_back.jpg","","guoguanzhanjiang_middle","guoguanzhanjiang_back",0,},
        [28] = {109,"ui3/stage/pet_main_scene.jpg","","shenshou_front","shenshou_back","",0,},
        [29] = {110,"ui3/stage/city_summer_middle.png","ui3/stage/city_summer_back.jpg","zhucheng5_front","","zhucheng5_back",0,},
        [30] = {111,"ui3/stage/city_summernight_middle.png","ui3/stage/city_summernight_back.jpg","zhucheng5night_front","","zhucheng5night_back",0,},
        [31] = {112,"ui3/stage/city_autumn_middle.png","ui3/stage/city_autumn_back.jpg","zhucheng6day_front","zhucheng6day_middle","zhucheng6day_back",0,},
        [32] = {113,"ui3/stage/city_autumnnight_middle.png","ui3/stage/city_autumnnight_back.jpg","zhucheng6night_front","zhucheng6night_middle","zhucheng6night_back",0,},
        [33] = {114,"ui3/background/img_judge_horse_bg.jpg","","","xiangmachangjing_middle","xiangmachangjing_back",0,},
        [34] = {115,"ui3/background/img_horse_main_bg.jpg","","","zhanmazhucheng_middle","",0,},
        [35] = {116,"ui3/stage/city_winter_middle.png","ui3/stage/city_winter_back.jpg","newzhucheng_front","newzhucheng_middle","newzhucheng_back",0,},
        [36] = {117,"ui3/stage/city_winternight_middle.png","ui3/stage/city_winternight_back.jpg","newzhuchengnight_front","newzhuchengnight_middle","newzhuchengnight_back",0,},
        [37] = {118,"ui3/stage/city_christmas_middle.png","ui3/stage/city_winter_back.jpg","shengdanzhucheng_front","shengdanzhucheng_middle","",0,},
        [38] = {119,"ui3/stage/city_christmasnight_middle.png","ui3/stage/city_winternight_back.jpg","shengdanzhuchengnight_front","shengdanzhuchengnight_middle","",0,},
        [39] = {120,"","ui3/stage/img_arena_bg.jpg","","","jingjichangchangjing_back",0,},
        [40] = {121,"ui3/stage/city_newyear_middle.png","ui3/stage/city_newyear_back.jpg","zhucheng9day_front","","zhucheng9day_middle",0,},
        [41] = {122,"ui3/stage/city_newyearnight_middle.png","ui3/stage/city_newyearnight_back.jpg","zhucheng9night_front","","zhucheng9night_back",0,},
        [42] = {123,"ui3/stage/zhucheng10day_middle.png","ui3/stage/zhucheng10day_back.jpg","zhucheng10day_front","","zhucheng10day_back",0,},
        [43] = {124,"ui3/stage/zhucheng10night_middle.png","ui3/stage/zhucheng10night_back.jpg","zhucheng10night_front","","zhucheng10night_back",0,},
        [44] = {125,"ui3/stage/zhucheng11day_middle.png","ui3/stage/zhucheng11day_back.jpg","zhucheng11day_front","","zhucheng11day_back",0,},
        [45] = {126,"ui3/stage/zhucheng11night_middle.png","ui3/stage/zhucheng11night_back.jpg","zhucheng11night_front","zhucheng11night_middle","zhucheng11night_back",0,},
        [46] = {127,"ui3/stage/zhucheng12day_middle.png","ui3/stage/zhucheng12day_back.jpg","","","zhucheng12day_back",0,},
        [47] = {128,"ui3/stage/zhucheng12night_middle.png","ui3/stage/zhucheng12night_back.jpg","","","zhucheng12night_back",0,},
        [48] = {129,"","ui3/stage/zhucheng13day_middle.jpg","zhucheng13day_front","zhucheng13day_middle","",0,},
        [49] = {130,"","ui3/stage/zhucheng13night_middle.jpg","zhucheng13night_front","zhucheng13night_middle","",0,},
        [50] = {131,"","ui3/stage/zhucheng14day_middle.jpg","zhucheng14day_front","zhucheng14day_middle","",0,},
        [51] = {132,"","ui3/stage/zhucheng14night_middle.jpg","zhucheng14night_front","zhucheng14night_middle","",0,},
        [52] = {133,"","ui3/stage/zhucheng15day_middle.jpg","","zhucheng15day","",0,},
        [53] = {134,"","ui3/stage/zhucheng15night_middle.jpg","","zhucheng15night_middle","",0,},
        [54] = {1001,"fight/scene/1_front.png","fight/scene/1_back.jpg","","gongchengmenzhandou_middle","gongchengmenzhandou_back",1,},
        [55] = {1002,"fight/scene/2_middle.png","fight/scene/2_back.jpg","jiangbianzhandou_front","jiangbianzhandou_middle","jiangbianzhandou_back",1,},
        [56] = {1003,"fight/scene/3_middle.png","fight/scene/3_back.jpg","huanggongzhandou_front","","huanggongzhandou_back",1,},
        [57] = {1004,"fight/scene/4_middle.png","fight/scene/4_back.jpg","chengqiangzhandou_front","chengqiangzhandou_middle","chengqiangzhandou_back",1,},
        [58] = {1005,"fight/scene/5.jpg","","fengyitingzhandou_front","fengyitingzhandou_middle","",1,},
        [59] = {1006,"fight/scene/6_middle.png","fight/scene/6_back.jpg","","chuanshangzhandou_middle","chuanshangzhandou_back",1,},
        [60] = {1007,"fight/scene/7.jpg","","taohuayuan_front","taohuayuan","",1,},
        [61] = {1008,"fight/scene/8.jpg","","xiapizhandou_frnot","xiapizhandou_middle","",1,},
        [62] = {1009,"fight/scene/9_middle.png","fight/scene/9_back.jpg","sanling_front","sanling_middle","sanling_back",1,},
        [63] = {1010,"fight/scene/10_middle.png","fight/scene/10_back.jpg","","huangjinzhandou_middle","huangjinzhandou_back",1,},
        [64] = {1011,"fight/scene/11_middle.png","fight/scene/11_back.jpg","changbanqiaozhandou_front","","changbanqiaozhandou_back",1,},
        [65] = {1012,"fight/scene/12.jpg","","luoyangzhandou_front","luoyangzhandou_middle","",1,},
        [66] = {1013,"fight/scene/13_middle.png","fight/scene/13_back.jpg","nanmanzhandou_front","nanmanzhandou_middle","nanmanzhandou_back",1,},
        [67] = {1014,"fight/scene/14_middle.png","fight/scene/14_back.png","changbanpozhandou2_front","changbanpozhandou2_middle","changbanpozhandou2_back",1,},
        [68] = {1015,"fight/scene/15_middle.png","fight/scene/15_back.jpg","junyingzhandou_front","junyingzhandou_middle","junyingzhandou_back",1,},
        [69] = {1016,"fight/scene/16_middle.png","fight/scene/16_back.jpg","huanggongzoulang_front","","huanggongzoulang_back",1,},
        [70] = {2001,"ui3/stage/tree_qj.png","ui3/stage/tree_bj.jpg","shenshuchangjing_front","","shenshuchangjing_back",0,},
        [71] = {2002,"ui3/fight/img_fight_bg05.png","","","wuchabiexiahoudun","",0,},
        [72] = {2003,"ui3/background/img_bg_cake01.jpg","","zhounianqingdangao_dengguang","","",0,},
        [73] = {2004,"ui3/background/img_bg_cake02.jpg","","zhounianqingdangao_dengguang","","",0,},
        [74] = {2005,"ui3/stage/img_transform_bg.jpg","","","lidaimingjiang_back","",0,},
        [75] = {2006,"","ui3/background/shengshoushenghong01.jpg","shengshoushenghong_front","","shengshoushenghong_back",0,},
        [76] = {2007,"ui3/background/img_bg_huoguo01.jpg","","zhounianqingdangao_dengguang","","",0,},
        [77] = {2008,"ui3/background/img_bg_huoguo02.jpg","","zhounianqingdangao_dengguang","","",0,},
        [78] = {2009,"ui3/background/img_bg_shaokao01.jpg","","benfukaorou_middle","","",0,},
        [79] = {2010,"ui3/background/img_bg_shaokao02.jpg","","quanfukaorou_middle","","",0,},
        [80] = {2011,"ui3/background/wujiangshengjin.jpg","","wujiangshenghong_cj","","",0,},
        [81] = {2012,"ui3/background/img_bg_nianye01.jpg","","benfunianyefan_middle","","",0,},
        [82] = {2013,"ui3/background/img_bg_nianye02.jpg","","quanfunianyefan_middle","","",0,},
        [83] = {2014,"ui3/background/pet_red_activity.jpg","","qiling_changjing","","",0,},
        [84] = {2101,"ui3/background/img_gold_bg05.jpg","","jinjiangzhaomu_dianjiang_front","jinjiangzhaomu_dianjiang","",0,},
        [85] = {9999,"ui3/stage/img_chuangjue_chengqiang.png","ui3/stage/img_chuangjue_yuanjing.jpg","","xinchuangjue_middle","xinchuangjue_back",0,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [1001] = 54,
    [1002] = 55,
    [1003] = 56,
    [1004] = 57,
    [1005] = 58,
    [1006] = 59,
    [1007] = 60,
    [1008] = 61,
    [1009] = 62,
    [101] = 20,
    [1010] = 63,
    [1011] = 64,
    [1012] = 65,
    [1013] = 66,
    [1014] = 67,
    [1015] = 68,
    [1016] = 69,
    [102] = 21,
    [103] = 22,
    [104] = 23,
    [105] = 24,
    [106] = 25,
    [107] = 26,
    [108] = 27,
    [109] = 28,
    [11] = 11,
    [110] = 29,
    [111] = 30,
    [112] = 31,
    [113] = 32,
    [114] = 33,
    [115] = 34,
    [116] = 35,
    [117] = 36,
    [118] = 37,
    [119] = 38,
    [12] = 12,
    [120] = 39,
    [121] = 40,
    [122] = 41,
    [123] = 42,
    [124] = 43,
    [125] = 44,
    [126] = 45,
    [127] = 46,
    [128] = 47,
    [129] = 48,
    [13] = 13,
    [130] = 49,
    [131] = 50,
    [132] = 51,
    [133] = 52,
    [134] = 53,
    [14] = 14,
    [15] = 15,
    [16] = 16,
    [17] = 17,
    [18] = 18,
    [19] = 19,
    [2] = 2,
    [2001] = 70,
    [2002] = 71,
    [2003] = 72,
    [2004] = 73,
    [2005] = 74,
    [2006] = 75,
    [2007] = 76,
    [2008] = 77,
    [2009] = 78,
    [2010] = 79,
    [2011] = 80,
    [2012] = 81,
    [2013] = 82,
    [2014] = 83,
    [2101] = 84,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,
    [9999] = 85,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in battle_scene")
        return t._raw[__key_map[k]]
    end
}

-- 
function battle_scene.length()
    return #battle_scene._data
end

-- 
function battle_scene.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function battle_scene.indexOf(index)
    if index == nil or not battle_scene._data[index] then
        return nil
    end

    return setmetatable({_raw = battle_scene._data[index]}, mt)
end

--
function battle_scene.get(id)
    
    return battle_scene.indexOf(__index_id[id])
        
end

--
function battle_scene.set(id, tkey, nvalue)
    local record = battle_scene.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function battle_scene.index()
    return __index_id
end

return battle_scene