--daily_dungeon_type

-- key
local __key_map = {
  id = 1,    --编号-int 
  name = 2,    --副本名称-string 
  build = 3,    --建筑样式-string 
  x_position = 4,    --建筑名称X坐标-int 
  y_position = 5,    --建筑名称Y坐标-int 
  pic = 6,    --图片名称-string 
  win_type = 7,    --胜利条件-int 
  daily_times = 8,    --每日攻打次数上限-int 
  dungeon_round = 9,    --最高战斗回合数（每场）-int 
  week_open_queue = 10,    --每周开放时间序列-string 

}

-- data
local daily_dungeon_type = {
    _data = {
        [1] = {1,"武将经验","1",-145,57,"txt_wujiangjingyan05",1,2,10,"1010101",},
        [2] = {2,"银两","2",80,59,"txt_yingliang07",1,2,10,"1111111",},
        [3] = {3,"突破丹","3",-85,63,"txt_rupodan06",1,2,10,"1101010",},
        [4] = {4,"装备精炼石","4",-140,19,"txt_zhuangbeijinglianshi02",1,2,10,"1101010",},
        [5] = {5,"宝物经验","5",-95,53,"txt_jingyanbaowu04",1,2,10,"1010101",},
        [6] = {6,"宝物精炼石","6",-103,13,"txt_baowuijinglianshi03",1,2,10,"1101010",},
        [7] = {7,"神兵进阶石","7",104,65,"txt_shenbingjinjieshi01",1,2,10,"1010101",},
        [8] = {8,"神兽经验","8",65,5,"txt_shenshoujingyan08",1,2,10,"1010101",},
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
    [8] = 8,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in daily_dungeon_type")
        return t._raw[__key_map[k]]
    end
}

-- 
function daily_dungeon_type.length()
    return #daily_dungeon_type._data
end

-- 
function daily_dungeon_type.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function daily_dungeon_type.indexOf(index)
    if index == nil or not daily_dungeon_type._data[index] then
        return nil
    end

    return setmetatable({_raw = daily_dungeon_type._data[index]}, mt)
end

--
function daily_dungeon_type.get(id)
    
    return daily_dungeon_type.indexOf(__index_id[id])
        
end

--
function daily_dungeon_type.set(id, key, value)
    local record = daily_dungeon_type.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function daily_dungeon_type.index()
    return __index_id
end

return daily_dungeon_type