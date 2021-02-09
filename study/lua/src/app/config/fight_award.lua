--fight_award

-- key
local __key_map = {
  id = 1,    --id-int 
  star = 2,    --最低星级-int 
  star_max = 3,    --最高星级-int 
  type = 4,    --奖励type-int 
  value = 5,    --奖励value-int 
  size = 6,    --奖励size-int 

}

-- data
local fight_award = {
    _data = {
        [1] = {1,1,3,5,29,480,},
        [2] = {2,4,6,5,29,560,},
        [3] = {3,7,9,5,29,640,},
        [4] = {4,10,12,5,29,720,},
        [5] = {5,13,15,5,29,800,},
        [6] = {6,16,20,5,29,880,},
        [7] = {7,21,25,5,29,960,},
        [8] = {8,26,30,5,29,1040,},
        [9] = {9,31,35,5,29,1120,},
        [10] = {10,36,40,5,29,1200,},
        [11] = {11,41,45,5,29,1280,},
        [12] = {12,46,50,5,29,1360,},
        [13] = {13,51,55,5,29,1440,},
        [14] = {14,56,60,5,29,1520,},
        [15] = {15,61,65,5,29,1600,},
        [16] = {16,66,70,5,29,1680,},
        [17] = {17,71,75,5,29,1760,},
        [18] = {18,76,80,5,29,1840,},
        [19] = {19,81,85,5,29,1920,},
        [20] = {20,86,90,5,29,2000,},
        [21] = {21,91,95,5,29,2080,},
        [22] = {22,96,100,5,29,2160,},
        [23] = {23,101,105,5,29,2240,},
        [24] = {24,106,110,5,29,2320,},
        [25] = {25,111,115,5,29,2400,},
        [26] = {26,116,120,5,29,2480,},
        [27] = {27,121,125,5,29,2560,},
        [28] = {28,126,130,5,29,2640,},
        [29] = {29,131,135,5,29,2720,},
        [30] = {30,136,140,5,29,2800,},
        [31] = {31,141,145,5,29,2880,},
        [32] = {32,146,150,5,29,2960,},
        [33] = {33,151,155,5,29,3040,},
        [34] = {34,156,160,5,29,3120,},
        [35] = {35,161,99999,5,29,3200,},
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
        assert(__key_map[k], "cannot find " .. k .. " in fight_award")
        return t._raw[__key_map[k]]
    end
}

-- 
function fight_award.length()
    return #fight_award._data
end

-- 
function fight_award.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function fight_award.indexOf(index)
    if index == nil or not fight_award._data[index] then
        return nil
    end

    return setmetatable({_raw = fight_award._data[index]}, mt)
end

--
function fight_award.get(id)
    
    return fight_award.indexOf(__index_id[id])
        
end

--
function fight_award.set(id, key, value)
    local record = fight_award.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function fight_award.index()
    return __index_id
end

return fight_award