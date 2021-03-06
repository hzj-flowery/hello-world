--horse_star

-- key
local __key_map = {
  id = 1,    --编号-int 
  star = 2,    --星级-int 
  name = 3,    --装备名称-string 
  color = 4,    --品质-int 
  type_1 = 5,    --材料1type-int 
  value_1 = 6,    --材料1value-int 
  size_1 = 7,    --材料1size-int 
  type_2 = 8,    --材料2type-int 
  value_2 = 9,    --材料2value-int 
  size_2 = 10,    --材料2size-int 
  atk = 11,    --攻击-int 
  hp = 12,    --生命-int 
  pdef = 13,    --物防-int 
  mdef = 14,    --魔防-int 
  hit = 15,    --命中-int 
  no_crit = 16,    --免暴-int 
  power = 17,    --战斗力-int 
  skill_type1 = 18,    --技能属性1类型-int 
  skill_size1 = 19,    --技能属性1数值-int 
  skill = 20,    --技能描述-string 

}

-- data
local horse_star = {
    _data = {
        [1] = {1,1,"青骓",3,12,1,1,5,2,1000000,2400,17200,1200,1200,120,120,500000,8,10,"[青骓]骑乘武将攻击加成+1%",},
        [2] = {1,2,"追风·青骓",3,12,1,1,5,2,2000000,3600,26000,1800,1800,140,140,850000,8,20,"[追风·青骓]骑乘武将攻击加成+2%",},
        [3] = {1,3,"逐日·青骓",3,12,1,1,0,0,0,5200,38600,2600,2600,160,160,1200000,8,30,"[逐日·青骓]骑乘武将攻击加成+3%",},
        [4] = {2,1,"绿耳",3,12,2,1,5,2,1000000,2400,17200,1200,1200,120,120,500000,11,10,"[绿耳]骑乘武将防御加成+1%",},
        [5] = {2,2,"追风·绿耳",3,12,2,1,5,2,2000000,3600,26000,1800,1800,140,140,850000,11,20,"[追风·绿耳]骑乘武将防御加成+2%",},
        [6] = {2,3,"逐日·绿耳",3,12,2,1,0,0,0,5200,38600,2600,2600,160,160,1200000,11,30,"[逐日·绿耳]骑乘武将防御加成+3%",},
        [7] = {3,1,"渠黄",3,12,3,1,5,2,1000000,2400,17200,1200,1200,120,120,500000,14,10,"[渠黄]骑乘武将生命加成+1%",},
        [8] = {3,2,"追风·渠黄",3,12,3,1,5,2,2000000,3600,26000,1800,1800,140,140,850000,14,20,"[追风·渠黄]骑乘武将生命加成+2%",},
        [9] = {3,3,"逐日·渠黄",3,12,3,1,0,0,0,5200,38600,2600,2600,160,160,1200000,14,30,"[逐日·渠黄]骑乘武将生命加成+3%",},
        [10] = {4,1,"枣骝",3,12,4,1,5,2,1000000,2400,17200,1200,1200,120,120,500000,21,10,"[枣骝]骑乘武将暴击伤害加成+1%",},
        [11] = {4,2,"追风·枣骝",3,12,4,1,5,2,2000000,3600,26000,1800,1800,140,140,850000,21,20,"[追风·枣骝]骑乘武将暴击伤害加成+2%",},
        [12] = {4,3,"逐日·枣骝",3,12,4,1,0,0,0,5200,38600,2600,2600,160,160,1200000,21,30,"[逐日·枣骝]骑乘武将暴击伤害加成+3%",},
        [13] = {5,1,"雪里白",4,12,5,1,5,2,2000000,6400,48000,3200,3200,240,240,1500000,19,30,"[雪里白]骑乘武将伤害加成+3%",},
        [14] = {5,2,"追风·雪里白",4,12,5,1,5,2,4000000,9000,67000,4600,4600,270,270,2000000,19,60,"[追风·雪里白]骑乘武将伤害加成+6%",},
        [15] = {5,3,"逐日·雪里白",4,12,5,1,0,0,0,12800,96200,6400,6400,310,310,2500000,19,90,"[逐日·雪里白]骑乘武将伤害加成+9%",},
        [16] = {6,1,"飒露紫",4,12,6,1,5,2,2000000,6400,48000,3200,3200,240,240,1500000,20,30,"[飒露紫]骑乘武将受到的伤害减免+3%",},
        [17] = {6,2,"追风·飒露紫",4,12,6,1,5,2,4000000,9000,67000,4600,4600,270,270,2000000,20,60,"[追风·飒露紫]骑乘武将受到的伤害减免+6%",},
        [18] = {6,3,"逐日·飒露紫",4,12,6,1,0,0,0,12800,96200,6400,6400,310,310,2500000,20,90,"[逐日·飒露紫]骑乘武将受到的伤害减免+9%",},
        [19] = {7,1,"红玉辇",4,12,7,1,5,2,2000000,6400,48000,3200,3200,240,240,1500000,14,30,"[红玉辇]骑乘武将生命加成+3%",},
        [20] = {7,2,"追风·红玉辇",4,12,7,1,5,2,4000000,9000,67000,4600,4600,270,270,2000000,14,60,"[追风·红玉辇]骑乘武将生命加成+6%",},
        [21] = {7,3,"逐日·红玉辇",4,12,7,1,0,0,0,12800,96200,6400,6400,310,310,2500000,14,90,"[逐日·红玉辇]骑乘武将生命加成+9%",},
        [22] = {8,1,"碧骢驹",4,12,8,1,5,2,2000000,6400,48000,3200,3200,240,240,1500000,15,30,"[碧骢驹]骑乘武将暴击概率加成+3%",},
        [23] = {8,2,"追风·碧骢驹",4,12,8,1,5,2,4000000,9000,67000,4600,4600,270,270,2000000,15,60,"[追风·碧骢驹]骑乘武将暴击概率加成+6%",},
        [24] = {8,3,"逐日·碧骢驹",4,12,8,1,0,0,0,12800,96200,6400,6400,310,310,2500000,15,90,"[逐日·碧骢驹]骑乘武将暴击概率加成+9%",},
        [25] = {9,1,"飞霜千里",5,12,9,1,5,2,3000000,16000,116000,8000,8000,390,390,3600000,0,0,"[飞霜千里]攻击对敌方造成直接伤害的20%转化为治疗，治疗己方血量最少的目标。",},
        [26] = {9,2,"追风·飞霜千里",5,12,9,1,5,2,6000000,20000,147000,10000,10000,420,420,6000000,0,0,"[追风·飞霜千里]攻击对敌方造成直接伤害的30%转化为治疗，治疗己方血量最少的目标，并为该目标额外回复10%生命上限的血量。",},
        [27] = {9,3,"逐日·飞霜千里",5,12,9,1,0,0,0,26000,193000,13000,13000,470,470,8400000,0,0,"[逐日·飞霜千里]攻击对敌方造成直接伤害的30%转化为治疗，治疗己方血量最少的目标，并为该目标额外回复30%生命上限的血量。",},
        [28] = {10,1,"乌云踏雪",5,12,10,1,5,2,3000000,16000,116000,8000,8000,390,390,3600000,19,160,"[乌云踏雪]攻击对敌方造成伤害额外增加16%。",},
        [29] = {10,2,"追风·乌云踏雪",5,12,10,1,5,2,6000000,20000,147000,10000,10000,420,420,6000000,19,250,"[追风·乌云踏雪]攻击对敌方造成伤害额外增加25%，直接伤害击杀目标后50%概率回复自身1点怒气。",},
        [30] = {10,3,"逐日·乌云踏雪",5,12,10,1,0,0,0,26000,193000,13000,13000,470,470,8400000,19,250,"[逐日·乌云踏雪]攻击对敌方造成伤害额外增加25%，直接伤害击杀目标后回复自身1点怒气，并且下次回怒时额外回复自身1点怒气",},
        [31] = {11,1,"胭脂火龙",5,12,11,1,5,2,3000000,16000,116000,8000,8000,390,390,3600000,8,100,"[胭脂火龙]治疗效果提高10%，治疗被封疗的目标，可为其附加持续一回合的吸收伤害护盾，吸收40%治疗量的伤害",},
        [32] = {11,2,"追风·胭脂火龙",5,12,11,1,5,2,6000000,20000,147000,10000,10000,420,420,6000000,8,180,"[追风·胭脂火龙]治疗效果提高18%，治疗被封疗的目标，可为其附加持续一回合的吸收伤害护盾，吸收70%治疗量的伤害",},
        [33] = {11,3,"逐日·胭脂火龙",5,12,11,1,0,0,0,26000,193000,13000,13000,470,470,8400000,8,250,"[逐日·胭脂火龙]治疗效果提高25%，治疗被封疗的目标，可为其附加持续一回合的吸收伤害护盾，吸收100%治疗量的伤害",},
        [34] = {12,1,"夜照玉狮",5,12,12,1,5,2,3000000,16000,116000,8000,8000,390,390,3600000,0,0,"[夜照玉狮]战斗中每回合最多受到2点怒气降低效果",},
        [35] = {12,2,"追风·夜照玉狮",5,12,12,1,5,2,6000000,20000,147000,10000,10000,420,420,6000000,0,0,"[追风·夜照玉狮]战斗前最多受到1点怒气降低效果，战斗中每回合最多受到2点怒气降低效果",},
        [36] = {12,3,"逐日·夜照玉狮",5,12,12,1,0,0,0,26000,193000,13000,13000,470,470,8400000,0,0,"[逐日·夜照玉狮]战斗前最多受到1点怒气降低效果，战斗中每回合最多受到1点怒气降低效果",},
        [37] = {15,1,"奔雷青骢",5,12,15,1,5,2,3000000,16000,116000,8000,8000,390,390,3600000,14,150,"[奔雷青骢]生命最大值提高15%。战斗中首次受到致命伤害时，不会死亡并且会回复20%最大生命值的生命",},
        [38] = {15,2,"追风·奔雷青骢",5,12,15,1,5,2,6000000,20000,147000,10000,10000,420,420,6000000,14,300,"[追风·奔雷青骢]生命最大值提高30%。战斗中首次受到致命伤害时，不会死亡并且回复40%最大生命值的血量，回复自身2点怒气。",},
        [39] = {15,3,"逐日·奔雷青骢",5,12,15,1,0,0,0,26000,193000,13000,13000,470,470,8400000,14,450,"[逐日·奔雷青骢]生命最大值提高45%。战斗中首次受到致命伤害时，不会死亡并且回复60%最大生命值的血量，回复自身4点怒气",},
        [40] = {13,1,"爪黄飞电",6,12,13,1,5,2,4600000,28000,209000,14000,14000,680,680,9400000,0,0,"[爪黄飞电]敬请期待",},
        [41] = {13,2,"望月·爪黄飞电",6,12,13,1,5,2,9000000,34000,254000,17000,17000,730,730,11400000,0,0,"[望月·爪黄飞电]敬请期待",},
        [42] = {13,3,"踏天·爪黄飞电",6,12,13,1,0,0,0,42000,308000,21000,21000,780,780,14000000,0,0,"[踏天·爪黄飞电]敬请期待",},
        [43] = {14,1,"霹雳的卢",6,12,14,1,5,2,4600000,28000,209000,14000,14000,680,680,9400000,0,0,"[霹雳的卢]敬请期待",},
        [44] = {14,2,"望月·霹雳的卢",6,12,14,1,5,2,9000000,34000,254000,17000,17000,730,730,11400000,0,0,"[望月·霹雳的卢]敬请期待",},
        [45] = {14,3,"踏天·霹雳的卢",6,12,14,1,0,0,0,42000,308000,21000,21000,780,780,14000000,0,0,"[踏天·霹雳的卢]敬请期待",},
        [46] = {16,1,"铁血红鬃",5,12,16,1,5,2,3000000,16000,116000,8000,8000,390,390,3600000,14,150,"[铁血红鬃]生命最大值提高15%。释放技能时，如果目标已处于灼烧状态，本次技能对目标额外造成4%生命上限的伤害。",},
        [47] = {16,2,"追风·铁血红鬃",5,12,16,1,5,2,6000000,20000,147000,10000,10000,420,420,6000000,14,300,"[追风·铁血红鬃]生命最大值提高30%。释放技能时，如果目标已处于灼烧状态，本次技能对目标额外造成6%生命上限的伤害。",},
        [48] = {16,3,"逐日·铁血红鬃",5,12,16,1,0,0,0,26000,193000,13000,13000,470,470,8400000,14,450,"[逐日·铁血红鬃]生命最大值提高45%。释放技能时，如果目标已处于灼烧状态，本次技能对目标额外造成8%生命上限的伤害。",},
        [49] = {17,1,"暗夜紫骍",5,12,17,1,5,2,3000000,16000,116000,8000,8000,390,390,3600000,0,0,"[暗夜紫骍]每回合开始前，每个存活的其他同阵营武将提供骑乘武将自身生命上限8%的吸收直接伤害的护盾，持续1回合",},
        [50] = {17,2,"追风·暗夜紫骍",5,12,17,1,5,2,6000000,20000,147000,10000,10000,420,420,6000000,0,0,"[追风·暗夜紫骍]每回合开始前，每个存活的其他同阵营武将提供骑乘武将自身生命上限16%的吸收直接伤害的护盾，持续1回合",},
        [51] = {17,3,"逐日·暗夜紫骍",5,12,17,1,0,0,0,26000,193000,13000,13000,470,470,8400000,0,0,"[逐日·暗夜紫骍]每回合开始前，每个存活的其他同阵营武将提供骑乘武将自身生命上限24%的吸收直接伤害的护盾，持续1回合",},
    }
}

