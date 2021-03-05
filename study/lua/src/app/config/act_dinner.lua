--act_dinner

-- key
local __key_map = {
  id = 1,    --id-int 
  start_time = 2,    --起始时间-string 
  end_time = 3,    --终止时间-string 
  vit_reward = 4,    --体力奖励-int 
  gold_reward = 5,    --元宝奖励-int 
  name = 6,    --名称-string 
  time_txt = 7,    --客户端显示文字-string 
  chat_before = 8,    --领取前对话-string 
  chat_after = 9,    --领取后对话-string 
  retrieve = 10,    --追回元宝-int 

}

-- data
local act_dinner = {
    _data = {
        [1] = {1,"12|00|00","14|00|00",50,50,"午宴","12:00-14:00","主公饿了吧？来吃个饱～","主公记得晚上18:00再来哦～",60,},
        [2] = {2,"18|00|00","20|00|00",50,50,"晚宴","18:00-20:00","主公饿了吧？来吃个饱～","主公记得晚上21:00再来哦～",60,},
        [3] = {3,"21|00|00","23|00|00",50,50,"夜宵","21:00-23:00","请主公满饮此杯！","主公今晚不走了吧？",60,},
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
        assert(__key_map[k], "cannot find " .. k .. " in act_dinner")
        return t._raw[__key_map[k]]
    end
}

-- 
function act_dinner.length()
    return #act_dinner._data
end

-- 
function act_dinner.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function act_dinner.indexOf(index)
    if index == nil or not act_dinner._data[index] then
        return nil
    end

    return setmetatable({_raw = act_dinner._data[index]}, mt)
end

--
function act_dinner.get(id)
    
    return act_dinner.indexOf(__index_id[id])
        
end

--
function act_dinner.set(id, key, value)
    local record = act_dinner.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function act_dinner.index()
    return __index_id
end

return act_dinner