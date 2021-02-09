--tree_preview

-- key
local __key_map = {
  id = 1,    --神树id-int 
  day_min = 2,    --开服天数_min-int 
  day_max = 3,    --开服天数_max-int 
  condition_1 = 4,    --条件1-string 
  condition_2 = 5,    --条件2-string 
  condition_3 = 6,    --条件3-string 
  condition_4 = 7,    --条件4-string 
  condition_5 = 8,    --条件5-string 
  condition_6 = 9,    --条件6-string 

}

-- data
local tree_preview = {
    _data = {
        [1] = {3,14,99999,"1|1|2","","","","","",},
        [2] = {4,14,99999,"1|2|3","2|1|2","","","","",},
        [3] = {5,14,99999,"1|3|4","2|2|3","3|1|2","","","",},
        [4] = {6,14,99999,"1|4|5","2|3|5","3|2|5","5|1|3","","",},
        [5] = {7,14,99999,"1|5|6","2|5|6","3|5|6","5|3|5","6|1|4","",},
        [6] = {8,14,99999,"1|6|7","2|6|7","3|6|7","5|5|7","6|4|7","4|1|7",},
        [7] = {9,85,99999,"1|7|8","2|7|8","3|7|8","5|7|8","6|7|8","4|7|8",},
        [8] = {10,147,99999,"1|8|9","2|8|9","3|8|9","5|8|9","6|8|9","4|8|9",},
        [9] = {11,147,99999,"1|9|10","2|9|10","3|9|10","5|9|10","6|9|10","4|9|10",},
        [10] = {12,300,99999,"1|10|11","2|10|11","3|10|11","5|10|11","6|10|11","4|10|11",},
        [11] = {13,300,99999,"1|11|12","2|11|12","3|11|12","5|11|12","6|11|12","4|11|12",},
    }
}

-- index
local __index_id = {
    [10] = 8,
    [11] = 9,
    [12] = 10,
    [13] = 11,
    [3] = 1,
    [4] = 2,
    [5] = 3,
    [6] = 4,
    [7] = 5,
    [8] = 6,
    [9] = 7,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in tree_preview")
        return t._raw[__key_map[k]]
    end
}

-- 
function tree_preview.length()
    return #tree_preview._data
end

-- 
function tree_preview.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function tree_preview.indexOf(index)
    if index == nil or not tree_preview._data[index] then
        return nil
    end

    return setmetatable({_raw = tree_preview._data[index]}, mt)
end

--
function tree_preview.get(id)
    
    return tree_preview.indexOf(__index_id[id])
        
end

--
function tree_preview.set(id, tkey, nvalue)
    local record = tree_preview.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function tree_preview.index()
    return __index_id
end

return tree_preview