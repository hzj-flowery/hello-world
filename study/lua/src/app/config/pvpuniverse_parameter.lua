--pvpuniverse_parameter

-- key
local __key_map = {
  id = 1,    --序号-int 
  key = 2,    --参数名称-string 
  content = 3,    --参数内容-string 

}

-- data
local pvpuniverse_parameter = {
    _data = {
        [1] = {1,"pvpuniverse_day","1|3|5",},
        [2] = {4,"pvpuniverse_preview","0|01",},
        [3] = {5,"pvpuniverse_day_interval","86400",},
        [4] = {6,"pvpuniverse_winnershow","7229",},
        [5] = {7,"pvpuniverse_time","120",},
        [6] = {8,"pvpuniverse_interval","300",},
        [7] = {9,"pvpuniverse_win","3",},
        [8] = {10,"pvpuniverse_support_low","50|150",},
        [9] = {11,"pvpuniverse_support_high","200|500",},
        [10] = {12,"pvpuniverse_combo","1,100|2,100|3,100|4,100|5,200|6,100|7,100|8,100|9,100",},
        [11] = {13,"pvpuniverse_round","1,32进24|2,24进16|3,16进8|4,8进4|5,半决赛|6,决赛",},
        [12] = {14,"pvpuniverse_chat_begins","5|00|01",},
        [13] = {15,"pvpuniverse_chat_end","7|23|59",},
        [14] = {16,"pvpuniverse_open","180",},
        [15] = {17,"pvpuniverse_remain","60",},
        [16] = {18,"pvpuniverse_rank_list","50",},
        [17] = {19,"pvpuniverse_rank","200",},
        [18] = {20,"pvpuniverse_pot_base","10000",},
        [19] = {21,"pvpuniverse_pot_increase","100",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 8,
    [11] = 9,
    [12] = 10,
    [13] = 11,
    [14] = 12,
    [15] = 13,
    [16] = 14,
    [17] = 15,
    [18] = 16,
    [19] = 17,
    [20] = 18,
    [21] = 19,
    [4] = 2,
    [5] = 3,
    [6] = 4,
    [7] = 5,
    [8] = 6,
    [9] = 7,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pvpuniverse_parameter")
        return t._raw[__key_map[k]]
    end
}

-- 
function pvpuniverse_parameter.length()
    return #pvpuniverse_parameter._data
end

-- 
function pvpuniverse_parameter.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pvpuniverse_parameter.indexOf(index)
    if index == nil or not pvpuniverse_parameter._data[index] then
        return nil
    end

    return setmetatable({_raw = pvpuniverse_parameter._data[index]}, mt)
end

--
function pvpuniverse_parameter.get(id)
    
    return pvpuniverse_parameter.indexOf(__index_id[id])
        
end

--
function pvpuniverse_parameter.set(id, tkey, nvalue)
    local record = pvpuniverse_parameter.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function pvpuniverse_parameter.index()
    return __index_id
end

return pvpuniverse_parameter