--answer_award

-- key
local __key_map = {
  id = 1,    --回答-int 
  right_type1 = 2,    --答对奖励类型1-int 
  right_resource1 = 3,    --答对奖励资源1-int 
  right_size1 = 4,    --答对奖励数量1-int 
  right_type2 = 5,    --答对奖励类型2-int 
  right_resource2 = 6,    --答对奖励资源2-int 
  right_size2 = 7,    --答对奖励数量2-int 

}

-- data
local answer_award = {
    _data = {
        [1] = {1,5,13,200,5,18,20,},
        [2] = {2,5,13,100,5,18,10,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in answer_award")
        return t._raw[__key_map[k]]
    end
}

-- 
function answer_award.length()
    return #answer_award._data
end

-- 
function answer_award.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function answer_award.indexOf(index)
    if index == nil or not answer_award._data[index] then
        return nil
    end

    return setmetatable({_raw = answer_award._data[index]}, mt)
end

--
function answer_award.get(id)
    
    return answer_award.indexOf(__index_id[id])
        
end

--
function answer_award.set(id, key, value)
    local record = answer_award.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function answer_award.index()
    return __index_id
end

return answer_award