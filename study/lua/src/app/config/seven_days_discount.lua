--seven_days_discount

-- key
local __key_map = {
  id = 1,    --id-int 
  day = 2,    --时间-int 
  sheet = 3,    --页签-int 
  name = 4,    --物品名称-string 
  gold_price = 5,    --出售价格-int 
  show_price = 6,    --原价-int 
  type_1 = 7,    --类型1-int 
  value_1 = 8,    --类型值1-int 
  size_1 = 9,    --数量1-int 
  type_2 = 10,    --类型2-int 
  value_2 = 11,    --类型值2-int 
  size_2 = 12,    --数量2-int 
  type_3 = 13,    --类型3-int 
  value_3 = 14,    --类型值3-int 
  size_3 = 15,    --数量3-int 
  type_4 = 16,    --类型4-int 
  value_4 = 17,    --类型值4-int 
  size_4 = 18,    --数量4-int 

}

-- data
local seven_days_discount = {
    _data = {
        [1] = {1,1,4,"一套蓝色装备（4件）",400,800,2,201,1,2,202,1,2,203,1,2,204,1,},
        [2] = {2,2,4,"橙色兵书任选箱",1000,2000,6,123,1,0,0,0,0,0,0,0,0,0,},
        [3] = {3,3,4,"高级精炼石x40",1000,2000,6,13,80,0,0,0,0,0,0,0,0,0,},
        [4] = {4,4,4,"橙色神兵任选+功勋+神兵进阶石",1000,2000,6,107,1,6,19,500,5,8,10000,0,0,0,},
        [5] = {5,5,4,"橙色万能神兵x5",1250,2500,6,80,5,0,0,0,0,0,0,0,0,0,},
        [6] = {6,6,4,"橙色兵符任选箱",1000,2000,6,124,1,0,0,0,0,0,0,0,0,0,},
        [7] = {7,7,4,"关羽锦囊",1500,3000,11,1205,1,0,0,0,0,0,0,0,0,0,},
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

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in seven_days_discount")
        return t._raw[__key_map[k]]
    end
}

-- 
function seven_days_discount.length()
    return #seven_days_discount._data
end

-- 
function seven_days_discount.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function seven_days_discount.indexOf(index)
    if index == nil or not seven_days_discount._data[index] then
        return nil
    end

    return setmetatable({_raw = seven_days_discount._data[index]}, mt)
end

--
function seven_days_discount.get(id)
    
    return seven_days_discount.indexOf(__index_id[id])
        
end

--
function seven_days_discount.set(id, key, value)
    local record = seven_days_discount.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function seven_days_discount.index()
    return __index_id
end

return seven_days_discount