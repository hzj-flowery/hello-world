--pvppro_parameter

-- key
local __key_map = {
  id = 1,    --序号-int 
  key = 2,    --参数名称-string 
  content = 3,    --参数内容-string 

}

-- data
local pvppro_parameter = {
    _data = {
        [1] = {1,"pvppro_sign_day","1|4",},
        [2] = {2,"pvppro_sign_time","04|00",},
        [3] = {3,"pvppro_day_limit","7",},
        [4] = {4,"pvppro_week_limit","1|4",},
        [5] = {5,"pvppro_open_time","21|00",},
        [6] = {6,"pvppro_pre_round","20",},
        [7] = {7,"pvppro_pre_initial","100",},
        [8] = {8,"pvppro_pre_point","10|10",},
        [9] = {9,"pvppro_pre_time","20",},
        [10] = {10,"pvppro_final_time","60",},
        [11] = {11,"pvppro_bid_cost","0",},
        [12] = {12,"pvppro_bid_reward","200",},
        [13] = {13,"pvppro_number","20",},
        [14] = {14,"pvpsingle_schedule","1|21|30",},
        [15] = {15,"pvpsingle_time","90",},
        [16] = {16,"pvpsingle_win","3",},
        [17] = {17,"pvpsingle_bid_cost","0",},
        [18] = {18,"pvpsingle_bid_reward","400",},
        [19] = {19,"pvpsingle_support_low","10|30",},
        [20] = {20,"pvpsingle_support_high","40|60",},
        [21] = {21,"pvpsingle_winnershow","7|23|59",},
        [22] = {22,"pvpsingle_sign_day","4|21|00",},
        [23] = {23,"pvpsingle_jade","701|702|703|704",},
        [24] = {24,"pvpsingle_coefficient_1","1500",},
        [25] = {25,"pvpsingle_coefficient_2","1400",},
        [26] = {26,"pvpsingle_coefficient_3","1350",},
        [27] = {27,"pvpsingle_coefficient_4","1300",},
        [28] = {28,"pvpsingle_coefficient_5","1250",},
        [29] = {29,"pvpsingle_coefficient_6","1200",},
        [30] = {30,"pvpsingle_coefficient_7","1000",},
        [31] = {31,"pvpsingle_coefficient_8","1000",},
        [32] = {32,"pvpsingle_round","16强赛|8强赛|4强赛|半决赛",},
        [33] = {33,"pvpsingle_combo","1,200|2,200|3,200|4,200|5,200",},
        [34] = {34,"pvpsingle_winner","5|1|300,6|85|5,6|95|5",},
        [35] = {35,"pvpsingle_server1","5|1|300,6|85|5,6|94|5",},
        [36] = {36,"pvpsingle_server8","5|1|300,6|85|5,6|159|5",},
        [37] = {37,"pvpsingle_winner_fale","6|85|2,6|95|2",},
        [38] = {38,"pvpsingle_server1_fale","6|85|2,6|94|2",},
        [39] = {39,"pvpsingle_server8_fale","6|85|2,6|159|2",},
        [40] = {40,"pvpsingle_guess_start","4|04|01",},
        [41] = {41,"pvpsingle_guess_finish","4|21|00",},
        [42] = {42,"pvpsingle_reward","11|1401,11|1402,11|1403,6|43,6|556,6|555,7|130001,6|701,6|702,6|703,6|704,13|101,13|102,13|103,13|104",},
        [43] = {43,"pvpsingle_refresh_week","2|3|4",},
        [44] = {44,"pvpsingle_refresh_time","4|10",},
        [45] = {45,"pvpsingle_his_hero_arm_p","101|102|103|104",},
        [46] = {46,"pvpsingle_chat_begins","4|04|01",},
        [47] = {47,"pvpsingle_chat_end","4|23|59",},
        [48] = {48,"pvpsingle_his_hero_p","101|102|103|104",},
        [49] = {49,"pvpsingle_yubi_bonus","20",},
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
    [27] = 27,
    [28] = 28,
    [29] = 29,
    [3] = 3,
    [30] = 30,
    [31] = 31,
    [32] = 32,
    [33] = 33,
    [34] = 34,
    [35] = 35,
    [36] = 36,
    [37] = 37,
    [38] = 38,
    [39] = 39,
    [4] = 4,
    [40] = 40,
    [41] = 41,
    [42] = 42,
    [43] = 43,
    [44] = 44,
    [45] = 45,
    [46] = 46,
    [47] = 47,
    [48] = 48,
    [49] = 49,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pvppro_parameter")
        return t._raw[__key_map[k]]
    end
}

-- 
function pvppro_parameter.length()
    return #pvppro_parameter._data
end

-- 
function pvppro_parameter.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pvppro_parameter.indexOf(index)
    if index == nil or not pvppro_parameter._data[index] then
        return nil
    end

    return setmetatable({_raw = pvppro_parameter._data[index]}, mt)
end

--
function pvppro_parameter.get(id)
    
    return pvppro_parameter.indexOf(__index_id[id])
        
end

--
function pvppro_parameter.set(id, key, value)
    local record = pvppro_parameter.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function pvppro_parameter.index()
    return __index_id
end

return pvppro_parameter