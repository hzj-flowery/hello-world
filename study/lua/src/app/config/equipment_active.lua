--equipment_active

-- key
local __key_map = {
  id = 1,    --编号-int 
  money = 2,    --充值额度-int 
  money_type = 3,    --充值给予奖励类型-int 
  money_value = 4,    --充值给予奖励类型值-int 
  money_size = 5,    --充值给予奖励数量-int 
  toplimit = 6,    --每日充值获得次数上限-int 
  name1 = 7,    --抽奖名称1-string 
  day_free1 = 8,    --每日免费次数1-int 
  consume_time1 = 9,    --每次消耗次数1-int 
  name2 = 10,    --抽奖名称2-string 
  hit_num = 11,    --追击次数-int 
  consume_time2 = 12,    --每次消耗次数2-int 
  drop = 13,    --掉落库-string 
  fragment = 14,    --碎片ID-string 
  back_name = 15,    --背景星星资源名-string 
  pic_name = 16,    --背景图资源名-string 
  title_name = 17,    --活动标题资源名-string 
  time_name = 18,    --倒计时描述-string 
  hit_chat_1 = 19,    --被击喊话1-string 
  hit_chat_2 = 20,    --被击喊话2-string 
  hit_chat_3 = 21,    --被击喊话3-string 
  hit_chat_4 = 22,    --被击喊话4-string 
  hit_chat_5 = 23,    --被击喊话5-string 
  chat_1 = 24,    --常规喊话1-string 
  chat_2 = 25,    --常规喊话2-string 
  chat_3 = 26,    --常规喊话3-string 
  chat_4 = 27,    --常规喊话4-string 
  chat_5 = 28,    --常规喊话5-string 

}

