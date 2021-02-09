--
-- Author: Liangxu
-- Date: 2017-07-11 13:38:06
-- 属性常量
local AttributeConst = {}

AttributeConst.ATK = 1 --攻击
AttributeConst.PA = 2 --物攻
AttributeConst.MA = 3 --法攻
AttributeConst.DEF = 4 --防御
AttributeConst.PD = 5 --物防
AttributeConst.MD = 6 --法防
AttributeConst.HP = 7 --生命
AttributeConst.ATK_PER = 8 --攻击加成
AttributeConst.PA_PER = 9 --物攻加成
AttributeConst.MA_PER = 10 --法攻加成
AttributeConst.DEF_PER = 11 --防御加成
AttributeConst.PD_PER = 12 --物防加成
AttributeConst.MD_PER = 13 --法防加成
AttributeConst.HP_PER = 14 --生命加成
AttributeConst.CRIT = 15 --暴击率
AttributeConst.NO_CRIT = 16 --抗暴率
AttributeConst.HIT = 17 --命中率
AttributeConst.NO_HIT = 18 --闪避率
AttributeConst.HURT = 19 --伤害加成
AttributeConst.HURT_RED = 20 --伤害减免
AttributeConst.CRIT_HURT = 21 --暴击伤害
AttributeConst.CRIT_HURT_RED = 22 --暴伤减免
AttributeConst.ANGER = 23 --初始怒气
AttributeConst.ANGER_RECOVER = 24 --怒气回复
AttributeConst.RESIST_WEI = 25 --抗魏
AttributeConst.RESIST_SHU = 26 --抗蜀
AttributeConst.RESIST_WU = 27 --抗吴
AttributeConst.RESIST_QUN = 28 --抗群
AttributeConst.BREAK_WEI = 29 --破魏
AttributeConst.BREAK_SHU = 30 --破蜀
AttributeConst.BREAK_WU = 31 --破吴
AttributeConst.BREAK_QUN = 32 --破群
AttributeConst.PARRY = 33 --格挡率
AttributeConst.PARRY_BREAK = 34 --抗格率
AttributeConst.SELF_CURE = 35 --自愈
AttributeConst.VAMPIRE = 36 --吸血
AttributeConst.ANTI_VAMPIRE = 37 --吸血抗性
AttributeConst.POISON_DMG = 38 --中毒增伤
AttributeConst.POISON_DMG_RED = 39 --中毒减伤
AttributeConst.FIRE_DMG = 40 --灼烧增伤
AttributeConst.FIRE_DMG_RED = 41 --灼烧减伤
AttributeConst.HEAL_PER = 42 --治疗率
AttributeConst.BE_HEALED_PER = 43 --被治疗率
AttributeConst.HEAL = 44 --治疗量
AttributeConst.BE_HEALED = 45 --被治疗量
AttributeConst.PVP_HURT = 46 --pvp增伤
AttributeConst.PVP_HURT_RED = 47 --pvp减伤
AttributeConst.ATK_FINAL = 48 --攻击（不参加加成计算）
AttributeConst.PD_FINAL = 49 --物防（不参加加成计算）
AttributeConst.MD_FINAL = 50 --法防（不参加加成计算）
AttributeConst.HP_FINAL = 51 --生命（不参加加成计算）
AttributeConst.TALENT_POWER = 101 --天赋战力
AttributeConst.OFFICAL_POWER = 102 --官衔战力

AttributeConst.PET_BLESS_RATE = 103 -- 护佑百分比
AttributeConst.PET_ALL_ATTR = 104 --神兽全属性
AttributeConst.ALL_COMBAT = 105 --总战力
AttributeConst.AVATAR_POWER = 106 --变身卡图鉴战力
AttributeConst.PET_POWER = 107 --神兽图鉴战力
AttributeConst.SILKBAG_POWER = 108 --锦囊战力
AttributeConst.AVATAR_EQUIP_POWER = 109 --变身卡战力
AttributeConst.PET_EXTEND_POWER = 110 --神兽假战力
AttributeConst.HOMELAND_POWER = 113 --神树战力
AttributeConst.HORSE_POWER = 114 --战马战力
AttributeConst.JADE_POWER = 115   -- 玉石战力
AttributeConst.HISTORICAL_HERO_POWER = 116   -- 历代名将战力
AttributeConst.TACTICS_POWER = 117   -- 战法战力
AttributeConst.BOUT_POWER = 118 -- 阵法战力
--值的类型
AttributeConst.TYPE_1 = 1 --绝对值
AttributeConst.TYPE_2 = 2 --百分比

--属性加成映射表
--说明：1攻击对应8攻击加成
AttributeConst.MAPPING = {
	[1] = 8,
	[2] = 9,
	[3] = 10,
	[4] = 11,
	[5] = 12,
	[6] = 13,
	[7] = 14,
}

--防御特殊处理
AttributeConst.DEF_MAPPING = {
	[4] = {5, 6}, 		--“防御”值会对应成“物防”和“法防”
	[11] = {12, 13}, 	--“防御加成”会对应成“物防加成”和“法防加成”
}

--特殊属性对应
AttributeConst.SPECIAL_MAPPING = {
	[48] = 1,
	[49] = 5,
	[50] = 6,
	[51] = 7,
}

return readOnly(AttributeConst)