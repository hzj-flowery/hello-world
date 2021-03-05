--explore_discover

-- key
local __key_map = {
  id = 1,    --奇遇类型-int 
  name = 2,    --奇遇事件-string 
  res_id = 3,    --奇遇底座-string 
  res_id2 = 4,    --奇遇图标-string 
  res_id3 = 5,    --奇遇icon-string 
  description = 6,    --文本描述-string 
  time = 7,    --开启倒计时/秒-int 
  drop1_type = 8,    --掉落1类型-int 
  drop1_id = 9,    --掉落1id-int 
  drop2_type = 10,    --掉落2类型-int 
  drop2_id = 11,    --掉落2id-int 
  drop3_type = 12,    --掉落3类型-int 
  drop3_id = 13,    --掉落3id-int 
  drop4_type = 14,    --掉落4类型-int 
  drop4_id = 15,    --掉落4id-int 

}

-- data
local explore_discover = {
    _data = {
        [1] = {1,"水镜学堂","img_sjxt","sjxt","img_shuijingxuetang","",7200,0,0,0,0,0,0,0,0,},
        [2] = {2,"小游戏","img_smbx","0","","",0,0,0,0,0,0,0,0,0,},
        [3] = {3,"小游戏","img_smbx","0","","",0,0,0,0,0,0,0,0,0,},
        [4] = {4,"慕名而来","img_mmel","mmel","img_mumingerlai","听闻主公招贤纳士，无忧惊天不世之才！特来投奔！",28800,0,0,0,0,0,0,0,0,},
        [5] = {5,"半价物资","img_bjwz","bjwz","img_banjiawuzi","主公，这些都是走私过来的物资，只要主公愿意，我就把他们全部半价拿了！",7200,0,0,0,0,0,0,0,0,},
        [6] = {6,"洛阳之战","img_lyzl","lyzl","img_luoyangzhiluan","董卓挟持汉献帝刘协西走长安，并驱使洛阳数百万人口西迁长安。\n行前，西凉军大肆烧杀抢掠，洛阳周围二百里内尽成瓦砾。",7200,0,0,0,0,0,0,0,0,},
        [7] = {7,"董卓战乱","img_dzzl","dzzl","img_dongzhuozhiluan","权倾朝野，美人貂蝉，挟天子以令诸侯，谁能奈我何？",28800,0,0,0,0,0,0,0,0,},
        [8] = {8,"神秘宝箱","img_smbx","img_smbx_txt","img_shenmibaoxiang","此神秘宝箱乃夏商时期巧匠必胜心血所制，主公稍后片刻即可。",120,2,501,2,502,2,503,2,504,},
        [9] = {11,"游历跑图奖励_蓝色宝物","img_sjxt","","","",0,0,0,0,0,0,0,0,0,},
        [10] = {12,"游历跑图奖励_紫色碎片宝物","img_bjwz","","","",0,0,0,0,0,0,0,0,0,},
        [11] = {13,"游历跑图奖励_紫色完整宝物","img_bjwz","","","",0,0,0,0,0,0,0,0,0,},
        [12] = {14,"游历跑图奖励_橙色碎片宝物","img_lyzl","","","",0,0,0,0,0,0,0,0,0,},
        [13] = {15,"游历跑图奖励_橙色完整宝物","img_lyzl","","","",0,0,0,0,0,0,0,0,0,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [11] = 9,
    [12] = 10,
    [13] = 11,
    [14] = 12,
    [15] = 13,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in explore_discover")
        return t._raw[__key_map[k]]
    end
}

-- 
function explore_discover.length()
    return #explore_discover._data
end

-- 
function explore_discover.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function explore_discover.indexOf(index)
    if index == nil or not explore_discover._data[index] then
        return nil
    end

    return setmetatable({_raw = explore_discover._data[index]}, mt)
end

--
function explore_discover.get(id)
    
    return explore_discover.indexOf(__index_id[id])
        
end

--
function explore_discover.set(id, key, value)
    local record = explore_discover.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function explore_discover.index()
    return __index_id
end

return explore_discover