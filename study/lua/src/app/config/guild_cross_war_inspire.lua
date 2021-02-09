--guild_cross_war_inspire

-- key
local __key_map = {
  id = 1,    --索引id-int 
  type = 2,    --鼓舞类型-int 
  level = 3,    --鼓舞等级-int 
  value = 4,    --攻击/防御加成值-int 
  cost = 5,    --鼓舞消耗-int 

}

-- data
local guild_cross_war_inspire = {
    _data = {
        [1] = {1,1,1,1,2000,},
        [2] = {2,1,2,2,2000,},
        [3] = {3,1,3,3,2000,},
        [4] = {101,2,1,1,2000,},
        [5] = {102,2,2,2,2000,},
        [6] = {103,2,3,3,2000,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [101] = 4,
    [102] = 5,
    [103] = 6,
    [2] = 2,
    [3] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in guild_cross_war_inspire")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_cross_war_inspire.length()
    return #guild_cross_war_inspire._data
end

-- 
function guild_cross_war_inspire.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_cross_war_inspire.indexOf(index)
    if index == nil or not guild_cross_war_inspire._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_cross_war_inspire._data[index]}, mt)
end

--
function guild_cross_war_inspire.get(id)
    
    return guild_cross_war_inspire.indexOf(__index_id[id])
        
end

--
function guild_cross_war_inspire.set(id, key, value)
    local record = guild_cross_war_inspire.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_cross_war_inspire.index()
    return __index_id
end

return guild_cross_war_inspire