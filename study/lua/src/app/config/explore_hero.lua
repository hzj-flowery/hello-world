--explore_hero

-- key
local __key_map = {
  id = 1,    --id-int 
  level_min = 2,    --等级下区间-int 
  level_max = 3,    --等级上区间-int 
  hero1_color = 4,    --武将1品质-int 
  hero1_chance = 5,    --武将1品质权重-int 
  hero1_type = 6,    --招募1货币类型-int 
  hero1_resource = 7,    --招募1货币资源-int 
  hero1_size = 8,    --招募1货币数量-int 
  hero2_color = 9,    --武将2品质-int 
  hero2_chance = 10,    --武将2品质权重-int 
  hero2_type = 11,    --招募2货币类型-int 
  hero2_resource = 12,    --招募2货币资源-int 
  hero2_size = 13,    --招募2货币数量-int 

}

-- data
local explore_hero = {
    _data = {
        [1] = {1,1,43,4,1000,5,1,800,5,200,5,1,4000,},
        [2] = {2,44,120,4,1000,5,1,800,5,200,5,1,4000,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in explore_hero")
        return t._raw[__key_map[k]]
    end
}

-- 
function explore_hero.length()
    return #explore_hero._data
end

-- 
function explore_hero.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function explore_hero.indexOf(index)
    if index == nil or not explore_hero._data[index] then
        return nil
    end

    return setmetatable({_raw = explore_hero._data[index]}, mt)
end

--
function explore_hero.get(id)
    
    return explore_hero.indexOf(__index_id[id])
        
end

--
function explore_hero.set(id, key, value)
    local record = explore_hero.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function explore_hero.index()
    return __index_id
end

return explore_hero