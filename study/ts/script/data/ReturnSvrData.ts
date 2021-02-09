import { BaseData } from "./BaseData";
import { G_UserData } from "../init";
import { ReturnServerDataHelper } from "../utils/data/ReturnServerDataHelper";

var schema = {};
schema['bonus'] = [
    'table',
    {}
];
schema['packs'] = [
    'table',
    {}
];
schema['vip_max'] = [
    'number',
    0
];
schema['gold_max'] = [
    'number',
    0
];
schema['cur_vip'] = [
    'number',
    0
];
schema['cur_gold'] = [
    'number',
    0
];
schema['commit'] = [
    'number',
    0
];
schema['vip_level'] = [
    'number',
    0
];
export class ReturnSvrData extends BaseData {
    public static schema = schema;
    constructor(properties?) {
        super(properties);
    }
    clear() {
    }
    reset() {
    }
    updateData(data) {
        this.setProperties(data);
    }
    isAllReceived() {
        if (this.getCur_vip() == 0 && this.getCur_gold() == 0) {
            return true;
        } else {
            return false;
        }
    }
    isReceivedWithId(id) {
        var bonus = this.getBonus();
        for (var i in bonus) {
            var v = bonus[i];
            if (v == id) {
                return true;
            }
        }
        return false;
    }
    isCanReceive(id) {
        if (this.getCur_vip() == 0 && this.getCur_gold() == 0) {
            return false;
        }
        if (this.isReceivedWithId(id)) {
            return false;
        }
        var curLevel = G_UserData.getBase().getLevel();
        var info = ReturnServerDataHelper.getReturnAwardConfig(id);
        if (curLevel >= info.level) {
            return true;
        } else {
            return false;
        }
    }
}