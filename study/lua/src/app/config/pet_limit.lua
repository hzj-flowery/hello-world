--pet_limit

-- key
local __key_map = {
  limit_id = 1,    --界限ID-int 
  name_1 = 2,    --材料1名称-string 
  type_1 = 3,    --材料1type-int 
  value_1 = 4,    --材料1value-int 
  size_1 = 5,    --材料1size-int 
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
local pet_limit = {
    _data = {
        [1] = {1,"治国",0,0,10631200,50,"修身",6,32,18000,1000,"齐家",6,559,1,1,"齐家",6,559,1,1,"银两",5,2,6000000,},
    }
}

-- index
local __index_limit_id = {
    [1] = 1,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pet_limit")
        return t._raw[__key_map[k]]
    end
}

-- 
function pet_limit.length()
    return #pet_limit._data
end

-- 
function pet_limit.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pet_limit.indexOf(index)
    if index == nil or not pet_limit._data[index] then
        return nil
    end

    return setmetatable({_raw = pet_limit._data[index]}, mt)
end

--
function pet_limit.get(limit_id)
    
    return pet_limit.indexOf(__index_limit_id[limit_id])
        
end

--
function pet_limit.set(limit_id, key, value)
    local record = pet_limit.get(limit_id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function pet_limit.index()
    return __index_limit_id
end

return pet_limit