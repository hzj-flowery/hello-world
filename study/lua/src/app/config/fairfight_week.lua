--fairfight_week

-- key
local __key_map = {
  day = 1,    --星期-int 
  week = 2,    --周-int 
  sign = 3,    --报名-int 
  auditino = 4,    --海选-int 
  best32 = 5,    --32强-int 
  best16 = 6,    --16强-int 
  best8 = 7,    --8强-int 
  best4 = 8,    --4强-int 
  final = 9,    --决赛-int 

}

-- data
local fairfight_week = {
    _data = {
        [1] = {1,1,1,0,0,0,0,0,0,},
        [2] = {2,1,1,1,0,0,0,0,0,},
        [3] = {3,1,1,1,0,0,0,0,0,},
        [4] = {4,1,1,1,0,0,0,0,0,},
        [5] = {5,1,1,1,0,0,0,0,0,},
        [6] = {6,1,1,1,0,0,0,0,0,},
        [7] = {7,1,0,1,0,0,0,0,0,},
        [8] = {1,2,0,0,0,0,0,0,0,},
        [9] = {2,2,0,0,0,0,0,0,0,},
        [10] = {3,2,0,0,1,0,0,0,0,},
        [11] = {4,2,0,0,0,1,0,0,0,},
        [12] = {5,2,0,0,0,0,1,0,0,},
        [13] = {6,2,0,0,0,0,0,1,0,},
        [14] = {7,2,0,0,0,0,0,0,1,},
    }
}

-- index
local __index_day_week = {
    ["1_1"] = 1,
    ["1_2"] = 8,
    ["2_1"] = 2,
    ["2_2"] = 9,
    ["3_1"] = 3,
    ["3_2"] = 10,
    ["4_1"] = 4,
    ["4_2"] = 11,
    ["5_1"] = 5,
    ["5_2"] = 12,
    ["6_1"] = 6,
    ["6_2"] = 13,
    ["7_1"] = 7,
    ["7_2"] = 14,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in fairfight_week")
        return t._raw[__key_map[k]]
    end
}

-- 
function fairfight_week.length()
    return #fairfight_week._data
end

-- 
function fairfight_week.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function fairfight_week.indexOf(index)
    if index == nil or not fairfight_week._data[index] then
        return nil
    end

    return setmetatable({_raw = fairfight_week._data[index]}, mt)
end

--
function fairfight_week.get(day,week)
    
    local k = day .. '_' .. week
    return fairfight_week.indexOf(__index_day_week[k])
        
end

--
function fairfight_week.set(day,week, key, value)
    local record = fairfight_week.get(day,week)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function fairfight_week.index()
    return __index_day_week
end

return fairfight_week