



import { BaseData } from './BaseData';
import { G_UserData, G_ConfigLoader, G_ServerTime, G_NetworkManager, G_SignalManager, G_ServiceManager, G_ConfigManager } from '../init';
import { ActivityBaseData } from './ActivityBaseData';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { BaseConfig } from '../config/BaseConfig';
import { ActivityConst } from '../const/ActivityConst';
import { Slot } from '../utils/event/Slot';
import { SignalConst } from '../const/SignalConst';
import { MessageIDConst } from '../const/MessageIDConst';
import { ActivityDinnerUnitData } from './ActivityDinnerData';
import { FunctionConst } from '../const/FunctionConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
let unitSchema = {};
unitSchema['config'] = [
    'object',
    {}
];
unitSchema['id'] = [
    'number',
    0
];
unitSchema['start_time'] = [
    'number',
    0
];
unitSchema['is_buy'] = [
    'bool',
    false
];
unitSchema['vipConfig'] = [
    'object',
    {}
];

export interface ActivityLevelGiftPkgUnitData {
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    getId(): number
    setId(value: number): void
    getLastId(): number
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
    getIs_buy(): boolean
    setIs_buy(value: boolean): void
    getLastIs_buy(): boolean
    getVipConfig(): any
    setVipConfig(value: any): void
    getLastVipConfig(): any
}
export class ActivityLevelGiftPkgUnitData extends BaseData {

    public static schema = unitSchema;

    public isReachUnLockLevel() {
        let curLevel = G_UserData.getBase().getLevel();
        let config = this.getConfig();
        if (curLevel >= config.unlock_level) {
            return true;
        }
        return false;
    }
    public isReachShowLevel() {
        let curLevel = G_UserData.getBase().getLevel();
        let config = this.getConfig();
        if (curLevel >= config.show_level) {
            return true;
        }
        return false;
    }
    public getLimitTime() {
        let config = this.getConfig();
        let hour = 60 * 60;
        return config.time_limit * hour;
    }
    public isTimeOut() {
        let curTime = G_ServerTime.getTime();
        let startTime = this.getStart_time();
        let endTime = startTime + this.getLimitTime();
        if (startTime != 0) {
            let leftTime = endTime - curTime;
            return [
                leftTime < 0,
                endTime
            ];
        } else {
            return [
                true,
                endTime
            ];
        }
    }
}

let schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
export interface ActivityLevelGiftPkgData {
    getBaseActivityData(): ActivityBaseData
    setBaseActivityData(value: ActivityBaseData): void
    getLastBaseActivityData(): ActivityBaseData
}
export class ActivityLevelGiftPkgData extends BaseData {
    public static schema = schema;

    public _signalRecvGetActLevelDiscount: Slot;
    public _signalRecvActLevelDiscountAward: Slot;
    public _signalUserLevelUpdate: Slot;
    public _isNeedCleanTodayTag: boolean;
    public _unitDatas: ActivityLevelGiftPkgUnitData[];

