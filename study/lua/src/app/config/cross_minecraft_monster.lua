--cross_minecraft_monster

-- key
local __key_map = {
  id = 1,    --id-int 
  monster_team_id = 2,    --怪物组id-int 
  hp_parameter = 3,    --血量系数-int 
  time_limit = 4,    --击杀时间限制（秒）-int 

}

-- data
local cross_minecraft_monster = {
    _data = {
        [1] = {1,5500001,1,600,},
        [2] = {2,5500002,1,600,},
        [3] = {3,5500003,1,600,},
        [4] = {4,5500004,1,600,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in cross_minecraft_monster")
        return t._raw[__key_map[k]]
    end
}

-- 
function cross_minecraft_monster.length()
    return #cross_minecraft_monster._data
end

-- 
function cross_minecraft_monster.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function cross_minecraft_monster.indexOf(index)
    if index == nil or not cross_minecraft_monster._data[index] then
        return nil
    end

    return setmetatable({_raw = cross_minecraft_monster._data[index]}, mt)
end

--
function cross_minecraft_monster.get(id)
    
    return cross_minecraft_monster.indexOf(__index_id[id])
        
end

--
function cross_minecraft_monster.set(id, tkey, nvalue)
    local record = cross_minecraft_monster.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function cross_minecraft_monster.index()
    return __index_id
end

return cross_minecraft_monster