--gold_hero_train

-- key
local __key_map = {
  limit_level = 1,    --养成等级-int 
  name_1 = 2,    --材料1名称-string 
  cost_hero = 3,    --同名武将消耗量-int 
  consume_hero = 4,    --同名武将每次消耗-int 
  name_2 = 5,    --材料2名称-string 
  type_2 = 6,    --材料2type-int 
  value_2 = 7,    --材料2value-int 
  size_2 = 8,    --材料2size-int 
  consume_2 = 9,    --材料2每次消耗-int 
  name_3 = 10,    --材料3名称-string 
  type_3 = 11,    --材料3type-int 
  value_3 = 12,    --材料3value-int 
  size_3 = 13,    --材料3size-int 
  consume_3 = 14,    --材料3每次消耗-int 
  name_4 = 15,    --材料4名称-string 
  type_4 = 16,    --材料4type-int 
  value_4 = 17,    --材料4value-int 
  size_4 = 18,    --材料4size-int 
  consume_4 = 19,    --材料4每次消耗-int 
  break_name = 20,    --突破消耗名称-string 
  break_type = 21,    --突破消耗类型-int 
  break_value = 22,    --突破消耗子银两-int 
  break_size = 23,    --突破消耗数量-int 

}

-- data
local gold_hero_train = {
    _data = {
        [1] = {0,"天",1,1,"治国",0,0,2500000,20,"修身",6,3,3200,300,"齐家",6,40,2000,200,"银两",5,2,4800000,},
        [2] = {1,"天",1,1,"治国",0,0,5000000,40,"修身",6,3,6400,300,"齐家",6,40,10000,500,"银两",5,2,9600000,},
        [3] = {2,"天",2,1,"治国",0,0,10000000,80,"修身",6,3,12000,480,"齐家",6,40,50000,2000,"银两",5,2,18000000,},
        [4] = {3,"天",3,1,"治国",0,0,20000000,120,"修身",6,3,25000,1000,"齐家",6,40,200000,8000,"银两",5,2,36000000,},
        [5] = {4,"天",4,1,"治国",0,0,40000000,200,"修身",6,3,50000,1250,"齐家",6,40,800000,20000,"银两",5,2,72000000,},
        [6] = {5,"天",0,0,"治国",0,0,0,0,"修身",0,0,0,0,"齐家",0,0,0,0,"银两",0,0,0,},
    }
}

-- index
local __index_limit_level = {
    [0] = 1,
    [1] = 2,
    [2] = 3,
    [3] = 4,
    [4] = 5,
    [5] = 6,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in gold_hero_train")
        return t._raw[__key_map[k]]
    end
}

-- 
function gold_hero_train.length()
    return #gold_hero_train._data
end

-- 
function gold_hero_train.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function gold_hero_train.indexOf(index)
    if index == nil or not gold_hero_train._data[index] then
        return nil
    end

    return setmetatable({_raw = gold_hero_train._data[index]}, mt)
end

--
function gold_hero_train.get(limit_level)
    
    return gold_hero_train.indexOf(__index_limit_level[limit_level])
        
end

--
function gold_hero_train.set(limit_level, key, value)
    local record = gold_hero_train.get(limit_level)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function gold_hero_train.index()
    return __index_limit_level
end

return gold_hero_train