
import { BaseData } from './BaseData';
import { DinnerConst } from '../const/DinnerConst';
import { G_ServerTime, G_ConfigLoader, G_NetworkManager, G_SignalManager } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { ActivityBaseData } from './ActivityBaseData';
import { ActivityConst } from '../const/ActivityConst';
import { MessageIDConst } from '../const/MessageIDConst';
import { Slot } from '../utils/event/Slot';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
import { FunctionConst } from '../const/FunctionConst';
import { TimeConst } from '../const/TimeConst';





let unitSchema = {};
unitSchema['config'] = [
    'object',
    {}
];
unitSchema['state'] = [
    'number',
    0
];
unitSchema['id'] = [
    'number',
    0
];
unitSchema['day'] = [
    'number',
    0
];
unitSchema['startTime'] = [
    'number',
    0
];
unitSchema['endTime'] = [
    'number',
    0
];
export interface ActivityDinnerUnitData {
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
    getState(): number
    setState(value: number): void
    getLastState(): number
    getId(): number
    setId(value: number): void
    getLastId(): number
    getDay(): number
    setDay(value: number): void
    getLastDay(): number
    getStartTime(): number
    setStartTime(value: number): void
    getLastStartTime(): number
    getEndTime(): number
    setEndTime(value: number): void
    getLastEndTime(): number
}
export class ActivityDinnerUnitData extends BaseData {
    public static schema = unitSchema;

    public clear() {
    }
    public reset() {
    }
    public hasEatDinner() {
        return this.getState() == DinnerConst.DINNER_STATE_EAT;
    }
    public isInDinnerTime() {
        let curTime = G_ServerTime.getTime();
        let hasSeconds = G_ServerTime.secondsFromToday(curTime);
        if (this.getStartTime() <= hasSeconds && this.getEndTime() >= hasSeconds) {
            return true;
        }
        return false;
    }
    public _convertTimeStrToSecond(timeStr) {
        let second = 0;
        let secondRates = [
            3600,
            60,
            1
        ];
        let strArr = timeStr.split('|');
        for (let k in strArr) {
            let v = strArr[k];
            let number = Number(v);
            if (number && secondRates[k]) {
                second = second + secondRates[k] * number;
            }
        }
        return second;
    }
    // public _split(str, sep) {
    //     if (str == null || str == '') {
    //         return {};
    //     }
    //     sep = sep || '\t';
    //     let fields = {};
    //     let pattern = '([^%s]+)'.format(sep);
    //     string.gsub(str, pattern, function (c) {
    //         fields[fields.length + 1] = c;
    //     });
    //     return fields;
    // }
    public initData(day, id, state) {
        this.setDay(day);
        this.setId(id);
        this.setState(state);
        let ActDinner = G_ConfigLoader.getConfig(ConfigNameConst.ACT_DINNER);
        let info = ActDinner.get(id);
        console.assert(info, 'act_dinner can\'t find id = ' + String(id));
        this.setConfig(info);
        this.setStartTime(this._convertTimeStrToSecond(info.start_time));
        this.setEndTime(this._convertTimeStrToSecond(info.end_time));
    }
}

let schema = {};
schema['currDay'] = [
    'number',
    0
];
schema['baseActivityData'] = [
    'object',
    {}
];

export interface ActivityDinnerData {
    getCurrDay(): number
    setCurrDay(value: number): void
    getLastCurrDay(): number
    getBaseActivityData(): ActivityBaseData
    setBaseActivityData(value: ActivityBaseData): void
    getLastBaseActivityData(): ActivityBaseData
}
export class ActivityDinnerData extends BaseData {
    public static schema = schema;

        public _unitDataList;
        public _todayUnitDataList:any[];
        public _s2cGetActDinnerListener: Slot;
        public _s2cActDinnerListener: Slot;
        public _s2cActReDinnerListener: Slot;
        public _canEat: boolean;

