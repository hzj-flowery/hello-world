-- @Author panhoa
-- @Date 8.17.2018
-- @Role 

local SeasonSportConst = {}
SeasonSportConst.SEASON_STAGE_ROOKIE  = 1   -- 新秀赛（+8赛区）
SeasonSportConst.SEASON_STAGE_ADVANCED= 2   -- 全国赛（+10赛区）
SeasonSportConst.SEASON_STAGE_HIGHT   = 3   -- 全国赛（+12赛区）

SeasonSportConst.SEASON_DAN_MAX       = 7   -- 赛季最大段位
SeasonSportConst.HERO_SCOP_INHANDBOOK = 1   -- 武将筛选条件一：图鉴中有显示
SeasonSportConst.HERO_SCOP_LOWERLIMIT = 5   -- 武将筛选条件二：范围下限橙将
SeasonSportConst.HERO_SCOP_LIMIT      = 1   -- 武将筛选条件三：可突破(用于橙升红)
SeasonSportConst.HERO_RED_LINEBREAK   = 3   -- 武将筛选条件四：界限突破(用于橙升红)
SeasonSportConst.HERO_SCOP_REDIMIT    = 6   -- 红将
SeasonSportConst.HERO_SCOP_GOLDENLIMIT      = 7    -- 金将
SeasonSportConst.SEASON_COUNTDOWN     = 86400 -- 开启24小时倒计时

SeasonSportConst.SEASON_STAR_MAX            = 3    -- 青铜最大3颗星
SeasonSportConst.SEASON_STAR_WANGZHE_MAX    = 5    -- 王者最大5颗星做判断
SeasonSportConst.HERO_SQUAD_USEABLECOUNT    = 6    -- 上阵武将可选数量
SeasonSportConst.AVATAR_MOVETARGETPOS_OUT   = -1   -- 上阵武将移动到界外
SeasonSportConst.POPUPHEROVIEW_OFFSETHEIGHT = 40   -- 新秀赛、进阶赛lisview's height偏移量
SeasonSportConst.POSITION_PLAYERNAME_OFFSETX= 20   -- 玩家名相对于区服位置：横坐标偏移量
SeasonSportConst.POSITION_HEIGHEST_KINGSTAR = 166  -- 王者1级5星
SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS= 13   -- 玩家战报ids数宽度

SeasonSportConst.SEASON_STAGE_SCOP        = 357   -- 新手赛与全国赛的时间界限  
SeasonSportConst.SEASON_STAGE_DURATION    = 358   -- 赛季时长
SeasonSportConst.SEASON_FIRST_START       = 359   -- 首赛开始时间
SeasonSportConst.SEASON_ROOKIE_SILKCOUNT  = 360   -- 新秀赛每组锦囊数量
SeasonSportConst.SEASON_ADVANCED_SILKCOUNT= 361   -- 全国赛每组锦囊数量
SeasonSportConst.SEASON_HIGHT_SILKCOUNT   = 498   -- 精英每组锦囊数量
SeasonSportConst.SEASON_SILK_GROUPCOUNT   = 362   -- 最大锦囊组数量
SeasonSportConst.SEASON_ROOKIE_SILKID     = 363   -- 新秀赛组默认锦囊id
SeasonSportConst.SEASON_ADVANCED_SILKID   = 364   -- 全国赛组默认锦囊id
SeasonSportConst.SEASON_OPENED_SILKGROUP  = 365   -- 默认开启锦囊组数
SeasonSportConst.SEASON_SILKGROUP_UNLOCK  = 372   -- 解锁锦囊组条件1：花费元宝
SeasonSportConst.SEASON_INTERVAL_TIME     = 374   -- 起始时间段(每天)
SeasonSportConst.SEASON_STRENGTH_ROOKIE   = 376   -- 新秀赛季突破
SeasonSportConst.SEASON_STRENGTH_ADVANCE  = 379   -- 进阶赛季突破
SeasonSportConst.SEASON_STRENGTH_HIGHT    = 495   -- 精英赛季突破

