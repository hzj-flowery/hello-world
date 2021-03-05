--hero_limit_cost

-- key
local __key_map = {
  limit_level = 1,    --界限等级-int 
  limit_level_red = 2,    --界限等级（红）-int 
  rank = 3,    --突破等级限制-int 
  name_1 = 4,    --材料1名称-string 
  type_1 = 5,    --材料1type-int 
  value_1 = 6,    --材料1value-int 
  size_1 = 7,    --材料1size-int 
  consume_1 = 8,    --材料1每次消耗-int 
  name_2 = 9,    --材料2名称-string 
  type_2 = 10,    --材料2type-int 
  value_2 = 11,    --材料2value-int 
  size_2 = 12,    --材料2size-int 
  consume_2 = 13,    --材料2每次消耗-int 
  name_3 = 14,    --材料3名称-string 
  type_3 = 15,    --材料3type-int 
  value_3 = 16,    --材料3value-int 
  size_3 = 17,    --材料3size-int 
  consume_3 = 18,    --材料3每次消耗-int 
  name_4 = 19,    --材料4名称-string 
  type_4 = 20,    --材料4type-int 
  value_4 = 21,    --材料4value-int 
  size_4 = 22,    --材料4size-int 
  consume_4 = 23,    --材料4每次消耗-int 
  break_name = 24,    --突破消耗名称-string 
  break_type = 25,    --突破消耗类型-int 
  break_value = 26,    --突破消耗子银两-int 
  break_size = 27,    --突破消耗数量-int 
  special_name = 28,    --特殊材料名称-string 
  special_type = 29,    --特殊材料type-int 
  special_value = 30,    --特殊材料value-int 
  special_size = 31,    --特殊材料size-int 
  special_consume = 32,    --特殊材料每次消耗-int 
  name_6 = 33,    --材料6名称-string 
  type_6 = 34,    --材料6type-int 
  value_6 = 35,    --材料6value-int 
  size_6 = 36,    --材料6size-int 
  consume_6 = 37,    --材料6每次消耗-int 

}

-- data
local hero_limit_cost = {
    _data = {
        [1] = {0,0,5,"论语",0,0,720000,5,"左传",6,3,1500,50,"春秋",6,92,9,1,"战国",6,93,9,1,"银两",5,2,1500000,"",0,0,0,0,"",0,0,0,0,},
        [2] = {1,0,8,"论语",0,0,1440000,5,"左传",6,3,3000,50,"春秋",6,92,18,1,"战国",6,93,18,1,"银两",5,2,3000000,"",0,0,0,0,"",0,0,0,0,},
        [3] = {2,0,10,"论语",0,0,2880000,5,"左传",6,3,6000,50,"春秋",6,92,36,1,"战国",6,93,36,1,"银两",5,2,6000000,"",0,0,0,0,"",0,0,0,0,},
        [4] = {3,0,0,"论语",0,0,0,0,"左传",0,0,0,0,"春秋",0,0,0,0,"战国",0,0,0,0,"银两",0,0,0,"",0,0,0,0,"",0,0,0,0,},
        [5] = {0,1,12,"论语",0,0,3280000,50,"左传",6,3,3500,100,"礼记",6,555,4,1,"周易",6,556,4,1,"银两",5,2,5380000,"天罡",99,1,2,1,"地煞",6,40,40000,2000,},
        [6] = {1,1,12,"论语",0,0,4910000,50,"左传",6,3,5300,120,"礼记",6,555,8,1,"周易",6,556,8,1,"银两",5,2,8070000,"天罡",99,1,3,1,"地煞",6,40,60000,2000,},
        [7] = {2,1,12,"论语",0,0,7370000,50,"左传",6,3,7900,150,"礼记",6,555,12,1,"周易",6,556,12,1,"银两",5,2,12100000,"天罡",99,1,5,1,"地煞",6,40,90000,3000,},
        [8] = {3,1,12,"论语",0,0,11060000,50,"左传",6,3,11800,180,"礼记",6,555,16,1,"周易",6,556,16,1,"银两",5,2,18150000,"天罡",99,2,2,1,"地煞",6,40,140000,4000,},
        [9] = {4,1,0,"论语",0,0,0,0,"左传",0,0,0,0,"礼记",0,0,0,0,"周易",0,0,0,0,"银两",0,0,0,"天罡",0,0,0,0,"地煞",0,0,0,0,},
        [10] = {0,2,12,"论语",0,0,3280000,50,"左传",6,3,3500,100,"礼记",6,555,4,1,"周易",6,556,4,1,"银两",5,2,5380000,"天罡",99,1,2,1,"地煞",6,40,40000,2000,},
        [11] = {1,2,12,"论语",0,0,4910000,50,"左传",6,3,5300,120,"礼记",6,555,8,1,"周易",6,556,8,1,"银两",5,2,8070000,"天罡",99,1,3,1,"地煞",6,40,60000,2000,},
        [12] = {2,2,12,"论语",0,0,7370000,50,"左传",6,3,7900,150,"礼记",6,555,12,1,"周易",6,556,12,1,"银两",5,2,12100000,"天罡",99,1,5,1,"地煞",6,40,90000,3000,},
        [13] = {3,2,12,"论语",0,0,11060000,50,"左传",6,3,11800,180,"礼记",6,555,16,1,"周易",6,556,16,1,"银两",5,2,18150000,"天罡",99,2,2,1,"地煞",6,40,140000,4000,},
        [14] = {4,2,0,"论语",0,0,0,0,"左传",0,0,0,0,"礼记",0,0,0,0,"周易",0,0,0,0,"银两",0,0,0,"天罡",0,0,0,0,"地煞",0,0,0,0,},
    }
}

-- index
local __index_limit_level_limit_level_red = {
    ["0_0"] = 1,
    ["0_1"] = 5,
    ["0_2"] = 10,
    ["1_0"] = 2,
    ["1_1"] = 6,
    ["1_2"] = 11,
    ["2_0"] = 3,
    ["2_1"] = 7,
    ["2_2"] = 12,
    ["3_0"] = 4,
    ["3_1"] = 8,
    ["3_2"] = 13,
    ["4_1"] = 9,
    ["4_2"] = 14,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in hero_limit_cost")
        return t._raw[__key_map[k]]
    end
}

-- 
function hero_limit_cost.length()
    return #hero_limit_cost._data
end

-- 
function hero_limit_cost.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function hero_limit_cost.indexOf(index)
    if index == nil or not hero_limit_cost._data[index] then
        return nil
    end

    return setmetatable({_raw = hero_limit_cost._data[index]}, mt)
end

--
function hero_limit_cost.get(limit_level,limit_level_red)
    
    local k = limit_level .. '_' .. limit_level_red
    return hero_limit_cost.indexOf(__index_limit_level_limit_level_red[k])
        
end

--
function hero_limit_cost.set(limit_level,limit_level_red, tkey, nvalue)
    local record = hero_limit_cost.get(limit_level,limit_level_red)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function hero_limit_cost.index()
    return __index_limit_level_limit_level_red
end

return hero_limit_cost