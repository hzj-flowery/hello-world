--type_manage

-- key
local __key_map = {
  id = 1,    --资源类型编号-int 
  name = 2,    --名称-string 
  table = 3,    --相关表格-string 
  drop_group = 4,    --掉落分组-int 
  order = 5,    --排序id-int 

}

-- data
local type_manage = {
    _data = {
        [1] = {1,"武将","hero",1,1,},
        [2] = {2,"装备","equipment",2,2,},
        [3] = {3,"宝物","treasure",3,3,},
        [4] = {4,"神兵","instrument",3,4,},
        [5] = {5,"资源","resource",0,5,},
        [6] = {6,"道具","item",0,6,},
        [7] = {7,"碎片","fragment",0,7,},
        [8] = {8,"宝石","gemstone",0,8,},
        [9] = {9,"变身卡","avatar",0,9,},
        [10] = {10,"神兽","pet",0,10,},
        [11] = {11,"锦囊","silkbag",0,11,},
        [12] = {12,"战马","horse",0,12,},
        [13] = {13,"历代名将","historical_hero",0,13,},
        [14] = {14,"历代名将武器","historical_hero_equipment",0,14,},
        [15] = {15,"战马装备","horse_equipment",0,15,},
        [16] = {16,"玉石","jade",0,16,},
        [17] = {17,"头像框","head_frame",0,17,},
        [18] = {18,"称号","title",0,18,},
        [19] = {19,"军团旗帜","guild_true_flag",0,19,},
        [20] = {25,"战法","tactics",0,25,},
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
    [25] = 20,
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
        assert(__key_map[k], "cannot find " .. k .. " in type_manage")
        return t._raw[__key_map[k]]
    end
}

-- 
function type_manage.length()
    return #type_manage._data
end

-- 
function type_manage.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function type_manage.indexOf(index)
    if index == nil or not type_manage._data[index] then
        return nil
    end

    return setmetatable({_raw = type_manage._data[index]}, mt)
end

--
function type_manage.get(id)
    
    return type_manage.indexOf(__index_id[id])
        
end

--
function type_manage.set(id, key, value)
    local record = type_manage.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function type_manage.index()
    return __index_id
end

return type_manage