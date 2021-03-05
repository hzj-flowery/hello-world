--bout_base

-- key
local __key_map = {
  id = 1,    --id-int 
  next = 2,    --后置阵法-int 
  need_office = 3,    --需要官衔等级-int 
  name = 4,    --阵法名称-string 
  name_pic = 5,    --阵法名称美术资源，其实没用-string 
  color = 6,    --阵法品质色-int 

}

-- data
local bout_base = {
    _data = {
        [1] = {1,2,0,"圆形阵","txt_bout_01",5,},
        [2] = {2,3,7,"锋矢阵","txt_bout_02",5,},
        [3] = {3,4,8,"天地人阵","txt_bout_03",6,},
        [4] = {4,5,9,"日月星阵","txt_bout_04",6,},
        [5] = {5,6,10,"北斗七星阵","txt_bout_05",7,},
        [6] = {6,0,11,"五行八卦阵","txt_bout_06",7,},
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

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in bout_base")
        return t._raw[__key_map[k]]
    end
}

-- 
function bout_base.length()
    return #bout_base._data
end

-- 
function bout_base.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function bout_base.indexOf(index)
    if index == nil or not bout_base._data[index] then
        return nil
    end

    return setmetatable({_raw = bout_base._data[index]}, mt)
end

--
function bout_base.get(id)
    
    return bout_base.indexOf(__index_id[id])
        
end

--
function bout_base.set(id, tkey, nvalue)
    local record = bout_base.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function bout_base.index()
    return __index_id
end

return bout_base