import { BaseData } from "./BaseData";
import { G_ServerTime } from "../init";

var schema = {};
schema['auction_id'] = [
    'number',
    0
];
schema['bonus'] = [
    'number',
    0
];
schema['canBonus'] = [
    'bool',
    false
];
schema['start_time'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['bonus_yubi'] = [
    'number',
    0
];
schema['open_state'] = [
    'number',
    0
];
export class TenJadeAuctionInfoData extends BaseData {
    public static schema = schema;

    initData(msg) {
        this.setProperties(msg);
    }
    isEnd() {
        var curTime = G_ServerTime.getTime();
        var endTime = this.getEnd_time();
        return curTime > endTime;
    }
}