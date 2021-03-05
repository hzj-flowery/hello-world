import { BaseData } from './BaseData';
import { G_ConfigLoader, G_UserData, G_NetworkManager, G_SignalManager, G_ServerTime } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { ActivityBaseData } from './ActivityBaseData';
import { ActivityConst } from '../const/ActivityConst';
import { Slot } from '../utils/event/Slot';
import { MessageIDConst } from '../const/MessageIDConst';
import { RechargeConst } from '../const/RechargeConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
import { FunctionConst } from '../const/FunctionConst';
let unitSchema = {};
unitSchema['time'] = [
    'number',
    0
];
unitSchema['id'] = [
    'number',
    0
];
unitSchema['config'] = [
    'object',
    {}
];
unitSchema['vipConfig'] = [
    'object',
    {}
];
let schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
schema['start_time'] = [
    'number',
    0
];
export interface ActivityLuxuryGiftPkgUnitData {
    getTime(): number
    setTime(value: number): void
    getLastTime(): number
    getId(): number
    setId(value: number): void
    getLastId(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    getVipConfig(): any
    setVipConfig(value: any): void
    getLastVipConfig(): any
}
export class ActivityLuxuryGiftPkgUnitData extends BaseData {
    public static schema = unitSchema;

    public clear() {
    }
    public reset() {
    }
    public initData(id, time) {
        this.setTime(time);
        this.setId(id);
        let ActDailyDiscount = G_ConfigLoader.getConfig(ConfigNameConst.ACT_DAILY_DISCOUNT);
        let info = ActDailyDiscount.get(id);
        console.assert(info, 'act_daily_discount not find id ' + String(id));
        this.setConfig(info);
        let vipCfg = G_UserData.getActivityLuxuryGiftPkg().getGiftPkgPayCfgByIndex(info.pay_type);
        console.assert(vipCfg, 'act_daily_discount pay_type ' + (String(info.pay_type) + ' not find match vip_pay '));
        this.setVipConfig(vipCfg);
    }
    public getRemainBuyTime() {
        return G_UserData.getActivityLuxuryGiftPkg().getTotalBuyTime() - this.getTime();
    }
    public getPayType() {
        let cfg = this.getConfig();
        if (!cfg) {
            return null;
        }
        return cfg.pay_type;
    }
}
export interface ActivityLuxuryGiftPkgData {
    getBaseActivityData(): ActivityBaseData
    setBaseActivityData(value: ActivityBaseData): void
    getLastBaseActivityData(): ActivityBaseData
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
}
export class ActivityLuxuryGiftPkgData extends BaseData {
    public static schema = schema;
    public _unitDataList;
    public _vipPayCfgList;
    public _s2cGetActDiscountListener: Slot;
    public _s2cActDiscountListener: Slot;

