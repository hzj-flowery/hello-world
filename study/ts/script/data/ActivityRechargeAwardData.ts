import { BaseData } from './BaseData';
import { G_ConfigLoader, G_NetworkManager, G_SignalManager, G_UserData } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
import CommonConst from '../const/CommonConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
let schema = {};
schema['hasData'] = [
    'boolean',
    false
];
export interface ActivityRechargeAwardData {
    isHasData(): boolean
    setHasData(value: boolean): void
    isLastHasData(): boolean
}
export class ActivityRechargeAwardData extends BaseData {
    public static schema = schema;

    public _data;
    public _oldData;
    public _s2cActGetRechargeAwardListener;
    public _s2cActRechargeAwardListener;
    private _s2cActGetFirstRechargeInfoListener;
    private _s2cActGetFirstRechargeAwardListener;
    public _rechargeTimeData = {};
    private isNewFirstPay: boolean;

    constructor(properties?) {
        super(properties);
        super(properties)
        this._data = {};
        this._oldData = {};
        this._s2cActGetRechargeAwardListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActGetRechargeAward, this._s2cActGetRechargeAward.bind(this));
        this._s2cActRechargeAwardListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActRechargeAward, this._s2cActRechargeAward.bind(this));
        this._s2cActGetFirstRechargeInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActGetFirstRechargeInfo, this._s2cActGetFirstRechargeInfo.bind(this));
        this._s2cActGetFirstRechargeAwardListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActGetFirstRechargeAward, this._s2cActGetFirstRechargeAward.bind(this));
    }
    public clear() {
        this._s2cActGetRechargeAwardListener.remove();
        this._s2cActGetRechargeAwardListener = null;
        this._s2cActRechargeAwardListener.remove();
        this._s2cActRechargeAwardListener = null;
        this._s2cActGetFirstRechargeInfoListener.remove();
        this._s2cActGetFirstRechargeInfoListener = null;
        this._s2cActGetFirstRechargeAwardListener.remove();
        this._s2cActGetFirstRechargeAwardListener = null;
    }
    public reset() {
        this._data = {};
        this._oldData = {};
        this.setHasData(false);
    }
    public _initData(intMapArr) {
        this._oldData = this._data;
        this._data = {};
        for (let k in intMapArr) {
            let v = intMapArr[k];
            this._data[v.Key] = v.Value;
        }
        this.setHasData(true);
    }
    public _initRechargeTimeData(intMapArr) {
        this._rechargeTimeData = {};
        for (let k in intMapArr) {
            let v = intMapArr[k];
            this._rechargeTimeData[v.Key] = v.Value;
        }
    }
    public _s2cActGetRechargeAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (!this.isFirstPayFun()) return;
        let record = message['record'] || {};
        this._initData(record);
        G_SignalManager.dispatch(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO, id, message);
    }
    public _s2cActRechargeAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (!this.isFirstPayFun()) return;
        let record = message['record'] || {};
        this._initData(record);
        G_SignalManager.dispatch(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE, id, message);
    }

    public _s2cActGetFirstRechargeAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (this.isFirstPayFun()) return;
        let record = message['record'] || {};
        this._initData(record);
        G_SignalManager.dispatch(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_UPDATE, id, message);
    }
    public _s2cActGetFirstRechargeInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (this.isFirstPayFun()) return;
        let record = message['record'] || {};
        let recharge_time = message['recharge_time'] || {};
        this._initData(record);
        this._initRechargeTimeData(recharge_time);
        G_SignalManager.dispatch(SignalConst.EVENT_ACTIVITY_RECHARGE_AWARD_GET_INFO, id, message);
    }
    public getRecordById(id) {
        return this._data[id] || CommonConst.RECEIVE_NOT;
    }
    public isRecordChanged(id) {
        if (this.getRecordById(id) == this._oldData[id]) {
            return false;
        } else {
            return true;
        }
    }

    private isFirstPayFun() {
        if (this.isNewFirstPay === undefined) {
            const openTime = G_UserData.getBase().getServer_open_time()
            const end_time = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(2015).content;
            this.isNewFirstPay = (openTime < end_time)
        }
        return this.isNewFirstPay;
    }
    public c2sActGetRechargeAward() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActGetRechargeAward, {});
    }
    public c2sActRechargeAward(record) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActRechargeAward, { record: record });
    }
    public c2sActGetFirstRechargeInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActGetFirstRechargeInfo, {});
    }
    public c2sActGetFirstRechargeAward(record) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActGetFirstRechargeAward, { record: record });
    }
    public pullData() {
        this.c2sActGetRechargeAward();
    }
}