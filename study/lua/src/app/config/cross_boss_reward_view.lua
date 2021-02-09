--cross_boss_reward_view

-- key
local __key_map = {
  id = 1,    --id-int 
  day_min = 2,    --开服天数min-int 
  day_max = 3,    --开服天数max-int 
  reward_type_1 = 4,    --奖励1-int 
  reward_type_2 = 5,    --奖励2-int 
  reward_type_3 = 6,    --奖励3-int 
  reward_type_4 = 7,    --奖励4-int 
  type_1 = 8,    --类型1-int 
  value_1 = 9,    --类型值1-int 
  size_1 = 10,    --数量1-int 
  type_2 = 11,    --类型2-int 
  value_2 = 12,    --类型值2-int 
  size_2 = 13,    --数量2-int 
  type_3 = 14,    --类型3-int 
  value_3 = 15,    --类型值3-int 
  size_3 = 16,    --数量3-int 
  type_4 = 17,    --类型4-int 
  value_4 = 18,    --类型值4-int 
  size_4 = 19,    --数量4-int 
  type_5 = 20,    --类型5-int 
  value_5 = 21,    --类型值5-int 
  size_5 = 22,    --数量5-int 
  type_6 = 23,    --类型6-int 
  value_6 = 24,    --类型值6-int 
  size_6 = 25,    --数量6-int 

}

-- data
local cross_boss_reward_view = {
    _data = {
        [1] = {1,1,39,2,3,4,0,6,555,1,6,556,1,6,701,1,6,702,1,6,703,1,6,704,1,},
        [2] = {2,40,9999,6,7,0,0,6,555,1,6,556,1,6,701,1,6,702,1,6,703,1,6,704,1,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in cross_boss_reward_view")
        return t._raw[__key_map[k]]
    end
}

-- 
function cross_boss_reward_view.length()
    return #cross_boss_reward_view._data
end

-- 
function cross_boss_reward_view.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function cross_boss_reward_view.indexOf(index)
    if index == nil or not cross_boss_reward_view._data[index] then
        return nil
    end

    return setmetatable({_raw = cross_boss_reward_view._data[index]}, mt)
end

--
function cross_boss_reward_view.get(id)
    
    return cross_boss_reward_view.indexOf(__index_id[id])
        
end

--
function cross_boss_reward_view.set(id, tkey, nvalue)
    local record = cross_boss_reward_view.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function cross_boss_reward_view.index()
    return __index_id
end

return cross_boss_reward_view