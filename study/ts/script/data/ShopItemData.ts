import { BaseData } from "./BaseData";
import { G_ConfigLoader, G_UserData } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface ShopItemData {
    getGoodId(): number
    setGoodId(value: number): void
    getLastGoodId(): number
    getGoodNo(): number
    setGoodNo(value: number): void
    getLastGoodNo(): number
    getBuyCount(): number
    setBuyCount(value: number): void
    getLastBuyCount(): number
    getShopId(): number
    setShopId(value: number): void
    getLastShopId(): number
    getConfigType(): string
    setConfigType(value: string): void
    getLastConfigType(): string
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    getIsCanBuy(): boolean
    setIsCanBuy(value: boolean): void
    getLastIsCanBuy(): boolean
    getIsHaveBuy(): boolean
    setIsHaveBuy(value: boolean): void
    getLastIsHaveBuy(): boolean
}




let schema = {};
schema['goodId'] = [
    'number',
    0
];
schema['goodNo'] = [
    'number',
    0
];
schema['buyCount'] = [
    'number',
    0
];
schema['shopId'] = [
    'number',
    0
];
schema['configType'] = [
    'string',
    0
];
schema['config'] = [
    'object',
    {}
];
schema['isCanBuy'] = [
    'bool',
    false
];
schema['isHaveBuy'] = [
    'bool',
    false
];
export class ShopItemData extends BaseData {
    public static schema = schema;

    public initData(shopId, data) {
        let goodId = data['goods_id'];
        let buyCount = data['buy_count'];
        let goodNo = data['goods_no'];
        this.setGoodId(goodId);
        this.setBuyCount(buyCount);
        if (goodNo) {
            this.setGoodNo(goodNo);
        }
        let info = null;
        let ShopInfo = G_ConfigLoader.getConfig(ConfigNameConst.SHOP);
        let shopData = ShopInfo.get(shopId);
        if (shopData.shop_type == 0) {
            let ShopFix = G_ConfigLoader.getConfig(ConfigNameConst.SHOP_FIX);
            info = ShopFix.get(goodId);
            console.assert(info, 'ShopFix can\'t find id = ' + String(goodId));
            this.setConfigType('fix');String
        }
        if (shopData.shop_type == 1) {
            let ShopRandomItems = G_ConfigLoader.getConfig(ConfigNameConst.SHOP_RANDOM_ITEMS);
            info = ShopRandomItems.get(goodId);
            console.assert(info, 'ShopRandomItems can\'t find id = ' + String(goodId));
            this.setConfigType('random');
        }
        this.setShopId(shopId);
        this.setConfig(info);
    }
    public getVipBuyTimes() {
        if (this.getConfigType() == 'fix') {
            let playerVip = G_UserData.getVip().getLevel();
            let cfg = this.getConfig();
            if (cfg.num_ban_type == 3) {
                let vipfunc = G_UserData.getVip().getVipFunctionDataByType(cfg.num_ban_value);
                console.assert(vipfunc, 'ShopItemData:getVipBuyTimes can not find vipType[%d] by itemId[%d]');
                return vipfunc.value;
            }
            if (cfg.num_ban_type == 1 || cfg.num_ban_type == 2 || cfg.num_ban_type == 4 || cfg.num_ban_type == 5) {
                return cfg.num_ban_value;
            }
        }
        return 0;
    }
    public getLimitType() {
        if (this.getConfigType() == 'fix') {
            let playerVip = G_UserData.getVip().getLevel();
            let cfg = this.getConfig();
            return cfg.num_ban_type;
        }
        return 0;
    }
    public isCanAddTimesByVip() {
        if (this.getConfigType() == 'fix') {
            let cfg = this.getConfig();
            return cfg.num_ban_type == 3;
        }
        return false;
    }
    public getSurplusTimes() {
        if (this.getConfigType() == 'fix') {
            if (this.getVipBuyTimes() > 0) {
                let surplus = this.getVipBuyTimes() - this.getBuyCount();
                return surplus;
            }
        }
        if (this.getConfigType() == 'random') {
            if (this.getBuyCount() > 0) {
                return 0;
            }
            return 1;
        }
        return 0;
    }
    public getGoodsInfo() {
        let itemInfo: any = {};
        let goodsCfg = this.getConfig();
        if (this.getConfigType() == 'fix') {
            itemInfo.type = goodsCfg.type;
            itemInfo.value = goodsCfg.value;
            itemInfo.size = goodsCfg.size;
        }
        return itemInfo;
    }
}
