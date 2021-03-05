import { BaseData } from './BaseData';
import { ActivityBaseData } from './ActivityBaseData';
import { G_ConfigLoader, G_NetworkManager, G_SignalManager, G_UserData } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { LogicCheckHelper } from '../utils/LogicCheckHelper';
import { TimeExpiredData } from './TimeExpiredData';
import { ActivityConst } from '../const/ActivityConst';
import { Slot } from '../utils/event/Slot';
import { MessageIDConst } from '../const/MessageIDConst';
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
let schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
export interface ActivityWeeklyGiftPkgUnitData {
getTime(): number
setTime(value: number): void
getLastTime(): number
getId(): number
setId(value: number): void
getLastId(): number
getConfig(): any
setConfig(value: any): void
getLastConfig(): any
}
export class ActivityWeeklyGiftPkgUnitData extends BaseData {
    public static schema = unitSchema;

    constructor (properties?) {
        super(properties);
    }
    public clear () {
    }
    public reset () {
    }
    public initData (id, time) {
        this.setTime(time);
        this.setId(id);
        let ActWeekDiscount = G_ConfigLoader.getConfig(ConfigNameConst.ACT_WEEK_DISCOUNT);
        let info = ActWeekDiscount.get(id);
        console.assert(info, 'act_week_discount not find id ' + String(id));
        this.setConfig(info);
    }
    public getRemainBuyTime () {
        let cfg = this.getConfig();
        return cfg.time - this.getTime();
    }
    public checkIsCanBuy () {
        let cfg = this.getConfig();
        let vip = cfg.vip;
        let gold = cfg.price;
        let checkParams = {
            [1]: {
                funcName: 'enoughVip',
                param: [vip]
            },
            [2]: {
                funcName: 'enoughCash',
                param: [gold]
            }
        };
        let [success, errorMsg, funcName] = LogicCheckHelper.doCheckList(checkParams);
        return [
            success,
            errorMsg,
            funcName
        ];
    }
    public checkVip () {
        let cfg = this.getConfig();
        let [success, hintCallback] = LogicCheckHelper.enoughVip(cfg.vip);
        return success;
    }
}
export interface ActivityWeeklyGiftPkgData {
getBaseActivityData(): ActivityBaseData
setBaseActivityData(value: ActivityBaseData): void
getLastBaseActivityData(): ActivityBaseData
getExpiredTime():number
}
export class ActivityWeeklyGiftPkgData extends BaseData {
    public static schema = schema;

        public _unitDataList;
        public _s2cGetActDiscountListener: Slot;
        public _s2cActDiscountListener: Slot;

    constructor (properties?) {
        super(properties);
        this.setResetType(TimeExpiredData.RESET_TYPE_WEEKLY);
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_WEEKLY_GIFT_PKG });
        this.setBaseActivityData(activityBaseData);
        this._unitDataList = {};
        this._s2cGetActDiscountListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActDiscount, this._s2cGetActDiscount.bind(this));
        this._s2cActDiscountListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActDiscount, this._s2cActDiscount.bind(this));
    }
    public clear () {
        super.clear();
        this._s2cGetActDiscountListener.remove();
        this._s2cGetActDiscountListener = null;
        this._s2cActDiscountListener.remove();
        this._s2cActDiscountListener = null;
        this.getBaseActivityData().clear();
    }
    public reset () {
        super.reset();
        this.getBaseActivityData().reset();
    }
    public _setUnitData (id, time) {
        let unitData = new ActivityWeeklyGiftPkgUnitData();
        unitData.initData(id, time);
        this._unitDataList['k_' + String(id)] = unitData;
    }
    public getUnitData (id) {
        return this._unitDataList['k_' + String(id)];
    }
    public getAllShowUnitDatas () {
        let dataList = [];
        let myVip = G_UserData.getVip().getLevel();

        for (let k in this._unitDataList) {
            let v = this._unitDataList[k];
            if (myVip >= v.getConfig().vip_show)
                dataList.push(v);
        }
        let sortFunc = function (obj1, obj2) {
            let time1 = obj1.getRemainBuyTime();
            let time2 = obj2.getRemainBuyTime();
            if (time1 <= 0 && time2 <= 0) {
                return obj2.getId() - obj1.getId();
            } else if (time1 <= 0) {
                return 1;
            } else if (time2 <= 0) {
                return -1;
            }
            return obj1.getId() - obj2.getId();
        };
        dataList.sort(sortFunc);
        return dataList;
    }
    public _s2cGetActDiscount (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.discount_type != ActivityConst.GIFT_PKG_TYPE_WEEKLY) {
            return;
        }
        this.getBaseActivityData().setHasData(true);
        this.resetTime();
        this._unitDataList = {};
        let goodsIds:any[] = message['goods_ids'] || [];
        let buyTimes:any[] = message['buy_times'] || [];
        for (let k=0; k<goodsIds.length; k++) {
            let v = goodsIds[k];
            if (k < buyTimes.length) {
                this._setUnitData(v, buyTimes[k]);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_INFO, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_WEEKLY_GIFT_PKG });
    }
    public _s2cActDiscount (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.discount_type != ActivityConst.GIFT_PKG_TYPE_WEEKLY) {
            return;
        }
        let ids = message['id'] || {};
        let giftId = 0;
        for (let k in ids) {
            let id = ids[k];
            let unitData = this.getUnitData(id);
            if (unitData) {
                giftId = id;
                unitData.setTime(unitData.getTime() + 1);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_GIFT_PKG_GET_REWARD, id, message, giftId);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_WEEKLY_GIFT_PKG });
    }
    public c2sActDiscount (id) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActDiscount, {
            discount_type: ActivityConst.GIFT_PKG_TYPE_WEEKLY,
            id: [id]
        });
    }
    public c2sGetActDiscount (discountType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActDiscount, { discount_type: discountType });
    }
    public pullData () {
        this.c2sGetActDiscount(ActivityConst.GIFT_PKG_TYPE_WEEKLY);
    }
    public resetData () {
        this.pullData();
        this.setNotExpire();
    }
    public hasRedPoint () {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_WEEKLY_GIFT_PKG });
        if (showed) {
            return false;
        }
        return !this.hasBuyAllGoods();
    }
    public hasBuyAllGoods () {
        for (let k in this._unitDataList) {
            let weekUnitData = this._unitDataList[k];
            let buyTime = weekUnitData.getTime();
            if (buyTime <= 0) {
                return false;
            }
        }
        return true;
    }
    public getRewards (ids) {
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
                });
            }
        }
        return awards;
    }
}