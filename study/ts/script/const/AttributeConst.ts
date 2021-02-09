export default class AttributeConst {
    public static readonly ATK = 1 //攻击
    public static readonly PA = 2 //物攻
    public static readonly MA = 3 //法攻
    public static readonly DEF = 4 //防御
    public static readonly PD = 5 //物防
    public static readonly MD = 6 //法防
    public static readonly HP = 7 //生命
    public static readonly ATK_PER = 8 //攻击加成
    public static readonly PA_PER = 9 //物攻加成
    public static readonly MA_PER = 10 //法攻加成
    public static readonly DEF_PER = 11 //防御加成
    public static readonly PD_PER = 12 //物防加成
    public static readonly MD_PER = 13 //法防加成
    public static readonly HP_PER = 14 //生命加成
    public static readonly CRIT = 15 //暴击率
    public static readonly NO_CRIT = 16 //抗暴率
    public static readonly HIT = 17 //命中率
    public static readonly NO_HIT = 18 //闪避率
    public static readonly HURT = 19 //伤害加成
    public static readonly HURT_RED = 20 //伤害减免
    public static readonly CRIT_HURT = 21 //暴击伤害
    public static readonly CRIT_HURT_RED = 22 //暴伤减免
    public static readonly ANGER = 23 //初始怒气
    public static readonly ANGER_RECOVER = 24 //怒气回复
    public static readonly RESIST_WEI = 25 //抗魏
    public static readonly RESIST_SHU = 26 //抗蜀
    public static readonly RESIST_WU = 27 //抗吴
    public static readonly RESIST_QUN = 28 //抗群
    public static readonly BREAK_WEI = 29 //破魏
    public static readonly BREAK_SHU = 30 //破蜀
    public static readonly BREAK_WU = 31 //破吴
    public static readonly BREAK_QUN = 32 //破群
    public static readonly PARRY = 33 //格挡率
    public static readonly PARRY_BREAK = 34 //抗格率
    public static readonly SELF_CURE = 35 //自愈
    public static readonly VAMPIRE = 36 //吸血
    public static readonly ANTI_VAMPIRE = 37 //吸血抗性
    public static readonly POISON_DMG = 38 //中毒增伤
    public static readonly POISON_DMG_RED = 39 //中毒减伤
    public static readonly FIRE_DMG = 40 //灼烧增伤
    public static readonly FIRE_DMG_RED = 41 //灼烧减伤
    public static readonly HEAL_PER = 42 //治疗率
    public static readonly BE_HEALED_PER = 43 //被治疗率
    public static readonly HEAL = 44 //治疗量
    public static readonly BE_HEALED = 45 //被治疗量
    public static readonly PVP_HURT = 46 //pvp增伤
    public static readonly PVP_HURT_RED = 47 //pvp减伤
    public static readonly ATK_FINAL = 48 //攻击（不参加加成计算）
    public static readonly PD_FINAL = 49 //物防（不参加加成计算）
    public static readonly MD_FINAL = 50 //法防（不参加加成计算）
    public static readonly HP_FINAL = 51 //生命（不参加加成计算）
    public static readonly TALENT_POWER = 101 //天赋战力
    public static readonly OFFICAL_POWER = 102 //官衔战力

    public static readonly PET_BLESS_RATE = 103 // 护佑百分比
    public static readonly PET_ALL_ATTR = 104 //神兽全属性
    public static readonly ALL_COMBAT = 105 //总战力
    public static readonly AVATAR_POWER = 106 //变身卡图鉴战力
    public static readonly PET_POWER = 107 //神兽图鉴战力
    public static readonly SILKBAG_POWER = 108 //锦囊战力
    public static readonly AVATAR_EQUIP_POWER = 109 //变身卡战力
    public static readonly PET_EXTEND_POWER = 110 //神兽假战力
    public static readonly HOMELAND_POWER = 113 //神树战力
    public static readonly HORSE_POWER = 114 //战马战力
    public static readonly JADE_POWER = 115   // 玉石战力
    public static readonly HISTORICAL_HERO_POWER = 116;
	public static readonly TACTICS_POWER = 117;
	public static readonly BOUT_POWER = 118;
    //值的类型
    public static readonly TYPE_1 = 1 //绝对值
    public static readonly TYPE_2 = 2 //百分比

    //属性加成映射表
    //说明：1攻击对应8攻击加成
    public static readonly MAPPING = {
        1: 8,
        2: 9,
        3: 10,
        4: 11,
        5: 12,
        6: 13,
        7: 14,
    }

    //防御特殊处理
    public static readonly DEF_MAPPING = {
        4: [5, 6], 		//“防御”值会对应成“物防”和“法防”
        11: [12, 13], 	//“防御加成”会对应成“物防加成”和“法防加成”
    }

    //特殊属性对应
    public static readonly SPECIAL_MAPPING = {
        48: 1,
        49: 5,
        50: 6,
        51: 7,
    }
}