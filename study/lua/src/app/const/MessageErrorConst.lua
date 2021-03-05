

--[[
  所有的报错信息id 都往后加 不要再中间添加了 方便策划核对新加了哪几个报错
]]
return {
	RET_ERROR                     = 0  ,--悟空 你又调皮了
	RET_OK                        = 1  ,--1 正确返回 非1 错误返回
	RET_SERVER_MAINTAIN           = 2  ,--服务器维护
	RET_NO_FIND_USER              = 3  ,--玩家不存在
	RET_LOGIN_REPEAT              = 4  ,--重复登陆
	RET_USER_NAME_REPEAT          = 5  ,--创建角色时,玩家名字重复
	RET_SERVER_USER_OVER_CEILING  = 6  ,--超过服务器上限
	RET_LOGIN_BAN_USER            = 7  ,--被封用户
	RET_SERVER_NO_OPEN            = 8  ,--服务器未开服
	RET_SERVER_CLOSE_REGIST       = 9  ,--服务器关闭注册 请选择其他服务器进行游戏
	RET_LOGIN_TOKEN_TIME_OUT      = 10 ,--登录超时
	RET_VERSION_ERR               = 11 ,--版本不一致
	RET_UUID_NOT_ACTIVATE         = 12 ,--账号未激活
	RET_ACTIVATE_ALREADY_USE      = 13 ,--激活码已经被使用
	RET_ACTIVATE_INVALID          = 14 ,--激活码无效
	RET_LOGIN_BAN_IP_ALL_SERVER   = 25 , --全服封IP
    RET_LOGIN_BAN_DEVICE_ALL_SERVER = 26 , --全服封设备
    RET_LOGIN_NEED_VERYFY         = 10503,  --登陆需要校验

	RET_ITEM_NOT_EXIST                    = 1005 ,--道具不存在
	RET_FRAG_NOT_EXIST                    = 1006 ,--碎片不存在
	RET_BATTLE_ERROR                      = 1007 ,--战斗出错
	RET_HERO_NOT_EXIST                    = 1008 ,--武将不存在
	RET_WRONG_TARGET                      = 1009 ,--错误的目标
	RET_HERO_LEVEL_EXCEED_LEAD            = 1010 ,--大于主角等级
	RET_MATERIALS_QUALITY_ERROR           = 1011 ,--材料品质不匹配
	RET_HERO_ONETEAM                      = 1012 ,--武将在阵上
	RET_MATERIALS_HAVE_BEEN_UPGRADED      = 1013 ,--武将培养过，不可被吞噬
	RET_EQUIP_NOT_EXIST                   = 1014 ,--装备不存在
	RET_ITEM_NOT_ENOUGH                   = 1015 ,--物品不足
	RET_USER_LEVEL_ENOUGH                 = 1016 ,--玩家等级不足
	RET_USER_LEVEL_MAX                    = 1017 ,--等级已达上限
	RET_USER_HERO_NOT_ENOUGH              = 1018 ,--同名卡数量不足
	RET_USER_HERO_DESTINY_DATA_ERR        = 1019 ,--缘分数据错误
	RET_USER_HERO_DESTINY_CAN_NOT_ACTIVE  = 1020 ,--缘分不能激活
	RET_USER_HERO_ON_TEAM                 = 1021 ,--上阵武将不能动
	RET_TREASURE_UPGRADE_MAX_LEVEL        = 1022 ,--宝物以强化至最大等级
	RET_TREASURE_REFINE_MAX_LEVEL         = 1023 ,--宝物以精炼至最大等级
	RET_TREASURE_HAS_DEVELOP              = 1024 ,--宝物养成过
	RET_CHAT_CONTENT_OUT_OF_LEN           = 1025 ,--聊天内容超过长度
	RET_CHAT_HIGH_FREQUENCY               = 1026 ,--聊天过于频繁
	RET_BATTLE_CAN_NOT_FIND_SKILL         = 1027 ,--技能配置找不到
	RET_CHAT_FORBID                       = 1028 ,--禁言

	RET_TERRITORY_JOIN_GUILD      = 1029 ,--先加入军团
	RET_TERRITORY_RIOT_EXPLRE     = 1030 ,--暴动已过期
	RET_TERRITORY_RIOT            = 1031 ,--暴动中
	RET_TERRITORY_HERO_ON_PATROL  = 1032 ,--武将巡逻中

	RET_ACT_CHECKIN_ALREADY       = 1040 ,--今天已签到
	RET_ACT_DAILY_BOSS_NOT_EXIST  = 1041 ,--每日boss不存在
	RET_EXPLORE_AGO_CHAPTER       = 1042 ,--游历前置关卡未通关
	RET_EXPLORE_CHAPTER           = 1043 ,--副本未解锁

	RET_IS_NOT_UP_TO_LEVEL      = 2001 ,--主角等级不足
	RET_IS_NOT_UP_TO_VIP_LEVEL  = 2002 ,--VIP等级不足

	RET_HERO_BAG_FULL         = 3001 ,--卡牌背包满
	RET_EQUIP_BAG_FULL        = 3002 ,--装备背包满
	RET_TREASURE_BAG_FULL     = 3003 ,--宝物背包满
	RET_TINSTRUMENT_BAG_FULL  = 3004 ,--神兵背包满

	RET_CHAPTERBOX_REWARDED              = 4001  ,--章节宝箱奖励已经领取
	RET_NOT_ENOUGH_CHAPTERBOX_STAR       = 4002  ,--章节宝箱星星数不够
	RET_CHAPTER_STAGE_NO_EXISTS_STAR     = 4003  ,--不存在的星数
	RET_DAILY_DUNGEON_IS_NOT_OPEN_LEVEL  = 40010 ,--日常副本等级不足
	RET_DAILY_DUNGEON_IS_NOT_OPEN_TIME   = 40011 ,--日常副本今天不开放
	RET_DAILY_DUNGEON_PRE_NOT_PASS       = 40012 ,--日常副本前置关卡没有通关
	RET_DAILY_DUNGEON_NOT_ENOUGH_COUNT   = 40013 ,--日常副本次数用完

	RET_CHAPTER_STAGE_NO_COUNT         = 7003 ,--没有挑战次数
	RET_CHAPTER_STAGE_STAR_NOT_ENOUGH  = 7004 ,--星数不够

	RET_RECRUIT_NO_TIME        = 8000 ,--时间没到
	RET_RECRUIT_NO_FREE        = 8001 ,--没有免费次数
	RET_RECRUIT_NO_ITEM        = 8002 ,--没有招募令
	RET_RECRUIT_NO_REWARD      = 8003 ,--招募奖励错误
	RET_RECRUIT_NO_GOLD        = 8004 ,--元宝不够
	RET_RECRUIT_NO_HERO        = 8005 ,--积分获取英雄错误
	RET_RECRUIT_NO_ALREADYGET  = 8006 ,--该宝箱已经领取
	RET_RECRUIT_NO_POINT       = 8007 ,--积分获取英雄积分不够

	RET_EQUIPMENT_NO_MAX_LEVEL  = 8008 ,--已经最大经验了
	RET_NOT_ENOUGH_FRAG         = 8009 ,--碎片不足

	RET_SHOP_BUY_COUNT_EXCEED_LIMIT     = 8020 ,--商店购买次数上限
	RET_SHOP_ITEM_NO_EXIST              = 8021 ,--商店物品不存在
	RET_SHOP_TYPE_ERROR                 = 8022 ,--商店物类型错误
	RET_SHOP_REFRESH_TYPE_ERROR         = 8023 ,--商店物类型错误
	RET_SHOP_REFRESH_FREE_ENOUGH        = 8024 ,--商店刷新免费次数不够
	RET_SHOP_REFRESH_ITEM_ERROR         = 8025 ,--商店刷新不能使用刷新令
	RET_SHOP_REFRESH_CNT_ENOUGH         = 8026 ,--商店刷新次数不足
	RET_TOWER_TOPTOWER                  = 8050 ,--爬塔到顶了
	RET_TOWER_ERROR                     = 8051 ,--不能扫荡
	RET_TOWER_BOX_NO_GET                = 8052 ,--上层宝箱没领
	RET_TOWER_BOX_ERROR                 = 8053 ,--没有宝箱可以领取
	RET_TOWER_BOX_GET                   = 8054 ,--宝箱领取过了
	RET_TOWER_LAYER_ERROR               = 8055 ,--层数id错误
	RET_TOWER_SURPRISE_ERROR            = 8056 ,--奇遇不存在
	RET_TOWER_SURPRISE_WIN              = 8057 ,--奇遇打过了
	RET_OFFICER_MAX                     = 8060 ,--官衔等级最大
	RET_OFFICER_RESOURCE_NOT_ENOUGH     = 8061 ,--所需资源不够
	RET_OFFICER_POWER_ERROR             = 8063 ,--战力不够
	RET_REPEATED_ORDER_ID               = 8065 ,--重复订单
	RET_DAILY_TASK_AWARD_NOT_CONDITION  = 8070 ,--每日任务条件不足
	RET_DAILY_TASK_AWARD_NOT_REPEAT     = 8071 ,--每日任务重复领取

	RET_REBEL_ARMY_NOTVAILD      = 8075 ,--没有激活的boss
	RET_REBEL_ARMY_NOTPUBLIC     = 8076 ,--没有共享
	RET_REBEL_ARMY_NORESOURCE    = 8077 ,--缴费令不够
	RET_REBEL_ARMY_REWARD_GET    = 8078 ,--奖励领取过了
	RET_REBEL_ARMY_REWARD_ERROR  = 8079 ,--奖励领取条件不够
	RET_REBEL_ARMY_REWARD_OVER   = 8080 ,--boss已经被击杀
	RET_REBEL_ARMY_NOTGUILD      = 8081 ,--不是自己军团的
	RET_REBEL_ARMY_NO_GUILD      = 8082 ,--还没有军团

	RET_ARENA_RANK_LOCK                  = 8085 ,--目标正在被挑战
	RET_ARENA_OPPFONENT_THAN_OWN_STRONG  = 8086 ,--目标排名大于自己
	RET_ARENA_NOT_ENOUGH_CNT             = 8087 ,-- 挑战次数不够
	RET_ARENA_NOT_ENOUGH_RANK            = 8088 ,-- 排名不够
	RET_ARENA_REWARD_GET                 = 8089 ,--奖励领取过了

	RET_ACHIEVEMENT_AWARD_NOT_CONDITION  = 8090 ,--成就条件不够

	RET_GUILD_ALREADY_IN                   = 8095 ,--已经加入军团
	RET_GUILD_NAME_INVALID                 = 8096 ,--军团名字不对
	RET_GUILD_NAME_REPEATED                = 8097 ,--军团名字已经被使用
	RET_GUILD_NOT_EXIST                    = 8098 ,--军团不存在
	RET_GUILD_MEMBER_NOT_EXIST             = 8099 ,--军团成员不存在
	RET_GUILD_LEAVE_GUILD_24H_NOT_ALLOWED  = 8100 ,--退出时间没有超过24小时
	RET_GUILD_MEMBER_APPLICATION_FULL      = 8101 ,--申请条目上限
	RET_GUILD_APPLATION_FULL               = 8102 ,--军团申请上限
	RET_GUILD_NOT_FOUND_APPLICATION        = 8103 ,--没有申请
	RET_GUILD_NO_PERMISSIONS               = 8104 ,--军团职位不够
	RET_GUILD_MEMBER_FULL                  = 8105 ,--军团人数已满
	RET_GUILD_NOT_DISMISS                  = 8106 ,--军团不能解散
	RET_GUILD_ALREADY_IMPEACH              = 8107 ,--弹劾正在进行中
	RET_GUILD_PERMISSIONS_FULL             = 8108 ,--军团职位已满
	RET_GUILD_HELP_NO_ERROR                = 8109 ,--军团申请援助位置不对
	RET_GUILD_HELP_ID_ERROR                = 8110 ,--军团申请援助id不对
	RET_GUILD_HELP_LOCK                    = 8111 ,--军团援助正在被进行
	RET_GUILD_HELP_GET_ALL                 = 8112 ,--军团援助已经领完啦
	RET_GUILD_HELP_LIMIT                   = 8113 ,--军团求援上限
	RET_GUILD_HELP_ACK_LIMIT               = 8114 ,--军团援助上限
	RET_GUILD_HELP_FINISH_CNT_ENOUGH       = 8115 ,--军团援助完成次数不够
	RET_GUILD_LEVEL_ENOUGH                 = 8116 ,--军团等级不够
	RET_GUILD_DUNGEON_EXIST_ERROR          = 8117 ,--军团副本不存在
	RET_GUILD_DUNGEON_CNT_ENOUGH           = 8118 ,--军团副本次数不够
	RET_GUILD_DUNGEON_ATK_CD               = 8119 ,--军团副本挑战cd
	RET_GUILD_DUNGEON_SOURCE_ERROE         = 8120 ,--军团副本积分不够
	RET_GUILD_DUNGEON_TIME_CLOSE           = 8121 ,--军团副本时间没到m
	RET_GUILD_DUNGEON_SOURCE_GET           = 8122 ,--军团副本积分奖励领取过了

	RET_GUILD_TRAIN_TRAINING          	   = 8139 ,--对方正在演武
	RET_GUILD_TRAIN_INTERVAL          	   = 8469 ,--处于请求演武间隔，稍后再试
	RET_MONTH_CARD_NOT_AVAILABLE           = 8520 ,--月卡失效
	RET_MONTH_CARD_NOT_USE          	   = 8521 ,--月卡不能使用

	RET_GUIDE_ID_LESS_OLD  = 8200 ,--新手引导ID错误

	RET_RESOURCE_NOT_ENOUGH              = 10000 ,--资源不足
	RET_RESOURCE_GOLD_NOT_ENOUGH         = 10001 ,--元宝不足
	RET_RESOURCE_SILVER_NOT_ENOUGH       = 10002 ,--银两不足
	RET_RESOURCE_VIT_NOT_ENOUGH          = 10003 ,--体力不足
	RET_RESOURCE_SPIRIT_NOT_ENOUGH       = 10004 ,--精力不足
	RET_RESOURCE_EXP_NOT_ENOUGH          = 10005 ,--经验不足
	RET_RESOURCE_VIP_EXP_NOT_ENOUGH      = 10006 ,--VIP经验不足
	RET_RESOURCE_REVERENCE_NOT_ENOUGH    = 10007 ,--威望不足
	RET_RESOURCE_CULTIVATION_NOT_ENOUGH  = 10008 ,--功勋不足
	RET_RESOURCE_SOUL_NOT_ENOUGH         = 10009 ,--将魂不足
	RET_RESOURCE_IRON_NOT_ENOUGH         = 10010 ,--精铁不足
	RET_RESOURCE_WEIJIAO_NOT_ENOUGH      = 10011 ,--围剿次数不足
	RET_RESOURCE_TIAOZHAN_NOT_ENOUGH     = 10012 ,--挑战次数不足
	RET_RESOURCE_GONGXIAN_NOT_ENOUGH     = 10013 ,--军团个人贡献不足

	RET_FIGHTS_MATCH_TIMEOUT			 = 10140 ,--匹配超时 
	RET_FIGHTS_CANCEILMATCH_TIMEOUT 	 = 10143 ,--取消匹配超时
	RET_FIGHTS_MATCH_FORBIT			 	 = 10146 ,--禁赛期间无法匹配
	RET_FIGHTS_SEASONREWARDS_GOT		 = 10147 ,--上赛季奖励已领取
	RET_FIGHTS_RECONNECT_FIGHTSOVER		 = 10165 ,--重连时战斗结束

	RET_RETURNSVR_NOT_QUALIFIED			 = 10171 ,--无回归资格
	RET_RETURNSVR_IS_FULL			     = 10172 ,--回归人数已满
}
