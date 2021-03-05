--boss_people_xy

-- key
local __key_map = {
  id = 1,    --id-int 
  x = 2,    --x-int 
  y = 3,    --y-int 

}

-- data
local boss_people_xy = {
    _data = {
        [1] = {1,114,-12,},
        [2] = {2,-45,-39,},
        [3] = {3,9,-100,},
        [4] = {4,12,69,},
        [5] = {5,-166,-2,},
        [6] = {6,-150,-110,},
        [7] = {7,-96,100,},
        [8] = {8,-238,65,},
        [9] = {9,-288,-44,},
        [10] = {10,-191,168,},
        [11] = {11,-351,-115,},
        [12] = {12,-478,-147,},
        [13] = {13,0,0,},
        [14] = {14,0,0,},
        [15] = {15,0,0,},
        [16] = {100,460,-32,},
        [17] = {200,-183,137,},
        [18] = {201,38,40,},
        [19] = {202,-103,-29,},
        [20] = {203,-250,-106,},
        [21] = {204,-235,20,},
        [22] = {205,-517,-57,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [100] = 16,
    [11] = 11,
    [12] = 12,
    [13] = 13,
    [14] = 14,
    [15] = 15,
    [2] = 2,
    [200] = 17,
    [201] = 18,
    [202] = 19,
    [203] = 20,
    [204] = 21,
    [205] = 22,
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
        assert(__key_map[k], "cannot find " .. k .. " in boss_people_xy")
        return t._raw[__key_map[k]]
    end
}

-- 
function boss_people_xy.length()
    return #boss_people_xy._data
end

-- 
function boss_people_xy.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function boss_people_xy.indexOf(index)
    if index == nil or not boss_people_xy._data[index] then
        return nil
    end

    return setmetatable({_raw = boss_people_xy._data[index]}, mt)
end

--
function boss_people_xy.get(id)
    
    return boss_people_xy.indexOf(__index_id[id])
        
end

--
function boss_people_xy.set(id, key, value)
    local record = boss_people_xy.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function boss_people_xy.index()
    return __index_id
end

return boss_people_xy