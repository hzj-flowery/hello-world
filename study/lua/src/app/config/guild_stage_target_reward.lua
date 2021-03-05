--guild_stage_target_reward

-- key
local __key_map = {
  box_id = 1,    --宝箱id-int 
  need_point = 2,    --需要积分-int 
  drop = 3,    --掉落组id-int 

}

-- data
local guild_stage_target_reward = {
    _data = {
        [1] = {1,50,7101,},
        [2] = {2,100,7102,},
        [3] = {3,150,7103,},
        [4] = {4,200,7104,},
    }
}

-- index
local __index_box_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in guild_stage_target_reward")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_stage_target_reward.length()
    return #guild_stage_target_reward._data
end

-- 
function guild_stage_target_reward.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_stage_target_reward.indexOf(index)
    if index == nil or not guild_stage_target_reward._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_stage_target_reward._data[index]}, mt)
end

--
function guild_stage_target_reward.get(box_id)
    
    return guild_stage_target_reward.indexOf(__index_box_id[box_id])
        
end

--
function guild_stage_target_reward.set(box_id, key, value)
    local record = guild_stage_target_reward.get(box_id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_stage_target_reward.index()
    return __index_box_id
end

return guild_stage_target_reward