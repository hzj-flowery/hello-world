--historical_hero_equipment

-- key
local __key_map = {
  id = 1,    --编号-int 
  color = 2,    --品质-int 
  name = 3,    --名称-string 
  res_id = 4,    --资源id-int 
  fragment_id = 5,    --碎片id-int 
  short_description = 6,    --装备短描述-string 
  long_description = 7,    --装备详细描述-string 
  historical_hero = 8,    --适用名将-int 

}

-- data
local historical_hero_equipment = {
    _data = {
        [1] = {101,4,"号钟古琴",101,0,"高渐离专属装备，增加护佑武将生命","高渐离专属兵器，额外增加高渐离护佑武将生命5%",101,},
        [2] = {102,4,"惊龙利刃",102,0,"阿珂专属装备，增加护佑武将伤害","阿轲专属兵器，额外增加阿轲护佑武将伤害5%",102,},
        [3] = {103,4,"寒光银枪",103,0,"韩信专属装备，增加护佑武将攻击","韩信专属兵器，额外增加韩信护佑武将攻击5%",103,},
        [4] = {104,4,"凌虚御笔",104,0,"张良专属装备，增加护佑武将免伤","张良专属兵器，额外增加张良护佑武将免伤5%",104,},
        [5] = {201,5,"定秦长剑",201,140001,"秦始皇专属装备，减免受到的直接伤害","秦始皇专属兵器，护佑武将受到其他武将的直接伤害额外降低9%，受到异常（麻痹，眩晕，沉默，灼烧，中毒，虚弱，压制，铁索，击飞）效果的概率降低12%",201,},
        [6] = {202,5,"八服汉剑",202,140002,"汉武帝专属装备，增加护佑武将伤害","汉武帝专属兵器，额外增加汉武帝护佑武将伤害以及治疗9%，暴击伤害24%",202,},
        [7] = {203,5,"霸王长枪",203,140003,"项羽专属装备，增加己方神兽效果","项羽专属兵器，护佑武将受到己方青龙，朱雀，玄武施加的有益效果时，效果额外再增加25%（怒气无额外增加）",203,},
        [8] = {204,5,"含光琵琶",204,140004,"虞姬专属装备，护佑武将清除异常","护佑武将受到武将的直接伤害时，100%几率清除自身1个灼烧或中毒状态",204,},
    }
}

-- index
local __index_id = {
    [101] = 1,
    [102] = 2,
    [103] = 3,
    [104] = 4,
    [201] = 5,
    [202] = 6,
    [203] = 7,
    [204] = 8,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in historical_hero_equipment")
        return t._raw[__key_map[k]]
    end
}

-- 
function historical_hero_equipment.length()
    return #historical_hero_equipment._data
end

-- 
function historical_hero_equipment.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function historical_hero_equipment.indexOf(index)
    if index == nil or not historical_hero_equipment._data[index] then
        return nil
    end

    return setmetatable({_raw = historical_hero_equipment._data[index]}, mt)
end

--
function historical_hero_equipment.get(id)
    
    return historical_hero_equipment.indexOf(__index_id[id])
        
end

--
function historical_hero_equipment.set(id, tkey, nvalue)
    local record = historical_hero_equipment.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function historical_hero_equipment.index()
    return __index_id
end

return historical_hero_equipment