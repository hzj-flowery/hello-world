import { BaseData } from './BaseData';
import { G_NetworkManager, G_SignalManager, G_ConfigLoader, G_UserData } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { TextHelper } from '../utils/TextHelper';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { CrystalShopItemData } from './CrystalShopItemData';
import { ArraySort } from '../utils/handler';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { FunctionConst } from '../const/FunctionConst';
import { CrystalShopGoodData } from './CrystalShopGoodData';
export class CrystalShopData extends BaseData {

        _signalRecvGetShopCrystal;
        _signalRecvGetShopCrystalAward;
        _signalRecvRefreshCrystalShop;
        _signalRecvShopCrystalBuy;
        _signalCleanData;
        _datas;
        _shopDatas;
        _isNotNeedForceRefesh: boolean;

    constructor (properties?) {
        super(properties);
        this._signalRecvGetShopCrystal = G_NetworkManager.add(MessageIDConst.ID_S2C_GetShopCrystal, this._s2cGetShopCrystal.bind(this));
        this._signalRecvGetShopCrystalAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetShopCrystalAward, this._s2cGetShopCrystalAward.bind(this));
        this._signalRecvRefreshCrystalShop = G_NetworkManager.add(MessageIDConst.ID_S2C_RefreshCrystalShop, this._s2cRefreshCrystalShop.bind(this));
        this._signalRecvShopCrystalBuy = G_NetworkManager.add(MessageIDConst.ID_S2C_ShopCrystalBuy, this._s2cShopCrystalBuy.bind(this));
        this._signalCleanData = G_SignalManager.add(SignalConst.EVENT_CLEAN_DATA_CLOCK, this._onCleanData.bind(this));
        this._datas = this._initData();
        this._shopDatas = null;
        this._isNotNeedForceRefesh = false;
    }
    public _initData () {
        let ShopCrystalConfig = G_ConfigLoader.getConfig(ConfigNameConst.SHOP_CRYSTAL)
        let indexs = ShopCrystalConfig.index();
        let datas = {};
        for (let k in indexs) {
            let v = indexs[k];
            let shopGoodData = new CrystalShopItemData();
            let config = ShopCrystalConfig.indexOf(v);
            let awards = [];
            for (let i = 1; i <= 3; i++) {
                if (config['type_' + i] != 0) {
                    awards.push({
                        type: config['type_' + i],
                        value: config['value_' + i],
                        size: config['size_' + i]
                    });
                } else {
                    break;
                }
            }
            shopGoodData.setAwards(awards);
            shopGoodData.setId(config.good_id);
            shopGoodData.setPay_type(config.pay_type);
            shopGoodData.setPay_amount(config.pay_amount);
            shopGoodData.setIs_function(config.is_function);
            shopGoodData.setIs_work(config.is_work);
            shopGoodData.setBuy_size(config.buy_size);
            shopGoodData.setFunction_id(config.function_id);
            shopGoodData.setPage(config.page);
            let [description] = TextHelper.convertKeyValuePair(config.description, {
                key: 'num',
                value: config.pay_amount
            });
            shopGoodData.setDescription(description);
            datas[config.good_id] = shopGoodData;
        }
        return datas;
    }
    public getShowDatas (pageIndex) {
        if (!pageIndex) {
            return [];
        }
        let datas = [];
        for (let k in this._datas) {
            let v = this._datas[k];
            if (v.canShow() && pageIndex == v.getPage()) {
                datas.push(v);
            }
        }
        ArraySort(datas, function (a, b) {
            let aAlreadyGet = a.isAlreadGet(a.getPage());
            let bAlreadyGet = b.isAlreadGet(b.getPage());
            if (bAlreadyGet == aAlreadyGet) {
                let aCanGet = a.canGet(a.getPage());
                let bCanGet = b.canGet(b.getPage());
                if (aCanGet == bCanGet) {
                    return a.getId() < b.getId();
                } else {
                    return aCanGet == true;
                }
            } else {
                return aAlreadyGet == false;
            }
        });
        return datas;
    }
    public hasRedPoint (pageIndex?) {
        if (pageIndex) {
            for (let k in this._datas) {
                let v = this._datas[k];
                if (v.getPage() == pageIndex && v.canShow() && !v.isAlreadGet(v.getPage()) && v.canGet(v.getPage())) {
                    return true;
                }
            }
        } else {
            let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_CRYSTAL_SHOP);
            if (!showed) {
                return true;
            }
            for (let k in this._datas) {
                let v = this._datas[k];
                if (v.canShow() && !v.isAlreadGet(v.getPage()) && v.canGet(v.getPage())) {
                    return true;
                }
            }
        }
        return false;
    }
    public clear () {
        this._signalRecvGetShopCrystal.remove();
        this._signalRecvGetShopCrystal = null;
        this._signalRecvGetShopCrystalAward.remove();
        this._signalRecvGetShopCrystalAward = null;
        this._signalRecvRefreshCrystalShop.remove();
        this._signalRecvRefreshCrystalShop = null;
        this._signalRecvShopCrystalBuy.remove();
        this._signalRecvShopCrystalBuy = null;
        this._signalCleanData.remove();
        this._signalCleanData = null;
    }
    public reset () {
        this._shopDatas = null;
        this._isNotNeedForceRefesh = false;
    }
    public _s2cGetShopCrystal (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let goods = message['goods'];
        if (goods) {
            for (let k in goods) {
                let v = goods[k];
                let goodData = this._datas[v.id];
                if (goodData) {
                    goodData.setValue(v.value);
                    goodData.setBuy_count(v.buy_count);
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_CRYSTAL_SHOP);
        G_SignalManager.dispatch(SignalConst.EVENT_GET_SHOP_CRYSTAL_SUCCESS);
    }
    public c2sGetShopCrystalAward (id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetShopCrystalAward, { id: id });
    }
    public _s2cGetShopCrystalAward (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let awards = message['awards'];
        if (!awards) {
            awards = {};
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_SHOP_CRYSTAL_AWARD_SUCCESS, awards);
    }
    public requestShopData (isForce?) {
        if (!this._isNotNeedForceRefesh || isForce) {
            this.c2sRefreshCrystalShop();
        } else {
            let scheduler = cc.director.getScheduler();
            scheduler.enableForTarget(this);
            scheduler.schedule(function() {
                G_SignalManager.dispatch(SignalConst.EVENT_REFRESH_CRYSTAL_SHOP_SUCCESS);
            }, this, 0, 0, 0, false);
        }
    }
    public getShopData () {
        return this._shopDatas || {};
    }
    public c2sRefreshCrystalShop () {
        G_NetworkManager.send(MessageIDConst.ID_C2S_RefreshCrystalShop, {});
    }
    public _s2cRefreshCrystalShop (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let goods = message['goods'];
        if (goods) {
            let shopDatas = [];
            for (let k in goods) {
                let v = goods[k];
                let temp = new CrystalShopGoodData();
                temp.updateData(v);
                shopDatas.push(temp);
            }
            ArraySort(shopDatas, function (a, b) {
                let aConfig = a.getConfig();
                let bConfig = b.getConfig();
                if (aConfig.order == bConfig.order) {
                    return a.getId() < b.getId();
                } else {
                    return aConfig.order < bConfig.order;
                }
            });
            this._isNotNeedForceRefesh = true;
            this._shopDatas = shopDatas;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_REFRESH_CRYSTAL_SHOP_SUCCESS);
    }
    public c2sShopCrystalBuy (good_id, good_count) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ShopCrystalBuy, {
            good_id: good_id,
            good_count: good_count
        });
    }
    public _s2cShopCrystalBuy (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let goodState = message['goodState'];
        if (goodState) {
            let temp = new CrystalShopGoodData();
            temp.updateData(goodState);
            let buyCount = goodState.this_buy_count;
            if (this._shopDatas) {
                for (let k in this._shopDatas) {
                    let v = this._shopDatas[k];
                    if (v.getId() == temp.getId()) {
                        this._shopDatas[k] = temp;
                        break;
                    }
                }
            }
            let cfg = temp.getConfig();
            let awards = [{
                    size: buyCount*cfg.good_size,
                    type: cfg.good_type,
                    value: cfg.good_value
                }];
            G_SignalManager.dispatch(SignalConst.EVENT_SHOP_CRYSTAL_BUY_SUCCESS, awards);
        }
    }
    public _onCleanData () {
        this._isNotNeedForceRefesh = null;
    }
}