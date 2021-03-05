--guild_build

-- key
local __key_map = {
  id = 1,    --序号-int 
  key = 2,    --参数名称-string 
  time = 3,    --每日建设次数-int 
  legion_capital = 4,    --获得军团资金-int 
  contribution = 5,    --获得个人贡献-int 
  need_people = 6,    --需要人数-int 

}

-- data
local guild_build = {
    _data = {
        [1] = {1,"single_build",1,100,200,1,},
        [2] = {2,"cooperate_build",1,500,1000,5,},
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_build")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_build.length()
    return #guild_build._data
end

-- 
function guild_build.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_build.indexOf(index)
    if index == nil or not guild_build._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_build._data[index]}, mt)
end

--
function guild_build.get(id)
    
    return guild_build.indexOf(__index_id[id])
        
end

--
function guild_build.set(id, key, value)
    local record = guild_build.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_build.index()
    return __index_id
end

return guild_build