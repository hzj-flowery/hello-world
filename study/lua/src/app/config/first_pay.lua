--first_pay

-- key
local __key_map = {
  id = 1,    --编号-int 
  charge = 2,    --充值额度-int 
  type_1 = 3,    --奖励类型1-int 
  value_1 = 4,    --类型值1-int 
  size_1 = 5,    --数量1-int 
  type_2 = 6,    --奖励类型2-int 
  value_2 = 7,    --类型值2-int 
  size_2 = 8,    --数量2-int 
  type_3 = 9,    --奖励类型3-int 
  value_3 = 10,    --类型值3-int 
  size_3 = 11,    --数量3-int 

}

-- data
local first_pay = {
    _data = {
        [1] = {1,1,2,305,1,6,3,288,5,1,288,},
        [2] = {2,98,2,406,1,6,21,10,6,20,10,},
        [3] = {3,298,6,105,1,6,109,1,5,1,588,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in first_pay")
        return t._raw[__key_map[k]]
    end
}

-- 
function first_pay.length()
    return #first_pay._data
end

-- 
function first_pay.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function first_pay.indexOf(index)
    if index == nil or not first_pay._data[index] then
        return nil
    end

    return setmetatable({_raw = first_pay._data[index]}, mt)
end

--
function first_pay.get(id)
    
    return first_pay.indexOf(__index_id[id])
        
end

--
function first_pay.set(id, key, value)
    local record = first_pay.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function first_pay.index()
    return __index_id
end

return first_pay