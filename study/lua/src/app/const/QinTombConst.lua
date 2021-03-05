--
-- Author: hedl
-- Date: 2018-01-23 15:51:32
-- 秦皇陵
local QinTombConst = {}

QinTombConst.POINT_TYPE_REBORN = 1 --重生点
QinTombConst.POINT_TYPE_ROAD = 2 --路径点

QinTombConst.CAMERA_SCALE_MIN = 0.2 --相机偏移
QinTombConst.CAMERA_SCALE_MAX = 5 --放大4倍

QinTombConst.TEAM_STATE_IDLE = 0 --等待状态
QinTombConst.TEAM_STATE_MOVING = 1
QinTombConst.TEAM_STATE_HOOK =2 --挂机状态
QinTombConst.TEAM_STATE_PK  = 3 -- pk状态
QinTombConst.TEAM_STATE_DEATH = 4 --死亡状态,等待复活

--怪物状态
QinTombConst.MONSTER_STATE_IDLE = 0
QinTombConst.MONSTER_STATE_NONE = 1
QinTombConst.MONSTER_STATE_HOOK = 2
QinTombConst.MONSTER_STATE_PK   = 3
QinTombConst.MONSTER_STATE_DEATH = 4

QinTombConst.TEAM_SMALL_MAP_POS= {
    [1] = cc.p(0,0),
    [2] = cc.p(-8,-6),
    [3] = cc.p(7,-6),
} -- pk状态

--休息时，人与人之间间隔位置
QinTombConst.TEAM_AVATAR_IDLE_POS = {
    [1] = cc.p(0,0),
    [2] = cc.p(-40,40),
    [3] = cc.p(40,40)

}
--跑步时，人与人之间间隔位置
QinTombConst.TEAM_AVATAR_RUN_POS = {
    [1] = cc.p(0,0),
    [2] = cc.p(-40,40),
    [3] = cc.p(40,40)

}
--怪物血条名称等节点高度
QinTombConst.MONSTER_AVATAR_INFO_POS = cc.p(0,60) 
--PK状态双剑的高度
QinTombConst.TEAM_PK_EFFECT_HEIGHT = 160

--战斗结果显示时间
QinTombConst.TEAM_BATTLE_RESULT_SHOW_TIME = 3


QinTombConst.TEAM_BATTLE_RESULT = {
    [1] = cc.size(444,66),
    [2] = cc.size(444,126),
    [3] = cc.size(444,181),
}

QinTombConst.TEAM_BATTLE_RESULT_TEXT = {
    [1] = cc.p(222,150),
    [2] = cc.p(222,118),
    [3] = cc.p(222,91),
}

QinTombConst.TEAM_ZORDER_NAME = 100500
QinTombConst.TEAM_ZORDER = 100000
return readOnly(QinTombConst)