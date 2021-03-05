import { BaseService } from "./BaseService";
import { G_SceneManager, G_UserData, G_ServerTime, G_SignalManager } from "../init";
import { TimeConst } from "../const/TimeConst";
import { SignalConst } from "../const/SignalConst";

export class DataResetService extends BaseService {
    public _lastNoticeTimeList;
    constructor() {
        super();
        this.start();
        this._lastNoticeTimeList = {};
    }
    public tick() {
        var runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName == 'fight' || runningSceneName == 'login') {
            return;
        }
        var loginTime = G_UserData.getBase().getOnline_time_update_time();
        if (loginTime <= 0) {
            return;
        }
        var time = G_ServerTime.getTime();
        for (let k in TimeConst.RESET_TIME_LIST) {
            var v = TimeConst.RESET_TIME_LIST[k];
            this._lastNoticeTimeList[k] = this._lastNoticeTimeList[k] || loginTime;
            var expired = G_ServerTime.isTimeExpired(this._lastNoticeTimeList[k] || 0, v);
            if (expired) {
                this._lastNoticeTimeList[k] = time;
                G_SignalManager.dispatch(SignalConst.EVENT_COMMON_ZERO_NOTICE, v);
                console.log('------------------------------------------DataResetService:EVENT_COMMON_ZERO_NOTICE');
            }
        }
    }
}
