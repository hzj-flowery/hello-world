import { BaseData } from './BaseData';
import { G_ConfigLoader } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
let schema = {};
schema['id'] = [
    'number',
    0
];

schema['value'] = [
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

export interface CrystalShopGoodData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getValue(): number
    setValue(value: number): void
    getLastValue(): number
    getBuy_count(): number
    setBuy_count(value: number): void
    getLastBuy_count(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
}
export class CrystalShopGoodData extends BaseData {
    public static schema = schema;

    public updateData(message) {
        let id = message['id'];
        if (id) {
            this.setId(id);
        }
        let value = message['value'];
        if (value) {
            this.setValue(value);
        }
        let buy_count = message['buy_count'];
        if (buy_count) {
            this.setBuy_count(buy_count);
        }
        let ShopCrystalItemConfig = G_ConfigLoader.getConfig(ConfigNameConst.SHOP_CRYSTAL_ITEM);
        let cfg = ShopCrystalItemConfig.get(this.getId());
        console.assert(cfg != null, 'shop_crystal_item can not find id ' + this.getId());
        this.setConfig(cfg);
    }
    public getLeftBuyCount() {
        let cfg = this.getConfig();
        if (cfg.limit > 0) {
            return cfg.limit - this.getBuy_count();
        } else {
            return -1;
        }
    }
}
CrystalShopGoodData;