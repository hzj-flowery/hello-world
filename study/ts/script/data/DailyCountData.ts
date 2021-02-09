import { BaseData } from "./BaseData";
import { G_SignalManager, G_NetworkManager } from "../init";
import { SignalConst } from "../const/SignalConst";
import { Slot } from "../utils/event/Slot";
import { MessageIDConst } from "../const/MessageIDConst";
import { FunctionConst } from "../const/FunctionConst";

export interface DailyCountData {
    getDaily_count(): Object
    setDaily_count(value: Object): void
    getLastDaily_count(): Object
}
let schema = {};
schema['daily_count'] = [
    'object',
    {}
];
export class DailyCountData extends BaseData {

    public static schema = schema;
    public static DAILY_RECORD_RECRUIT_NORMAL_CNT = 1;
    public static DAILY_RECORD_RECRUIT_GOLD_CNT = 2;
    public static DAILY_RECORD_NORMAL_CHAPTER_VICTORY_CNT = 3;
    public static DAILY_RECORD_RECRUIT_NORMAL_CNT_CHARGE = 4;
    public static DAILY_RECORD_RECRUIT_GOLD_CNT_CHARGE = 5;
    public static DAILY_RECORD_TERRITORY_HELP_REPRESS_COUNT = 6;
    public static DAILY_RECORD_TOWER_SUPER_CNT = 7;
    public static DAILY_RECORD_HERO_STAGE_CNT = 8;
    public static DAILY_RECORD_FRIEND_GIFT_CNT = 9;
    public static DAILY_RECORD_AVATAR_ACTVITY_CNT = 10;
    public static DAILY_RECORD_CHAT_CNT = 12;
    public static DAILY_RECORD_HOME_TREE_AWARD = 13;
    public static DAILY_RECORD_HOME_TREE_PRAY = 19;  //神树祈福次数

    _signalRecvGetDailyCount: Slot;
    constructor(properties?) {
        super(properties);
        this._signalRecvGetDailyCount = G_NetworkManager.add(MessageIDConst.ID_S2C_GetDailyCount, this._s2cGetDailyCount.bind(this));
    }
    public clear() {
        this._signalRecvGetDailyCount.remove();
        this._signalRecvGetDailyCount = null;
    }
    public reset() {
    }
    public _s2cGetDailyCount(id, message) {
        this.setProperties(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_DAILY_COUNT_SUCCESS);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
    }
    public getCountById(id) {
        let counts = this.getDaily_count();
        for (let k in counts) {
            let v = counts[k];
            if (v.key == id) {
                return v.value;
            }
        }
        return 0;
    }
}
