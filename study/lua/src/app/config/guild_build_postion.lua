--guild_build_postion

-- key
local __key_map = {
  id = 1,    --建筑id-int 
  show_level = 2,    --开放显示需要军团等级-int 
  open = 3,    --是否开放-int 
  name = 4,    --建筑名称-string 
  pic = 5,    --资源名称-string 
  postion_x = 6,    --建筑X坐标-int 
  postion_y = 7,    --建筑Y坐标-int 
  name_pic = 8,    --标题Y坐标-string 
  name_postion_x = 9,    --标题X坐标-int 
  name_postion_y = 10,    --标题Y坐标-int 

}

-- data
local guild_build_postion = {
    _data = {
        [1] = {1,1,1,"军团大殿","guild_build_01",1205,591,"txt_guild_dadian01",1380,820,},
        [2] = {2,1,1,"军团援助","guild_build_02",478,396,"txt_guild_yuanzhu03",740,556,},
        [3] = {3,1,1,"军团商店","guild_build_03",826,542,"txt_guild_shangdian05",1050,730,},
        [4] = {4,4,0,"亭子","guild_build_04",1005,805,"",1088,857,},
        [5] = {5,1,1,"军团BOSS","guild_build_05",857,400,"txt_guild_boss04",1080,560,},
        [6] = {6,1,1,"军团捐献","guild_build_06",1174,374,"txt_guild_jisi07",1400,534,},
        [7] = {7,3,0,"军需所","guild_build_07",872,213,"",1144,361,},
        [8] = {8,1,1,"军团试炼","guild_build_08",401,529,"txt_guild_fuben02",548,702,},
        [9] = {9,1,0,"东城门","guild_build_09",1226,221,"",1486,481,},
        [10] = {10,1,0,"军团战","guild_build_10",1540,225,"txt_guild_juanxian06",1800,485,},
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_build_postion")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_build_postion.length()
    return #guild_build_postion._data
end

-- 
function guild_build_postion.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_build_postion.indexOf(index)
    if index == nil or not guild_build_postion._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_build_postion._data[index]}, mt)
end

--
function guild_build_postion.get(id)
    
    return guild_build_postion.indexOf(__index_id[id])
        
end

--
function guild_build_postion.set(id, key, value)
    local record = guild_build_postion.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_build_postion.index()
    return __index_id
end

return guild_build_postion