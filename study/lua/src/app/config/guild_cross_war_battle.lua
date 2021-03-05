--guild_cross_war_battle

-- key
local __key_map = {
  type = 1,    --鼓舞类型-int 
  atk_dmg = 2,    --攻方掉血-int 
  def_dmg = 3,    --守方掉血-int 

}

-- data
local guild_cross_war_battle = {
    _data = {
        [1] = {1,3,15,},
        [2] = {2,12,4,},
    }
}

-- index
local __index_type = {
    [1] = 1,
    [2] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in guild_cross_war_battle")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_cross_war_battle.length()
    return #guild_cross_war_battle._data
end

-- 
function guild_cross_war_battle.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_cross_war_battle.indexOf(index)
    if index == nil or not guild_cross_war_battle._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_cross_war_battle._data[index]}, mt)
end

--
function guild_cross_war_battle.get(type)
    
    return guild_cross_war_battle.indexOf(__index_type[type])
        
end

--
function guild_cross_war_battle.set(type, key, value)
    local record = guild_cross_war_battle.get(type)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_cross_war_battle.index()
    return __index_type
end

return guild_cross_war_battle