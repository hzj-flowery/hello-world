--配置活动常量
--@Author:Conley
local CustomActivityConst = {}
local Colors = require("app.utils.Color")

CustomActivityConst.STATE_NOT_START    = 0 --活动未开启
CustomActivityConst.STATE_ING    = 1 --活动进行中
CustomActivityConst.STATE_AWARD_ING    = 2 --活动已结束 领奖阶段
CustomActivityConst.STATE_AWARD_END    = 3 --活动已结束 领奖阶段
CustomActivityConst.STATE_PREVIEW    = 4 --活动预览中

CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_DEFAULT    = 1 --活动
CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL    = 2 --节日狂欢

CustomActivityConst.REWARD_TYPE_ALL = 1--奖励类型－全部奖励
CustomActivityConst.REWARD_TYPE_SELECT = 2--奖励类型－选择一个

CustomActivityConst.MAX_ITEM_NUM = 4--奖励和兑换最大Item数

CustomActivityConst.ACT_ICON_TYPE_1 = 1--图标类型

CustomActivityConst.ACT_BUTTON_TYPE_RECEIVE_GRAY = 0--领取(灰色，无功能)
CustomActivityConst.ACT_BUTTON_TYPE_GO_RECHARGE = 1--去充值(跳转去充值)

CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PUSH  = 1 --条件推进类
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_WEAL  = 2 --福利类
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL  = 3 --兑换类
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PAY   = 4 --充值消费类
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR   = 5 --变身卡活动
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP   = 6 --装备活动
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET	= 7 --神兽活动
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_DROP   = 8 -- 掉落活动
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_DROP_SHOW  = 9 -- 掉落活动展示
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE  = 10 -- 相马活动
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS  = 11 -- 基金活动
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER  = 12 -- 训马活动
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT  = 13 -- VIP推送礼包
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_TEN_JADE_AUCTION  = 16 -- 跨服拍卖
CustomActivityConst.CUSTOM_ACTIVITY_TYPE_RETURN_SERVER_GIFT  = 17 -- 回归服礼包


CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_CHAPTER             = 101 --主线副本战斗[主线副本战斗胜利#num#次 胜利次数x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_ECHAPTER            = 102 --精英副本战斗[精英副本战斗胜利#num#次 胜利次数x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_LOGIN               = 103 --累计登陆[累计登陆#num#天 累计登陆天数x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_LEVEL               = 104 --角色等级
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_VIP_LEVEL           = 105 --VIP等级
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_ARENA               = 106 --竞技场[竞技场胜利#num#次 胜利次数x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_EXPLORE             = 107 --游历[游历#num#次 游历次数x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_ITEM                = 108 --物品收集[活动期间获取#name##num#个 物品类，物品值，物品数量]
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_KILL_DEVIL          = 109 --叛军击杀[击毙叛军#num#名 最后一击次数x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_DEVIL               = 110 --叛军攻打[攻打叛军#num#次 叛军战斗次数x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_RECRUIT             = 111 --神将招募[累计点将#num#次 累计点将次数x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PUSH_TOWER               = 112 --过关斩将[过关斩将挑战#num#次 挑战次数x]
CustomActivityConst.CUSTOM_QUEST_TYPE_GUILD_ACT                = 113 --军团活跃
CustomActivityConst.CUSTOM_QUEST_TYPE_DAILY_SCORE              = 114 --每日任务积分
CustomActivityConst.CUSTOM_QUEST_TYPE_RESET_GUILD_ACT                = 115 --军团活跃

CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_ARENA_REPUTATION    = 201 --竞技场战斗声望翻倍
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_HERO_DROW           = 202 --神将抽奖折扣
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_HERO_SHOP           = 203 --神将商店折扣
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_STAGE_MAIN          = 204 --主线副本神将碎片奖励翻倍
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_STAGE_TOWER         = 205 --过关斩将战斗精铁翻倍
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_STAGE_DAILY         = 206 --日常副本资源掉落数量翻倍
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_STAGE_BOSS          = 207 --精英副本神将碎片奖励翻倍
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_TERRITORY           = 208 --领地驻扎物品掉落数量翻倍
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_REBEL               = 209 --叛军战斗后功勋值翻倍
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_REBEL_COST          = 210 --叛军战斗时消耗征讨令减半
CustomActivityConst.CUSTOM_QUEST_TYPE_WEAL_SHOP_MUST           = 211 --商店指定物品折扣


CustomActivityConst.CUSTOM_QUEST_TYPE_SELL_EXCHANGE            = 301  --限时贩售&物品兑换
CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_EXCHANGE            = 302  --玉璧兑换



CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_TOTAL_RECHARGE       = 401 --累计充值[活动期间总共充值#num#元 期间累计充值金额x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_TOTAL_CONSUME        = 402 --累计消耗[活动期间总共消耗道具#num# 期间累计消耗道具x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_DAILY_RECHARGE       = 403 --每日充值 [本日充值#num#元 日累计充值金额x]
CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE      = 404 --单笔充值 [本日单笔充值#num#元 单笔充值金额x,奖励可领取次数y]
CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_DAILY_CONSUME        = 405 --每日消耗
CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_CONSTANT_RECHARGE    = 406 --连续充值
CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM            = 407 --销售道具
CustomActivityConst.CUSTOM_QUEST_TYPE_YUBI_GIFT                = 408 --消费玉璧活动


CustomActivityConst.CUSTOM_QUEST_TYPE_DROP       = 801 --节日掉落
CustomActivityConst.CUSTOM_QUEST_TYPE_DROP_MAIL  = 802 --节日掉落发邮件


CustomActivityConst.EQUIP_DRAW_TYPE_1 = 1 --装备运营活动抽奖类型，普通
CustomActivityConst.EQUIP_DRAW_TYPE_2 = 2 --装备运营活动抽奖类型，高级

CustomActivityConst.PET_DRAW_TYPE_1 = 1 --神兽活动抽奖类型
CustomActivityConst.PET_DRAW_TYPE_2 = 2 --神兽活动抽奖类型

CustomActivityConst.HORSE_CONQUER_TYPE_1 = 1 --训马活动抽奖类型
CustomActivityConst.HORSE_CONQUER_TYPE_2 = 2 --训马活动抽奖类型

CustomActivityConst.QUEST_LIMIT_TYPE_RECHARGE = 1 --任务显示控制 充值
CustomActivityConst.QUEST_LIMIT_TYPE_RECHARGE2 = 3 --任务显示控制 充值 充值和时间逻辑，时间逻辑服务器已经处理了
CustomActivityConst.USER_QUEST_DATA_K_RECHARGE = 2 --任务数据 充值
CustomActivityConst.QUEST_LIMIT_YUBI_COST_NUM = 4 --玉璧消耗数量限制
CustomActivityConst.QUEST_LIMIT_YUBI_COST_AND_OPENDAY = 5 --玉璧消耗数量和开服天数限制

CustomActivityConst.FUNDS_ONEDAY_TIME          = 86400  -- 一天秒数
CustomActivityConst.FUNDS_MONTHITEMNUM         = 7      -- 月基金每行奖励数目
CustomActivityConst.FUNDS_WEEKITEMNUM_MAX      = 4      -- 周基金每行奖励数目：Max
CustomActivityConst.FUNDS_WEEKITEMNUM_NORAML   = 3      -- 周基金每行奖励数目：Normal
CustomActivityConst.FUNDS_WEEKITEMNUM_SPECIAL  = 2      -- 周基金每行奖励数目：Special
CustomActivityConst.FUNDS_TYPE_WEEK            = 1101   -- 周基金
CustomActivityConst.FUNDS_TYPE_MONTH           = 1102   -- 月基金
CustomActivityConst.FUNDS_TYPE_WEEKV2          = 1103   -- 周基金V2

CustomActivityConst.FUNDS_WEEK_PANELPOSITIONY  = 404.65 -- 周基金Y坐标
CustomActivityConst.FUNDS_WEEK_LISTPOSITIONY   = 361    -- 周基金Y坐标
CustomActivityConst.FUNDS_WEEK_FIRSTFLAGOFPOSITIONY   = 265     -- 周基金listView高偏移
CustomActivityConst.FUNDS_WEEK_SPECIALFLAGOFPOSITIONY = 281     -- 周基金listView高偏移
CustomActivityConst.THREEKINDOMS_LINKED_AWARDSWIDTH   = 100.5   -- 手杀联动奖励宽度

CustomActivityConst.RECEIVED_OR_NOT = {
	Colors.THREEKINDOMS_LINKED_REWARD,    -- 颜色：1.未领取
	Colors.THREEKINDOMS_LINKED_REWARDED,  -- 颜色：2.已领取
}
CustomActivityConst.FUNDS_BACKGROUND = {
	"img_activity_zhoujijin",    -- 周基金
	"img_activity_yuejijin_biaoti",    -- 月基金
}

CustomActivityConst.FUNDS_YUANBAO = {
    "img_activity_gexiqipao_zhoujijin06",
    "img_activity_gexiqipao_zhoujijin07",
}

CustomActivityConst.FUNDS_V2_DAY = {
	"img_activity_gexiqipao_zhoujijin01",    -- V2周基金
    "img_activity_gexiqipao_zhoujijin02",    -- V2周基金
    "img_activity_gexiqipao_zhoujijin03",    -- V2周基金
    "img_activity_gexiqipao_zhoujijin04",    -- V2周基金
    "img_activity_gexiqipao_zhoujijin05",    -- V2周基金
    "img_activity_gexiqipao_zhoujijin06",    -- V2周基金
    "img_activity_gexiqipao_zhoujijin07",    -- V2周基金
}


return readOnly(CustomActivityConst)
