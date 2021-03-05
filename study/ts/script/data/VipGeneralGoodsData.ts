import { BaseData } from "./BaseData";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface VipGeneralGoodsData {
    getProduct_id(): number
    setProduct_id(value: number): void
    getLastProduct_id(): number
    getAwards(): Object
    setAwards(value: Object): void
    getLastAwards(): Object
    getPurchased_times(): number
    setPurchased_times(value: number): void
    getLastPurchased_times(): number
}
let schema = {};
schema['product_id'] = [
    'number',
    0
];
schema['awards'] = [
    'object',
    {}
];
schema['purchased_times'] = [
    'number',
    0
];
export class VipGeneralGoodsData extends BaseData {

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
    public getRmb() {
        let configInfo = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY).get(this.getProduct_id());
        return configInfo.rmb;
    }
}
