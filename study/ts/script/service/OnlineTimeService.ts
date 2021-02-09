import { BaseService } from "./BaseService";
import { G_ServerTime, G_ServiceManager, G_UserData, G_GameAgent, G_ConfigManager } from "../init";

export class OnlineTimeService extends BaseService {
    private _isNoticeRealName:boolean;
    constructor() {
        super();
        this._isNoticeRealName = false;
        this.start();
    }
    public initData() {
        let refreshTime = G_ServerTime.secondsFromZero() + 86400;
        G_ServiceManager.registerOneAlarmClock('onLineRefreshTime', refreshTime, function () {
            G_UserData.getBase().c2sGetTotalOnlineTime();
        });
    }
    public clear() {
        this._isNoticeRealName = false;
    }
    public tick() {
        if (G_GameAgent.isRealName()) {
            return;
        }
        if (!G_ConfigManager.isAvoidHooked()) {
            return;
        }
        if (this._isNoticeRealName) {
            return;
        }
        let canPlay = G_UserData.getBase().checkRealName();
        if (!canPlay) {
            this._isNoticeRealName = true;
        }
    }
}
