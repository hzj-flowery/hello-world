--honor_title

-- key
local __key_map = {
  id = 1,    --序号-int 
  state = 2,    --国家-int 
  limit_level = 3,    --限制等级-int 
  day = 4,    --开服天数-int 
  resource = 5,    --资源-string 
  rank = 6,    --排序优先级-int 
  time_type = 7,    --时间类型-int 
  time_value = 8,    --时间类型值-int 

}

-- data
local honor_title = {
    _data = {
        [1] = {1,0,40,3,"img_title01",1,1,1,},
        [2] = {2,1,50,6,"img_title02a",2,1,7,},
        [3] = {3,2,50,6,"img_title02b",2,1,7,},
        [4] = {4,3,50,6,"img_title02c",2,1,7,},
        [5] = {5,4,50,6,"img_title02d",2,1,7,},
        [6] = {6,0,1,0,"img_title03",99,1,999,},
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

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in honor_title")
        return t._raw[__key_map[k]]
    end
}

-- 
function honor_title.length()
    return #honor_title._data
end

-- 
function honor_title.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function honor_title.indexOf(index)
    if index == nil or not honor_title._data[index] then
        return nil
    end

    return setmetatable({_raw = honor_title._data[index]}, mt)
end

--
function honor_title.get(id)
    
    return honor_title.indexOf(__index_id[id])
        
end

--
function honor_title.set(id, key, value)
    local record = honor_title.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function honor_title.index()
    return __index_id
end

return honor_title