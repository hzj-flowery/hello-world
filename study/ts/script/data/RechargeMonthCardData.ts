import { BaseData } from "./BaseData";
import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface RechargeMonthCardData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
    getRemainDay(): number
    setRemainDay(value: number): void
    getLastRemainDay(): number
    isCanReceive(): boolean
    setCanReceive(value: boolean): void
    isLastCanReceive(): boolean
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
schema['remainDay'] = [
    'number',
    0
];
schema['canReceive'] = [
    'boolean',
    false
];
export class RechargeMonthCardData extends BaseData {
    public static schema = schema;


    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        let id = data.id;
        this.setId(id);
        let VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
        let info = VipPay.get(id);
        console.assert(info, 'vip_pay can\'t find id = ' + String(id));
        this.setConfig(info);
        this.setRemainDay(data.expire_days);
        this.setCanReceive(data.using_state);
    }
}