    constructor(properties?) {
        super(properties);
        super(properties)
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_LEVEL_GIFT_PKG });
        this.setBaseActivityData(activityBaseData);
        this._signalRecvGetActLevelDiscount = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActLevelDiscount, this._s2cGetActLevelDiscount.bind(this));
        this._signalRecvActLevelDiscountAward = G_NetworkManager.add(MessageIDConst.ID_S2C_ActLevelDiscountAward, this._s2cActLevelDiscountAward.bind(this));
        this._signalUserLevelUpdate = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, this._onEventUserLevelUpdate.bind(this));
        this._isNeedCleanTodayTag = false;
        this._initUnitData();
    }
    public pullData() {
        this.checkDataDirty();
    }
    public clear() {
        this._signalRecvGetActLevelDiscount.remove();
        this._signalRecvGetActLevelDiscount = null;
        this._signalRecvActLevelDiscountAward.remove();
        this._signalRecvActLevelDiscountAward = null;
        this._signalUserLevelUpdate.remove();
        this._signalUserLevelUpdate = null;
        this._isNeedCleanTodayTag = false;
    }
    public reset() {
        this._isNeedCleanTodayTag = false;
    }
    public canBuy() {
        for (let _ in this._unitDatas) {
            let v = this._unitDatas[_];
            if (v.isReachUnLockLevel() && !v.getIs_buy() && !v.isTimeOut()) {
                return true;
            }
        }
        return false;
    }
    public hasRedPoint() {
        this._clearTodayClickRedPointShowFlag();
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_LEVEL_GIFT_PKG });
        if (showed) {
            return false;
        }
        return this.canBuy();
    }
    public _onEventUserLevelUpdate() {
        this._isNeedCleanTodayTag = true;
    }
    public _clearTodayClickRedPointShowFlag() {
        if (!this._isNeedCleanTodayTag) {
            return;
        }
        this._isNeedCleanTodayTag = false;
        let curLevel = G_UserData.getBase().getLevel();
        for (let _ in this._unitDatas) {
            let v = this._unitDatas[_];
            let config = v.getConfig();
            if (curLevel == config.unlock_level) {
                if (v.isReachUnLockLevel() && !v.getIs_buy() && !v.isTimeOut()) {
                    G_UserData.getRedPoint().clearRedPointShowFlag(FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_LEVEL_GIFT_PKG });
                    return;
                }
            }
        }
    }
    public _initUnitData() {
        this._unitDatas = [];
        let ActivityLevelGiftConfig = G_ConfigLoader.getConfig(ConfigNameConst.ACT_LEVEL_DISCOUNT);
        let indexs = ActivityLevelGiftConfig.index();
        for (let _ in indexs) {
            let v = indexs[_];
            this._updateUnitData(v, null, true);
        }
    }
    public _updateUnitData(id, data?, isIndex: boolean = false) {
        let unitData;
        if (!this._unitDatas[id]) {
            unitData = new ActivityLevelGiftPkgUnitData();
            this._unitDatas[id] = unitData;
            let ActivityLevelGiftConfig = G_ConfigLoader.getConfig(ConfigNameConst.ACT_LEVEL_DISCOUNT);
            let config;
            if (isIndex) {
                config = ActivityLevelGiftConfig.indexOf(id);
            } else {
                config = ActivityLevelGiftConfig.get(id);
            }

            console.assert(config != null, 'can not find level gift id = %s');
            unitData.setConfig(config);
            unitData.setId(id);
            let VipPayConfig = G_ConfigLoader.getConfig(ConfigNameConst.VIP_PAY);
            let vipConfig = VipPayConfig.get(config.good_id);
            console.assert(vipConfig != null, 'can not find level gift id = %s');
            unitData.setVipConfig(vipConfig);
        }
        unitData = this._unitDatas[id];
        if (data) {
            unitData.setStart_time(data.start_time);
            unitData.setIs_buy(data.buy > 0);
            if (data.start_time != 0) {
                G_ServiceManager.registerOneAlarmClock('WELFARE_LEVEL_GIFT' + id, data.start_time + unitData.getLimitTime() + 1, function () {
                    G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE);
                });
            }
        }
    }
    public c2sGetActLevelDiscount() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActLevelDiscount, {});
    }
    public _s2cGetActLevelDiscount(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let level_discount = message['level_discount'];
        if (level_discount) {
            for (let _ in level_discount) {
                let v = level_discount[_];
                this._updateUnitData(v.id - 1, v);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_LEVEL_GIFT_INFO);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE);
    }
    public _s2cActLevelDiscountAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let awards = message['awards'];
        if (awards) {
            G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_LEVEL_GIFT_AWARD, awards);
        }
    }
    public checkDataDirty() {
        let datas = {};
        for (let _ in this._unitDatas) {
            let v = this._unitDatas[_];
            if (v.isReachUnLockLevel() && v.getStart_time() == 0) {
                this.c2sGetActLevelDiscount();
                return;
            }
        }
        return datas;
    }
    public getListViewData() {
        let datas = [];
        for (let k in this._unitDatas) {
            let v = this._unitDatas[k];
            if (G_ConfigManager.isAppstore()) {
                datas.push(v);
            } else {
                let [isTimeOut] = v.isTimeOut();
                if (v.isReachShowLevel() && !v.getIs_buy()) {
                    if (!v.isReachUnLockLevel()) {
                        datas.push(v);
                    } else if (!isTimeOut) {
                        datas.push(v);
                    }
                }
            }
        }
        datas.sort(function (a, b) {
            let aConfig = a.getConfig();
            let bConfig = b.getConfig();
            let aUnlockLevel = aConfig.unlock_level;
            let bUnlockLevel = bConfig.unlock_level;
            if (aUnlockLevel == bUnlockLevel) {
                return a.getId() - b.getId();
            } else {
                return aUnlockLevel - bUnlockLevel;
            }
        });
        return datas;
    }
}
