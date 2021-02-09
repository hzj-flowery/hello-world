import { FunctionConst } from "./FunctionConst"

export namespace HistoryHeroConst {
    export const LIST_TYPE1 = 1;
    export const LIST_TYPE2 = 2;
    export const LIST_TYPE3 = 3;
    export const LIST_TYPE4 = 4;
    export const BREAK_STATE_0 = 0;
    export const BREAK_STATE_1 = 1;
    export const TAB_TYPE_HERO = 0;
    export const TAB_TYPE_DETAIL = 1;
    export const TAB_TYPE_AWAKE = 2;
    export const TAB_TYPE_BREAK = 3;
    export const TAB_TYPE_REBORN = 4;
    export const TYPE_EQUIP_0 = 0;
    export const TYPE_EQUIP_1 = 1;
    export const TYPE_EQUIP_2 = 2;
    export const QUALITY_PURPLE = 4;
    export const QUALITY_ORANGE = 5;
    export const DEFAULT_HISTORY_HERO_ID = 101;
    export const SQUADITEM_WIDTH = 90;
    export const EQUIPVIEW_OFFSETWIDTH = 470;
    export const TYPE_MAINICON = [
        FunctionConst.FUNC_HISTORY_FORMATION,
        FunctionConst.FUNC_HISTORY_WEAPON_LIST
    ];
    export const MAX_STEP_MATERIAL = 3;
    export const TYPE_BREAKTHROUGH_POS_1 = [cc.v2(0, 355)];
    export const TYPE_BREAKTHROUGH_POS_2 = [
        cc.v2(-93.5, 355),
        cc.v2(92, 355)
    ];
    export const TYPE_BREAKTHROUGH_POS_3 = [
        cc.v2(0, 355),
        cc.v2(-94, 335),
        cc.v2(94, 335)
    ];
    export const TYPE_BREAKTHROUGH_POS = {
        avalon: {
            open: cc.v2(417.35, -205.85),
            close: cc.v2(417.35, -113.9)
        },
        sword: {
            open: cc.v2(417.35, 26.25),
            close: cc.v2(417.35, -19.25)
        },
        icon1: {
            open: cc.v2(314.1, 82.85),
            close: cc.v2(314.1, 82.85)
        },
        icon2: {
            open: cc.v2(416.9, 103.25),
            close: cc.v2(416.9, 103.25)
        },
        icon3: {
            open: cc.v2(519.7, 82.85),
            close: cc.v2(519.7, 82.85)
        }
    };
};