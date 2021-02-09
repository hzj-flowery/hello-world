//
// Author: hedl
// Date: 2018-01-23 15:51:32
// 神兽常量

export default class PetConst {

    //神兽品质
    public static readonly QUALITY_WHITE = 1
    public static readonly QUALITY_GREEN = 2
    public static readonly QUALITY_BLUE = 3
    public static readonly QUALITY_PURPLE = 4
    public static readonly QUALITY_ORANGE = 5
    public static readonly QUALITY_RED = 6
    public static readonly QUALITY_GOLD = 7

    //神兽显示时获取范围的定义
    public static readonly PET_RANGE_TYPE_1 = 1 //全范围
    public static readonly PET_RANGE_TYPE_2 = 2 //上阵神兽
    public static readonly PET_RANGE_TYPE_3 = 3 //护佑神兽

    //神兽培养方式的定义
    public static readonly PET_TRAIN_UPGRADE = 1 //升级
    public static readonly PET_TRAIN_STAR = 2 //突破
    public static readonly PET_TRAIN_LIMIT = 3 // 界限

    public static readonly MAX_TRAIN_TAB = 3

    public static readonly LIMIT_SUB_STAR = 2  // 界限突破降星度

    //神兽列表显示类型
    public static readonly PET_LIST_TYPE1 = 1 //神兽
    public static readonly PET_LIST_TYPE2 = 2 //神兽碎片

    public static readonly PET_DLG_MAP_ADD = 1
    //神兽图鉴加成
    public static readonly PET_DLG_HELP_ADD = 2 //神兽护佑加成

    public static readonly START_INDEX = 4
    public static readonly SCROLL_SIZE = cc.size(1000, 1000) //外层圆的长宽
    public static readonly SCROLL_POSITION = new cc.Vec2(0, 0) //整个圆在屏幕中位置
    public static readonly CIRCLE = cc.size(485, 420) //椭圆的长轴，短轴

    //一个神兽
    public static readonly PET_INFO1 = {
        "1": {
            position: new cc.Vec2(500, 425),
            scale: 0.75, //神兽缩放
            zorder: 1, //层级
            imageScale: 1 //台子缩放
        }
    }

    //两个神兽
    public static readonly PET_INFO2 = {
        "1": {
            position: new cc.Vec2(225, 425),
            scale: 0.75,
            zorder: 1,
            imageScale: 1
        },
        "2": {
            position: new cc.Vec2(725, 425),
            scale: 0.75,
            zorder: 1,
            imageScale: 1
        }
    }

    //三个神兽
    public static readonly PET_INFO3 = {
        "1": {
            position: new cc.Vec2(120, 425),
            scale: 0.75,
            zorder: 3,
            imageScale: 0.9
        },
        "2": {
            position: new cc.Vec2(480, 425),
            scale: 0.75,
            zorder: 2,
            imageScale: 0.9
        },
        "3": {
            position: new cc.Vec2(860, 425),
            scale: 0.75,
            zorder: 1,
            imageScale: 0.9
        }
    }

    //四个神兽
    public static readonly PET_INFO4 = {
        "1": {
            position: new cc.Vec2(100, 520),
            scale: 0.7,
            zorder: 3,
            imageScale: 0.9
        },
        "2": {
            position: new cc.Vec2(450, 350),
            scale: 0.7,
            zorder: 4,
            imageScale: 1
        },
        "3": {
            position: new cc.Vec2(900, 410),
            scale: 0.7,
            zorder: 2,
            imageScale: 0.9
        },
        "4": {
            position: new cc.Vec2(550, 600),
            scale: 0.65,
            zorder: 1,
            imageScale: 0.75
        }
    }

    public static readonly PET_INFO5 = {
        ANGLE_CONTENT: [360, 80, 150, 220, 300], //5个角度位置
        ANGLE_OFFSET: -60, //角度偏移量
        CIRCLE: cc.size(350, 400), //椭圆的长轴，短轴
        SCROLL_POSITION: new cc.Vec2(0, -20), //整个圆在屏幕中位置
        START_INDEX: 4,
        SCROLL_SIZE: cc.size(1000, 1000), //外层圆的长宽
        SCALE_RANGE: new cc.Vec2(55, 90) //最低55% 过渡到 90%
    }

    public static readonly PET_INFO6 = {
        ANGLE_CONTENT: [80, 130, 170, 225, 305, 360], //6个角度位置
        ANGLE_OFFSET: -60, //角度偏移量
        CIRCLE: cc.size(350, 420), //椭圆的长轴，短轴
        SCROLL_POSITION: new cc.Vec2(0, -20), //整个圆在屏幕中位置
        START_INDEX: 4,
        SCROLL_SIZE: cc.size(1000, 1000), //外层圆的长宽
        SCALE_RANGE: new cc.Vec2(55, 90) //最低55% 过渡到 90%
    }

    public static readonly PET_INFO7 = {
        ANGLE_CONTENT: [70, 108, 153, 220, 265, 310, 380], //6个角度位置
        ANGLE_OFFSET: 0, //角度偏移量
        CIRCLE: cc.size(400, 420), //椭圆的长轴，短轴
        SCROLL_POSITION: new cc.Vec2(0, -30), //整个圆在屏幕中位置
        START_INDEX: 4,
        SCROLL_SIZE: cc.size(1000, 1000), //外层圆的长宽
        SCALE_RANGE: new cc.Vec2(50, 80)
    }

    public static readonly SCALE_RANGE = new cc.Vec2(40, 40)

    public static readonly SCROLL_AVATART_NUM = 4 // 当超过4个做旋转
    public static readonly SHOW_PET_NUM = 0
    public static readonly ANGLE_CONTENT = [72, 120, 175, 225, 290, 370] //6个角度位置
    public static readonly ANGLE_OFFSET = -60 //角度偏移量
    public static readonly MIDDLE_POSITION = new cc.Vec2(525, 480) //中间圆台位置

    public static readonly SCROLL_AVATAR_SCALE = 0.8 //周围旋转的宠物比例
    public static readonly MID_AVATAR_SCALE = 0.8 //中间神兽比例
}
