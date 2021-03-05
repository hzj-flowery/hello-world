--historical_hero_map

-- key
local __key_map = {
  id = 1,    --id-int 
  name = 2,    --图鉴名称-string 
  hero_1 = 3,    --名将1-int 
  hero_2 = 4,    --名将2-int 
  attr_type_1 = 5,    --属性类型1-int 
  attr_value_1 = 6,    --属性值1-int 
  attr_type_2 = 7,    --属性类型2-int 
  attr_value_2 = 8,    --属性值2-int 
  attr_type_3 = 9,    --属性类型3-int 
  attr_value_3 = 10,    --属性值3-int 
  attr_type_4 = 11,    --属性类型4-int 
  attr_value_4 = 12,    --属性值4-int 
  power = 13,    --假战力-int 
  show = 14,    --是否显示-int 
  show_day = 15,    --达到开服天数显示-int 

}

-- data
local historical_hero_map = {
    _data = {
        [1] = {1001,"剑胆琴心",101,102,1,1000,7,100000,0,0,0,0,1000000,1,1,},
        [2] = {1002,"文韬武略",103,104,1,1000,7,100000,0,0,0,0,1000000,1,1,},
        [3] = {2001,"秦皇汉武",201,202,1,1000,7,100000,0,0,0,0,2000000,1,50,},
    }
}

-- index
local __index_id = {
    [1001] = 1,
    [1002] = 2,
    [2001] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in historical_hero_map")
        return t._raw[__key_map[k]]
    end
}

-- 
function historical_hero_map.length()
    return #historical_hero_map._data
end

-- 
function historical_hero_map.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function historical_hero_map.indexOf(index)
    if index == nil or not historical_hero_map._data[index] then
        return nil
    end

    return setmetatable({_raw = historical_hero_map._data[index]}, mt)
end

--
function historical_hero_map.get(id)
    
    return historical_hero_map.indexOf(__index_id[id])
        
end

--
function historical_hero_map.set(id, key, value)
    local record = historical_hero_map.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function historical_hero_map.index()
    return __index_id
end

return historical_hero_map