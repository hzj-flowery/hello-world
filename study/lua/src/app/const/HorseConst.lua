local HorseConst = {}

HorseConst.FLAG = 4
HorseConst.FLAG_EQUIP = 5           --战马装备标识

--战马显示时获取范围的定义
HorseConst.HORSE_RANGE_TYPE_1 = 1 --全范围
HorseConst.HORSE_RANGE_TYPE_2 = 2 --阵位上的战马

--战马装备显示时获取范围的定义
HorseConst.HORSE_EQUIP_RANGE_TYPE_1 = 1 --全范围
HorseConst.HORSE_EQUIP_RANGE_TYPE_2 = 2 --阵位上的战马装备

--战马列表显示类型
HorseConst.HORSE_LIST_TYPE1 = 1 --战马
HorseConst.HORSE_LIST_TYPE2 = 2 --战马碎片
HorseConst.HORSE_LIST_TYPE3 = 3 --战马装备
HorseConst.HORSE_LIST_TYPE4 = 4 --战马装备碎片

--战马升星最大级
HorseConst.HORSE_STAR_MAX = 3

HorseConst.ALL_HERO_ID = 999 --约定horse表中，999代表适用所有武将

HorseConst.JUDGE_COST_COUNT_1 = 1 --相马消耗数量1
HorseConst.JUDGE_COST_COUNT_2 = 5 --相马消耗数量2

HorseConst.HORSE_PHOTO_UNVALID = 0  --图鉴不可激活
HorseConst.HORSE_PHOTO_VALID   = 1  --图鉴可激活
HorseConst.HORSE_PHOTO_DONE    = 2  --图鉴已激活

-- 战马装备类别个数
HorseConst.HORSE_EQUIP_TYPE_NUM = 3

HorseConst.DETAIL_WIDTH     = 342
HorseConst.LABEL_X          = 10
HorseConst.LABEL_TITLE_SIZE     = 26
HorseConst.LABEL_DETAIL_SIZE    = 18

return readOnly(HorseConst)