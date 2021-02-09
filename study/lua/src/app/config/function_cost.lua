--function_cost

-- key
local __key_map = {
  id = 1,    --功能名称-int 
  name = 2,    --功能名称-string 
  free_count = 3,    --免费次数-int 
  buy_add_count = 4,    --每次购买增加次数-int 
  vip_function_id = 5,    --购买次数与vip的关系-int 
  price_id = 6,    --购买价格与次数的关系-int 

}

-- data
local function_cost = {
    _data = {
        [1] = {10001,"竞技场挑战次数",10,5,10001,10001,},
        [2] = {10002,"军团援助次数",10,1,10002,10002,},
        [3] = {10003,"金将招募",5,1,10003,10003,},
    }
}

-- index
local __index_id = {
    [10001] = 1,
    [10002] = 2,
    [10003] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in function_cost")
        return t._raw[__key_map[k]]
    end
}

-- 
function function_cost.length()
    return #function_cost._data
end

-- 
function function_cost.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function function_cost.indexOf(index)
    if index == nil or not function_cost._data[index] then
        return nil
    end

    return setmetatable({_raw = function_cost._data[index]}, mt)
end

--
function function_cost.get(id)
    
    return function_cost.indexOf(__index_id[id])
        
end

--
function function_cost.set(id, key, value)
    local record = function_cost.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function function_cost.index()
    return __index_id
end

return function_cost