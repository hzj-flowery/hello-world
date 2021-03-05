--cake_charge

-- key
local __key_map = {
  id = 1,    --id-int 
  type = 2,    --活动类型-int 
  cost_type = 3,    --消耗type-int 
  cost_value = 4,    --消耗value-int 
  cost_size = 5,    --消耗size-int 
  type1 = 6,    --奖励type-int 
  value1 = 7,    --奖励value-int 
  size1 = 8,    --奖励size-int 
  type2 = 9,    --奖励type-int 
  value2 = 10,    --奖励value-int 
  size2 = 11,    --奖励size-int 
  award1 = 12,    --奖励1图片名称-string 
  award2 = 13,    --奖励1图片名称-string 

}

-- data
local cake_charge = {
    _data = {
        [1] = {1,1,5,33,50,6,571,6,0,0,0,"img_prop_cream","img_prop_yuanbao",},
        [2] = {2,1,5,33,250,6,571,30,0,0,0,"img_prop_cream","img_prop_yuanbao",},
        [3] = {3,1,5,33,1000,6,571,120,0,0,0,"img_prop_cream","img_prop_yuanbao",},
        [4] = {4,1,5,33,2000,6,571,240,0,0,0,"img_prop_cream","img_prop_yuanbao",},
        [5] = {5,1,5,33,3000,6,571,360,0,0,0,"img_prop_cream","img_prop_yuanbao",},
        [6] = {6,1,5,33,5000,6,571,600,0,0,0,"img_prop_cream","img_prop_yuanbao",},
        [7] = {7,2,5,33,50,6,574,6,0,0,0,"img_prop_beef","img_prop_yuanbao",},
        [8] = {8,2,5,33,250,6,574,30,0,0,0,"img_prop_beef","img_prop_yuanbao",},
        [9] = {9,2,5,33,1000,6,574,120,0,0,0,"img_prop_beef","img_prop_yuanbao",},
        [10] = {10,2,5,33,2000,6,574,240,0,0,0,"img_prop_beef","img_prop_yuanbao",},
        [11] = {11,2,5,33,3000,6,574,360,0,0,0,"img_prop_beef","img_prop_yuanbao",},
        [12] = {12,2,5,33,5000,6,574,600,0,0,0,"img_prop_beef","img_prop_yuanbao",},
        [13] = {13,3,5,33,50,6,577,6,0,0,0,"img_prop_meat","img_prop_yuanbao",},
        [14] = {14,3,5,33,250,6,577,30,0,0,0,"img_prop_meat","img_prop_yuanbao",},
        [15] = {15,3,5,33,1000,6,577,120,0,0,0,"img_prop_meat","img_prop_yuanbao",},
        [16] = {16,3,5,33,2000,6,577,240,0,0,0,"img_prop_meat","img_prop_yuanbao",},
        [17] = {17,3,5,33,3000,6,577,360,0,0,0,"img_prop_meat","img_prop_yuanbao",},
        [18] = {18,3,5,33,5000,6,577,600,0,0,0,"img_prop_meat","img_prop_yuanbao",},
        [19] = {19,4,5,33,50,6,580,6,0,0,0,"img_prop_chicken","img_prop_yuanbao",},
        [20] = {20,4,5,33,250,6,580,30,0,0,0,"img_prop_chicken","img_prop_yuanbao",},
        [21] = {21,4,5,33,1000,6,580,120,0,0,0,"img_prop_chicken","img_prop_yuanbao",},
        [22] = {22,4,5,33,2000,6,580,240,0,0,0,"img_prop_chicken","img_prop_yuanbao",},
        [23] = {23,4,5,33,3000,6,580,360,0,0,0,"img_prop_chicken","img_prop_yuanbao",},
        [24] = {24,4,5,33,5000,6,580,600,0,0,0,"img_prop_chicken","img_prop_yuanbao",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
    [13] = 13,
    [14] = 14,
    [15] = 15,
    [16] = 16,
    [17] = 17,
    [18] = 18,
    [19] = 19,
    [2] = 2,
    [20] = 20,
    [21] = 21,
    [22] = 22,
    [23] = 23,
    [24] = 24,
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
        assert(__key_map[k], "cannot find " .. k .. " in cake_charge")
        return t._raw[__key_map[k]]
    end
}

-- 
function cake_charge.length()
    return #cake_charge._data
end

-- 
function cake_charge.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function cake_charge.indexOf(index)
    if index == nil or not cake_charge._data[index] then
        return nil
    end

    return setmetatable({_raw = cake_charge._data[index]}, mt)
end

--
function cake_charge.get(id)
    
    return cake_charge.indexOf(__index_id[id])
        
end

--
function cake_charge.set(id, tkey, nvalue)
    local record = cake_charge.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function cake_charge.index()
    return __index_id
end

return cake_charge