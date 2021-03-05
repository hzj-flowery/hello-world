--mine_route

-- key
local __key_map = {
  point_start = 1,    --起点id-int 
  point_end = 2,    --终点id-int 
  district = 3,    --所在区域-int 
  point = 4,    --曲线点-string 

}

-- data
local mine_route = {
    _data = {
        [1] = {100,102,1,"184|23",},
        [2] = {101,105,1,"-25|115",},
        [3] = {102,101,1,"273|91",},
        [4] = {103,102,1,"301|-54",},
        [5] = {104,103,1,"-28|-120",},
        [6] = {105,104,1,"-246|-19",},
        [7] = {200,201,2,"243|25",},
        [8] = {201,202,2,"182|-41",},
        [9] = {201,203,2,"-69|62",},
        [10] = {201,204,2,"265|112",},
        [11] = {300,301,3,"41|-41",},
        [12] = {301,302,3,"4|50",},
        [13] = {301,303,3,"302|81",},
        [14] = {301,304,3,"278|-40",},
        [15] = {400,401,4,"172|-50",},
        [16] = {401,402,4,"173|67",},
        [17] = {401,403,4,"-99|-63",},
        [18] = {401,404,4,"-124|30",},
        [19] = {500,501,5,"-49|6",},
        [20] = {501,502,5,"171|-49",},
        [21] = {501,503,5,"-165|-108",},
        [22] = {600,601,6,"256|39",},
        [23] = {601,602,6,"-7|-10",},
        [24] = {601,603,6,"262|-87",},
        [25] = {700,701,7,"189|56",},
        [26] = {701,702,7,"-43|-12",},
        [27] = {701,703,7,"288|-78",},
        [28] = {800,801,8,"-173|-117",},
        [29] = {801,802,8,"5|8",},
        [30] = {801,803,8,"189|-100",},
        [31] = {900,901,9,"205|-95",},
        [32] = {901,902,9,"38|-11",},
        [33] = {901,903,9,"-127|-129",},
        [34] = {1000,1001,10,"-39|69",},
        [35] = {1001,1002,10,"159|63",},
        [36] = {1001,1003,10,"-83|-66",},
        [37] = {202,101,2,"284|-212",},
        [38] = {302,103,3,"-314|54",},
        [39] = {402,104,4,"408|106",},
        [40] = {502,203,5,"286|-36",},
        [41] = {602,204,6,"-126|10",},
        [42] = {702,303,7,"-179|-9",},
        [43] = {802,304,8,"87|47",},
        [44] = {902,403,9,"-48|35",},
        [45] = {1002,404,10,"271|39",},
    }
}

-- index
local __index_point_start_point_end = {
    ["1000_1001"] = 34,
    ["1001_1002"] = 35,
    ["1001_1003"] = 36,
    ["1002_404"] = 45,
    ["100_102"] = 1,
    ["101_105"] = 2,
    ["102_101"] = 3,
    ["103_102"] = 4,
    ["104_103"] = 5,
    ["105_104"] = 6,
    ["200_201"] = 7,
    ["201_202"] = 8,
    ["201_203"] = 9,
    ["201_204"] = 10,
    ["202_101"] = 37,
    ["300_301"] = 11,
    ["301_302"] = 12,
    ["301_303"] = 13,
    ["301_304"] = 14,
    ["302_103"] = 38,
    ["400_401"] = 15,
    ["401_402"] = 16,
    ["401_403"] = 17,
    ["401_404"] = 18,
    ["402_104"] = 39,
    ["500_501"] = 19,
    ["501_502"] = 20,
    ["501_503"] = 21,
    ["502_203"] = 40,
    ["600_601"] = 22,
    ["601_602"] = 23,
    ["601_603"] = 24,
    ["602_204"] = 41,
    ["700_701"] = 25,
    ["701_702"] = 26,
    ["701_703"] = 27,
    ["702_303"] = 42,
    ["800_801"] = 28,
    ["801_802"] = 29,
    ["801_803"] = 30,
    ["802_304"] = 43,
    ["900_901"] = 31,
    ["901_902"] = 32,
    ["901_903"] = 33,
    ["902_403"] = 44,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in mine_route")
        return t._raw[__key_map[k]]
    end
}

-- 
function mine_route.length()
    return #mine_route._data
end

-- 
function mine_route.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function mine_route.indexOf(index)
    if index == nil or not mine_route._data[index] then
        return nil
    end

    return setmetatable({_raw = mine_route._data[index]}, mt)
end

--
function mine_route.get(point_start,point_end)
    
    local k = point_start .. '_' .. point_end
    return mine_route.indexOf(__index_point_start_point_end[k])
        
end

--
function mine_route.set(point_start,point_end, key, value)
    local record = mine_route.get(point_start,point_end)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function mine_route.index()
    return __index_point_start_point_end
end

return mine_route