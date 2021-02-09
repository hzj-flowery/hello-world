import { Path } from "../utils/Path";

export namespace ShopConst {
	export const NORMAL_SHOP = 1;
	export const EQUIP_SHOP = 2;
	export const INSTRUMENT_SHOP = 3;
	export const ARENA_SHOP = 4;
	export const GUILD_SHOP = 5;
	export const HERO_SHOP = 6;
	export const TREASURE_SHOP = 7;
	export const AVATAR_SHOP = 13;
	export const SUIT_SHOP = 14;
	export const PET_SHOP = 15;
	export const AWAKE_SHOP = 16;
	export const LOOKSTAR_SHOP = 17;
	export const HORSE_SHOP = 18;
	export const SEASOON_SHOP = 19;
	export const HORSE_CONQUER_SHOP = 21;
	export const CAKE_ACTIVE_SHOP = 22;
	export const ALL_SERVER_GOLDHERO_SHOP = 24;
	export const RED_PET_SHOP = 25;
	export const UNIVERSE_RACE_SHOP = 26;
	export const NORMAL_SHOP_SUB_MONEY = 99;
	export const EQUIP_SHOP_SUB_AWARD = 4;
	export const ARENA_SHOP_SUB_AWARD = 3;
	export const ARENA_SHOP_SUB_ITEM = 1;
	export const GUILD_SHOP_SUB_ITEM1 = 2;
	export const GUILD_SHOP_SUB_ITEM2 = 2;
	export const GUILD_SHOP_SUB_ITEM3 = 3;
	export const GUILD_SHOP_SUB_ITEM4 = 4;
	export const GUILD_SHOP_SUB_ITEM5 = 5;
	export const GUILD_SHOP_SUB_ITEM6 = 6;
	export const AWARK_SHOP_SUB_ITEM1 = 1;
	export const AWARK_SHOP_SUB_ITEM2 = 2;
	export const AWARK_SHOP_SUB_ITEM3 = 3;
	export const AWARK_SHOP_SUB_ITEM4 = 4;
	export const REFRESH_TYPE_FREE = 1;
	export const REFRESH_TYPE_TOKEN = 2;
	export const REFRESH_TYPE_RES = 3;
	export const LIMIT_TYPE_STAR = 1;
	export const LIMIT_TYPE_AREA = 2;
	export const LIMIT_TYPE_GROUP_LEVEL = 3;
	export const LIMIT_TYPE_EXPLORE = 4;
	export const LIMIT_TYPE_HARD_ELITE = 5;
	export const LIMIT_TYPE_TREE = 8;
	export const DEFAULT_SHOP_ENTRANCE = 1;
	export const CRYSTAL_SHOP_ENTRANCE = 2;
	export const SHOP_TYPE_FIX = 0;
	export const SHOP_TYPE_RANDOM = 1;
	export const SHOP_TYPE_ACTIVE = 2;
	export const PRICE_TYPE_AND = 1;
	export const PRICE_TYPE_OR = 2;
	export const SHOW_CONTORL_ALL = 0;
	export const SHOW_CONTORL_NO_APPSTORE = 1;
	export const SHOW_CONTORL_APPSTORE = 2;
	export const TABL_TYPE_DEFAULT = 0;
	export const TABL_TYPE_NEW = 1;
	export const SHOP_FIX_LIMIT_RICE = 111;
	export const SHOP_FIX_LIMIT_ATKCMD = 112;
	export const SHOP_FIX_VIEW_BG = {
    [ShopConst.TABL_TYPE_DEFAULT]: Path.getCommonImage('img_com_board01_large_bg02'),
    [ShopConst.TABL_TYPE_NEW]: Path.getShopBG('shop_bj')
};
	export const SHOP_FIX_VIEW_CELL = {
    [ShopConst.TABL_TYPE_DEFAULT]: "app.scene.view.shop.ShopViewItemCell",
    [ShopConst.TABL_TYPE_NEW]: "app.scene.view.shop.ShopViewItemCell2"
};
	export const SHOP_FIX_VEWI_CELL_ITEM_COUNT = {
    [ShopConst.TABL_TYPE_DEFAULT]: 2,
    [ShopConst.TABL_TYPE_NEW]: 4
};
};