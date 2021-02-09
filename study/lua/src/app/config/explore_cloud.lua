--explore_cloud

-- key
local __key_map = {
  id = 1,    --对应章节id-int 
  x1 = 2,    --云1x坐标-int 
  y1 = 3,    --云1y坐标-int 
  movex1 = 4,    --云1位移x-int 
  movey1 = 5,    --云1位移y-int 
  x2 = 6,    --云2x坐标-int 
  y2 = 7,    --云2y坐标-int 
  movex2 = 8,    --云2位移x-int 
  movey2 = 9,    --云2位移y-int 
  x3 = 10,    --云3x坐标-int 
  y3 = 11,    --云3y坐标-int 
  movex3 = 12,    --云3位移x-int 
  movey3 = 13,    --云3位移y-int 
  x4 = 14,    --云4x坐标-int 
  y4 = 15,    --云4y坐标-int 
  movex4 = 16,    --云4位移x-int 
  movey4 = 17,    --云4位移y-int 
  x5 = 18,    --云5x坐标-int 
  y5 = 19,    --云5y坐标-int 
  movex5 = 20,    --云5位移x-int 
  movey5 = 21,    --云5位移y-int 
  x6 = 22,    --云6x坐标-int 
  y6 = 23,    --云6y坐标-int 
  movex6 = 24,    --云6位移x-int 
  movey6 = 25,    --云6位移y-int 
  x7 = 26,    --云7x坐标-int 
  y7 = 27,    --云7y坐标-int 
  movex7 = 28,    --云7位移x-int 
  movey7 = 29,    --云7位移y-int 
  x8 = 30,    --云8x坐标-int 
  y8 = 31,    --云8y坐标-int 
  movex8 = 32,    --云8位移x-int 
  movey8 = 33,    --云8位移y-int 

}

-- data
local explore_cloud = {
    _data = {
        [1] = {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [2] = {2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [3] = {3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [4] = {4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [5] = {5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [6] = {6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [7] = {7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [8] = {8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [9] = {9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [10] = {10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [11] = {11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [12] = {12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [13] = {13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [14] = {14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [15] = {15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [16] = {16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [17] = {17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [18] = {18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [19] = {19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [20] = {20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [21] = {991,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [22] = {992,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [23] = {993,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [24] = {994,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [25] = {995,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [26] = {996,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [27] = {997,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [28] = {998,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [29] = {999,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,},
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
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,
    [991] = 21,
    [992] = 22,
    [993] = 23,
    [994] = 24,
    [995] = 25,
    [996] = 26,
    [997] = 27,
    [998] = 28,
    [999] = 29,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in explore_cloud")
        return t._raw[__key_map[k]]
    end
}

-- 
function explore_cloud.length()
    return #explore_cloud._data
end

-- 
function explore_cloud.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function explore_cloud.indexOf(index)
    if index == nil or not explore_cloud._data[index] then
        return nil
    end

    return setmetatable({_raw = explore_cloud._data[index]}, mt)
end

--
function explore_cloud.get(id)
    
    return explore_cloud.indexOf(__index_id[id])
        
end

--
function explore_cloud.set(id, key, value)
    local record = explore_cloud.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function explore_cloud.index()
    return __index_id
end

return explore_cloud