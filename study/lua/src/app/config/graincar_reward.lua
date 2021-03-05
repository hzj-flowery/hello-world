--graincar_reward

-- key
local __key_map = {
  id = 1,    --id-int 
  graincar_color = 2,    --粮车品质-int 
  graincar_stamina_min = 3,    --粮车耐久度max-int 
  graincar_stamina_max = 4,    --粮车耐久度min-int 
  reward_type1 = 5,    --奖励类型1-int 
  reward_value1 = 6,    --奖励类型值1-int 
  reward_size1 = 7,    --奖励数量1-int 
  reward_type2 = 8,    --奖励类型2-int 
  reward_value2 = 9,    --奖励类型值2-int 
  reward_size2 = 10,    --奖励数量2-int 

}

-- data
local graincar_reward = {
    _data = {
        [1] = {1,1,1200,1200,6,175,1,0,0,0,},
        [2] = {2,1,900,1199,6,175,1,0,0,0,},
        [3] = {3,1,600,899,6,175,1,0,0,0,},
        [4] = {4,1,300,599,6,175,1,0,0,0,},
        [5] = {5,1,0,299,6,175,0,0,0,0,},
        [6] = {6,2,1500,1500,6,175,1,0,0,0,},
        [7] = {7,2,1125,1499,6,175,1,0,0,0,},
        [8] = {8,2,750,1124,6,175,1,0,0,0,},
        [9] = {9,2,375,749,6,175,1,0,0,0,},
        [10] = {10,2,0,374,6,175,0,0,0,0,},
        [11] = {11,3,1800,1800,6,175,1,0,0,0,},
        [12] = {12,3,1350,1799,6,175,1,0,0,0,},
        [13] = {13,3,900,1349,6,175,1,0,0,0,},
        [14] = {14,3,450,899,6,175,1,0,0,0,},
        [15] = {15,3,0,449,6,175,0,0,0,0,},
        [16] = {16,4,2100,2100,6,175,1,0,0,0,},
        [17] = {17,4,1575,2099,6,175,1,0,0,0,},
        [18] = {18,4,1050,1574,6,175,1,0,0,0,},
        [19] = {19,4,525,1049,6,175,1,0,0,0,},
        [20] = {20,4,0,524,6,175,0,0,0,0,},
        [21] = {21,5,2400,2400,6,175,1,0,0,0,},
        [22] = {22,5,1800,2399,6,175,1,0,0,0,},
        [23] = {23,5,1200,1799,6,175,1,0,0,0,},
        [24] = {24,5,600,1199,6,175,1,0,0,0,},
        [25] = {25,5,0,599,6,175,0,0,0,0,},
        [26] = {26,1,1200,1200,6,175,1,0,0,0,},
        [27] = {27,1,900,1199,6,175,1,0,0,0,},
        [28] = {28,1,600,899,6,175,1,0,0,0,},
        [29] = {29,1,300,599,6,175,1,0,0,0,},
        [30] = {30,1,0,299,6,175,0,0,0,0,},
        [31] = {31,2,1500,1500,6,175,1,0,0,0,},
        [32] = {32,2,1125,1499,6,175,1,0,0,0,},
        [33] = {33,2,750,1124,6,175,1,0,0,0,},
        [34] = {34,2,375,749,6,175,1,0,0,0,},
        [35] = {35,2,0,374,6,175,0,0,0,0,},
        [36] = {36,3,1800,1800,6,175,1,0,0,0,},
        [37] = {37,3,1350,1799,6,175,1,0,0,0,},
        [38] = {38,3,900,1349,6,175,1,0,0,0,},
        [39] = {39,3,450,899,6,175,1,0,0,0,},
        [40] = {40,3,0,449,6,175,0,0,0,0,},
        [41] = {41,4,2100,2100,6,175,1,0,0,0,},
        [42] = {42,4,1575,2099,6,175,1,0,0,0,},
        [43] = {43,4,1050,1574,6,175,1,0,0,0,},
        [44] = {44,4,525,1049,6,175,1,0,0,0,},
        [45] = {45,4,0,524,6,175,0,0,0,0,},
        [46] = {46,5,2400,2400,6,175,1,0,0,0,},
        [47] = {47,5,1800,2399,6,175,1,0,0,0,},
        [48] = {48,5,1200,1799,6,175,1,0,0,0,},
        [49] = {49,5,600,1199,6,175,1,0,0,0,},
        [50] = {50,5,0,599,6,175,0,0,0,0,},
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
    [50] = 50,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in graincar_reward")
        return t._raw[__key_map[k]]
    end
}

-- 
function graincar_reward.length()
    return #graincar_reward._data
end

-- 
function graincar_reward.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function graincar_reward.indexOf(index)
    if index == nil or not graincar_reward._data[index] then
        return nil
    end

    return setmetatable({_raw = graincar_reward._data[index]}, mt)
end

--
function graincar_reward.get(id)
    
    return graincar_reward.indexOf(__index_id[id])
        
end

--
function graincar_reward.set(id, key, value)
    local record = graincar_reward.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function graincar_reward.index()
    return __index_id
end

return graincar_reward