-- index
local __index_id_star = {
    ["10_1"] = 28,
    ["10_2"] = 29,
    ["10_3"] = 30,
    ["11_1"] = 31,
    ["11_2"] = 32,
    ["11_3"] = 33,
    ["12_1"] = 34,
    ["12_2"] = 35,
    ["12_3"] = 36,
    ["13_1"] = 40,
    ["13_2"] = 41,
    ["13_3"] = 42,
    ["14_1"] = 43,
    ["14_2"] = 44,
    ["14_3"] = 45,
    ["15_1"] = 37,
    ["15_2"] = 38,
    ["15_3"] = 39,
    ["16_1"] = 46,
    ["16_2"] = 47,
    ["16_3"] = 48,
    ["17_1"] = 49,
    ["17_2"] = 50,
    ["17_3"] = 51,
    ["1_1"] = 1,
    ["1_2"] = 2,
    ["1_3"] = 3,
    ["2_1"] = 4,
    ["2_2"] = 5,
    ["2_3"] = 6,
    ["3_1"] = 7,
    ["3_2"] = 8,
    ["3_3"] = 9,
    ["4_1"] = 10,
    ["4_2"] = 11,
    ["4_3"] = 12,
    ["5_1"] = 13,
    ["5_2"] = 14,
    ["5_3"] = 15,
    ["6_1"] = 16,
    ["6_2"] = 17,
    ["6_3"] = 18,
    ["7_1"] = 19,
    ["7_2"] = 20,
    ["7_3"] = 21,
    ["8_1"] = 22,
    ["8_2"] = 23,
    ["8_3"] = 24,
    ["9_1"] = 25,
    ["9_2"] = 26,
    ["9_3"] = 27,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in horse_star")
        return t._raw[__key_map[k]]
    end
}

-- 
function horse_star.length()
    return #horse_star._data
end

-- 
function horse_star.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function horse_star.indexOf(index)
    if index == nil or not horse_star._data[index] then
        return nil
    end

    return setmetatable({_raw = horse_star._data[index]}, mt)
end

--
function horse_star.get(id,star)
    
    local k = id .. '_' .. star
    return horse_star.indexOf(__index_id_star[k])
        
end

--
function horse_star.set(id,star, tkey, nvalue)
    local record = horse_star.get(id,star)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function horse_star.index()
    return __index_id_star
end

return horse_star