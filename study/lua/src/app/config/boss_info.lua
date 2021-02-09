--boss_info

-- key
local __key_map = {
  id = 1,    --id-int 
  monster_team_id = 2,    --怪物组id-int 
  weight = 3,    --出现权重-int 
  name = 4,    --名称-string 
  hero_id = 5,    --武将id-int 
  silk_bag = 6,    --对应紫锦囊-int 
  silk_bag101 = 7,    --对应橙锦囊1-int 
  silk_bag102 = 8,    --对应橙锦囊2-int 
  image = 9,    --名称图片-string 
  cartoon = 10,    --出场动画-string 
  current_image = 11,    --活动未开启时形象-string 
  boss_bubble = 12,    --boss对话-string 

}

-- data
local boss_info = {
    _data = {
        [1] = {1,5300001,50,"军师司马懿",101,1108,1223,1220,"txt_boss_lvbu01","0","img_boss_zhangjiao","1401|1402|1403|1404",},
        [2] = {2,5300002,50,"小霸王孙策",301,1103,1203,1222,"txt_boss_sunce01","0","img_boss_zhangjiao","1401|1402|1403|1404",},
        [3] = {3,5300003,50,"常山赵子龙",201,1101,1202,1216,"txt_boss_zhaoyun01","0","img_boss_zhangjiao","1401|1402|1403|1404",},
        [4] = {4,5300004,50,"玄天左慈",401,1104,1204,1221,"txt_boss_caocao01","0","img_boss_zhangjiao","1401|1402|1403|1404",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in boss_info")
        return t._raw[__key_map[k]]
    end
}

-- 
function boss_info.length()
    return #boss_info._data
end

-- 
function boss_info.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function boss_info.indexOf(index)
    if index == nil or not boss_info._data[index] then
        return nil
    end

    return setmetatable({_raw = boss_info._data[index]}, mt)
end

--
function boss_info.get(id)
    
    return boss_info.indexOf(__index_id[id])
        
end

--
function boss_info.set(id, key, value)
    local record = boss_info.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function boss_info.index()
    return __index_id
end

return boss_info