--mine_road

-- key
local __key_map = {
  road_id = 1,    --路线id-int 
  point_1 = 2,    --点1-int 
  point_2 = 3,    --点2-int 
  point_3 = 4,    --点3-int 
  point_4 = 5,    --点4-int 
  point_5 = 6,    --点5-int 
  point_6 = 7,    --点6-int 
  point_7 = 8,    --点7-int 
  point_8 = 9,    --点8-int 
  point_9 = 10,    --点9-int 
  point_10 = 11,    --点10-int 
  mid_point_1 = 12,    --中点1-string 
  mid_point_2 = 13,    --中点2-string 
  mid_point_3 = 14,    --中点3-string 
  mid_point_4 = 15,    --中点4-string 
  mid_point_5 = 16,    --中点5-string 
  mid_point_6 = 17,    --中点6-string 
  mid_point_7 = 18,    --中点7-string 
  mid_point_8 = 19,    --中点8-string 
  mid_point_9 = 20,    --中点9-string 
  mid_point_10 = 21,    --中点10-string 

}

-- data
local mine_road = {
    _data = {
        [1] = {1,100,101,104,109,108,110,0,0,0,0,"1385|749","1519|850","1756|929","1775|1121","1548|1320","","","","","",},
        [2] = {2,100,101,102,103,107,106,110,0,0,0,"1385|749","1274|850","1275|932","1331|1242","1160|1242","1225|1295","","","","",},
        [3] = {3,100,101,102,105,106,110,0,0,0,0,"1385|749","1274|850","988|1070","929|1070","1225|1295","","","","","",},
        [4] = {4,100,201,204,209,208,210,0,0,0,0,"1266|649","1033|604","782|745","501|730","284|558","","","","","",},
        [5] = {5,100,201,202,203,207,208,210,0,0,0,"1266|649","1079|430","868|430","601|461","416|595","284|730","","","","",},
        [6] = {6,100,201,202,205,206,210,0,0,0,0,"1266|649","1079|430","917|338","659|233","354|220","","","","","",},
        [7] = {7,100,301,304,309,308,310,0,0,0,0,"1530|649","1753|600","1992|739","2275|724","2479|569","","","","","",},
        [8] = {8,100,301,302,303,307,306,310,0,0,0,"1530|649","1702|600","1884|419","2181|396","2260|290","2379|185","","","","",},
        [9] = {9,100,301,302,305,306,310,0,0,0,0,"1530|649","1702|600","1800|315","2034|198","2379|185","","","","","",},
    }
}

-- index
local __index_road_id = {
    [1] = 1,
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
        assert(__key_map[k], "cannot find " .. k .. " in mine_road")
        return t._raw[__key_map[k]]
    end
}

-- 
function mine_road.length()
    return #mine_road._data
end

-- 
function mine_road.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function mine_road.indexOf(index)
    if index == nil or not mine_road._data[index] then
        return nil
    end

    return setmetatable({_raw = mine_road._data[index]}, mt)
end

--
function mine_road.get(road_id)
    
    return mine_road.indexOf(__index_road_id[road_id])
        
end

--
function mine_road.set(road_id, key, value)
    local record = mine_road.get(road_id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function mine_road.index()
    return __index_road_id
end

return mine_road