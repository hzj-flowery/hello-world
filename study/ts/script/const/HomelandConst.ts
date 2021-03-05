import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { DataConst } from "./DataConst";
import { assert } from "../utils/GlobleFunc";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "./ConfigNameConst";

export namespace HomelandConst {
    export const HOMELAND_TREE_DEFAULT_LEVEL = 1;
    export const SHOW_ALL_BUFF = 1;
    export const SHOW_ONE_BUFF = 2;
    export const SELF_TREE = 1;
    export const FRIEND_TREE = 2;
    export const DLG_MAIN_TREE = 1;
    export const DLG_SUB_TREE = 2;
    export const DLG_FRIEND_MAIN_TREE = 3;
    export const DLG_FRIEND_SUB_TREE = 4;
    export const MAIN_TREE_POSITION = cc.v2(0, 0);
    export const MAX_SUB_TREE = 6;
    export const MAX_SUB_TREE_TYPE6 = 6;
    export const SUB_TREE_POSITION = {
        [1]: cc.v2(0, 0),
        [2]: cc.v2(0, 0),
        [3]: cc.v2(0, 0),
        [4]: cc.v2(0, 0),
        [5]: cc.v2(0, 0),
        [6]: cc.v2(0, 0)
    };
    export const TREE_BUFF_TYPE_1 = 1;
    export const TREE_BUFF_TYPE_2 = 2;
    export const TREE_BUFF_TYPE_3 = 3;
    export const TREE_BUFF_IDS = {
        TREE_BUFF_ID_1: 1,
        TREE_BUFF_ID_4: 4,
        TREE_BUFF_ID_5: 5,
        TREE_BUFF_ID_7: 7,
        TREE_BUFF_ID_8: 8,
        TREE_BUFF_ID_9: 9,
        TREE_BUFF_ID_10: 10,
        TREE_BUFF_ID_11: 11,
        TREE_BUFF_ID_12: 12,
        TREE_BUFF_ID_13: 13,
        TREE_BUFF_ID_14: 14,
        TREE_BUFF_ID_15: 15,
        TREE_BUFF_ID_16: 16,
        TREE_BUFF_ID_17: 17,
        TREE_BUFF_ID_18: 18,
        TREE_BUFF_ID_19: 19,
        TREE_BUFF_ID_20: 20,
        TREE_BUFF_ID_23: 23,
        TREE_BUFF_ID_24: 24
    };
    export const TREE_BUFF_DELAY_TIP = {
        [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_5]: true,
        [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_7]: true,
        [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_13]: true,
        [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_14]: true,
        [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_15]: true,
        [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_20]: true,
        [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24]: true
    };
    export let TREE_BUFF_BASE_ID_MAP = {
        [5]: {
            [DataConst.RES_ARMY_FOOD]: HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_18,
            [DataConst.RES_MINE_TOKEN]: HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_19
        },
        [6]: { [DataConst.ITEM_SUPPORT_TICKET]: HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_16 }
    };
    export const getBuffBaseId = function (type, value) {
        var typeInfo = HomelandConst.TREE_BUFF_BASE_ID_MAP[type] || {};
        var buffBaseId = typeInfo[value];
        return buffBaseId;
    };
    export const getBuffKeyWithBaseId = function (baseId) {
        var key = null;
        for (var k in HomelandConst.TREE_BUFF_IDS) {
            var id = HomelandConst.TREE_BUFF_IDS[k];
            if (id == baseId) {
                var y = k;
                break;
            }
        }
        assert(key, ('HomelandConst.TREE_BUFF_IDS can not 	export const id = %d'));
        return key;
    };
    export const getUnlockPrayLevel = function () {
        var Config = G_ConfigLoader.getConfig(ConfigNameConst.TREE_INFO);
        var len = Config.length();
        for (var i = 0; i < len; i++) {
            var info = Config.indexOf(i);
            if (info.prayer_times > 0) {
                return info.id;
            }
        }
        return 0;
    };
    export const isDelayShowTip = function (buffBaseId) {
        if (HomelandConst.TREE_BUFF_DELAY_TIP[buffBaseId] == true) {
            return true;
        } else {
            return false;
        }
    };
}