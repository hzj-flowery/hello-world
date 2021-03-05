--拍卖数据常量
local BullectScreenConst = {}

BullectScreenConst.TYPE_UNIFORM = 1 -- 匀速运动类型
BullectScreenConst.TYPE_RIGHT_FADEIN_UNIFORM = 2 -- 右边快速淡入然后匀速运动
BullectScreenConst.TYOE_RIGHT_FADEIN_UNIFORM_LEFT_FADEOUT = 3 -- 右边快速淡入然后匀速运动一定时间后快速淡出
BullectScreenConst.TYPE_RIGHT_UNIFORM_LEFT_FADEOUT = 4 -- 右边匀速进入运行一定时间后快速淡出
BullectScreenConst.TYPE_MIDDLE = 5 --中间弹出往上移动的动画

--弹幕出现延迟时间，随即范围 0 - 5秒
BullectScreenConst.SHOW_MIN = 0--
BullectScreenConst.SHOW_MAX = 5

-- 弹幕类型
BullectScreenConst.SHOWTYPE_MOVETO_LEFT  = 1    -- 1. 从右往左飘
BullectScreenConst.SHOWTYPE_POPUP_CENTER = 2    -- 2. 从中间弹出


--世界boss，角色移动速度

--1。角色冲过去攻击，并消失，在回到屏幕中
BullectScreenConst.AVATAR_GA_MOVE_TIME = 1.5--角色冲过去移动时间
BullectScreenConst.AVATAR_GA_DELAY = 0.5--消失特效延迟时间
BullectScreenConst.AVATAR_GA_MOVE_BACK_TIME =1--角色从屏幕边缘进入移动时间

BullectScreenConst.AVATAR_ATTACK_ACITON = 0.3--攻击动作结束时间

--2。角色突然出现，攻击boss，并消失
BullectScreenConst.AVATAR_IM_DELAY = 0.5--消失特效延迟时间

BullectScreenConst.AVATAR_IM_MOVE_TIME = 1.5--角色冲过去移动时间

BullectScreenConst.AVATAR_BOSS_HIT = 0.4--boss受击动作播放时间
BullectScreenConst.AVATAR_BOSS_HIT_FINISH = 2--boss受击动作结束时间

BullectScreenConst.MOVE_TO_BOSS_OFFSET = 60--boss最终点X偏移量
BullectScreenConst.MOVE_TO_BOSS_OFFSETX = cc.p(-25,25)--BOSS最终点X范围随即
BullectScreenConst.MOVE_TO_BOSS_OFFSETY = cc.p(-15,15)--BOSS最终点Y范围随即
BullectScreenConst.ATTACK_NAME = "attack" --攻击动作名称
BullectScreenConst.ATTACK_NAME_NO_ATTACK = "idle" --没有攻击时候的动作名字


BullectScreenConst.WORLD_BOSS_TYPE = 1 --世界boss类型
BullectScreenConst.COUNTRY_BOSS_TYPE = 2 --三国战记类型
BullectScreenConst.GUILD_WAR_TYPE = 4 --军团战
BullectScreenConst.GACHA_GOLDENHERO_TYPE = 5 --金将招募
BullectScreenConst.GUILDCROSSWAR_TYPE = 6 --跨服军团战
BullectScreenConst.GRAIN_CAR_TYPE = 7 --暗度陈仓
BullectScreenConst.CROSS_BOSS_NORMAL_ATTACK = 8 --跨服boss普通攻击
BullectScreenConst.CROSS_BOSS_CHARGE_ATTACK = 9 --跨服boss蓄力攻击
BullectScreenConst.UNIVERSE_RACE_TYPE = 10 --真武战神

BullectScreenConst.COLOR_TYPE_4     = 4    -- 紫色     
BullectScreenConst.COLOR_TYPE_5     = 5    -- 橙色
BullectScreenConst.COLOR_TYPE_6     = 6    -- 红色
BullectScreenConst.COLOR_TYPE_7     = 7    -- 金色


BullectScreenConst.BULLET_ID_GUILD_WAR_GATE_DEMOLISH = 108 --军团战攻破城门弹幕ID
BullectScreenConst.BULLET_ID_GUILD_WAR_CRYSTAL_DEMOLISH = 109 --军团战攻破龙柱弹幕ID

return BullectScreenConst
