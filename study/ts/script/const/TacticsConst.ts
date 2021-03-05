import { Path } from "../utils/Path";

export namespace TacticsConst {
	export const SLOT_MAX = 3;
	export const SUIT_TYPE_NONE = 0;
	export const SUIT_TYPE_JOINT = 996;
	export const SUIT_TYPE_FEMALE = 997;
	export const SUIT_TYPE_MALE = 998;
	export const SUIT_TYPE_ALL = 999;
	export const PARAM_UNLCOK_2 = 'tactics_2_unlock';
	export const PARAM_UNLCOK_3 = 'tactics_3_unlock';
	export const MAX_POSITION = 3;
	export const MAX_PROFICIENCY = 1000;
	export const GET_LIST_TYPE_ALL = 0;
	export const GET_LIST_TYPE_UNLCOK = 1;
	export const GET_LIST_TYPE_STUDIED = 2;
	export const ICON_COLOR_PATH_5 = Path.getUICommonFrame('img_tactis_kuang01');
	export const ICON_COLOR_PATH_6= Path.getUICommonFrame('img_tactis_kuang02');
	export const ICON_COLOR_PATH_7= Path.getUICommonFrame('img_tactis_kuang03');
	export const TOP_ITEM_COLOR_5= Path.getTacticsImage('img_tactis_title02a');
	export const TOP_ITEM_COLOR_6= Path.getTacticsImage('img_tactis_title02b');
	export const TOP_ITEM_COLOR_7= Path.getTacticsImage('img_tactis_title02c');
	export const TAB_COLOR_5_1= Path.getTacticsImage('bt_tactis_pinzhi01');
	export const TAB_COLOR_5_2= Path.getTacticsImage('bt_tactis_pinzhi01b');
	export const TAB_COLOR_6_1= Path.getTacticsImage('bt_tactis_pinzhi02');
	export const TAB_COLOR_6_2= Path.getTacticsImage('bt_tactis_pinzhi02b');
	export const TAB_COLOR_7_1= Path.getTacticsImage('bt_tactis_pinzhi03');
	export const TAB_COLOR_7_2 = Path.getTacticsImage('bt_tactis_pinzhi03b');
	export const UNLOCK_STATE_YES= Path.getTextTactics('txt_tactis_01');
	export const UNLOCK_STATE_NO= Path.getTextTactics('txt_tactis_02');
	export const UI_LIST_COL_NUM = 5;
	export const STATE_LOCK_LEVEL = 0;
	export const STATE_LOCK = 1;
	export const STATE_EMPTY = 2;
	export const STATE_WEARED = 3;
	export const CELLITEM_NUM = 5;
}