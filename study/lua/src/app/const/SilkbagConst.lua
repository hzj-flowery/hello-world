local SilkbagConst = {}

SilkbagConst.STATE_LOCK = 1 --未解锁
SilkbagConst.STATE_OPEN = 2 --已解锁
SilkbagConst.STATE_WEAR = 3 --已装备

SilkbagConst.ALL_FEMALE_ID = 997 --使用所有女武将
SilkbagConst.ALL_MALE_ID = 998 --使用所有男武将
SilkbagConst.ALL_HERO_ID = 999 --约定silkbag表中，999代表适用所有武将

SilkbagConst.SLOT_MAX = 10 --位置最大数

SilkbagConst.SUIT_TYPE_NONE = 0 --适应类型，无
SilkbagConst.SUIT_TYPE_ALL = 1 --适应类型，全武将
SilkbagConst.SUIT_TYPE_MALE = 2 --适应类型，男武将
SilkbagConst.SUIT_TYPE_FEMALE = 3 --适应类型，女武将

SilkbagConst.ONLY_TYPE_0 = 0 --唯一类型，不唯一
SilkbagConst.ONLY_TYPE_1 = 1 --唯一类型，个人唯一
SilkbagConst.ONLY_TYPE_2 = 2 --唯一类型，阵容唯一

return readOnly(SilkbagConst)