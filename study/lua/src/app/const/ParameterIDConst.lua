--
--@Author:Conley
local ParameterIDConst = {}

ParameterIDConst.RECRUIT_GOLD_COST1 = 1         --单抽
ParameterIDConst.RECRUIT_GOLD_COST10 = 2        --十连抽

ParameterIDConst.MISSION_DROP_MONEY = 5         --副本掉落金钱
ParameterIDConst.MISSION_DROP_EXP = 6           --副本掉落经验

ParameterIDConst.HERO_EXP_SILVER = 9 --吞噬武将每1000经验对应消耗银币数量

ParameterIDConst.MAX_EQUIPMENT_LEVEL = 12 --装备强化等级上限=主角等级*1（填写千分比）
ParameterIDConst.MAX_EQUIPMENT_REFINE_LEVEL = 13 --装备精炼等级上限=主角等级*0.25（填写千分比）

ParameterIDConst.RECRUIT_POINT_NORMAL = 14          --普通一次给的积分
ParameterIDConst.RECRUIT_POINT_GOLD = 15            --元宝一次给的积分
ParameterIDConst.RECRUIT_BOX1_POINT = 16            --开宝箱1需要积分
ParameterIDConst.RECRUIT_BOX2_POINT = 17            --开宝箱2需要积分            
ParameterIDConst.RECRUIT_BOX3_POINT = 18            --开宝箱3需要积分
ParameterIDConst.RECRUIT_NORMAL_COUNT = 19          --每天普通抽奖次数
ParameterIDConst.RECRUIT_TNTERVAL = 20              --免费抽奖间隔
ParameterIDConst.RECRUIT_POINT_BOX_1 = 21           --积分宝箱1
ParameterIDConst.RECRUIT_POINT_BOX_2 = 22           --积分宝箱2
ParameterIDConst.RECRUIT_POINT_BOX_3 = 23           --积分宝箱3

ParameterIDConst.LV_MAX = 27	--当前版本开放等级最大上限

ParameterIDConst.MAX_TREASURE_LEVEL = 29	--宝物强化等级上限=主角等级*0.5（填写千分比）
ParameterIDConst.TREASURE_SILVER = 30 --吞噬宝物每100经验对应消耗5银币数量
ParameterIDConst.MAX_TREASURE_REFINE = 31 --宝物精炼等级上限=主角等级*0.12（填写千分比）

ParameterIDConst.DAILY_BOSS_TIME = 41   --每日boss刷新时间
ParameterIDConst.FIRST_PAY_DROP_ID = 43--首充掉落

ParameterIDConst.GUILD_CREAT_COST_ID = 44 --创建军团消耗元宝
ParameterIDConst.GUILD_IMPEACH_TIME_ID = 45 --弹劾军团长需要军团长连续不上线时间，秒
ParameterIDConst.GUILD_IMPEACH_WAIT_ID = 46 --弹劾军团长后缓冲等待时间，秒
ParameterIDConst.GUILD_IMPEACH_COST_ID = 47 --弹劾团长需要元宝
ParameterIDConst.GUILD_MAX_LV_ID = 48 --军团最大等级
ParameterIDConst.GUILD_DEPUTY_NUM_ID = 49 --最大副团长数量
ParameterIDConst.GUILD_ELDER_NUM_ID = 50 --最大长老数量
ParameterIDConst.GUILD_QUIT_CD_ID = 51 --退出军团重新加入间隔时间，秒
ParameterIDConst.GUILD_PROTECT_ID = 52 --军团成员多少后不可解散军团
ParameterIDConst.GUILD_APPLY_PLAYER_ID = 53 --个人同时申请数量上限
ParameterIDConst.GUILD_APPLY_LIST_ID = 54 --军团申请列表上限
ParameterIDConst.GUILD_SHOP_UNLOCK_ID = 55 --军团商店开启需要军团等级
ParameterIDConst.GUILD_SUPPORT_UNLOCK_ID = 56 --军团援助开启需要军团等级
--ParameterIDConst.GUILD_PRIZES_UNLOCK_ID = 57 --军团五谷丰登开启需要等级
ParameterIDConst.GUILD_PARTY_UNLOCK_ID = 58 --军团聚会需要军团等级
ParameterIDConst.GUILD_STAGE_UNLOCK_ID = 59 --军团副本需要等级
ParameterIDConst.GUILD_TREASURY_UNLOCK_ID = 60 --军团宝库需要等级
ParameterIDConst.GUILD_TEAM_UNLOCK_ID = 61 --军团组队战需要等级

