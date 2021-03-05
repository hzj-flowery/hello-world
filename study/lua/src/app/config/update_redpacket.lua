--update_redpacket

-- key
local __key_map = {
  id = 1,    --红包id-int 
  name = 2,    --红包名称-string 

}

-- data
local update_redpacket = {
    _data = {
        [1] = {99,"狂欢大红包",},
        [2] = {1,"红色整将一口价",},
        [3] = {2,"红将碎片一口价",},
        [4] = {3,"红色神兵一口价",},
        [5] = {4,"红色万能神兵一口价",},
        [6] = {5,"春秋一口价",},
        [7] = {6,"战国一口价",},
        [8] = {7,"红锦囊一口价",},
        [9] = {8,"橙锦囊一口价",},
        [10] = {9,"择贤令一口价",},
        [11] = {10,"择贤举善令一口价",},
    }
}

-- index
local __index_id = {
    [1] = 2,
    [10] = 11,
    [2] = 3,
    [3] = 4,
    [4] = 5,
    [5] = 6,
    [6] = 7,
    [7] = 8,
    [8] = 9,
    [9] = 10,
    [99] = 1,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in update_redpacket")
        return t._raw[__key_map[k]]
    end
}

-- 
function update_redpacket.length()
    return #update_redpacket._data
end

-- 
function update_redpacket.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function update_redpacket.indexOf(index)
    if index == nil or not update_redpacket._data[index] then
        return nil
    end

    return setmetatable({_raw = update_redpacket._data[index]}, mt)
end

--
function update_redpacket.get(id)
    
    return update_redpacket.indexOf(__index_id[id])
        
end

--
function update_redpacket.set(id, key, value)
    local record = update_redpacket.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function update_redpacket.index()
    return __index_id
end

return update_redpacket