import { BaseService } from "./BaseService";
import { G_ServerTime, G_SignalManager } from "../init";
import { SignalConst } from "../const/SignalConst";

export class AlarmClockService extends BaseService {
    public _clock = {};
    public _isTickStart: boolean;
    public _oldTime: number;
    constructor() {
        super();
        this._clock = {};
        this._isTickStart = false;
        this._oldTime = 0;
        this.start();
    }

    public initData() {
        var registerCleanDataClock = function () {
            let nextCleanDataClock = G_ServerTime.getNextCleanDataTime();
            this.registerAlarmClock('CLEAN_DATA_CLOCK', nextCleanDataClock, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_CLEAN_DATA_CLOCK);
                registerCleanDataClock();
            });
        }.bind(this);
        var registerZeroClock = function () {
            let nextZeroClock = G_ServerTime.getNextZeroTime();
            this.registerAlarmClock('ZERO_CLOCK', nextZeroClock, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_ZERO_CLOCK);
                registerZeroClock();
            });
        }.bind(this)
        registerCleanDataClock();
        registerZeroClock();
    }
    public clear() {
        this._clock = {};
        this._isTickStart = false;
        this._oldTime = 0;
    }
    public tick() {
        let curTime = G_ServerTime.getTime();
        if (!this._isTickStart) {
            this._isTickStart = true;
            this._oldTime = curTime;
        }
        if (curTime - this._oldTime > 15) {
            G_SignalManager.dispatch(SignalConst.EVENT_MAY_ENTER_FOREGROUND);
        }
        this._oldTime = curTime;
        for (let k in this._clock) {
            let v = this._clock[k];
            if (v&&curTime >= v.time) {
                this._clock[k] = null;
                v.callback();
            }
        }
    }
    public registerAlarmClock(tag, time, callback) {
        if (!tag || !time || !callback) {
            return;
        }
        let temp = {
            time: time,
            callback: callback
        };
        this._clock[tag] = temp;
    }
    public deleteAlarmClock(tag) {
        this._clock[tag] = null;
    }
}
