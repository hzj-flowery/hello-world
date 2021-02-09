--cross_boss_info

-- key
local __key_map = {
  id = 1,    --id-int 
  monster_team_id = 2,    --怪物组id-int 
  weight = 3,    --出现权重-int 
  name = 4,    --名称-string 
  camp_1 = 5,    --破招阵营-string 
  camp_2 = 6,    --追击阵营-string 
  hero_id = 7,    --武将id-int 
  red_hero_id = 8,    --红将id-int 
  profile = 9,    --头像-string 
  spine = 10,    --spine资源-string 
  voice1 = 11,    --蓄力状态开始语音-string 
  voice2 = 12,    --破招失败语音-string 

}

-- data
local cross_boss_info = {
    _data = {
        [1] = {1,5500001,50,"子上","1","2|3|4",150,101,"btn_main_enter_crossboss1","1502150","1502150_voice2","1502150_skill",},
        [2] = {2,5500002,50,"水镜","2","1|3|4",250,201,"btn_main_enter_crossboss2","1502250","1502250_voice2","1502250_skill",},
        [3] = {3,5500003,50,"周姬","3","1|2|4",350,301,"btn_main_enter_crossboss3","1502350","1502350_voice2","1502350_skill",},
        [4] = {4,5500004,50,"南华","4","1|2|3",450,401,"btn_main_enter_crossboss4","1502450","1502450_skill","1502450_skill",},
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
        assert(__key_map[k], "cannot find " .. k .. " in cross_boss_info")
        return t._raw[__key_map[k]]
    end
}

-- 
function cross_boss_info.length()
    return #cross_boss_info._data
end

-- 
function cross_boss_info.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function cross_boss_info.indexOf(index)
    if index == nil or not cross_boss_info._data[index] then
        return nil
    end

    return setmetatable({_raw = cross_boss_info._data[index]}, mt)
end

--
function cross_boss_info.get(id)
    
    return cross_boss_info.indexOf(__index_id[id])
        
end

--
function cross_boss_info.set(id, tkey, nvalue)
    local record = cross_boss_info.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function cross_boss_info.index()
    return __index_id
end

return cross_boss_info