SeasonSportConst.SEASON_CANCE_LLIMITTIME  = 384   -- 惩罚时间
SeasonSportConst.SEASON_MATCH_LLIMITTIME  = 385   -- 匹配超时:300
SeasonSportConst.SEASON_MAXLIMIT_REDHERO  = 392   -- 最大上阵红将数量
SeasonSportConst.SEASON_DAILYREWARDS_FIGHT= 394   -- 每日奖励：战斗奖励
SeasonSportConst.SEASON_DAILYREWARDS_WIN  = 395   -- 每日奖励：胜利奖励
SeasonSportConst.SEASON_REWARDS           = 398   -- 赛季奖励: x30
SeasonSportConst.SEASON_HIGHTPET_COUNTS   = 491   -- 经精英区最大神兽数量
SeasonSportConst.SEASON_ADVANCEDPET_COUNTS= 423   -- 进阶区最大神兽数量
SeasonSportConst.SEASON_ROOKIEPET_COUNTS  = 424   -- 新手区最大神兽数量
SeasonSportConst.SEASON_PET_ROOKIE_STARMAX= 426   -- 神兽统一星级：1.现在改新手神兽星级
SeasonSportConst.SEASON_PET_ADVANC_STARMAX = 437  -- 神兽统一星级：2.现在新增进阶神兽星级
SeasonSportConst.SEASON_PET_HIGHT_STARMAX = 492   -- 神兽统一星级：3.现在新增进阶神兽星级

SeasonSportConst.SEASON_BANHERO_NUM       = 432   -- 搬选武将数量
SeasonSportConst.SEASON_BANHERO_NEEDSTAR  = 434   -- 搬选武将条件：n星级以上
SeasonSportConst.SEASON_REDLIMIT_ROOKIE   = 435   -- 界限突破(橙升红)：1.新手赛区
SeasonSportConst.SEASON_REDLIMIT_ADVANCED = 436   -- 界限突破(橙升红)：2.进阶赛区
SeasonSportConst.SEASON_REDLIMIT_HIGHT    = 493   -- 界限突破(橙升红)：3.精英赛区

SeasonSportConst.SEASON_GOLDEN_RANK               = 751    -- 金将涅槃等级
SeasonSportConst.SEASON_MAXLIMIT_GOLDENHERO       = 752    -- 最大上阵金将数量

SeasonSportConst.SEASON_RES_TYPE          = 5     -- 奖励资源类型Type(策划要默认写死，糊涂！)
SeasonSportConst.SEASON_RES_VALUE         = 29    -- 奖励资源类型Value
SeasonSportConst.SEASON_PET_OFFSETHEIGHT  = 60    -- 上阵界面神兽背景高偏移量
SeasonSportConst.SEASON_OFFLINE_WAITING   = 10    -- 断线重连等待10秒
SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNORMAL   = 364   -- 选人弹窗常规尺寸：高
SeasonSportConst.SEASON_POPHEROVIEW_HEIGHTNAN      = 340   -- 选人弹窗拌选尺寸：高
SeasonSportConst.SEASON_POPHEROVIEW_LISTVIEW_OFF   = 2     -- 列表项位置偏移

SeasonSportConst.SEASON_BANHERO_NORMAL = cc.p(410, 30)     -- 搬选展示位置：1.搬选中
SeasonSportConst.SEASON_BANHERO_PICKED = cc.p(145, 30)     -- 搬选展示位置：2.搬选后


SeasonSportConst.SEASON_STAGE_TIP       = {
    "img_fight_01",     -- +8赛区
    "img_fight_02",     -- +10赛区
    "img_fight_03",     -- +12赛区
}

SeasonSportConst.SEASON_SILKBACK       = {
    "img_fight_embattleherbg_nml",     -- 上阵武将底：普通
    "img_fight_embattleherbg_over",    -- 上阵武将底：高亮
}

SeasonSportConst.SEASON_DANBACK       = {--（弃用
    "img_fight_04",              -- 段位底：普通
    "img_fight_04b",             -- 段位底：超凡
}

SeasonSportConst.SEASON_DANSWORD       = {--（弃用
    "img_fight_grading01",       -- 段位武器：青铜
    "img_fight_grading02",       -- 段位武器：白银
    "img_fight_grading03",       -- 段位武器：黄金
    "img_fight_grading04",       -- 段位武器：尊贵
    "img_fight_grading05",       -- 段位武器：超凡
    "img_fight_grading06",       -- 段位武器：至尊
    "img_fight_grading07",       -- 段位武器：王者
}

