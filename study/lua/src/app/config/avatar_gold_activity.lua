--avatar_gold_activity

-- key
local __key_map = {
  id = 1,    --排序-int 
  country = 2,    --变身卡阵营-int 
  type = 3,    --类型-int 
  value = 4,    --类型值-int 
  size = 5,    --数量-int 

}

-- data
local avatar_gold_activity = {
    _data = {
        [1] = {1,1,9,0,1,},
        [2] = {2,2,9,0,1,},
        [3] = {3,3,9,0,1,},
        [4] = {4,4,9,0,1,},
        [5] = {5,5,9,0,1,},
        [6] = {6,0,6,92,1,},
        [7] = {7,0,6,93,1,},
        [8] = {8,0,6,703,1,},
        [9] = {9,0,6,704,1,},
        [10] = {10,0,6,721,1,},
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
        assert(__key_map[k], "cannot find " .. k .. " in avatar_gold_activity")
        return t._raw[__key_map[k]]
    end
}

-- 
function avatar_gold_activity.length()
    return #avatar_gold_activity._data
end

-- 
function avatar_gold_activity.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function avatar_gold_activity.indexOf(index)
    if index == nil or not avatar_gold_activity._data[index] then
        return nil
    end

    return setmetatable({_raw = avatar_gold_activity._data[index]}, mt)
end

--
function avatar_gold_activity.get(id)
    
    return avatar_gold_activity.indexOf(__index_id[id])
        
end

--
function avatar_gold_activity.set(id, tkey, nvalue)
    local record = avatar_gold_activity.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function avatar_gold_activity.index()
    return __index_id
end

return avatar_gold_activity