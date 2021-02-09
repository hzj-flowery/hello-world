import { BaseData } from "./BaseData";
import { G_ConfigLoader, G_UserData } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { Day7ActivityConst } from "../const/Day7ActivityConst";
import { Day7RechargeConst } from "../const/Day7RechargeConst";
import { Day7RechargeDataHelper } from "../utils/data/Day7RechargeDataHelper";

export interface Day7RechargeUnitData {
    getType(): number
    setType(value: number): void
    getValue(): number
    setValue(value: number): void
}
let schema = {};
schema['type'] = [
    'number',
    0
];
schema['value'] = [
    'number',
    0
];
export class Day7RechargeUnitData extends BaseData {
    public static schema = schema;

    _receivedIds;
    constructor(properties?) {
        super(properties);
        this._receivedIds = {};
    }
    public clear() {
    }
    public reset() {
    }

    updateData(data) {
        this.setProperties(data);
        var prizeState = data['prize_state'] || {};
        for (var key in prizeState) {
            var id = prizeState[key];
            this._receivedIds[id] = true;
        }
    }

    isReceivedWithId(id) {
        if (this._receivedIds[id]) {
            return true;
        }
        return false;
    }

    getStateWithId(id) {
        var info = Day7RechargeDataHelper.get7DaysMoneyConfig(id);
        var taskValue1 = info.task_value_1;
        var value = this.getValue();
        if (value < taskValue1) {
            return Day7RechargeConst.RECEIVE_STATE_1;
        } else {
            if (this.isReceivedWithId(id) == false) {
                return Day7RechargeConst.RECEIVE_STATE_2;
            } else {
                return Day7RechargeConst.RECEIVE_STATE_3;
            }
        }
    }

    setReceivedWithId(id) {
        this._receivedIds[id] = true;
    }

    isShowRedPoint() {
        var isShow = false;
        var type = this.getType();
        var moneyInfo = G_UserData.getDay7Recharge().getMoneyInfoWithType(type);
        for (var index in moneyInfo) {
            var info = moneyInfo[index];
            var isShowRP = this.isShowRedPointWithId(info.id);
            isShow = isShow || isShowRP;
        }
        return isShow;
    }

    isShowRedPointWithId(id) {
        if (this.getStateWithId(id) == Day7RechargeConst.RECEIVE_STATE_2) {
            return true;
        }
        return false;
    }
} 
