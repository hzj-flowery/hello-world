local SignalConst =
{
    -- SDK
    EVENT_SDK_CHECKVERSION          = "SDK_CHECKVERSION",               -- sdk检查版本
    EVENT_SDK_LOGIN                 = "SDK_LOGIN",                      -- sdk登录
    EVENT_SDK_LOGOUT                = "SDK_LOGOUT",                     -- sdk注销

    -- 登录相关
    EVENT_RECV_FLUSH_DATA           = "RECV_FLUSH_DATA",                -- 收到flush，表示数据已经全部收到
    EVENT_FINISH_LOGIN              = "FINISH_LOGIN",                   -- 登录完成，第一次收到flush后
    EVENT_CREATED_ROLE              = "CREATED_ROLE",                   -- 创角成功
    EVENT_UPDATE_ROLE_LIST          = "UPDATE_ROLE_LIST",               -- 更新服务器列表角色数据
    EVENT_LOGIN_VERSION_UPDATE      = "EVENT_LOGIN_VERSION_UPDATE",     -- 登录返回版本号
    EVENT_LOGIN_SUCCESS             = "EVENT_LOGIN_SUCCESS",            -- 登陆完成
    EVENT_AUTO_LOGIN                = "EVENT_AUTO_LOGIN",               -- 自动登陆

    -- 隐私协议相关
    EVENT_AGREE_SECRET              = "EVENT_AGREE_SECRET",                -- 点击同意隐私协议

    -- 网络相关
    EVENT_NETWORK_TIMEOUT           = "NETWORK_TIMEOUT",                --
    EVENT_NETWORK_ALIVE             = "NETWORK_ALIVE",                  --
    EVENT_NETWORK_DEAD              = "NETWORK_DEAD",                   --

    --防沉迷
    EVENT_AVOID_GAME                = "EVENT_AVOID_GAME",               --已经被防
    EVENT_OPEN_REAL_NAME            = "EVENT_OPEN_REAL_NAME",           --弹出实名面板
    EVENT_REAL_NAME_RET             = "EVENT_REAL_NAME_RET",            --实名认证返回
    EVENT_AVOID_NOTICE              = "EVENT_AVOID_NOTICE",             --实名提示
	
	--SDK实名认证
	EVENT_SDK_REAL_NAME_RET         = "EVENT_SDK_REAL_NAME_RET",        --SDK实名认证返回
	
    -- 基础信息
    EVENT_RECV_ROLE_INFO            = "RECV_ROLE_INFO",                 --
    EVENT_RECV_CURRENCYS_INFO       = "RECV_CURRENCYS_INFO",            --
    EVENT_RECV_RECOVER_INFO         = "RECV_RECOVER_INFO",              --
    EVENT_USER_LEVELUP              = "USER_LEVEL_UP",                  -- 角色升级
    EVENT_OFFICIAL_LEVEL_UP         = "OFFICIAL_LEVEL_UP",              -- 官衔升级
    EVENT_GET_WECHAT_BIND_CODE      = "EVENT_GET_WECHAT_BIND_CODE",     -- 获得绑定码

    EVENT_CHANGE_HERO_FORMATION_SUCCESS = "EVENT_CHANGE_HERO_FORMATION_SUCCESS", --更换阵位成功
    EVENT_CHANGE_HERO_SECOND_FORMATION = "EVENT_CHANGE_HERO_SECOND_FORMATION",
    EVENT_HERO_LEVELUP = "EVENT_HERO_LEVELUP",
    EVENT_HERO_RANKUP = "EVENT_HERO_RANKUP",
    EVENT_HERO_AWAKE_SUCCESS = "EVENT_HERO_AWAKE_SUCCESS", --武将觉醒成功
    EVENT_HERO_LIMIT_LV_PUT_RES = "EVENT_HERO_LIMIT_LV_PUT_RES", --武将界限突破方置材料
    EVENT_HERO_LIMIT_LV_PUT_RES_WITH_HERO = "EVENT_HERO_LIMIT_LV_PUT_RES_WITH_HERO", --武将界限突破放置武将胚子
    EVENT_HERO_LIMIT_LV_UP_SUCCESS = "EVENT_HERO_LIMIT_LV_UP_SUCCESS", --武将界限突破成功
    EVENT_HERO_TRANSFORM_SUCCESS = "EVENT_HERO_TRANSFORM_SUCCESS", --武将置换成功
    EVENT_HERO_TRANSFORM_CHOOSE = "EVENT_HERO_TRANSFORM_CHOOSE", --武将置换选择源武将
    EVENT_HERO_EQUIP_AWAKE_SUCCESS = "EVENT_HERO_EQUIP_AWAKE_SUCCESS", --武将装备觉醒材料成功
    EVENT_HERO_KARMA_ACTIVE_SUCCESS = "EVENT_HERO_KARMA_ACTIVE_SUCCESS", --缘分激活成功
    EVENT_HERO_RECOVERY_SUCCESS = "EVENT_HERO_RECOVERY_SUCCESS", --武将回收成功
    EVENT_HERO_REBORN_SUCCESS = "EVENT_HERO_REBORN_SUCCESS", --武将重生成功
    EVENT_PET_RECOVERY_SUCCESS = "EVENT_PET_RECOVERY_SUCCESS", --神兽回收成功
    EVENT_PET_REBORN_SUCCESS = "EVENT_PET_REBORN_SUCCESS", --神兽重生成功


    EVENT_EQUIP_ADD_SUCCESS = "EVENT_EQUIP_ADD_SUCCESS", --穿戴装备成功
    EVENT_EQUIP_CLEAR_SUCCESS = "EVENT_EQUIP_CLEAR_SUCCESS", --卸下装备成功
    EVENT_EQUIP_UPGRADE_SUCCESS = "EVENT_EQUIP_UPGRADE_SUCCESS", --装备强化成功
    EVENT_EQUIP_REFINE_SUCCESS = "EVENT_EQUIP_REFINE_SUCCESS", --装备精炼成功
    EVENT_EQUIP_RECOVERY_SUCCESS = "EVENT_EQUIP_RECOVERY_SUCCESS", --装备回收成功
    EVENT_EQUIP_REBORN_SUCCESS = "EVENT_EQUIP_REBORN_SUCCESS", --装备重生成功
    EVENT_EQUIP_SUPER_UPGRADE_SUCCESS = "EVENT_EQUIP_SUPER_UPGRADE_SUCCESS", --装备一键强化成功
    EVENT_TREASURE_TRANSFORM_SUCCESS = "EVENT_TREASURE_TRANSFORM_SUCCESS", --宝物置换成功
    EVENT_TREASURE_ADD_SUCCESS = "EVENT_TREASURE_ADD_SUCCESS", --穿戴宝物成功
    EVENT_TREASURE_REMOVE_SUCCESS = "EVENT_TREASURE_REMOVE_SUCCESS", --卸下宝物成功
    EVENT_TREASURE_UPGRADE_SUCCESS = "EVENT_TREASURE_UPGRADE_SUCCESS", --宝物强化成功
    EVENT_TREASURE_REFINE_SUCCESS = "EVENT_TREASURE_REFINE_SUCCESS", --宝物精炼成功
    EVENT_TREASURE_RECOVERY_SUCCESS = "EVENT_TREASURE_RECOVERY_SUCCESS", --宝物回收成功
    EVENT_TREASURE_REBORN_SUCCESS = "EVENT_TREASURE_REBORN_SUCCESS", --宝物重生成功
    EVENT_TREASURE_LIMIT_LV_PUT_RES = "EVENT_TREASURE_LIMIT_LV_PUT_RES", --宝物界限突破方置材料
    EVENT_TREASURE_LIMIT_SUCCESS = "EVENT_TREASURE_LIMIT_SUCCESS", --宝物突界成功


    EVENT_AVATAR_EQUIP_SUCCESS = "EVENT_AVATAR_EQUIP_SUCCESS", --变身卡穿戴成功
    EVENT_AVATAR_ENHANCE_SUCCESS = "EVENT_AVATAR_ENHANCE_SUCCESS", --变身卡强化成功
    EVENT_AVATAR_REBORN_SUCCESS = "EVENT_AVATAR_REBORN_SUCCESS", --变身卡重生成功
    EVENT_AVATAR_PHOTO_ACTIVE_SUCCESS = "EVENT_AVATAR_PHOTO_ACTIVE_SUCCESS", --变身卡图鉴激活成功

    EVENT_SILKBAG_EQUIP_SUCCESS = "EVENT_SILKBAG_EQUIP_SUCCESS", --装备锦囊成功

    EVENT_GUILD_GET_LIST = "EVENT_GUILD_GET_LIST", --获取军团列表
    EVENT_GUILD_CREATE_SUCCESS = "EVENT_GUILD_CREATE_SUCCESS", --创建军团成功
    EVENT_GUILD_QUERY_MALL = "EVENT_GUILD_QUERY_MALL", --进入军团大厅
    EVENT_GUILD_APPLY_SUCCESS = "EVENT_GUILD_APPLY_SUCCESS", --申请军团成功
    EVENT_GUILD_CHECK_APPLICATION_SUCCESS = "EVENT_GUILD_CHECK_APPLICATION_SUCCESS", --审核入会申请成功
    EVENT_GUILD_GET_APPLICATION = "EVENT_GUILD_GET_APPLICATION", --获取军团申请列表
    EVENT_GUILD_DISMISS_SUCCESS = "EVENT_GUILD_DISMISS_SUCCESS", --解散军团成功
    EVENT_GUILD_LEAVE_SUCCESS = "EVENT_GUILD_LEAVE_SUCCESS", --退会成功
    EVENT_GUILD_SET_MESSAGE_SUCCESS = "EVENT_GUILD_SET_MESSAGE_SUCCESS", --修改军团公告\宣言成功
    EVENT_GUILD_GET_MEMBER_LIST = "EVENT_GUILD_GET_MEMBER_LIST", --获取军团成员列表
    EVENT_GUILD_IMPEACHMENT_LEADER_SUCCESS = "EVENT_GUILD_IMPEACHMENT_LEADER_SUCCESS", --弹劾会长成功
    EVENT_GUILD_TRANSFER_LEADER_SUCCESS = "EVENT_GUILD_TRANSFER_LEADER_SUCCESS", --转让会长成功
    EVENT_GUILD_PROMOTE_SUCCESS = "EVENT_GUILD_PROMOTE_SUCCESS", --军团升降职成功
    EVENT_GUILD_GET_SYSTEM_NOTIFY = "EVENT_GUILD_GET_SYSTEM_NOTIFY", --获取军团日志
    EVENT_GUILD_GET_HELP_LIST_SUCCESS = "EVENT_GUILD_GET_HELP_LIST_SUCCESS", --获取军团援助信息列表
    EVENT_GUILD_APP_HELP_SUCCESS = "EVENT_GUILD_APP_HELP_SUCCESS", --申请军团援助成功
    EVENT_GUILD_RECEIVE_HELP_SUCCESS = "EVENT_GUILD_RECEIVE_HELP_SUCCESS", --领取军团援助成功
    EVENT_GUILD_SUR_HELP_SUCCESS = "EVENT_GUILD_SUR_HELP_SUCCESS", --支援军团援助
    EVENT_GUILD_RECEIVE_HELP_REWARD_SUCCESS = "EVENT_GUILD_RECEIVE_HELP_REWARD_SUCCESS", --领取援助军团奖励
    EVENT_GUILD_GET_USER_GUILD = "EVENT_GUILD_GET_USER_GUILD", --获取自己军团数据

    EVENT_GUILD_USER_POSITION_CHANGE = "EVENT_GUILD_USER_POSITION_CHANGE", --玩家职位变更
    EVENT_GUILD_KICK_NOTICE = "EVENT_GUILD_KICK_NOTICE", --踢人事件

    EVENT_GUILD_RED_PACKET_GET_LIST = "EVENT_GUILD_RED_PACKET_GET_LIST", --红包列表
    EVENT_GUILD_RED_PACKET_OPEN_NOTICE = "EVENT_GUILD_RED_PACKET_OPEN_NOTICE", --开红包通知
    EVENT_GUILD_RED_PACKET_SEND = "EVENT_GUILD_RED_PACKET_SEND", --发红包通知
    EVENT_GUILD_RED_PACKET_DELETE = "EVENT_GUILD_RED_PACKET_DELETE", --删除红包通知

    EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE = "EVENT_GUILD_CAN_SNATCH_RED_PACKET_NUM_CHANGE", --可领取红包数量变更
    EVENT_GUILD_SNATCH_RED_PACKET_SHOW_HIDE = "EVENT_GUILD_SNATCH_RED_PACKET_SHOW_HIDE",--抢红包显示和隐藏
    EVENT_GUILD_BOX_REWARD = "EVENT_GUILD_BOX_REWARD",--宝箱奖励

    EVENT_GUILD_CONTRIBUTION = "EVENT_GUILD_CONTRIBUTION",--军团捐献
    EVENT_GUILD_CONTRIBUTION_BOX_REWARD = "EVENT_GUILD_CONTRIBUTION_BOX_REWARD",--军团捐献宝箱
    EVENT_GUILD_BASE_INFO_UPDATE = "EVENT_GUILD_BASE_INFO_UPDATE",--军团基本信息更新

    EVENT_GUILD_NAME_CHANGE = "EVENT_GUILD_NAME_CHANGE",--军团改名
    EVENT_GUILD_FLAG_CHANGE = "EVENT_GUILD_FLAG_CHANGE",--军团更换旗帜

    EVENT_GUILD_DUNGEON_MONSTER_GET = "EVENT_GUILD_DUNGEON_MONSTER_GET",--军团副本怪物信息
    EVENT_GUILD_DUNGEON_RECORD_SYN = "EVENT_GUILD_DUNGEON_RECORD_SYN",--军团副本记录同步
    EVENT_GUILD_DUNGEON_CHALLENGE = "EVENT_GUILD_DUNGEON_CHALLENGE",--军团副本挑战

    EVENT_GUILD_TRAIN_AUTO_END = "EVENT_GUILD_TRAIN_AUTO_END",-- 演武自动结束
    EVENT_GUILD_TRAIN_FORCE_END = "EVENT_GUILD_TRAIN_FORCE_END", --强制演武结束
    EVENT_GUILD_TRAIN_UPDATE = "EVENT_GUILD_TRAIN_UPDATE",--演武更新
    EVENT_GET_TRAIN_NOTIFY = "EVENT_GET_TRAIN_NOTIFY", --演武邀请通知
    EVENT_TRAIN_DATA_CLEAR = "EVENT_TRAIN_DATA_CLEAR", -- 演武数据清除
    EVENT_TRAIN_INVITE_TIME_OUT = "EVENT_TRAIN_INVITE_TIME_OUT", -- 演武邀请时间到了 或者拒绝
    EVENT_TRAIN_INVITE_SUCCESS = "EVENT_TRAIN_INVITE_SUCCESS", --演武邀请发送成功
    EVENT_CLEAR_GUILD_INVITE_NOTICE = "EVENT_CLEAR_GUILD_INVITE_NOTICE", -- 演武邀请框清除

    EVENT_INSTRUMENT_ADD_SUCCESS = "EVENT_INSTRUMENT_ADD_SUCCESS", --穿戴神兵成功
    EVENT_INSTRUMENT_CLEAR_SUCCESS = "EVENT_INSTRUMENT_CLEAR_SUCCESS", --卸下神兵成功
    EVENT_INSTRUMENT_LEVELUP_SUCCESS = "EVENT_INSTRUMENT_LEVELUP_SUCCESS", --神兵进阶成功
    EVENT_INSTRUMENT_LIMIT_SUCCESS = "EVENT_INSTRUMENT_LIMIT_SUCCESS", --神兵突界成功
    EVENT_INSTRUMENT_RECYCLE_SUCCESS = "EVENT_INSTRUMENT_RECYCLE_SUCCESS", --神兵回收成功
    EVENT_INSTRUMENT_REBORN_SUCCESS = "EVENT_INSTRUMENT_REBORN_SUCCESS", --神兵重生成功
    EVENT_INSTRUMENT_LIMIT_LV_PUT_RES = "EVENT_INSTRUMENT_LIMIT_LV_PUT_RES", --神兵界限突破方置材料
    EVENT_INSTRUMENT_TRANSFORM_SUCCESS = "EVENT_INSTRUMENT_TRANSFORM_SUCCESS", --神兵置换成功

    EVENT_HORSE_ADD_SUCCESS = "EVENT_HORSE_ADD_SUCCESS", --穿戴战马成功
    EVENT_HORSE_CLEAR_SUCCESS = "EVENT_HORSE_CLEAR_SUCCESS", --卸下战马成功
    EVENT_HORSE_STARUP_SUCCESS = "EVENT_HORSE_STARUP_SUCCESS", --战马升星成功
    EVENT_HORSE_RECYCLE_SUCCESS = "EVENT_HORSE_RECYCLE_SUCCESS", --战马回收成功
    EVENT_HORSE_REBORN_SUCCESS = "EVENT_HORSE_REBORN_SUCCESS", --战马重生成功
    EVENT_HORSE_JUDGE_SUCCESS = "EVENT_HORSE_JUDGE_SUCCESS", --相马成功

    --商城
    EVENT_GET_GOODS_FOR_MAGIC_SHOP = "EVENT_GET_GOODS_FOR_MAGIC_SHOP",
    EVENT_GET_RANDOM_SHOPS = "EVENT_GET_RANDOM_SHOPS",
    EVENT_BUY_ITEM = "EVENT_BUY_ITEM",
    EVENT_TO_BUY_ITEM = "EVENT_TO_BUY_ITEM",
    EVENT_TO_REFRESH = "EVENT_TO_REFRESH",
    EVENT_SET_COST_DATA = "EVENT_SET_COST_DATA",
    EVENT_SHOP_INFO_NTF = "event_shop_info_ntf",  --//获得商店信息的回应(或者主动通知客户端商店信息变更协议 触发了一个神秘商店也用此通知)
    EVENT_BUY_SHOP_RESULT = "event_buy_shop_result",    -- 购买消息事件
    EVENT_SWITCH_TAB_GIFT = "event_switch_tab_gift", --跳转到礼包面板

    --bag
    EVNET_USE_ITEM_SUCCESS = "bag_use_item",
    EVNET_CREATE_TABLE_FAIL = "event_create_table_fail",


    EVENT_EQUIPMENT_COMPOSE_OK="event_equipment_compose_ok", --装备碎片合成成功

    --顶部栏事件
    EVENT_TOPBAR_PAUSE = "event_topbar_pause",       --顶部栏暂停
    EVENT_TOPBAR_START = "event_topbar_start",       --顶部栏开始

    --主线 2017.7
    --begin
    EVENT_ACTIVITY_DAILY_BOSS = "event_chapter_daily_boss",      --精英副本日常boss
    EVENT_CHAPTER_STAR_RANK = "event_chapter_star_rank",         --副本星数排行
    EVENT_CHAPTER_BOX = "event_chapter_box",                    --章节宝箱
    EVENT_CHAPTER_ENTER_STAGE = "event_chapter_enter_stage",    --进入章节
    EVENT_CHAPTER_STAGE_BOX = "event_stage_box",                --关卡宝箱
    EVENT_REBEL_ARMY = "event_rebel_army",                      --叛军消息
    EVENT_EXECUTE_STAGE = "event_execute_stage",                --打关卡
    EVENT_FAST_EXECUTE_STAGE = "event_fast_execute_stage",       --扫荡关卡
    EVENT_SWEEP_FINISH = "event_sweep_finish",          --扫荡完成
    EVENT_RESET_STAGE = "event_reset_stage",            --重制副本
    EVENT_STAR_EFFECT_END = "event_star_effect_end",    --星星动画播放完成
    EVENT_DAILY_BOSS_FIGNT = "event_daily_boss_fight",  --攻打每日boss
    EVENT_GET_ALL_BOX = "event_get_all_box",        --领取所有宝箱
    EVENT_GET_PERIOD_BOX_AWARD_SUCCESS = "event_get_period_box_award_success", -- 章节宝箱
    EVENT_CHALLENGE_HERO_GENERAL = "event_challenge_hero_general",       --名将副本的帐篷
    EVENT_TRIGGER_REBEL_ARMY = "event_trigger_rebel_army", --南蛮入侵事件触发
    EVENT_CHAPTER_INFO_GET = "event_chapter_info_get",
    EVENT_CHAPTER_BOSS_INVADE_NOTICE = "event_chapter_boss_invade_notice",
    -- end

    --爬塔 2017.7
    --begin
    EVENT_TOWER_RANK = "event_tower_rank",      --爬塔排行
    EVENT_TOWER_GET_BOX = "event_tower_get_box", --爬塔宝箱
    EVENT_TOWER_EXECUTE_SURPRISE = "event_tower_execute_surprise",      --处理爬塔奇遇
    EVENT_TOWER_SWEEP = "event_tower_sweep",            --爬塔扫荡
    EVENT_TOWER_EXECUTE = "event_tower_execute",            --打爬塔
    EVENT_TOWER_GET_INFO = "event_tower_get_info",            --爬塔信息
    EVENT_TOWER_EXECUTE_SUPER = "event_tower_execute_super",      --打爬塔精英本
    --end
    --游历 2017.7
    --begin
    EVENT_EXPLORE_ENTER = "event_explore_enter",        --进入游历大富翁地图
    EVENT_EXPLORE_ROLL = "event_explore_roll",          --掷骰子
    EVENT_EXPLORE_DO_EVENT = "event_explore_do_event",      --游历事件
    EVENT_EXPLORE_GET_REWARD = "event_explore_get_reward",  --领取通关宝箱
    EVENT_EXPLORE_EVENT_EXPIRED = "event_explore_event_expired", -- 游历奇遇4点刷新 数据过期
    --end

    --叛军 2017.7
    --begin
    EVENT_SIEGE_RANK = "event_siege_rank",          --叛军排行
    EVENT_SIEGE_SHARE = "event_siege_share",        --叛军分享
    EVENT_SIEGE_BOX_REWARD = "event_siege_box_reward",   --叛军宝箱奖励
    EVENT_SIEGE_BATTLE = "event_siege_battle",      --叛军战斗
    EVENT_SIEGE_HURT_REWARD = "event_siege_hurt_reward",        --叛军伤害奖励
    EVENT_SIEGE_GUILD_RANK = "event_siege_guild_rank",          --叛军工会排行
    --end

    -- 主线副本主动滚动到某个关卡
    EVENT_CHAPTER_SCROLL_TO_STAGE = "event_chapter_scroll_to_stage",

    --招募
    --begin
    EVENT_RECRUIT_INFO = "event_recruit_info",          --招募数据
    EVENT_RECRUIT_NORMAL = "event_recruit_normal",          --普通招募
    EVENT_RECRUIT_GOLD = "event_recruit_gold",              --元宝招募
    EVENT_RECRUIT_GOLD_TEN = "event_recruit_gold_ten",      --元宝十次招募
    EVENT_RECRUIT_POINT_GET = "event_recruit_point_get",        --领取礼包
    --end

    --矿战
    --begin
    EVENT_ENTER_MINE = "event_enter_mine",      --进入矿区
    EVENT_SETTLE_MINE = "event_settle_mine",    --矿区移动
    EVENT_BATTLE_MINE = "event_battle_mine",    --攻打矿区
    EVENT_GET_MINE_MONEY = "event_get_mine_money",      --收获银币
    EVENT_GET_MINE_WORLD = "event_get_mine_world",      --获得世界信息
    EVENT_CHANGE_MINE_BORN = "event_change_mine_born",  --更换出生点
    EVENT_GET_MINE_ATTACK_REPORT = "event_get_mine_attack_report", --进攻战报
    EVENT_GET_MINE_DEF_REPORT = "event_get_mine_def_report", --防守战报
    EVENT_GET_MINE_SYS_NOTICE = "event_get_mine_sys_notice",    --得到系统信息
    EVENT_GET_MINE_RESPOND = "event_get_mine_respond",      --需要刷新矿区
    EVENT_FAST_BATTLE = "event_fast_battle",            --扫荡
    EVENT_MINE_BUY_ARMY = "event_mine_buy_money",       --购买兵力
    EVENT_MINE_GUILD_BOARD = "event_mine_guild_board",--占领矿区广播
    EVENT_MINE_NOTICE = "event_mine_notice",        --矿区弹幕，移动消息
    EVENT_SEND_MINE_INFO = "event_send_mine_info",  --矿区提示信息，
    --end

    --阵营竞技
    --begin
    EVENT_GET_CAMP_RACE_RANK = "event_get_camp_race_rank",      --阵营排行榜
    EVENT_GET_CAMP_RACE_FORMATION = "event_get_camp_race_formation",        --阵营竞技阵容
    EVENT_UPDATE_CAMP_RACE_FORMATION = "event_update_camp_race_formation",        --更新阵营竞技阵容
    EVENT_GET_LAST_RANK = "event_get_last_rank",        --获得排行榜
    EVENT_ADD_RACE_BATTLE_REPORT = "event_add_race_battle_report",  --获得战报广播
    EVENT_GET_CAMP_REPORT = "event_get_camp_report",        --获取战报
    EVENT_GET_CAMP_BASE_INFO = "event_get_camp_base_info",      --获取基本信息
    EVENT_CAMP_UPDATE_STATE = "event_camp_update_state",      --更新8强赛状态
    EVENT_CAMP_SIGN_UP = "event_camp_sign_up",      --阵营报名
    EVENT_CAMP_FORCE_REFRESH_STATE = "event_camp_force_refresh_state",          --阵营竞技强制刷新页面
    EVENT_CAMP_CLOSE_POP = "event_camp_close_pop",          --关闭外面对话框
    EVENT_CAMP_UPDATE_BET = "event_camp_update_bet",              --押注
    EVENT_CAMP_POPUP_CLOSE = "event_camp_popup_close",  --关闭探矿
    EVENT_CAMP_BET_SUCCESS = "event_camp_bet_success",  --押注成功
    EVENT_CAMP_GET_CHAMPION = "event_camp_get_champion",    --获得冠军信息
    EVENT_CAMP_BATTLE_RESULT = "event_camp_battle_result",
    EVENT_CAMP_RACE_UPDATE_TITLE = "event_camp_race_update_title", --更新标题

    --跨服个人竞技
    EVENT_SINGLE_RACE_GET_PK_INFO_SUCCESS = "EVENT_SINGLE_RACE_GET_PK_INFO_SUCCESS", --获取数据成功
    EVENT_SINGLE_RACE_UPDATE_PK_INFO_SUCCESS = "EVENT_SINGLE_RACE_UPDATE_PK_INFO_SUCCESS", --更新数据成功
    EVENT_SINGLE_RACE_CHANGE_EMBATTLE_SUCCESS = "EVENT_SINGLE_RACE_CHANGE_EMBATTLE_SUCCESS", --布阵成功
    EVENT_SINGLE_RACE_EMBATTlE_UPDATE = "EVENT_SINGLE_RACE_EMBATTlE_UPDATE", --更新布阵
    EVENT_SINGLE_RACE_SUPPORT_SUCCESS = "EVENT_SINGLE_RACE_SUPPORT_SUCCESS", --支持成功
    EVENT_SINGLE_RACE_GET_REPORT = "EVENT_SINGLE_RACE_GET_REPORT",        --获取战报
    EVENT_SINGLE_RACE_GET_POSITION_INFO = "EVENT_SINGLE_RACE_GET_POSITION_INFO",        --获取某个位置玩家信息
    EVENT_SINGLE_RACE_SWITCH_LAYER = "EVENT_SINGLE_RACE_SWITCH_LAYER", --切换界面
    EVENT_SINGLE_RACE_STATUS_CHANGE = "EVENT_SINGLE_RACE_STATUS_CHANGE", --状态改变
    EVENT_SINGLE_RACE_GUESS_SUCCESS = "EVENT_SINGLE_RACE_GUESS_SUCCESS", --竞猜成功
    EVENT_SINGLE_RACE_GUESS_UPDATE = "EVENT_SINGLE_RACE_GUESS_UPDATE", --更新竞猜情况

    --真武战神
    EVENT_UNIVERSE_RACE_GET_PK_INFO_SUCCESS = "EVENT_UNIVERSE_RACE_GET_PK_INFO_SUCCESS", --获取数据成功
    EVENT_UNIVERSE_RACE_UPDATE_PK_INFO_SUCCESS = "EVENT_UNIVERSE_RACE_UPDATE_PK_INFO_SUCCESS", --更新数据成功
    EVENT_UNIVERSE_RACE_SYNC_ACTINFO = "EVENT_UNIVERSE_RACE_SYNC_ACTINFO", --同步活动信息
    EVENT_UNIVERSE_RACE_CHANGE_EMBATTLE_SUCCESS = "EVENT_UNIVERSE_RACE_CHANGE_EMBATTLE_SUCCESS", --布阵成功
    EVENT_UNIVERSE_RACE_EMBATTlE_UPDATE = "EVENT_UNIVERSE_RACE_EMBATTlE_UPDATE", --更新布阵
    EVENT_UNIVERSE_RACE_GET_REPORT = "EVENT_UNIVERSE_RACE_GET_REPORT",        --获取战报
    EVENT_UNIVERSE_RACE_SWITCH_LAYER = "EVENT_UNIVERSE_RACE_SWITCH_LAYER", --切换界面
    EVENT_UNIVERSE_RACE_MATCH_FINISH = "EVENT_UNIVERSE_RACE_MATCH_FINISH", --某一盘比赛结束
    EVENT_UNIVERSE_RACE_USER_POSITION_CHANGE = "EVENT_UNIVERSE_RACE_USER_POSITION_CHANGE", --玩家位置改变 
    EVENT_UNIVERSE_RACE_GET_POSITION_INFO = "EVENT_UNIVERSE_RACE_GET_POSITION_INFO",        --获取某个位置玩家信息
    EVENT_UNIVERSE_RACE_SUPPORT_SUCCESS = "EVENT_UNIVERSE_RACE_SUPPORT_SUCCESS", --支持成功
    EVENT_UNIVERSE_RACE_SYNC_GUESS = "EVENT_UNIVERSE_RACE_SYNC_GUESS", --同步支持排行
    EVENT_UNIVERSE_RACE_GET_WINNER = "EVENT_UNIVERSE_RACE_GET_WINNER", --获取历代冠军
    EVENT_UNIVERSE_RACE_GET_WINNER_DETAIL = "EVENT_UNIVERSE_RACE_GET_WINNER_DETAIL", --获取历代冠军信息
	EVENT_UNIVERSE_RACE_SYNC_GUESS_POT = "EVENT_UNIVERSE_RACE_SYNC_GUESS_POT", --同步奖池
	EVENT_UNIVERSE_RACE_SCORE_CHANGE = "EVENT_UNIVERSE_RACE_SCORE_CHANGE", --比分发生变化
    EVENT_UNIVERSE_RACE_POPUP_STATE = "EVENT_UNIVERSE_RACE_POPUP_STATE", --保存弹框的状态
    EVENT_UNIVERSE_RACE_PREVIEW = "EVENT_UNIVERSE_RACE_PREVIEW", --预览信息
    EVENT_UNIVERSE_RACE_UPDATE_USER_INFO = "EVENT_UNIVERSE_RACE_UPDATE_USER_INFO", --玩家信息更新

    --蛋糕活动
    EVENT_CAKE_ACTIVITY_GET_TASK_REWARD = "EVENT_CAKE_ACTIVITY_GET_TASK_REWARD",
    EVENT_CAKE_ACTIVITY_ENTER_SUCCESS = "EVENT_CAKE_ACTIVITY_ENTER_SUCCESS",
    EVENT_CAKE_ACTIVITY_UPDATE_TASK_INFO = "EVENT_CAKE_ACTIVITY_UPDATE_TASK_INFO",
    EVENT_CAKE_ACTIVITY_ADD_CAKE_EXP = "EVENT_CAKE_ACTIVITY_ADD_CAKE_EXP",
    EVENT_CAKE_ACTIVITY_UPDATE_CAKE_INFO = "EVENT_CAKE_ACTIVITY_UPDATE_CAKE_INFO",
    EVENT_CAKE_ACTIVITY_UPDATE_RANK_CAKE_AND_NOTICE = "EVENT_CAKE_ACTIVITY_UPDATE_RANK_CAKE_AND_NOTICE",
    EVENT_CAKE_ACTIVITY_UPDATE_ACTIVITY_STATUS = "EVENT_CAKE_ACTIVITY_UPDATE_ACTIVITY_STATUS",
    EVENT_CAKE_ACTIVITY_GET_LEVEL_UP_REWARD = "EVENT_CAKE_ACTIVITY_GET_LEVEL_UP_REWARD",
    EVENT_CAKE_ACTIVITY_UPDATE_LEVEL_UP_REWARD = "EVENT_CAKE_ACTIVITY_UPDATE_LEVEL_UP_REWARD",
    EVENT_CAKE_ACTIVITY_GET_RECHARGE_REWARD = "EVENT_CAKE_ACTIVITY_GET_RECHARGE_REWARD",
    EVENT_CAKE_ACTIVITY_GET_DAILY_REWARD = "EVENT_CAKE_ACTIVITY_GET_DAILY_REWARD",
	EVENT_CAKE_ACTIVITY_RECHARGE_REWARD = "EVENT_CAKE_ACTIVITY_RECHARGE_REWARD",

    --结算相关
    EVENT_EXIT_FIGHT = "event_exit_fight",      --结算完结
    --



    EVENT_RECRUITING_GOT_INFO = "event_recruiting_got_info",
    EVENT_RECRUITING_NORMAL_ONCE = "event_recruiting_normal_once",
    EVENT_RECRUITING_NORMAL_TEN = "event_recruiting_normal_ten",
    EVENT_RECRUITING_JP_ONCE = "event_recruiting_jp_once",
    EVENT_RECRUITING_JP_TEN = "event_recruiting_jp_ten",
    EVENT_RECRUITING_JP_TWENTY = "event_recruiting_jp_twenty",
    EVENT_RECRUITING_ZY = "event_recruiting_zy", -- 阵营招募
    EVENT_RECRUITING_NORMAL_TURN_2_SECONED = "event_recruiting_normal_turn_2_seconed",
    EVENT_RECRUITING_JP_TURN_2_SECONED = "event_recruiting_jp_turn_2_seconed",
    EVENT_RECRUITING_ZY_TURN_2_SECONED = "event_recruiting_zy_turn_2_seconed",
    EVENT_RECRUITING_SHOW_KNIGHT = "event_recruiting_show_knight", ---玩家点击后展示武将

    EVENT_RECRUITING_GET_HANDBOOK = "event_recruiting_got_handbook",

    EVENT_HEAD_FRAME_INFO = "EVENT_HEAD_FRAME_INFO",
    EVENT_UPDATE_HEAD_FRAME = "EVENT_UPDATE_HEAD_FRAME",


    --------------------数据更新推送
    EVENT_KNIGHT_OP_UPDATE = "event_knight_op_update",
    EVENT_ITEM_OP_UPDATE = "event_item_op_update",
    EVENT_ITEM_OP_INSERT = "event_item_op_insert",
    EVENT_ITEM_OP_DELETE = "event_item_op_delete",
    EVENT_GEM_OP_UPDATE = "event_gem_op_update",
    EVENT_RES_OP_UPDATE = "event_res_op_update",--资源更新协议
    EVENT_RECOVER_OP_UPDATE = "event_recover_op_update", --回复更新协议
    EVENT_FRAGMENT_OP_UPDATE = "event_fragment_op_update",
    EVENT_MATERIAL_OP_UPDATE = "event_material_op_update",
    EVENT_EQUIP_OP_UPDATE = "event_equip_op_update",


    EVENT_SUBTITLES_SHOW_HIDE = "EVENT_SUBTITLES_SHOW_HIDE",
    EVENT_SUBTITLES_RUN_END = "EVENT_SUBTITLES_RUN_END",

    --VIP
    EVENT_VIP_STATE_CHANGE  = "event_vip_state_change", ---VIP状态改变
    EVENT_VIP_CLOSE_PALEN  = "event_vip_close_palen", ---关闭VIP面板
    EVENT_VIP_SWITCH_2_RECHARGE_PANEL  = "event_vip_switch_2_recharge_panel", ---切换到充值面板
    EVENT_VIP_GET_VIP_GIFT_ITEMS = "event_vip_get_vip_gift_items", ---获取VIP礼包的奖励。
    EVENT_TOWER_RANK_POP = "event_tower_rank_pop", ---获取VIP礼包的奖励。

    --主城按钮动态出现事件
    EVENT_MAIN_CITY_CHECK_BTNS = "event_main_city_check_btns",

    ---充值
    EVENT_RECHARGE_NOTICE = "event_recharge_notice",--充值通知
    EVENT_RECHARGE_GET_INFO = "event_recharge_get_info",--获取充值信息
    EVENT_RECHARGE_FIRST_BUY_RESET = "event_recharge_first_buy_reset",--充值首充时间重置

    EVENT_USER_BIBLE_PLAYER_COLOR_UPGRADE = "event_user_bible_player_color_upgrade", ---玩家品质提升

	--日常任务
    EVENT_DAILY_TASK_INFO = "event_daily_task_get_info",
    EVENT_DAILY_TASK_AWARD = "event_daily_task_get_award",
    EVENT_DAILY_TASK_UPDATE = "event_daily_task_update",

    EVENT_GET_ACHIEVEMENT_INFO = "event_achievement_get_info",
    EVENT_GET_ACHIEVEMENT_AWARD = "event_achievement_get_award",
    EVENT_GET_ACHIEVEMENT_UPDATE = "event_achievement_update",

    --通用战报列表获取
    EVENT_GET_COMMON_REPORT_LIST="EVENT_GET_COMMON_REPORT_LIST",

    ---得到战报数据
    EVENT_GET_BATTLE_REAPORT = "event_get_battle_report",

    ---得到玩家阵容信息
    EVENT_GET_USER_BASE_INFO = "event_get_user_base_info",
    EVENT_GET_USER_BASE_INFO_FOR_PRIVATE_CHAT = "EVENT_GET_USER_BASE_INFO_FOR_PRIVATE_CHAT",
    EVENT_GET_USER_DETAIL_INFO = "event_get_user_detail_info",--查看阵容
    EVENT_OP_BLACK_LIST = "event_op_black_list",--拉黑玩家
    EVENT_PRACTICE_PLAYER = "event_practice_player",--与玩家切磋

    --竞技场
    EVENT_GET_ARENA_BATTLE_REPORT = "EVENT_GET_ARENA_BATTLE_REPORT",
    EVENT_ARENA_CHALLENGE_RESULT  = "EVENT_ARENA_CHALLENGE_RESULT",
    EVENT_ARENA_GET_ARENA_TOP_TEN_INFO = "EVENT_ARENA_GET_ARENA_TOP_TEN_INFO",
    EVENT_ARENA_GET_ARENA_INFO  = "EVENT_ARENA_GET_ARENA_INFO",
    EVENT_ARENA_GET_ARENA_RANK_INFO  = "EVENT_ARENA_GET_ARENA_RANK_INFO",
    EVENT_ARENA_RANK_POP  = "event_arena_rank_pop",
    EVENT_ARENA_FIGHT_COUNT  = "EVENT_ARENA_FIGHT_COUNT",
    EVENT_ARENA_BUY_COUNT  = "EVENT_ARENA_BUY_COUNT",
    EVENT_ARENA_GET_REWARD  = "EVENT_ARENA_GET_REWARD",--竞技场奖励
    EVENT_ARENA_WIN_POPUP_AWARD = "EVENT_ARENA_WIN_POPUP_AWARD",--竞技场胜利奖励界面

    --跨服军团boss
    EVENT_CROSS_WORLDBOSS_GET_INFO = "event_cross_worldboss_get_info",
    EVENT_CROSS_WORLDBOSS_ENTER = "event_cross_worldboss_enter",
    EVENT_CROSS_WORLDBOSS_ATTACK_BOSS = "event_cross_worldboss_attack_boss",
    EVENT_CROSS_WORLDBOSS_GET_GRAB_LIST = "event_cross_worldboss_get_grab_list",  --获取抢夺积分列表
    EVENT_CROSS_WORLDBOSS_GET_GRAB_POINT = "event_cross_worldboss_get_grab_point",  --获取抢夺积分
    EVENT_CROSS_WORLDBOSS_UPDATE_RANK    = "event_cross_worldboss_update_rank",     --跨服军团世界boss排行更新
    EVENT_CROSS_WORLDBOSS_GET_GRAB_POINT = "event_cross_worldboss_get_grab_point",  --获取抢夺积分
    EVENT_CROSS_WORLDBOSS_GET_GRAB_LIST = "event_cross_worldboss_get_grab_list",  --获取抢夺积分列表
    EVENT_CROSS_WORLDBOSS_STATE_CHANGE = "event_cross_worldboss_state_change",  --boss状态变化
    EVENT_CROSS_WORLDBOSS_UPDATE_BOSS = "event_cross_worldboss_update_boss",  --boss变化

    --全服BOSS
    EVENT_WORLDBOSS_GET_INFO = "event_worldboss_get_info",
    EVENT_WORLDBOSS_GET_GUILD_RANK_LIST = "event_worldboss_get_guild_rank_list",
    EVENT_WORLDBOSS_GET_USER_RANK_LIST = "event_worldboss_get_user_rank_list",
    EVENT_WORLDBOSS_UPDATE_BOSS_STATUS = "event_worldboss_update_boss_status",
    EVENT_WORLDBOSS_UPDATE_BOSS_MAGIC = "event_worldboss_update_boss_magic",
    EVENT_WORLDBOSS_RED_POINT = "event_worldboss_red_point",
    EVENT_WORLDBOSS_ACTIVATE_BOSS = "event_worldboss_activate_boss",
    EVENT_WORLDBOSS_ATTACK_BOSS = "event_worldboss_attack_boss",
    EVENT_WORLDBOSS_ATTACK_BOSS_FAIL = "event_worldboss_attack_boss_fail",
    EVENT_WORLDBOSS_FIND_BOSS = "event_worldboss_find_boss",        --触发全服BOSS
    EVENT_WORLDBOSS_IGNORE_BOSS = "event_worldboss_ignore_boss",    --暂时忽略
	EVENT_WORLDBOSS_GET_GRAB_LIST = "event_worldboss_get_grab_list",  --获取抢夺积分列表
    EVENT_WORLDBOSS_GET_GRAB_POINT = "event_worldboss_get_grab_point",  --获取抢夺积分
    EVENT_WORLDBOSS_NOTICE         = "event_worldboss_notice",
    EVENT_WORLDBOSS_UPDATE_RANK    = "event_worldboss_update_rank", --世界boss排行更新


    --邮件
    EVENT_MAIL_ON_GET_IDS = "event_get_mail_ids",
    EVENT_MAIL_ON_GET_MAILS = "event_get_mail_list",
    EVENT_MAIL_ON_GET_NEW_MAILS = "event_get_new_mails",
    EVENT_MAIL_ON_PROCESS_MAIL = "event_process_mail",
    EVENT_MAIL_ON_PROCESS_ALL_MAIL = "event_process_all_mail",
    --EVENT_MAIL_ON_GET_AWARDS = "event_get_mail_awards",
    EVENT_MAIL_ON_REMOVE_MAIL = "event_remove_mail",
    EVENT_MAIL_ON_SEND_MAIL = "event_send_mail",


    --活动首充奖励
    EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE = "activity_recharge_award_update",
    EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO = "activity_recharge_award_get_info",

    --福利相关
    EVENT_WELFARE_SIGNIN_GET_INFO = "event_welfare_signin_get_info",--获取签到信息
    EVENT_WELFARE_SIGNIN_DO_SIGNIN = "event_welfare_signin_do_signin",--玩家签到

    EVENT_WELFARE_DINNER_GET_INFO = "event_welfare_dinner_get_info",--获取宴会信息
    EVENT_WELFARE_DINNER_EAT = "event_welfare_dinner_eat",--宴会领体力
    EVENT_WELFARE_DINNER_REEAT = "event_welfare_dinner_reeat",--宴会补领体力

    EVENT_WELFARE_MONTH_CARD_GET_REWARD = "event_welfare_month_card_get_reward",--领取月卡奖励
    EVENT_WELFARE_MONTH_CARD_NOT_AVAILABLE = "EVENT_WELFARE_MONTH_CARD_NOT_AVAILABLE",--矿战特权过期/不能用刷新

    EVENT_WELFARE_FUND_OPEN_SERVER_GET_INFO = "event_welfare_fund_open_server_get_info", --开服基金信息
    EVENT_WELFARE_FUND_OPEN_SERVER_GET_REWARD = "event_welfare_fund_open_server_get_reward", --领取开服基金

    EVENT_WELFARE_GIFT_PKG_GET_INFO = "event_welfare_gift_pkg_get_info", --获取礼包信息
    EVENT_WELFARE_GIFT_PKG_GET_REWARD = "event_welfare_gift_pkg_get_reward", --领取礼包奖励

    EVENT_WELFARE_MONEY_TREE_GET_INFO = "event_welfare_money_tree_get_info", --获取摇钱树信息
    EVENT_WELFARE_MONEY_TREE_SHAKE = "event_welfare_money_tree_shake", --摇钱树摇一摇
    EVENT_WELFARE_MONEY_TREE_OPEN_BOX = "event_welfare_money_tree_open_box", --开摇钱树宝箱

	EVENT_WELFARE_LEVEL_GIFT_INFO = "event_welfare_level_gift_info", --等级礼包
	EVENT_WELFARE_LEVEL_GIFT_AWARD = "event_welfare_level_gift_award", --等级礼包奖励
    --分享与手机绑定
    EVENT_SHARE_SUCCESS = "event_share_success",--分享成功  包括手机绑定
    EVENT_SHARE_RESULT_NOTICE = "event_share_result_notice",--分享结果通知
    --实名认证成功
    EVENT_REAL_ID_SUCCESS = "event_real_id_success",

    --可配置活动
    EVENT_CUSTOM_ACTIVITY_INFO = "event_custom_activity_info",--获取配置活动信息
    EVENT_CUSTOM_ACTIVITY_UPDATE = "event_custom_activity_update",
    EVENT_CUSTOM_ACTIVITY_UPDATE_QUEST = "event_custom_activity_update_quest",
    EVENT_CUSTOM_ACTIVITY_GET_AWARD = "event_custom_activity_getaward",
    EVENT_CUSTOM_ACTIVITY_EXPIRED = "event_custom_activity_expired",
    EVENT_CUSTOM_ACTIVITY_OPEN_NOTICE = "event_custom_activity_open_notice",--配置活动开启关闭通知
    EVENT_CUSTOM_ACTIVITY_RECHARGE_INFO = "event_custom_activity_recharge_info",
    EVENT_CUSTOM_ACTIVITY_RECHARGE_PLAY_SUCCESS = "event_custom_recharge_play_success",
    EVENT_CUSTOM_ACTIVITY_RECHARGE_LIMIT_CHANGE = "event_custom_recharge_limit_change", --活动充值次数变更
    EVENT_CUSTOM_ACTIVITY_BUY_VIP_RECOMMEND_GIFT_SUCCESS = "EVENT_CUSTOM_ACTIVITY_BUY_VIP_RECOMMEND_GIFT_SUCCESS", --购买vip推送礼包成功
    EVENT_CUSTOM_ACTIVITY_GET_VIP_RECOMMEND_GIFT_SUCCESS = "EVENT_CUSTOM_ACTIVITY_GET_VIP_RECOMMEND_GIFT_SUCCESS", --获取vip推送礼包成功

    --7日活动
    EVENT_DAY7_ACT_GET_INFO = "event_day7_act_get_info", --获取7日活动信息
    EVENT_DAY7_ACT_UPDATE_PROGRESS = "event_day7_act_update_progress", --更新7日活动任务进度
    EVENT_DAY7_ACT_GET_TASK_REWARD = "event_day7_act_get_task_reward", --领取任务奖励
    EVENT_DAY7_ACT_GET_BUY_DISCOUNT_SHOP = "event_day7_act_get_buy_discount_shop", --购买折扣商品

    --百团大战活动
    EVENT_ACTIVITY_GUILD_SPRINT_GET_RANK_LIST = "event_activity_guild_sprint_get_list", --百团大战排行榜信息
    EVENT_ACTIVITY_GUILD_SPRINT_INFO = "event_activity_guild_sprint_info", --百团大战信息

    --7日战力榜
    EVENT_SEVENDAYS_GET_RANK_LIST = "event_sevendays_get_rank_list",      --拉取战力排行榜

    --随机活动
    EVENT_RANDOM_ACTIVITY_GET_INFO = "event_random_activity_get_info",                --拉取活动信息
    EVENT_RANDOM_ACTIVITY_BUY_GOOD = "event_random_activity_buy_good",                --购买物品
    EVENT_RANDOM_ACTIVITY_REFRESH_GOODS = "event_random_activity_refresh_goods",      --刷新物品
    EVENT_RANDOM_ACTIVITY_BUY_COUNT = "event_random_activity_buy_count",              --购买次数
    EVENT_RANDOM_ACTIVITY_GET_AWARD = "event_random_activity_get_award",              --领取奖励
    EVENT_RANDOM_ACTIVITY_REFRESH_COUNT = "event_random_activity_refresh_count",      --刷新物品

    --天宫炼宝活动
    EVENT_LIANBAO_ACTIVITY_GET_INFO = "event_lianbao_activity_get_info",                --拉取活动信息
    EVENT_LIANBAO_ACTIVITY_BUY_GOOD = "event_lianbao_activity_buy_good",                --购买物品
    EVENT_LIANBAO_ACTIVITY_REFRESH_GOODS = "event_lianbao_activity_refresh_goods",      --刷新物品
    EVENT_LIANBAO_ACTIVITY_GET_RANK = "event_lianbao_activity_get_rank",                --请求排行榜

    --充值返利
    EVENT_RECHARGE_REBATE_GET_INFO = "event_recharge_rebate_get_info",                --拉取信息
    EVENT_RECHARGE_REBATE_GET_AWARD = "event_recharge_rebate_get_award",              --领取奖励

    --补偿活动
    EVENT_COMPENSATION_ACTIVITY_INFO = "event_compensation_activity_info",
    EVENT_COMPENSATION_ACTIVITY_GET_AWARD = "event_compensation_activity_get_award",

    --补偿（跨服）
    EVENT_BETA_COMPENSATION_ACTIVITY_INFO = "event_beta_compensation_activity_info",
    EVENT_BETA_COMPENSATION_ACTIVITY_GET_AWARD = "event_beta_compensation_activity_get_award",

    --开服登录活动
    EVENT_OPEN_LOGIN_ACTIVITY_INFO = "event_openlogin_activity_info",
    EVENT_OPEN_LOGIN_ACTIVITY_GET_AWARD = "event_openlogin_activity_get_award",

    --布阵
    EVENT_PUT_KNIGHT_OK = "EVENT_PUT_KNIGHT_OK",

    --法宝
    EVENT_INSTRUMENT_LEVEL_UP = "EVENT_INSTRUMENT_LEVEL_UP",

    --月卡
    EVENT_MONTHCARD_STATIC = "EVENT_MONTHCARD_STATIC",

     --点金手
    EVENT_GOLD_HAND_INIT = "event_gold_hand_init",
    EVENT_GOLD_HAND_UPDATE = "event_gold_hand_update",

    -- 日常副本

    -- 日常副本挑战
    EVENT_DAILY_DUNGEON_EXECUTE = "event_daily_dungeon_execute",
    EVENT_DAILY_DUNGEON_FIRSTENTER = "event_daily_dungeon_firstenter",
    EVENT_DAILY_DUNGEON_ENTER = "event_daily_dungeon_enter",


    -- 排行榜消息
    EVENT_DAILY_DUNGEON_RANK = "event_daily_dungeon_rank",

    EVENT_TALK_SEND_OK = "EVENT_TALK_SEND_OK",
    EVENT_TALK_GETCHAR = "EVENT_TALK_GETCHAR",
    EVENT_TALK_SELECT_FACE = "EVENT_TALK_SELECT_FACE",

    --聊天
    EVENT_CHAT_GET_MESSAGE = "event_chat_get_message", --收到新消息
    EVENT_CHAT_PRIVATE_CHAT_MEMBER_CHANGE = "event_chat_private_chat_member_change", --私聊成员数量变更
    EVENT_CHAT_UNREAD_MSG_NUM_CHANGE = "event_chat_unread_msg_num_change", --未读消息数量变更

    EVENT_CHAT_SEND_SUCCESS = "event_chat_send_success", --发送消息成功
    EVENT_CHAT_SELECTE_FACE = "event_chat_selecte_face", --已选中表情
    EVENT_CHAT_COPY_MSG = "event_chat_copy_msg", --复制聊天消息
    EVENT_CHAT_ENTER_CHANNEL = "event_chat_enter_channel", --进入聊天频道事件
    EVENT_CHAT_SHOW_PLAYER_DETAIL = "event_chat_show_player_detail", --显示玩家详情事件
    EVENT_CHAT_MSG_LIST_GET = "event_chat_msg_list_get", --得到消息队列
    EVENT_CHAT_UI_CLOSE_CHAT_MAIN_VIEW = "event_chat_ui_close_chat_main_view", --关闭聊天

    EVENT_CHAT_GETNULTIUSERSINFO = "event_chat_getmultiusersinfo", --获取私聊列表对象信息

    EVENT_INSTRUMENT_DROP_EXECUTE = "event_instrument_drop_execute",

    -- 通用事件，主要针对全局的游戏变化，比如场景切换之类的


    --副本对话
    EVENT_SOUND_END = "event_sound_end",      --故事对话结束
    EVENT_CHAT_SPINE_LOADED = "event_chat_spine_loaded",        --对话spine加载完成

    -- 切换场景
    EVENT_CHANGE_SCENE = "event_change_scene",
    EVENT_SCENE_TRANSITION = "EVENT_SCENE_TRANSITION",

    -- 新手引导事件
    EVENT_TUTORIAL_TOUCH_AUTH_BEGIN = "event_tutorial_touch_auth_begin",
    EVENT_TUTORIAL_TOUCH_AUTH_END = "event_tutorial_touch_auth_end",

    -- 下一步新手引导
    EVENT_TUTORIAL_STEP = "event_tutorial_step",
    -- 新手引导领奖用通知
    EVENT_TUTORIAL_AWARD = "event_tutorial_award",
    -- 引导开始通知
    EVENT_TUTORIAL_START = "event_tutorial_start",
    -- 战斗触发引导开始
    EVENT_TUTORIAL_BATTLE_START = "event_tutorial_battle_start",

    -- 商店相关红点机制
    EVENT_SHOP_RED_POINT_UPDATE = "EVENT_SHOP_RED_POINT_UPDATE",

    EVENT_RED_POINT_UPDATE = "EVENT_RED_POINT_UPDATE",
    EVENT_RED_POINT_CLICK = "EVENT_RED_POINT_CLICK",
	EVENT_RED_POINT_CLICK_MEMORY = "EVENT_RED_POINT_CLICK_MEMORY", --每次登陆都会重置的
    EVENT_MAIN_MENU_SUSPEND = "EVENT_MAIN_MENU_SUSPEND", ---主菜单挂起锁定事件

    -- 顶部条更新
    EVENT_TOP_BAR_UPDATE_RESUME = "event_top_bar_update_resume",

    EVENT_ROLLNOTICE_RECEIVE = "event_rollnotice_receive",
    EVENT_SYSTEM_MSG_RECEIVE = "event_system_msg_receive",

    ---
    EVENT_TEAMVIEWER_POP = "event_teamviewer_pop",

    -- 驻地系统
    EVENT_TERRITORY_UPDATEUI = "event_territory_updateui",
    EVENT_TERRITORY_ATTACKTERRITORY = "event_territory_attackterritory",
    EVENT_TERRITORY_PATROL = "event_territory_patrol",
    EVENT_TERRITORY_GETAWARD = "event_territory_getaward",
    EVENT_TERRITORY_GET_RIOT_AWARD = "event_territory_get_riot_award",
    EVENT_TERRITORY_FORHELP  = "event_territory_forHelp",
    EVENT_TERRITORY_GET_FORHELP = "event_territory_get_forHelp",--拉取军团求助信息列表
    EVENT_TERRITORY_HELP_REPRESS_RIOT = "event_territory_help_repress_riot",--军团求助镇压
    EVENT_TERRITORY_SYNC_SINGLE_INFO = "event_territory_sync_single_info",--同步单个城池信息
    EVENT_TERRITORY_CLICK_HERO  = "event_territory_click_hero",--选择武将报错
    EVENT_TERRITORY_ONEKEY = "event_territory_onekey",  -- 一键巡逻
    EVENT_TERRITORY_STATE_UPDATE = "event_territory_state_update",  -- 状态同步，用于更新上次巡逻的武将和类型

    --综合排行榜
    EVENT_COMPLEX_POWER_RANK = "event_complex_power_rank", -- 战力排行榜
    EVENT_COMPLEX_LEVEL_RANK = "event_complex_level_rank", -- 等级排行榜
    EVENT_COMPLEX_ARENA_RANK = "event_complex_arena_rank", -- 竞技场排行
    EVENT_COMPLEX_STAGE_STAR_RANK = "event_complex_stage_star_rank", -- 星级排行
    EVENT_COMPLEX_ELITE_STAR_RANK = "event_complex_elite_star_rank", -- 精英星级排行
    EVENT_COMPLEX_TOWER_STAR_RANK = "event_complex_tower_star_rank", -- 爬塔排行
    EVENT_COMPLEX_GUILD_RANK = "event_complex_guild_rank", -- 军团排行
    EVENT_COMPLEX_ACTIVE_PHOTO_RANK = "event_complex_avtive_photo_rank", -- 名将册排行
    EVENT_COMPLEX_USER_AVATAR_PHOTO_RANK = "event_complex_user_avatar_photo_rank", -- 变身卡图鉴排行

    --服务器记录
    EVENT_SERVER_RECORD_CHANGE = "event_server_record_change", -- 服务器记录数据变更

    --进入主场景
    EVENT_ENTER_MAIN_SCENE = "event_enter_main_scene", --进入主场景事件

    --活动
    EVENT_ACT_DINNER_RESIGNIN = "event_act_dinner_resignin", --宴会补签事件

    --礼品码
    EVENT_GIFT_CODE_REWARD = "event_gift_code_get",--礼品码奖励

    --问卷
    EVENT_QUESTIONNAIRE_INGO_CHANGE = "event_questionnaire_info_change",--问卷变更

    --弹窗关闭消息
    EVENTT_POPUP_CLOSE = "event_popup_close",


    --拍卖
    EVENT_GET_AUCTION_INFO = "event_get_auction_info",
    EVENT_GET_ALL_AUCTION_INFO = "event_get_all_auction_info",
    EVENT_AUCTION_ITEM     = "event_auction_item",
    EVENT_AUCTION_LOG      = "event_auction_log",
    EVENT_AUCTION_BUYER_REPLACE      = "event_auction_buyer_replace",
    EVENT_AUCTION_UPDATE_ITEM = "EVENT_AUCTION_UPDATE_ITEM",
    EVENT_GET_RES_PHOTO_SUCCESS = "event_get_res_photo_success",

    EVENT_LAYER_GUIDE =  "event_layer_guide",

    EVENT_ACTIVITY_NOTICE = "event_activity_notice", --活动开启通知
    --出售 材料 碎片
    EVENT_SELL_OBJECTS_SUCCESS="event_sell_objects_success", --出售
	--
	EVENT_SELL_ONLY_OBJECTS_SUCCESS="event_sell_only_objects_success", --出售唯一物品（锦囊）

    EVENT_COMMON_COUNT_CHANGE ="event_common_count_change", --次数变更

    EVENT_COMMON_ZERO_NOTICE ="event_common_zero_notice", --零点通知

    EVENT_VIP_EXP_CHANGE = "event_vip_exp_change",--VIP经验

    EVENT_BULLET_SCREEN_NOTICE = "event_bullet_screen_notice",--弹幕通知

    EVENT_VOICE_PLAY_NOTICE = "event_voice_play_notice",--播放语音通知
    EVENT_VOICE_RECORD_CHANGE_NOTICE = "event_voice_record_change_notice",--语音录音通知

	--好友
	EVENT_ADD_FRIEND_SUCCESS = "event_add_friend_success",
	EVENT_RECOMMAND_FRIEND_SUCCESS = "event_recommand_friend_success",
	EVENT_GET_FRIEND_PRESENT_SUCCESS = "event_get_friend_present_success",
	EVENT_FRIEND_RESPOND_SUCCESS = "event_friend_respond_success",
	EVENT_DEL_FRIEND_SUCCESS = "event_del_friend_success",
	EVENT_FRIEND_PRESENT_SUCCESS = "event_friend_present_success",
	EVENT_CONFIRM_ADD_FRIEND_SUCCESS = "event_confirm_add_friend_success",
	EVENT_GET_FRIEND_LIST_SUCCESS = "event_get_friend_list_success",

	--4点 --严禁 拉取服务端数据  否则 会导致服务器奔溃 只做一些客户端 本地保存数据的清理工作
	EVENT_CLEAN_DATA_CLOCK = "event_clean_data_clock",
    -- 0点 事件
    EVENT_ZERO_CLOCK = "event_zero_clock",
    --可能发生了 从后台切回前台的事件
    EVENT_MAY_ENTER_FOREGROUND = "event_may_enter_foreground",
    --弹幕
    EVENT_BULLET_SCREEN_POST = "event_bullet_screen_post",--发送弹幕
    EVENT_BULLET_BOSS_HIT = "event_bullet_boss_hit", --世界boss受击动作

	--节日狂欢事件
	EVENT_GET_CARNIVAL_ACTIVITY_AWARD_SUCCESS = "event_get_carnival_activity_award_success", --获取奖励
	EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE = "event_carnival_activity_data_change", --数据变化
	--军团答题
	EVENT_ENTER_GUILD_ANSWER_SUCCESS = "event_enter_guild_answer_success",
	EVENT_ANSWER_GUILD_QUESTION_SUCCESS = "event_answer_guild_question_success",
	EVENT_SET_GUILD_ANSWER_TIME_SUCCESS = "event_set_guild_answer_time_success",
    EVENT_GUILD_ANSWER_PUBLIC_SUCCESS = "event_guild_answer_public_success",
    EVENT_GUILD_ANSWER_ONE_QUESTION_DONE = "event_guild_answer_one_question_done",
    --神兽
    EVENT_PET_STAR_UP_SUCCESS = "EVENT_PET_STAR_UP_SUCCESS",
    EVENT_PET_LEVEL_UP_SUCCESS = "EVENT_PET_LEVEL_UP_SUCCESS",
    EVENT_PET_ON_TEAM_SUCCESS = "EVENT_PET_ON_TEAM_SUCCESS",
    EVENT_ACTIVE_PET_PHOTO_SUCCESS= "EVENT_ACTIVE_PET_PHOTO_SUCCESS",
    EVENT_GET_ACTIVE_PET_PHOTO_SUCCESS = "EVENT_GET_ACTIVE_PET_PHOTO_SUCCESS",
    EVENT_PET_STARUP = "EVENT_PET_STARUP",


	--水晶商店
	EVENT_GET_SHOP_CRYSTAL_SUCCESS = "event_get_shop_crystal_success",
	EVENT_GET_SHOP_CRYSTAL_AWARD_SUCCESS = "event_get_shop_crystal_award_success",
    EVENT_REFRESH_CRYSTAL_SHOP_SUCCESS = "event_refresh_crystal_shop_success",
    EVENT_SHOP_CRYSTAL_BUY_SUCCESS = "event_shop_crystal_buy_success",
	--充值返利 事件
	EVENT_GET_CURRENT_RECHARGE_REBATE_SUCCESS = "event_get_current_recharge_rebate_success",
	EVENT_GET_RECHARGE_REBATE_INFO_SUCCESS = "event_get_recharge_rebate_info_success",
	EVENT_GET_RECHARGE_REBATE_AWARD_SUCCESS = "event_get_recharge_rebate_award_success",
	--公告预约
	EVENT_COMMON_PHONE_ORDER_SUCCESS = "event_common_phone_order_success",
	--资源找回
	EVENT_ACT_RESOURCE_BACK_AWARD_SUCCESS = "event_act_resource_back_award_success",
	--五谷丰登
	EVENT_GET_ACT_CHECKIN_SUPER_SUCCESS = "event_get_act_checkin_super_success",
	EVENT_ACT_CHECKIN_SUPER_SUCCESS = "event_act_checkin_super_success",
	--每日领取次数
	EVENT_GET_DAILY_COUNT_SUCCESS = "event_get_daily_count_success",
	--变身卡活动
	EVENT_AVATAR_ACTIVITY_SUCCESS = "event_avatar_activity_success",
	--仇人
	EVENT_DEL_ENEMY_SUCCESS = "event_del_enemy_success",
	EVENT_GET_ENEMY_LIST_SUCCESS = "event_get_enemy_list_success",
	EVENT_ENEMY_BATTLE_SUCCESS = "event_enemy_battle_success",
	EVENT_ENEMY_BATTLE_REPORT_SUCCESS = "event_enemy_battle_report_success",
    --三国战记
    EVENT_ATTACK_COUNTRY_BOSS_SUCCESS = "event_attack_country_boss_success",
    EVENT_SYNC_COUNTRY_BOSS_VOTE_SUCCESS = "event_attack_country_boss_success",
    EVENT_INTERCEPT_COUNTRY_BOSS_LIST_SUCCESS = "event_intercept_country_boss_list_success",
    EVENT_SYNC_COUNTRY_BOSS_USER_SUCCESS = "event_sync_country_boss_user_success",
    EVENT_COUNTRY_BOSS_VOTE_SUCCESS = "event_country_boss_vote_success",
    EVENT_SYNC_COUNTRY_BOSS_SUCCESS = "event_sync_country_boss_success",
    EVENT_ENTER_COUNTRY_BOSS_SUCCESS = "event_enter_country_boss_success",
    EVENT_INTERCEPT_COUNTRY_BOSS_USER_SUCCESS = "event_intercept_country_boss_user_success",
    EVENT_GET_MAX_COUNTRY_BOSS_LIST_SUCCESS = "event_get_max_country_boss_list_success",
	EVENT_ENEMY_BATTLE_REPORT_SUCCESS = "event_enemy_battle_report_success",

    --家园
    EVENT_UPDATE_HOME_TREE_MANAGER_SUCCESS = "EVENT_UPDATE_HOME_TREE_MANAGER_SUCCESS",
    EVENT_HOME_TREE_UP_LEVEL_SUCCESS = "EVENT_HOME_TREE_UP_LEVEL_SUCCESS",
    EVENT_UPDATE_HOME_TREE_SUCCESS = "EVENT_UPDATE_HOME_TREE_SUCCESS",
    EVENT_GET_HOME_TREE_SUCCESS = "EVENT_GET_HOME_TREE_SUCCESS",
    EVENT_HOME_TREE_HARVEST_SUCCESS = "EVENT_HOME_TREE_HARVEST_SUCCESS",
    EVENT_VISIT_FRIEND_HOME_SUCCESS = "EVENT_VISIT_FRIEND_HOME_SUCCESS",
    EVENT_HOME_TREE_BLESS_SUCCESS = "EVENT_HOME_TREE_BLESS_SUCCESS",
    EVENT_HOME_LAND_OPEN_DLG = "EVENT_HOME_LAND_OPEN_DLG",--根据type参数打开界面对话框
    EVENT_HOME_LAND_BUFF_EMPTY = "EVENT_HOME_LAND_BUFF_EMPTY", --神树buff空了
    --手杀联动
    EVENT_TAKE_LINKAGE_ACTIVITY_CODE_SUCCESS = "event_take_linkage_activity_code_success",
    EVENT_LINKAGE_ACTIVITY_TASK_SYN = "event_linkage_activity_task_syn",

    --跑马活动
    EVENT_PLAY_HORSE_BET_SUCCESS = "EVENT_PLAY_HORSE_BET_SUCCESS",
    EVENT_PLAY_HORSE_INFO_SUCCESS = "EVENT_PLAY_HORSE_INFO_SUCCESS",
    EVENT_PLAY_HORSE_RESULT_SUCCESS = "EVENT_PLAY_HORSE_RESULT_SUCCESS",
    EVENT_PLAY_HORSE_HERO_RUNNING_END = "EVENT_PLAY_HORSE_HERO_RUNNING_END", --英雄跑到终点
    EVENT_PLAY_HORSE_POST_RUNNING_START = "EVENT_PLAY_HORSE_POST_RUNNING_START",--特效播放时间（倒计时）
    EVENT_PLAY_HORSE_BET_NOTICE = "EVENT_PLAY_HORSE_BET_NOTICE",
    

    EVENT_GUILD_WAR_CITY_INFO_GET = "EVENT_GUILD_WAR_CITY_INFO_GET",
    EVENT_GUILD_WAR_BATTLE_INFO_GET = "EVENT_GUILD_WAR_BATTLE_INFO_GET",
    EVENT_GUILD_WAR_MOVE_SUCCESS = "EVENT_GUILD_WAR_MOVE_SUCCESS",
    EVENT_GUILD_WAR_CAMP_REVERSE = "EVENT_GUILD_WAR_CAMP_REVERSE",
    EVENT_GUILD_WAR_BATTLE_INFO_SYN = "EVENT_GUILD_WAR_BATTLE_INFO_SYN",
    EVENT_GUILD_WAR_ATTACK_WATCH = "EVENT_GUILD_WAR_ATTACK_WATCH",
    EVENT_GUILD_WAR_REPORT_NOTICE = "EVENT_GUILD_WAR_REPORT_NOTICE",
    EVENT_GUILD_WAR_DECLARE_SYN = "EVENT_GUILD_WAR_DECLARE_SYN",
    EVENT_GUILD_WAR_DECLARE_SUCCESS = "EVENT_GUILD_WAR_DECLARE_SUCCESS",
    EVENT_GUILD_WAR_BATTLE_CHANGE_CITY = "EVENT_GUILD_WAR_BATTLE_CHANGE_CITY",
    EVENT_GUILD_WAR_BATTLE_AVATAR_STATE_CHANGE = "EVENT_GUILD_WAR_BATTLE_AVATAR_STATE_CHANGE",
    EVENT_GUILD_WAR_ATTACK_NOTICE = "EVENT_GUILD_WAR_ATTACK_NOTICE",
    EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE = "EVENT_GUILD_WAR_BATTLE_GO_CAMP_NOTICE",
    EVENT_GUILD_WAR_BATTLE_MOVE_CAMERA = "EVENT_GUILD_WAR_BATTLE_MOVE_CAMERA",
    EVENT_GUILD_WAR_DO_ATTACK = "EVENT_GUILD_WAR_DO_ATTACK",
    EVENT_GUILD_WAR_MEMBER_DATA_LIST = "EVENT_GUILD_WAR_MEMBER_DATA_LIST",
    EVENT_GUILD_WAR_RANK_CHANGE = "EVENT_GUILD_WAR_RANK_CHANGE",
    EVENT_GUILD_WAR_BUILDING_CHANGE = "EVENT_GUILD_WAR_BUILDING_CHANGE",
    EVENT_GUILD_WAR_POINT_CHANGE = "EVENT_GUILD_WAR_POINT_CHANGE",
    EVENT_GUILD_WAR_USER_CHANGE = "EVENT_GUILD_WAR_USER_CHANGE",


    --组队
    EVENT_GROUP_LIST_GET = "EVENT_GROUP_LIST_GET", --队伍列表数据获取
    EVENT_GROUP_LIST_UPDATE = "EVENT_GROUP_LIST_UPDATE", --队伍列表数据更新
    EVENT_GROUP_CREATE_SUCCESS = "EVENT_GROUP_CREATE_SUCCESS", --创建队伍成功
    EVENT_GROUP_MY_GROUP_INFO_UPDATE = "EVENT_GROUP_MY_GROUP_INFO_UPDATE", --我的队伍更新
    EVENT_GROUP_LEAVE_SUCCESS = "EVENT_GROUP_LEAVE_SUCCESS", --请求离开队伍成功
    EVENT_GROUP_APPLY_LIST_UPDATE = "EVENT_GROUP_APPLY_LIST_UPDATE",--申请列表更新
    EVENT_GROUP_SYNC_INVITE_LIST = "EVENT_GROUP_SYNC_INVITE_LIST",--邀请列表同步
    EVENT_GROUP_SYNC_APPLY_LIST = "EVENT_GROUP_SYNC_APPLY_LIST",--申请列表同步
    EVENT_GROUP_APPROVE_APPLY_SUCCESS = "EVENT_GROUP_APPROVE_APPLY_SUCCESS",--审批申请成功
    EVENT_GROUP_APPLY_JOIN_SUCCESS = "EVENT_GROUP_APPLY_JOIN_SUCCESS", --申请加入队伍成功
    EVENT_GROUP_REJECT_MY_APPLY = "EVENT_GROUP_REJECT_MY_APPLY", --更新我申请加入队伍信息
    EVENT_GROUP_INVITE_JOIN_GROUP_SUCCEED = "EVENT_GROUP_INVITE_JOIN_GROUP_SUCCEED", --邀请加入队伍
    EVENT_GROUP_REJECT_INVITE = "EVENT_GROUP_REJECT_INVITE", --拒绝了组队邀请
    EVENT_GROUP_ACCEPT_INVITE = "EVENT_GROUP_ACCEPT_INVITE", --接受了组队邀请
    EVENT_GROUP_JOIN_SUCCESS = "EVENT_GROUP_JOIN_SUCCESS", --入队成功
    EVENT_GROUP_OP_INVITE_JOIN_GROUP = "EVENT_GROUP_OP_INVITE_JOIN_GROUP", --受邀请加入队伍
    EVENT_GROUP_TRANSFER_LEADER_SUCCESS = "EVENT_GROUP_TRANSFER_LEADER_SUCCESS", --转让队长
    EVENT_GROUP_REQUEST_TRANSFER_LEADER_TO_ME = "EVENT_GROUP_REQUEST_TRANSFER_LEADER_TO_ME", --请求自己带队成功
    EVENT_GROUP_OP_TRANSFER_LEADER = "EVENT_GROUP_OP_TRANSFER_LEADER", --审批带队请求
    EVENT_GROUP_MY_GROUP_KICK_USER = "EVENT_GROUP_MY_GROUP_KICK_USER", --踢出队员
    EVENT_GROUP_KICK_OUT = "EVENT_GROUP_KICK_OUT", --被踢出
    EVENT_GROUP_REJECT_TRANSFER_LEADER = "EVENT_GROUP_REJECT_TRANSFER_LEADER", --被拒绝申请带队
    EVENT_GROUP_DISSOLVE = "EVENT_GROUP_DISSOLVE", --队伍被解散
    EVENT_GROUP_GET_LEADER_SUCCESS = "EVENT_GROUP_GET_LEADER_SUCCESS", --接任队长成功
    EVENT_GROUP_SET_LEADER_SUCCESS = "EVENT_GROUP_SET_LEADER_SUCCESS", --成功移交队长
    EVENT_GROUP_UPDATE_ENTER_SCENE_STATE = "EVENT_GROUP_UPDATE_ENTER_SCENE_STATE", --组队进入玩法场景确认通知
    EVENT_GROUP_OP_ENTER_SCENE = "EVENT_GROUP_OP_ENTER_SCENE", --审批进入玩法场景
    EVENT_GROUP_MY_GROUP_CHAT_CHANGE = "EVENT_GROUP_MY_GROUP_CHAT_CHANGE", --我的队伍聊天更新
    EVENT_GROUP_RESET_LOGIN_CHANGE = "EVENT_GROUP_RESET_LOGIN_CHANGE", --组队重新登录更新
    EVENT_GROUP_SET_CHANGE_SUCCESS = "EVENT_GROUP_SET_CHANGE_SUCCESS", --改变队伍设置成功
    EVENT_GROUP_APPLY_TIME_OUT = "EVENT_GROUP_APPLY_TIME_OUT", --组队申请时间到了
    EVENT_GROUP_APPLY_JOIN_TIME_OUT = "EVENT_GROUP_APPLY_JOIN_TIME_OUT", --申请入队时间到了
    EVENT_GROUP_INVITE_TIME_OUT = "EVENT_GROUP_INVITE_TIME_OUT", --邀请组队时间到了
    EVENT_GROUP_CHANGE_LOCATION_SUCCESS = "EVENT_GROUP_CHANGE_LOCATION_SUCCESS", --转换站位成功
    EVENT_GROUP_OUTSIDE_STATE = "EVENT_GROUP_OUTSIDE_STATE", -- 处于离开队伍状态(由于各种原因，例如被踢、主动离队、解散队伍...)给活动用
    EVENT_GROUP_MEMBER_REACH_FULL = "EVENT_GROUP_MEMBER_REACH_FULL", --队伍人员达到满员
    EVENT_GROUP_DATA_RESET = "EVENT_GROUP_DATA_RESET", --队伍数据重置
    EVENT_GROUP_DATA_CLEAR = "EVENT_GROUP_DATA_CLEAR", --队伍数据清除

    --战马跑酷 
    EVENT_HORSE_RACE_RIDE_INFO = "event_horse_race_ride_info",      --跑酷信息
    EVENT_HORSE_RACE_RIDE_END = "event_horse_race_ride_end",        --跑酷结束
    EVENT_HORSE_JUMP = "event_horse_jump",                      --马跳起来消息
    EVENT_HORSE_GAME_OVER = "event_horse_game_over",            --跑马游戏结束
    EVENT_HORSE_GET_POINT = "event_horse_get_point",            --跑马获得积分
    EVENT_HORSE_MOVE_X = "event_horse_move_x",                  --跑马移动
    EVENT_HORSE_RACE_START = "event_horse_race_start",          --跑马开始
    EVENT_HORSE_COUNT_DOWN = "event_horse_count_down",          --跑马开始倒计时
    EVENT_HORSE_REMATCH = "event_horse_rematch",                --跑马重新开始
    EVENT_HORSE_START_ACTION = "event_horse_start_action",      --战马开始动作
    EVENT_HORSE_RACE_TOKEN = "event_horse_race_token",          --获得跑马密钥
    EVENT_HORSE_RACE_POSX = "event_horse_race_posx",            --战马移动

 -- 无差别竞技
    EVENT_SEASONSPORT_ENTRY_SUCCESS     = "EVENT_SEASONSPORT_ENTRY_SUCCESS",    -- 进入赛季
    EVENT_SEASONSPORT_SILKEQUIP_SUCCESS = "EVENT_SEASONSPORT_SILKEQUIP_SUCCESS",-- 锦囊装备成功
    EVENT_SEASONSPORT_RECONNECT         = "EVENT_SEASONSPORT_RECONNECT",        -- 断线重连
    EVENT_SEASONSPORT_RECONNECT_OVER    = "EVENT_SEASONSPORT_RECONNECT_OVER",   -- 断线重连时战斗结束
    EVENT_SEASONSPORT_MATCHING          = "EVENT_SEASONSPORT_MATCHING",         -- 正在匹配
    EVENT_SEASONSPORT_FIGHT_MATCH       = "EVENT_SEASONSPORT_FIGHT_MATCH",      -- 匹配成功
    EVENT_SEASONSPORT_MATCH_TIMEOUT     = "EVENT_SEASONSPORT_MATCH_TIMEOUT",    -- 匹配超时
    EVENT_SEASONSPORT_CANCEL_MATCH      = "EVENT_SEASONSPORT_CANCEL_MATCH",     -- 取消匹配
    EVENT_SEASONSPORT_HEROS_BAN         = "EVENT_SEASONSPORT_HEROS_BAN",        -- 搬选武将
    EVENT_SEASONSPORT_WAITING_BAN       = "EVENT_SEASONSPORT_WAITING_BAN",      -- 搬选等待
    EVENT_SEASONSPORT_HEROS_PITCH       = "EVENT_SEASONSPORT_HEROS_PITCH",      -- 武将上阵
    EVENT_SEASONSPORT_FIGHT             = "EVENT_SEASONSPORT_FIGHT",            -- 开始战斗
    EVENT_SEASONSPORT_OWNFIGHTREPORT    = "EVENT_SEASONSPORT_OWNFIGHTREPORT",   -- 我的战报
    EVENT_SEASONSPORT_PLAYFIGHTREPORT   = "EVENT_SEASONSPORT_PLAYFIGHTREPORT",  -- 播放我的战报
    EVENT_SEASONSPORT_RANK              = "EVENT_SEASONSPORT_RANK",             -- 排行榜
    EVENT_SEASONSPORT_REWARDS           = "EVENT_SEASONSPORT_REWARDS",          -- 领取奖励
    EVENT_SEASONSPORT_AWARDS            = "EVENT_SEASONSPORT_AWARDS",           -- 领取完奖励
    EVENT_SEASONSPORT_CUROVER           = "EVENT_SEASONSPORT_CUROVER",          -- 赛季结束监听
    EVENT_SEASONSPORT_BINDINGOK         = "EVENT_SEASONSPORT_BINDINGOK",        -- 锦囊绑定成功后再发战斗请求
    EVENT_SEASONSPORT_START             = "EVENT_SEASONSPORT_START",            -- 无差别赛季开始
    EVENT_SEASONSPORT_END               = "EVENT_SEASONSPORT_END",              -- 无差别赛季结束
    EVENT_SEASONSPORT_CLOSESILKDETAIL   = "EVENT_SEASONSPORT_CLOSESILKDETAIL",  -- 关闭锦囊详情
    EVENT_SEASONSPORT_OPENSILKDETAIL    = "EVENT_SEASONSPORT_OPENSILKDETAIL",   -- 打开锦囊详情
    EVENT_SEASONSPORT_CANCEL_MATCHWHILEREPORT = "EVENT_SEASONSPORT_CANCEL_MATCHWHILEREPORT",     -- 查看战报时取消匹配
    EVENT_SEASONSPORT_APPLY_RECOMMAND_SILK = "EVENT_SEASONSPORT_APPLY_RECOMMAND_SILK",           -- 应用推荐锦囊
    
    --秦皇陵
    EVENT_GRAVE_ENTER_SCENE = "EVENT_GRAVE_ENTER_SCENE", --进入墓地
    EVENT_UPDATE_GRAVE      = "EVENT_UPDATE_GRAVE",  --更新队伍
    EVENT_DELETE_GRAVE      = "EVENT_DELETE_GRAVE",  --删除某个队伍
    EVENT_GRAVE_BATTLE_NOTICE = "EVENT_GRAVE_BATTLE_NOTICE",
    EVENT_GRAVE_SYNC_ATTCK_PLAYER = "EVENT_GRAVE_SYNC_MONSTER_ATTCK",--同步怪物挂机，PK玩家
    EVENT_GRAVE_LEAVE_BATTLE = "EVENT_GRAVE_LEAVE_BATTLE",
    EVENT_GRAVE_TEAM_AVATAR_STATE_CHANGE = "EVENT_GRAVE_TEAM_AVATAR_STATE_CHANGE",
    EVENT_GRAVE_SELF_TEAM_MOVE_END = "EVENT_GRAVE_SELF_TEAM_MOVE_END",--秦皇陵移我方队伍移动结束
    EVENT_GRAVE_GETREWARD = "EVENT_GRAVE_GETREWARD",--秦皇陵击杀奖励
    EVENT_GRAVE_TIME_FINISH = "EVENT_GRAVE_TIME_FINISH",--秦皇陵时间结束，进入协助状态刷新
    
    --战斗回看
    EVENT_BATTLE_REPLAY = "EVENT_BATTLE_REPLAY",    --战斗回看

    --svip
    EVENT_SVIP_REGISTE_SUCCESS = "EVENT_SVIP_REGISTE_SUCCESS",    --高级VIP认证

    --进入战斗统一接口
    EVENT_ENTER_FIGHT_SCENE = "EVENT_ENTER_FIGHT_SCENE",        --进入战斗场景统一入口


    --历代名将
    EVENT_HISTORY_HERO_GET = "EVENT_HISTORY_HERO_GET_ALL",                                   --获取所有名将
    EVENT_HISTORY_HERO_BREAK_THROUGH_SUCCESS = "EVENT_HISTORY_HERO_BREAK_THROUGH_SUCCESS",   --名将突破成功
    EVENT_HISTORY_HERO_EQUIP_SUCCESS = "EVENT_HISTORY_HERO_EQUIP_SUCCESS",                   --名将上下阵成功
    EVENT_HISTORY_HERO_FORMATIONUPDATE = "EVENT_HISTORY_HERO_FORMATIONUPDATE",               --名将上阵阵容刷新
    EVENT_HISTORY_HERO_REBORN_SUCCESS = "EVENT_HISTORY_HERO_REBORN_SUCCESS",                 --名将重生成功
    EVENT_HISTORY_HERO_ACTIVATE_BOOK_SUCCESS = "EVENT_HISTORY_HERO_ACTIVATE_BOOK_SUCCESS",   --名将图鉴激活成功
    EVENT_HISTORY_HERO_DOWN_SUCCESS = "EVENT_HISTORY_HERO_DOWN_SUCCESS",                     --名将降级

    EVENT_THREEKINDOMS_LINKED = "EVENT_THREEKINDOMS_LINKED",        -- 手杀联动
    EVENT_FUNDS_REWARDS = "EVENT_FUNDS_REWARDS",                    -- 基金奖励领取


    --称号
    EVENT_UPDATE_TITLE_INFO = "EVENT_UPDATE_TITLE_INFO", -- 更新称号信息
    EVENT_EQUIP_TITLE = "EVENT_EQUIP_TITLE",  --装备称号
    EVENT_UNLOAD_TITLE = "EVENT_UNLOAD_TITLE",  --卸下称号

    -- 战马装备相关
    EVENT_HORSE_EQUIP_ADD_SUCCESS = "EVENT_HORSE_EQUIP_ADD_SUCCESS", --穿戴战马装备成功
    EVENT_HORSE_EQUIP_RECOVERY_SUCCESS = "EVENT_HORSE_EQUIP_RECOVERY_SUCCESS", --战马装备回收成功
    EVENT_HORSE_RECORD_ATTR = "EVENT_HORSE_RECORD_ATTR", --战马属性刷新

    -- 战马图鉴
    EVENT_HORSE_KARMA_ACTIVE_SUCCESS = "EVENT_HORSE_KARMA_ACTIVE_SUCCESS",  --战马图鉴激活成功
    EVENT_REFRESH_HORSE_PHOTORP = "EVENT_REFRESH_HORSE_PHOTORP", --刷新战马图鉴入口的红点

    --装备界限突破
    EVENT_EQUIP_LIMIT_UP_PUT_RES="EVENT_HERO_LIMIT_LV_PUT_RES",
    --装备数量发生改变
    EVENT_UPDATE_EQUIPMENT_NUMS="EVENT_UPDATE_EQUIPMENT_NUMS",

    EVENT_JADE_EQUIP_SUCCESS="EVENT_JADE_EQUIP_SUCCESS",
    EVENT_JADE_TREASURE_SUCCESS="EVENT_JADE_TREASURE_SUCCESS",

    EVENT_SHOP_NEW_REMIND_UPDATE="EVENT_SHOP_NEW_REMIND_UPDATE",  -- 新商品上架刷新

    EVENT_EQUIP_TRAIN_CHANGE_VIEW="EVENT_EQUIP_TRAIN_CHANGE_VIEW",  
    EVENT_TREASURE_TRAIN_CHANGE_VIEW="EVENT_TREASURE_TRAIN_CHANGE_VIEW",  

    EVENT_GUILDCROSS_WAR_ENTRY          = "EVENT_GUILDCROSS_WAR_ENTRY",          -- 跨服军团战入口
    EVENT_GUILDCROSS_WAR_SELFMOVE       = "EVENT_GUILDCROSS_WAR_SELFMOVE",       -- 跨服军团战本人移动
    EVENT_GUILDCROSS_WAR_UPDATEPLAYER   = "EVENT_GUILDCROSS_WAR_UPDATEPLAYER",   -- 跨服军团战玩家更新
    EVENT_GUILDCROSS_WAR_UPDATEPOINT    = "EVENT_GUILDCROSS_WAR_UPDATEPOINT",    -- 跨服军团战据点更新
    EVENT_GUILDCROSS_WAR_FIGHT          = "EVENT_GUILDCROSS_WAR_FIGHT",          -- 跨服军团战战斗（自己及对方）
    EVENT_GUILDCROSS_WAR_OTHER_SEE_BOSSS= "EVENT_GUILDCROSS_WAR_OTHER_SEE_BOSSS",-- 跨服军团战pve（其他玩家推送）
    EVENT_GUILDCROSS_WAR_SELFDIE        = "EVENT_GUILDCROSS_WAR_SELFDIE",        -- 跨服军团战pvp（SELF死亡监听）
    EVENT_GUILDCROSS_WAR_OTHERDIE       = "EVENT_GUILDCROSS_WAR_OTHERDIE",       -- 跨服军团战pvp（OTHER死亡监听）
    EVENT_GUILDCROSS_WAR_LADDER         = "EVENT_GUILDCROSS_WAR_LADDER",         -- 跨服军团战排行榜
    EVENT_GUILDCROSS_WAR_OBSERVE        = "EVENT_GUILDCROSS_WAR_OBSERVE",        -- 跨服军团战观战
    EVENT_GUILDCROSS_WAR_WARRING        = "EVENT_GUILDCROSS_WAR_WARRING",        -- 跨服军团战对战
    EVENT_GUILDCROSS_WAR_INSPIRE        = "EVENT_GUILDCROSS_WAR_INSPIRE",        -- 跨服军团战鼓舞支持
    EVENT_GUILDCROSS_WAR_EXIT           = "EVENT_GUILDCROSS_WAR_EXIT",           -- 跨服军团战第五阶段退出
    EVENT_GUILDCROSS_WAR_CHAMPTION      = "EVENT_GUILDCROSS_WAR_CHAMPTION",      -- 跨服军团战第四阶段冠军成员展示

    -- 新版全服答题
    EVENT_GUILD_SERVER_ANSWER_UPDATE_STATE="EVENT_GUILD_SERVER_ANSWER_UPDATE_STATE",
    EVENT_GUILD_SERVER_ANSWER_UPDATE_QUESTION="EVENT_GUILD_SERVER_ANSWER_UPDATE_QUESTION",
    EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE="EVENT_GUILD_SERVER_ANSWER_PLAYER_UPDATE",
    EVENT_GUILD_SERVER_ANSWER_READY_SUCCESS="EVENT_GUILD_SERVER_ANSWER_READY_SUCCESS",
    EVENT_GUILD_SERVER_ANSWER_CHANGE_ANSWER_SUCESS="EVENT_GUILD_SERVER_ANSWER_CHANGE_ANSWER_SUCESS",
    EVENT_GUILD_SERVER_ANSWER_RESTING="EVENT_GUILD_SERVER_ANSWER_RESTING",
    EVENT_GUILD_SERVER_ANSWER_QUESTION_REWARD="EVENT_GUILD_SERVER_ANSWER_QUESTION_REWARD",
    EVENT_GUILD_ENTER_NEW_ANSWER="EVENT_GUILD_ENTER_NEW_ANSWER",
    EVENT_GUILD_NEW_ANSWER_UPDATE_PLAYER_NUMS="EVENT_GUILD_NEW_ANSWER_UPDATE_PLAYER_NUMS",
    EVENT_GUILD_NEW_ANSWER_UPDATE_RANK="EVENT_GUILD_NEW_ANSWER_UPDATE_RANK",

    EVENT_RED_PACKET_RAIN_START_NOTIFY = "EVENT_RED_PACKET_RAIN_START_NOTIFY", --红包雨活动开始通知
    EVENT_RED_PACKET_RAIN_ENTER_SUCCESS = "EVENT_RED_PACKET_RAIN_ENTER_SUCCESS",
    EVENT_RED_PACKET_RAIN_GET_SUCCESS = "EVENT_RED_PACKET_RAIN_GET_SUCCESS", --领取红包
    EVENT_RED_PACKET_RAIN_GET_NOTIFY = "EVENT_RED_PACKET_RAIN_GET_NOTIFY",
    EVENT_RED_PACKET_RAIN_GET_TIMEOUT = "EVENT_RED_PACKET_RAIN_GET_TIMEOUT", --领取红包超时（防作弊）
    EVENT_RED_PACKET_RAIN_GET_RANK = "EVENT_RED_PACKET_RAIN_GET_RANK", --获取红包排行榜

    -- 神兽界限突破
    EVENT_PET_LIMITUP_MATERIAL_SUCCESS = "EVENT_PET_LIMITUP_MATERIAL_SUCCESS",
    EVENT_PET_LIMITUP_SUCCESS = "EVENT_PET_LIMITUP_SUCCESS",
 
    -- 金将招募
    EVENT_GACHA_GOLDENHERO_ENTRY = "EVENT_GACHA_GOLDENHERO_ENTRY",          -- 金将招募进入
    EVENT_GACHA_GOLDENHERO_JOYRANK = "EVENT_GACHA_GOLDENHERO_JOYRANK",      -- 金将招募排行榜
    EVENT_GACHA_GOLDENHERO_DRAWCLOSE = "EVENT_GACHA_GOLDENHERO_DRAWCLOSE",  -- 金将招募抽奖关闭展示
    EVENT_GACHA_GOLDENHERO_LUCKLIST = "EVENT_GACHA_GOLDENHERO_LUCKLIST",    -- 金将招募中奖名单
    EVENT_GACHA_GOLDENHERO_UPDATEITEM = "EVENT_GACHA_GOLDENHERO_UPDATEITEM",-- 金将招募刷新龙纹壁

    EVENT_SYNTHESIS_RESULT = "EVENT_SYNTHESIS_RESULT",    -- 合成结果

    -- 金将养成
    EVENT_GOLD_HERO_RESOURCE_SUCCESS="EVENT_GOLD_HERO_RESOURCE_SUCCESS",

    --老玩家回归
    EVENT_RETURN_ACTIVITY_INFO = "EVENT_RETURN_ACTIVITY_INFO",      -- 拉去老玩家回归信息
    EVENT_RETURN_SHOW_REWARD = "EVENT_RETURN_SHOW_REWARD",          -- 领取奖励
    EVENT_RETURN_LEVEL_DIRECT_UP = "EVENT_RETURN_LEVEL_DIRECT_UP",  -- 等级直升
 
    EVENT_RETURN_RESET_TIMES = "EVENT_RETURN_RESET_TIMES",           -- 重置副本次数
    EVENT_RETURN_UPDATE = "EVENT_RETURN_UPDATE",                     -- 更新界面信息


    --暗度陈仓
    EVENT_GRAIN_CAR_GET_INFO = "EVENT_GRAIN_CAR_GET_INFO",                  -- 获取粮车信息
    EVENT_GRAIN_CAR_UPGRADE = "EVENT_GRAIN_CAR_UPGRADE",                    -- 粮车升级
    EVENT_GRAIN_CAR_CHANGE_AUTH = "EVENT_GRAIN_CAR_CHANGE_AUTH",            -- 粮车路线可见
    EVENT_GRAIN_CAR_NOTIFY = "EVENT_GRAIN_CAR_NOTIFY",                      -- 粮车信息变更通知
    EVENT_GRAIN_CAR_LAUNCH = "EVENT_GRAIN_CAR_LAUNCH",                      -- 发车
    EVENT_GRAIN_CAR_GET_ALL_MOVE_CAR = "EVENT_GRAIN_CAR_GET_ALL_MOVE_CAR",  -- 获取所有粮车位置
    EVENT_GRAIN_CAR_MOVE_NOTIFY = "EVENT_GRAIN_CAR_MOVE_NOTIFY",            -- 粮车位置变更通知
    EVENT_GRAIN_CAR_ATTACK = "EVENT_GRAIN_CAR_ATTACK",                      -- 攻击粮车
    EVENT_GRAIN_CAR_GO2MINE = "EVENT_GRAIN_CAR_GO2MINE",                    -- 前往某个矿
    EVENT_GRAIN_CAR_VIEW_NOTIFY = "EVENT_GRAIN_CAR_VIEW_NOTIFY",            -- 粮车路线分享权限变动
    EVENT_GRAIN_CAR_CAR_INTO_MINE = "EVENT_GRAIN_CAR_CAR_INTO_MINE",        -- 粮车进入某个矿
    EVENT_GRAIN_CAR_AVATAR_CLICK_IN_MINE = "EVENT_GRAIN_CAR_AVATAR_CLICK_IN_MINE",        -- 点击了框内的某个粮车
    EVENT_GRAIN_CAR_END = "EVENT_GRAIN_CAR_END",                            --活动结束通知
    EVENT_GRAIN_CAR_UPDATE_ARMY = "EVENT_GRAIN_CAR_UPDATE_ARMY",            --攻击粮车后 更新兵力值

    --跨服拍卖
    EVENT_CROSS_AUCTION_GET_INFO = "EVENT_CROSS_AUCTION_GET_INFO",          --获取跨服拍卖详细信息
    EVENT_CROSS_AUCTION_UPDATE_ITEM = "EVENT_CROSS_AUCTION_UPDATE_ITEM",    --跨服拍卖信息更新
    EVENT_CROSS_AUCTION_ADD_FOCUS = "EVENT_CROSS_AUCTION_ADD_FOCUS",        --跨服拍卖关注更新
    EVENT_CROSS_AUCTION_ADD_PRICE = "EVENT_CROSS_AUCTION_ADD_PRICE",        --跨服拍卖出价成功

    -- 战法
    EVENT_TACTICS_GETLIST = "EVENT_TACTICS_GETLIST",                        -- 获取战法列表信息
    EVENT_TACTICS_UNLOCK_POSITION = "EVENT_TACTICS_UNLOCK_POSITION",        -- 武将战法位激活
    EVENT_TACTICS_CREATE = "EVENT_TACTICS_CREATE",                          -- 战法解锁
    EVENT_TACTICS_ADD_SUCCESS = "EVENT_TACTICS_ADD_SUCCESS",                -- 武将装备战法
    EVENT_TACTICS_REMOVE_SUCCESS = "EVENT_TACTICS_REMOVE_SUCCESS",          -- 武将卸载战法
    EVENT_TACTICS_ADD_PROFICIENCY = "EVENT_TACTICS_ADD_PROFICIENCY",        -- 增加战法熟练度
    EVENT_TACTICS_GET_FORMATION = "EVENT_TACTICS_GET_FORMATION",            -- 获取阵容英雄战法详情
	
	--回归服
	EVENT_RETURN_CHECK_IN_SUCCESS = "EVENT_RETURN_CHECK_IN_SUCCESS", 		--回归服确认
    EVENT_RETURN_RECV_BONUS_SUCCESS = "EVENT_RETURN_RECV_BONUS_SUCCESS",	--回归服领奖
    
    EVENT_CHECK_BUY_RETURN_GIFT = "EVENT_CHECK_BUY_RETURN_GIFT",            --check 买回归服礼包
    EVENT_RETURN_BUY_RETURN_GIFT = "EVENT_RETURN_BUY_RETURN_GIFT",          --购买回归服礼包

    EVENT_GET_RED_PET_INFO = "EVENT_GET_RED_PET_INFO",          --拉去红神兽信息
    EVENT_GACHA_RED_PET = "EVENT_GACHA_RED_PET",          --红神兽抽奖
    EVENT_REFRESH_RED_PET = "EVENT_REFRESH_RED_PET",          --红神兽刷新

    EVENT_CROSS_MINE_ENTRY = "EVENT_CROSS_MINE_ENTRY" ,
    EVENT_CROSS_MINE_DETAIL = "EVENT_CROSS_MINE_DETAIL" ,
    EVENT_CROSS_MINE_MOVE = "EVENT_CROSS_MINE_MOVE" ,
    EVENT_CROSS_MINE_UPDATE_USER_POS = "EVENT_CROSS_MINE_UPDATE_USER_POS" , -- 玩家位置更新
    EVENT_CROSS_MINE_MOVE_OVER = "EVENT_CROSS_MINE_MOVE_OVER" ,
    EVENT_CROSS_MINE_REPORT = "EVENT_CROSS_MINE_REPORT" ,
    EVENT_CROSS_MINE_UPDATE = "EVENT_CROSS_MINE_UPDATE" ,  -- 矿点数据更新
    EVENT_CROSS_MINE_STATION = "EVENT_CROSS_MINE_STATION" ,
    EVENT_CROSS_MINE_MULTIPLE_MOVE = "EVENT_CROSS_MINE_MULTIPLE_MOVE" ,
    EVENT_CROSS_MINE_AVATAR_MOVE = "EVENT_CROSS_MINE_AVATAR_MOVE" ,
    EVENT_CROSS_MINE_DRAW_ARROW = "EVENT_CROSS_MINE_DRAW_ARROW",
    EVENT_CROSS_MINE_HIDE_ARROW = "EVENT_CROSS_MINE_HIDE_ARROW",
    EVENT_CROSS_MINE_MAP_TOUCHED = "EVENT_CROSS_MINE_MAP_TOUCHED",
    EVENT_CROSS_MINE_MAP_MOVED = "EVENT_CROSS_MINE_MAP_MOVED",
    EVENT_CROSS_MINE_MAP_SCALED = "EVENT_CROSS_MINE_MAP_SCALED",
    EVENT_CROSS_MINE_MAP_SCREEN_BOUNDRY_CHANGED = "EVENT_CROSS_MINE_MAP_SCREEN_BOUNDRY_CHANGED",
    EVENT_CROSS_MINE_FOCUS_MOVE = "EVENT_CROSS_MINE_FOCUS_MOVE",
    EVENT_CROSS_MINE_CANCEL_FOCUS_MOVE = "EVENT_CROSS_MINE_CANCEL_FOCUS_MOVE",
    EVENT_CROSS_MINE_FOCUS_MINE = "EVENT_CROSS_MINE_FOCUS_MINE",
    EVENT_CROSS_MINE_CANCEL_FOCUS_MINE = "EVENT_CROSS_MINE_CANCEL_FOCUS_MINE",
    EVENT_CROSS_MINE_FIGHT_DETAIL_CLICKED = "EVENT_CROSS_MINE_FIGHT_DETAIL_CLICKED",
    EVENT_CROSS_MINE_END_POS_CLICKED = "EVENT_CROSS_MINE_END_POS_CLICKED",
    EVENT_CROSS_MINE_MAP_MOVE_TO_Mine = "EVENT_CROSS_MINE_MAP_MOVE_TO_Mine",
    EVENT_CROSS_MINE_PLAYER_MOVE_DETAIL = "EVENT_CROSS_MINE_PLAYER_MOVE_DETAIL",
    EVENT_CROSS_MINE_ROLE_STATE_CHANGED = "EVENT_CROSS_MINE_ROLE_STATE_CHANGED",
    EVENT_CROSS_MINE_PRE_MOVE_TO_PLAYER_POS = "EVENT_CROSS_MINE_PRE_MOVE_TO_PLAYER_POS",
    EVENT_CROSS_MINE_MOVE_TO_PLAYER_POS = "EVENT_CROSS_MINE_MOVE_TO_PLAYER_POS",
    EVENT_CROSS_MINE_GET_GUILD_RELATIONS_LIST = "EVENT_CROSS_MINE_GET_GUILD_RELATIONS_LIST",
    EVENT_CROSS_MINE_GET_GUILD_RELATIONS_SYNC = "EVENT_CROSS_MINE_GET_GUILD_RELATIONS_SYNC",
    EVENT_CROSS_MINE_ARROW_ANIMATE_END = "EVENT_CROSS_MINE_ARROW_ANIMATE_END",
    EVENT_CROSS_MINE_PLAY_SIGNAL_EFFECT = "EVENT_CROSS_MINE_PLAY_SIGNAL_EFFECT",

    --阵法
    EVENT_BOUT_ENTRY = "EVENT_BOUT_ENTRY",                      -- 进入
    EVENT_BOUT_UNLOCKSUCCESS = "EVENT_BOUT_UNLOCKSUCCESS",      -- 解锁成功

    --T恤活动
    EVENT_TSHIRT_GET_INFO = "EVENT_TSHIRT_GET_INFO",
    EVENT_TSHIRT_COMMIT_SUCCESS = "EVENT_TSHIRT_COMMIT_SUCCESS",
    EVENT_TSHIRT_REST_NUM_CHANGE = "EVENT_TSHIRT_REST_NUM_CHANGE",

    -- 金色变身卡活动
    EVENT_GOLDEN_AVATAR_ACT_GETINFO = "EVENT_GOLDEN_AVATAR_ACT_GETINFO",            -- 获取金色变身卡活动
    EVENT_GOLDEN_AVATAR_GACHA = "EVENT_GOLDEN_AVATAR_GACHA",                        -- 抽卡
    EVENT_SYNTHETISE_GOLDEN_AVATAR = "EVENT_SYNTHETISE_GOLDEN_AVATAR",              -- 金色变身卡合成
    EVENT_GOLDEN_AVATAR_ENTRY = "EVENT_GOLDEN_AVATAR_ENTRY",                        -- 金色变身卡进入
    EVENT_GOLDEN_AVATAR_JOYRANK = "EVENT_GOLDEN_AVATAR_JOYRANK",                    -- 金色变身卡排行榜
    EVENT_GOLDEN_AVATAR_LUCKLIST = "EVENT_GOLDEN_AVATAR_LUCKLIST",                  -- 金色变身卡中奖名单
    EVENT_GOLDEN_AVATAR_EXCHANGE = "EVENT_GOLDEN_AVATAR_EXCHANGE",                  -- 金色变身卡更换
    EVENT_GOLDEN_AVATAR_EXCHANGE_REWARD = "EVENT_GOLDEN_AVATAR_EXCHANGE_REWARD",    -- 金色变身卡更换，获得奖励
    

    -- 金色变身卡养成
    EVENT_GOLDEN_AVATAR_AWAKEN_SUCCESS = "EVENT_GOLDEN_AVATAR_AWAKEN_SUCCESS",

    --晋将招募
    EVENT_GACHA_JIN_ENTRY = "EVENT_GACHA_JIN_ENTRY",    --进入
    EVENT_GACHA_JIN_AWARD = "EVENT_GACHA_JIN_AWARD",    --奖励
    EVENT_GACHA_JIN_JOYRANK = "EVENT_GACHA_JIN_JOYRANK",--欢乐抽奖
    EVENT_GACHA_JIN_CROSSUPDATE = "EVENT_GACHA_JIN_CROSSUPDATE",--跨天
    EVENT_GACHA_JIN_FREECD = "EVENT_GACHA_JIN_FREECD",  --免费CD

    --装备洗练
    EVENT_EQUIP_PURIFY = "EVENT_EQUIP_PURIFY",                   --洗练
    EVENT_EQUIP_PURIFY_LOCK = "EVENT_EQUIP_PURIFY_LOCK",         --锁
    EVENT_EQUIP_PURIFY_COMFIRM = "EVENT_EQUIP_PURIFY_COMFIRM",   --保存洗练

    -- 晋将养成成功
    EVENT_JIN_HERO_TRAIN_SUCCESS = "EVENT_JIN_HERO_TRAIN_SUCCESS",

    --7日累充
    EVENT_DAY7_RECHARGE_ENTRY = "EVENT_DAY7_RECHARGE_ENTRY",
    EVENT_DAY7_RECHARGE_PRIZE = "EVENT_DAY7_RECHARGE_PRIZE",

    -- 敦煌迷窟
    EVENT_MAZE_GET_BASE_INFO = "EVENT_MAZE_GET_BASE_INFO",                  -- 获取基本信息
    EVENT_MAZE_PUBLISH_TASK = "EVENT_MAZE_PUBLISH_TASK",                    -- 发布任务
    EVENT_MAZE_ACCEPT_TASK = "EVENT_MAZE_ACCEPT_TASK",                      -- 接受任务
    EVENT_MAZE_MODIFY_TASK = "EVENT_MAZE_MODIFY_TASK",                      -- 修改任务
    EVENT_MAZE_TASK_GET_REWARD = "EVENT_MAZE_TASK_GET_REWARD",              -- 领取任务奖励
    EVENT_MAZE_GET_TASK_LIST = "EVENT_MAZE_GET_TASK_LIST",                  -- 获取可接受任务列表
    EVENT_MAZE_GET_SELF_TASK_LIST = "EVENT_MAZE_GET_SELF_TASK_LIST",        -- 获取个人发布的任务列表
    EVENT_MAZE_GET_RANK_LIST = "EVENT_MAZE_GET_RANK_LIST",                  -- 排行榜

    EVENT_MAZE_BEGIN_EXPLORE = "EVENT_MAZE_BEGIN_EXPLORE",                  -- 开始探索
    EVENT_MAZE_GOTO_NEXT_ROOM = "EVENT_MAZE_GOTO_NEXT_ROOM",                -- 走到下一个房间
    EVENT_MAZE_DEAL_ROOM_EVENT = "EVENT_MAZE_DEAL_ROOM_EVENT",              -- 处理房间事件
    EVENT_MAZE_GOTO_NEXT_FLOOR = "EVENT_MAZE_GOTO_NEXT_FLOOR",              -- 走到下一层
    EVENT_MAZE_GET_TOTAL_REWARD = "EVENT_MAZE_GET_TOTAL_REWARD",            -- 探索结束，获取秘宝奖励推送
    EVENT_MAZE_FLIPGAME_FLIP = "EVENT_MAZE_FLIPGAME_FLIP",                  -- 翻牌小游戏翻牌
    EVENT_MAZE_FLIPGAME_END = "EVENT_MAZE_FLIPGAME_END",                    -- 小游戏结束请求结果
    EVENT_MAZE_UPDATE_ROOM = "EVENT_MAZE_UPDATE_ROOM",                      -- 主动推送格子更新
    EVENT_MAZE_EXPLORE_LOG = "EVENT_MAZE_EXPLORE_LOG",                      -- 探索日志

    --元宝兑换
    EVENT_DIAMOND_EXCHANGE = "EVENT_DIAMOND_EXCHANGE",
}
return SignalConst
