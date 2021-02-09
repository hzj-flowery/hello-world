import { BaseData } from './BaseData';
import { ActivityBaseData } from './ActivityBaseData';
import { Slot } from '../utils/event/Slot';
import { MessageIDConst } from '../const/MessageIDConst';
import { G_NetworkManager, G_ServerTime, G_SignalManager } from '../init';
import { ActivityConst } from '../const/ActivityConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
import { clone } from '../utils/GlobleFunc';
import { FunctionConst } from '../const/FunctionConst';
let schema = {};
schema['baseActivityData'] = [
    'object',
    {}
];
schema['lastCheckinIndexs'] = [
    'object',
    {}
];
schema['lastCheckinTime'] = [
    'number',
    0
];
export interface ActivitySuperCheckinData {
getBaseActivityData(): ActivityBaseData
setBaseActivityData(value: ActivityBaseData): void
getLastBaseActivityData(): ActivityBaseData
getLastCheckinIndexs(): Object
setLastCheckinIndexs(value: Object): void
getLastLastCheckinIndexs(): Object
getLastCheckinTime(): number
setLastCheckinTime(value: number): void
getLastLastCheckinTime(): number
}
export class ActivitySuperCheckinData extends BaseData {

    public static schema = schema;
        public _signalRecvGetActCheckinSuper: Slot;
        public _signalRecvActCheckinSuper: Slot;

    constructor (properties?) {
        super(properties);
        let activityBaseData = new ActivityBaseData();
        activityBaseData.initData({ id: ActivityConst.ACT_ID_SUPER_CHECKIN });
        this.setBaseActivityData(activityBaseData);
        this._signalRecvGetActCheckinSuper = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActCheckinSuper, this._s2cGetActCheckinSuper.bind(this));
        this._signalRecvActCheckinSuper = G_NetworkManager.add(MessageIDConst.ID_S2C_ActCheckinSuper, this._s2cActCheckinSuper.bind(this));
    }
    public clear () {
        this._signalRecvGetActCheckinSuper.remove();
        this._signalRecvGetActCheckinSuper = null;
        this._signalRecvActCheckinSuper.remove();
        this._signalRecvActCheckinSuper = null;
    }
    public reset () {
    }
    public hasRedPoint () {
        return !this.isTodayCheckin();
    }
    public isTodayCheckin () {
        let lastCheckinTime = this.getLastCheckinTime();
        let lastCleanTime = G_ServerTime.getNextCleanDataTime() - 24 * 60 * 60;
        if (lastCheckinTime < lastCleanTime) {
            return false;
        }
        return true;
    }
    public c2sGetActCheckinSuper () {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActCheckinSuper, {});
    }
    public _s2cGetActCheckinSuper (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let last_checkin_time = message['last_checkin_time'];
        if (last_checkin_time) {
            this.setLastCheckinTime(last_checkin_time);
        }
        let last_award = message['last_award'];
        if (last_award) {
            let selectIndexs = {};
            for (let k in last_award) {
                let v = last_award[k];
                selectIndexs[v] = true;
            }
            this.setLastCheckinIndexs(selectIndexs);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_ACT_CHECKIN_SUPER_SUCCESS);
    }
    public c2sActCheckinSuper (award_indexs) {
        let selectIndexs = {};
        for (let k in award_indexs) {
            let v = award_indexs[k];
            selectIndexs[v] = true;
        }
        this.setLastCheckinIndexs(selectIndexs);
        G_NetworkManager.send(MessageIDConst.ID_C2S_ActCheckinSuper, { award_indexs: award_indexs });
    }
    public _s2cActCheckinSuper (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let last_checkin_time = message['last_checkin_time'];
        if (last_checkin_time) {
            this.setLastCheckinTime(last_checkin_time);
        }
        let reward = message['reward'];
        let awards = {};
        if (reward) {
            awards = clone(reward);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_ACT_CHECKIN_SUPER_SUCCESS, awards);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_SUPER_CHECKIN });
    }
}
 ActivitySuperCheckinData;