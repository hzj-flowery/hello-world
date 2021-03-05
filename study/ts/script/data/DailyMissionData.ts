import { G_NetworkManager, G_UserData, G_ConfigLoader, G_SignalManager, G_ConfigManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { BaseData } from "./BaseData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { ArraySort } from "../utils/handler";
import { SignalConst } from "../const/SignalConst";
import { TypeConvertHelper } from "../utils/TypeConvertHelper";
import { DataConst } from "../const/DataConst";
import { FunctionConst } from "../const/FunctionConst";

let DAILY_PREV = 'daily_';
export class DailyMissionData extends BaseData {
    public static DIALY_ACTIVITY_TYPE = 201;
    public static DIALY_TASK_TYPE = 1;
    public static PARAM_LIME_SHOW_KEY = 175;

    _getDailyInfo;
    _getDailyReward;
    _getDailyInfoUpdate;
    _vipFuncDataList;
    _dailyMissionList;
    _level;

    constructor(properties?) {
        super(properties);
        this._getDailyInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetDailyTaskInfo, this._s2cGetDailyTaskInfo.bind(this));
        this._getDailyReward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetDailyTaskAward, this._s2cGetDailyTaskReward.bind(this));
        this._getDailyInfoUpdate = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateDailyTaskInfo, this._s2cUpdateDailyTaskInfo.bind(this));
        this._vipFuncDataList = null;
        this._dailyMissionList = {};
    }
    public clear() {
        this._getDailyInfo.remove();
        this._getDailyInfo = null;
        this._getDailyReward.remove();
        this._getDailyReward = null;
    }
    public reset() {
    }
    public _setOneDailyDailyMissionData(mission) {
        if (mission == null || typeof mission != 'object') {
            return;
        }
        let t: any = {
            type: mission.type,
            value: mission.value
        };
        if (mission.hasOwnProperty('reward_id')) {
            t.reward_id = mission.reward_id;
        } else {
            t.reward_id = [];
        }
        this._dailyMissionList[DAILY_PREV + t.type] = t;
    }
    public updateDailyTaskData(message) {
        if (message == null || typeof message != 'object') {
            return;
        }
        let dailyMissions = message['tasks'] || [];
        for (let i = 0; i < dailyMissions.length; i++) {
            this._setOneDailyDailyMissionData(dailyMissions[i]);
        }
    }
    public _getDailyMisssions(isActivityData) {
        let level = this._level;
        let curLevelTasks = [];
        let saveData = function (oneTask) {
            let minLevel = Number(oneTask['level_min']);
            let maxLevel = Number(oneTask['level_max']);
            let minDay = Number(oneTask['day_min']);
            let maxDay = Number(oneTask['day_max']);
            let functionId = Number(oneTask['function_id']);
            let openServerDay = G_UserData.getBase().getOpenServerDayNum();
            if (this._level >= minLevel && maxLevel >= this._level && (openServerDay >= minDay && openServerDay <= maxDay)) {
                if (functionId == FunctionConst.FUNC_SHARE_GO) {
                    if (G_ConfigManager.isShare()) {
                        curLevelTasks[curLevelTasks.length] = oneTask;
                    }
                } else {
                    curLevelTasks[curLevelTasks.length] = oneTask;
                }
            }
        }.bind(this);
        let DailyTaskInfo = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_TASK);
        for (let index = 0; index < DailyTaskInfo.length(); index++) {
            let oneTask = DailyTaskInfo.indexOf(index);
            console.assert(oneTask, 'Could not find the task info id : ' + String(index));
            let taskName = oneTask['name'];
            oneTask['name'] = taskName.format(oneTask['require_value']);
            let require_type = Number(oneTask['condition']);
            let condition = true;
            oneTask.value = 0;
            oneTask.finish = false;
            oneTask.getAward = false;
            if (isActivityData == false && DailyMissionData.DIALY_ACTIVITY_TYPE != require_type) {
                let openFuncId = oneTask['level_function_id'];
                let funInfo = null;
                if (openFuncId > 0) {
                    funInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(openFuncId);
                    console.assert(funInfo, ' can not find function_level in daily_task id=' + oneTask.id);
                    let isOpen = G_UserData.getBase().getLevel() >= funInfo.level;
                    if (isOpen) {
                        oneTask.icon = funInfo && funInfo.icon;
                        saveData(oneTask);
                    }
                }
            } else if (isActivityData == true && DailyMissionData.DIALY_ACTIVITY_TYPE == require_type) {
                saveData(oneTask);
            }
        }
        return curLevelTasks;
    }
    public getNewAward() {
        let award1 = this.hasAnyRewardCanGet(true) > 0;
        let award2 = this.hasAnyRewardCanGet(false) > 0;
        return award1 || award2;
    }
    public hasAnyRewardCanGet(isActivityData) {
        let dailyMissions = this.getDailyMissionDatas(isActivityData);
        let canGetAwardNum = 0;
        for (let i = 0; i < dailyMissions.length; i++) {
            let mission = dailyMissions[i];
            let value = Number(mission['value']);
            if (!mission.getAward && mission.value >= mission.require_value) {
                canGetAwardNum = canGetAwardNum + 1;
                break;
            }
        }
        return canGetAwardNum;
    }
    public getDailyMisssonDataById(missionId) {
        let dataList = this.getDailyMissionDatas();
        for (let i in dataList) {
            let value = dataList[i];
            if (value.id == missionId) {
                return value;
            }
        }
        return null;
    }
    public getDailyMissionDatas(isActivityData?) {
        let dailyMission = this._getDailyMisssions(isActivityData);
        if (dailyMission == null) {
            return [];
        }
        function isRewardTake(serverTask, missionId) {
            if (serverTask.reward_id) {
                for (let j = 0; j < serverTask.reward_id.length; j++) {
                    if (serverTask.reward_id[j] == missionId) {
                        return true;
                    }
                }
            }
            return false;
        }
        for (let i = 0; i < dailyMission.length; i++) {
            let serverTask = this._dailyMissionList[DAILY_PREV + dailyMission[i].condition];
            if (serverTask) {
                dailyMission[i].value = serverTask.value;
                dailyMission[i].finish = dailyMission[i].value >= dailyMission[i].require_value;
                dailyMission[i].getAward = isRewardTake(serverTask, dailyMission[i].id);
            }
        }
        ArraySort(dailyMission, function (item1, item2) {
            if (item1.order != item2.order) {
                return item1.order < item2.order;
            }
        });
        if (isActivityData == false) {
            ArraySort(dailyMission, function (a, b) {
                let canGetAward_a = a.value >= a.require_value && !a.getAward;
                let canGetAward_b = b.value >= b.require_value && !b.getAward;
                if (a.getAward != b.getAward) {
                    return !a.getAward;
                } else if (canGetAward_a != canGetAward_b) {
                    return canGetAward_a;
                } else if (a.order != b.order) {
                    return a.order < b.order;
                } else {
                    return a.id < b.id;
                }
            });
        }
        return dailyMission;
    }
    public getActivityDatas() {
        let boxRewardData = null;
        let serverTasks = this._dailyMissionList;
        if (serverTasks) {
            for (let k in serverTasks) {
                let task = serverTasks[k];
                if (task.type == DailyMissionData.DIALY_ACTIVITY_TYPE) {
                    boxRewardData = task;
                }
            }
        }
        return boxRewardData;
    }
    public getActivityConfigDatas() {
        let activityRewards = this._getDailyMisssions(true);
        ArraySort(activityRewards, function (item1, item2) {
            return item1.require_value < item2.require_value;
        });
        function isRewardTake(serverTask, activiyId) {
            if (serverTask.reward_id) {
                for (let j = 0; j < serverTask.reward_id.length; j++) {
                    if (serverTask.reward_id[j] == activiyId) {
                        return true;
                    }
                }
            }
            return false;
        }
        let serverData = this.getActivityDatas();
        for (let i in activityRewards) {
            let value = activityRewards[i];
            value.getAward = false;
            if (serverData) {
                value.getAward = isRewardTake(serverData, value.id);
            }
        }
        return activityRewards;
    }
    public c2sGetDailyTaskInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetDailyTaskInfo, {});
    }
    public c2sGetDailyTaskAward(missionId) {
        if (this.isExpired() == true) {
            this.c2sGetDailyTaskInfo();
            return;
        }
        if (missionId) {
            let message = { id: missionId };
            G_NetworkManager.send(MessageIDConst.ID_C2S_GetDailyTaskAward, message);
        }
    }
    public _s2cGetDailyTaskInfo(id, message) {
        let level = message['level'] || 0;
        let dailyMissions = message['tasks'] || [];
        this._level = level;
        this.resetTime();
        this._dailyMissionList = {};
        for (let i = 0; i < dailyMissions.length; i++) {
            this._setOneDailyDailyMissionData(dailyMissions[i]);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DAILY_TASK_INFO, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_DAILY_MISSION);
    }
    public _s2cGetDailyTaskReward(id, message) {
        if (message.ret != 1) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_DAILY_TASK_AWARD, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_DAILY_MISSION);
    }
    public _s2cUpdateDailyTaskInfo(id, message) {
        this.updateDailyTaskData(message);
        G_SignalManager.dispatch(SignalConst.EVENT_DAILY_TASK_UPDATE, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_DAILY_MISSION);
    }
    public c2sGameShare() {
        let message = {};
        G_NetworkManager.send(MessageIDConst.ID_C2S_GameShare, message);
    }
    public getDailyAwardExp(cfgData) {
        let awardActive = cfgData.reward_active;
        let rewardExp = cfgData.reward_exp;
        if (awardActive == null) {
            awardActive = 1;
        }
        let serverDay = G_UserData.getBase().getOpenServerDayNum();
        if (serverDay <= 0) {
            return null;
        }
        let DailyTaskExp = G_ConfigLoader.getConfig(ConfigNameConst.DAILY_TASK_EXP);
        let expCfg = DailyTaskExp.get(serverDay);
        if (expCfg == null) {
            expCfg = DailyTaskExp.indexOf(DailyTaskExp.length()-1);
        }
        return {
            type: TypeConvertHelper.TYPE_RESOURCE,
            value: DataConst.RES_EXP,
            size: expCfg.exp * rewardExp
        };
    }
}
