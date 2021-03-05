export default class HorseConst {
    public static readonly FLAG = 4
    public static readonly FLAG_EQUIP = 5           //战马装备标识

    //战马显示时获取范围的定义
    public static readonly HORSE_RANGE_TYPE_1 = 1 //全范围
    public static readonly HORSE_RANGE_TYPE_2 = 2 //阵位上的战马

    //战马装备显示时获取范围的定义
    public static readonly HORSE_EQUIP_RANGE_TYPE_1 = 1 //全范围
    public static readonly HORSE_EQUIP_RANGE_TYPE_2 = 2 //阵位上的战马装备

    //战马列表显示类型
    public static readonly HORSE_LIST_TYPE1 = 1 //战马
    public static readonly HORSE_LIST_TYPE2 = 2 //战马碎片
    public static readonly HORSE_LIST_TYPE3 = 3 //战马装备
    public static readonly HORSE_LIST_TYPE4 = 4 //战马装备碎片

    //战马升星最大级
    public static readonly HORSE_STAR_MAX = 3

    public static readonly ALL_HERO_ID = 999 //约定horse表中，999代表适用所有武将

    public static readonly JUDGE_COST_COUNT_1 = 1 //相马消耗数量1
    public static readonly JUDGE_COST_COUNT_2 = 5 //相马消耗数量2

    public static readonly HORSE_PHOTO_UNVALID = 0  //图鉴不可激活
    public static readonly HORSE_PHOTO_VALID = 1  //图鉴可激活
    public static readonly HORSE_PHOTO_DONE = 2  //图鉴已激活

    // 战马装备类别个数
    public static readonly HORSE_EQUIP_TYPE_NUM = 3

    public static readonly DETAIL_WIDTH = 342
    public static readonly LABEL_X = 10
    public static readonly LABEL_TITLE_SIZE = 26
    public static readonly LABEL_DETAIL_SIZE = 18
}