--story_period_box

-- key
local __key_map = {
  id = 1,    --id-int 
  title = 2,    --阶段标题-string 
  chapter = 3,    --领取条件-int 
  type = 4,    --奖励类型-int 
  value = 5,    --奖励类型值-int 
  size = 6,    --奖励数量-int 

}

-- data
local story_period_box = {
    _data = {
        [1] = {1,"通关第3回领取",3,5,1,500,},
        [2] = {2,"通关第6回领取",6,5,1,800,},
        [3] = {3,"通关第8回领取",8,6,112,1,},
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
        assert(__key_map[k], "cannot find " .. k .. " in story_period_box")
        return t._raw[__key_map[k]]
    end
}

-- 
function story_period_box.length()
    return #story_period_box._data
end

-- 
function story_period_box.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function story_period_box.indexOf(index)
    if index == nil or not story_period_box._data[index] then
        return nil
    end

    return setmetatable({_raw = story_period_box._data[index]}, mt)
end

--
function story_period_box.get(id)
    
    return story_period_box.indexOf(__index_id[id])
        
end

--
function story_period_box.set(id, key, value)
    local record = story_period_box.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function story_period_box.index()
    return __index_id
end

return story_period_box