--mail

-- key
local __key_map = {
  id = 1,    --ID-int 
  mail_type = 2,    --邮件类型-int 
  label_type = 3,    --标签类型-int 
  mail_name = 4,    --发件人-string 
  mail_title = 5,    --邮件标题-string 
  mail_is_delete = 6,    --邮件是否删除-int 
  mail_text = 7,    --邮件文本-string 

}

-- data
local mail = {
    _data = {
        [1] = {1,1,2,"小乔","#title#",0,"#content#",},
        [2] = {2,1,1,"小乔","竞技场每日奖励",0,"亲爱的玩家，您在本次竞技场排名中获得了第#rank#名佳绩，获得了以下奖励。",},
        [3] = {3,1,1,"小乔","南蛮入侵-军团伤害排行",0,"您所在的军团在南蛮入侵的累计伤害排行第#rank#，获得了以下奖励",},
        [4] = {4,1,1,"小乔","南蛮入侵-个人伤害排行",0,"您在今日南蛮入侵的累计伤害排行第#rank#名，获得了以下奖励",},
        [5] = {10,1,1,"小乔","签到奖励",0,"由于您的VIP等级提升，可在今天的签到中获得加倍奖励，在此补发",},
        [6] = {11,1,1,"小乔","#city#暴动消除奖励",0,"玩家#name#帮你解决#riot_name#，您获得以上奖励！",},
        [7] = {12,1,1,"小乔","军团BOSS个人积分奖励",0,"主公，在本次军团BOSS中，您个人获得积分#integral#，排名#rank#，特发以上奖励。",},
        [8] = {13,1,1,"小乔","军团BOSS军团积分奖励",0,"主公，在本次军团BOSS中，您所在军团获得积分#integral#，排名#rank#，特发以上奖励。",},
        [9] = {14,1,1,"小乔","拍卖场",0,"主公，请及时收取您在拍卖场竞拍到的商品哟！",},
        [10] = {15,1,1,"小乔","拍卖场（竞拍退回）",0,"主公，您竞拍#name#失败，竞拍退回，请查收！",},
        [11] = {16,1,1,"小乔","拍卖分红",0,"主公，您积极参与#name#，小乔特地为您送来活动拍卖分红，请笑纳。",},
        [12] = {17,1,1,"小乔","军团援助奖励",0,"主公，您有尚未领取的军团援助奖励，小乔为您送来了！",},
        [13] = {18,1,1,"小乔","军团求援奖励",0," ",},
        [14] = {19,1,1,"小乔","#title#",0,"#content#",},
        [15] = {20,1,1,"小乔","每周军团工资",0,"主公，上周的军团工资已结算，根据您的职位和活跃可获得如下奖励。",},
        [16] = {21,1,1,"小乔","【神】孟获参与奖",0,"主公，您参与了军团内【神】孟获的击杀活动，可获得如下奖励。",},
        [17] = {22,1,2,"小乔","#title#",0,"#content#",},
        [18] = {23,2,2,"小乔","#title#",0,"#content#",},
        [19] = {24,1,1,"小乔","军团答题积分奖励",0,"主公，在本次军团答题活动中，根据您答题获得的积分，特发以下奖励。",},
        [20] = {25,1,1,"小乔","军团答题军团积分奖励",0,"主公，在本次军团答题活动中，您所在军团获得积分#integral#，排名第#rank#，特发以下奖励。",},
        [21] = {26,1,1,"军团管家","军团工资",0,"主公！根据你的职位与军团活跃。|当前已积累 #gold# $resmini_1$ 以及 #contribution# $resmini_13$。|将在周一凌晨四点统一发放。",},
        [22] = {27,1,3,"#name#","军团邮件",0,"#content#",},
        [23] = {28,1,2,"小乔","#title#",0,"#content#",},
        [24] = {29,1,3,"#name#","军团邮件",0,"亲爱的团员们，本军团每日军团答题时间改为#time#场次，请大家准时参加活动。",},
        [25] = {30,1,3,"军团管家","职务任命",0,"主公！恭喜，您刚被任命为#position#的职位，请为军团的繁荣继续努力！",},
        [26] = {31,1,3,"军团管家","职务解除",0,"主公！很遗憾，您刚被解除了#position#的职位。",},
        [27] = {32,1,1,"小乔","百大军团",0,"亲爱的主公，您所在军团#legion#在本次百大军团活动评比中排名第#rank#，作为#position#，您为本团付出了足够的努力，小乔特地为您送来以下奖励！",},
        [28] = {33,1,2,"小乔","身外化身活动累充福利",0,"亲爱的主公，您在身外化身活动期间充值#money#元，小乔赠送您#num#个#goods#，快去身外化身活动试试手气吧~",},
        [29] = {34,1,2,"小乔","公众号兑换奖励",0,"亲爱的主公，以下是您通过《三国杀名将传》微信公众号积分兑换的奖励，请注意查收。如对奖品有疑问，请联系客服确认哦。感谢您的支持，祝您游戏愉快！",},
        [30] = {35,2,1,"小乔","仇人改名",0,"主公，您的仇人“#name1#”已改名为“#name2#”，请知悉！",},
        [31] = {36,1,2,"小乔","割须弃袍活动累充福利",0,"亲爱的主公，您在割须弃袍活动期间充值#money#元，小乔赠送您#num#个#goods#，快去割须弃袍活动试试手气吧~",},
        [32] = {37,1,1,"小乔","阵营竞技参与奖",0,"主公，很遗憾您未能在本届阵营竞技中进入决赛圈，小乔送上参与奖，助您来日再战！",},
        [33] = {38,1,1,"小乔","阵营竞技八强奖励",0,"主公，恭喜您在本届阵营竞技晋级八强，获得以下奖励：",},
        [34] = {39,1,1,"小乔","阵营竞技四强奖励",0,"主公，恭喜您在本届阵营竞技晋级四强，获得以下奖励：",},
        [35] = {40,1,1,"小乔","阵营竞技亚军奖励",0,"主公，恭喜您在本届阵营竞技中夺得亚军，获得以下奖励：",},
        [36] = {41,1,1,"小乔","阵营竞技全服分红",0,"主公，您积极参与阵营竞技，小乔特地为您送来阵营竞技全服拍卖的分红，请笑纳。",},
        [37] = {42,1,1,"小乔","阵营竞技支持奖",0,"主公，您在本届阵营竞技中支持的#name#晋级成功，小乔送上您获得的元宝！",},
        [38] = {43,1,2,"小乔","卧龙观星活动累充福利",0,"亲爱的主公，您在卧龙观星活动期间充值#money#元，小乔赠送您#num#个#goods#，快去卧龙观星活动试试手气吧~",},
        [39] = {44,1,1,"小乔","阵营竞技冠军奖励",0,"主公，恭喜您在本届阵营竞技中夺得冠军，获得以下奖励：",},
        [40] = {45,1,1,"小乔","欢庆佳节",0,"主公，喜迎佳节之时，为了感谢您积极参与军团BOSS，小乔特意为您送来以下奖励，祝您鸿运当头！",},
        [41] = {46,1,1,"小乔","欢庆佳节",0,"主公，喜迎佳节之时，为了感谢您积极参与军团答题，小乔特意为您送来以下奖励，祝您鸿运当头！",},
        [42] = {47,1,1,"小乔","欢庆佳节",0,"主公，喜迎佳节之时，为了感谢您积极参与军团试炼，小乔特意为您送来以下奖励，祝您鸿运当头！",},
        [43] = {48,1,1,"小乔","欢庆佳节",0,"主公，喜迎佳节之时，为了感谢您积极参与三国战纪，小乔特意为您送来以下奖励，祝您鸿运当头！",},
        [44] = {49,1,1,"小乔","华容道战报",0,"主公，第#number#届华容道已完美落幕，本期冠军是被您赐予祝福的英雄#hero#，感谢您的慧眼识珠，特为您送来#odds#赔率的奖金！",},
        [45] = {50,2,1,"小乔","华容道战报",0,"主公，第#number#届华容道已落幕，您支持的选手#hero#，遗憾落败，谢谢您的参与，期待下次再会！",},
        [46] = {51,1,2,"小乔","游卡福利奖励",0,"亲爱的主公，请及时领取“游卡福利”小程序的签到奖励哦，感谢您一直以来对我们的支持，祝您游戏愉快！",},
        [47] = {52,1,1,"军团管家","军团战军功",0,"主公，您在本次军团战中表现活跃，特此发放#num#的军团贡献，请查收！",},
        [48] = {53,1,2,"小乔","伯乐相马活动累充福利",0,"亲爱的主公，您在伯乐相马活动期间充值#money#元，小乔赠送您#num#个#goods#，快去相马中试试手气吧~",},
        [49] = {54,1,1,"军团管家","军团战军功",0,"主公，您所在的军团占领了#city#，今日共获得#num#的军团贡献，请查收！",},
        [50] = {55,1,1,"小乔","先秦皇陵掉落奖励",0,"主公，这是您在离线期间获得的先秦皇陵奖励，请查收！",},
        [51] = {56,1,1,"小乔","贵宾VIP认证见面礼",0,"亲爱的主公，您已开启《三国杀名将传》VIP贵宾绿色通道，请收下我们的认证礼包，之后新版本内容、新活动讯息也会第一时间通知您！感谢您对《三国杀名将传》的支持与热爱，祝主公游戏愉快！",},
        [52] = {57,1,1,"小乔","绑定身份奖励",0,"亲爱的主公，您的账号已经成功绑定身份证，获得以下奖励：",},
        [53] = {58,1,1,"军团管家","军功宝箱",0,"主公，您在本次军团战中表现活跃，英勇杀敌，特发放如下奖励，请查收！",},
        [54] = {59,1,1,"小乔","联动小福利",0,"亲爱的主公，欢迎来到《三国杀名将传》，请收下小乔为您准备的薄礼，祝您游戏愉快哟~完成联动任务，可领取《三国杀》奖励，详见联动活动说明；当然在《三国杀名将传》中，您也会收到额外的福利哦，继续和小乔一起愉快地玩耍吧^_^",},
        [55] = {60,1,1,"小乔","联动小福利",0,"亲爱的主公，欢迎来到《三国杀名将传》，请收下小乔为您准备的薄礼，祝您游戏愉快哟~完成联动任务，可领取《三国杀》奖励，详见联动活动说明；当然在《三国杀名将传》中，您也会收到额外的福利哦，继续和小乔一起愉快地玩耍吧^_^",},
        [56] = {61,1,1,"小乔","联动小福利",0,"亲爱的主公，欢迎来到《三国杀名将传》，请收下小乔为您准备的薄礼，祝您游戏愉快哟~完成联动任务，可领取《三国杀》奖励，详见联动活动说明；当然在《三国杀名将传》中，您也会收到额外的福利哦，继续和小乔一起愉快地玩耍吧^_^",},
        [57] = {62,1,1,"小乔","联动奖励补发",0,"亲爱的主公，由于网络波动，您在联动活动中获得的任务奖励通过邮件直接发送给您^_^",},
        [58] = {63,1,1,"小乔","拍卖预告",0,"各位主公，神秘行商即将在#hour#时#minute#分开始，如果有主公在这个拍卖中一口价商品，就会有全服大红包可以抢！",},
        [59] = {64,1,1,"小乔","获得称号",0,"亲爱的主公，您#des#，获得#title#称号，有效时间为#day#，请在主界面左上角点击自己的头像在称号界面中查看哟~",},
        [60] = {65,1,1,"小乔","关公驯马活动累充福利",0,"亲爱的主公，您在关公驯马活动期间充值#money#元，小乔赠送您#num#个#goods#，快去驯马中试试手气吧~",},
        [61] = {66,1,1,"小乔","跨服个人竞技全服分红",0,"主公，小乔特地为您送来跨服个人竞技全服拍卖的分红，请笑纳。",},
        [62] = {67,1,1,"小乔","跨服个人竞技支持奖",0,"主公，您在本届跨服个人竞技中支持的#name#晋级成功，小乔送上您获得的玉魂！",},
        [63] = {68,1,1,"小乔","跨服个人竞技参与奖",0,"主公，很遗憾您未能在本届跨服个人竞技中进入32强，小乔送上参与奖，助您来日再战！",},
        [64] = {69,1,1,"小乔","跨服个人竞技参与奖",0,"主公，恭喜您在本届跨服个人竞技中获得#rank#，获得以下奖励：",},
        [65] = {70,1,1,"军团管家","跨服军团战",0,"主公，您所在军团在本次跨服军团战中共获得#point#积分，排名第#rank#，您表现活跃，英勇杀敌，特发放如下奖励！",},
        [66] = {75,1,1,"小乔","礼包码奖励",0,"亲爱的主公，以下是您领取的专属礼包奖励，请注意查收！感谢您对我们游戏的支持，祝您游戏愉快！",},
        [67] = {76,1,1,"小乔","冠军竞猜获胜奖励",0,"主公，您在本届跨服个人竞技中支持的#Server##name#获得了冠军，获得以下奖励：",},
        [68] = {77,1,1,"小乔","最强服竞猜获胜奖励",0,"主公，您在本届跨服个人竞技中支持的#Server#服排名第一，获得以下奖励：",},
        [69] = {78,1,1,"小乔","垫底服竞猜获胜奖励",0,"主公，您在本届跨服个人竞技中支持的#Server#服排名垫底，获得以下奖励：",},
        [70] = {79,1,1,"小乔","冠军竞猜失败安慰奖",0,"主公，感谢您参与本届跨服个人竞技冠军竞猜，很遗憾您支持的霸主未能夺冠，小乔送上参与奖，助您来日再战！",},
        [71] = {80,1,1,"小乔","最强服竞猜失败安慰奖",0,"主公，感谢您参与本届跨服个人竞技最强服竞猜，很遗憾您支持的服务器未能排名第一，小乔送上参与奖，助您来日再战！",},
        [72] = {81,1,1,"小乔","垫底服竞猜失败安慰奖",0,"主公，感谢您参与本届跨服个人竞技最弱服竞猜，很遗憾您支持的服务器未能排名垫底，小乔送上参与奖，助您来日再战！",},
        [73] = {82,1,1,"小乔","全服答题积分奖励",0,"主公，在本次全服答题活动中，您总共获得#point#积分，排名第#rank#，特发以下奖励。",},
        [74] = {83,1,1,"小乔","欢乐红包雨即将开启",0,"主公，欢乐红包雨活动即将在#time#开启，恭请各位主公驾临！",},
        [75] = {84,1,1,"小乔","欢乐抽奖奖励",0,"主公，恭喜您在本轮欢乐抽奖成为幸运儿，小乔为您送来奖品：",},
        [76] = {85,1,1,"小乔","欢乐抽奖积分排名奖励",0,"主公，本轮欢乐抽奖已经告一段落，您在本时段的欢乐抽奖积分排名第#rank#，小乔为您送来第#part#奖励：",},
        [77] = {86,1,1,"小乔","见龙在田总积分排名奖励",0,"主公，本次金将招募活动已圆满结束，您在本次金将招募总积分排名第#rank#，小乔为您送来第#part#奖励：",},
        [78] = {87,1,1,"小乔","见龙在田活动累充福利",0,"亲爱的主公，您在见龙在田活动期间充值#money#元，小乔赠送您#num#个#goods#，快去招募金将试试手气吧~",},
        [79] = {88,1,1,"小乔","欢乐抽奖参与奖励",0,"主公，本轮欢乐抽奖已经告一段落，感谢您参与这一时段的欢乐抽奖，小乔为您送来参与奖励：",},
        [80] = {89,1,1,"小乔","见龙在田参与奖励",0,"主公，本次见龙在田活动已圆满结束，感谢您参与本次活动，小乔为您送来参与奖励：",},
        [81] = {98,1,1,"小乔","新金将50阶神兵赠送",0,"主公，恭喜您首次获得#hero#，小乔为您送来#hero#专属50阶神兵，祝您早日称霸天下：",},
        [82] = {90,1,1,"小乔","军团蛋糕升级奖励",0,"主公，您已经离开了#name1#军团，附件是您未领取的蛋糕升级奖励，请注意查收！",},
        [83] = {91,1,1,"小乔","军团进入跨服饕餮盛宴",0,"恭喜主公所在的#name1#军团在本服饕餮盛宴中斩获第#rank#名，将代表本服参加跨服饕餮盛宴！请继续加油为军团争光！",},
        [84] = {92,1,1,"小乔","本服饕餮盛宴个人奖励",0,"恭喜主公在本服饕餮盛宴中斩获个人排名第#rank#名！附件是您的排名奖励，请查收！",},
        [85] = {93,1,1,"小乔","本服饕餮盛宴军团奖励",0,"恭喜主公所在的#name1#军团在本服饕餮盛宴中斩获第#rank#名！附件是您的军团排名奖励，请查收！",},
        [86] = {94,1,1,"小乔","跨服饕餮盛宴个人奖励",0,"恭喜主公在跨服饕餮盛宴中斩获个人排名第#rank#名！附件是您的排名奖励，请查收！",},
        [87] = {95,1,1,"小乔","跨服饕餮盛宴军团奖励",0,"恭喜主公所在的#name1#军团在跨服饕餮盛宴中斩获第#rank#名！附件是您的军团排名奖励，请查收！",},
        [88] = {96,1,1,"小乔","本服饕餮盛宴蛋糕奖励",0,"本服饕餮盛宴已结束，附件是您未领取的盛宴升级奖励，请注意查收！",},
        [89] = {97,1,1,"小乔","跨服饕餮盛宴蛋糕奖励",0,"跨服饕餮盛宴已结束，附件是您未领取的盛宴升级奖励，请注意查收！",},
        [90] = {100,1,1,"小乔","跨服军团战支援成功奖励",0,"主公，您在本届跨服军团战中支持的#Server##Guild#成功进入前8，获得以下奖励：",},
        [91] = {101,1,1,"小乔","跨服军团战支援失败安慰奖",0,"主公，您在本届跨服军团战中支持的#Server##Guild#未能进入前8，小乔送上参与奖，助您来日再战！",},
        [92] = {102,1,1,"小乔","跨服BOSS个人积分奖励",0,"主公，在本次跨服BOSS中，您个人获得积分#integral#，排名#rank#，特发以上奖励。",},
        [93] = {103,1,1,"小乔","跨服BOSS军团积分奖励",0,"主公，在本次跨服BOSS中，您所在军团获得积分#integral#，排名#rank#，特发以上奖励。",},
        [94] = {104,1,1,"军团管家","暗度陈仓奖励",0,"主公，本军团#graincar#已到达终点，耐久度为#num#，为了表彰大家在活动中的表现，特发放如下奖励，请查收！",},
        [95] = {105,1,1,"军团管家","暗度陈仓奖励",0,"主公，很遗憾本军团粮车被摧毁，对本军团粮车伤害较高的军团为#name1# #name2# #name3#，根据大家在活动中的表现，特发放如下奖励，请查收！",},
        [96] = {106,1,1,"军团管家","军团自动解散",0,"主公，由于您所在的军团连续3天未产生活跃，因此已自动解散，还请主公多多努力。",},
        [97] = {107,1,1,"小乔","游客登录关闭",0,"根据国家相关规定，游客登录入口将于2019年12月25日正式关闭，此后将无法以游客身份进入游戏，请主公尽快绑定手机号注册为正式账号，避免账号丢失！",},
        [98] = {108,1,1,"小乔","真武战神参赛排行奖励",0,"主公，恭喜您在本届真武战神活动中取得#rank#的成绩，小乔为您奉上排名奖励：",},
        [99] = {109,1,1,"小乔","真武战神单场竞猜奖励",0,"主公，真武战神#round#比赛已经结束，您在本次单场竞猜中猜对#count#场，小乔为您送来竞猜奖励：",},
        [100] = {110,1,1,"军团管家","暗度陈仓未发车提示",0,"主公，军团管家提醒您，道路千万条，发车第一条，团长不发车，团员两行泪。本次活动期间本军团军团长、副团长未能发车，无法获得运粮奖励。",},
        [101] = {111,1,1,"小乔","跨服个人竞技全服分红",0,"主公，小乔特地为您送来阵营竞技本阵营前#rank#名，跨服个人竞技全服拍卖的分红，请笑纳。",},
        [102] = {112,1,1,"小乔","跨服个人竞技全服分红",0,"主公，小乔特地为您送来阵营竞技本阵营#rank#名之后，跨服个人竞技全服拍卖的分红，请笑纳。",},
        [103] = {113,1,1,"小乔","真武战神串联竞猜奖励",0,"主公，真武战神#round#比赛已经结束，您在本次串联竞猜中猜对#count#场，小乔为您送来竞猜奖励：",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 5,
    [100] = 90,
    [101] = 91,
    [102] = 92,
    [103] = 93,
    [104] = 94,
    [105] = 95,
    [106] = 96,
    [107] = 97,
    [108] = 98,
    [109] = 99,
    [11] = 6,
    [110] = 100,
    [111] = 101,
    [112] = 102,
    [113] = 103,
    [12] = 7,
    [13] = 8,
    [14] = 9,
    [15] = 10,
    [16] = 11,
    [17] = 12,
    [18] = 13,
    [19] = 14,
    [2] = 2,
    [20] = 15,
    [21] = 16,
    [22] = 17,
    [23] = 18,
    [24] = 19,
    [25] = 20,
    [26] = 21,
    [27] = 22,
    [28] = 23,
    [29] = 24,
    [3] = 3,
    [30] = 25,
    [31] = 26,
    [32] = 27,
    [33] = 28,
    [34] = 29,
    [35] = 30,
    [36] = 31,
    [37] = 32,
    [38] = 33,
    [39] = 34,
    [4] = 4,
    [40] = 35,
    [41] = 36,
    [42] = 37,
    [43] = 38,
    [44] = 39,
    [45] = 40,
    [46] = 41,
    [47] = 42,
    [48] = 43,
    [49] = 44,
    [50] = 45,
    [51] = 46,
    [52] = 47,
    [53] = 48,
    [54] = 49,
    [55] = 50,
    [56] = 51,
    [57] = 52,
    [58] = 53,
    [59] = 54,
    [60] = 55,
    [61] = 56,
    [62] = 57,
    [63] = 58,
    [64] = 59,
    [65] = 60,
    [66] = 61,
    [67] = 62,
    [68] = 63,
    [69] = 64,
    [70] = 65,
    [75] = 66,
    [76] = 67,
    [77] = 68,
    [78] = 69,
    [79] = 70,
    [80] = 71,
    [81] = 72,
    [82] = 73,
    [83] = 74,
    [84] = 75,
    [85] = 76,
    [86] = 77,
    [87] = 78,
    [88] = 79,
    [89] = 80,
    [90] = 82,
    [91] = 83,
    [92] = 84,
    [93] = 85,
    [94] = 86,
    [95] = 87,
    [96] = 88,
    [97] = 89,
    [98] = 81,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in mail")
        return t._raw[__key_map[k]]
    end
}

-- 
function mail.length()
    return #mail._data
end

-- 
function mail.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function mail.indexOf(index)
    if index == nil or not mail._data[index] then
        return nil
    end

    return setmetatable({_raw = mail._data[index]}, mt)
end

--
function mail.get(id)
    
    return mail.indexOf(__index_id[id])
        
end

--
function mail.set(id, tkey, nvalue)
    local record = mail.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function mail.index()
    return __index_id
end

return mail