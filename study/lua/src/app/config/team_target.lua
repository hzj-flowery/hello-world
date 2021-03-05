--team_target

-- key
local __key_map = {
  target = 1,    --具体目标-int 
  name = 2,    --名称-string 
  function_id = 3,    --function_id-int 
  level_min = 4,    --等级下限-int 
  level_max = 5,    --等级上限-int 
  people_number = 6,    --组队人数-int 
  agree_activity_time = 7,    --同意加入活动时间-int 

}

-- data
local team_target = {
    _data = {
        [1] = {1,"先秦皇陵·上",861,80,120,3,10,},
        [2] = {2,"先秦皇陵·中",862,80,120,3,10,},
        [3] = {3,"先秦皇陵·下",863,80,120,3,10,},
    }
}

-- index
local __index_target = {
    [1] = 1,
    [2] = 2,
    [3] = 3,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in team_target")
        return t._raw[__key_map[k]]
    end
}

-- 
function team_target.length()
    return #team_target._data
end

-- 
function team_target.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function team_target.indexOf(index)
    if index == nil or not team_target._data[index] then
        return nil
    end

    return setmetatable({_raw = team_target._data[index]}, mt)
end

--
function team_target.get(target)
    
    return team_target.indexOf(__index_target[target])
        
end

--
function team_target.set(target, key, value)
    local record = team_target.get(target)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function team_target.index()
    return __index_target
end

return team_target