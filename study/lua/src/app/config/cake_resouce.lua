--cake_resouce

-- key
local __key_map = {
  type = 1,    --活动类型-int 
  type_name = 2,    --盛宴吃的啥-string 
  icon = 3,    --活动icon-string 
  icon_word = 4,    --活动icon文字-string 
  effect_a = 5,    --前特效-string 
  xy_1 = 6,    --前坐标-string 
  effect_b = 7,    --后特效-string 
  xy_2 = 8,    --后坐标-string 
  gain_icon = 9,    --获取材料icon-string 
  gain_icon_word = 10,    --获取材料icon文字-string 
  cake_map1 = 11,    --本服场景-int 
  cake_map2 = 12,    --跨服场景-int 
  gift1_item_id = 13,    --礼物1ID-int 
  gift1_resouce = 14,    --礼物1资源-string 
  gift1_time = 15,    --礼物1持久度/s-int 
  gift1_moving = 16,    --礼物1动画-string 
  gift1_point = 17,    --礼物1积分功绩-int 
  gift1_max1 = 18,    --礼物1本服每天限制-int 
  gift1_max2 = 19,    --礼物1跨服每天限制-int 
  gift2_item_id = 20,    --礼物2ID-int 
  gift2_resouce = 21,    --礼物2资源-string 
  gift2_time = 22,    --礼物2持久度/s-int 
  gift2_moving = 23,    --礼物2动画-string 
  gift2_point = 24,    --礼物2积分功绩-int 
  gift2_max1 = 25,    --礼物2本服每天限制-int 
  gift2_max2 = 26,    --礼物2跨服每天限制-int 
  gift3_item_id = 27,    --礼物3ID-int 
  gift3_resouce = 28,    --礼物3资源-string 
  gift3_time = 29,    --礼物3持久度/s-int 
  gift3_moving = 30,    --礼物3动画-string 
  gift3_point = 31,    --礼物3积分功绩-int 
  gift3_max1 = 32,    --礼物3本服每天限制-int 
  gift3_max2 = 33,    --礼物3跨服每天限制-int 
  cake_name1 = 34,    --页签一名称-string 
  cake_name2 = 35,    --页签二名称-string 

}

-- data
local cake_resouce = {
    _data = {
        [1] = {1,"蛋糕","btn_main_enter3_dangao","txt_main_enter3_zhounianqing","effect_youxiangtishi","0|4","effect_youxiangtishi_b","0|4","btn_main_enter6_cailiao","txt_main_enter6_cailiaohuoqu",2003,2004,570,"img_prop_egg",2,"effect_dangao_jidan",3,13600,40800,571,"img_prop_cream",3,"effect_dangao_naiyou",10,0,0,572,"img_prop_fruits",5,"effect_dangao_shuiguo",100,0,0,"获取鸡蛋","获取奶油",},
        [2] = {2,"火锅","btn_main_enter2_taotieshengyan","txt_main_enter3_zhounianqing","effect_ui_huoguo","0|0","effect_youxiangtishi_b","0|4","btn_main_enter6_cailiao2","txt_main_enter6_cailiaohuoqu2",2007,2008,573,"img_prop_mushrooms",2,"effect_dangao_xianggu",3,13600,40800,574,"img_prop_beef",3,"effect_dangao_niurou",10,0,0,575,"img_prop_seafood",5,"effect_dangao_haixian",100,0,0,"获取香菇","获取肥牛",},
        [3] = {3,"烧烤","btn_main_enter2_taotiekaorou","txt_main_enter3_zhounianqing","effect_ui_huoguo","0|0","effect_youxiangtishi_b","0|4","btn_main_enter6_cailiao3","txt_main_enter6_cailiaohuoqu3",2009,2010,576,"img_prop_vegetable",2,"effect_dangao_vegetable",3,13600,40800,577,"img_prop_meat",3,"effect_dangao_meat",10,0,0,578,"img_prop_lamb",5,"effect_dangao_lamb",100,0,0,"获取蔬菜","获取牛肉",},
        [4] = {4,"年夜饭","btn_main_enter2_taotieshengyan03","txt_main_enter3_zhounianqing","effect_ui_huoguo","0|0","effect_youxiangtishi_b","0|4","btn_main_enter6_cailiao4","txt_main_enter6_homeland_shengcaiyouji",2012,2013,579,"img_prop_tofu",2,"effect_nianyefan_doufu",3,13600,40800,580,"img_prop_chicken",3,"effect_nianyefan_chicken",10,0,0,581,"img_prop_fish",5,"effect_nianyefan_fish",100,0,0,"富贵富足","生财有计",},
    }
}

-- index
local __index_type = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in cake_resouce")
        return t._raw[__key_map[k]]
    end
}

-- 
function cake_resouce.length()
    return #cake_resouce._data
end

-- 
function cake_resouce.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function cake_resouce.indexOf(index)
    if index == nil or not cake_resouce._data[index] then
        return nil
    end

    return setmetatable({_raw = cake_resouce._data[index]}, mt)
end

--
function cake_resouce.get(type)
    
    return cake_resouce.indexOf(__index_type[type])
        
end

--
function cake_resouce.set(type, tkey, nvalue)
    local record = cake_resouce.get(type)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function cake_resouce.index()
    return __index_type
end

return cake_resouce