ParameterIDConst.GUILD_RECOURSE_TIMES_ID = 65 --军团每日向他人求援碎片次数
ParameterIDConst.GUILD_SUPPORT_TIMES_ID = 66 --军团每日向他人援助碎片次数
ParameterIDConst.GUILD_RECOURSE_FINISH_ID = 67 --军团每日完成全部求援奖励组dropid
ParameterIDConst.GUILD_PROTECT_TIMES_ID = 68 --加入军团后的退出/踢出保护时间
ParameterIDConst.GUILD_RECOURSE_FINISHTIMES_ID = 69 --军团每日完成求援任务需要次数
ParameterIDConst.GUILD_CREATE_DAILY_MAX = 322 --每日创建军团次数

ParameterIDConst.GUILD_DECLARATION_LV = 338--军团宣言的限制等级

ParameterIDConst.VIP_LEVEL_MAX = 74  --主角VIP等级上限

ParameterIDConst.SEVEN_DAYS_SHOW_HERO = 78 --7日活动最后一天奖励的英雄ID  



ParameterIDConst.DRAW_BANSHU_OPEN = 75  --版熟抽卡打开
ParameterIDConst.DRAW_BANSHU_CNT = 76  --版熟普通抽卡次数
ParameterIDConst.DRAW_BANSHU_MONEY_CNT = 77  --版熟元宝抽卡次数

ParameterIDConst.DRAW_NORMAL_GIVE = 79  --普通抽卡获得金币
ParameterIDConst.DRAW_MONEY_GIVE = 80   --水晶抽卡获得金币2  

ParameterIDConst.DISPLAY_NUMBER = 94 --绿、蓝将 回收红点显示数量

ParameterIDConst.STAGE_SHOW_HERO = 100--浮岛显示获得提示的最小等级 

ParameterIDConst.GUILD_SUPPORT_CD = 57 -- 军团援助冷却时间

ParameterIDConst.GUILD_SUPPORT_CDMAX = 60 -- 军团援助最大冷却时间

ParameterIDConst.TOWER_SUPER_CHALLENGE_MAX_TIME = 115 --爬塔精英挑战最大次数

ParameterIDConst.CHANGE_LEVEL_MAX = 131 --更换武将的红点提示（此等级以下有相关机制）
ParameterIDConst.FAMOUS_MAX_COUNT = 132 --名将副本每日挑战次数

ParameterIDConst.GUILD_RENAME_COST = 137 --军团改名花费
ParameterIDConst.AVATAR_HINT_CLOSE = 139 --高品质变身卡红点提示关闭


ParameterIDConst.MAIL_TIME = 142 --邮件过期时间
ParameterIDConst.GUILD_REDPACKET_OPENTIMES = 109 --可抢红包总数

ParameterIDConst.CITY_DAY_TIME = 150 --白天时间

ParameterIDConst.REBORN_COST = 153


ParameterIDConst.GUILD_STAGE_OPENDAY = 58 --开启军团副本需要的开服时间
ParameterIDConst.GUILD_MAXKICK_TIMES = 66 --军团最大的踢人次数

ParameterIDConst.GUILD_STAGE_OPENNUM = 70 --开启军团副本需要军团人数
ParameterIDConst.GUILD_STAGE_OPENTIME = 71 --军团副本每日开启时间（秒）
ParameterIDConst.GUILD_STAGE_ATKTIME = 72 --开启军团副本工大次数
ParameterIDConst.GUILD_STAGE_ATKCD = 73 --军团副本攻击间隔

ParameterIDConst.GUILD_MAIL_COST = 107 --军团邮件花费

ParameterIDConst.DISPLACE_PROPORTION = 175 --武将置换，消耗置换符比例

