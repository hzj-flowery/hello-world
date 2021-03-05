--equipment_suit

-- key
local __key_map = {
  id = 1,    --套装id-int 
  name = 2,    --套装名称-string 
  quantity_1 = 3,    --部件1数量-int 
  suit_1_type_1 = 4,    --部件1激活属性类型1-int 
  suit_1_value_1 = 5,    --部件1激活属性数值1-int 
  suit_1_type_2 = 6,    --部件1激活属性类型2-int 
  suit_1_value_2 = 7,    --部件1激活属性数值2-int 
  quantity_2 = 8,    --部件2数量-int 
  suit_2_type_1 = 9,    --部件2激活属性类型1-int 
  suit_2_value_1 = 10,    --部件2激活属性数值1-int 
  suit_2_type_2 = 11,    --部件2激活属性类型2-int 
  suit_2_value_2 = 12,    --部件2激活属性数值2-int 
  quantity_3 = 13,    --部件3数量-int 
  suit_3_type_1 = 14,    --部件3激活属性类型1-int 
  suit_3_value_1 = 15,    --部件3激活属性数值1-int 
  suit_3_type_2 = 16,    --部件3激活属性类型2-int 
  suit_3_value_2 = 17,    --部件3激活属性数值2-int 
  suit_3_type_3 = 18,    --部件3激活属性类型3-int 
  suit_3_value_3 = 19,    --部件3激活属性数值3-int 
  suit_3_type_4 = 20,    --部件3激活属性类型4-int 
  suit_3_value_4 = 21,    --部件3激活属性数值4-int 

}

-- data
local equipment_suit = {
    _data = {
        [1] = {1001,"破军套装",2,1,2400,0,0,3,7,18000,0,0,4,19,50,20,50,0,0,0,0,},
        [2] = {2001,"四神套装",2,1,3200,0,0,3,7,24000,0,0,4,19,100,20,100,0,0,0,0,},
        [3] = {3001,"八荒套装",2,1,4800,0,0,3,7,36000,0,0,4,19,150,20,150,0,0,0,0,},
    }
}

-- index
local __index_id = {
    [1001] = 1,
    [2001] = 2,
    [3001] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in equipment_suit")
        return t._raw[__key_map[k]]
    end
}

-- 
function equipment_suit.length()
    return #equipment_suit._data
end

-- 
function equipment_suit.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function equipment_suit.indexOf(index)
    if index == nil or not equipment_suit._data[index] then
        return nil
    end

    return setmetatable({_raw = equipment_suit._data[index]}, mt)
end

--
function equipment_suit.get(id)
    
    return equipment_suit.indexOf(__index_id[id])
        
end

--
function equipment_suit.set(id, key, value)
    local record = equipment_suit.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function equipment_suit.index()
    return __index_id
end

return equipment_suit