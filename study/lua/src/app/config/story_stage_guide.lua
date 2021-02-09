--story_stage_guide

-- key
local __key_map = {
  id = 1,    --编号-int 
  type = 2,    --类型-int 
  value = 3,    --参数-int 
  x = 4,    --x偏移-int 
  y = 5,    --Y偏移-int 
  text = 6,    --文本-string 
  level_min = 7,    --等级下区间-int 
  level_max = 8,    --等级上区间-int 
  time_min = 9,    --存在时间下限-int 
  time_max = 10,    --存在时间上限-int 
  cd_min = 11,    --再次出现时间下限-int 
  cd_max = 12,    --再次出现时间上限-int 

}

-- data
local story_stage_guide = {
    _data = {
        [1] = {1001,1,0,80,110,"主公快去征战吧！",5,20,3,4,1,2,},
        [2] = {2001,2,2,0,120,"",5,10,3,4,3,4,},
        [3] = {2002,2,3,0,120,"",5,10,3,4,3,4,},
        [4] = {3001,3,100201,0,-150,"",5,10,3,4,3,4,},
        [5] = {3002,3,100202,0,-150,"",5,10,3,4,3,4,},
        [6] = {3003,3,100203,0,-150,"",5,10,3,4,3,4,},
        [7] = {3004,3,100204,0,-150,"",5,10,3,4,3,4,},
        [8] = {3005,3,100205,0,-150,"",5,10,3,4,3,4,},
        [9] = {3006,3,100206,0,-150,"",5,10,3,4,3,4,},
    }
}

-- index
local __index_id = {
    [1001] = 1,
    [2001] = 2,
    [2002] = 3,
    [3001] = 4,
    [3002] = 5,
    [3003] = 6,
    [3004] = 7,
    [3005] = 8,
    [3006] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in story_stage_guide")
        return t._raw[__key_map[k]]
    end
}

-- 
function story_stage_guide.length()
    return #story_stage_guide._data
end

-- 
function story_stage_guide.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function story_stage_guide.indexOf(index)
    if index == nil or not story_stage_guide._data[index] then
        return nil
    end

    return setmetatable({_raw = story_stage_guide._data[index]}, mt)
end

--
function story_stage_guide.get(id)
    
    return story_stage_guide.indexOf(__index_id[id])
        
end

--
function story_stage_guide.set(id, key, value)
    local record = story_stage_guide.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function story_stage_guide.index()
    return __index_id
end

return story_stage_guide