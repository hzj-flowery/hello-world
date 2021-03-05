--graincar_route

-- key
local __key_map = {
  id = 1,    --路线id-int 
  start = 2,    --出发点-int 
  point_1 = 3,    --途经点1-int 
  point_2 = 4,    --途经点2-int 
  point_3 = 5,    --途经点3-int 
  point_4 = 6,    --途经点4-int 
  point_5 = 7,    --途经点5-int 
  point_6 = 8,    --途经点6-int 
  point_7 = 9,    --途经点7-int 
  point_8 = 10,    --途经点8-int 
  point_9 = 11,    --途经点9-int 
  point_10 = 12,    --途经点10-int 
  point_11 = 13,    --途经点11-int 
  point_12 = 14,    --途经点12-int 

}

-- data
local graincar_route = {
    _data = {
        [1] = {1,110,106,105,102,204,201,100,301,302,303,307,306,310,},
        [2] = {2,110,106,107,103,102,101,100,301,304,309,308,310,0,},
        [3] = {3,110,108,109,104,101,100,301,302,305,306,310,0,0,},
        [4] = {4,110,106,107,103,102,101,100,201,202,203,207,208,210,},
        [5] = {5,110,106,105,102,101,100,301,302,202,205,206,210,0,},
        [6] = {6,110,108,109,104,101,100,201,204,209,208,210,0,0,},
        [7] = {7,210,208,207,203,202,201,100,101,102,103,107,106,110,},
        [8] = {8,210,206,205,202,302,301,100,101,102,105,106,110,0,},
        [9] = {9,210,208,209,204,201,100,101,104,109,108,110,0,0,},
        [10] = {10,210,208,207,203,202,201,100,301,302,303,307,306,310,},
        [11] = {11,210,208,209,204,201,100,101,104,304,309,308,310,0,},
        [12] = {12,210,206,205,202,201,100,301,302,305,306,310,0,0,},
        [13] = {13,310,306,307,303,302,301,100,201,204,102,105,106,110,},
        [14] = {14,310,308,309,304,301,100,101,102,103,107,106,110,0,},
        [15] = {15,310,306,305,302,301,100,101,104,109,108,110,0,0,},
        [16] = {16,310,306,307,303,302,301,100,201,202,203,207,208,210,},
        [17] = {17,310,308,309,304,104,101,100,201,204,209,208,210,0,},
        [18] = {18,310,306,305,302,301,100,201,202,205,206,210,0,0,},
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
    [2] = 2,
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
        assert(__key_map[k], "cannot find " .. k .. " in graincar_route")
        return t._raw[__key_map[k]]
    end
}

-- 
function graincar_route.length()
    return #graincar_route._data
end

-- 
function graincar_route.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function graincar_route.indexOf(index)
    if index == nil or not graincar_route._data[index] then
        return nil
    end

    return setmetatable({_raw = graincar_route._data[index]}, mt)
end

--
function graincar_route.get(id)
    
    return graincar_route.indexOf(__index_id[id])
        
end

--
function graincar_route.set(id, key, value)
    local record = graincar_route.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function graincar_route.index()
    return __index_id
end

return graincar_route