    constructor(properties?) {
        super(properties);
        super(properties)
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_LUXURY_GIFT_PKG });
        this.setBaseActivityData(activityBaseData);
        this._unitDataList = {};
        this._vipPayCfgList = this._createVipPayCfgListFromConfig();
        this._s2cGetActDiscountListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActDiscount, this._s2cGetActDiscount.bind(this));
        this._s2cActDiscountListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActDiscount, this._s2cActDiscount.bind(this));
    }
    public clear() {
        super.clear();
        this._s2cGetActDiscountListener.remove();
        this._s2cGetActDiscountListener = null;
        this._s2cActDiscountListener.remove();
        this._s2cActDiscountListener = null;
        this.getBaseActivityData().clear();
    }
    public reset() {
        super.reset();
        this.getBaseActivityData().reset();
        this._unitDataList = {};
        this._vipPayCfgList = this._createVipPayCfgListFromConfig();
    }
    public _createUnitData(id, time) {
        let unitData = new ActivityLuxuryGiftPkgUnitData();
        unitData.initData(id, time);
        this._unitDataList['k_' + String(id)] = unitData;
    }
    public _createVipPayCfgListFromConfig() {
        let payCfgList = [];
        let VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
        let size = VipPay.length();
        let config = null;
        for (let i = 0; i < size; i += 1) {
            config = VipPay.indexOf(i);
            if (config.card_type == RechargeConst.VIP_PAY_TYPE_LUXURY_GIFT_PKG) {
                payCfgList.push(config);
            }
        }
        let sortFunc = function (obj1, obj2) {
            return obj1.rmb - obj2.rmb;
        };
        payCfgList.sort(sortFunc);
        return payCfgList;
    }
    public getGiftPkgPayCfgByIndex(index) {
        return this._vipPayCfgList[index-1];
    }
    public getGiftPkgPayCfgList() {
        return this._vipPayCfgList;
    }
    public getUnitData(id) {
        return this._unitDataList['k_' + String(id)];
    }
    public getUnitDatasByPayType(payType) {
        //console.log(this._unitDataList);
        let dataList = [];
        for (let k in this._unitDataList) {
            let unitData = this._unitDataList[k];
            if (unitData.getPayType() == payType) {
                dataList.push(unitData);
            }
        }
        return dataList;
    }
    public _s2cGetActDiscount(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.discount_type != ActivityConst.GIFT_PKG_TYPE_LUXURY) {
            return;
        }
        this.getBaseActivityData().setHasData(true);
        this.resetTime();
        this._unitDataList = {};
        this.setProperties(message);
        let goodsIds = message['goods_ids'] || {};
        let buyTimes = message['buy_times'] || {};
        for (let k in goodsIds) {
            let v = goodsIds[k];
            if (v != null && buyTimes[k] >= 0) {
                this._createUnitData(v, buyTimes[k]);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_INFO, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_LUXURY_GIFT_PKG });
    }
    public _s2cActDiscount(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.discount_type != ActivityConst.GIFT_PKG_TYPE_LUXURY) {
            return;
        }
        let ids = message['id'] || {};
        for (let k in ids) {
            let id = ids[k];
            let unitData = this.getUnitData(id);
            if (unitData) {
                unitData.setTime(unitData.getTime() + 1);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_REWARD, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_LUXURY_GIFT_PKG });
    }
    public c2sActDiscount(payIndex) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        let unitDataList = this.getUnitDatasByPayType(payIndex);
        let ids = [];
        for (let k in unitDataList) {
            let v = unitDataList[k];
            ids.push(v.getConfig().id);
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActDiscount, {
            discount_type: ActivityConst.GIFT_PKG_TYPE_LUXURY,
            id: ids
        });
    }
    public c2sGetActDiscount(discountType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActDiscount, { discount_type: discountType });
    }
    public pullData() {
        this.c2sGetActDiscount(ActivityConst.GIFT_PKG_TYPE_LUXURY);
    }
    public resetData() {
        this.pullData();
        this.setNotExpire();
    }
    public getTotalBuyTime() {
        let baseActData = this.getBaseActivityData();
        return baseActData.getActivityParameter(ActivityConst.ACT_PARAMETER_INDEX_LUXURY_GIFT_PKG_MAX_BUY_TIMES) || 0;
    }
    public hasRedPoint() {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_LUXURY_GIFT_PKG });
        if (showed) {
            return false;
        }
        return !this.hasBuyGoods();
    }
    public hasBuyGoods() {
        for (let k in this._unitDataList) {
            let actLuxuryGiftPkgUnitData = this._unitDataList[k];
            let buyTime = actLuxuryGiftPkgUnitData.getTime();
            if (buyTime > 0) {
                return true;
            }
        }
        return false;
    }
    public getRewards(ids) {
        let awards = [];
        for (let k in ids) {
            let id = ids[k];
            let unitData = this.getUnitData(id);
            if (unitData) {
                let cfg = unitData.getConfig();
                awards.push({
                    type: cfg.type,
                    value: cfg.value,
                    size: cfg.size
                })
            }
        }
        return awards;
    }
    public getRewardsByPayType(index) {
        let awards = [];
        let unitDataList = this.getUnitDatasByPayType(index);
        for (let k in unitDataList) {
            let cfg = unitDataList[k];
            awards.push({
                type: cfg.type,
                value: cfg.value,
                size: cfg.size
            });
        }
        return awards;
    }
    public isNeedBuy7Days() {
        let startTime = this.getStart_time();
        let currTime = G_ServerTime.getTime();
        let expiredTime = startTime + 7 * 3600 * 24;
        if (currTime < expiredTime) {
            return [
                false,
                Math.ceil((expiredTime - currTime) / (3600 * 24)) - 1
            ];
        }
        return [
            true,
            0
        ];
    }
    public isCanReceiveGiftPkg() {
        let startTime = this.getStart_time();
        let currTime = G_ServerTime.getTime();
        let expiredTime = startTime + 7 * 3600 * 24;
        return currTime >= startTime && currTime < expiredTime;
    }
    public getBuy7DaysPayConfig() {
        let baseActData = this.getBaseActivityData();
        let payId = baseActData.getActivityParameter(2);
        let VipPay = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
        let payCfg = VipPay.get(payId);
        console.assert(payCfg, 'vip_pay not find id ' + String(payId));
        return payCfg;
    }
    public getBuy7DayVipLimit() {
        let baseActData = this.getBaseActivityData();
        let vipLimit = Number(baseActData.getActivityParameter(3));
        return vipLimit;
    }
}