--seven_days_admin

-- key
local __key_map = {
  day = 1,    --天数-int 
  sheet = 2,    --页签编号-int 
  name = 3,    --页签名称-string 
  type = 4,    --页签形式-int 

}

-- data
local seven_days_admin = {
    _data = {
        [1] = {1,1,"每日福利",1,},
        [2] = {1,2,"主线副本",1,},
        [3] = {1,3,"装备强化",1,},
        [4] = {1,4,"半价抢购",2,},
        [5] = {2,1,"每日福利",1,},
        [6] = {2,2,"游历和竞技",1,},
        [7] = {2,3,"宝物升级",1,},
        [8] = {2,4,"半价抢购",2,},
        [9] = {3,1,"每日福利",1,},
        [10] = {3,2,"过关斩将",1,},
        [11] = {3,3,"装备精炼",1,},
        [12] = {3,4,"半价抢购",2,},
        [13] = {4,1,"每日福利",1,},
        [14] = {4,2,"南蛮入侵",1,},
        [15] = {4,3,"神兵进阶",1,},
        [16] = {4,4,"半价抢购",2,},
        [17] = {5,1,"每日福利",1,},
        [18] = {5,2,"武将商店",1,},
        [19] = {5,3,"升级和突破",1,},
        [20] = {5,4,"半价抢购",2,},
        [21] = {6,1,"每日福利",1,},
        [22] = {6,2,"军团BOSS",1,},
        [23] = {6,3,"宝物精炼",1,},
        [24] = {6,4,"半价抢购",2,},
        [25] = {7,1,"每日福利",1,},
        [26] = {7,2,"总战力",1,},
        [27] = {7,3,"名将册",1,},
        [28] = {7,4,"半价抢购",2,},
    }
}

-- index
local __index_day_sheet = {
    ["1_1"] = 1,
    ["1_2"] = 2,
    ["1_3"] = 3,
    ["1_4"] = 4,
    ["2_1"] = 5,
    ["2_2"] = 6,
    ["2_3"] = 7,
    ["2_4"] = 8,
    ["3_1"] = 9,
    ["3_2"] = 10,
    ["3_3"] = 11,
    ["3_4"] = 12,
    ["4_1"] = 13,
    ["4_2"] = 14,
    ["4_3"] = 15,
    ["4_4"] = 16,
    ["5_1"] = 17,
    ["5_2"] = 18,
    ["5_3"] = 19,
    ["5_4"] = 20,
    ["6_1"] = 21,
    ["6_2"] = 22,
    ["6_3"] = 23,
    ["6_4"] = 24,
    ["7_1"] = 25,
    ["7_2"] = 26,
    ["7_3"] = 27,
    ["7_4"] = 28,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in seven_days_admin")
        return t._raw[__key_map[k]]
    end
}

-- 
function seven_days_admin.length()
    return #seven_days_admin._data
end

-- 
function seven_days_admin.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function seven_days_admin.indexOf(index)
    if index == nil or not seven_days_admin._data[index] then
        return nil
    end

    return setmetatable({_raw = seven_days_admin._data[index]}, mt)
end

--
function seven_days_admin.get(day,sheet)
    
    local k = day .. '_' .. sheet
    return seven_days_admin.indexOf(__index_day_sheet[k])
        
end

--
function seven_days_admin.set(day,sheet, key, value)
    local record = seven_days_admin.get(day,sheet)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function seven_days_admin.index()
    return __index_day_sheet
end

return seven_days_admin