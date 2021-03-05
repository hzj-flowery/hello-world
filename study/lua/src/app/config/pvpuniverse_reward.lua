--pvpuniverse_reward

-- key
local __key_map = {
  id = 1,    --奖励id-int 
  txt = 2,    --说明-string 
  type_1 = 3,    --类型1-int 
  value_1 = 4,    --类型值1-int 
  size_1 = 5,    --数量1-int 
  type_2 = 6,    --类型2-int 
  value_2 = 7,    --类型值2-int 
  size_2 = 8,    --数量2-int 
  type_3 = 9,    --类型3-int 
  value_3 = 10,    --类型值3-int 
  size_3 = 11,    --数量3-int 
  type_4 = 12,    --类型4-int 
  value_4 = 13,    --类型值4-int 
  size_4 = 14,    --数量4-int 
  type_5 = 15,    --类型5-int 
  value_5 = 16,    --类型值5-int 
  size_5 = 17,    --数量5-int 

}

-- data
local pvpuniverse_reward = {
    _data = {
        [1] = {1,"32强奖励",5,30,4000,0,0,0,0,0,0,0,0,0,0,0,0,},
        [2] = {2,"24强奖励",5,30,4800,0,0,0,0,0,0,0,0,0,0,0,0,},
        [3] = {3,"16强奖励",5,30,5600,0,0,0,0,0,0,0,0,0,0,0,0,},
        [4] = {4,"8强奖励",5,30,6400,0,0,0,0,0,0,0,0,0,0,0,0,},
        [5] = {5,"4强奖励",5,30,8000,0,0,0,0,0,0,0,0,0,0,0,0,},
        [6] = {6,"亚军奖励",5,30,9600,0,0,0,0,0,0,0,0,0,0,0,0,},
        [7] = {7,"冠军奖励",5,30,3200,0,0,0,0,0,0,0,0,0,0,0,0,},
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

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in pvpuniverse_reward")
        return t._raw[__key_map[k]]
    end
}

-- 
function pvpuniverse_reward.length()
    return #pvpuniverse_reward._data
end

-- 
function pvpuniverse_reward.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function pvpuniverse_reward.indexOf(index)
    if index == nil or not pvpuniverse_reward._data[index] then
        return nil
    end

    return setmetatable({_raw = pvpuniverse_reward._data[index]}, mt)
end

--
function pvpuniverse_reward.get(id)
    
    return pvpuniverse_reward.indexOf(__index_id[id])
        
end

--
function pvpuniverse_reward.set(id, tkey, nvalue)
    local record = pvpuniverse_reward.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function pvpuniverse_reward.index()
    return __index_id
end

return pvpuniverse_reward