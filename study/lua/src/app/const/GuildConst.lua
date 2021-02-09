--
-- Author: Liangxu
-- Date: 2017-06-23 15:57:29
-- 军团常量
local GuildConst = {}

--职位
GuildConst.GUILD_POSITION_1 = 1 --团长
GuildConst.GUILD_POSITION_2 = 2 --副团长
GuildConst.GUILD_POSITION_3 = 3 --长老
GuildConst.GUILD_POSITION_4 = 4 --成员

--权限
GuildConst.GUILD_JURISDICTION_1 = 1 --解散军团
GuildConst.GUILD_JURISDICTION_2 = 2 --退出军团
GuildConst.GUILD_JURISDICTION_3 = 3 --任命权限
GuildConst.GUILD_JURISDICTION_4 = 4 --革职权限
GuildConst.GUILD_JURISDICTION_5 = 5 --开除权限
GuildConst.GUILD_JURISDICTION_6 = 6 --审批权限
GuildConst.GUILD_JURISDICTION_7 = 7 --设置公告
GuildConst.GUILD_JURISDICTION_8 = 8 --设置宣言
GuildConst.GUILD_JURISDICTION_9 = 9 --弹劾团长
GuildConst.GUILD_JURISDICTION_10 = 10 --军团改名
GuildConst.GUILD_JURISDICTION_11 = 11 --军团邮件
GuildConst.GUILD_JURISDICTION_14 = 14 --军团旗帜
GuildConst.GUILD_JURISDICTION_15 = 15 --军团宣战

--申请\取消加入军团操作
GuildConst.GUILD_APPLY_OP1 = 1 --申请
GuildConst.GUILD_APPLY_OP2 = 2 --取消申请

--审核入会申请操作
GuildConst.GUILD_CHECK_APPLICATION_OP1 = 1 --允许
GuildConst.GUILD_CHECK_APPLICATION_OP2 = 2 --拒绝

--公告\宣言类型
GuildConst.GUILD_MESSAGE_TYPE_1 = 1 --公告
GuildConst.GUILD_MESSAGE_TYPE_2 = 2 --宣言

-- 1：未发出 2:已领取 3：位领取
GuildConst.GUILD_RED_PACKET_NO_SEND = 1 --未发出
GuildConst.GUILD_RED_PACKET_NO_RECEIVE = 3 --未领取
GuildConst.GUILD_RED_PACKET_RECEIVED = 2 --已领取
GuildConst.GUILD_RED_PACKET_INVALID = 4 --已经失效

GuildConst.CITY_HALL_ID = 1
--军团大厅
GuildConst.CITY_HELP_ID = 2
--军团援助
GuildConst.CITY_SHOP_ID = 3
--军团商店
GuildConst.CITY_SUMMERHOUSE_ID = 4
--军团亭子
GuildConst.CITY_BOSS_ID = 5
--军团BOSS
GuildConst.CITY_CONTRIBUTION_ID = 6
--军团祈福
GuildConst.CITY_EQUIP_ID = 7
--军团装备
GuildConst.CITY_DUNGEON_ID = 8
--军团副本
GuildConst.CITY_GUILD_WAR_ID = 10
--军团战

GuildConst.GUILD_NAME_MIN_LENGTH = 2 -- 军团名字最小长度
GuildConst.GUILD_NAME_MAX_LENGTH = 6
--军团名字最大长度

GuildConst.RED_PACKET_TYPE_OF_NOT_GUILDS = {
    [99] = true,
    [100] = true
} --非军团红包TYPE

return readOnly(GuildConst)
