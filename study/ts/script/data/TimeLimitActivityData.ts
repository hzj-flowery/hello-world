import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { ActivitySevenDaySprintInfoData } from "./ActivitySevenDaySprintInfoData";
import { FunctionConst } from "../const/FunctionConst";
import { TimeLimitActivityConst } from "../const/TimeLimitActivityConst";

export interface TimeLimitActivityData {
}
let schema = {};
export class TimeLimitActivityData extends BaseData {
    public static schema = schema;

        _sprintActUnitList;
        _s2cGetSevenDaySprintInfoListener;
    constructor(properties?) {
        super(properties);
        this._sprintActUnitList = {};
        this._s2cGetSevenDaySprintInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSevenDaySprintInfo, this._s2cGetSevenDaySprintInfo.bind(this));
    }
    public clear() {
        super.clear();
        this._s2cGetSevenDaySprintInfoListener.remove();
        this._s2cGetSevenDaySprintInfoListener = null;
    }
    public reset() {
    }
    public _s2cGetSevenDaySprintInfo(id, message) {
        let sprintInfoList = message['sprint_info'] || {};
        for (let k in sprintInfoList) {
            let v = sprintInfoList[k];
            this._createSprintActUnitData(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_INFO);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_ACTIVITY);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
    }
    public _createSprintActUnitData(v) {
        let unitData = new ActivitySevenDaySprintInfoData(v);
        this._sprintActUnitList[unitData.getType()] = unitData;
    }
    public getSprintActUnitData(actType) {
        return this._sprintActUnitList[actType];
    }
    public getSprintActUnitList() {
        return this._sprintActUnitList;
    }
    public getActivityDataById(actType, actId) {
        if (TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == actType) {
            return G_UserData.getCustomActivity();
        } else if (TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT == actType) {
            if (actId == TimeLimitActivityConst.ACTIVITY_TYPE_GUILD_SPRINT) {
                return G_UserData.getGuildSprint();
            }
        } else if (TimeLimitActivityConst.ID_TYPE_THREEKINDOMS == actType) {
            return G_UserData.getCustomActivity().getThreeKindomsData();
        }
        return null;
    }
    public hasRedPoint() {
        let sprintActUnitList = this.getSprintActUnitList();
        for (let k in sprintActUnitList) {
            let v = sprintActUnitList[k];
            let data = this.getActivityDataById(TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT, v.getType());
            if (data && data.hasRedPoint && data.hasRedPoint()) {
                // cc.warn('TimeLimitActivityData --------------  ' + String(v.getType()));
                return true;
            }
        }
        if (G_UserData.getCustomActivity().hasRedPoint()) {
            // cc.warn('TimeLimitActivityData --------------  ');
            return true;
        }
        return false;
    }
    public hasRedPointForSubAct(actType, actId) {
        let actData = this.getActivityDataById(actType, actId);
        if (!actData) {
            return false;
        }
        if (TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT == actType) {
            return actData.hasRedPointByActId(actId);
        } else if (TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT == actType) {
            return actData.hasRedPoint();
        } else if (TimeLimitActivityConst.ID_TYPE_THREEKINDOMS == actType) {
            return actData.hasRedPoint();
        }
        return false;
    }
    public hasTimeLimitActivityCanVisible() {
        let sprintActUnitList = this.getSprintActUnitList();
        for (let k in sprintActUnitList) {
            let v = sprintActUnitList[k];
            let data = this.getActivityDataById(TimeLimitActivityConst.ID_TYPE_SEVEN_DAYS_SPRINT, v.getType());
            if (data && data.hasActivityCanVisible && data.hasActivityCanVisible()) {
                return true;
            }
        }
        if (G_UserData.getCustomActivity().hasActivityCanVisible()) {
            return true;
        }
        return false;
    }
    public hasTaskLimitCanVisible():boolean{
        return true;
    }
    public checkTimeLimitActivityChange() {
        G_UserData.getCustomActivity().checkTimeLimitActivityChange();
    }
}