ParameterIDConst.TROOP_MAX = 160    --最大兵力
ParameterIDConst.MINE_HAVEST_TIME = 196     --矿区收获最小时间

ParameterIDConst.FOOD_PER_MOVE = 167        --矿战每移动一格的消耗

ParameterIDConst.MINE_TIME_LIMIT = 158      --矿战收获时间的上限
ParameterIDConst.MINE_OUTPUT_ADD = 173      --矿战占领加成
ParameterIDConst.MINE_ONLY_GUILD = 172      --矿战独占

ParameterIDConst.MINE_GOLD_TO_FOOD = 208    --矿战一个粮草价值多少元宝

ParameterIDConst.REDBAG_MULTI_LIMIT  = 247    --军团红包2倍需要VIP等级
ParameterIDConst.REDBAG_MULTI_LIMIT2 = 248    --军团红包3倍、6倍需要VIP等级

ParameterIDConst.SKIP_BATTLE = 249 --主线、精英、名将、过关斩将跳过战斗需要的VIP等级和主角等级，必须同时满足

ParameterIDConst.HOMELAND_TIME_LIMIT = 312  --神树最高产出时间

ParameterIDConst.EQUIP_ACTIVE_RED = 316 --割须弃袍有n个曹操战袍时商店出红点
ParameterIDConst.STAR_ACTIVE_RED = 317 --卧龙观星有n个神兽精华时商店出红点

ParameterIDConst.DISPLACE_CHANGE_CAMP = 320 --置换-跨阵营武将置换,消耗的特殊道具，及数量
ParameterIDConst.DISPLACE_TREASURE_PROPORTION = 321 --宝物置换，消耗置换符比例

ParameterIDConst.DISPLACE_RED_ACROSS = 335 --置换-红将跨阵营置换消耗的特殊道具及对应同名卡消耗数量
ParameterIDConst.DISPLACE_RED_BASIS = 336 --置换-红将置换消耗的红色置换符道具及消耗的对应比例数量

ParameterIDConst.PLAYER_DETAIL_LEVEL_LIMIT = 341 --玩家等级上限描述
ParameterIDConst.PLAYER_DETAIL_LEVEL_MAX = 342 --玩家等级上限描述

ParameterIDConst.DAILY_BOSS_TIME = 41 -- BOSS 强敌来袭时间

ParameterIDConst.GUILD_WAR_MOVE_CD =  329  -- 军团战移动CD
ParameterIDConst.GUILD_WAR_ATK_CD = 330 -- 军团战攻击CD
ParameterIDConst.GUILD_WAR_HP = 331 --军团战用户血量
ParameterIDConst.GUILD_WAR_OPEN_WEEK = 325 -- 军团战开放日期
ParameterIDConst.GUILD_WAR_STARTTIME = 326 --军团战开始时间
ParameterIDConst.GUILD_WAR_TIME_1 = 327 --军团战准备时间
ParameterIDConst.GUILD_WAR_TIME_2 = 328 --军团战攻击时间
ParameterIDConst.GUILD_WAR_PROCLAIM_MAX =   339--军团战单个城最大宣战数
ParameterIDConst.GUILD_WAR_PROCLAIM_CD =  340 --军团战宣战CD
ParameterIDConst.GUILD_WAR_TOTAL_ATK_CD = 352 -- 军团战总攻击CD 
ParameterIDConst.GUILD_WAR_DECLARE_LV =  338 --军团战宣战等级
ParameterIDConst.GUILD_WAR_REBORN =  373 --军团战重生时间

ParameterIDConst.VIP_MIN_CHARGE = 396--军团战重生时间

ParameterIDConst.SILKBAG_START_LV = 484 --锦囊成长起始等级


ParameterIDConst.TRAIN_LIMIT_ACTIVE = 600 -- 演武次数上限
ParameterIDConst.TRAIN_LIMIT_PASSIVE = 601 -- 被演武次数上限
ParameterIDConst.TRAIN_LIMIT_TIME = 602 -- 演武时间
ParameterIDConst.TRAIN_PERCENT_EXP = 606 -- 增长时间间隔

