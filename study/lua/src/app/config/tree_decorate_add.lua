--tree_decorate_add

-- key
local __key_map = {
  type = 1,    --装饰类型-int 
  level = 2,    --装饰等级-int 
  name = 3,    --装饰名称-string 
  limit_tree_level = 4,    --需求主树等级-int 
  adorn_type_1 = 5,    --限制装饰类型1-int 
  adorn_level_1 = 6,    --限制装饰等级1-int 
  adorn_type_2 = 7,    --限制装饰类型2-int 
  adorn_level_2 = 8,    --限制装饰等级2-int 
  type_1 = 9,    --消耗道具1类型-int 
  value_1 = 10,    --消耗道具1类型值-int 
  size_1 = 11,    --消耗道具1数量-int 
  type_2 = 12,    --消耗道具2类型-int 
  value_2 = 13,    --消耗道具2类型值-int 
  size_2 = 14,    --消耗道具2数量-int 
  experience_value = 15,    --提供主树经验值-int 
  attribute_type1 = 16,    --属性1类型-int 
  attribute_value1 = 17,    --属性1类型值-int 
  attribute_type2 = 18,    --属性2类型-int 
  attribute_value2 = 19,    --属性2类型值-int 
  attribute_type3 = 20,    --属性3类型-int 
  attribute_value3 = 21,    --属性3类型值-int 
  attribute_type4 = 22,    --属性4类型-int 
  attribute_value4 = 23,    --属性4类型值-int 
  all_combat = 24,    --总战力-int 
  detail_draw = 25,    --详情界面资源图-string 
  spine_res = 26,    --装饰资源图-string 
  animation_name = 27,    --装饰动画资源-string 
  moving_name = 28,    --装饰动画资源-string 
  spine_x = 29,    --spine坐标x-int 
  spine_y = 30,    --spine坐标y-int 
  height = 31,    --点击区域高-int 
  width = 32,    --点击区域宽-int 
  click_x = 33,    --点击区域坐标x-int 
  click_y = 34,    --点击区域左边y-int 
  title_x = 35,    --ui标题坐标x-int 
  title_y = 36,    --ui标题坐标y-int 
  order = 37,    --层级排序-int 
  open_effect = 38,    --解锁特效-string 
  up_effect = 39,    --升级特效-string 
  up_loop_effect = 40,    --每级spine特效-string 

}

