--shop

-- key
local __key_map = {
  shop_id = 1,    --商店ID-int 
  shop_entrance = 2,    --商店入口：1-通用商店，2-水晶商店，3-活动商店-int 
  shop_type = 3,    --商店类型：0-固定商店，1-随机商店，2-活动商店-int 
  default_create = 4,    --是否默认创建：0-默认不创建，1-默认创建-int 
  shop_name = 5,    --商店名称-string 
  order = 6,    --排序-int 
  function_id = 7,    --功能id-int 
  free_times_max = 8,    --免费刷新次数上限-int 
  free_times_time = 9,    --免费刷新次数+1的时间间隔(秒）-int 
  is_cost = 10,    --是否消耗刷新令：0-不消耗，1-消耗-int 
  type = 11,    --刷新消耗资源类型-int 
  value = 12,    --刷新消耗资源-int 
  size = 13,    --刷新消耗资源量-int 
  refresh_vip_type = 14,    --刷新次数关联的vip功能类型-int 
  cell_1 = 15,    --格子1-int 
  cell_2 = 16,    --格子2-int 
  cell_3 = 17,    --格子3-int 
  cell_4 = 18,    --格子4-int 
  cell_5 = 19,    --格子5-int 
  cell_6 = 20,    --格子6-int 
  tab_name1 = 21,    --页签名称-string 
  tab_name2 = 22,    --页签名称-string 
  tab_name3 = 23,    --页签名称-string 
  tab_name4 = 24,    --页签名称-string 
  tab_name5 = 25,    --页签名称-string 
  tab_name6 = 26,    --页签名称-string 
  tab_type = 27,    --页签类型-string 
  price1_type = 28,    --商店代币类型1-int 
  price1_value = 29,    --代币1-int 
  price2_type = 30,    --商店代币类型2-int 
  price2_value = 31,    --代币2-int 
  price3_type = 32,    --商店代币类型3-int 
  price3_value = 33,    --代币3-int 
  price4_type = 34,    --商店代币类型4-int 
  price4_value = 35,    --代币4-int 
  resource_type = 36,    --资源货币类型-int 
  npc_pic_id = 37,    --NPC图片资源-int 
  title = 38,    --商店标题-int 
  npc_dialog_id = 39,    --对应bubble的id-int 
  shop_voice = 40,    --商店语音资源-int 

}

-- data
local shop = {
    _data = {
        [1] = {1,1,0,1,"商城",1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,"道  具","商  品","玉  璧","","","","0|1|1",0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [2] = {2,1,0,1,"装备商店",4,24,0,0,0,0,0,0,0,0,0,0,0,0,0,"道  具","紫  装","橙  装","奖  励","","","0|0|0|0",5,10,6,18,5,1,0,0,0,0,0,0,0,},
        [3] = {3,1,1,1,"神兵商店",7,30,10,3600,1,5,8,20,9,1,2,3,4,5,6,"道  具","","","","","","0",5,8,5,2,5,1,0,0,0,0,0,0,0,},
        [4] = {4,1,0,1,"竞技商店",3,23,0,0,0,0,0,0,0,0,0,0,0,0,0,"道  具","武  将","奖  励","","","","0|0|0",5,7,5,2,5,1,0,0,0,0,0,0,0,},
        [5] = {5,1,0,1,"军团商店",6,36,0,0,0,0,0,0,0,0,0,0,0,0,0,"道  具","魏  国","蜀  国","吴  国","群  雄","","0|0|0|0",5,13,5,2,5,1,0,0,0,0,0,0,0,},
        [6] = {6,1,1,1,"武将商店",2,25,10,3600,1,5,9,20,2,1,2,3,4,5,6,"武  将","","","","","","0",5,9,5,2,5,1,0,0,0,0,0,0,0,},
        [7] = {7,1,0,1,"宝物商店",5,26,0,0,0,0,0,0,0,0,0,0,0,0,0,"道  具","紫  宝","橙  宝","","","","0|0|0",5,17,5,2,5,1,0,0,0,0,0,0,0,},
        [8] = {8,1,1,0,"觉醒商店",9,31,10,3600,1,5,14,20,11,1,1,2,3,4,5,"道  具","","","","","","",5,14,5,2,5,1,0,0,0,0,0,0,0,},
        [9] = {9,2,1,1,"每日特惠",1,616,10,0,0,0,0,0,0,1,1,1,1,1,1,"","","","","","","",5,20,5,2,5,1,0,0,0,0,0,0,0,},
        [10] = {10,2,0,1,"每周特惠",2,616,0,0,0,0,0,0,0,1,2,3,4,5,6,"","","","","","","",5,20,5,2,5,1,0,0,0,0,0,0,0,},
        [11] = {11,1,1,0,"神兽商店",9,947,10,3600,1,5,19,20,12,1,1,2,2,2,2,"","","","","","","",5,19,5,2,5,1,0,0,0,0,0,0,0,},
        [12] = {12,0,0,0,"半价物资",99,99001,0,0,0,0,0,0,0,1,0,0,0,0,0,"","","","","","","",0,0,0,0,0,0,0,0,0,0,0,0,0,},
        [13] = {13,3,2,1,"变身商店",77,97,0,0,0,0,0,0,0,0,0,0,0,0,0,"魏  国","蜀  国","吴  国","群  雄","","","0|0|0|0",5,24,6,83,6,84,6,147,0,0,0,0,0,},
        [14] = {14,3,2,1,"套装商店",88,100,0,0,0,0,0,0,0,0,0,0,0,0,0,"","","","","","","",0,0,0,0,6,86,0,0,0,0,0,0,0,},
        [15] = {15,1,0,1,"神兽商店",8,947,0,0,0,0,0,0,0,0,0,0,0,0,0,"道  具","","","","","","0",5,19,5,2,5,1,0,0,0,0,0,0,0,},
        [16] = {16,1,0,1,"觉醒商店",9,31,0,0,0,0,0,0,0,0,0,0,0,0,0,"道  具","蓝  色","紫  色","橙  色","红  色","","0|0|0|0|0",5,14,5,2,5,1,0,0,0,0,0,0,0,},
        [17] = {17,3,2,1,"观星商店",100,960,0,0,0,0,0,0,0,0,0,0,0,0,0,"","","","","","","",0,0,0,0,6,89,0,0,0,0,0,0,0,},
        [18] = {18,1,0,1,"战马商店",10,993,0,0,0,0,0,0,0,0,0,0,0,0,0,"战  马","马  具","","","","","0|0",5,28,6,98,6,99,0,0,0,0,0,0,0,},
        [19] = {19,3,0,1,"王者商店",10,1105,0,0,0,0,0,0,0,0,0,0,0,0,0,"","","","","","","",5,29,0,0,0,0,0,0,0,0,0,0,0,},
        [20] = {20,1,0,1,"原石商店",8,1301,0,0,0,0,0,0,0,0,0,0,0,0,0,"原  石","","","","","","0",5,30,5,2,5,1,0,0,0,0,0,0,0,},
        [21] = {21,3,2,1,"驯马商店",11,1400,0,0,0,0,0,0,0,0,0,0,0,0,0,"","","","","","","0",0,0,6,159,6,160,0,0,0,0,0,0,0,},
        [22] = {22,3,2,1,"周年庆商店",100,1601,0,0,0,0,0,0,0,0,0,0,0,0,0,"首  日","次  日","元  宝","兑  换","","","",0,0,5,1,5,31,0,0,0,0,0,0,0,},
        [23] = {24,3,0,1,"金将商店",100,723,0,0,0,0,0,0,0,0,0,0,0,0,0,"金  将","限  购","资  源","","","","0|0|0",5,32,0,0,0,0,0,0,0,0,0,0,0,},
        [24] = {25,3,0,1,"祈灵商店",100,190,0,0,0,0,0,0,0,0,0,0,0,0,0,"","","","","","","",0,0,6,89,6,718,0,0,0,0,0,0,0,},
        [25] = {26,3,2,1,"真武商店",100,1511,0,0,0,0,0,0,0,0,0,0,0,0,0,"道  具","兑  换","","","","","0|0",5,35,0,0,0,0,0,0,0,0,0,0,0,},
    }
}

-- index
local __index_shop_id = {
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
    [24] = 23,
    [25] = 24,
    [26] = 25,
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
        assert(__key_map[k], "cannot find " .. k .. " in shop")
        return t._raw[__key_map[k]]
    end
}

-- 
function shop.length()
    return #shop._data
end

-- 
function shop.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function shop.indexOf(index)
    if index == nil or not shop._data[index] then
        return nil
    end

    return setmetatable({_raw = shop._data[index]}, mt)
end

--
function shop.get(shop_id)
    
    return shop.indexOf(__index_shop_id[shop_id])
        
end

--
function shop.set(shop_id, tkey, nvalue)
    local record = shop.get(shop_id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function shop.index()
    return __index_shop_id
end

return shop