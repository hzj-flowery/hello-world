--fight_stage

-- key
local __key_map = {
  id = 1,    --阶段-int 
  first = 2,    --先后手（1-先手,2-后手,3-双方）-int 
  action = 3,    --行动（1-选人,2-ban人,3-等待）-int 
  number = 4,    --人数-int 
  time = 5,    --时间（秒）-int 

}

-- data
local fight_stage = {
    _data = {
        [1] = {1,2,1,1,47,},
        [2] = {2,1,1,2,45,},
        [3] = {3,2,1,2,45,},
        [4] = {4,1,1,2,45,},
        [5] = {5,2,1,2,45,},
        [6] = {6,1,1,2,45,},
        [7] = {7,2,1,1,45,},
        [8] = {8,3,3,0,10,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in fight_stage")
        return t._raw[__key_map[k]]
    end
}

-- 
function fight_stage.length()
    return #fight_stage._data
end

-- 
function fight_stage.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function fight_stage.indexOf(index)
    if index == nil or not fight_stage._data[index] then
        return nil
    end

    return setmetatable({_raw = fight_stage._data[index]}, mt)
end

--
function fight_stage.get(id)
    
    return fight_stage.indexOf(__index_id[id])
        
end

--
function fight_stage.set(id, key, value)
    local record = fight_stage.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function fight_stage.index()
    return __index_id
end

return fight_stage