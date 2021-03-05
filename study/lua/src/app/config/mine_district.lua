--mine_district

-- key
local __key_map = {
  district_id = 1,    --矿区id-int 
  district_name = 2,    --矿区名称-string 
  district_type = 3,    --矿区类型-int 
  unlock_event = 4,    --解锁条件-int 
  occupy_pit = 5,    --占领条件-int 
  district_bg = 6,    --地区背景-string 
  district_name_txt = 7,    --地区名称-string 
  district_icon = 8,    --地区图标-string 
  x = 9,    --坐标x值-int 
  y = 10,    --坐标y值-int 

}

-- data
local mine_district = {
    _data = {
        [1] = {1,"中原矿区",1,3,4,"img_mine_district01","txt_mine_qu01","img_mine_icon01",568,320,},
        [2] = {2,"河东矿区",2,2,3,"img_mine_district02","txt_mine_qu02","img_mine_icon02",568,200,},
        [3] = {3,"淮南矿区",2,2,3,"img_mine_district03","txt_mine_qu03","img_mine_icon03",757,427,},
        [4] = {4,"汉中矿区",2,2,3,"img_mine_district04","txt_mine_qu04","img_mine_icon04",379,427,},
        [5] = {5,"朔方矿区",3,1,5,"img_mine_district05","txt_mine_qu05","img_mine_icon05",868,100,},
        [6] = {6,"幽燕矿区",3,1,5,"img_mine_district06","txt_mine_qu06","img_mine_icon05",1168,100,},
        [7] = {7,"江东矿区",3,1,5,"img_mine_district07","txt_mine_qu07","img_mine_icon06",900,327,},
        [8] = {8,"南越矿区",3,1,5,"img_mine_district08","txt_mine_qu08","img_mine_icon06",900,527,},
        [9] = {9,"巴蜀矿区",3,1,5,"img_mine_district09","txt_mine_qu09","img_mine_icon07",150,327,},
        [10] = {10,"西凉矿区",3,1,5,"img_mine_district10","txt_mine_qu10","img_mine_icon07",150,527,},
    }
}

-- index
local __index_district_id = {
    [1] = 1,
    [10] = 10,
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
        assert(__key_map[k], "cannot find " .. k .. " in mine_district")
        return t._raw[__key_map[k]]
    end
}

-- 
function mine_district.length()
    return #mine_district._data
end

-- 
function mine_district.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function mine_district.indexOf(index)
    if index == nil or not mine_district._data[index] then
        return nil
    end

    return setmetatable({_raw = mine_district._data[index]}, mt)
end

--
function mine_district.get(district_id)
    
    return mine_district.indexOf(__index_district_id[district_id])
        
end

--
function mine_district.set(district_id, key, value)
    local record = mine_district.get(district_id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function mine_district.index()
    return __index_district_id
end

return mine_district