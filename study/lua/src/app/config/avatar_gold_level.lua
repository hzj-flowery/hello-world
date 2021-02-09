--avatar_gold_level

-- key
local __key_map = {
  level = 1,    --飞升等级-int 
  cost = 2,    --飞升到此等级消耗变身卡数量-int 
  cost_type = 3,    --消耗类型，1任意卡，2同阵营卡-int 
  gold_level = 4,    --对应金将涅槃等级-int 
  red_level = 5,    --对应红升金突破等级-int 

}

-- data
local avatar_gold_level = {
    _data = {
        [1] = {0,0,0,0,5,},
        [2] = {1,1,1,1,8,},
        [3] = {2,2,1,3,10,},
        [4] = {3,3,2,5,12,},
    }
}

-- index
local __index_level = {
    [0] = 1,
    [1] = 2,
    [2] = 3,
    [3] = 4,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in avatar_gold_level")
        return t._raw[__key_map[k]]
    end
}

-- 
function avatar_gold_level.length()
    return #avatar_gold_level._data
end

-- 
function avatar_gold_level.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function avatar_gold_level.indexOf(index)
    if index == nil or not avatar_gold_level._data[index] then
        return nil
    end

    return setmetatable({_raw = avatar_gold_level._data[index]}, mt)
end

--
function avatar_gold_level.get(level)
    
    return avatar_gold_level.indexOf(__index_level[level])
        
end

--
function avatar_gold_level.set(level, tkey, nvalue)
    local record = avatar_gold_level.get(level)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function avatar_gold_level.index()
    return __index_level
end

return avatar_gold_level