import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { BaseData } from "./BaseData";

export interface Day7ActivityDiscountData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getBuyCount(): number
    setBuyCount(value: number): void
    getLastBuyCount(): number
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['buyCount'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
export class Day7ActivityDiscountData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public initData(shopId) {
        this.setId(shopId);
        let SevenDaysDiscount = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_DISCOUNT);
        let cfg = SevenDaysDiscount.get(shopId);
        console.assert(cfg, 'seven_days_discount not find id ' + String(shopId));
        this.setConfig(cfg);
        this.setBuyCount(1);
    }
    public canBuy() {
        return this.getBuyCount() <= 0;
    }
}
