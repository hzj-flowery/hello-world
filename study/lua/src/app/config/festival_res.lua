--festival_res

-- key
local __key_map = {
  id = 1,    --排序id-int 
  res_type = 2,    --类型-int 
  res_name = 3,    --资源名称-string 
  icon = 4,    --function_id-int 
  front_eft = 5,    --前层特效（最前面）-string 
  back_eft = 6,    --远景特效（远景前，中景后）-string 
  if_blind = 7,    --底部ui是否带窗帘（1-带，2-不带）-int 
  res_id = 8,    --资源1-界面内标题/说明背景-string 
  res_id_2 = 9,    --资源2-界面周边背景/说明标题衬底-string 
  res_id_3 = 10,    --资源3-大底框-string 
  res_id_4 = 11,    --资源4-按钮-string 
  color_1 = 12,    --说明标题色-string 
  color_2 = 13,    --说明文本色-string 
  color_3 = 14,    --说明文本特殊色-string 
  color_4 = 15,    --警告文本色-string 
  color_4_1 = 16,    --警告文本描边色-string 
  color_5 = 17,    --按钮上的字色-string 
  res_zoom = 18,    --缩小比例-int 

}

-- data
local festival_res = {
    _data = {
        [1] = {1,2,"欢庆佳节-废弃",621,"huanqingduanwu_front","",0,"ui3/happyholiday/happyholiday_title_di.png","","","","","","","","","",1000,},
        [2] = {2,2,"欢庆佳节-废弃",622,"","qingliangyixia_front",0,"ui3/happyholiday/happyholiday_title_di3.png","","","","","","","","","",1000,},
        [3] = {3,2,"武将-废弃",0,"","",0,"icon/main/btn_main_enter_character.png","","","","","","","","","",800,},
        [4] = {4,2,"装备-废弃",0,"","",0,"icon/main/btn_main_enter_equip.png","","","","","","","","","",800,},
        [5] = {5,2,"宝物-废弃",0,"","",0,"icon/main/btn_main_enter_treasure.png","","","","","","","","","",800,},
        [6] = {6,2,"神兵-废弃",0,"","",0,"icon/instrument/302.png","","","","","","","","","",800,},
        [7] = {7,2,"财宝-废弃",0,"","",0,"icon/common/img_mapbox_guan.png","","","","","","","","","",800,},
        [8] = {8,2,"说明-通用",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/happyholiday_yuanxiao_wenzi.png","","","0xf8f1da","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [9] = {9,2,"说明-中秋、国庆",0,"","",0,"ui3/happyholiday/happyholiday_shiyi_bg02.jpg","ui3/happyholiday/happyholiday_bg02.png","","","0xf05829","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [10] = {10,2,"说明-七夕",0,"","",0,"ui3/happyholiday/happyholiday_qixi_bg02.jpg","ui3/happyholiday/happyholiday_bg02.png","","","0xf05829","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [11] = {11,2,"说明-双十一",0,"","",0,"ui3/happyholiday/happyholiday_shuangshiyi_bg02.jpg","ui3/happyholiday/happyholiday_bg02.png","","","0xf05829","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [12] = {12,2,"欢庆佳节-通用",627,"tongyong","",1,"ui3/happyholiday/happyholiday_title_tongyong.png","ui3/happyholiday/happyholiday_zhongqiu_bg.jpg","","","","","","","","",1000,},
        [13] = {13,2,"欢庆佳节-七夕",623,"qixi","",1,"ui3/happyholiday/happyholiday_qixi_title.png","ui3/happyholiday/happyholiday_qixi_bg02.jpg","","","","","","","","",1000,},
        [14] = {14,2,"欢庆佳节-中秋",624,"zhongqiu","",1,"ui3/happyholiday/happyholiday_zhongqiu_title.png","ui3/happyholiday/happyholiday_zhongqiu_bg.jpg","","","","","","","","",1000,},
        [15] = {15,2,"欢庆佳节-国庆",625,"zhongqiu","",1,"ui3/happyholiday/happyholiday_shiyi_title.png","ui3/happyholiday/happyholiday_zhongqiu_bg.jpg","","","","","","","","",1000,},
        [16] = {16,2,"欢庆佳节-双十一",628,"shuangshiyi","",2,"","ui3/happyholiday/happyholiday_shuangshiyi_bg.jpg","","","","","","","","",1000,},
        [17] = {17,2,"欢庆佳节-合服",629,"tongyong","",1,"ui3/happyholiday/happyholiday_hefu2_title.png","ui3/happyholiday/happyholiday_zhongqiu_bg.jpg","","","","","","","","",1000,},
        [18] = {18,2,"欢庆佳节-双十二",630,"","",2,"ui3/happyholiday/happyholiday_shuangshier_title.png","ui3/happyholiday/happyholiday_shuangshiyi_bg.jpg","","","","","","","","",1000,},
        [19] = {19,2,"欢庆佳节-圣诞",631,"shengdan_front","shengdan_back",1,"ui3/happyholiday/happyholiday_mc_title.png","ui3/happyholiday/happyholiday_mc_bg.jpg","","","","","","","","",1000,},
        [20] = {20,2,"欢庆佳节-元旦",632,"yuandan","yuandan_back",2,"ui3/happyholiday/happyholiday_xinnian_biaoti_zi1.png","ui3/happyholiday/happyholiday_xinnian_bg.jpg","","","","","","","","",1000,},
        [21] = {21,2,"说明-圣诞",0,"","",0,"ui3/happyholiday/happyholiday_mc_bg03.jpg","ui3/happyholiday/happyholiday_bg02.png","","","0xf05829","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [22] = {22,2,"说明-元旦",0,"","",0,"ui3/happyholiday/happyholiday_yuandan_bg02.jpg","ui3/happyholiday/happyholiday_bg02.png","","","0xf05829","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [23] = {23,2,"欢庆佳节-春节",633,"xinnian","yuandan_back",0,"ui3/happyholiday/happyholiday_xinnian_biaoti_zi2.png","ui3/happyholiday/happyholiday_xinnian_bg.jpg","","","","","","","","",1000,},
        [24] = {24,2,"说明-春节",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/happyholiday_yuanxiao_wenzi.png","","","0xf8f1da","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [25] = {25,2,"欢庆佳节-元宵节",634,"huodongyuanxiao","huodongyuanxiaoback",0,"ui3/happyholiday/happyholiday_xinnian_biaoti_zi3.png","ui3/happyholiday/happyholiday_yuanxiao_bg.jpg","","","","","","","","",1000,},
        [26] = {26,2,"说明-元宵节",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/happyholiday_yuanxiao_wenzi.png","","","0xf8f1da","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [27] = {27,2,"欢庆佳节-女神节",635,"huodongnvshen","",0,"ui3/happyholiday/happyholiday_nvshenjie_biaoti.png","ui3/happyholiday/happyholiday_nvshenjie_bg.jpg","","","","","","","","",500,},
        [28] = {28,2,"说明-女神节",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/happyholiday_yuanxiao_wenzi.png","","","0xf8f1da","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [29] = {29,2,"欢庆佳节-清明",636,"tongyong","",1,"ui3/happyholiday/happyholiday_title_taqing.png","ui3/happyholiday/happyholiday_zhongqiu_bg.jpg","","","","","","","","",1000,},
        [30] = {30,2,"说明-清明",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/happyholiday_yuanxiao_wenzi.png","","","0xf8f1da","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [31] = {31,2,"欢庆佳节-五一",637,"huodonggengyun","",0,"ui3/happyholiday/happyholiday_wuyi_biaoti_zi2.png","ui3/happyholiday/happyholiday_wuyi_bg.jpg","","","","","","","","",1000,},
        [32] = {32,2,"说明-五一",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/happyholiday_yuanxiao_wenzi.png","","","0xf8f1da","0xb66511","0x2f9f07","0x2f9f07","","",1000,},
        [33] = {33,1,"欢庆佳节-夏季通用",639,"huodongxiaji","",0,"ui3/happyholiday/img_holiay_changshuangshengxia_txt01.png","ui3/happyholiday/xiari_di.jpg","ui3/happyholiday/img_holiay_changshuangshengxia_board01.png","ui3/happyholiday/happyholiday_an.png","","","","0x8fb0dc","","0xd7efff",1000,},
        [34] = {34,3,"说明-夏季通用",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/img_holiay_changshuangshengxia_txtbg01.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
        [35] = {35,1,"欢庆佳节-七夕",640,"huodong_qixiwugui","",0,"ui3/happyholiday/qixi_biaotou.png","ui3/happyholiday/qixi_bg.jpg","ui3/happyholiday/qixi_kuang.png","ui3/happyholiday/qixi_button.png","","","","0xefc0ff","","0xf5dbff",1000,},
        [36] = {36,3,"说明-七夕",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/diban_wenben03.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
        [37] = {37,4,"宣传-七夕",0,"","",0,"ui3/happyholiday/qixi.jpg","","","","","","","","","",1000,},
        [38] = {38,1,"欢庆佳节-合服",629,"huodongxiaji","",0,"ui3/happyholiday/img_holiay_hefuqindian_txt01.png","ui3/happyholiday/xiari_di.jpg","ui3/happyholiday/img_holiay_changshuangshengxia_board01.png","ui3/happyholiday/happyholiday_an.png","","","","0x8fb0dc","","0xd7efff",1000,},
        [39] = {39,3,"说明-合服",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/img_holiay_changshuangshengxia_txtbg01.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
        [40] = {40,1,"欢庆佳节-国庆",641,"huodong_guoqing","huodongguoqing_back",0,"ui3/happyholiday/img_holiay_guoqing_txt01.png","ui3/happyholiday/img_holiay_guoqing_bg01.jpg","ui3/happyholiday/img_holiay_guoqing_board01.png","ui3/happyholiday/happyholiday_an.png","","","","0x8fb0dc","","0xd7efff",1000,},
        [41] = {41,3,"说明-国庆",0,"","",0,"ui3/happyholiday/happyholiday_yuanxiao_bg02.jpg","ui3/happyholiday/img_holiay_changshuangshengxia_txtbg01.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
        [42] = {42,4,"宣传-国庆",0,"","",0,"ui3/happyholiday/guoqing.jpg","","","","","","","","","",1000,},
        [43] = {43,1,"欢庆佳节-秋季通用",642,"huodongqiuri_front","huodongqiuri_back",0,"ui3/happyholiday/img_holiay_qiurihuodong_title01.png","ui3/happyholiday/img_holiay_qiurihuodong_bg01.png","ui3/happyholiday/img_holiay_qiurihuodong_board01.png","ui3/happyholiday/happyholiday_an.png","","","","0x8fb0dc","","0xd7efff",1000,},
        [44] = {44,3,"说明-秋季通用",0,"","",0,"","ui3/happyholiday/img_holiay_changshuangshengxia_txtbg01.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
        [45] = {45,1,"欢庆佳节-双11狂欢",643,"huodongshuangshiyi_front","huodongshuangshiyi_back",0,"ui3/happyholiday/img_holiay_shuangshiyi_txt01.png","ui3/happyholiday/img_shuangshiyi.jpg","ui3/happyholiday/img_holiay_shuangshiyi_board01.png","ui3/happyholiday/anniu_shuangshiyi01.png","","","","0x8fb0dc","","0xffdcbf",1000,},
        [46] = {46,3,"说明-双11狂欢",0,"","",0,"","ui3/happyholiday/img_holiay_changshuangshengxia_txtbg01.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
        [47] = {47,1,"欢庆佳节-年终盛典",644,"huodongshuangshiyi_front","huodongshuangshiyi_back",0,"ui3/happyholiday/img_holiay_shuangshiyi_txt01.png","ui3/happyholiday/img_shuangshiyi.jpg","ui3/happyholiday/img_holiay_shuangshiyi_board01.png","ui3/happyholiday/anniu_shuangshiyi01.png","","","","0xdfc8c1","0x854f45","0xffdcbf",1000,},
        [48] = {48,3,"说明-年终盛典",0,"","",0,"","ui3/happyholiday/img_holiay_changshuangshengxia_txtbg01.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
        [49] = {49,1,"欢庆佳节-快乐圣诞",645,"shengdanjie_ui_front","shengdanjie_ui_back",0,"ui3/happyholiday/img_holiay_shengdanjie_txt01.png","ui3/happyholiday/img_shengdanjie.jpg","ui3/happyholiday/img_holiay_shengdanjie_board01.png","ui3/happyholiday/anniu_shengdanjie01.png","","","","0xeef6f9","0x56adcc","0xffc5a6",1000,},
        [50] = {50,3,"说明-快乐圣诞",0,"","",0,"","ui3/happyholiday/img_holiay_changshuangshengxia_txtbg01.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
        [51] = {51,1,"欢庆佳节-喜迎新春",646,"xiyingxinchun_ui","xiyingxinchun_back",0,"ui3/happyholiday/img_holiay_chunjie_title01.png","ui3/happyholiday/chunjie_bg.jpg","ui3/happyholiday/img_holiay_chunjie_board01.png","ui3/happyholiday/anniu_chunjie02.png","","","","0xffffff","0x991d21","0xffd460",1000,},
        [52] = {52,3,"说明-喜迎新春",0,"","",0,"","ui3/happyholiday/img_holiay_changshuangshengxia_txtbg01.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
        [53] = {53,1,"欢庆佳节-和煦阳春",647,"huodong_chunjihuodong","",0,"ui3/happyholiday/img_holiay_hexuyangchun_txt01.png","ui3/happyholiday/img_hexuyangchun.jpg","ui3/happyholiday/img_holiay_hexuyangchun_board01.png","ui3/happyholiday/anniu_chunjie02.png","","","","0xffffff","0x991d21","0xffd460",1000,},
        [54] = {54,3,"说明-和煦阳春",0,"","",0,"","ui3/happyholiday/img_holiay_changshuangshengxia_txtbg01.png","","","0xe76b52","0xb66511","0x2f9f07","","","",1000,},
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
    [30] = 30,
    [31] = 31,
    [32] = 32,
    [33] = 33,
    [34] = 34,
    [35] = 35,
    [36] = 36,
    [37] = 37,
    [38] = 38,
    [39] = 39,
    [4] = 4,
    [40] = 40,
    [41] = 41,
    [42] = 42,
    [43] = 43,
    [44] = 44,
    [45] = 45,
    [46] = 46,
    [47] = 47,
    [48] = 48,
    [49] = 49,
    [5] = 5,
    [50] = 50,
    [51] = 51,
    [52] = 52,
    [53] = 53,
    [54] = 54,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in festival_res")
        return t._raw[__key_map[k]]
    end
}

-- 
function festival_res.length()
    return #festival_res._data
end

-- 
function festival_res.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function festival_res.indexOf(index)
    if index == nil or not festival_res._data[index] then
        return nil
    end

    return setmetatable({_raw = festival_res._data[index]}, mt)
end

--
function festival_res.get(id)
    
    return festival_res.indexOf(__index_id[id])
        
end

--
function festival_res.set(id, tkey, nvalue)
    local record = festival_res.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function festival_res.index()
    return __index_id
end

return festival_res