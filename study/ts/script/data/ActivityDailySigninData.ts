import { ActivityBaseData } from './ActivityBaseData';
import { ActivityConst } from '../const/ActivityConst';
import { BaseData } from './BaseData';
import { G_NetworkManager, G_ConfigLoader, G_SignalManager } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { Slot } from '../utils/event/Slot';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
import { FunctionConst } from '../const/FunctionConst';
let schema = {};
schema['config'] = [
    'object',
    {}
];
schema['state'] = [
    'number',
    0
];
schema['day'] = [
    'number',
    0
];
export interface ActivityDailySigninUnitData {
    getConfig(): Object;
    setConfig(value: Object);
    getLastConfig(): Object;
    getState(): number;
    setState(value: number);
    getLastState(): number;
    getDay(): number;
    setDay(value: number);
    getLastDay(): number;
}
export class ActivityDailySigninUnitData extends BaseData {

    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public initData(month, day, state) {
        this.setState(state);
        this.setDay(day);
        let ActCheckin = G_ConfigLoader.getConfig(ConfigNameConst.ACT_CHECKIN);
        let info = ActCheckin.get(month, day);
        console.assert(info, 'act_checkin can\'t find month = ' + (String(month) + (' day = ' + String(day))));
        this.setConfig(info);
    }
}

schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
schema['checkinCount'] = [
    'number',
    0
];
schema['checkinMonth'] = [
    'number',
    0
];
export interface ActivityDailySigninData {
    getBaseActivityData(): ActivityBaseData;
    setBaseActivityData(value: ActivityBaseData);
    getLastBaseActivityData(): ActivityBaseData;
    getCheckinCount(): number;
    setCheckinCount(value: number);
    getLastCheckinCount(): number;
    getCheckinMonth(): number;
    setCheckinMonth(value: number);
    getLastCheckinMonth(): number;
}
export class ActivityDailySigninData extends BaseData {

    public static schema = schema;

    public _signinUnitDataList;
    public _s2cGetActCheckinListener: Slot
    public _s2cActCheckinListener: Slot
    public _s2cActReCheckinListener: Slot

    constructor(properties?) {
        super(properties)
        this._signinUnitDataList = [];
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_SIGNIN });
        this.setBaseActivityData(activityBaseData);
        this._s2cGetActCheckinListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActCheckin, this._s2cGetActCheckin.bind(this));
        this._s2cActCheckinListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActCheckin, this._s2cActCheckin.bind(this));
        this._s2cActReCheckinListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActReCheckin, this._s2cActReCheckin.bind(this));
    }
    public clear() {
        super.clear();
        this._s2cGetActCheckinListener.remove();
        this._s2cGetActCheckinListener = null;
        this._s2cActCheckinListener.remove();
        this._s2cActCheckinListener = null;
        this._s2cActReCheckinListener.remove();
        this._s2cActReCheckinListener = null;
        this.getBaseActivityData().clear();
    }
    public reset() {
        this.reset();
        this.getBaseActivityData().reset();
        this._signinUnitDataList = [];
    }
    public _createSignUnitData(month, day, state) {
        let actDailySigninUnitData = new ActivityDailySigninUnitData();
        actDailySigninUnitData.initData(month, day, state);
        this._signinUnitDataList.push(actDailySigninUnitData);
    }
    public _setUnitData(month, day, state) {
        let unitData = this._signinUnitDataList[day-1];
        if (unitData) {
            unitData.initData(month, day, state);
        }
    }
    public _setSignSuccess(month, day) {
        let unitData = this._signinUnitDataList[day-1];
        if (unitData) {
            unitData.initData(month, day, ActivityConst.CHECKIN_STATE_PASS_TIME);
        }
    }
    public _s2cGetActCheckin(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.getBaseActivityData().setHasData(true);
        this.resetTime();
        this._signinUnitDataList = [];
        this.setCheckinCount(message.checkin_count);
        this.setCheckinMonth(message.checkin_month);
        let checkinDay = message['checkin_day'] || [];
        for (let k = 0; k < checkinDay.length; k++) {
            let v = checkinDay[k];
            this._createSignUnitData(message.checkin_month, k + 1, v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_SIGNIN_GET_INFO, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_SIGNIN });
    }
    public _s2cActCheckin(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setCheckinCount(this.getCheckinCount() + 1);
        this._setSignSuccess(this.getCheckinMonth(), message.day + 1)//, ActivityConst.CHECKIN_STATE_PASS_TIME); 多了参数
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_SIGNIN_DO_SIGNIN, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_SIGNIN });
    }
    public _s2cActReCheckin(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.setCheckinCount(this.getCheckinCount() + 1);
        this._setSignSuccess(this.getCheckinMonth(), message.day + 1)//, ActivityConst.CHECKIN_STATE_PASS_TIME);  多了参数
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_SIGNIN_DO_SIGNIN, id, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_SIGNIN });
    }
    public getCurrSignDay() {
        let allSigninUnitData = this.getAllSigninUnitDatas();
        for (let k in allSigninUnitData) {
            let dailySigninUnitData = allSigninUnitData[k];
            let state = dailySigninUnitData.getState();
            if (state == ActivityConst.CHECKIN_STATE_RIGHT_TIME) {
                return dailySigninUnitData.getDay();
            }
        }
        return null;
    }
    public getSigninUnitDataByDay(day) {
        if (day <= 0) {
            return null;
        }
        return this._signinUnitDataList[day-1];
    }
    public getAllSigninUnitDatas() {
        return this._signinUnitDataList;
    }
    public pullData() {
        console.warn('pullData    ActivityDailySigninData ');
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActCheckin, {});
    }
    public resetData() {
        this.pullData();
        this.setNotExpire();
    }
    public c2sActCheckin() {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActCheckin, {});
    }
    public c2sActReCheckin(day) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActReCheckin, { day: day - 1 });
    }
    public getReSigninCostGold() {
        return this.getBaseActivityData().getActivityParameter(ActivityConst.ACT_PARAMETER_INDEX_RESIGNIN_COST_GOLD);
    }
    public hasRedPoint() {
        let allSigninUnitData = this.getAllSigninUnitDatas();
        for (let k in allSigninUnitData) {
            let dailySigninUnitData = allSigninUnitData[k];
            let state = dailySigninUnitData.getState();
            if (state == ActivityConst.CHECKIN_STATE_RIGHT_TIME) {
                return true;
            }
        }
        return false;
    }
}