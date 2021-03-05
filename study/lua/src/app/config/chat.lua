--chat

-- key
local __key_map = {
  id = 1,    --id-int 
  key = 2,    --参数名称-string 
  content = 3,    --参数内容-string 

}

-- data
local chat = {
    _data = {
        [1] = {1,"chat_world_accept_level","1",},
        [2] = {2,"chat_world_level","10",},
        [3] = {3,"chat_world_interval","10",},
        [4] = {4,"chat_gang_interval","1",},
        [5] = {5,"chat_voice","30",},
        [6] = {6,"chat_text","30",},
        [7] = {7,"sent_private_chat","10",},
        [8] = {8,"system","50",},
        [9] = {9,"private_chat_number","100",},
        [10] = {10,"chat_voice_min","1",},
        [11] = {11,"chat_gang_level","10",},
        [12] = {12,"low_vip_number","20",},
        [13] = {13,"low_vip","1",},
        [14] = {14,"low_level","30",},
        [15] = {15,"limite_number","5",},
        [16] = {16,"private_chat_level","18",},
        [17] = {17,"limite_level","30",},
        [18] = {18,"limite_vip","1",},
        [19] = {19,"qin_world_cd","20",},
        [20] = {20,"qin_guild_cd","20",},
        [21] = {21,"pvpsingle_chat_level","60",},
        [22] = {22,"private_chat_day","7",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
    [13] = 13,
    [14] = 14,
    [15] = 15,
    [16] = 16,
    [17] = 17,
    [18] = 18,
    [19] = 19,
    [2] = 2,
    [20] = 20,
    [21] = 21,
    [22] = 22,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in chat")
        return t._raw[__key_map[k]]
    end
}

-- 
function chat.length()
    return #chat._data
end

-- 
function chat.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function chat.indexOf(index)
    if index == nil or not chat._data[index] then
        return nil
    end

    return setmetatable({_raw = chat._data[index]}, mt)
end

--
function chat.get(id)
    
    return chat.indexOf(__index_id[id])
        
end

--
function chat.set(id, tkey, nvalue)
    local record = chat.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function chat.index()
    return __index_id
end

return chat