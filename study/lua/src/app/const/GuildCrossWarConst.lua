-- Author: Panhoa
-- Date: 2018-12-05 15:51:32
-- 
local GuildCrossWarConst = {}

GuildCrossWarConst.CAMERA_SCALE_SMALL = 0.1666 --相机偏移
GuildCrossWarConst.AVATAR_MOVING_RATE   = 70   --移动速率
GuildCrossWarConst.DEFAULT_CARAME_POS   = 546  --默认相机点

-- Max Grid
GuildCrossWarConst.MAX_GRID_PATHFINDING   = 100  --最大寻路限制
GuildCrossWarConst.MAX_GRID_NUMSATK       = 2  --最大攻击格子
GuildCrossWarConst.CROSS_GRID_DISTANCE    = (2 ^ (1/2))  -- 顶对角距离
GuildCrossWarConst.CROSS_GRID_NUMS        = 25 --理论上可行走格子最大数目 


-- Guild CrossWar State
GuildCrossWarConst.ACTIVITY_STAGE_1 = 1 -- 集结阶段
GuildCrossWarConst.ACTIVITY_STAGE_2 = 2 -- PVE阶段/PVP阶段
GuildCrossWarConst.ACTIVITY_STAGE_3 = 3 -- 尚未开始（或已结束）

-- Attack Type
GuildCrossWarConst.ATTACK_TYPE_1 = 1   -- Boss
GuildCrossWarConst.ATTACK_TYPE_2 = 2   -- Person
GuildCrossWarConst.ATTACK_TYPE_3 = 3   -- City

-- Update Self
GuildCrossWarConst.SELF_ENTER = 1   -- 进入或重连
GuildCrossWarConst.SELF_MOVE  = 2   -- 移动
GuildCrossWarConst.SELF_FIGHT = 3   -- 战斗

-- Update Point
GuildCrossWarConst.UPDATE_BOSS  = 304   -- 击杀boss
GuildCrossWarConst.UPDATE_CITY1 = 302   -- 占领城池
GuildCrossWarConst.UPDATE_CITY2 = 303   -- 抢夺城池
GuildCrossWarConst.UPDATE_CITY3 = 1     -- 攻击城池
GuildCrossWarConst.UPDATE_CITY4 = 2     -- 军团驻扎

-- Avatar State
GuildCrossWarConst.UNIT_STATE_IDLE   = 0 -- 常  态
GuildCrossWarConst.UNIT_STATE_MOVING = 1 -- 移动态
GuildCrossWarConst.UNIT_STATE_CD     = 2 -- CD  态
GuildCrossWarConst.UNTI_STATE_PK     = 3 -- PK  态
GuildCrossWarConst.UNIT_STATE_DEATH  = 4 -- 死亡态,等待复活
GuildCrossWarConst.UNIT_ZORDER = 1000000

-- Boss State
GuildCrossWarConst.BOSS_STATE_IDLE   = 0 -- 常  态
GuildCrossWarConst.BOSS_STATE_PK     = 1 -- PK  态
GuildCrossWarConst.BOSS_STATE_DEATH  = 2 -- 死亡态

-- Attack Type
GuildCrossWarConst.GUILD_CROSS_ATKTARGET_TYPE1  = 1 -- Boss
GuildCrossWarConst.GUILD_CROSS_ATKTARGET_TYPE2  = 2 -- User

-- Update Player
GuildCrossWarConst.UPDATE_ACTION_0     = 0 -- 0. 移动据点
GuildCrossWarConst.UPDATE_ACTION_1     = 1 -- 1. 复活回到原始点
GuildCrossWarConst.UPDATE_ACTION_2     = 2 -- 2. 血量更新
GuildCrossWarConst.UPDATE_ACTION_3     = 3 -- 3. 出生据点有人进来

GuildCrossWarConst.GRID_SIZE          = 120 --格子大小

GuildCrossWarConst.DST_SCALE                   = 1          --最终放大值
GuildCrossWarConst.SCALE_VALUE_PER_PIXEL       = 0.1 / 250 --成员每像素缩放值
GuildCrossWarConst.X_POS_SCALE_VALUE_PER_PIXEL = 0.1 / 250 --成员X间距每像素缩放值
GuildCrossWarConst.Y_POS_SCALE_VALUE_PER_PIXEL = 0.1 / 300 --成员Y间距每像素缩放值
GuildCrossWarConst.MAP_WIDTH                   = 1800
GuildCrossWarConst.MAP_MIN_HEIGHT              = 640
GuildCrossWarConst.MAP_TAI_HEIGHT              = 440       -- 底图高度
GuildCrossWarConst.FIRST_ENTER_BOTTOM_BOAT_TO_SCREEN_DISTANCE = 190--第一次进来最底部船到屏幕距离



GuildCrossWarConst.BOSS_AVATAR_INFO_POS = cc.p(0, 60) 
GuildCrossWarConst.BOSS_AVATAR_DISTANCE = 5    --攻击间距

GuildCrossWarConst.ENEMYLISTVIEW_POS = {
    336.5,
    250,
}
GuildCrossWarConst.ENEMYLISTVIEW_SIZE = {       -- 对战列表listView
    cc.size(256, 336),
    cc.size(256, 250)
}


GuildCrossWarConst.GUILD_LADDER_CELL_BG = {     -- 军团排行背景条
    "img_com_dark_board_bg01",
    "img_com_dark_board_bg01c",
}

GuildCrossWarConst.PERSONNAL_LADDER_CELL_BG = {  -- 个人排行榜底
    "img_com_ranking04",
    "img_com_ranking05",
}

GuildCrossWarConst.GUILD_LADDER_RANKNUM = {      -- 军团排行序
    "img_qizhi01",
    "img_qizhi02",
    "img_qizhi03",
    "img_qizhi04",
}

GuildCrossWarConst.GUILD_OBSERVER_BG = {           -- 排行榜底条/奖励底条
    "img_guild_cross_war_btn0",
    "img_guild_cross_war_btn1",
}


GuildCrossWarConst.GUESS_GUILD_OBSERVER_PANELPOS = {           -- 观战位置
    {cc.p(227.75, -230), cc.p(79.25, -230), cc.p(376.25, -230)},    
    {cc.p(153.5, -230), cc.p(302, -230), cc.p(5, -230), cc.p(450.5, -230)},    
}


return readOnly(GuildCrossWarConst)