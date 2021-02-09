--sgs_linkage_2

-- key
local __key_map = {
  id = 1,    --id-int 
  type = 2,    --类型-int 
  value = 3,    --类型值-int 
  mission_description = 4,    --说明-string 
  reward_type = 5,    --奖励类型-int 
  reward_value = 6,    --奖励类型值-int 
  reward_size = 7,    --奖励数量-int 

}

-- data
local sgs_linkage_2 = {
    _data = {
        [1] = {1,1,15,"升到#num#级",5,2,10000,},
        [2] = {2,1,31,"升到#num#级",6,63,10,},
        [3] = {3,1,50,"升到#num#级",6,73,20,},
        [4] = {4,2,1,"任意充值",6,3,100,},
        [5] = {5,2,30,"累充#num#元",6,7,1,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in sgs_linkage_2")
        return t._raw[__key_map[k]]
    end
}

-- 
function sgs_linkage_2.length()
    return #sgs_linkage_2._data
end

-- 
function sgs_linkage_2.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function sgs_linkage_2.indexOf(index)
    if index == nil or not sgs_linkage_2._data[index] then
        return nil
    end

    return setmetatable({_raw = sgs_linkage_2._data[index]}, mt)
end

--
function sgs_linkage_2.get(id)
    
    return sgs_linkage_2.indexOf(__index_id[id])
        
end

--
function sgs_linkage_2.set(id, key, value)
    local record = sgs_linkage_2.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function sgs_linkage_2.index()
    return __index_id
end

return sgs_linkage_2