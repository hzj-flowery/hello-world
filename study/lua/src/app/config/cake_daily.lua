--cake_daily

-- key
local __key_map = {
  type = 1,    --活动类型-int 
  daily = 2,    --天数-int 
  type_1 = 3,    --物品1type-int 
  id_1 = 4,    --物品1id-int 
  size_1 = 5,    --物品1size-int 
  type_2 = 6,    --物品2type-int 
  id_2 = 7,    --物品2id-int 
  size_2 = 8,    --物品2size-int 
  type_3 = 9,    --物品3type-int 
  id_3 = 10,    --物品3id-int 
  size_3 = 11,    --物品3size-int 
  type_4 = 12,    --物品4type-int 
  id_4 = 13,    --物品4id-int 
  size_4 = 14,    --物品4size-int 
  type_5 = 15,    --物品5type-int 
  id_5 = 16,    --物品5id-int 
  size_5 = 17,    --物品5size-int 

}

-- data
local cake_daily = {
    _data = {
        [1] = {1,1,5,1,666,6,43,1,6,42,1,5,31,500,6,570,200,},
        [2] = {1,2,5,1,666,6,43,1,6,42,1,5,31,500,6,570,200,},
        [3] = {1,3,5,1,666,6,43,1,6,42,1,5,31,500,6,570,200,},
        [4] = {2,1,5,1,666,6,43,1,6,42,1,5,31,500,6,573,200,},
        [5] = {2,2,5,1,666,6,43,1,6,42,1,5,31,500,6,573,200,},
        [6] = {2,3,5,1,666,6,43,1,6,42,1,5,31,500,6,573,200,},
        [7] = {3,1,5,1,666,6,43,1,6,42,1,5,31,500,6,576,200,},
        [8] = {3,2,5,1,666,6,43,1,6,42,1,5,31,500,6,576,200,},
        [9] = {3,3,5,1,666,6,43,1,6,42,1,5,31,500,6,576,200,},
        [10] = {4,1,5,1,666,6,43,1,6,42,1,5,31,500,6,579,200,},
        [11] = {4,2,5,1,666,6,43,1,6,42,1,5,31,500,6,579,200,},
        [12] = {4,3,5,1,666,6,43,1,6,42,1,5,31,500,6,579,200,},
    }
}

-- index
local __index_type_daily = {
    ["1_1"] = 1,
    ["1_2"] = 2,
    ["1_3"] = 3,
    ["2_1"] = 4,
    ["2_2"] = 5,
    ["2_3"] = 6,
    ["3_1"] = 7,
    ["3_2"] = 8,
    ["3_3"] = 9,
    ["4_1"] = 10,
    ["4_2"] = 11,
    ["4_3"] = 12,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in cake_daily")
        return t._raw[__key_map[k]]
    end
}

-- 
function cake_daily.length()
    return #cake_daily._data
end

-- 
function cake_daily.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function cake_daily.indexOf(index)
    if index == nil or not cake_daily._data[index] then
        return nil
    end

    return setmetatable({_raw = cake_daily._data[index]}, mt)
end

--
function cake_daily.get(type,daily)
    
    local k = type .. '_' .. daily
    return cake_daily.indexOf(__index_type_daily[k])
        
end

--
function cake_daily.set(type,daily, tkey, nvalue)
    local record = cake_daily.get(type,daily)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function cake_daily.index()
    return __index_type_daily
end

return cake_daily