--return_time

-- key
local __key_map = {
  id = 1,    --编号-int 
  day_min = 2,    --天数下限-int 
  day_max = 3,    --天数上限-int 
  day_last = 4,    --持续时间-int 

}

-- data
local return_time = {
    _data = {
        [1] = {1,14,28,7,},
        [2] = {2,29,42,7,},
        [3] = {3,43,9999,7,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in return_time")
        return t._raw[__key_map[k]]
    end
}

-- 
function return_time.length()
    return #return_time._data
end

-- 
function return_time.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function return_time.indexOf(index)
    if index == nil or not return_time._data[index] then
        return nil
    end

    return setmetatable({_raw = return_time._data[index]}, mt)
end

--
function return_time.get(id)
    
    return return_time.indexOf(__index_id[id])
        
end

--
function return_time.set(id, tkey, nvalue)
    local record = return_time.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function return_time.index()
    return __index_id
end

return return_time