SeasonSportConst.SEASON_DANFLAG       = {
    "img_fight_lit_grading01",       -- 段位称号：无敌青铜
    "img_fight_lit_grading02",       -- 段位称号：坚韧白银
    "img_fight_lit_grading03",       -- 段位称号：百炼黄金
    "img_fight_lit_grading04",       -- 段位称号：尊贵翡翠
    "img_fight_lit_grading05",       -- 段位称号：超凡大师
    "img_fight_lit_grading06",       -- 段位称号：至尊传说
    "img_fight_lit_grading07",       -- 段位称号：最强王者
}

SeasonSportConst.SEASON_DANNAME       = {
    "txt_fight_grading01",       -- 段位称号：无敌青铜
    "txt_fight_grading02",       -- 段位称号：坚韧白银
    "txt_fight_grading03",       -- 段位称号：百炼黄金
    "txt_fight_grading04",       -- 段位称号：尊贵翡翠
    "txt_fight_grading05",       -- 段位称号：超凡大师
    "txt_fight_grading06",       -- 段位称号：至尊传说
    "txt_fight_grading07",       -- 段位称号：最强王者
}

SeasonSportConst.SEASON_STARPNG       = {
    "img_fight_0D",                 -- 星级：高亮
    "img_fight_09c",                -- 星级：暗黑
}

SeasonSportConst.SEASON_RANKCELL_BACK = {
    "img_large_ranking01",             -- 排行榜底条：1
    "img_large_ranking02",             -- 排行榜底条：2
    "img_large_ranking03",             -- 排行榜底条：3
    "img_com_board_list01a",         -- 排行榜底条：4
    "img_com_board_list01b",         -- 排行榜底条：5
}

SeasonSportConst.SEASON_RANK_BACK = {
    "icon_ranking01",            -- 排序底图：1
    "icon_ranking02",            -- 排序底图：2
    "icon_ranking03",            -- 排序底图：3
    "icon_ranking04",            -- 排序底图：4
}

SeasonSportConst.SEASON_RANK_SORTIMG = {
    "txt_ranking01",             -- 排序艺术字：1
    "txt_ranking02",             -- 排序艺术字：2
    "txt_ranking03",             -- 排序艺术字：3
}

SeasonSportConst.SEASON_REPORT_OWNBACK = {
    "img_rank01",                -- 我的战报底：1
    "img_rank02",                -- 我的战报底：2
    "img_rank03",                -- 我的战报底：3
    "img_rank04",                -- 我的战报底：4
    "img_rank05",                -- 我的战报底：5
}

SeasonSportConst.SEASON_REPORT_HUIZHNAG = {
	[1] = {"qingtong1", "qingtong2","qingtong1"}, -- 无敌青铜：（青铜无idle3用1替换
    [2] = {"baiyin1", "baiyin2", "baiyin3"},      -- 坚韧白银
    [3] = {"huangjin1", "huangjin2", "huangjin3"},-- 百炼黄金
    [4] = {"feicui1", "feicui2", "feicui3"},      -- 尊贵翡翠
    [5] = {"chaofan1", "chaofan2", "chaofan3"},   -- 超凡大师
    [6] = {"zhizun1", "zhizun2", "zhizun3"},      -- 至尊传说
    [7] = {"bazhu1", "bazhu2", "bazhu3"},         -- 最强王者
}

SeasonSportConst.SEASON_REPORT_RESOULT = {
    "txt_com_battle_v05",        -- 胜利
    "txt_com_battle_f05",        -- 失败
}

SeasonSportConst.SEASON_PET_SELECTEDEFFECT = {
    "effect_icon_liuguang",        -- 神兽选中特效：1.转圈
    "effect_taozhuang_orange",     -- 神兽选中特效：2.波光
}

SeasonSportConst.SEASON_STARPOS       = {
    cc.p(473, 428), cc.p(508, 470), cc.p(568, 489), cc.p(626, 470),cc.p(663, 428),
}

SeasonSportConst.SEASON_SILK_BINDPOS   = {
    cc.p(-463, -219), cc.p(-280, -219), cc.p(-94, -219), cc.p(91, -219),cc.p(274, -219),cc.p(459, -219)
}

return readOnly(SeasonSportConst)