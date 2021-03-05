--guild_true_flag

-- key
local __key_map = {
  id = 1,    --颜色id-int 
  name = 2,    --名称-string 
  description = 3,    --描述-string 
  color = 4,    --品质-int 
  view_time = 5,    --可见天数-int 
  time_value = 6,    --有效天数-int 
  square_res = 7,    --方块样式-string 
  origin_res = 8,    --普通样式-string 
  long_res = 9,    --长条样式-string 
  text_color = 10,    --字体颜色-string 
  outline_color = 11,    --描边颜色-string 

}

-- data
local guild_true_flag = {
    _data = {
        [1] = {1,"基础颜色-酡红","",3,1,0,"img_colour01","img_flag_colour01","img_flag_colour01a","255,255,255","160,4,0",},
        [2] = {2,"基础颜色-橘黄","",3,1,0,"img_colour02","img_flag_colour02","img_flag_colour02a","255,255,255","215,66,0",},
        [3] = {3,"基础颜色-赤金","",3,1,0,"img_colour03","img_flag_colour03","img_flag_colour03a","255,255,255","233,148,0",},
        [4] = {4,"基础颜色-葱绿","",3,1,0,"img_colour04","img_flag_colour04","img_flag_colour04a","255,255,255","45,186,0",},
        [5] = {5,"基础颜色-柏绿","",3,1,0,"img_colour05","img_flag_colour05","img_flag_colour05a","255,255,255","0,141,70",},
        [6] = {6,"基础颜色-青碧","",3,1,0,"img_colour06","img_flag_colour06","img_flag_colour06a","255,255,255","0,150,122",},
        [7] = {7,"基础颜色-湖蓝","",3,1,0,"img_colour07","img_flag_colour07","img_flag_colour07a","255,255,255","21,91,187",},
        [8] = {8,"基础颜色-青莲","",3,1,0,"img_colour08","img_flag_colour08","img_flag_colour08a","255,255,255","119,0,179",},
        [9] = {9,"基础颜色-紫棠","",3,1,0,"img_colour09","img_flag_colour09","img_flag_colour09a","255,255,255","166,0,176",},
        [10] = {10,"基础颜色-黄栌","",3,1,0,"img_colour10","img_flag_colour10","img_flag_colour10a","255,255,255","180,86,51",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [2] = 2,
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_true_flag")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_true_flag.length()
    return #guild_true_flag._data
end

-- 
function guild_true_flag.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_true_flag.indexOf(index)
    if index == nil or not guild_true_flag._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_true_flag._data[index]}, mt)
end

--
function guild_true_flag.get(id)
    
    return guild_true_flag.indexOf(__index_id[id])
        
end

--
function guild_true_flag.set(id, tkey, nvalue)
    local record = guild_true_flag.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function guild_true_flag.index()
    return __index_id
end

return guild_true_flag