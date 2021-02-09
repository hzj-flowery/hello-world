--
-- Author: hedl
-- Date: 2018-01-23 15:51:32
-- 神兽常量
local PetConst = {}

--神兽品质
PetConst.QUALITY_WHITE  = 1
PetConst.QUALITY_GREEN  = 2
PetConst.QUALITY_BLUE   = 3
PetConst.QUALITY_PURPLE = 4
PetConst.QUALITY_ORANGE = 5
PetConst.QUALITY_RED    = 6
PetConst.QUALITY_GOLD   = 7

--神兽显示时获取范围的定义
PetConst.PET_RANGE_TYPE_1 = 1 --全范围
PetConst.PET_RANGE_TYPE_2 = 2 --上阵神兽
PetConst.PET_RANGE_TYPE_3 = 3 --护佑神兽

--神兽培养方式的定义
PetConst.PET_TRAIN_UPGRADE = 1 --升级
PetConst.PET_TRAIN_STAR = 2 --突破
PetConst.PET_TRAIN_LIMIT = 3 -- 界限

PetConst.MAX_TRAIN_TAB = 3

PetConst.LIMIT_SUB_STAR = 2  -- 界限突破降星度

--神兽列表显示类型
PetConst.PET_LIST_TYPE1 = 1 --神兽
PetConst.PET_LIST_TYPE2 = 2 --神兽碎片

PetConst.PET_DLG_MAP_ADD = 1
--神兽图鉴加成
PetConst.PET_DLG_HELP_ADD = 2 --神兽护佑加成

PetConst.START_INDEX = 4
PetConst.SCROLL_SIZE = cc.size(1000, 1000) --外层圆的长宽
PetConst.SCROLL_POSITION = cc.p(0, 0) --整个圆在屏幕中位置
PetConst.CIRCLE = cc.size(485, 420) --椭圆的长轴，短轴

--一个神兽
PetConst.PET_INFO1 = {
    [1] = {
        position = cc.p(500, 425),
        scale = 0.75, --神兽缩放
        zorder = 1, --层级
        imageScale = 1 --台子缩放
    }
}

--两个神兽
PetConst.PET_INFO2 = {
    [1] = {
        position = cc.p(225, 425),
        scale = 0.75,
        zorder = 1,
        imageScale = 1
    },
    [2] = {
        position = cc.p(725, 425),
        scale = 0.75,
        zorder = 1,
        imageScale = 1
    }
}

--三个神兽
PetConst.PET_INFO3 = {
    [1] = {
        position = cc.p(120, 425),
        scale = 0.75,
        zorder = 3,
        imageScale = 0.9
    },
    [2] = {
        position = cc.p(480, 425),
        scale = 0.75,
        zorder = 2,
        imageScale = 0.9
    },
    [3] = {
        position = cc.p(860, 425),
        scale = 0.75,
        zorder = 1,
        imageScale = 0.9
    }
}

--四个神兽
PetConst.PET_INFO4 = {
    [1] = {
        position = cc.p(100, 520),
        scale = 0.7,
        zorder = 3,
        imageScale = 0.9
    },
    [2] = {
        position = cc.p(450, 350),
        scale = 0.7,
        zorder = 4,
        imageScale = 1
    },
    [3] = {
        position = cc.p(900, 410),
        scale = 0.7,
        zorder = 2,
        imageScale = 0.9
    },
    [4] = {
        position = cc.p(550, 600),
        scale = 0.65,
        zorder = 1,
        imageScale = 0.75
    }
}

PetConst.PET_INFO5 = {
    ANGLE_CONTENT = {360, 80, 150, 220, 300}, --5个角度位置
    ANGLE_OFFSET = -60, --角度偏移量
    CIRCLE = cc.size(350, 400), --椭圆的长轴，短轴
    SCROLL_POSITION = cc.p(0, -20), --整个圆在屏幕中位置
    START_INDEX = 4,
    SCROLL_SIZE = cc.size(1000, 1000), --外层圆的长宽
    SCALE_RANGE = cc.p(55, 90) --最低55% 过渡到 90%
}

PetConst.PET_INFO6 = {
    ANGLE_CONTENT = {80, 130, 170, 225, 305, 360}, --6个角度位置
    ANGLE_OFFSET = -60, --角度偏移量
    CIRCLE = cc.size(350, 420), --椭圆的长轴，短轴
    SCROLL_POSITION = cc.p(0, -20), --整个圆在屏幕中位置
    START_INDEX = 4,
    SCROLL_SIZE = cc.size(1000, 1000), --外层圆的长宽
    SCALE_RANGE = cc.p(55, 90) --最低55% 过渡到 90%
}

PetConst.PET_INFO7 = {
    ANGLE_CONTENT = {70, 108, 153, 220, 265, 310, 380}, --6个角度位置
    ANGLE_OFFSET = 0, --角度偏移量
    CIRCLE = cc.size(400, 420), --椭圆的长轴，短轴
    SCROLL_POSITION = cc.p(0, -30), --整个圆在屏幕中位置
    START_INDEX = 4,
    SCROLL_SIZE = cc.size(1000, 1000), --外层圆的长宽
    SCALE_RANGE = cc.p(50, 80)
}

PetConst.SCALE_RANGE = cc.p(40, 40)

PetConst.SCROLL_AVATART_NUM = 4 -- 当超过4个做旋转
PetConst.SHOW_PET_NUM = 0
PetConst.ANGLE_CONTENT = {72, 120, 175, 225, 290, 370} --6个角度位置
PetConst.ANGLE_OFFSET = -60 --角度偏移量
PetConst.MIDDLE_POSITION = cc.p(525, 480) --中间圆台位置

PetConst.SCROLL_AVATAR_SCALE = 0.8 --周围旋转的宠物比例
PetConst.MID_AVATAR_SCALE = 0.8 --中间神兽比例
return readOnly(PetConst)
