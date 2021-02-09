--return_lv

-- key
local __key_map = {
  id = 1,    --序列-int 
  lv_gap = 2,    --参考等级-int 
  lvup_price = 3,    --升级价格-int 
  vip_pay_id = 4,    --价格id-int 

}

-- data
local return_lv = {
    _data = {
        [1] = {1,5,30,10126,},
        [2] = {2,10,98,10127,},
        [3] = {3,20,198,10128,},
        [4] = {4,999,648,10129,},
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
        assert(__key_map[k], "cannot find " .. k .. " in return_lv")
        return t._raw[__key_map[k]]
    end
}

-- 
function return_lv.length()
    return #return_lv._data
end

-- 
function return_lv.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function return_lv.indexOf(index)
    if index == nil or not return_lv._data[index] then
        return nil
    end

    return setmetatable({_raw = return_lv._data[index]}, mt)
end

--
function return_lv.get(id)
    
    return return_lv.indexOf(__index_id[id])
        
end

--
function return_lv.set(id, tkey, nvalue)
    local record = return_lv.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function return_lv.index()
    return __index_id
end

return return_lv