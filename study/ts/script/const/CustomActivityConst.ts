import {Color} from '../utils/Color'
export namespace CustomActivityConst {
    export const STATE_NOT_START = 0;
	export const STATE_ING = 1;
	export const STATE_AWARD_ING = 2;
	export const STATE_AWARD_END = 3;
	export const STATE_PREVIEW = 4;
	export const CUSTOM_QUEST_USER_DATA_SOURCE_DEFAULT = 1;
	export const CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL = 2;
	export const REWARD_TYPE_ALL = 1;
	export const REWARD_TYPE_SELECT = 2;
	export const MAX_ITEM_NUM = 4;
	export const ACT_ICON_TYPE_1 = 1;
	export const ACT_BUTTON_TYPE_RECEIVE_GRAY = 0;
	export const ACT_BUTTON_TYPE_GO_RECHARGE = 1;
	export const CUSTOM_ACTIVITY_TYPE_PUSH = 1;
	export const CUSTOM_ACTIVITY_TYPE_WEAL = 2;
	export const CUSTOM_ACTIVITY_TYPE_SELL = 3;
	export const CUSTOM_ACTIVITY_TYPE_PAY = 4;
	export const CUSTOM_ACTIVITY_TYPE_AVATAR = 5;
	export const CUSTOM_ACTIVITY_TYPE_EQUIP = 6;
	export const CUSTOM_ACTIVITY_TYPE_PET = 7;
	export const CUSTOM_ACTIVITY_TYPE_DROP = 8;
	export const CUSTOM_ACTIVITY_TYPE_DROP_SHOW = 9;
	export const CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE = 10;
	export const CUSTOM_ACTIVITY_TYPE_FUNDS = 11;
	export const CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER = 12;
	export const CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT = 13;
	export const CUSTOM_ACTIVITY_TYPE_TEN_JADE_AUCTION = 16;
	export const CUSTOM_ACTIVITY_TYPE_RETURN_SERVER_GIFT = 17;
	export const CUSTOM_QUEST_TYPE_PUSH_CHAPTER = 101;
	export const CUSTOM_QUEST_TYPE_PUSH_ECHAPTER = 102;
	export const CUSTOM_QUEST_TYPE_PUSH_LOGIN = 103;
	export const CUSTOM_QUEST_TYPE_PUSH_LEVEL = 104;
	export const CUSTOM_QUEST_TYPE_PUSH_VIP_LEVEL = 105;
	export const CUSTOM_QUEST_TYPE_PUSH_ARENA = 106;
	export const CUSTOM_QUEST_TYPE_PUSH_EXPLORE = 107;
	export const CUSTOM_QUEST_TYPE_PUSH_ITEM = 108;
	export const CUSTOM_QUEST_TYPE_PUSH_KILL_DEVIL = 109;
	export const CUSTOM_QUEST_TYPE_PUSH_DEVIL = 110;
	export const CUSTOM_QUEST_TYPE_PUSH_RECRUIT = 111;
	export const CUSTOM_QUEST_TYPE_PUSH_TOWER = 112;
	export const CUSTOM_QUEST_TYPE_GUILD_ACT = 113;
	export const CUSTOM_QUEST_TYPE_DAILY_SCORE = 114;
	export const CUSTOM_QUEST_TYPE_RESET_GUILD_ACT = 115;
	export const CUSTOM_QUEST_TYPE_WEAL_ARENA_REPUTATION = 201;
	export const CUSTOM_QUEST_TYPE_WEAL_HERO_DROW = 202;
	export const CUSTOM_QUEST_TYPE_WEAL_HERO_SHOP = 203;
	export const CUSTOM_QUEST_TYPE_WEAL_STAGE_MAIN = 204;
	export const CUSTOM_QUEST_TYPE_WEAL_STAGE_TOWER = 205;
	export const CUSTOM_QUEST_TYPE_WEAL_STAGE_DAILY = 206;
	export const CUSTOM_QUEST_TYPE_WEAL_STAGE_BOSS = 207;
	export const CUSTOM_QUEST_TYPE_WEAL_TERRITORY = 208;
	export const CUSTOM_QUEST_TYPE_WEAL_REBEL = 209;
	export const CUSTOM_QUEST_TYPE_WEAL_REBEL_COST = 210;
	export const CUSTOM_QUEST_TYPE_WEAL_SHOP_MUST = 211;
	export const CUSTOM_QUEST_TYPE_SELL_EXCHANGE = 301;
	export const CUSTOM_QUEST_TYPE_YUBI_EXCHANGE = 302;
	export const CUSTOM_QUEST_TYPE_PAY_TOTAL_RECHARGE = 401;
	export const CUSTOM_QUEST_TYPE_PAY_TOTAL_CONSUME = 402;
	export const CUSTOM_QUEST_TYPE_PAY_DAILY_RECHARGE = 403;
	export const CUSTOM_QUEST_TYPE_PAY_SINGLE_RECHARGE = 404;
	export const CUSTOM_QUEST_TYPE_PAY_DAILY_CONSUME = 405;
	export const CUSTOM_QUEST_TYPE_PAY_CONSTANT_RECHARGE = 406;
	export const CUSTOM_QUEST_TYPE_PAY_SELL_ITEM = 407;
	export const CUSTOM_QUEST_TYPE_YUBI_GIFT = 408;
	export const CUSTOM_QUEST_TYPE_DROP = 801;
	export const CUSTOM_QUEST_TYPE_DROP_MAIL = 802;
	export const EQUIP_DRAW_TYPE_1 = 1;
	export const EQUIP_DRAW_TYPE_2 = 2;
	export const PET_DRAW_TYPE_1 = 1;
	export const PET_DRAW_TYPE_2 = 2;
	export const HORSE_CONQUER_TYPE_1 = 1;
	export const HORSE_CONQUER_TYPE_2 = 2;
	export const QUEST_LIMIT_TYPE_RECHARGE = 1;
	export const QUEST_LIMIT_TYPE_RECHARGE2 = 3;
	export const USER_QUEST_DATA_K_RECHARGE = 2;
	export const QUEST_LIMIT_YUBI_COST_NUM = 4;
	export const QUEST_LIMIT_YUBI_COST_AND_OPENDAY = 5;
	export const FUNDS_ONEDAY_TIME = 86400;
	export const FUNDS_MONTHITEMNUM = 7;
	export const FUNDS_WEEKITEMNUM_MAX = 4;
	export const FUNDS_WEEKITEMNUM_NORAML = 3;
	export const FUNDS_WEEKITEMNUM_SPECIAL = 2;
	export const FUNDS_TYPE_WEEK = 1101;
	export const FUNDS_TYPE_MONTH = 1102;
	export const FUNDS_TYPE_WEEKV2 = 1103;
	export const FUNDS_WEEK_PANELPOSITIONY = 404.65;
	export const FUNDS_WEEK_LISTPOSITIONY = 361;
	export const FUNDS_WEEK_FIRSTFLAGOFPOSITIONY = 265;
	export const FUNDS_WEEK_SPECIALFLAGOFPOSITIONY = 281;
	export const THREEKINDOMS_LINKED_AWARDSWIDTH = 100.5;
	export const RECEIVED_OR_NOT = [
    Color.THREEKINDOMS_LINKED_REWARD,
    Color.THREEKINDOMS_LINKED_REWARDED
];
	export const FUNDS_BACKGROUND = [
    'img_activity_zhoujijin',
    'img_activity_yuejijin_biaoti'
];
	export const FUNDS_YUANBAO = [
    'img_activity_gexiqipao_zhoujijin06',
    'img_activity_gexiqipao_zhoujijin07'
];
	export const FUNDS_V2_DAY = [
    'img_activity_gexiqipao_zhoujijin01',
    'img_activity_gexiqipao_zhoujijin02',
    'img_activity_gexiqipao_zhoujijin03',
    'img_activity_gexiqipao_zhoujijin04',
    'img_activity_gexiqipao_zhoujijin05',
    'img_activity_gexiqipao_zhoujijin06',
    'img_activity_gexiqipao_zhoujijin07'
];
};