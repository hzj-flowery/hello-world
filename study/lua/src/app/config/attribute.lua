--attribute

-- key
local __key_map = {
  id = 1,    --资源id-int 
  type = 2,    --数值类型-int 
  cn_name = 3,    --中文名称-string 
  en_name = 4,    --英文名称-string 
  order = 5,    --排序-int 
  order2 = 6,    --统计排序-int 

}

-- data
local attribute = {
    _data = {
        [1] = {1,1,"攻击","atk",1,101,},
        [2] = {2,1,"物攻","pa",5,102,},
        [3] = {3,1,"法攻","ma",6,103,},
        [4] = {4,1,"防御","def",7,104,},
        [5] = {5,1,"物防","pd",3,105,},
        [6] = {6,1,"法防","md",4,106,},
        [7] = {7,1,"生命","hp",2,107,},
        [8] = {8,2,"攻击加成","atk_per",8,108,},
        [9] = {9,2,"物攻加成","pa_per",12,109,},
        [10] = {10,2,"法攻加成","ma_per",13,110,},
        [11] = {11,2,"防御加成","def_per",14,111,},
        [12] = {12,2,"物防加成","pd_per",10,112,},
        [13] = {13,2,"法防加成","md_per",11,113,},
        [14] = {14,2,"生命加成","hp_per",9,114,},
        [15] = {15,2,"暴击几率","crit",15,120,},
        [16] = {16,2,"抗暴几率","no_crit",16,121,},
        [17] = {17,2,"命中几率","hit",17,122,},
        [18] = {18,2,"闪避几率","no_hit",18,123,},
        [19] = {19,2,"伤害加成","hurt",19,124,},
        [20] = {20,2,"伤害减免","hurt_red",20,125,},
        [21] = {21,2,"暴击伤害","crit_hurt",21,126,},
        [22] = {22,2,"暴伤减免","crit_hurt_red",22,127,},
        [23] = {23,1,"初始怒气","anger",23,130,},
        [24] = {24,1,"怒气回复","anger_recover",24,131,},
        [25] = {25,2,"抗魏","resist_wei",25,0,},
        [26] = {26,2,"抗蜀","resist_shu",26,0,},
        [27] = {27,2,"抗吴","resist_wu",27,0,},
        [28] = {28,2,"抗群","resist_qun",28,0,},
        [29] = {29,2,"破魏","break_wei",29,0,},
        [30] = {30,2,"破蜀","break_shu",30,0,},
        [31] = {31,2,"破吴","break_wu",31,0,},
        [32] = {32,2,"破群","break_qun",32,0,},
        [33] = {33,2,"格挡几率","parry",33,0,},
        [34] = {34,2,"抗格几率","parry_break",34,0,},
        [35] = {35,1,"自愈","self_cure",35,0,},
        [36] = {36,2,"吸血","vampire",36,0,},
        [37] = {37,2,"吸血抗性","anti_vampire",37,0,},
        [38] = {38,2,"中毒增伤","poison_dmg",38,0,},
        [39] = {39,2,"中毒减伤","poison_dmg_red",39,0,},
        [40] = {40,2,"灼烧增伤","fire_dmg",40,0,},
        [41] = {41,2,"灼烧减伤","fire_dmg_red",41,0,},
        [42] = {42,2,"治疗加成","heal_per",42,0,},
        [43] = {43,2,"被治疗率","be_healed_per",43,0,},
        [44] = {44,1,"治疗总量","heal",44,0,},
        [45] = {45,1,"被治疗量","be_healed",45,0,},
        [46] = {46,2,"PVP增伤","pvp_hurt",46,128,},
        [47] = {47,2,"PVP减伤","pvp_hurt_red",47,129,},
        [48] = {48,1,"攻击","atk_final",48,115,},
        [49] = {49,1,"物防","pd_final",49,116,},
        [50] = {50,1,"法防","md_final",50,117,},
        [51] = {51,1,"生命","hp_final",51,118,},
        [52] = {52,2,"御甲","protect",52,0,},
        [53] = {101,1,"天赋战力","talent_power",48,201,},
        [54] = {102,1,"官衔战力","official_power",49,202,},
        [55] = {103,2,"神兽护佑","pet_protect",50,0,},
        [56] = {104,2,"神兽全属性","pet_attribute",51,0,},
        [57] = {105,1,"总战力","all_combat",52,0,},
        [58] = {106,1,"变身卡图鉴战力","avatar_power",52,203,},
        [59] = {107,1,"神兽图鉴战力","pet_power",53,204,},
        [60] = {108,1,"锦囊战力","silkbag_power",54,205,},
        [61] = {109,1,"变身卡战力","avatar_equip_power",55,206,},
        [62] = {110,1,"神兽初始假战力","pet_initial_power",56,207,},
        [63] = {111,2,"装饰属性","tree_attribute",57,0,},
        [64] = {112,2,"兽魂产量","output_pet",58,0,},
        [65] = {113,1,"神树战力","tree_power",59,208,},
        [66] = {114,1,"战马战力","horse_power",60,209,},
        [67] = {115,1,"玉石战力","jade_power",61,210,},
        [68] = {116,1,"历代名将战力","historical_hero_power",62,211,},
        [69] = {117,1,"战法假战力","tactics_power",63,212,},
        [70] = {118,1,"阵法假战力","bout_power",64,213,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [101] = 53,
    [102] = 54,
    [103] = 55,
    [104] = 56,
    [105] = 57,
    [106] = 58,
    [107] = 59,
    [108] = 60,
    [109] = 61,
    [11] = 11,
    [110] = 62,
    [111] = 63,
    [112] = 64,
    [113] = 65,
    [114] = 66,
    [115] = 67,
    [116] = 68,
    [117] = 69,
    [118] = 70,
    [12] = 12,
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
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in attribute")
        return t._raw[__key_map[k]]
    end
}

-- 
function attribute.length()
    return #attribute._data
end

-- 
function attribute.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function attribute.indexOf(index)
    if index == nil or not attribute._data[index] then
        return nil
    end

    return setmetatable({_raw = attribute._data[index]}, mt)
end

--
function attribute.get(id)
    
    return attribute.indexOf(__index_id[id])
        
end

--
function attribute.set(id, tkey, nvalue)
    local record = attribute.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function attribute.index()
    return __index_id
end

return attribute