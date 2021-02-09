--notification

-- key
local __key_map = {
  id = 1,    --id-int 
  start_time = 2,    --触发时间-string 
  week = 3,    --周几触发-string 
  day_min = 4,    --开服天数MIN-int 
  day_max = 5,    --开服天数MAX-int 
  lv_min = 6,    --玩家等级MIN-int 
  lv_max = 7,    --玩家等级MAX-int 
  time_txt = 8,    --标题-string 
  chat_before = 9,    --文本-string 

}

-- data
local notification = {
    _data = {
        [1] = {1,"12|00|02","1|2|3|4|5|6|7",0,999,0,23,"午宴开始了","各位主公，午宴已经开始，快去参加午宴补充大量体力吧！",},
        [2] = {2,"18|00|02","1|2|3|4|5|6|7",0,999,0,23,"晚宴开始了","各位主公，晚宴已经开始，快去参加晚宴补充大量体力吧！",},
        [3] = {3,"21|00|02","1|2|3|4|5|6|7",0,999,0,255,"夜宵开始了","各位主公，夜宵已经开始，快去参加夜宵补充大量体力吧！",},
        [4] = {4,"11|55|00","1|2|3|4|5|6|7",0,999,24,255,"军团BOSS来临","军团BOSS将在5分钟后来临，主公请前往挑战，击退BOSS后可参与拍卖和分红！",},
        [5] = {5,"18|55|00","1|2|3|4|5|6|7",0,999,24,255,"军团BOSS来临","军团BOSS将在5分钟后来临，主公请前往挑战，击退BOSS后可参与拍卖和分红！",},
        [6] = {6,"20|55|00","3|5|7",3,999,30,999,"三国战纪开战","三国战纪将在5分钟后开战，挑战BOSS并击破之，可以参与拍卖和分红！",},
        [7] = {7,"20|55|00","1|4",7,999,30,999,"阵营竞技开战","阵营竞技将在5分钟后开战，谁是阵营王者，请前往一决高下！",},
        [8] = {8,"20|55|00","2|6",8,999,30,999,"军团战一触即发","军团战将在5分钟后开战，夺城占地，做巅峰军团，就在此时！",},
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
        assert(__key_map[k], "cannot find " .. k .. " in notification")
        return t._raw[__key_map[k]]
    end
}

-- 
function notification.length()
    return #notification._data
end

-- 
function notification.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function notification.indexOf(index)
    if index == nil or not notification._data[index] then
        return nil
    end

    return setmetatable({_raw = notification._data[index]}, mt)
end

--
function notification.get(id)
    
    return notification.indexOf(__index_id[id])
        
end

--
function notification.set(id, key, value)
    local record = notification.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function notification.index()
    return __index_id
end

return notification