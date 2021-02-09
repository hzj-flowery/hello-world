--guild_war_bg

-- key
local __key_map = {
  battlefield_type = 1,    --对应战场类型-int 
  pic_name = 2,    --背景名称-string 
  infeed_num = 3,    --横向图片数量-int 
  endwise_num = 4,    --纵向图片数量-int 

}

-- data
local guild_war_bg = {
    _data = {
        [1] = {1,"guildwar_bg_1",4,1,},
        [2] = {2,"guildwar_bg_2",4,1,},
        [3] = {3,"guildwar_bg_3",4,2,},
    }
}

-- index
local __index_battlefield_type = {
    [1] = 1,
    [2] = 2,
    [3] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in guild_war_bg")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_war_bg.length()
    return #guild_war_bg._data
end

-- 
function guild_war_bg.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_war_bg.indexOf(index)
    if index == nil or not guild_war_bg._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_war_bg._data[index]}, mt)
end

--
function guild_war_bg.get(battlefield_type)
    
    return guild_war_bg.indexOf(__index_battlefield_type[battlefield_type])
        
end

--
function guild_war_bg.set(battlefield_type, key, value)
    local record = guild_war_bg.get(battlefield_type)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_war_bg.index()
    return __index_battlefield_type
end

return guild_war_bg