-- data
local tree_decorate_add = {
    _data = {
        [1] = {1,1,"露坛",2,0,0,0,0,6,500,2,6,510,2,0,1,320,0,0,0,0,0,0,36000,"img_homeland_altar01","shenshupenquan","effect1","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","",},
        [2] = {1,2,"露坛",2,0,0,0,0,6,501,2,6,511,2,1120,1,640,0,0,0,0,0,0,72000,"img_homeland_altar01","shenshupenquan","effect1","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","effect_shenshugaojie_penquan",},
        [3] = {1,3,"露坛",3,2,2,0,0,6,501,4,6,511,4,1600,1,1280,0,0,0,0,0,0,144000,"img_homeland_altar02","shenshupenquan","effect2","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","",},
        [4] = {1,4,"露坛",4,2,3,0,0,6,502,2,6,512,2,2489,1,1280,0,0,0,0,0,0,144000,"img_homeland_altar02","shenshupenquan","effect2","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","effect_shenshugaojie_penquan",},
        [5] = {1,5,"露坛",5,2,5,0,0,6,502,4,6,512,4,3446,1,2560,0,0,0,0,0,0,288000,"img_homeland_altar03","shenshupenquan","effect3","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","",},
        [6] = {1,6,"露坛",6,2,6,0,0,6,503,2,6,513,2,6400,1,2560,0,0,0,0,0,0,288000,"img_homeland_altar03","shenshupenquan","effect3","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","effect_shenshugaojie_penquan",},
        [7] = {1,7,"露坛",7,2,7,0,0,6,503,4,6,513,4,12800,1,5120,0,0,0,0,0,0,576000,"img_homeland_altar04","shenshupenquan","effect4","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","",},
        [8] = {1,8,"露坛",8,2,8,0,0,6,504,2,6,514,2,25600,1,5120,0,0,0,0,0,0,576000,"img_homeland_altar04","shenshupenquan","effect4","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","effect_shenshugaojie_penquan",},
        [9] = {1,9,"露坛",9,2,9,0,0,6,504,4,6,514,4,51200,1,10240,0,0,0,0,0,0,1152000,"img_homeland_altar05","shenshupenquan","effect5","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","",},
        [10] = {1,10,"露坛",10,2,10,0,0,6,505,2,6,515,2,102400,1,10240,0,0,0,0,0,0,1152000,"img_homeland_altar05","shenshupenquan","effect5","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","effect_shenshugaojie_penquan",},
        [11] = {1,11,"露坛",11,2,11,0,0,6,505,4,6,515,4,102400,1,20480,0,0,0,0,0,0,2304000,"img_homeland_altar06","shenshupenquan","effect6","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","",},
        [12] = {1,12,"露坛",12,2,12,0,0,0,0,0,0,0,0,102400,1,20480,0,0,0,0,0,0,2304000,"img_homeland_altar06","shenshupenquan","effect6","",-477,-108,187,196,16,34,100,70,3,"effect_shenshu_dizuoshengji","effect_shenshu_dizuoshengji","effect_shenshugaojie_penquan",},
        [13] = {2,1,"赤灵芝",3,0,0,0,0,6,500,1,0,0,0,0,7,600,0,0,0,0,0,0,9000,"img_homeland_ganoderma01","shenshulingzhi","effect1","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","",},
        [14] = {2,2,"赤灵芝",3,0,0,0,0,6,501,1,0,0,0,280,7,1200,0,0,0,0,0,0,18000,"img_homeland_ganoderma01","shenshulingzhi","effect1","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","effect_shenshugaojie_lingzhi",},
        [15] = {2,3,"赤灵芝",4,3,2,0,0,6,501,2,0,0,0,400,7,2400,0,0,0,0,0,0,36000,"img_homeland_ganoderma02","shenshulingzhi","effect2","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","",},
        [16] = {2,4,"赤灵芝",0,3,3,0,0,6,502,1,0,0,0,622,7,2400,0,0,0,0,0,0,36000,"img_homeland_ganoderma02","shenshulingzhi","effect2","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","effect_shenshugaojie_lingzhi",},
        [17] = {2,5,"赤灵芝",0,3,5,0,0,6,502,2,0,0,0,862,7,4800,0,0,0,0,0,0,72000,"img_homeland_ganoderma03","shenshulingzhi","effect3","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","",},
        [18] = {2,6,"赤灵芝",0,3,6,0,0,6,503,1,0,0,0,1600,7,4800,0,0,0,0,0,0,72000,"img_homeland_ganoderma03","shenshulingzhi","effect3","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","effect_shenshugaojie_lingzhi",},
        [19] = {2,7,"赤灵芝",0,3,7,0,0,6,503,2,0,0,0,3200,7,9600,0,0,0,0,0,0,144000,"img_homeland_ganoderma04","shenshulingzhi","effect4","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","",},
        [20] = {2,8,"赤灵芝",0,3,8,0,0,6,504,1,0,0,0,6400,7,9600,0,0,0,0,0,0,144000,"img_homeland_ganoderma04","shenshulingzhi","effect4","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","effect_shenshugaojie_lingzhi",},
        [21] = {2,9,"赤灵芝",0,3,9,0,0,6,504,2,0,0,0,12800,7,19200,0,0,0,0,0,0,288000,"img_homeland_ganoderma05","shenshulingzhi","effect5","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","",},
        [22] = {2,10,"赤灵芝",0,3,10,0,0,6,505,1,0,0,0,25600,7,19200,0,0,0,0,0,0,288000,"img_homeland_ganoderma05","shenshulingzhi","effect5","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","effect_shenshugaojie_lingzhi",},
        [23] = {2,11,"赤灵芝",0,3,11,0,0,6,505,2,0,0,0,25600,7,38400,0,0,0,0,0,0,576000,"img_homeland_ganoderma06","shenshulingzhi","effect6","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","",},
        [24] = {2,12,"赤灵芝",0,3,12,0,0,0,0,0,0,0,0,25600,7,38400,0,0,0,0,0,0,576000,"img_homeland_ganoderma06","shenshulingzhi","effect6","",410,-194,175,270,15,0,135,35,7,"effect_shenshu_lingzhishengji","effect_shenshu_lingzhishengji","effect_shenshugaojie_lingzhi",},
        [25] = {3,1,"翠竹林",4,0,0,0,0,6,510,1,6,530,1,0,5,80,6,80,0,0,0,0,18000,"img_homeland_bamboo01","shenshuzhuzi","effect1","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","",},
        [26] = {3,2,"翠竹林",4,0,0,0,0,6,511,1,6,531,1,560,5,160,6,160,0,0,0,0,36000,"img_homeland_bamboo01","shenshuzhuzi","effect1","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","effect_shenshugaojie_zhuzi",},
        [27] = {3,3,"翠竹林",4,0,0,0,0,6,511,2,6,531,2,800,5,320,6,320,0,0,0,0,72000,"img_homeland_bamboo02","shenshuzhuzi","effect2","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","",},
        [28] = {3,4,"翠竹林",4,0,0,0,0,6,512,1,6,532,1,1244,5,320,6,320,0,0,0,0,72000,"img_homeland_bamboo02","shenshuzhuzi","effect2","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","effect_shenshugaojie_zhuzi",},
        [29] = {3,5,"翠竹林",5,0,0,0,0,6,512,2,6,532,2,1732,5,640,6,640,0,0,0,0,144000,"img_homeland_bamboo03","shenshuzhuzi","effect3","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","",},
        [30] = {3,6,"翠竹林",6,0,0,0,0,6,513,1,6,533,1,3200,5,640,6,640,0,0,0,0,144000,"img_homeland_bamboo03","shenshuzhuzi","effect3","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","effect_shenshugaojie_zhuzi",},
        [31] = {3,7,"翠竹林",7,0,0,0,0,6,513,2,6,533,2,6400,5,1280,6,1280,0,0,0,0,288000,"img_homeland_bamboo04","shenshuzhuzi","effect4","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","",},
        [32] = {3,8,"翠竹林",8,0,0,0,0,6,514,1,6,534,1,12800,5,1280,6,1280,0,0,0,0,288000,"img_homeland_bamboo04","shenshuzhuzi","effect4","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","effect_shenshugaojie_zhuzi",},
        [33] = {3,9,"翠竹林",9,0,0,0,0,6,514,2,6,534,2,25600,5,2560,6,2560,0,0,0,0,576000,"img_homeland_bamboo05","shenshuzhuzi","effect5","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","",},
        [34] = {3,10,"翠竹林",10,0,0,0,0,6,515,1,6,535,1,51200,5,2560,6,2560,0,0,0,0,576000,"img_homeland_bamboo05","shenshuzhuzi","effect5","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","effect_shenshugaojie_zhuzi",},
        [35] = {3,11,"翠竹林",11,0,0,0,0,6,515,2,6,535,2,51200,5,5120,6,5120,0,0,0,0,1152000,"img_homeland_bamboo06","shenshuzhuzi","effect6","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","",},
        [36] = {3,12,"翠竹林",12,0,0,0,0,0,0,0,0,0,0,51200,5,5120,6,5120,0,0,0,0,1152000,"img_homeland_bamboo06","shenshuzhuzi","effect6","",-404,100,175,183,-10,55,-85,85,1,"effect_shenshu_zhuzishengji","effect_shenshu_zhuzishengji","effect_shenshugaojie_zhuzi",},
        [37] = {4,1,"九华灯",7,0,0,0,0,6,510,1,6,530,1,0,5,80,6,80,0,0,0,0,18000,"img_homeland_lamp01","shenshudeng","effect1","",450,60,170,210,-14,6,-100,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","",},
        [38] = {4,2,"九华灯",7,0,0,0,0,6,511,1,6,531,1,560,5,160,6,160,0,0,0,0,36000,"img_homeland_lamp01","shenshudeng","effect1","",450,60,170,210,-14,6,-100,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","effect_shenshugaojie_deng",},
        [39] = {4,3,"九华灯",7,0,0,0,0,6,511,2,6,531,2,800,5,320,6,320,0,0,0,0,72000,"img_homeland_lamp02","shenshudeng","effect2","",450,60,170,210,-14,6,-100,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","",},
        [40] = {4,4,"九华灯",7,0,0,0,0,6,512,1,6,532,1,1244,5,320,6,320,0,0,0,0,72000,"img_homeland_lamp02","shenshudeng","effect2","",450,60,170,210,-14,6,-100,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","effect_shenshugaojie_deng",},
        [41] = {4,5,"九华灯",7,0,0,0,0,6,512,2,6,532,2,1732,5,640,6,640,0,0,0,0,144000,"img_homeland_lamp03","shenshudeng","effect3","",450,60,170,210,-14,6,-100,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","",},
        [42] = {4,6,"九华灯",7,0,0,0,0,6,513,1,6,533,1,3200,5,640,6,640,0,0,0,0,144000,"img_homeland_lamp03","shenshudeng","effect3","",450,60,170,210,-14,6,-100,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","effect_shenshugaojie_deng",},
        [43] = {4,7,"九华灯",7,0,0,0,0,6,513,2,6,533,2,6400,5,1280,6,1280,0,0,0,0,288000,"img_homeland_lamp04","shenshudeng","effect4","",450,60,170,210,-14,6,-110,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","",},
        [44] = {4,8,"九华灯",8,0,0,0,0,6,514,1,6,534,1,12800,5,1280,6,1280,0,0,0,0,288000,"img_homeland_lamp04","shenshudeng","effect4","",450,60,170,210,-14,6,-110,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","effect_shenshugaojie_deng",},
        [45] = {4,9,"九华灯",9,0,0,0,0,6,514,2,6,534,2,25600,5,2560,6,2560,0,0,0,0,576000,"img_homeland_lamp05","shenshudeng","effect5","",450,60,170,210,-14,6,-110,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","",},
        [46] = {4,10,"九华灯",10,0,0,0,0,6,515,1,6,535,1,51200,5,2560,6,2560,0,0,0,0,576000,"img_homeland_lamp05","shenshudeng","effect5","",450,60,170,210,-14,6,-110,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","effect_shenshugaojie_deng",},
        [47] = {4,11,"九华灯",11,0,0,0,0,6,515,2,6,535,2,51200,5,5120,6,5120,0,0,0,0,1152000,"img_homeland_lamp06","shenshudeng","effect6","",450,60,170,210,-14,6,-110,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","",},
        [48] = {4,12,"九华灯",12,0,0,0,0,0,0,0,0,0,0,51200,5,5120,6,5120,0,0,0,0,1152000,"img_homeland_lamp06","shenshudeng","effect6","",450,60,170,210,-14,6,-110,40,6,"effect_shenshu_dengshengji","effect_shenshu_dengshengji","effect_shenshugaojie_deng",},
        [49] = {5,1,"九天瑶池",5,0,0,0,0,6,500,2,6,530,2,0,7,2400,0,0,0,0,0,0,36000,"img_homeland_pond01","shenshushui","effect1","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","",},
        [50] = {5,2,"九天瑶池",5,0,0,0,0,6,501,2,6,531,2,1120,7,4800,0,0,0,0,0,0,72000,"img_homeland_pond01","shenshushui","effect1","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","effect_shenshugaojie_hehua",},
        [51] = {5,3,"九天瑶池",5,0,0,0,0,6,501,4,6,531,4,1600,7,9600,0,0,0,0,0,0,144000,"img_homeland_pond02","shenshushui","effect2","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","",},
        [52] = {5,4,"九天瑶池",5,6,2,0,0,6,502,2,6,532,2,2489,7,9600,0,0,0,0,0,0,144000,"img_homeland_pond02","shenshushui","effect2","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","effect_shenshugaojie_hehua",},
        [53] = {5,5,"九天瑶池",5,6,4,0,0,6,502,4,6,532,4,3446,7,19200,0,0,0,0,0,0,288000,"img_homeland_pond03","shenshushui","effect3","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","",},
        [54] = {5,6,"九天瑶池",6,6,6,0,0,6,503,2,6,533,2,6400,7,19200,0,0,0,0,0,0,288000,"img_homeland_pond03","shenshushui","effect3","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","effect_shenshugaojie_hehua",},
        [55] = {5,7,"九天瑶池",7,6,7,0,0,6,503,4,6,533,4,12800,7,38400,0,0,0,0,0,0,576000,"img_homeland_pond04","shenshushui","effect4","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","",},
        [56] = {5,8,"九天瑶池",8,6,8,0,0,6,504,2,6,534,2,25600,7,38400,0,0,0,0,0,0,576000,"img_homeland_pond04","shenshushui","effect4","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","effect_shenshugaojie_hehua",},
        [57] = {5,9,"九天瑶池",9,6,9,0,0,6,504,4,6,534,4,51200,7,76800,0,0,0,0,0,0,1152000,"img_homeland_pond05","shenshushui","effect5","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","",},
        [58] = {5,10,"九天瑶池",10,6,10,0,0,6,505,2,6,535,2,102400,7,76800,0,0,0,0,0,0,1152000,"img_homeland_pond05","shenshushui","effect5","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","effect_shenshugaojie_hehua",},
        [59] = {5,11,"九天瑶池",11,6,11,0,0,6,505,4,6,535,4,102400,7,153600,0,0,0,0,0,0,2304000,"img_homeland_pond06","shenshushui","effect6","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","",},
        [60] = {5,12,"九天瑶池",12,6,12,0,0,0,0,0,0,0,0,102400,7,153600,0,0,0,0,0,0,2304000,"img_homeland_pond06","shenshushui","effect6","",-230,-150,205,160,-20,49,-70,95,4,"effect_shenshu_shuishengji","effect_shenshu_shuishengji","effect_shenshugaojie_hehua",},
        [61] = {6,1,"玲珑玉玦",6,0,0,0,0,6,530,1,0,0,0,0,1,80,0,0,0,0,0,0,9000,"img_homeland_jade01","shenshuyu","effect1","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","",},
        [62] = {6,2,"玲珑玉玦",6,0,0,0,0,6,531,1,0,0,0,280,1,160,0,0,0,0,0,0,18000,"img_homeland_jade01","shenshuyu","effect1","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","effect_shenshugaojie_yu",},
        [63] = {6,3,"玲珑玉玦",6,0,0,0,0,6,531,2,0,0,0,400,1,320,0,0,0,0,0,0,36000,"img_homeland_jade02","shenshuyu","effect2","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","",},
        [64] = {6,4,"玲珑玉玦",6,0,0,0,0,6,532,1,0,0,0,622,1,320,0,0,0,0,0,0,36000,"img_homeland_jade02","shenshuyu","effect2","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","effect_shenshugaojie_yu",},
        [65] = {6,5,"玲珑玉玦",0,4,2,0,0,6,532,2,0,0,0,862,1,640,0,0,0,0,0,0,72000,"img_homeland_jade03","shenshuyu","effect3","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","",},
        [66] = {6,6,"玲珑玉玦",0,4,4,0,0,6,533,1,0,0,0,1600,1,640,0,0,0,0,0,0,72000,"img_homeland_jade03","shenshuyu","effect3","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","effect_shenshugaojie_yu",},
        [67] = {6,7,"玲珑玉玦",0,4,7,0,0,6,533,2,0,0,0,3200,1,1280,0,0,0,0,0,0,144000,"img_homeland_jade04","shenshuyu","effect4","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","",},
        [68] = {6,8,"玲珑玉玦",0,4,8,0,0,6,534,1,0,0,0,6400,1,1280,0,0,0,0,0,0,144000,"img_homeland_jade04","shenshuyu","effect4","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","effect_shenshugaojie_yu",},
        [69] = {6,9,"玲珑玉玦",0,4,9,0,0,6,534,2,0,0,0,12800,1,2560,0,0,0,0,0,0,288000,"img_homeland_jade05","shenshuyu","effect5","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","",},
        [70] = {6,10,"玲珑玉玦",0,4,10,0,0,6,535,1,0,0,0,25600,1,2560,0,0,0,0,0,0,288000,"img_homeland_jade05","shenshuyu","effect5","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","effect_shenshugaojie_yu",},
        [71] = {6,11,"玲珑玉玦",0,4,11,0,0,6,535,2,0,0,0,25600,1,5120,0,0,0,0,0,0,576000,"img_homeland_jade06","shenshuyu","effect6","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","",},
        [72] = {6,12,"玲珑玉玦",0,4,12,0,0,0,0,0,0,0,0,25600,1,5120,0,0,0,0,0,0,576000,"img_homeland_jade06","shenshuyu","effect6","",180,-40,205,108,30,-20,60,20,7,"effect_shenshu_yushengji","effect_shenshu_yushengji","effect_shenshugaojie_yu",},
    }
}

-- index
local __index_type_level = {
    ["1_1"] = 1,
    ["1_10"] = 10,
    ["1_11"] = 11,
    ["1_12"] = 12,
    ["1_2"] = 2,
    ["1_3"] = 3,
    ["1_4"] = 4,
    ["1_5"] = 5,
    ["1_6"] = 6,
    ["1_7"] = 7,
    ["1_8"] = 8,
    ["1_9"] = 9,
    ["2_1"] = 13,
    ["2_10"] = 22,
    ["2_11"] = 23,
    ["2_12"] = 24,
    ["2_2"] = 14,
    ["2_3"] = 15,
    ["2_4"] = 16,
    ["2_5"] = 17,
    ["2_6"] = 18,
    ["2_7"] = 19,
    ["2_8"] = 20,
    ["2_9"] = 21,
    ["3_1"] = 25,
    ["3_10"] = 34,
    ["3_11"] = 35,
    ["3_12"] = 36,
    ["3_2"] = 26,
    ["3_3"] = 27,
    ["3_4"] = 28,
    ["3_5"] = 29,
    ["3_6"] = 30,
    ["3_7"] = 31,
    ["3_8"] = 32,
    ["3_9"] = 33,
    ["4_1"] = 37,
    ["4_10"] = 46,
    ["4_11"] = 47,
    ["4_12"] = 48,
    ["4_2"] = 38,
    ["4_3"] = 39,
    ["4_4"] = 40,
    ["4_5"] = 41,
    ["4_6"] = 42,
    ["4_7"] = 43,
    ["4_8"] = 44,
    ["4_9"] = 45,
    ["5_1"] = 49,
    ["5_10"] = 58,
    ["5_11"] = 59,
    ["5_12"] = 60,
    ["5_2"] = 50,
    ["5_3"] = 51,
    ["5_4"] = 52,
    ["5_5"] = 53,
    ["5_6"] = 54,
    ["5_7"] = 55,
    ["5_8"] = 56,
    ["5_9"] = 57,
    ["6_1"] = 61,
    ["6_10"] = 70,
    ["6_11"] = 71,
    ["6_12"] = 72,
    ["6_2"] = 62,
    ["6_3"] = 63,
    ["6_4"] = 64,
    ["6_5"] = 65,
    ["6_6"] = 66,
    ["6_7"] = 67,
    ["6_8"] = 68,
    ["6_9"] = 69,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in tree_decorate_add")
        return t._raw[__key_map[k]]
    end
}

-- 
function tree_decorate_add.length()
    return #tree_decorate_add._data
end

-- 
function tree_decorate_add.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function tree_decorate_add.indexOf(index)
    if index == nil or not tree_decorate_add._data[index] then
        return nil
    end

    return setmetatable({_raw = tree_decorate_add._data[index]}, mt)
end

--
function tree_decorate_add.get(type,level)
    
    local k = type .. '_' .. level
    return tree_decorate_add.indexOf(__index_type_level[k])
        
end

--
function tree_decorate_add.set(type,level, tkey, nvalue)
    local record = tree_decorate_add.get(type,level)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function tree_decorate_add.index()
    return __index_type_level
end

return tree_decorate_add