export namespace PackageViewConst {
	export const TAB_ITEM = 1;
	export const TAB_SILKBAG = 2;
	export const TAB_GEMSTONE = 3;
	export const TAB_EQUIPMENT = 4;
	export const TAB_TREASURE = 5;
	export const TAB_INSTRUMENT = 6;
	export const TAB_JADESTONE = 7;
	export const TAB_HISTORYHERO = 8;
	export const TAB_HISTORYHERO_WEAPON = 9;
	export const ITEM_TYPE_DROP = 1;
	export const ITEM_TYPE_BOX = 2;
	export const ITEM_TYPE_TOKEN = 3;
	export const ITEM_TYPE_REFINED_STONE = 4;
	export const ITEM_TYPE_DEMON = 5;
	export const ITEM_TYPE_WUJIANG_UPGRADE = 6;
	export const ITEM_TYPE_BAOWU_UPGARDE = 7;
	export const ITEM_TYPE_GOLD_BOX = 8;
	export const ITEM_TYPE_QINTMOB = 9;
	export const ITEM_TYPE_GOD_BEAST_UPGRADE = 10;
	export const ITEM_TYPE_RECHARGE = 11;
	export const ITEM_TYPE_ACTIVE_VIP_ICON = 12;
	export const ITEM_TYPE_QINTOMB_ADDTIME = 13;
	export const ITEM_TYPE_SHISHEN_BOX = 14;
	export const ITEM_TYPE_HOMELAND_BUFF = 15;
	export const ITEM_TYPE_GRAIN_BOX = 16;
	export const JADE_STONE_TOPBAR_RES = {
    [1]: {
        type: 5,
        value: 30
    },
    [2]: {
        type: 5,
        value: 2
    },
    [3]: {
        type: 5,
        value: 1
    }
};
    export const getItemTypeName = function (itemType) {
        for (var key in PackageViewConst) {
            var value = PackageViewConst[key];
            if (key.indexOf('ITEM_') != -1 && value == itemType) {
                return key;
            }
        }
        return '';
    };
};