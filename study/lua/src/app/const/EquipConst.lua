--
-- Author: Liangxu
-- Date: 2017-05-27 15:54:26
-- 装备常量
local EquipConst = {}

EquipConst.FLAG = 1

--装备显示时获取范围的定义
EquipConst.EQUIP_RANGE_TYPE_1 = 1 --全范围
EquipConst.EQUIP_RANGE_TYPE_2 = 2 --阵位上的装备

--装备培养方式的定义
EquipConst.EQUIP_TRAIN_STRENGTHEN = 1 --强化
EquipConst.EQUIP_TRAIN_REFINE = 2 --精炼
EquipConst.EQUIP_TRAIN_JADE = 3 --装备玉石
EquipConst.EQUIP_TRAIN_LIMIT = 4 -- 界限突破

EquipConst.EQUIP_TRAIN_MAX_TAB = 4 -- 最大tab页签

EquipConst.MAX_JADE_SLOT = 4

--装备列表显示类型
EquipConst.EQUIP_LIST_TYPE1 = 1 --装备
EquipConst.EQUIP_LIST_TYPE2 = 2 --装备碎片

EquipConst.MAX_LIMIT_UP_SUIT_ID = 3001

EquipConst.JADE_SLOT_POS = {
    -- 玉石槽的位置
    [1001] = {
        [1] = cc.p(288.25, 14.51),
        [2] = cc.p(-283.77, 9.94),
        [3] = cc.p(-225.46, 171.03),
        [4] = cc.p(-227.39, -150.20)
    },
    [2001] = {
        [1] = cc.p(288.25, 14.51),
        [2] = cc.p(-283.77, 9.94),
        [3] = cc.p(-225.46, 171.03),
        [4] = cc.p(-227.39, -150.20)
    },
    [3001] = {
        [1] = cc.p(288.25, 14.51),
        [2] = cc.p(-283.77, 9.94),
        [3] = cc.p(-225.46, 171.03),
        [4] = cc.p(-227.39, -150.20)
    }
}

-- 装备槽资源
EquipConst.EQUIPMENT_JADE_SLOT_BG = {
    [1001] = "img_jade04",
    [2001] = "img_jade06",
    [3001] = "img_jade8"
}

EquipConst.EQUIPMENT_JADE_SLOT_POS = {
    [1001] = {
        [1] = cc.p(0, 0),
        [2] = cc.p(0, 0),
        [3] = cc.p(12, 12),
        [4] = cc.p(34, 12)
    },
    [2001] = {
        [1] = cc.p(12, 12),
        [2] = cc.p(12, 12),
        [3] = cc.p(33, 12),
        [4] = cc.p(54, 12)
    },
    [3001] = {
        [1] = cc.p(12, 12),
        [2] = cc.p(34, 12),
        [3] = cc.p(55, 12),
        [4] = cc.p(76, 12)
    }
}

return readOnly(EquipConst)
