import { G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

export class VipItemData {

    _privilegeList:any[];
    _vipGiftList:any[];
    _giftPrePrice;
    _giftNewPrice;

    _info;

    constructor() {
        this._privilegeList = [];
        this._vipGiftList = [];
    }
    public setInfo(info) {
        this._info = info;
        let VipFunctionInfo = G_ConfigLoader.getConfig(ConfigNameConst.VIP_FUNCTION);
        let count = VipFunctionInfo.length();
        for (let i = 0; i < count; i++) {
            let vipFuncInfo = VipFunctionInfo.indexOf(i);
            if (vipFuncInfo.vip == this._info.vip_level && vipFuncInfo.show == 1) {
                this._privilegeList.push(vipFuncInfo);
            }
        }
        for (let i = 1; i <= 6; i++) {
            if (info['type_' + i] != 0) {
                this._vipGiftList.push({
                    type: info['type_' + i],
                    value: info['value_' + i],
                    size: info['size_' + i]
                });
            }
        }
        this._giftPrePrice = info.price_show;
        this._giftNewPrice = info.price;
    }
    public getInfo() {
        return this._info;
    }
    public getId() {
        return this._info.vip_level;
    }
    public getVipPrivilegeList():any[] {
        return this._privilegeList;
    }
    public getVipGiftList():any[] {
        return this._vipGiftList;
    }
    public isGiftBeenBought() {
        return false;
    }
    public getVipPrePrice() {
        return this._giftPrePrice;
    }
    public getNewPrice() {
        return this._giftNewPrice;
    }
    public getShopItemId() {
        return this._info.gift_shop_id;
    }
}