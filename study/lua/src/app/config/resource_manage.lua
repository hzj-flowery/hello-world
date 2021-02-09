--resource_manage

-- key
local __key_map = {
  id = 1,    --资源类型编号-int 
  name = 2,    --名称-string 
  table = 3,    --相关表格-string 
  drop_group = 4,    --掉落分组-int 
  order = 5,    --排序id-int 

}

-- data
local resource_manage = {
    _data = {
        [1] = {1,"武将","hero",1,1,},
        [2] = {2,"装备","equipment",2,2,},
        [3] = {3,"宝物","treasure",3,3,},
        [4] = {4,"神兵","instrument",3,4,},
        [5] = {5,"资源","resource",0,5,},
        [6] = {6,"道具","item",0,6,},
        [7] = {7,"碎片","fragment",0,7,},
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
        assert(__key_map[k], "cannot find " .. k .. " in resource_manage")
        return t._raw[__key_map[k]]
    end
}

-- 
function resource_manage.length()
    return #resource_manage._data
end

-- 
function resource_manage.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function resource_manage.indexOf(index)
    if index == nil or not resource_manage._data[index] then
        return nil
    end

    return setmetatable({_raw = resource_manage._data[index]}, mt)
end

--
function resource_manage.get(id)
    
    return resource_manage.indexOf(__index_id[id])
        
end

--
function resource_manage.set(id, key, value)
    local record = resource_manage.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function resource_manage.index()
    return __index_id
end

return resource_manage