-- data
local equipment_active = {
    _data = {
        [1] = {1,20,6,95,1,9999,"追击1次",5,1,"追击10次",10,1,"1001","","","","","","英雄别打我了！嘤嘤嘤~~~","英雄手下留情，我给你好东西！","痛哉！痛哉！给你！","来呀，追我呀，来啊来啊来啊。","别打了，装备都给你！","说我的战袍可换红装的定是那孙刘的阴谋！","哼！你若追得上我，红装双手奉上。","你可是名将，不要为了几件红装背叛朝廷！","何以解忧，唯有红装！","设使天下无有孤，不知当几人有红装",},
        [2] = {2,20,6,95,1,9999,"追击1次",5,1,"追击10次",10,1,"1002","","","","","","英雄别打我了！嘤嘤嘤~~~","英雄手下留情，我给你好东西！","痛哉！痛哉！给你！","来呀，追我呀，来啊来啊来啊。","别打了，装备都给你！","说我的战袍可换红装的定是那孙刘的阴谋！","哼！你若追得上我，红装双手奉上。","你可是名将，不要为了几件红装背叛朝廷！","何以解忧，唯有红装！","设使天下无有孤，不知当几人有红装",},
        [3] = {1001,20,6,94,1,0,"观星1次",5,1,"观星10次",10,1,"2001","","guanxingxing","moving_guanxing","img_activity_guanxing_title","青龙消失倒计时","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了",},
        [4] = {1002,20,6,94,1,0,"观星1次",5,1,"观星10次",10,1,"2002|2001","","guanxingxuanwu|guanxingxing","moving_guanxing_xuanwu|moving_guanxing","img_activity_guanxing_title2|img_activity_guanxing_title","玄武消失倒计时|青龙消失倒计时","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了",},
        [5] = {1003,20,6,94,1,0,"观星1次",5,1,"观星10次",10,1,"2002|2004|2003|2001","100008|100005|100009|100006","guanxingxuanwu|guanxingbaihu|guanxingkun|guanxingxing","moving_guanxing_xuanwu|moving_guanxing_baihu|moving_guanxing_kun|moving_guanxing","img_activity_guanxing_title2|img_activity_baihu_title|img_activity_shengkun_title|img_activity_guanxing_title","消失倒计时|消失倒计时|消失倒计时|消失倒计时","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了",},
        [6] = {1004,20,6,94,1,0,"观星1次",5,1,"观星10次",10,1,"2002|2007|2004|2005|2008|2003|2001|2006","100008|100011|100005|100010|100012|100009|100006|100007","guanxingxuanwu|guanxingnianshou|guanxingbaihu|guanxingqilin|guanxingbaize|guanxingkun|guanxingxing|guanxingzhuque","moving_guanxing_xuanwu|moving_guanxing_nianshou|moving_guanxing_baihu|moving_guanxing_qilin|moving_guanxing_baize|moving_guanxing_kun|moving_guanxing|moving_guanxing_zhuque","img_activity_guanxing_title2|img_activity_nianshou_title|img_activity_baihu_title|img_activity_qilin_title|img_activity_baize_title|img_activity_shengkun_title|img_activity_guanxing_title|img_activity_zhuque_title","消失倒计时|消失倒计时|消失倒计时|消失倒计时|消失倒计时|消失倒计时|消失倒计时|消失倒计时","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了",},
        [7] = {1005,20,6,94,1,0,"观星1次",5,1,"观星10次",10,1,"2002|2007|2004|2005|2008|2003|2001|2006|2009","100008|100011|100005|100010|100012|100009|100006|100007|6559","guanxingxuanwu|guanxingnianshou|guanxingbaihu|guanxingqilin|guanxingbaize|guanxingkun|guanxingxing|guanxingzhuque|guanxinghong","moving_guanxing_xuanwu|moving_guanxing_nianshou|moving_guanxing_baihu|moving_guanxing_qilin|moving_guanxing_baize|moving_guanxing_kun|moving_guanxing|moving_guanxing_zhuque|moving_guanxing_hong","img_activity_guanxing_title2|img_activity_nianshou_title|img_activity_baihu_title|img_activity_qilin_title|img_activity_baize_title|img_activity_shengkun_title|img_activity_guanxing_title|img_activity_zhuque_title|img_activity_zhenyuan_title","消失倒计时|消失倒计时|消失倒计时|消失倒计时|消失倒计时|消失倒计时|消失倒计时|消失倒计时|消失倒计时","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了","憋打了",},
        [8] = {1401,20,6,159,1,0,"驯马1次",5,1,"驯马10次",10,1,"4001|4002","","","","","","","","","","","","","","","",},
        [9] = {1501,20,6,159,1,0,"驯马1次",5,1,"驯马10次",10,1,"5010|5012|5013|5014|5011|5009|5015","120010|120012|120015|120016|120011|120009|120017","","812|810|815|816|811|809|817","txt_xunma_chengma01|txt_xunma_chengma02|txt_xunma_chengma05|txt_xunma_chengma06|txt_xunma_chengma03|txt_xunma_chengma04|txt_xunma_chengma07","乌云踏雪离开倒计时|夜照玉狮离开倒计时|奔雷青骢离开倒计时|铁血红鬃离开倒计时|胭脂火龙离开倒计时|飞霜千里离开倒计时|暗夜紫骍离开倒计时","","","","","","酒且斟下，某去便来。","看尔等插标卖首","玉可碎而不可改其白，竹可焚而不可毁其节。","一骑绝尘走千里，五关斩将震坤乾。","此等小事难不倒我关某！",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [1001] = 3,
    [1002] = 4,
    [1003] = 5,
    [1004] = 6,
    [1005] = 7,
    [1401] = 8,
    [1501] = 9,
    [2] = 2,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in equipment_active")
        return t._raw[__key_map[k]]
    end
}

-- 
function equipment_active.length()
    return #equipment_active._data
end

-- 
function equipment_active.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function equipment_active.indexOf(index)
    if index == nil or not equipment_active._data[index] then
        return nil
    end

    return setmetatable({_raw = equipment_active._data[index]}, mt)
end

--
function equipment_active.get(id)
    
    return equipment_active.indexOf(__index_id[id])
        
end

--
function equipment_active.set(id, tkey, nvalue)
    local record = equipment_active.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function equipment_active.index()
    return __index_id
end

return equipment_active