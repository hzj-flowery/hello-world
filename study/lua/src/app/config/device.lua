--device

-- key
local __key_map = {
  key = 1,    --型号描述-string 
  offset = 2,    --偏移量-int 
  mask = 3,    --遮罩-string 

}

-- data
local device = {
    _data = {
        [1] = {"iPhone10,3",50,"iphonex.png",},
        [2] = {"iPhone10,6",50,"iphonex.png",},
    }
}

-- index
local __index_key = {
    ["iPhone10,3"] = 1,
    ["iPhone10,6"] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in device")
        return t._raw[__key_map[k]]
    end
}

-- 
function device.length()
    return #device._data
end

-- 
function device.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function device.indexOf(index)
    if index == nil or not device._data[index] then
        return nil
    end

    return setmetatable({_raw = device._data[index]}, mt)
end

--
function device.get(key)
    
    return device.indexOf(__index_key[key])
        
end

--
function device.set(key, key, value)
    local record = device.get(key)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function device.index()
    return __index_key
end

return device