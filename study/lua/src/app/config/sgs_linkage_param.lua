--sgs_linkage_param

-- key
local __key_map = {
  id = 1,    --序号-int 
  direction = 2,    --类型-string 
  key = 3,    --参数名称-string 
  content = 4,    --参数内容-int 

}

-- data
local sgs_linkage_param = {
    _data = {
        [1] = {1,"ss2mjz","sgs_linkage_time",999,},
        [2] = {2,"ss2mjz","sgs_linkage_overtime",10,},
        [3] = {3,"mjz2ss","sgs_linkage_time",999,},
        [4] = {4,"mjz2ss","sgs_linkage_overtime",8,},
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
        assert(__key_map[k], "cannot find " .. k .. " in sgs_linkage_param")
        return t._raw[__key_map[k]]
    end
}

-- 
function sgs_linkage_param.length()
    return #sgs_linkage_param._data
end

-- 
function sgs_linkage_param.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function sgs_linkage_param.indexOf(index)
    if index == nil or not sgs_linkage_param._data[index] then
        return nil
    end

    return setmetatable({_raw = sgs_linkage_param._data[index]}, mt)
end

--
function sgs_linkage_param.get(id)
    
    return sgs_linkage_param.indexOf(__index_id[id])
        
end

--
function sgs_linkage_param.set(id, key, value)
    local record = sgs_linkage_param.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function sgs_linkage_param.index()
    return __index_id
end

return sgs_linkage_param