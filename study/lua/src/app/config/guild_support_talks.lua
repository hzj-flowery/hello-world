--guild_support_talks

-- key
local __key_map = {
  id = 1,    --说话id-int 
  talks = 2,    --援助看板娘随机说话文本，每次进入界面或者点击立绘头像随机播放文字-string 

}

-- data
local guild_support_talks = {
    _data = {
        [1] = {1,"还没有在军团求援吗？赶紧去求援吧!",},
        [2] = {2,"每天求援可以获得3个红色色武将碎片哦!",},
        [3] = {3,"每天求援可以获得5个紫色武将碎片哦!",},
        [4] = {4,"每天求援可以获得4个橙色武将碎片哦!",},
        [5] = {5,"还没完成求援？快去军团呼叫吧！",},
        [6] = {6,"多余的武将碎片可以赠予同军团成员！",},
        [7] = {7,"赠送武将碎片可以获得军团贡献",},
        [8] = {8,"完成3次求援可获得星彩精心准备的大奖哦！",},
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_support_talks")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_support_talks.length()
    return #guild_support_talks._data
end

-- 
function guild_support_talks.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_support_talks.indexOf(index)
    if index == nil or not guild_support_talks._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_support_talks._data[index]}, mt)
end

--
function guild_support_talks.get(id)
    
    return guild_support_talks.indexOf(__index_id[id])
        
end

--
function guild_support_talks.set(id, key, value)
    local record = guild_support_talks.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_support_talks.index()
    return __index_id
end

return guild_support_talks