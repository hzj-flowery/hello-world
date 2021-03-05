import { BaseData } from "./BaseData";
import { G_ServerTime } from "../init";

export interface ShopActiveUnitData {
    getGoods_id(): number
    setGoods_id(value: number): void
    getLastGoods_id(): number
    getBuy_count(): number
    setBuy_count(value: number): void
    getLastBuy_count(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
}
let schema = {};
schema['goods_id'] = [
    'number',
    0
];
schema['buy_count'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
export class ShopActiveUnitData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.setProperties(data);
    }
    public isNew(curBatch) {
        if (this.isBought()) {
            return false;
        }
        let batch = this.getConfig().batch;
        return batch == curBatch;
    }
    public isBought() {
        let buyCount = this.getBuy_count();
        let limitCount = this.getConfig().num_ban_value;
        return buyCount >= limitCount;
    }
    public getRestCount() {
        let buyCount = this.getBuy_count();
        let limitCount = this.getConfig().num_ban_value;
        return limitCount - buyCount;
    }
    public isCanBuy(param) {
        param = param || {};
        let info = this.getConfig();
        if (info.limit_type == 1) {
            if (param.limitTime && G_ServerTime.getTime() < param.limitTime) {
                return false;
            }
        }
        return true;
    }
}
