--treasure_limit_cost

-- key
local __key_map = {
  limit_level = 1,    --界限等级-int 
  refine = 2,    --精炼等级限制-int 
  function_id = 3,    --function表的ID-int 
  name_1 = 4,    --材料1名称-string 
  exp = 5,    --需要经验-int 
  consume_1 = 6,    --材料1每次消耗-int 
  name_2 = 7,    --材料2名称-string 
  type_2 = 8,    --材料2type-int 
  value_2 = 9,    --材料2value-int 
  size_2 = 10,    --材料2size-int 
  consume_2 = 11,    --材料2每次消耗-int 
  name_3 = 12,    --材料3名称-string 
  type_3 = 13,    --材料3type-int 
  value_3 = 14,    --材料3value-int 
  size_3 = 15,    --材料3size-int 
  consume_3 = 16,    --材料3每次消耗-int 
  name_4 = 17,    --材料4名称-string 
  type_4 = 18,    --材料4type-int 
  value_4 = 19,    --材料4value-int 
  size_4 = 20,    --材料4size-int 
  consume_4 = 21,    --材料4每次消耗-int 
  break_name = 22,    --突破消耗名称-string 
  break_type = 23,    --突破消耗类型-int 
  break_value = 24,    --突破消耗子银两-int 
  break_size = 25,    --突破消耗数量-int 

}

-- data
local treasure_limit_cost = {
    _data = {
        [1] = {0,0,124,"天工",2000000,5,"开物",6,10,2000,50,"春秋",6,92,18,1,"战国",6,93,18,1,"银两",5,2,12000000,},
        [2] = {1,0,125,"天工",3000000,5,"开物",6,10,3000,50,"礼记",6,555,9,1,"周易",6,556,9,1,"银两",5,2,18000000,},
        [3] = {2,0,0,"天工",0,0,"开物",0,0,0,0,"春秋",0,0,0,0,"战国",0,0,0,0,"银两",0,0,0,},
    }
}

-- index
local __index_limit_level = {
    [0] = 1,
    [1] = 2,
    [2] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in treasure_limit_cost")
        return t._raw[__key_map[k]]
    end
}

-- 
function treasure_limit_cost.length()
    return #treasure_limit_cost._data
end

-- 
function treasure_limit_cost.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function treasure_limit_cost.indexOf(index)
    if index == nil or not treasure_limit_cost._data[index] then
        return nil
    end

    return setmetatable({_raw = treasure_limit_cost._data[index]}, mt)
end

--
function treasure_limit_cost.get(limit_level)
    
    return treasure_limit_cost.indexOf(__index_limit_level[limit_level])
        
end

--
function treasure_limit_cost.set(limit_level, tkey, nvalue)
    local record = treasure_limit_cost.get(limit_level)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function treasure_limit_cost.index()
    return __index_limit_level
end

return treasure_limit_cost