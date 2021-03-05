--horse_group

-- key
local __key_map = {
  id = 1,    --id-int 
  name = 2,    --图鉴名称-string 
  horse1 = 3,    --战马1-int 
  horse2 = 4,    --战马2-int 
  attribute_type_1 = 5,    --属性类型1-int 
  attribute_value_1 = 6,    --属性值1-int 
  attribute_type_2 = 7,    --属性类型2-int 
  attribute_value_2 = 8,    --属性值2-int 
  attribute_type_3 = 9,    --属性类型3-int 
  attribute_value_3 = 10,    --属性值3-int 
  attribute_type_4 = 11,    --属性类型4-int 
  attribute_value_4 = 12,    --属性值4-int 
  all_combat = 13,    --假战力-int 
  show_day = 14,    --达到开服天数显示-int 

}

-- data
local horse_group = {
    _data = {
        [1] = {1,"绿影摇青",1,2,1,200,7,1500,0,0,0,0,60000,1,},
        [2] = {2,"采黄掷枣",3,4,1,200,7,1500,0,0,0,0,60000,1,},
        [3] = {3,"露从夜白",5,6,1,800,7,6000,0,0,0,0,240000,1,},
        [4] = {4,"碧染红林",7,8,1,800,7,6000,0,0,0,0,240000,1,},
        [5] = {5,"庭飞白雪",9,5,1,1000,7,7500,20,50,0,0,480000,1,},
        [6] = {6,"崖生紫云",10,6,1,1000,7,7500,19,50,0,0,480000,1,},
        [7] = {7,"玉脂红胭",11,7,1,1000,7,7500,20,50,0,0,480000,1,},
        [8] = {8,"月照碧影",12,8,1,1000,7,7500,19,50,0,0,480000,1,},
        [9] = {11,"电光火石",15,7,1,1000,7,7500,19,50,0,0,480000,1,},
        [10] = {12,"月明星稀",16,8,1,1000,7,7500,20,50,0,0,480000,1,},
        [11] = {14,"黑白分明",17,5,1,1000,7,7500,20,50,0,0,480000,1,},
        [12] = {9,"拂霜吹雪",9,10,1,1200,7,9000,20,80,11,120,960000,1,},
        [13] = {10,"红阑夜火",11,12,1,1200,7,9000,19,80,8,120,960000,1,},
        [14] = {13,"烈火迅雷",16,15,1,1200,7,9000,19,80,8,120,960000,1,},
        [15] = {15,"截然不同",17,16,1,1200,7,9000,19,80,8,120,960000,1,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 13,
    [11] = 9,
    [12] = 10,
    [13] = 14,
    [14] = 11,
    [15] = 15,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 12,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in horse_group")
        return t._raw[__key_map[k]]
    end
}

-- 
function horse_group.length()
    return #horse_group._data
end

-- 
function horse_group.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function horse_group.indexOf(index)
    if index == nil or not horse_group._data[index] then
        return nil
    end

    return setmetatable({_raw = horse_group._data[index]}, mt)
end

--
function horse_group.get(id)
    
    return horse_group.indexOf(__index_id[id])
        
end

--
function horse_group.set(id, tkey, nvalue)
    local record = horse_group.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function horse_group.index()
    return __index_id
end

return horse_group