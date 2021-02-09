import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { DataConst } from "./DataConst";

export namespace TopBarStyleConst {
    export const STYLE_MAIN = 1;
    export const STYLE_COMMON = 2;
    export const STYLE_PVE = 3;
    export const STYLE_PVP = 4;
    export const STYLE_ACTIVITY = 5;
    export const STYLE_ARENA = 6;
    export const STYLE_DRAW_CARD = 7;
    export const STYLE_EXPLORE = 8;
    export const STYLE_GUILD = 9;
    export const STYLE_TOWER = 10;
    export const STYLE_CRYSTAL_SHOP = 11;
    export const STYLE_MINE_CRAFT = 12;
    export const STYLE_HOMELAND = 13;
    export const STYLE_TRANSFORM_HERO = 14;
    export const STYLE_TRANSFORM_TREASURE = 15;
    export const STYLE_TRANSFORM_HERO_RED = 16;
    export const STYLE_SEASONSPORT = 17;
    export const STYLE_RUNNING_MAN = 18;
    export const STYLE_HORSE = 19;
    export const STYLE_SERVER_ANSWER = 20;
    export const STYLE_TRANSFORM_INSTRUMENT = 21;
    export const STYLE_GOLD_TRAIN = 22;
    export const STYLE_GOLD_GACHA = 23;
    export const STYLE_QINTOMB = 24;
    export const STYLE_CAKE_ACTIVITY = 25;
    export const STYLE_HANDBOOK = 26;
    export const STYLE_TRANSFORM_HERO_GOLD = 27;
    export const STYLE_SYNTHESIS_TYPE1 = 28;
    export const STYLE_SYNTHESIS_TYPE2 = 29;
    export const STYLE_SYNTHESIS_TYPE3 = 30;
    export const STYLE_CARNIVAL_ACTIVITY = 31;
    export const STYLE_HISTORY_HERO = 32;
    export const STYLE_COMMON2 = 33;
    export const STYLE_MAIN2 = 34;
    export const STYLE_TEN_JADE_AUCTION = 35;
    export const STYLE_RED_PET_ACTIVITY = 36;
    export const STYLE_END = 37;
    export const BG_TYPE_COMMON = 1;
    export const BG_TYPE_STAGE = 2;
    export const STYLE_VALUE = {};
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_MAIN] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_VIT
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        },
        [4]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_MAIN2] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_VIT
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        },
        [4]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        },
        [5]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_JADE2
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_COMMON] = {
        [1]: {
            type: TypeConvertHelper.TYPE_POWER,
            value: DataConst.RES_POWER
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_COMMON2] = {
        [1]: {
            type: TypeConvertHelper.TYPE_POWER,
            value: DataConst.RES_POWER
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        },
        [4]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_JADE2
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_GOLD_TRAIN] = {
        [1]: {
            type: TypeConvertHelper.TYPE_POWER,
            value: DataConst.RES_POWER
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_PVE] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_VIT
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_PVP] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_SPIRIT
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_ACTIVITY] = {
        [1]: {
            type: TypeConvertHelper.TYPE_POWER,
            value: DataConst.RES_POWER
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_ARENA] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_MANNA
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_DRAW_CARD] = {
        [1]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_RECRUIT_TOKEN
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_RECRUIT_GOLD_TOKEN
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_EXPLORE] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_SPIRIT
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_GUILD] = {
        [1]: {
            type: TypeConvertHelper.TYPE_POWER,
            value: DataConst.RES_POWER
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GONGXIAN
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TOWER] = {
        [1]: {
            type: TypeConvertHelper.TYPE_POWER,
            value: DataConst.RES_POWER
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_JADE
        },
        [3]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_EQUIP_STONE
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_CRYSTAL_SHOP] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_CRYSTAL_SHOP_COIN
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_SUPPORT_TICKET
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_MINE_CRAFT] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_MINE_TOKEN
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_ARMY_FOOD
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_HOMELAND] = {
        [1]: {
            type: TypeConvertHelper.TYPE_POWER,
            value: DataConst.RES_POWER
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_PET
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_HERO] = {
        [1]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM_TOKEN
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_TREASURE] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_INSTRUMENT] = {
        [1]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM_RED
        },
        [3]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM_GOLD
        },
        [4]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_HERO_RED] = {
        [1]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM_RED
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM_RED_TOKEN
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_RUNNING_MAN] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: 0,
            value: 0
        },
        [3]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_SUPPORT_TICKET
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_HORSE] = {
        [1]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_HORSE_CLASSICS
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_HORSE_WHISTLE
        },
        [3]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_HORSE_WHISTLE_FRAGMENT
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SEASONSPORT] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: 0,
            value: 0
        },
        [3]: {
            type: 0,
            value: 0
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SERVER_ANSWER] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: 0,
            value: 0
        },
        [3]: {
            type: 0,
            value: 0
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_GOLD_GACHA] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: 0,
            value: 0
        },
        [3]: {
            type: 0,
            value: 0
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_QINTOMB] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: 0,
            value: 0
        },
        [3]: {
            type: 0,
            value: 0
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_CAKE_ACTIVITY] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_CONTRIBUTION
        },
        [2]: {
            type: 0,
            value: 0
        },
        [3]: {
            type: 0,
            value: 0
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_HANDBOOK] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: 0,
            value: 0
        },
        [3]: {
            type: 0,
            value: 0
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TRANSFORM_HERO_GOLD] = {
        [1]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM_GOLD
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM_GOLD_TOKEN
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SYNTHESIS_TYPE1] = {
        [1]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_OFFICE_SEAL_6
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_OFFICE_SEAL_7
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SYNTHESIS_TYPE2] = {
        [1]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM_GOLD
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TRANSFORM_GOLD_TOKEN
        },
        [3]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_SYNTHESIS_TYPE3] = {
        [1]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TREE_1
        },
        [2]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TREE_2
        },
        [3]: {
            type: TypeConvertHelper.TYPE_ITEM,
            value: DataConst.ITEM_TREE_3
        },
        [4]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_GOLD
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_CARNIVAL_ACTIVITY] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_JADE2
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_HISTORY_HERO] = {
        [1]: {
            type: 0,
            value: 0
        },
        [2]: {
            type: 0,
            value: 0
        },
        [3]: {
            type: 0,
            value: 0
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_TEN_JADE_AUCTION] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_JADE2
        }
    };
    TopBarStyleConst.STYLE_VALUE[TopBarStyleConst.STYLE_RED_PET_ACTIVITY] = {
        [1]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_DIAMOND
        },
        [2]: {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_JADE2
        }
    };
    export const getStyleValue = function (styleType) {
        if (styleType && styleType >= TopBarStyleConst.STYLE_MAIN && styleType <= TopBarStyleConst.STYLE_END) {
            return TopBarStyleConst.STYLE_VALUE[styleType];
        }
        return null;
    };
};