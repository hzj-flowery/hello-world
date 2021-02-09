--head_frame

-- key
local __key_map = {
  id = 1,    --序号-int 
  name = 2,    --名称-string 
  limit_level = 3,    --限制等级-int 
  day = 4,    --开服天数-int 
  resource = 5,    --资源-string 
  color = 6,    --品质-int 
  time_type = 7,    --时间类型-int 
  time_value = 8,    --时间类型值-int 
  des = 9,    --条件描述-string 
  moving = 10,    --特效-string 

}

-- data
local head_frame = {
    _data = {
        [1] = {1,"快解锁头像框吧",0,0,"img_head_frame_com001",1,2,0,"","",},
        [2] = {2,"情有独钟头像框",0,0,"img_head_frame_com002",2,2,0,"累计签到达到365天获取","",},
        [3] = {3,"超群绝伦头像框",0,0,"img_head_frame_com003",2,2,0,"累计参加99次军团boss获取","",},
        [4] = {4,"才华横溢头像框",0,0,"img_head_frame_com004",2,2,0,"累计参加50次军团答题获取","",},
        [5] = {5,"出类拔萃头像框",0,0,"img_head_frame_com005",2,2,0,"累计参加50次军团试炼获取","",},
        [6] = {6,"勇冠三军头像框",0,0,"img_head_frame_com006",2,2,0,"累计参加20次三国战记获取","",},
        [7] = {7,"所向披靡头像框",0,0,"img_head_frame_com007",2,2,0,"累计参加20次军团战获取","",},
        [8] = {8,"大家风范头像框",0,0,"img_head_frame_vip3",2,2,0,"贵族3专属","",},
        [9] = {9,"名门望族头像框",0,0,"img_head_frame_vip7",3,2,0,"贵族7专属","",},
        [10] = {10,"侯服玉食头像框",0,0,"img_head_frame_vip12",4,2,0,"贵族12专属","",},
        [11] = {11,"佩金带紫头像框",0,0,"",5,2,0,"贵族13专属","effect_vip13touxiang",},
        [12] = {12,"玉叶金柯头像框",0,0,"",5,2,0,"贵族14专属","effect_vip14touxiang",},
        [13] = {13,"不赀之躯头像框",0,0,"",6,2,0,"贵族15专属","effect_vip15touxiang",},
        [14] = {14,"龙血凤髓头像框",0,0,"",7,2,0,"贵族16专属","effect_vip16touxiang",},
        [15] = {15,"1周年头像框",0,0,"img_head_frame_com015",3,2,0,"1周年活动限时获取","",},
        [16] = {16,"建功立业头像框",0,0,"img_head_frame_1year1",5,2,0,"周年庆活动限时获取","",},
        [17] = {17,"丰功伟绩头像框",0,0,"",5,2,0,"周年庆活动限时获取","effect_touxiang_fenzuan",},
        [18] = {18,"流芳百世头像框",0,0,"",6,2,0,"周年庆活动限时获取","effect_touxiang_denglong",},
        [19] = {19,"结交头像框",0,0,"img_head_frame_golden1",5,2,0,"见龙在田活动限时获取","",},
        [20] = {20,"寻隐头像框",0,0,"",5,2,0,"见龙在田活动限时获取","effect_touxiang_xiaolong",},
        [21] = {21,"见龙在田头像框",0,0,"img_head_frame_golden3",6,2,0,"见龙在田活动限时获取","effect_touxian_honglong",},
        [22] = {22,"文期酒会头像框",0,0,"img_head_frame_1banquet1",5,2,0,"饕餮盛宴活动限时获取","",},
        [23] = {23,"诗酒风流头像框",0,0,"",5,2,0,"饕餮盛宴活动限时获取","effect_touxiang_jiubei",},
        [24] = {24,"对酒当歌头像框",0,0,"",6,2,0,"饕餮盛宴活动限时获取","effect_touxiang_jiubeiduipeng",},
        [25] = {25,"七夕头像框",0,0,"img_head_frame_f0707",3,2,0,"七夕活动限时获取","",},
        [26] = {26,"中秋头像框",0,0,"img_head_frame_f0815",3,1,30,"中秋活动限时获取","",},
        [27] = {27,"庆典头像框",0,0,"img_head_frame_f1001",3,1,30,"节日庆典限时获取","",},
        [28] = {28,"五福临门头像框",0,0,"img_head_frame_2banquet1",5,2,0,"饕餮盛宴活动限时获取","effect_touxiang_shunian",},
        [29] = {29,"福星高照头像框",0,0,"img_head_frame_2banquet2",6,2,0,"饕餮盛宴活动限时获取","effect_touxiang_wushi",},
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
    [20] = 20,
    [21] = 21,
    [22] = 22,
    [23] = 23,
    [24] = 24,
    [25] = 25,
    [26] = 26,
    [27] = 27,
    [28] = 28,
    [29] = 29,
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
        assert(__key_map[k], "cannot find " .. k .. " in head_frame")
        return t._raw[__key_map[k]]
    end
}

-- 
function head_frame.length()
    return #head_frame._data
end

-- 
function head_frame.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function head_frame.indexOf(index)
    if index == nil or not head_frame._data[index] then
        return nil
    end

    return setmetatable({_raw = head_frame._data[index]}, mt)
end

--
function head_frame.get(id)
    
    return head_frame.indexOf(__index_id[id])
        
end

--
function head_frame.set(id, key, value)
    local record = head_frame.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function head_frame.index()
    return __index_id
end

return head_frame