    constructor(properties?) {
        super(properties);
        super(properties)
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_DINNER });
        this.setBaseActivityData(activityBaseData);
        this._unitDataList = {};
        this._todayUnitDataList = this._createTodayDinnerUnitDataFromCfg();
        this._s2cGetActDinnerListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActDinner, this._s2cGetActDinner.bind(this));
        this._s2cActDinnerListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActDinner, this._s2cActDinner.bind(this));
        this._s2cActReDinnerListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ActReDinner, this._s2cActReDinner.bind(this));
        this._canEat = false;
    }
    public clear() {
        super.clear();
        this._s2cGetActDinnerListener.remove();
        this._s2cGetActDinnerListener = null;
        this._s2cActDinnerListener.remove();
        this._s2cActDinnerListener = null;
        this._s2cActReDinnerListener.remove();
        this._s2cActReDinnerListener = null;
        this.getBaseActivityData().clear();
    }
    public reset() {
        super.reset();
        this.getBaseActivityData().reset();
        this._unitDataList = {};
        this._todayUnitDataList = this._createTodayDinnerUnitDataFromCfg();
    }
    public _createTodayDinnerUnitDataFromCfg() {
        let unitDataList = [];
        let ActDinner = G_ConfigLoader.getConfig(ConfigNameConst.ACT_DINNER);
        let length = ActDinner.length();
        for (let i = 0; i < length; i += 1) {
            let cfg = ActDinner.indexOf(i);
            let unitData = new ActivityDinnerUnitData();
            unitData.initData(0, cfg.id, DinnerConst.DINNER_STATE_NOT_EAT);
            //unitDataList[cfg.id] = unitData;
            unitDataList.push(unitData);
        }
        return unitDataList;
    }
    public _makeKey(day, id) {
        return String(day) + ('_' + id);
    }
    public _onAllDataReady() {
        this.pullData();
    }
    public _s2cGetActDinner(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.getBaseActivityData().setHasData(true);
        this.resetTime();
        this._unitDataList = {};
        this.setCurrDay(message.day);
        let dinners = message['dinner'] || [];
        for (let k = 0; k < dinners.length; k++) {
            let v = dinners[k];
            let day = v.day;
            let ids = v['ids'] || [];
            let states = v['states'] || [];
            if (message.day == day) {
                for (let k1 = 0; k1 < ids.length; k1++) {
                    let v1 = ids[k1];
                    let unitData = this.getTodayDinnerUnitData(v1);
                    unitData.initData(day, v1, states[k1]);
                    let key = this._makeKey(day, v1);
                    this._unitDataList[key] = unitData;
                }
            } else {
                for (let k1 in ids) {
                    let v1 = ids[k1];
                    let unitData = new ActivityDinnerUnitData();
                    unitData.initData(day, v1, states[k1]);
                    let key = this._makeKey(day, v1);
                    this._unitDataList[key] = unitData;
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_DINNER_GET_INFO, id, message);
        this._dispatchDinnerEvent();
    }
    public _s2cActDinner(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let currUnitData = this.getTodayDinnerUnitData(message.id);
        if (currUnitData) {
            currUnitData.setState(DinnerConst.DINNER_STATE_EAT);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_DINNER_EAT, id, message);
        this._dispatchDinnerEvent();
        this.setCanEat(false);
    }
    public _s2cActReDinner(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        for (let k in this._unitDataList) {
            let v = this._unitDataList[k];
            if (v.getDay() != this.getCurrDay()) {
                v.setState(DinnerConst.DINNER_STATE_EAT);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_WELFARE_DINNER_REEAT, id, message);
        this._dispatchDinnerEvent();
    }
    public _dispatchDinnerEvent() {
        let missDinner = this.hasMissEatDinner();
        G_SignalManager.dispatch(SignalConst.EVENT_ACT_DINNER_RESIGNIN, missDinner);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_DINNER });
    }
    public getCurrDinnerUnitData() {
        let curTime = G_ServerTime.getTime();
        let hasSeconds = G_ServerTime.secondsFromToday(curTime);
        for (let k in this._todayUnitDataList) {
            let v = this._todayUnitDataList[k];
            if (v.getStartTime() <= hasSeconds && v.getEndTime() >= hasSeconds) {
                return v;
            }
        }
        return null;
    }
    public getRecentDinnerUnitData() {
        let curTime = G_ServerTime.getTime();
        let hasSeconds = G_ServerTime.secondsFromToday(curTime);
        let num =(this._todayUnitDataList.length);
        if(num <= 0){
            return null;
        }
        for (let i = num; i >= 1; i -= 1) {
            let v = this._todayUnitDataList[i-1];
            if (hasSeconds >= v.getStartTime()) {
                return v;
            }
        }
        let lastUnitData = this._todayUnitDataList[num-1];
        return lastUnitData;
    }
    public getNextDinnerUnitData() {
        let curTime = G_ServerTime.getTime();
        let hasSeconds = G_ServerTime.secondsFromToday(curTime);
        let zeroTime = TimeConst.RESET_TIME * 3600;
        for (let k in this._todayUnitDataList) {
            let v = this._todayUnitDataList[k];
            if (hasSeconds >= zeroTime && hasSeconds < v.getStartTime()) {
                return v;
            }
        }
        return null;
    }
    public getTodayDinnerUnitData(id) {
        for (let k in this._todayUnitDataList) {
            let v = this._todayUnitDataList[k];
            if (v.getId() == id) {
                return v;
            }
        }
        return null;
    }
    public getTodayAllDinnerUnitDatas():any[] {
        return this._todayUnitDataList;
    }
    public hasMissEatDinner() {
        return false;
    }
    public getMissEatDinnerDataList() {
        let dinnerDataList = [];
        let curTime = G_ServerTime.getTime();
        let hasSeconds = G_ServerTime.secondsFromToday(curTime);
        for (let k in this._unitDataList) {
            let v = this._unitDataList[k];
            if (v.getDay() != this.getCurrDay()) {
                if (!v.hasEatDinner()) {
                    dinnerDataList.push(v);
                }
            } else {
            }
        }
        return dinnerDataList;
    }
    public c2sGetActDinner() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActDinner, {});
    }
    public c2sActDinner() {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActDinner, {});
    }
    public c2sActReDinner() {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActReDinner, {});
    }
    public pullData() {
        this.c2sGetActDinner();
    }
    public resetData() {
        this.pullData();
        this.setNotExpire();
    }
    public hasRedPoint() {
        let currDinnerUnitData = this.getCurrDinnerUnitData();
        if (currDinnerUnitData) {
            return !currDinnerUnitData.hasEatDinner();
        }
        return false;
    }
    public getCanEat() {
        if (this._canEat) {
            return false;
        }
        this._canEat = this.hasRedPoint();
        return this._canEat;
    }
    public setCanEat(canEat) {
        this._canEat = Boolean(canEat);
    }
}