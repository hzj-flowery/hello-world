--mine_battle_buff

-- key
local __key_map = {
  buff_id = 1,    --id-int 
  buff_type = 2,    --类型-int 
  buff_value = 3,    --类型值-int 
  plus_minus = 4,    --加减-int 
  attr_type_1 = 5,    --属性1-int 
  attr_value_1 = 6,    --属性值1-int 
  attr_type_2 = 7,    --属性2-int 
  attr_value_2 = 8,    --属性值2-int 
  buff_name = 9,    --类型名称-string 
  buff_res = 10,    --类型资源-string 
  buff_txt = 11,    --类型描述-string 

}

-- data
local mine_battle_buff = {
    _data = {
        [1] = {101,1,50,2,19,50,20,50,"疲劳","img_mine_pi","疲劳值50，战斗中伤害降低5%",},
        [2] = {102,1,55,2,19,100,20,100,"疲劳","img_mine_pi","疲劳值55，战斗中伤害降低10%",},
        [3] = {103,1,60,2,19,150,20,150,"疲劳","img_mine_pi","疲劳值60，战斗中伤害降低15%",},
        [4] = {104,1,65,2,19,200,20,200,"疲劳","img_mine_pi","疲劳值65，战斗中伤害降低20%",},
        [5] = {105,1,70,2,19,250,20,250,"疲劳","img_mine_pi","疲劳值70，战斗中伤害降低25%",},
        [6] = {106,1,75,2,19,300,20,300,"疲劳","img_mine_pi","疲劳值75，战斗中伤害降低30%",},
        [7] = {107,1,80,2,19,350,20,350,"疲劳","img_mine_pi","疲劳值80，战斗中伤害降低35%",},
        [8] = {108,1,85,2,19,400,20,400,"疲劳","img_mine_pi","疲劳值85，战斗中伤害降低40%",},
        [9] = {109,1,90,2,19,450,20,450,"疲劳","img_mine_pi","疲劳值90，战斗中伤害降低45%",},
        [10] = {110,1,100,2,19,500,20,500,"疲劳","img_mine_pi","疲劳值100，战斗中伤害降低50%",},
        [11] = {200,2,0,1,20,100,0,0,"霸占","img_mine_ba","所在军团独占当前矿区，战斗中受到的伤害降低10%",},
    }
}

-- index
local __index_buff_id = {
    [101] = 1,
    [102] = 2,
    [103] = 3,
    [104] = 4,
    [105] = 5,
    [106] = 6,
    [107] = 7,
    [108] = 8,
    [109] = 9,
    [110] = 10,
    [200] = 11,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in mine_battle_buff")
        return t._raw[__key_map[k]]
    end
}

-- 
function mine_battle_buff.length()
    return #mine_battle_buff._data
end

-- 
function mine_battle_buff.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function mine_battle_buff.indexOf(index)
    if index == nil or not mine_battle_buff._data[index] then
        return nil
    end

    return setmetatable({_raw = mine_battle_buff._data[index]}, mt)
end

--
function mine_battle_buff.get(buff_id)
    
    return mine_battle_buff.indexOf(__index_buff_id[buff_id])
        
end

--
function mine_battle_buff.set(buff_id, key, value)
    local record = mine_battle_buff.get(buff_id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function mine_battle_buff.index()
    return __index_buff_id
end

return mine_battle_buff