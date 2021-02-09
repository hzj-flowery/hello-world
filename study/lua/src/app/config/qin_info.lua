--qin_info

-- key
local __key_map = {
  id = 1,    --序号-int 
  open_time = 2,    --每天开启时间-int 
  close_time = 3,    --每天结束时间-int 
  stay_time = 4,    --每天自动增加活动时间（秒）-int 
  stay_time_max = 5,    --上限累计活动时间（秒）-int 
  help_time = 6,    --每天自动增加协助时间（秒）-int 
  help_time_max = 7,    --上限累计协助时间（秒）-int 
  one_small_time = 8,    --一个人刷小怪时间-int 
  one_big_time = 9,    --一个人刷精英怪时间-int 
  refresh_time = 10,    --怪物刷新时间-int 
  pk_time = 11,    --pk消耗时间-int 
  revive_time = 12,    --死亡复活时间-int 
  tombstone_time = 13,    --墓碑停留时间-int 
  speed = 14,    --每秒移动像素长度-int 
  error_time = 15,    --前后端误差时间-int 
  min_time = 16,    --大于等于时间才能获得奖励（百分比）-int 

}

-- data
local qin_info = {
    _data = {
        [1] = {1,36000,79200,600,4200,600,4200,150,450,5,0,20,180,170,3000,60,},
    }
}

-- index
local __index_id = {
    [1] = 1,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in qin_info")
        return t._raw[__key_map[k]]
    end
}

-- 
function qin_info.length()
    return #qin_info._data
end

-- 
function qin_info.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function qin_info.indexOf(index)
    if index == nil or not qin_info._data[index] then
        return nil
    end

    return setmetatable({_raw = qin_info._data[index]}, mt)
end

--
function qin_info.get(id)
    
    return qin_info.indexOf(__index_id[id])
        
end

--
function qin_info.set(id, tkey, nvalue)
    local record = qin_info.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function qin_info.index()
    return __index_id
end

return qin_info