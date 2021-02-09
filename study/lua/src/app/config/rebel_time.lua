--rebel_time

-- key
local __key_map = {
  id = 1,    --时间段id-int 
  start_time = 2,    --开始时间-int 
  over_time = 3,    --结束时间-int 
  cost = 4,    --消耗-int 

}

-- data
local rebel_time = {
    _data = {
        [1] = {1,43200,50400,1,},
        [2] = {2,64800,72000,1,},
        [3] = {3,79200,86400,1,},
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
        assert(__key_map[k], "cannot find " .. k .. " in rebel_time")
        return t._raw[__key_map[k]]
    end
}

-- 
function rebel_time.length()
    return #rebel_time._data
end

-- 
function rebel_time.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function rebel_time.indexOf(index)
    if index == nil or not rebel_time._data[index] then
        return nil
    end

    return setmetatable({_raw = rebel_time._data[index]}, mt)
end

--
function rebel_time.get(id)
    
    return rebel_time.indexOf(__index_id[id])
        
end

--
function rebel_time.set(id, key, value)
    local record = rebel_time.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function rebel_time.index()
    return __index_id
end

return rebel_time