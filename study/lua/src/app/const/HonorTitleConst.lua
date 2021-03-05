-- @Author panhao
-- @Date 7.13.2018
-- @Role HonorTitleConst

local HonorTitleConst = {}

HonorTitleConst.TITLE_HONOR = 1 -- 用于聊天系统的title

HonorTitleConst.TOP_TEN = 1 -- 十大战力
HonorTitleConst.TOP_SHU = 2 -- 蜀国竞技王
HonorTitleConst.TOP_WEI = 3 -- 魏国竞技王
HonorTitleConst.TOP_WU = 4 -- 吴国竞技王
HonorTitleConst.TOP_QUN = 5 -- 群雄竞技王

HonorTitleConst.ACTIVITY_TYPE_ALL = 1 -- 十大战力活动
HonorTitleConst.ACTIVITY_TYPE_BATTLE = 2 -- 竞技活动

HonorTitleConst.TIME_TYPE_LIMIT = 1 --有时间限制的称号
HonorTitleConst.TIME_TYPE_PERMANENT = 2 --永久称号

HonorTitleConst.TITLE_UNLOAD_ID = 0

HonorTitleConst.CONFIG_INDEX_POS = 1 -- 位置
HonorTitleConst.CONFIG_INDEX_SCALE = 2 --缩放
HonorTitleConst.CONFIG_INDEX_EFFECT = 3 -- 特效
HonorTitleConst.CONFIG_INDEX_OFFSET = 4 -- 偏移

HonorTitleConst.TITLE_CONFIG = {
    -- 位置 缩放 是否播放特效 配置偏移是否生效(矿战、军团boss/三国战记、跑马、先秦皇陵)
    ["ArenaHeroAvatar"] = {cc.p(25, 255), 1, true, false}, -- 竞技场
    ["MineCraftView"] = {cc.p(5, 130), 0.8, true, true}, -- 矿战自己
    ["WorldBossAvatar"] = {cc.p(15, 230), 1, true, true}, -- 军团boss
    ["CrossWorldBossPlayerAvatarNode"] = {cc.p(5, 160), 0.6, true, true}, -- 军团boss
    ["RunningManAvatar"] = {cc.p(-5, 155), 0.7, true, false}, -- 华容道
    ["CountryBossUserAvatar"] = {cc.p(15, 230), 1, true, true}, -- 三国战纪
    ["GroupHeroNode"] = {cc.p(-5, 265), 0.8, true, false}, -- 皇陵组队界面
    ["QinTombAvatar"] = {cc.p(15, 192), 0.8, true, true}, -- 皇陵打怪界面
    ["CommonMainHeroNode"] = {cc.p(0, 220), 0.8, true, false}, -- 主界面
    ["MineMoveAvatar"] = {cc.p(5, 270), 1.6, true, true}, -- 矿战别人
    ["ChatMsgItemCell"] = {cc.p(0, 0), 0.67, false, false}, -- 聊天
    ["ChatMiniMsgItemCell"] = {cc.p(0, 0), 0.48, false, false}, -- 主界面黑框
    ["ChatPrivateMsgItemCell"] = {cc.p(0, 0), 0.7, false, false}, -- 私聊
    ["PopupHonorTitleItemCell"] = {cc.p(0, 0), 1, true, false}, -- 称号界面
    ["ComplexRankItemCell"] = {cc.p(0, 0), 0.75, true, false}, -- 排行榜
    ["PopupPlayerDetail"] = {cc.p(-21, 0), 0.9, true, false}, -- 玩家信息界面
    ["GuildTrainTeamNode"] = {cc.p(0, 175), 0.7, true, false}, -- 军团演武界面
    ["CommonTitle"] = {cc.p(4, 0), 1, true, false} -- 军团演武界面
}

return HonorTitleConst
