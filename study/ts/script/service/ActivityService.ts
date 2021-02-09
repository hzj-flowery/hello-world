import { BaseService } from "./BaseService";
import { G_SceneManager, G_UserData, G_SignalManager } from "../init";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
import { ActivityConst } from "../const/ActivityConst";

export class ActivityService extends BaseService {
    
    constructor() {
        super();
        this.start();
    }

    public tick() {
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'activity') {
            return;
        }
        let isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_WELFARE)[0];
        if (!isOpen) {
            return;
        }
        this._dailySignTick();
        this._eatVitTick();
        this._monthCardTick();
        this._luxuryGiftPackageTick();
        this._moneyTreeTick();
        this._weekGiftPackageTick();
    }
    public _dailySignTick() {
        if (G_UserData.getActivityDailySignin().isExpired()) {
            console.log('------------------------------------------_dailySignTick:expired');
            G_UserData.getActivityDailySignin().resetData();
        }
    }
    public _eatVitTick() {
        if (G_UserData.getActivityDinner().isExpired()) {
            console.log('------------------------------------------_eatVitTick:expired');
            G_UserData.getActivityDinner().resetData();
        }
        if (G_UserData.getActivityDinner().getCanEat()) {
            console.log('------------------------------------------ActivityService:_eatVitTick can eat vit');
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_WELFARE, { actId: ActivityConst.ACT_ID_DINNER });
        }
    }
    public _monthCardTick() {
        if (G_UserData.getActivityMonthCard().isExpired()) {
            console.log('------------------------------------------_monthCardTick:expired');
            G_UserData.getActivityMonthCard().resetData();
        }
    }
    public _luxuryGiftPackageTick() {
        if (G_UserData.getActivityLuxuryGiftPkg().isExpired()) {
            console.log('------------------------------------------_luxuryGiftPackageTick:expired');
            G_UserData.getActivityLuxuryGiftPkg().resetData();
        }
    }
    public _moneyTreeTick() {
        if (G_UserData.getActivityMoneyTree().isExpired()) {
            console.log('------------------------------------------_moneyTreeTick:expired');
            G_UserData.getActivityMoneyTree().resetData();
        }
    }
    public _weekGiftPackageTick() {
        if (G_UserData.getActivityWeeklyGiftPkg().isExpired()) {
            console.log('------------------------------------------_weekGiftPackageTick:expired');
            G_UserData.getActivityWeeklyGiftPkg().resetData();
        }
    }
}
