--cross_minecraft_parameter

-- key
local __key_map = {
  id = 1,    --序号-int 
  key = 2,    --参数名称-string 
  content = 3,    --参数内容-string 

}

-- data
local cross_minecraft_parameter = {
    _data = {
        [1] = {1,"server_num","4",},
        [2] = {2,"server_match_day","4",},
        [3] = {3,"server_match_time","14400",},
        [4] = {4,"preparation_duration","24",},
        [5] = {5,"season_start_day","5",},
        [6] = {6,"season_start_time","14400",},
        [7] = {7,"season_duration","504",},
        [8] = {8,"move_max","14",},
        [9] = {9,"move_time_cost","10",},
        [10] = {10,"move_resource_cost","1",},
        [11] = {11,"protect_time","600",},
        [12] = {12,"produce_speed","100",},
        [13] = {13,"abandon_num","10",},
        [14] = {14,"station_num","0",},
        [15] = {15,"attack_num","0",},
        [16] = {16,"","",},
        [17] = {17,"","",},
        [18] = {18,"","",},
        [19] = {19,"","",},
        [20] = {20,"","",},
        [21] = {21,"","",},
        [22] = {22,"","",},
        [23] = {23,"","",},
        [24] = {24,"","",},
        [25] = {25,"","",},
        [26] = {26,"","",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
    [13] = 13,
    [14] = 14,
    [15] = 15,
    [16] = 16,
    [17] = 17,
    [18] = 18,
    [19] = 19,
    [2] = 2,
    [20] = 20,
    [21] = 21,
    [22] = 22,
    [23] = 23,
    [24] = 24,
    [25] = 25,
    [26] = 26,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in cross_minecraft_parameter")
        return t._raw[__key_map[k]]
    end
}

-- 
function cross_minecraft_parameter.length()
    return #cross_minecraft_parameter._data
end

-- 
function cross_minecraft_parameter.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function cross_minecraft_parameter.indexOf(index)
    if index == nil or not cross_minecraft_parameter._data[index] then
        return nil
    end

    return setmetatable({_raw = cross_minecraft_parameter._data[index]}, mt)
end

--
function cross_minecraft_parameter.get(id)
    
    return cross_minecraft_parameter.indexOf(__index_id[id])
        
end

--
function cross_minecraft_parameter.set(id, tkey, nvalue)
    local record = cross_minecraft_parameter.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function cross_minecraft_parameter.index()
    return __index_id
end

return cross_minecraft_parameter