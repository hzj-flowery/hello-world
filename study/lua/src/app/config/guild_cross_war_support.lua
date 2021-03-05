--guild_cross_war_support

-- key
local __key_map = {
  level = 1,    --支援等级-int 
  support = 2,    --升到下级需要支援人数-int 
  soldiers = 3,    --兵力值-int 

}

-- data
local guild_cross_war_support = {
    _data = {
        [1] = {1,50,100,},
        [2] = {2,100,105,},
        [3] = {3,200,110,},
        [4] = {4,99999,120,},
    }
}

-- index
local __index_level = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in guild_cross_war_support")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_cross_war_support.length()
    return #guild_cross_war_support._data
end

-- 
function guild_cross_war_support.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_cross_war_support.indexOf(index)
    if index == nil or not guild_cross_war_support._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_cross_war_support._data[index]}, mt)
end

--
function guild_cross_war_support.get(level)
    
    return guild_cross_war_support.indexOf(__index_level[level])
        
end

--
function guild_cross_war_support.set(level, key, value)
    local record = guild_cross_war_support.get(level)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_cross_war_support.index()
    return __index_level
end

return guild_cross_war_support