--guild_base

-- key
local __key_map = {
  level = 1,    --军团等级-int 
  exp = 2,    --升级经验-int 
  max_member = 3,    --成员上限-int 
  wages_plus = 4,    --军团工资加成值(千分比）-int 

}

-- data
local guild_base = {
    _data = {
        [1] = {1,20000,40,1000,},
        [2] = {2,40000,40,1005,},
        [3] = {3,60000,40,1015,},
        [4] = {4,100000,40,1030,},
        [5] = {5,160000,40,1050,},
        [6] = {6,260000,40,1075,},
        [7] = {7,420000,40,1105,},
        [8] = {8,680000,40,1140,},
        [9] = {9,1100000,40,1180,},
        [10] = {10,1780000,40,1225,},
    }
}

-- index
local __index_level = {
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_base")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_base.length()
    return #guild_base._data
end

-- 
function guild_base.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_base.indexOf(index)
    if index == nil or not guild_base._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_base._data[index]}, mt)
end

--
function guild_base.get(level)
    
    return guild_base.indexOf(__index_level[level])
        
end

--
function guild_base.set(level, key, value)
    local record = guild_base.get(level)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_base.index()
    return __index_level
end

return guild_base