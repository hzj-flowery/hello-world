--boss_content

-- key
local __key_map = {
  id = 1,    --id-int 
  text_type = 2,    --类型-int 
  text = 3,    --相关文本-string 

}

-- data
local boss_content = {
    _data = {
        [1] = {1,0,"主公，本次挑战军团BOSS，你所在军团参与人数#number#人，军团积分排名第#rank#名，获得军团声望#prestige#，奖励已发放到拍卖及邮件。",},
        [2] = {2,0,"主公，本次挑战军团BOSS，你个人积分排名第#rank#名，奖励已发放到邮件（加入军团可获得更多奖励哟！）",},
        [3] = {3,1,"#name1#成功夺走#name2##integral#积分",},
        [4] = {4,1,"#name1#被#name2#抢走#integral#积分",},
        [5] = {5,1,"#name1#挑战世界Boss获得#integral#积分",},
        [6] = {6,2,"被#name#夺走#integral#积分",},
        [7] = {7,2,"本次挑战世界Boss获得#integral#积分",},
        [8] = {8,2,"成功抢夺#name##integral#积分",},
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
        assert(__key_map[k], "cannot find " .. k .. " in boss_content")
        return t._raw[__key_map[k]]
    end
}

-- 
function boss_content.length()
    return #boss_content._data
end

-- 
function boss_content.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function boss_content.indexOf(index)
    if index == nil or not boss_content._data[index] then
        return nil
    end

    return setmetatable({_raw = boss_content._data[index]}, mt)
end

--
function boss_content.get(id)
    
    return boss_content.indexOf(__index_id[id])
        
end

--
function boss_content.set(id, key, value)
    local record = boss_content.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function boss_content.index()
    return __index_id
end

return boss_content