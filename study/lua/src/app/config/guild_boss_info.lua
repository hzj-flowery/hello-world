--guild_boss_info

-- key
local __key_map = {
  id = 1,    --id-int 
  type = 2,    --怪物类型-int 
  group = 3,    --BOSS组-int 
  monster_team_id = 4,    --怪物组id-int 
  battle_scene = 5,    --战斗场景-int 
  city_name = 6,    --城池名称-string 
  name = 7,    --名称-string 
  x = 8,    --x坐标-int 
  y = 9,    --y坐标-int 
  city_pic = 10,    --城池图片-string 
  name_pic_lock = 11,    --未解锁名称-string 
  name_pic = 12,    --名称-string 
  hero_id = 13,    --武将id-int 
  image = 14,    --名称图片-string 
  boss_bubble = 15,    --boss对话-string 

}

-- data
local guild_boss_info = {
    _data = {
        [1] = {1,1,1,5400001,1,"兖州","华雄",-100,90,"yanzhou_xuzhou","","txt_guild_chouzhou",406,"txt_boss_lvbu01","1401|1402|1403|1404",},
        [2] = {2,1,1,5400002,2,"徐州","公孙瓒",-320,50,"yanzhou_xuzhou","","txt_guild_xuzhou",408,"txt_boss_sunce01","1401|1402|1403|1404",},
        [3] = {3,1,2,5400003,3,"西城","庞统",-270,-100,"xicheng_jieting","","txt_guild_xiyu",211,"txt_boss_zhaoyun01","1401|1402|1403|1404",},
        [4] = {4,1,2,5400004,4,"街亭","徐庶",-100,-130,"xicheng_jieting","","txt_guild_jieting",212,"txt_boss_caocao01","1401|1402|1403|1404",},
        [5] = {5,1,3,5400005,5,"夏口","甘宁",310,-190,"xiakou_sanjiangkou","","txt_guild_xiakou",308,"txt_boss_lvbu01","1401|1402|1403|1404",},
        [6] = {6,1,3,5400006,6,"三江口","吕蒙",170,-75,"xiakou_sanjiangkou","","txt_guild_sanjiangkou",307,"txt_boss_sunce01","1401|1402|1403|1404",},
        [7] = {7,1,4,5400007,7,"仓亭","曹仁",270,74,"changting_wucao","","txt_guild_cangting",106,"txt_boss_zhaoyun01","1401|1402|1403|1404",},
        [8] = {8,1,4,5400008,8,"乌巢","张郃",80,150,"changting_wucao","","txt_guild_wucao",110,"txt_boss_caocao01","1401|1402|1403|1404",},
        [9] = {9,2,4,5400012,9,"","魏武帝曹操",390,160,"","txt_guild_caocao01","txt_guild_caocao",103,"txt_boss_caocao01","1401|1402|1403|1404",},
        [10] = {10,2,2,5400010,10,"","卧龙诸葛亮",-420,-165,"","txt_guild_zhugeliang01","txt_guild_zhugeliang",203,"txt_boss_sunce01","1401|1402|1403|1404",},
        [11] = {11,2,3,5400011,11,"","大都督周瑜",440,-80,"","txt_guild_zhouyu01","txt_guild_zhouyu",303,"txt_boss_zhaoyun01","1401|1402|1403|1404",},
        [12] = {12,2,1,5400009,12,"","战神吕布",-300,150,"","txt_guild_lvbu01","txt_guild_lvbu",403,"txt_boss_lvbu01","1401|1402|1403|1404",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
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
        assert(__key_map[k], "cannot find " .. k .. " in guild_boss_info")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_boss_info.length()
    return #guild_boss_info._data
end

-- 
function guild_boss_info.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_boss_info.indexOf(index)
    if index == nil or not guild_boss_info._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_boss_info._data[index]}, mt)
end

--
function guild_boss_info.get(id)
    
    return guild_boss_info.indexOf(__index_id[id])
        
end

--
function guild_boss_info.set(id, key, value)
    local record = guild_boss_info.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function guild_boss_info.index()
    return __index_id
end

return guild_boss_info