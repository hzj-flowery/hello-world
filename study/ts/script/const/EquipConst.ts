export default class EquipConst {
    public static FLAG = 1

    //装备显示时获取范围的定义
    public static EQUIP_RANGE_TYPE_1 = 1 //全范围
    public static EQUIP_RANGE_TYPE_2 = 2 //阵位上的装备

    //装备培养方式的定义
    public static EQUIP_TRAIN_STRENGTHEN = 1 //强化
    public static EQUIP_TRAIN_REFINE = 2 //精炼
    public static EQUIP_TRAIN_JADE = 3 //装备玉石
    public static EQUIP_TRAIN_LIMIT = 4 // 界限突破

    public static EQUIP_TRAIN_MAX_TAB = 4 // 最大tab页签

    public static MAX_JADE_SLOT = 4

    //装备列表显示类型
    public static EQUIP_LIST_TYPE1 = 1 //装备
    public static EQUIP_LIST_TYPE2 = 2 //装备碎片

    public static MAX_LIMIT_UP_SUIT_ID = 3001



    public static JADE_SLOT_POS = {
        // 玉石槽的位置
        [1001]: {
            [1]: new cc.Vec2(288.25, 14.51),
            [2]: new cc.Vec2(-283.77, 9.94),
            [3]: new cc.Vec2(-225.46, 171.03),
            [4]: new cc.Vec2(-227.39, -150.20)
        },
        [2001]: {
            [1]: new cc.Vec2(288.25, 14.51),
            [2]: new cc.Vec2(-283.77, 9.94),
            [3]: new cc.Vec2(-225.46, 171.03),
            [4]: new cc.Vec2(-227.39, -150.20)
        },
        [3001]: {
            [1]: new cc.Vec2(288.25, 14.51),
            [2]: new cc.Vec2(-283.77, 9.94),
            [3]: new cc.Vec2(-225.46, 171.03),
            [4]: new cc.Vec2(-227.39, -150.20)
        }
    }

    // 装备槽资源
    public static EQUIPMENT_JADE_SLOT_BG = {
        [1001]: "img_jade04",
        [2001]: "img_jade06",
        [3001]: "img_jade8"
    }

    public static EQUIPMENT_JADE_SLOT_POS = {
        [1001]: {
            [1]: new cc.Vec2(0, 0),
            [2]: new cc.Vec2(0, 0),
            [3]: new cc.Vec2( -13, 0),
            [4]: new cc.Vec2(9, 0)
        },
        [2001]: {
            [1]: new cc.Vec2(-23, 0),
            [2]: new cc.Vec2(-23, 0),
            [3]: new cc.Vec2(-2, 0),
            [4]: new cc.Vec2(19, 0)
        },
        [3001]: {
            [1]: new cc.Vec2(-33, 0),
            [2]: new cc.Vec2(-11 , 0),
            [3]: new cc.Vec2(11 , 0),
            [4]: new cc.Vec2(33, 0)
        }
    }


}