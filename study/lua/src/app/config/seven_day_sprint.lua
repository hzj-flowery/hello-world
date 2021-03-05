--seven_day_sprint

-- key
local __key_map = {
  id = 1,    --id-int 
  type = 2,    --类型-int 
  name = 3,    --活动名称-string 
  function_id = 4,    --开启等级-int 
  is_work = 5,    --是否生效-int 
  open_day = 6,    --开启时间-int 
  over_day = 7,    --结束时间-int 
  over_view_day = 8,    --结束后显示时间-int 
  order = 9,    --页签排序-int 
  activity_content_text = 10,    --活动内容文本-string 

}

-- data
local seven_day_sprint = {
    _data = {
        [1] = {1,1,"百大军团",5,1,1,9,10,1,"为鼓励各主公征召人马开疆辟土，开服第#num#天将评选出百大军团并发放对应奖励。参与军团活动越多，军团排名越高！",},
    }
}

-- index
local __index_id = {
    [1] = 1,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in seven_day_sprint")
        return t._raw[__key_map[k]]
    end
}

-- 
function seven_day_sprint.length()
    return #seven_day_sprint._data
end

-- 
function seven_day_sprint.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function seven_day_sprint.indexOf(index)
    if index == nil or not seven_day_sprint._data[index] then
        return nil
    end

    return setmetatable({_raw = seven_day_sprint._data[index]}, mt)
end

--
function seven_day_sprint.get(id)
    
    return seven_day_sprint.indexOf(__index_id[id])
        
end

--
function seven_day_sprint.set(id, key, value)
    local record = seven_day_sprint.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function seven_day_sprint.index()
    return __index_id
end

return seven_day_sprint