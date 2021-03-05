import { BaseData } from './BaseData';
import { G_UserData, G_ConfigLoader, G_ConfigManager } from '../init';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { ActivityConst } from '../const/ActivityConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import CommonConst from '../const/CommonConst';
import { FunctionCheck } from '../utils/logic/FunctionCheck';
let schema = {};
schema['lastSelectTabIndex'] = [
    'number',
    0
];
schema['lastSelectActId'] = [
    'number',
    0
];
export interface ActivityData {
    getLastSelectTabIndex(): number;
    setLastSelectTabIndex(value: number);
    getLastLastSelectTabIndex(): number;
    getLastSelectActId(): number;
    setLastSelectActId(value: number);
    getLastLastSelectActId(): number;
}
export class ActivityData extends BaseData {
    public static schema = schema;


    public clear() {
    }
    public reset() {
        this.setLastSelectTabIndex(0);
        this.setLastSelectActId(0);
    }
    public getActivityDataById(activityId) {
        if (activityId == ActivityConst.ACT_ID_MONTHLY_CARD) {
            return G_UserData.getActivityMonthCard();
        } else if (activityId == ActivityConst.ACT_ID_SIGNIN) {
            return G_UserData.getActivityDailySignin();
        } else if (activityId == ActivityConst.ACT_ID_DINNER) {
            return G_UserData.getActivityDinner();
        } else if (activityId == ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
            return G_UserData.getActivityOpenServerFund();
        } else if (activityId == ActivityConst.ACT_ID_LUXURY_GIFT_PKG) {
            return G_UserData.getActivityLuxuryGiftPkg();
        } else if (activityId == ActivityConst.ACT_ID_WEEKLY_GIFT_PKG) {
            return G_UserData.getActivityWeeklyGiftPkg();
        } else if (activityId == ActivityConst.ACT_ID_MONEY_TREE) {
            return G_UserData.getActivityMoneyTree();
        } else if (activityId == ActivityConst.ACT_ID_LEVEL_GIFT_PKG) {
            return G_UserData.getActivityLevelGiftPkg();
        } else if (activityId == ActivityConst.ACT_ID_RECHARGE_REBATE) {
            return G_UserData.getRechargeRebate();
        } else if (activityId == ActivityConst.ACT_ID_BETA_APPOINTMENT) {
            return G_UserData.getActivityBetaAppointment();
        } else if (activityId == ActivityConst.ACT_ID_RESROUCE_BACK) {
            return G_UserData.getActivityResourceBack();
        } else if (activityId == ActivityConst.ACT_ID_SUPER_CHECKIN) {
            return G_UserData.getActivitySuperCheckin();
        } else if (activityId > ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
            return G_UserData.getActivityOpenServerFund();
        }
        return null;
    }
    public getOpenActivityDataList() {
        return null;
    }
    public _createOpenActCfgListFromConfig() {
        
        let cfgList = [];
        let ActAdmin = G_ConfigLoader.getConfig(ConfigNameConst.ACT_ADMIN);
        let length = ActAdmin.length();
        let actOpenCheckFunc = function (cfg) {
            return cfg.is_work == CommonConst.TRUE_VALUE && (cfg.function_id == 0 && true || FunctionCheck.funcIsOpened(cfg.function_id)[0]);
        };
        let appstoreVerifyFilterFunc = function (cfg) {
            if (G_ConfigManager.isAppstore()) {
                if (cfg.show_control == ActivityConst.SHOW_ONLY_IN_NORMAL) {
                    return false;
                }
            } else {
                if (cfg.show_control == ActivityConst.SHOW_ONLY_IN_APPSTORE) {
                    return false;
                }
            }
            return true;
        };
        for (let i = 0; i < length; i += 1) {
            let cfg = ActAdmin.indexOf(i);
            if (actOpenCheckFunc(cfg)) {
                if (ActivityConst.ACT_ID_LEVEL_GIFT_PKG == cfg.id) {
                    let datas = G_UserData.getActivityLevelGiftPkg().getListViewData();
                    if (G_ConfigManager.isAppstore()) {
                        if (appstoreVerifyFilterFunc(cfg)) {
                            cfgList.push(cfg);
                        }
                    } else {
                        if (datas.length > 0) {
                            if (appstoreVerifyFilterFunc(cfg)) {
                                cfgList.push(cfg);
                            }
                        }
                    }
                } else {
                    if (appstoreVerifyFilterFunc(cfg)) {
                        cfgList.push(cfg);
                    }
                }
            }
        }
        cfgList.sort(function (act1, act2) {
            return act1.order - act2.order;
        });
        return cfgList;
    }
    public getOpenActivityCfgList() {
        return this._createOpenActCfgListFromConfig();
    }
    public hasActivityData(activityId) {
        let activityData = this.getActivityDataById(activityId);
        if (!activityData) {
            return false;
        }
        return activityData.getBaseActivityData().isHasData();
    }
    public pullActivityData(activityId) {
        let activityData = this.getActivityDataById(activityId) as any;
        if (!activityData) {
            return;
        }
        if (activityData.pullData && typeof activityData.pullData == 'function') {
            activityData.pullData();
        }
    }
    public hasRedPoint() {
        let actCfg = this.getOpenActivityCfgList();
        for (let k in actCfg) {
            let v = actCfg[k];
            let actData = this.getActivityDataById(v.id);
            let red = actData.hasRedPoint();
            if (red) {
                return true;
            }
        }
        return false;
    }
    public hasRedPointForSubAct(actId) {
        let actData = this.getActivityDataById(actId);
        if (actId > ActivityConst.ACT_ID_OPEN_SERVER_FUND) {
            return (actData as any).hasRedPointByFundGroup(UserDataHelper.getFundGroupByFundActivityId(actId));
        }
        return actData.hasRedPoint();
    }
}
ActivityData;