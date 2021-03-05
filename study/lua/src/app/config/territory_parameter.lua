--territory_parameter

-- key
local __key_map = {
  id = 1,    --序号-int 
  key = 2,    --参数名称-string 
  content = 3,    --参数内容-string 

}

-- data
local territory_parameter = {
    _data = {
        [1] = {1,"riot_time_slot","710|1070",},
        [2] = {2,"riot_continue_time","7200",},
        [3] = {3,"patrol_profit_time","1800",},
        [4] = {4,"patrol_choice_time1","14400|5:3:5",},
        [5] = {5,"patrol_choice_time2","28800|5:3:10",},
        [6] = {6,"patrol_choice_time3","43200|5:3:15",},
        [7] = {16,"hero_drop_probability1","1000|0|0|0|0",},
        [8] = {17,"hero_drop_probability2","500|500|0|0|0",},
        [9] = {18,"hero_drop_probability3","400|600|0|0|0",},
        [10] = {19,"hero_drop_probability4","0|1000|0|0|0",},
        [11] = {20,"hero_drop_probability5","0|1000|0|0|0",},
        [12] = {21,"hero_drop_probability6","0|1000|0|0|0",},
        [13] = {22,"hero_drop_probability7","0|970|30|0|0",},
        [14] = {23,"hero_drop_probability8","0|961|39|0|0",},
        [15] = {24,"hero_drop_probability9","0|961|39|0|0",},
        [16] = {25,"hero_drop_probability10","0|961|39|0|0",},
        [17] = {26,"hero_drop_probability11","0|300|685|15|0",},
        [18] = {27,"hero_drop_probability12","0|0|985|14|1",},
        [19] = {31,"help_number","10",},
        [20] = {32,"time_display","每天11：50、17：50发生暴动！",},
        [21] = {33,"help_bubble","1301|1302|1303|1304|1305",},
        [22] = {34,"territory_hero","4|5|6",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [16] = 7,
    [17] = 8,
    [18] = 9,
    [19] = 10,
    [2] = 2,
    [20] = 11,
    [21] = 12,
    [22] = 13,
    [23] = 14,
    [24] = 15,
    [25] = 16,
    [26] = 17,
    [27] = 18,
    [3] = 3,
    [31] = 19,
    [32] = 20,
    [33] = 21,
    [34] = 22,
    [4] = 4,
    [5] = 5,
    [6] = 6,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in territory_parameter")
        return t._raw[__key_map[k]]
    end
}

-- 
function territory_parameter.length()
    return #territory_parameter._data
end

-- 
function territory_parameter.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function territory_parameter.indexOf(index)
    if index == nil or not territory_parameter._data[index] then
        return nil
    end

    return setmetatable({_raw = territory_parameter._data[index]}, mt)
end

--
function territory_parameter.get(id)
    
    return territory_parameter.indexOf(__index_id[id])
        
end

--
function territory_parameter.set(id, key, value)
    local record = territory_parameter.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function territory_parameter.index()
    return __index_id
end

return territory_parameter