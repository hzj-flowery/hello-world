--team_info

-- key
local __key_map = {
  id = 1,    --序号-int 
  function_id = 2,    --活动类型(function_id)-int 
  target = 3,    --具体目标-string 
  refuse_time = 4,    --拒绝组队邀请时间-int 
  agree_time = 5,    --同意转让队长时间-int 
  refuse_join_time = 6,    --拒绝入队申请时间-int 

}

-- data
local team_info = {
    _data = {
        [1] = {1,860,"1|2|3",10,10,60,},
    }
}

-- index
local __index_id = {
    [1] = 1,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in team_info")
        return t._raw[__key_map[k]]
    end
}

-- 
function team_info.length()
    return #team_info._data
end

-- 
function team_info.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function team_info.indexOf(index)
    if index == nil or not team_info._data[index] then
        return nil
    end

    return setmetatable({_raw = team_info._data[index]}, mt)
end

--
function team_info.get(id)
    
    return team_info.indexOf(__index_id[id])
        
end

--
function team_info.set(id, key, value)
    local record = team_info.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function team_info.index()
    return __index_id
end

return team_info