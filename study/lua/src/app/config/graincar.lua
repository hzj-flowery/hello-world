--graincar

-- key
local __key_map = {
  id = 1,    --序号-int 
  name = 2,    --粮车名称-string 
  color = 3,    --粮车品质-int 
  icon = 4,    --粮车头像-int 
  stamina = 5,    --粮车耐久-int 
  exp = 6,    --粮车升级经验-int 
  bonus = 7,    --达到终点奖励提升系数-int 
  stop_reduce = 8,    --矿点停留时间减少百分比-int 
  moving = 9,    --2矿移动时间（秒）-int 
  attack_lose_rate = 10,    --攻击粮车消耗兵力加成千分比-int 
  recovery_stamina = 11,    --每次移动后，回复自身耐久度-int 
  goes_type = 12,    --发车奖励类型-int 
  goes_value = 13,    --发车奖励类型-string 
  goes_size = 14,    --发车奖励类型-int 
  day = 15,    --发车奖励分割天数-int 

}

-- data
local graincar = {
    _data = {
        [1] = {1,"粮车",2,66001,1200,30000,1000,0,18,0,0,6,"175|175",1,21,},
        [2] = {2,"木牛",3,66002,1500,60000,1000,0,14,0,0,6,"175|175",3,21,},
        [3] = {3,"流马",4,66003,1800,90000,1000,200,20,0,0,6,"175|175",6,21,},
        [4] = {4,"灵巧犀",5,66004,2100,120000,1000,200,14,1000,0,6,"175|175",8,21,},
        [5] = {5,"无极象",6,66005,2400,0,1000,200,14,1000,100,6,"175|175",10,21,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in graincar")
        return t._raw[__key_map[k]]
    end
}

-- 
function graincar.length()
    return #graincar._data
end

-- 
function graincar.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function graincar.indexOf(index)
    if index == nil or not graincar._data[index] then
        return nil
    end

    return setmetatable({_raw = graincar._data[index]}, mt)
end

--
function graincar.get(id)
    
    return graincar.indexOf(__index_id[id])
        
end

--
function graincar.set(id, key, value)
    local record = graincar.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function graincar.index()
    return __index_id
end

return graincar