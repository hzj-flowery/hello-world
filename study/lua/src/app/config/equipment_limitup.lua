--equipment_limitup

-- key
local __key_map = {
  limitup_templet_id = 1,    --模板id-int 
  consume_refinestone = 2,    --精炼石每次消耗-int 
  cost_equipment = 3,    --同名装备消耗量-int 
  consume_equipment = 4,    --同名装备每次消耗-int 
  resource_name_1 = 5,    --材料1名称-string 
  resource_type_1 = 6,    --消耗资源类型1-int 
  resource_id_1 = 7,    --消耗资源id1-int 
  resource_size_1 = 8,    --消耗资源数量1-int 
  resource_consume_1 = 9,    --材料1每次消耗-int 
  resource_name_2 = 10,    --材料2名称-string 
  resource_type_2 = 11,    --消耗资源类型2-int 
  resource_id_2 = 12,    --消耗资源id2-int 
  resource_size_2 = 13,    --消耗资源数量2-int 
  resource_consume_2 = 14,    --材料2每次消耗-int 

}

-- data
local equipment_limitup = {
    _data = {
        [1] = {1,5,2,1,"春秋",6,92,12,1,"战国",6,93,12,1,},
        [2] = {2,5,1,1,"礼记",6,555,12,1,"周易",6,556,12,1,},
    }
}

-- index
local __index_limitup_templet_id = {
    [1] = 1,
    [2] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in equipment_limitup")
        return t._raw[__key_map[k]]
    end
}

-- 
function equipment_limitup.length()
    return #equipment_limitup._data
end

-- 
function equipment_limitup.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function equipment_limitup.indexOf(index)
    if index == nil or not equipment_limitup._data[index] then
        return nil
    end

    return setmetatable({_raw = equipment_limitup._data[index]}, mt)
end

--
function equipment_limitup.get(limitup_templet_id)
    
    return equipment_limitup.indexOf(__index_limitup_templet_id[limitup_templet_id])
        
end

--
function equipment_limitup.set(limitup_templet_id, key, value)
    local record = equipment_limitup.get(limitup_templet_id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function equipment_limitup.index()
    return __index_limitup_templet_id
end

return equipment_limitup