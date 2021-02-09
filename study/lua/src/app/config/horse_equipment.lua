--horse_equipment

-- key
local __key_map = {
  id = 1,    --编号-int 
  name = 2,    --装备名称-string 
  type = 3,    --装备类型-int 
  color = 4,    --品质-int 
  res_id = 5,    --资源id-string 
  description = 6,    --装备描述-string 
  fragment_id = 7,    --碎片id-int 
  attribute_type_1 = 8,    --属性类型1-int 
  attribute_value_1 = 9,    --属性值1-int 
  attribute_type_2 = 10,    --属性类型2-int 
  attribute_value_2 = 11,    --属性值2-int 
  attribute_type_3 = 12,    --属性类型3-int 
  attribute_value_3 = 13,    --属性值3-int 
  attribute_type_4 = 14,    --属性类型4-int 
  attribute_value_4 = 15,    --属性值4-int 
  all_combat = 16,    --假战力-int 
  moving = 17,    --装备特效-string 

}

-- data
local horse_equipment = {
    _data = {
        [1] = {101,"白玉马鞍",1,4,"101","白玉制成的马鞍，极为名贵。",150101,7,64500,0,0,0,0,0,0,720000,"0",},
        [2] = {102,"紫金马镫",2,4,"102","紫金镶嵌的马镫，彰显气质。",150102,4,4500,0,0,0,0,0,0,720000,"0",},
        [3] = {103,"银环缰绳",3,4,"103","蓝缎制成的缰绳，尽享丝滑。",150103,1,9000,0,0,0,0,0,0,720000,"0",},
        [4] = {201,"沧海碧蛟鞍",1,5,"201","据说有蛟龙的灵魂附着其上，保佑征战无往不胜。",150201,7,172000,0,0,0,0,0,0,2500000,"0",},
        [5] = {202,"大漠苍狼镫",2,5,"202","有苍狼之灵保佑的马镫，默默守护着主人。",150202,4,12000,0,0,0,0,0,0,2500000,"0",},
        [6] = {203,"烈日腾蛇缰",3,5,"203","牵着附有腾蛇气息的缰绳，骑马时如腾云驾雾一般。",150203,1,24000,0,0,0,0,0,0,2500000,"0",},
    }
}

-- index
local __index_id = {
    [101] = 1,
    [102] = 2,
    [103] = 3,
    [201] = 4,
    [202] = 5,
    [203] = 6,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in horse_equipment")
        return t._raw[__key_map[k]]
    end
}

-- 
function horse_equipment.length()
    return #horse_equipment._data
end

-- 
function horse_equipment.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function horse_equipment.indexOf(index)
    if index == nil or not horse_equipment._data[index] then
        return nil
    end

    return setmetatable({_raw = horse_equipment._data[index]}, mt)
end

--
function horse_equipment.get(id)
    
    return horse_equipment.indexOf(__index_id[id])
        
end

--
function horse_equipment.set(id, key, value)
    local record = horse_equipment.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function horse_equipment.index()
    return __index_id
end

return horse_equipment