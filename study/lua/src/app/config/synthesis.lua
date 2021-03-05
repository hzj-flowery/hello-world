--synthesis

-- key
local __key_map = {
  id = 1,    --编号-int 
  type = 2,    --合成类型-int 
  des = 3,    --合成类型文本-string 
  level = 4,    --开启等级-int 
  condition_type = 5,    --条件类型-int 
  condition_value = 6,    --条件值-int 
  syn_type = 7,    --合成物品类型-int 
  syn_value = 8,    --合成物品-int 
  syn_size = 9,    --合成物品数量-int 
  cost_type = 10,    --合成消耗类型-int 
  cost_value = 11,    --合成消耗货币-int 
  cost_size = 12,    --合成消耗数量-int 
  material_type_1 = 13,    --合成材料类型1-int 
  material_value_1 = 14,    --合成材料1-int 
  material_size_1 = 15,    --合成材料数量1-int 
  material_type_2 = 16,    --合成材料类型2-int 
  material_value_2 = 17,    --合成材料2-int 
  material_size_2 = 18,    --合成材料数量2-int 
  material_type_3 = 19,    --合成材料类型3-int 
  material_value_3 = 20,    --合成材料3-int 
  material_size_3 = 21,    --合成材料数量3-int 
  material_type_4 = 22,    --合成材料类型4-int 
  material_value_4 = 23,    --合成材料4-int 
  material_size_4 = 24,    --合成材料数量4-int 
  material_type_5 = 25,    --合成材料类型5-int 
  material_value_5 = 26,    --合成材料5-int 
  material_size_5 = 27,    --合成材料数量5-int 
  material_type_6 = 28,    --合成材料类型6-int 
  material_value_6 = 29,    --合成材料6-int 
  material_size_6 = 30,    --合成材料数量6-int 
  material_type_7 = 31,    --合成材料类型7-int 
  material_value_7 = 32,    --合成材料7-int 
  material_size_7 = 33,    --合成材料数量7-int 
  material_type_8 = 34,    --合成材料类型8-int 
  material_value_8 = 35,    --合成材料8-int 
  material_size_8 = 36,    --合成材料数量8-int 

}

-- data
local synthesis = {
    _data = {
        [1] = {1,1,0,120,0,0,6,723,1,5,2,5000000,6,23,4,6,24,4,6,25,4,6,26,4,6,27,4,0,0,0,0,0,0,0,0,0,},
        [2] = {2,1,0,120,0,0,6,724,1,5,2,8000000,6,23,2,6,24,2,6,25,2,6,26,2,6,27,2,6,723,1,0,0,0,0,0,0,},
        [3] = {3,2,0,100,0,0,6,45,1,5,2,1800000,6,41,3,6,44,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [4] = {4,2,0,100,0,0,6,46,1,5,2,2400000,6,42,1,6,43,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [5] = {5,3,0,120,3,11,6,505,1,5,2,1800000,6,501,2,6,502,1,6,503,1,6,504,1,0,0,0,0,0,0,0,0,0,0,0,0,},
        [6] = {6,3,0,120,3,11,6,515,1,5,2,1800000,6,511,2,6,512,1,6,513,1,6,514,1,0,0,0,0,0,0,0,0,0,0,0,0,},
        [7] = {7,3,0,120,3,11,6,535,1,5,2,1800000,6,531,2,6,532,1,6,533,1,6,534,1,0,0,0,0,0,0,0,0,0,0,0,0,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in synthesis")
        return t._raw[__key_map[k]]
    end
}

-- 
function synthesis.length()
    return #synthesis._data
end

-- 
function synthesis.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function synthesis.indexOf(index)
    if index == nil or not synthesis._data[index] then
        return nil
    end

    return setmetatable({_raw = synthesis._data[index]}, mt)
end

--
function synthesis.get(id)
    
    return synthesis.indexOf(__index_id[id])
        
end

--
function synthesis.set(id, tkey, nvalue)
    local record = synthesis.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function synthesis.index()
    return __index_id
end

return synthesis