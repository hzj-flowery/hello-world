--guild_donate

-- key
local __key_map = {
  id = 1,    --序号-int 
  name = 2,    --捐献名称-string 
  cost_type = 3,    --捐献需要资源类型-int 
  cost_value = 4,    --捐献需要资源子类-int 
  cost_size = 5,    --捐献需要资源数量-int 
  crit = 6,    --暴击概率-int 
  exp = 7,    --获得军团声望-int 
  crit_exp = 8,    --暴击军团声望-int 
  contribution = 9,    --获得个人贡献-int 
  crit_contribution = 10,    --暴击个人贡献-int 
  point = 11,    --每次捐献积分-int 

}

-- data
local guild_donate = {
    _data = {
        [1] = {1,"礼宗庙",5,2,50000,200,50,75,500,750,1,},
        [2] = {2,"祭地袛",5,1,100,200,100,150,1000,1500,1,},
        [3] = {3,"祭天神",5,1,200,200,300,450,3000,4500,1,},
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_donate")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_donate.length()
    return #guild_donate._data
end

-- 
function guild_donate.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_donate.indexOf(index)
    if index == nil or not guild_donate._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_donate._data[index]}, mt)
end

--
function guild_donate.get(id)
    
    return guild_donate.indexOf(__index_id[id])
        
end

--
function guild_donate.set(id, key, value)
    local record = guild_donate.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_donate.index()
    return __index_id
end

return guild_donate