--guild_flag

-- key
local __key_map = {
  id = 1,    --颜色id-int 
  color = 2,    --旗帜颜色-string 

}

-- data
local guild_flag = {
    _data = {
        [1] = {1,"img_guild_huoyue_b02",},
        [2] = {2,"img_guild_huoyue_b03",},
        [3] = {3,"img_guild_huoyue_b04",},
        [4] = {4,"img_guild_huoyue_b05",},
        [5] = {5,"img_guild_huoyue_b06",},
        [6] = {6,"img_guild_huoyue_b02",},
        [7] = {7,"img_guild_huoyue_b03",},
        [8] = {8,"img_guild_huoyue_b04",},
        [9] = {9,"img_guild_huoyue_b05",},
        [10] = {10,"img_guild_huoyue_b06",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_flag")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_flag.length()
    return #guild_flag._data
end

-- 
function guild_flag.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_flag.indexOf(index)
    if index == nil or not guild_flag._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_flag._data[index]}, mt)
end

--
function guild_flag.get(id)
    
    return guild_flag.indexOf(__index_id[id])
        
end

--
function guild_flag.set(id, key, value)
    local record = guild_flag.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_flag.index()
    return __index_id
end

return guild_flag