-- 跨服军团战
ParameterIDConst.GUILDCROSS_OPEN_ACT           = 449 -- 跨服军团战周二开
ParameterIDConst.GUILDCROSS_ACT_START          = 450 -- 跨服军团战21:30
ParameterIDConst.GUILDCROSS_OPEN_WEEK          = 452 -- 跨服军团战周六开
ParameterIDConst.GUILDCROSS_OPEN_TIME          = 453 -- 跨服军团战当天几点开
ParameterIDConst.GUILDCROSS_READY_TIME         = 454 -- 跨服军团战准备时间60'
ParameterIDConst.GUILDCROSS_CONDUCTING_TIME    = 455 -- 跨服军团战进行时间900'
ParameterIDConst.GUILDCROSS_ATTACK_COOLINGTIME = 461 -- 跨服军团战攻击冷却时间5'
ParameterIDConst.GUILDCROSS_USER_MAXHP         = 463 -- 跨服军团战攻击冷却时间5'
ParameterIDConst.GUILDCROSS_GRID_SIZE          = 474 -- 跨服军团战格子大小
ParameterIDConst.GUILDCROSS_GUESS_START        = 475 -- 跨服军团战竞猜开始时间
ParameterIDConst.GUILDCROSS_GUESS_END          = 476 -- 跨服军团战竞猜结束时间
ParameterIDConst.GUILDCROSS_GUESS_ACTEND       = 477 -- 跨服军团战竞猜活动结束时间
ParameterIDConst.GUILDCROSS_SUPPORT_ITEMS      = 500 -- 跨服军团战支持掉落物
ParameterIDConst.GUILDCROSS_SHOW_CLOSE         = 527 -- 跨服军团战周日20点展示关闭
ParameterIDConst.GUILDCROSS_CHAT_SHOW          = 528 -- 跨服军团战周六跨服聊天开启时间
ParameterIDConst.GUILDCROSS_CHAT_CLOSE         = 529 -- 跨服军团战周六跨服聊天结束时间


ParameterIDConst.HORSE_CONQUER_ACTIVE_RED = 603 --关公训马有n个xxx时商店出红点
ParameterIDConst.DEFAULT_ICON = 618 -- 默认图标

ParameterIDConst.MINE_CRAFT_ATKENEMY_LOSS       = 622 -- 矿战攻击敌方兵力损失-2
ParameterIDConst.MINE_CRAFT_ATKSELF_LOSS        = 623 -- 矿战攻击己方兵力损失
ParameterIDConst.MINE_CRAFT_DEFENSEENEMY_LOSS   = 624 -- 矿战防守敌方兵力损失
ParameterIDConst.MINE_CRAFT_DEFENSESELF_LOSS    = 625 -- 矿战防守时己方兵力损失
ParameterIDConst.MINE_CRAFT_SOILDERADD          = 626 -- 矿战兵力上限增加

ParameterIDConst.DISPLACE_WEAPON_RED = 694 --置换-橙色神兵和红色神兵所需要的置换符比例
ParameterIDConst.DISPLACE_WEAPON_GOLD = 695 --置换-金色神兵所需要的置换符比例
ParameterIDConst.DISPLACE_HERO_GOLD = 696 --置换-金色武将所需要的置换符比例
ParameterIDConst.DISPLACE_GOLD_ACROSS = 697 --置换-金将将跨阵营置换消耗的特殊道具及对应同名卡消耗数量

-- 金将招募
ParameterIDConst.GACHA_GOLDENHERO_WAITING       = 628 -- 等待时间:0
ParameterIDConst.GACHA_GOLDENHERO_DURATION      = 629 -- 持续时间:13800
ParameterIDConst.GACHA_GOLDENHERO_REST          = 630 -- 休息时间:600
ParameterIDConst.GACHA_GOLDENHERO_EVERYOPEN     = 636 -- 每天开启时间
ParameterIDConst.GACHA_GOLDENHERO_EVERYCLOSE    = 637 -- 每天关闭时间
ParameterIDConst.GACHA_GOLDENHERO_EVERYOPEN1    = 642 -- 每天第一轮开始时间
ParameterIDConst.GACHA_GOLDENHERO_EVERYCLOSE1   = 643 -- 每天第一轮关闭时间


