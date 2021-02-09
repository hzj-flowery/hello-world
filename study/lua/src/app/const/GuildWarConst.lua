--聊天常量
--@Author:Conley
local GuildWarConst = {}

GuildWarConst.MAP_MAX_ROLE_NUM = 90--地图上显示的最大角色数
GuildWarConst.MAP_RUN_MAP_PERCENT = 65
GuildWarConst.MAP_STAND_PERCENT = 35
GuildWarConst.MAP_MAX_AVATAR_NUM = 35--地图上显示的最大avatar数
GuildWarConst.ONCE_CREATE_ROLE_NUM = 5 -- 一次可创建角色数量
GuildWarConst.CREATE_ROLE_CD = 3000 -- 创建角色CD
GuildWarConst.INIT_CREATE_ROLE_NUM = 20 -- 初始可创建角色数量

GuildWarConst.STATUS_CLOSE = 1 --关闭期间
GuildWarConst.STATUS_STAGE_1 = 2--阶段一
GuildWarConst.STATUS_STAGE_2 = 3--阶段二


GuildWarConst.POINT_TYPE_CAMP_ATTACK = 1--进攻方出生地
GuildWarConst.POINT_TYPE_FORT = 2--普通据点
GuildWarConst.POINT_TYPE_GATE = 3--城门
GuildWarConst.POINT_TYPE_CRYSTAL = 4--龙柱
GuildWarConst.POINT_TYPE_CAMP_DEFENDER = 5--守方大本营
GuildWarConst.POINT_TYPE_EXIT = 6--出口


GuildWarConst.CAMP_TYPE_ATTACKER = 1--攻方
GuildWarConst.CAMP_TYPE_DEFENDER = 2--守方


GuildWarConst.BATTLE_RESULT_ATTACK_SUCCESS = 1
GuildWarConst.BATTLE_RESULT_ATTACK_FAIL = 2
GuildWarConst.BATTLE_RESULT_DEFENDER_SUCCESS = 3
GuildWarConst.BATTLE_RESULT_DEFENDER_FAIL = 4

GuildWarConst.AUCTION_REWARD_NUM = 10 --拍卖奖励数

GuildWarConst.SELF_SLOT_INDEX = 1 --自己的站位


GuildWarConst.PROTOCOL_DISPATCH_CD = 50 --协议执行CD时间
GuildWarConst.PROTOCOL_DISPATCH_NUM = 3 --协议一次可执行次数



return GuildWarConst
