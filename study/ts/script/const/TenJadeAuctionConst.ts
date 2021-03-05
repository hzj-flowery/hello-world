import { Lang } from "../lang/Lang";

export namespace TenJadeAuctionConst {
	export const OPEN_COUNT_DOWN = 1;
	export const EXTEND_START_TIME = 2;
	export const EXTEND_TIME = 3;
	export const ENTRANCE_OPEN_TIME = 6;
	export const SHOW_ICON_START = 11;
	export const PHASE_DEFAULT = 0;
	export const PHASE_SHOW = 1;
	export const PHASE_ITEM_SHOW = 2;
	export const PHASE_START = 3;
	export const PHASE_END = 4;
	export const TAG_NAME = {
		[1]: Lang.get('ten_jade_auction_tag_name_jade'),
		[2]: Lang.get('ten_jade_auction_tag_name_silk_bag'),
		[3]: Lang.get('ten_jade_auction_tag_name_item'),
		[10]: Lang.get('ten_jade_auction_tag_name_other')
	}
}