-- 和平矿
ParameterIDConst.OUTPUT_UP_REFRESH              = 400 -- 富矿刷新时间：时|分|秒
ParameterIDConst.PEACE_EVIL                     = 726 -- 在和平矿攻击非恶名玩家增加x点恶名值
ParameterIDConst.PEACE_ATTACK_LIMIT             = 727 -- 恶名值达到x不可以在和平矿区攻击别人
ParameterIDConst.PEACE_EVIL_REDUCE              = 728 -- 恶名值每x秒减少x点
ParameterIDConst.PEACE_VIPEVIL_REDUCE           = 729 -- 矿战特权恶名值每x秒减少x点
ParameterIDConst.PEACE_WEEK                     = 732 -- 和平矿每周生成时间
ParameterIDConst.PEACE_EVIL_LIMIT               = 733 -- 普通玩家恶名值上限
ParameterIDConst.PEACE_EVIL_VIPLIMIT            = 734 -- 矿战特权恶名值上限
ParameterIDConst.PEACE_BEGIN                    = 735 -- 双倍、三倍矿刷新x秒后生成和平矿
--矿战碾压
ParameterIDConst.POWER_GAP                      = 736 -- 战力差距比例（小号的战力为大号的千分之x）

-- 客户端验证
ParameterIDConst.SIGN_HEAD                      = 803 -- 验证字符串

ParameterIDConst.LIMIT_RED_SHOW_DAY            =  851 -- 武将红升金的金将显示天数

-- 节日音乐特定
ParameterIDConst.BGM_SPECIFIED                 = 799

ParameterIDConst.BACK_CONFIRM_LV				= 888 --回归服-达到x级需强制确认回归

ParameterIDConst.SPECIAL_CONFIG_TIME			= 920 --用于读取特殊配置的判别时间

ParameterIDConst.TSHIRT_LIMIT                   = 922 --T恤活动资格判定（充值金额）

ParameterIDConst.GOLD_AVATAR_FREE_TIMES         = 932 -- 金色变身卡每日免费次数
ParameterIDConst.GOLD_AVATAR_ONE_DRAW           = 934 -- 金色变身卡单抽价格
ParameterIDConst.GOLD_AVATAR_TEN_DRAW           = 935 -- 金色变身卡十抽价格
ParameterIDConst.GOLD_AVATAR_DURATION_LEFT      = 946 -- 金色变身卡活动结束后展示时间


--晋将招募
ParameterIDConst.ACT_GACHAJIN_DURATION               = 951 -- 活动持续时间
ParameterIDConst.ACT_GACHAJIN_FREECOUNT              = 952 -- 每天免费次数
ParameterIDConst.ACT_GACHAJIN_COST1                  = 954 -- 单抽消耗玉璧
ParameterIDConst.ACT_GACHAJIN_COST2                  = 955 -- 十连抽消耗玉璧
ParameterIDConst.ACT_GACHAJIN_POINTRANK_RANDOMAWARD  = 965 -- 排名奖励中用于显示随机金将的道具id
ParameterIDConst.ACT_GACHAJIN_POINTRANK_RANDOMAWARD2 = 966 -- 排名奖励中用于显示随机金将的道具id
ParameterIDConst.ACT_GACHAJIN_AUTOBTN_VIPLIMIT       = 967 -- 自动显示按钮vip限制

ParameterIDConst.EXTRA_HERO_PLACE                    = 968 -- 当前可上阵副将位

ParameterIDConst.SEVEN_DAY_MONEY_DURATION            = 1001 --七日累充任务持续时间（从04:00开始）   
ParameterIDConst.SEVEN_DAY_MONEY_REWARD_DURATION     = 1002 --七日累充领奖持续时间（从04:00开始）

--元宝兑换
ParameterIDConst.DIAMOND_EXCHANGE_RADIO              = 1003 --玉璧兑换元宝兑换率

return ParameterIDConst
