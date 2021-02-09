--parameter_redpacket_rain

-- key
local __key_map = {
  id = 1,    --序号-int 
  key = 2,    --参数名称-string 
  content = 3,    --参数内容-string 

}

-- data
local parameter_redpacket_rain = {
    _data = {
        [1] = {1,"entrance_show_time","1200",},
        [2] = {2,"open_countdown","3",},
        [3] = {3,"open_continue","30",},
        [4] = {4,"close_countdown","0",},
        [5] = {5,"redpacket_disappear","0.01",},
        [6] = {6,"type_propotion_big","1000|0|0",},
        [7] = {7,"type_propotion_small","1000|0|0",},
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
        assert(__key_map[k], "cannot find " .. k .. " in parameter_redpacket_rain")
        return t._raw[__key_map[k]]
    end
}

-- 
function parameter_redpacket_rain.length()
    return #parameter_redpacket_rain._data
end

-- 
function parameter_redpacket_rain.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function parameter_redpacket_rain.indexOf(index)
    if index == nil or not parameter_redpacket_rain._data[index] then
        return nil
    end

    return setmetatable({_raw = parameter_redpacket_rain._data[index]}, mt)
end

--
function parameter_redpacket_rain.get(id)
    
    return parameter_redpacket_rain.indexOf(__index_id[id])
        
end

--
function parameter_redpacket_rain.set(id, tkey, nvalue)
    local record = parameter_redpacket_rain.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function parameter_redpacket_rain.index()
    return __index_id
end

return parameter_redpacket_rain