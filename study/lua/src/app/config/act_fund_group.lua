--act_fund_group

-- key
local __key_map = {
  group_id = 1,    --组id-int 
  show_level = 2,    --开放等级-int 
  good_id = 3,    --商品id-int 
  txt = 4,    --说明文字-string 

}

-- data
local act_fund_group = {
    _data = {
        [1] = {1,1,10027,"3000",},
        [2] = {2,1,10028,"5000",},
        [3] = {3,1,10029,"9800",},
        [4] = {4,1,10030,"9800",},
        [5] = {5,1,10031,"9800",},
        [6] = {6,1,10032,"9800",},
        [7] = {7,1,10047,"9800",},
        [8] = {8,1,10048,"10800",},
        [9] = {9,1,10049,"10800",},
        [10] = {10,1,10050,"10800",},
        [11] = {11,1,10051,"10800",},
        [12] = {12,1,10060,"10800",},
        [13] = {13,1,10061,"10800",},
        [14] = {14,1,10062,"10800",},
        [15] = {15,1,10063,"10800",},
        [16] = {16,1,10064,"10800",},
        [17] = {17,1,10065,"10800",},
    }
}

-- index
local __index_group_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
    [13] = 13,
    [14] = 14,
    [15] = 15,
    [16] = 16,
    [17] = 17,
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
        assert(__key_map[k], "cannot find " .. k .. " in act_fund_group")
        return t._raw[__key_map[k]]
    end
}

-- 
function act_fund_group.length()
    return #act_fund_group._data
end

-- 
function act_fund_group.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function act_fund_group.indexOf(index)
    if index == nil or not act_fund_group._data[index] then
        return nil
    end

    return setmetatable({_raw = act_fund_group._data[index]}, mt)
end

--
function act_fund_group.get(group_id)
    
    return act_fund_group.indexOf(__index_group_id[group_id])
        
end

--
function act_fund_group.set(group_id, key, value)
    local record = act_fund_group.get(group_id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function act_fund_group.index()
    return __index_group_id
end

return act_fund_group