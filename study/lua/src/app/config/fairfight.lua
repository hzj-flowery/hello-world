--fairfight

-- key
local __key_map = {
  day = 1,    --开服天数-int 
  rank_audition = 2,    --海选赛橙将突破等级-int 
  rank_32 = 3,    --32强橙将突破等级-int 
  rank_16 = 4,    --16强橙将突破等级-int 
  rank_8 = 5,    --8强橙将突破等级-int 
  rank_4 = 6,    --4强橙将突破等级-int 
  rank_final = 7,    --决赛橙将突破等级-int 
  pet = 8,    --是否可用神兽-int 
  red = 9,    --可上阵红将数-int 

}

-- data
local fairfight = {
    _data = {
        [1] = {8,5,5,5,8,8,8,0,0,},
        [2] = {16,8,8,8,10,10,10,1,1,},
    }
}

-- index
local __index_day = {
    [16] = 2,
    [8] = 1,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in fairfight")
        return t._raw[__key_map[k]]
    end
}

-- 
function fairfight.length()
    return #fairfight._data
end

-- 
function fairfight.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function fairfight.indexOf(index)
    if index == nil or not fairfight._data[index] then
        return nil
    end

    return setmetatable({_raw = fairfight._data[index]}, mt)
end

--
function fairfight.get(day)
    
    return fairfight.indexOf(__index_day[day])
        
end

--
function fairfight.set(day, key, value)
    local record = fairfight.get(day)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function fairfight.index()
    return __index_day
end

return fairfight