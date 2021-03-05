-- Author: Conley

local RollNoticeConst = {}


RollNoticeConst.NOTICE_TYPE_GM                 = 1 --gm公告
RollNoticeConst.NOTICE_TYPE_HERO_RANK          = 2 --神将突破
RollNoticeConst.NOTICE_TYPE_HERO_GET           = 3 --神将招募
RollNoticeConst.NOTICE_TYPE_REWARD_BOX         = 4 --黄金宝箱
RollNoticeConst.NOTICE_TYPE_ARENA              = 5 --竞技场
RollNoticeConst.NOTICE_TYPE_TERRITORY          = 6 --领地巡逻
RollNoticeConst.NOTICE_TYPE_EXPLORE            = 7 --游历董卓叛乱
RollNoticeConst.NOTICE_TYPE_WORLD_BOSS_GUILD   = 8 --世界boss军团第一
RollNoticeConst.NOTICE_TYPE_WORLD_BOSS_PLAYER  = 9 --世界BOSS个人第一



RollNoticeConst.ROLL_POSITION_ROLL_MSG = 1 --跑马灯
RollNoticeConst.ROLL_POSITION_CHAT_MSG = 2 --聊天消息

RollNoticeConst.NOTICE_COLOR_COLOR      = 0 -- 直接设置颜色
RollNoticeConst.NOTICE_COLOR_USER       = 1 -- 官衔等级颜色
RollNoticeConst.NOTICE_COLOR_HERO       = 2 -- 武将品质色颜色
RollNoticeConst.NOTICE_COLOR_EQUIPMENT  = 3 -- 装备品质色颜色
RollNoticeConst.NOTICE_IMG  = 4   -- 称号

RollNoticeConst.NOTICE_AVATAR_ACTIVITY_ID = 151  -- 变身卡走马灯ID

RollNoticeConst.NOTICE_CAMP_RACE_PRE_PASS = 504 --预赛出线的全服通告
RollNoticeConst.NOTICE_CAMP_RACE_GUILD_PRE_PASS = 505 --军团成员晋级决赛阶段
RollNoticeConst.NOTICE_CAMP_RACE_ROUND_2 = 506 --晋级四强全服通告
RollNoticeConst.NOTICE_CAMP_RACE_ROUND_3 = 507 --晋级决赛全服通告
RollNoticeConst.NOTICE_CAMP_RACE_ROUND_4 = 508 --决赛胜出全服通告
RollNoticeConst.NOTICE_CAMP_RACE_GUILD_ROUND_2 = 509 --晋级四强全服通告
RollNoticeConst.NOTICE_CAMP_RACE_GUILD_ROUND_3 = 510 --晋级决赛全服通告
RollNoticeConst.NOTICE_CAMP_RACE_GUILD_ROUND_4 = 511 --决赛胜出全服通告

RollNoticeConst.NOTICE_EQUIP_ACTIVITY_ID = 701  -- 割须弃袍走马灯ID
RollNoticeConst.NOTICE_PET_ACTIVITY_ID = 710  -- 观星走马灯ID
RollNoticeConst.NOTICE_HORSE_CONQUER_ACTIVITY_ID = 1200 --训马走马灯ID

return readOnly(RollNoticeConst)
