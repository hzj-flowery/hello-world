--recover

-- key
local __key_map = {
  id = 1,    --数值ID-int 
  name = 2,    --数值名称-string 
  recover_num = 3,    --单次恢复数量-int 
  recover_time = 4,    --恢复时间间隔-int 
  time_limit = 5,    --自然恢复上限-int 
  client_limit = 6,    --客户端上限-int 
  max_limit = 7,    --最大上限-int 

}

-- data
local recover = {
    _data = {
        [1] = {3,"体力",1,360,100,500,999,},
        [2] = {4,"精力",1,1800,30,200,999,},
        [3] = {11,"围剿次数",1,3600,10,100,999,},
        [4] = {12,"挑战次数",1,3600,5,5,5,},
        [5] = {22,"粮草",1,720,200,500,9999,},
        [6] = {23,"攻击次数",1,3600,20,500,999,},
        [7] = {34,"移动次数",1,1800,40,200,999,},
    }
}

-- index
local __index_id = {
    [11] = 3,
    [12] = 4,
    [22] = 5,
    [23] = 6,
    [3] = 1,
    [34] = 7,
    [4] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in recover")
        return t._raw[__key_map[k]]
    end
}

-- 
function recover.length()
    return #recover._data
end

-- 
function recover.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function recover.indexOf(index)
    if index == nil or not recover._data[index] then
        return nil
    end

    return setmetatable({_raw = recover._data[index]}, mt)
end

--
function recover.get(id)
    
    return recover.indexOf(__index_id[id])
        
end

--
function recover.set(id, tkey, nvalue)
    local record = recover.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function recover.index()
    return __index_id
end

return recover