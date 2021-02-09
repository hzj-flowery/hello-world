--avatar_gold_card

-- key
local __key_map = {
  id = 1,    --排序-int 
  country = 2,    --阵营-int 
  type = 3,    --类型-int 
  value = 4,    --类型值-int 

}

-- data
local avatar_gold_card = {
    _data = {
        [1] = {1,1,9,1150,},
        [2] = {2,1,9,1151,},
        [3] = {3,1,9,1152,},
        [4] = {4,1,9,1153,},
        [5] = {5,2,9,1250,},
        [6] = {6,2,9,1251,},
        [7] = {7,2,9,1252,},
        [8] = {8,2,9,1253,},
        [9] = {9,3,9,1350,},
        [10] = {10,3,9,1351,},
        [11] = {11,3,9,1352,},
        [12] = {12,3,9,1353,},
        [13] = {13,4,9,1450,},
        [14] = {14,4,9,1451,},
        [15] = {15,4,9,1452,},
        [16] = {16,4,9,1453,},
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
        assert(__key_map[k], "cannot find " .. k .. " in avatar_gold_card")
        return t._raw[__key_map[k]]
    end
}

-- 
function avatar_gold_card.length()
    return #avatar_gold_card._data
end

-- 
function avatar_gold_card.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function avatar_gold_card.indexOf(index)
    if index == nil or not avatar_gold_card._data[index] then
        return nil
    end

    return setmetatable({_raw = avatar_gold_card._data[index]}, mt)
end

--
function avatar_gold_card.get(id)
    
    return avatar_gold_card.indexOf(__index_id[id])
        
end

--
function avatar_gold_card.set(id, tkey, nvalue)
    local record = avatar_gold_card.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function avatar_gold_card.index()
    return __index_id
end

return avatar_gold_card