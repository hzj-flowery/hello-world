import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "./ConfigNameConst";

namespace  TreasureConst {
    export const FLAG = 2;
    export const TREASURE_RANGE_TYPE_1 = 1;
    export const TREASURE_RANGE_TYPE_2 = 2;
    export const TREASURE_TRAIN_STRENGTHEN = 1;
    export const TREASURE_TRAIN_REFINE = 2;
    export const TREASURE_TRAIN_JADE = 3;
    export const TREASURE_TRAIN_LIMIT = 4;
    export const TREASURE_LIST_TYPE1 = 1;
    export const TREASURE_LIST_TYPE2 = 2;
    export const TREASURE_LIMIT_COST_KEY_1 = 1;
    export const TREASURE_LIMIT_COST_KEY_2 = 2;
    export const TREASURE_LIMIT_COST_KEY_3 = 3;
    export const TREASURE_LIMIT_COST_KEY_4 = 4;
    export const TREASURE_TRAIN_MAX_TAB = 4;
    export const TREASURE_LIMIT_RED_LEVEL = 1;
    export const TREASURE_LIMIT_GOLD_LEVEL = 2;
    export const TREASURE_LIMIT_UP_BASE_LEVEL = TreasureConst.TREASURE_LIMIT_RED_LEVEL;
    export const TREASURE_LIMIT_UP_MAX_LEVEL = TreasureConst.TREASURE_LIMIT_GOLD_LEVEL;
    export const MAX_JADE_SLOT = 4;
    export const getAddStrLevelByLimit = function () {
        var num = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(480).content;
        return parseInt(num);
    };
    export const getAddRefineLevelByLimit = function () {
        var num = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(481).content;
        return parseInt(num);
    };
    export const TREASURE_JADE_SLOT_BG = {
        [5]: 'img_jade04',
        [6]: 'img_jade06',
        [7]: 'img_jade8'
    };
    export const TREASURE_JADE_SLOT_POS = {
        [5]: {
            [1]: cc.v2(12, 12),
            [2]: cc.v2(34, 12),
            [3]: cc.v2(12, 12),
            [4]: cc.v2(34, 12)
        },
        [6]: {
            [1]: cc.v2(12, 12),
            [2]: cc.v2(12, 12),
            [3]: cc.v2(33, 12),
            [4]: cc.v2(54, 12)
        },
        [7]: {
            [1]: cc.v2(-32, 0),
            [2]: cc.v2(-10, 0),
            [3]: cc.v2(10, 0),
            [4]: cc.v2(32, 0)
        }
    };
};

export default TreasureConst;