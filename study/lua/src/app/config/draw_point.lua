--draw_point

-- key
local __key_map = {
  box = 1,    --宝箱-int 
  country = 2,    --阵营-int 
  hero_1 = 3,    --武将1-int 
  hero_2 = 4,    --武将2-int 
  hero_3 = 5,    --武将3-int 
  hero_4 = 6,    --武将4-int 
  hero_5 = 7,    --武将5-int 
  hero_6 = 8,    --武将6-int 
  hero_7 = 9,    --武将7-int 
  hero_8 = 10,    --武将8-int 
  hero_9 = 11,    --武将9-int 
  hero_10 = 12,    --武将10-int 

}

-- data
local draw_point = {
    _data = {
        [1] = {1,1,113,114,115,116,117,118,119,0,0,0,},
        [2] = {1,2,213,214,215,216,217,218,219,0,0,0,},
        [3] = {1,3,313,314,315,316,317,318,319,0,0,0,},
        [4] = {1,4,413,414,415,416,417,418,419,0,0,0,},
        [5] = {2,1,113,114,115,116,117,118,119,0,0,0,},
        [6] = {2,2,213,214,215,216,217,218,219,0,0,0,},
        [7] = {2,3,313,314,315,316,317,318,319,0,0,0,},
        [8] = {2,4,413,414,415,416,417,418,419,0,0,0,},
        [9] = {3,1,102,104,105,106,107,108,109,110,111,112,},
        [10] = {3,2,202,204,205,206,207,208,209,210,211,212,},
        [11] = {3,3,302,304,305,306,307,308,309,310,311,312,},
        [12] = {3,4,402,404,405,406,407,408,409,410,411,412,},
    }
}

-- index
local __index_box_country = {
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

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in draw_point")
        return t._raw[__key_map[k]]
    end
}

-- 
function draw_point.length()
    return #draw_point._data
end

-- 
function draw_point.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function draw_point.indexOf(index)
    if index == nil or not draw_point._data[index] then
        return nil
    end

    return setmetatable({_raw = draw_point._data[index]}, mt)
end

--
function draw_point.get(box,country)
    
    local k = box .. '_' .. country
    return draw_point.indexOf(__index_box_country[k])
        
end

--
function draw_point.set(box,country, key, value)
    local record = draw_point.get(box,country)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function draw_point.index()
    return __index_box_country
end

return draw_point