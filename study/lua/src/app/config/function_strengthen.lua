--function_strengthen

-- key
local __key_map = {
  id = 1,    --id-int 
  level_min = 2,    --等级上限-int 
  level_max = 3,    --等级下限-int 
  function_1 = 4,    --功能1-int 
  function_2 = 5,    --功能2-int 
  function_3 = 6,    --功能3-int 
  function_4 = 7,    --功能4-int 

}

-- data
local function_strengthen = {
    _data = {
        [1] = {1,1,10,11,130,131,132,},
        [2] = {2,11,20,11,130,131,132,},
        [3] = {3,21,30,11,130,131,132,},
        [4] = {4,31,40,11,130,131,132,},
        [5] = {5,41,50,11,130,131,132,},
        [6] = {6,51,60,11,130,131,132,},
        [7] = {7,61,70,11,130,131,132,},
        [8] = {8,71,80,11,130,131,132,},
        [9] = {9,81,90,11,130,131,132,},
        [10] = {10,91,100,11,130,131,132,},
        [11] = {11,101,999,11,130,131,132,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
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
        assert(__key_map[k], "cannot find " .. k .. " in function_strengthen")
        return t._raw[__key_map[k]]
    end
}

-- 
function function_strengthen.length()
    return #function_strengthen._data
end

-- 
function function_strengthen.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function function_strengthen.indexOf(index)
    if index == nil or not function_strengthen._data[index] then
        return nil
    end

    return setmetatable({_raw = function_strengthen._data[index]}, mt)
end

--
function function_strengthen.get(id)
    
    return function_strengthen.indexOf(__index_id[id])
        
end

--
function function_strengthen.set(id, key, value)
    local record = function_strengthen.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function function_strengthen.index()
    return __index_id
end

return function_strengthen