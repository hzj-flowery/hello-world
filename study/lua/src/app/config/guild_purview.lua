--guild_purview

-- key
local __key_map = {
  id = 1,    --职位-int 
  name = 2,    --职称-string 
  purview = 3,    --权限-string 

}

-- data
local guild_purview = {
    _data = {
        [1] = {1,"团长","1|3|4|5|6|7|8|10|11|12|13|14|15|16|17",},
        [2] = {2,"副团长","2|5|6|7|8|9|11|12|15|17",},
        [3] = {3,"长老","2|6|7|9|17",},
        [4] = {4,"成员","2|9",},
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_purview")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_purview.length()
    return #guild_purview._data
end

-- 
function guild_purview.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_purview.indexOf(index)
    if index == nil or not guild_purview._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_purview._data[index]}, mt)
end

--
function guild_purview.get(id)
    
    return guild_purview.indexOf(__index_id[id])
        
end

--
function guild_purview.set(id, tkey, nvalue)
    local record = guild_purview.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function guild_purview.index()
    return __index_id
end

return guild_purview