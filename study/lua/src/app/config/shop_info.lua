--shop_info

-- key
local __key_map = {
  shop_id = 1,    --商店ID-int 
  shop_type = 2,    --商店类型(0固定商店 1随机商店 ) -int 
  default_create = 3,    --是否默认创建 0-默认不创建 1-默认创建-int 
  shop_name = 4,    --商店名称-string 
  auto_refresh_time = 5,    --自动刷新时间间隔/hour-int 
  free_times_max = 6,    --免费刷新次数上限-string 
  free_times_time = 7,    --免费刷新次数刷新时间间隔-string 
  refresh_time1 = 8,    --刷新时间1-string 
  refresh_time2 = 9,    --刷新时间2（必须≥时间1）-string 
  refresh_time3 = 10,    --刷新时间3（必须≥时间2）-string 
  refresh_time4 = 11,    --刷新时间4（必须≥时间3）-string 
  is_cost = 12,    --是否消耗刷新令 0-不消耗 1-消耗-string 
  table = 13,    --刷新消耗资源类型-string 
  value = 14,    --刷新消耗资源-int 
  size = 15,    --刷新消耗资源量-string 
  refresh_vip_type = 16,    --刷新次数关联的vip功能类型-int 
  duration = 17,    --持续时间-int 
  release_type = 18,    --永久开放解锁条件(0-不可解锁；1-可以解锁）-int 
  vip_function_type = 19,    --VIP功能类型-int 
  gold_cost = 20,    --解锁消耗黄金-int 
  cell_1 = 21,    --格子1-int 
  cell_2 = 22,    --格子2-int 
  cell_6 = 23,    --格子6-int 
  function_id = 24,    --关联系统id-跳转时读取等级限制-int 
  tab_name1 = 25,    --页签名称-string 
  tab_name2 = 26,    --页签名称-string 
  tab_name3 = 27,    --页签名称-string 
  tab_name4 = 28,    --页签名称-string 
  tab_name5 = 29,    --页签名称-string 
  resource_type = 30,    --资源货币类型-int 
  npc_pic_id = 31,    --NPC图片资源-int 
  title = 32,    --商店标题-int 
  npc_dialog_id = 33,    --对应bubble的id-int 
  shop_voice = 34,    --商店语音资源-int 

}

-- data
local shop_info = {
    _data = {
        [1] = {1,0,1,"商 城",0,0,0,"0:00:00","0:00:00","0:00:00","0:00:00",0,5,0,20,0,0,0,0,0,0,0,0,1030,"招 募","道 具","礼 包","","",2,3311,1,0,0,},
        [2] = {3,0,1,"竞技场商店",0,0,0,"0:00:00","0:00:00","0:00:00","0:00:00",0,5,0,20,0,0,0,0,0,0,0,0,1090,"商 品","排名奖励","","","",15,1442,3,1,9118,},
        [3] = {4,0,1,"九重天固定奖励商店",0,0,0,"0:00:00","0:00:00","0:00:00","0:00:00",0,5,0,20,0,0,0,0,0,0,0,0,1190,"蓝 装","紫 装","橙 装","奖 励","",11,2321,4,13,0,},
        [4] = {5,1,1,"仙玉商店",0,0,0,"12:00:00","20:00:00","20:00:00","20:00:00",0,5,0,20,11905,0,0,0,0,1,2,3,1190,"商 品","","","","",11,2321,4,6,9112,},
        [5] = {7,0,1,"法宝商店",0,0,0,"0:00:00","0:00:00","0:00:00","0:00:00",0,5,0,20,0,0,0,0,0,0,0,0,1033,"人族法宝","妖族法宝","仙族法宝","","",29,1372,8,116,9113,},
        [6] = {8,1,1,"神将商店",3,10,0,"0:00:00","0:00:00","0:00:00","0:00:00",1,5,3,20,11101,0,0,0,0,4,1,1,1015,"商 品","","","","",24,1442,2,12,9110,},
        [7] = {12,0,1,"群妖商店",0,0,0,"0:00:00","0:00:00","0:00:00","0:00:00",0,5,0,20,0,0,0,0,0,0,0,0,1170,"商 品","奖励","","","",19,2321,1,11,9111,},
        [8] = {15,0,1,"积分商店",0,0,0,"0:00:00","0:00:00","0:00:00","0:00:00",0,5,0,20,0,0,0,0,0,0,0,0,1090,"积分兑换","","","","",30,2321,3,14,9119,},
        [9] = {16,0,1,"军团商店",0,0,0,"0:00:00","0:00:00","0:00:00","0:00:00",0,5,0,20,0,0,0,0,0,0,0,0,1030,"商 品","","","","",31,3381,1,913,9117,},
        [10] = {17,0,1,"军团奖励",0,0,0,"0:00:00","0:00:00","0:00:00","0:00:00",0,5,0,20,0,0,0,0,0,0,0,0,1030,"奖 励","","","","",31,3381,1,913,0,},
        [11] = {20,1,0,"军团随机商店",0,0,0,"9:00:00","12:00:00","18:00:00","21:00:00",0,5,0,20,0,0,0,0,0,0,0,0,1030,"限 时","","","","",31,3381,1,913,0,},
    }
}

-- index
local __index_shop_id = {
    [1] = 1,
    [12] = 7,
    [15] = 8,
    [16] = 9,
    [17] = 10,
    [20] = 11,
    [3] = 2,
    [4] = 3,
    [5] = 4,
    [7] = 5,
    [8] = 6,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in shop_info")
        return t._raw[__key_map[k]]
    end
}

-- 
function shop_info.length()
    return #shop_info._data
end

-- 
function shop_info.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function shop_info.indexOf(index)
    if index == nil or not shop_info._data[index] then
        return nil
    end

    return setmetatable({_raw = shop_info._data[index]}, mt)
end

--
function shop_info.get(shop_id)
    
    return shop_info.indexOf(__index_shop_id[shop_id])
        
end

--
function shop_info.set(shop_id, key, value)
    local record = shop_info.get(shop_id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function shop_info.index()
    return __index_shop_id
end

return shop_info