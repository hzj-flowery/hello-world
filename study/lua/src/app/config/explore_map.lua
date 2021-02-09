--explore_map

-- key
local __key_map = {
  id = 1,    --格子-int 
  size = 2,    --格子数量-int 
  x = 3,    --起点x-int 
  y = 4,    --起点y-int 
  start_road = 5,    --起点-string 
  end_road = 6,    --终点-string 
  road = 7,    --道路-string 
  map = 8,    --格子-string 
  map_size = 9,    --地图-string 
  tree = 10,    --树-string 
  flower = 11,    --花-string 
  car = 12,    --车械-string 
  up_x = 13,    --左x坐标-int 
  down_x = 14,    --右x坐标-int 
  up_y = 15,    --上y坐标-int 
  down_y = 16,    --下y坐标-int 

}

-- data
local explore_map = {
    _data = {
        [1] = {1,30,300,300,"img_road2","img_road3","img_road","1|3|3|1|1|4|4|1|1|1|4|4|2|2|2|2|2|4|4|1|1|1|4|4|1|1|3|1|1","map30","","","",0,2272,1280,0,},
        [2] = {2,45,231,316,"img_road2","img_road3","img_road","1|1|1|1|3|3|3|1|1|4|4|1|1|4|4|4|2|2|2|2|2|2|4|4|4|4|1|1|1|4|4|4|1|1|1|3|3|3|1|1|1|1|1|1","map45","","","",0,2272,1280,0,},
        [3] = {3,60,172,511,"img_road5","img_road6","img_road4","1|1|1|1|1|4|4|2|2|2|4|4|2|2|2|2|2|4|4|4|1|1|1|1|1|1|4|4|4|2|4|4|1|1|1|3|3|3|1|1|3|3|3|3|3|1|1|4|1|4|4|4|4|4|4|2|2|4|4","map60","","","",0,2272,1280,0,},
        [4] = {4,75,107,932,"img_road2","img_road3","img_road","4|4|2|2|4|4|4|4|4|2|2|2|2|2|4|4|4|1|1|1|1|1|1|1|4|4|2|2|2|4|4|1|1|1|4|4|1|1|3|3|3|3|1|1|4|4|4|1|1|3|1|1|3|3|3|3|3|3|2|2|2|2|3|2|3|3|2|3|3|1|1|4|1|1","map75","","","",0,2272,1280,0,},
        [5] = {5,90,156,195,"img_road5","img_road6","img_road4","4|4|1|1|1|1|3|3|3|1|3|3|3|3|3|1|1|1|1|1|1|1|1|1|4|4|4|2|2|4|4|2|2|2|2|4|4|4|4|4|4|4|4|4|4|4|1|1|1|1|3|3|3|3|3|3|3|3|1|1|1|1|3|3|3|3|1|1|1|4|4|4|4|4|4|4|2|2|2|2|4|4|4|4|4|4|1|1|1","map90","  ","","",0,2272,1280,0,},
        [6] = {6,105,160,897,"img_road2","img_road3","img_road","4|4|4|1|1|3|1|3|1|1|4|1|1|1|4|1|4|4|2|2|2|2|4|4|2|4|2|2|4|2|2|3|2|3|3|3|2|2|4|2|4|2|4|2|2|4|4|4|4|4|1|1|1|1|1|3|3|1|1|1|1|1|1|4|4|4|4|2|4|2|4|4|1|1|1|4|1|1|4|1|1|3|3|3|3|1|3|3|3|3|3|2|2|3|3|1|1|1|1|4|1|4|4|4","map105","","","",0,2272,1280,0,},
        [7] = {7,105,225,680,"img_road2","img_road3","img_road","1|1|1|1|3|3|3|1|1|1|4|1|4|1|4|4|4|2|2|4|4|2|2|2|2|2|2|3|2|2|2|2|4|2|2|4|4|4|4|1|1|1|1|1|3|3|1|1|1|1|1|1|1|1|1|3|1|1|3|1|1|4|4|4|4|1|1|4|4|4|4|4|2|2|2|2|4|4|4|4|2|2|3|3|3|3|3|3|2|2|4|2|2|2|2|2|2|4|4|1|1|1|4|4","map105_2","","","",0,2272,1280,0,},
        [8] = {8,105,225,225,"img_road5","img_road6","img_road4","1|1|1|3|3|3|3|3|1|1|1|3|3|3|1|1|1|3|1|1|1|4|1|4|4|4|2|2|2|2|4|4|4|4|2|2|4|4|4|4|2|2|4|4|4|1|1|4|1|1|1|1|3|3|3|3|3|1|1|1|1|3|3|3|3|3|1|1|1|1|4|4|1|4|4|4|4|4|4|4|4|4|2|2|2|3|3|3|2|2|2|4|4|4|4|4|1|1|4|4|2|2|2|2","map105_3","","","",0,2272,1280,0,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in explore_map")
        return t._raw[__key_map[k]]
    end
}

-- 
function explore_map.length()
    return #explore_map._data
end

-- 
function explore_map.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function explore_map.indexOf(index)
    if index == nil or not explore_map._data[index] then
        return nil
    end

    return setmetatable({_raw = explore_map._data[index]}, mt)
end

--
function explore_map.get(id)
    
    return explore_map.indexOf(__index_id[id])
        
end

--
function explore_map.set(id, key, value)
    local record = explore_map.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function explore_map.index()
    return __index_id
end

return explore_map