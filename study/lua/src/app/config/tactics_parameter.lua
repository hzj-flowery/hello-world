--tactics_parameter

-- key
local __key_map = {
  id = 1,    --序号-int 
  key = 2,    --参数名称-string 
  content = 3,    --参数内容-string 

}

-- data
local tactics_parameter = {
    _data = {
        [1] = {1,"tactics_2_unlock","6|2|500",},
        [2] = {2,"tactics_3_unlock","7|2|1000",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in tactics_parameter")
        return t._raw[__key_map[k]]
    end
}

-- 
function tactics_parameter.length()
    return #tactics_parameter._data
end

-- 
function tactics_parameter.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function tactics_parameter.indexOf(index)
    if index == nil or not tactics_parameter._data[index] then
        return nil
    end

    return setmetatable({_raw = tactics_parameter._data[index]}, mt)
end

--
function tactics_parameter.get(id)
    
    return tactics_parameter.indexOf(__index_id[id])
        
end

--
function tactics_parameter.set(id, key, value)
    local record = tactics_parameter.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function tactics_parameter.index()
    return __index_id
end

return tactics_parameter