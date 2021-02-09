import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ServerTime, G_UserData, G_Prompt, G_ConfigManager, G_GameAgent, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { TimeConst } from "../const/TimeConst";
import { TimeLimitActivityConst } from "../const/TimeLimitActivityConst";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { CustomActivityUnitData } from "./CustomActivityUnitData";
import { CustomActivityTaskUnitData } from "./CustomActivityTaskUnitData";
import { CommonActivityUserTaskData } from "./CommonActivityUserTaskData";
import { CustomActivityConst } from "../const/CustomActivityConst";
import { ArraySort, handler } from "../utils/handler";
import { UserCheck } from "../utils/logic/UserCheck";
import { ActivityEquipDataHelper } from "../utils/data/ActivityEquipDataHelper";
import { ActivityThreeKindomsData } from "./ActivityThreeKindomsData";
import { VipGeneralGoodsData } from "./VipGeneralGoodsData";
import { CustomActivityFundsHelper } from "../scene/view/customActivity/CustomActivityFundsHelper";
import { CustomActivityAvatarHelper } from "../scene/view/customActivity/avatar/CustomActivityAvatarHelper";
import { FunctionConst } from "../const/FunctionConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { bit } from "../utils/bit";
import { ConfigNameConst } from "../const/ConfigNameConst";


export interface CustomActivityData {
    isHasData(): boolean
    setHasData(value: boolean): void
    isLastHasData(): boolean
}
let schema = {};
schema['hasData'] = [
    'boolean',
    false
];
export class CustomActivityData extends BaseData {

    public static schema = schema;
    _s2cGetCustomActivityInfoListener;
    _s2cGetCustomActivityAwardListener;
    _s2cUpdateCustomActivityListener;
    _s2cUpdateCustomActivityQuestListener;
    _s2cGetUserCustomActivityQuestListener;
    _s2combineTaskQueryTask;
    _s2cGetCustomActivityFundAwardListener;
    _s2cGetActVipGiftListener;
    _s2cBuyVipGiftListener;
    _s2cBuyReturnGiftListener;
    _s2cCheckBuyReturnGiftListener;
    _actUnitDataList;
    _userTaskDataList;
    _taskUnitData;
    _threeKindomsDataList;
    _fundsDataList;
    _vipRecommendGiftList;

    constructor(properties?) {
        super(properties)
        this._s2cGetCustomActivityInfoListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCustomActivityInfo, this._s2cGetCustomActivityInfo.bind(this));
        this._s2cGetCustomActivityAwardListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCustomActivityAward, this._s2cGetCustomActivityAward.bind(this));
        this._s2cUpdateCustomActivityListener = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCustomActivity, this._s2cUpdateCustomActivity.bind(this));
        this._s2cUpdateCustomActivityQuestListener = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCustomActivityQuest, this._s2cUpdateCustomActivityQuest.bind(this));
        this._s2cGetUserCustomActivityQuestListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUserCustomActivityQuest, this._s2cGetUserCustomActivityQuest.bind(this));
        this._s2combineTaskQueryTask = G_NetworkManager.add(MessageIDConst.ID_S2C_MJZ2SS_CombineTaskQueryTask, this._s2cCombineTaskQueryTask.bind(this));
        this._s2cGetCustomActivityFundAwardListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCustomActivityFundAward, this._s2cGetCustomActivityFundAward.bind(this));
        this._s2cGetActVipGiftListener = G_NetworkManager.add(MessageIDConst.ID_S2C_GetActVipGift, this._s2cGetActVipGift.bind(this));
        this._s2cBuyVipGiftListener = G_NetworkManager.add(MessageIDConst.ID_S2C_BuyVipGift, this._s2cBuyVipGift.bind(this));
        this._s2cBuyReturnGiftListener = G_NetworkManager.add(MessageIDConst.ID_S2C_BuyDailySeller, handler(this, this._s2cBuyReturnGift));
        this._s2cCheckBuyReturnGiftListener = G_NetworkManager.add(MessageIDConst.ID_S2C_CheckDailySeller, handler(this, this._s2cCheckBuyReturnGift));
        this.setResetTime(TimeConst.RESET_TIME_24);
        this._initData();
    }
    public _initData() {
        this._actUnitDataList = {};
        this._userTaskDataList = {};
        this._taskUnitData = {};
        this._threeKindomsDataList = null;
        this._fundsDataList = {};
        this._vipRecommendGiftList = {};
    }
    public clear() {
        super.clear();
        this._s2cGetCustomActivityInfoListener.remove();
        this._s2cGetCustomActivityInfoListener = null;
        this._s2cGetCustomActivityAwardListener.remove();
        this._s2cGetCustomActivityAwardListener = null;
        this._s2cUpdateCustomActivityListener.remove();
        this._s2cUpdateCustomActivityListener = null;
        this._s2cUpdateCustomActivityQuestListener.remove();
        this._s2cUpdateCustomActivityQuestListener = null;
        this._s2cGetUserCustomActivityQuestListener.remove();
        this._s2cGetUserCustomActivityQuestListener = null;
        this._s2combineTaskQueryTask.remove();
        this._s2combineTaskQueryTask = null;
        this._s2cGetCustomActivityFundAwardListener.remove();
        this._s2cGetCustomActivityFundAwardListener = null;
        this._s2cGetActVipGiftListener.remove();
        this._s2cGetActVipGiftListener = null;
        this._s2cBuyVipGiftListener.remove();
        this._s2cBuyVipGiftListener = null;
        this._s2cBuyReturnGiftListener.remove();
        this._s2cBuyReturnGiftListener = null;
        this._s2cCheckBuyReturnGiftListener.remove();
        this._s2cCheckBuyReturnGiftListener = null;
    }
    public reset() {
        super.reset();
        this.setHasData(false);
        this._initData();
    }
    public _s2cGetCustomActivityInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        // cc.log(message, '**********************************************', 6);
        this.setHasData(true);
        this.resetTime();
        this._initData();
        if (FunctionCheck.funcIsOpened(TimeLimitActivityConst.ID_TYPE_THREEKINDOMS)[0] && G_ConfigManager.isDownloadThreeKindoms()) {
            //TODO:
            // let deviceId = G_NativeAgent.getDeviceId();
            // if (deviceId != null && deviceId != 'unknown') {
            //     let startidx = string.find(deviceId, '_sn', -3), endidx, strnil;
            //     if (type(startidx) != 'number' && type(endidx) != 'number') {
            //         this.c2sCombineTaskQueryTask();
            //     }
            // }
        }
        this._fundsDataList = CustomActivityFundsHelper.getFundsBaseInfo();
        let activity = message['activity'] || {};
        for (let k in activity) {
            let v = activity[k];
            this._createActUnitData(v);
        }
        let quest = message['quest'] || {};
        for (let k in quest) {
            let v = quest[k];
            this._createActTaskUnitData(v);
        }
        let userQuest = message['user_quest'] || {};
        for (let k in userQuest) {
            let v = userQuest[k];
            this._createActUserTaskData(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_INFO);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_ACTIVITY);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
    }
    public _s2cGetCustomActivityAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_GET_AWARD, message);
    }
    public _s2cUpdateCustomActivity(id, message) {
        let activity = message['activity'] || {};
        for (let k in activity) {
            let v = activity[k];
            this._deleteActData(v.act_id);
            this._createActUnitData(v);
        }
        let quest = message['quest'] || {};
        for (let k in quest) {
            let v = quest[k];
            this._createActTaskUnitData(v);
        }
        let deleteActivityIds = message['delete_activity'] || {};
        for (let k in deleteActivityIds) {
            let v = deleteActivityIds[k];
            this._deleteActData(v);
        }
        this.c2sGetUserCustomActivityQuest();
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE, message);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_ACTIVITY);
    }
    public _s2cUpdateCustomActivityQuest(id, message) {
        let userQuest = message['user_quest'] || {};
        for (let k in userQuest) {
            let v = userQuest[k];
            this._createActUserTaskData(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE_QUEST, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
    }
    public _s2cGetUserCustomActivityQuest(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this.resetTime();
        this._userTaskDataList = {};
        let userQuest = message['user_quest'] || {};
        for (let k in userQuest) {
            let v = userQuest[k];
            this._createActUserTaskData(v);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_UPDATE_QUEST, message);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
    }
    public _createActUnitData(data) {
        let actUnitData = new CustomActivityUnitData();
        actUnitData.initData(data);
        this._actUnitDataList[data.act_id] = actUnitData;
        return actUnitData;
    }
    public _createActTaskUnitData(data) {
        let actTaskUnitData = new CustomActivityTaskUnitData();
        actTaskUnitData.initData(data);
        if (!this._taskUnitData[data.act_id]) {
            this._taskUnitData[data.act_id] = {};
        }
        this._taskUnitData[data.act_id][data.quest_id] = actTaskUnitData;
        return actTaskUnitData;
    }
    public _createActUserTaskData(data) {
        let actUserTaskData = new CommonActivityUserTaskData();
        actUserTaskData.initData(data);
        this._userTaskDataList[data.act_id + ('_' + data.quest_id)] = actUserTaskData;
        return actUserTaskData;
    }
    public _deleteActData(actId) {
        this._actUnitDataList[actId] = null;
        this._deleteActTaskUnitDataByActId(actId);
    }
    public _deleteActTaskUnitDataByActId(actId) {
        this._taskUnitData[actId] = null;
    }
    public getActUnitDataById(actId) {
        return this._actUnitDataList[actId];
    }
    public getActTaskDataById(actId, questId) {
        return this._userTaskDataList[actId + ('_' + questId)];
    }
    public getActTaskUnitDataById(actId, questId) {
        if (!this._taskUnitData[actId]) {
            return null;
        }
        return this._taskUnitData[actId][questId];
    }
    public getActTaskUnitDataForFundsById(actId) {
        if (!this._taskUnitData[actId]) {
            return null;
        }
        return this._taskUnitData[actId];
    }
    public isActTaskSellTypeRunning() {
        for (let key in this._actUnitDataList) {
            let value = this._actUnitDataList[key];
            if (value && value.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL) {
                return G_ServerTime.getLeftSeconds(value.getStart_time()) <= 0 && G_ServerTime.getLeftSeconds(value.getEnd_time()) > 0;
            }
        }
        return false;
    }
    public getActTaskUnitDataListById(actId) {
        return this._taskUnitData[actId] || {};
    }
    public getShowActUnitDataArr() {
        let dataArr = [];
        var isReturnServer = G_GameAgent.isLoginReturnServer();
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if(!v)continue;
            if (CustomActivityConst.CUSTOM_ACTIVITY_TYPE_FUNDS == v.getAct_type()) {
                let [bActived, rewardedFinishTime] = this._checkActivedFunds(v.getAct_id());
                if (bActived) {
                    if (v.checkFundsActIsVisible(rewardedFinishTime)) {
                        dataArr.push(v);
                    }
                } else {
                    if (v.checkActIsVisible()) {
                        dataArr.push(v);
                    }
                }
            }else if (!isReturnServer && CustomActivityConst.CUSTOM_ACTIVITY_TYPE_RETURN_SERVER_GIFT == v.getAct_type()) {
            } 
            else {
                if (v.checkActIsVisible()) {
                    dataArr.push(v);
                }
            }
        }
        let sortFuc = function (unit01, unit02) {
            if (unit01.getSort_num() != unit02.getSort_num()) {
                return unit01.getSort_num() < unit02.getSort_num();
            }
            return unit01.getAct_id() > unit02.getAct_id();
        };
        ArraySort(dataArr, sortFuc);
        return dataArr;
    }
    public refreshShowTaskData(dataArr) {
        for (let k in dataArr) {
            let data = dataArr[k];
            let v = data.actTaskUnitData;
            let actTaskData = this.getActTaskDataById(v.getAct_id(), v.getId());
            let canReceive = G_UserData.getCustomActivity().isTaskCanReceived(v.getAct_id(), v.getId());
            let hasReceive = v.isTaskHasReceive(actTaskData);
            let reachReceiveCondition = G_UserData.getCustomActivity().isTaskReachReceiveCondition(v.getAct_id(), v.getId());
            let hasLimit = G_UserData.getCustomActivity().isHasTaskReceiveLimit(v.getAct_id(), v.getId());
            let timeLimit = !data.actUnitData.isActInRunTime();
            dataArr[k] = {
                actUnitData: data.actUnitData,
                actTaskUnitData: v,
                canReceive: canReceive,
                hasReceive: hasReceive,
                reachReceiveCondition: reachReceiveCondition,
                hasLimit: hasLimit,
                timeLimit: timeLimit
            };
        }
    }
    public getShowTaskUnitDataArrById(actId) {
        let actUnitData = this.getActUnitDataById(actId);
        if (!actUnitData) {
            return {};
        }
        let dataMap = this.getActTaskUnitDataListById(actId);
        let dataArr = [];
        for (let k in dataMap) {
            let v = dataMap[k];
            // cc.warn('sss----------------- sss');
            let actTaskData = this.getActTaskDataById(v.getAct_id(), v.getId());
            let canReceive = G_UserData.getCustomActivity().isTaskCanReceived(v.getAct_id(), v.getId());
            let hasReceive = v.isTaskHasReceive(actTaskData);
            let reachReceiveCondition = G_UserData.getCustomActivity().isTaskReachReceiveCondition(v.getAct_id(), v.getId());
            let canShow = G_UserData.getCustomActivity().isQuestCanShow(v.getAct_id(), v.getId());
            let hasLimit = G_UserData.getCustomActivity().isHasTaskReceiveLimit(v.getAct_id(), v.getId());
            let timeLimit = !actUnitData.isActInRunTime();
            if (canShow) {
                dataArr.push({
                    actUnitData: actUnitData,
                    actTaskUnitData: v,
                    canReceive: canReceive,
                    hasReceive: hasReceive,
                    reachReceiveCondition: reachReceiveCondition,
                    hasLimit: hasLimit,
                    timeLimit: timeLimit
                });
            } else {
                cc.warn('jjs----------------- sss');
            }
        }
        let sortFuc = function (item01, item02) {
            if (item01.canReceive != item02.canReceive) {
                return item01.canReceive;
            }
            if (item01.hasReceive != item02.hasReceive) {
                if (item01.hasReceive) {
                    return false;
                } else {
                    return true;
                }
            }
            return item01.actTaskUnitData.getSort_num() < item02.actTaskUnitData.getSort_num();
        };
        ArraySort(dataArr, sortFuc);
        return dataArr;
    }
    public isTaskCanReceived(actId, taskId) {
        let actUnitData = this.getActUnitDataById(actId);
        if (!actUnitData) {
            return false;
        }
        if (!actUnitData.isActInRewardTime()) {
            return false;
        }
        let reachReceiveCondition = this.isTaskReachReceiveCondition(actId, taskId);
        if (!reachReceiveCondition) {
            return false;
        }
        let actTaskUnitData = this.getActTaskUnitDataById(actId, taskId);
        if (!actTaskUnitData) {
            return false;
        }
        let actTaskData = this.getActTaskDataById(actId, taskId);
        let canReceive = !actTaskUnitData.isHasTaskReceiveLimit(actTaskData);
        return canReceive;
    }
    public isTaskReachReceiveCondition(actId, taskId) {
        let actTaskUnitData = this.getActTaskUnitDataById(actId, taskId);
        if (!actTaskUnitData) {
            return false;
        }
        let actTaskData = this.getActTaskDataById(actId, taskId);
        let reachCondition = actTaskUnitData.isTaskReachReceiveCondition(actTaskData);
        return reachCondition;
    }
    public isEnoughValue(checkType, checkValue, checkSize) {
        let currNum = UserDataHelper.getNumByTypeAndValue(checkType, checkValue);
        if (currNum >= checkSize) {
            return true;
        }
        return false;
    }
    public isHasTaskReceiveLimit(actId, taskId) {
        let actTaskUnitData = this.getActTaskUnitDataById(actId, taskId);
        if (!actTaskUnitData) {
            return false;
        }
        let actTaskData = this.getActTaskDataById(actId, taskId);
        let hasLimit = actTaskUnitData.isHasTaskReceiveLimit(actTaskData);
        return hasLimit;
    }
    public isQuestCanShow(actId, questId) {
        let questData = this.getActTaskUnitDataById(actId, questId);
        if (!questData) {
            return false;
        }
        let questUserData = this.getActTaskDataById(actId, questId);
        let limitType = questData.getShow_limit_type();
        let limitValue = questData.getShow_limit_value();
        if (limitValue <= 0) {
            return true;
        }
        if (limitType == CustomActivityConst.QUEST_LIMIT_TYPE_RECHARGE || limitType == CustomActivityConst.QUEST_LIMIT_TYPE_RECHARGE2)  {
            if (!questUserData) {
                return false;
            }
            return questUserData.getValue(CustomActivityConst.USER_QUEST_DATA_K_RECHARGE) >= limitValue;
        }
        return true;
    }
    public c2sGetCustomActivityInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCustomActivityInfo, {});
    }
    public c2sGetCustomActivityAward(actId, questId, awardId, awardNum) {
        if (this.isExpired() == true) {
            this.pullData();
            return;
        }
        awardNum = awardNum || 1;
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCustomActivityAward, {
            act_id: actId,
            quest_id: questId,
            award_id: awardId,
            award_num: awardNum
        });
    }
    public c2sGetUserCustomActivityQuest() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetUserCustomActivityQuest, {});
    }
    public pullData() {
        this.c2sGetUserCustomActivityQuest();
    }
    public hasActivityCanVisible() {
        if (!this.isHasData()) {
            return false;
        }
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if (v && v.checkActIsVisible()) {
                return true;
            }
        }
        return false;
    }
    public checkTimeLimitActivityChange() {
        if (!this.isHasData()) {
            return;
        }
        let changed = false;
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if (!v) continue;
            let visible = v.checkActIsVisible();
            let lastVisible = v.isLast_act_visible();
            if (visible != lastVisible) {
                v.setLast_act_visible(visible);
                // cc.warn('CustomActivityData EVENT_CUSTOM_ACTIVITY_OPEN_NOTICE ActId %s ActType %s  visible %s'.format(String(v.getAct_id()), String(v.getAct_type()), String(visible)));
                G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_OPEN_NOTICE, v, visible);
                changed = true;
            }
        }
        if (changed) {
        }
    }
    public isActivityExpiredById(actId) {
        let actData = this.getActUnitDataById(actId);
        if (!actData) {
            return true;
        }
        return !actData.checkActIsVisible();
    }
    public _isActivityExpired() {
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if (v && !v.checkActIsVisible()) {
                return true;
            }
        }
        return false;
    }
    public resetData() {
        this.pullData();
        this.setNotExpire();
    }
    public hasRedPoint(params?) {
        if (!params) {
            for (let k in this._actUnitDataList) {
                let v = this._actUnitDataList[k];
                if (v && v.checkActIsVisible()) {
                    let red = this.hasRedPointByActId(v.getAct_id())[0];
                    if (red) {
                        return true;
                    }
                }
            }
            return false;
        } else if (params && typeof params == 'number') {
            let red = this.hasRedPointByActId(params)[0];
            return red;
        }
        return false;
    }
    public hasRedPointByActId(actId): boolean[] {
        let actUnitData = this.getActUnitDataById(actId);
        if (!actUnitData) {
            return [false, false, false];
        }
        if (actUnitData.isExchangeAct()) {
            let showNewTag = this._hasGoodsCanExchange(actId);
            return [
                showNewTag,
                showNewTag,
                false
            ];
        } else if (actUnitData.isAvatarAct()) {
            let showNewTag = !G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
                actId: actId,
                actType: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT
            });
            let redPoint = this._avatarActivityHasRedPoint();
            return [
                showNewTag || redPoint,
                showNewTag,
                redPoint
            ];
        } else if (actUnitData.isEquipAct()) {
            let showNewTag = !G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
                actId: actId,
                actType: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT
            });
            let redPoint = this._equipActivityHasRedPoint();
            return [
                showNewTag || redPoint,
                showNewTag,
                redPoint
            ];
        } else if (actUnitData.isPetAct()) {
            let showNewTag = !G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
                actId: actId,
                actType: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT
            });
            let redPoint = this._petActivityHasRedPoint();
            return [
                showNewTag || redPoint,
                showNewTag,
                redPoint
            ];
        } else if (actUnitData.isHorseConquerAct()) {
            let showNewTag = !G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
                actId: actId,
                actType: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT
            });
            let redPoint = this._horseConquerActivityHasRedPoint();
            return [
                showNewTag || redPoint,
                showNewTag,
                redPoint
            ];
        } else if (actUnitData.isHorseJudgeAct()) {
            let showNewTag = !G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
                actId: actId,
                actType: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT
            });
            return [showNewTag, false, false];
        } else if (actUnitData.isFundsJudgeAct()) {
            let showNewTag = !G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
                actId: actId,
                actType: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT
            });
            let redPoint = this._fundsRedPoint(actId);
            return [
                showNewTag || redPoint,
                showNewTag,
                redPoint
            ];
        } else if (actUnitData.isVipRecommendGiftAct()) {
            let showNewTag = !G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
                actId: actId,
                actType: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT
            });
            return [
                false,
                showNewTag,
                false
            ];
        } else {
            let showNewTag = this._hasTaskNotComplete(actId);
            let redPoint = this._hasActCanReceived(actId);
            return [
                showNewTag || redPoint,
                showNewTag,
                redPoint
            ];
        }
    }
    public hasNewTag(actId) {
        let actUnitData = this.getActUnitDataById(actId);
        if (!actUnitData) {
            return false;
        }
        if (actUnitData.isExchangeAct()) {
            return this._hasGoodsCanExchange(actId);
        } else {
            return this._hasTaskNotComplete(actId);
        }
    }
    public _hasGoodsCanExchange(actId) {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
            actId: actId,
            actType: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT
        });
        if (showed) {
            return false;
        }
        return this._hasActCanReceived(actId);
    }
    public _hasActCanReceived(actId) {
        let actUnitData = this.getActUnitDataById(actId);
        if (!actUnitData) {
            return false;
        }
        let dataMap = this.getActTaskUnitDataListById(actId);
        for (let questId in dataMap) {
            let actTaskUnitData = dataMap[questId];
            let canReceived = this.isTaskCanReceived(actTaskUnitData.getAct_id(), actTaskUnitData.getQuest_id());
            if (canReceived) {
                return canReceived;
            }
        }
        return false;
    }
    public _hasTaskNotComplete(actId) {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
            actId: actId,
            actType: TimeLimitActivityConst.ID_TYPE_CUSTOM_ACT
        });
        if (showed) {
            return false;
        }
        let actUnitData = this.getActUnitDataById(actId);
        if (!actUnitData) {
            return false;
        }
        let dataMap = this.getActTaskUnitDataListById(actId);
        for (let questId in dataMap) {
            let actTaskUnitData = dataMap[questId];
            let receiveCondition = this.isTaskReachReceiveCondition(actTaskUnitData.getAct_id(), actTaskUnitData.getQuest_id());
            if (!receiveCondition) {
                return true;
            }
        }
        return false;
    }
    public getAvatarActivity() {
        let t = [];
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if (v && v.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_AVATAR) {
                t.push(v);
            }
        }
        ArraySort(t, function (a, b) {
            return a.getStart_time() < b.getStart_time();
        });
        for (let k in t) {
            let v = t[k];
            if (v.checkActIsInRunRewardTime()) {
                return v;
            }
        }
    }
    public isAvatarActivityVisible() {
        let acUnitData = this.getAvatarActivity();
        if (acUnitData) {
            return acUnitData.isActInRunTime();
        }
        return false;
    }
    public _avatarActivityHasRedPoint() {
        let freeCount = CustomActivityAvatarHelper.getFreeCount(1);
        let getCosRes = CustomActivityAvatarHelper.getCosRes(1);
        let canRun = UserCheck.enoughValue(getCosRes.type, getCosRes.value, getCosRes.size, false);
        return freeCount > 0 || canRun;
    }
    public getEquipActivity() {
        let t = [];
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if (v && v.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP) {
                t.push(v);
            }
        }
        ArraySort(t, function (a, b) {
            return a.getStart_time() < b.getStart_time();
        });
        for (let k in t) {
            let v = t[k];
            if (v.checkActIsInRunRewardTime()) {
                return v;
            }
        }
    }
    public isEquipActivityVisible() {
        let acUnitData = this.getEquipActivity();
        if (acUnitData) {
            return acUnitData.isActInRunTime();
        }
        return false;
    }
    public _equipActivityHasRedPoint() {
        let actUnitData = G_UserData.getCustomActivity().getEquipActivity();
        if (!actUnitData) {
            return false;
        }
        let batch = actUnitData.getBatch();
        let rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP);
        let count1 = rechargeUnit.getRestFreeCount(batch);
        if (count1 > 0) {
            return true;
        }
        let configInfo = ActivityEquipDataHelper.getActiveConfig(batch);
        let count2 = UserDataHelper.getNumByTypeAndValue(configInfo.money_type, configInfo.money_value);
        if (count2 > configInfo.consume_time1) {
            return true;
        }
        let shopRP = G_UserData.getShopActive().isShowEquipRedPoint();
        if (shopRP) {
            return true;
        }
        return false;
    }
    public getPetActivity() {
        let t = [];
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if (v && v.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET) {
                t.push(v);
            }
        }
        ArraySort(t, function (a, b) {
            return a.getStart_time() < b.getStart_time();
        });
        for (let k in t) {
            let v = t[k];
            if (v.checkActIsInRunRewardTime()) {
                return v;
            }
        }
    }
    public isPetActivityVisible() {
        let acUnitData = this.getPetActivity();
        if (acUnitData) {
            return acUnitData.isActInRunTime();
        }
        return false;
    }
    public _petActivityHasRedPoint() {
        let actUnitData = G_UserData.getCustomActivity().getPetActivity();
        if (!actUnitData) {
            return false;
        }
        let batch = actUnitData.getBatch();
        let rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET);
        let count1 = rechargeUnit.getRestFreeCount(batch);
        if (count1 > 0) {
            return true;
        }
        let configInfo = ActivityEquipDataHelper.getActiveConfig(batch);
        let count2 = UserDataHelper.getNumByTypeAndValue(configInfo.money_type, configInfo.money_value);
        if (count2 > configInfo.consume_time1) {
            return true;
        }
        let shopRP = G_UserData.getShopActive().isShowPetRedPoint();
        if (shopRP) {
            return true;
        }
        return false;
    }
    public getHorseConquerActivity() {
        let t = [];
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if (v && v.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER) {
                t.push(v);
            }
        }
        ArraySort(t, function (a, b) {
            return a.getStart_time() < b.getStart_time();
        });
        for (let k in t) {
            let v = t[k];
            if (v.checkActIsInRunRewardTime()) {
                return v;
            }
        }
    }
    public isHorseConquerActivityVisible() {
        let acUnitData = this.getHorseConquerActivity();
        if (acUnitData) {
            return acUnitData.isActInRunTime();
        }
        return false;
    }
    public _horseConquerActivityHasRedPoint() {
        let actUnitData = G_UserData.getCustomActivity().getHorseConquerActivity();
        if (!actUnitData) {
            return false;
        }
        let batch = actUnitData.getBatch();
        let rechargeUnit = G_UserData.getCustomActivityRecharge().getUnitDataWithType(CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER);
        let count1 = rechargeUnit.getRestFreeCount(batch);
        if (count1 > 0) {
            return true;
        }
        let configInfo = ActivityEquipDataHelper.getActiveConfig(batch);
        let count2 = UserDataHelper.getNumByTypeAndValue(configInfo.money_type, configInfo.money_value);
        if (count2 > configInfo.consume_time1) {
            return true;
        }
        return false;
    }
    public getHorseJudgeActivity() {
        let t = [];
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if (v && v.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_JUDGE) {
                t.push(v);
            }
        }
        ArraySort(t, function (a, b) {
            return a.getStart_time() < b.getStart_time();
        });
        for (let k in t) {
            let v = t[k];
            if (v.checkActIsInRunRewardTime()) {
                return v;
            }
        }
    }
    public isHorseJudgeActivityVisible() {
        let acUnitData = this.getHorseJudgeActivity();
        if (acUnitData) {
            return acUnitData.isActInRunTime();
        }
        return false;
    }
    public getVipRecommendGiftActivity() {
        let t = [];
        for (let k in this._actUnitDataList) {
            let v = this._actUnitDataList[k];
            if (v && v.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_VIP_RECOMMEND_GIFT) {
                t.push(v);
            }
        }
        ArraySort(t, function (a, b) {
            return a.getStart_time() < b.getStart_time();
        });
        for (let k in t) {
            let v = t[k];
            if (v.checkActIsInRunRewardTime()) {
                return v;
            }
        }
    }
    public isVipRecommendGiftActivityVisible() {
        let acUnitData = this.getVipRecommendGiftActivity();
        if (acUnitData) {
            return acUnitData.isActInRunTime();
        }
        return false;
    }
    public _getTaskData(actId) {
        let questData = this.getActTaskUnitDataForFundsById(actId);
        if (questData == null) {
            return [null];
        }
        let questId = Object.keys(questData)[0];
        let data = questData[questId];
        if (data == null) {
            return [null];
        }
        let groupIdx = data.getParam3();
        let taskData = this.getActTaskDataById(actId, questId);
        if (taskData == null) {
            return [null];
        }
        return [
            taskData,
            groupIdx
        ];
    }
    public _checkActivedFunds(actId) {
        let [taskData, groupIdx] = this._getTaskData(actId);
        if (taskData == null) {
            return [false];
        }
        let bActived = Object.keys(taskData.valueMap_).length > 0;
        let rewardedFinishTime = taskData.time2_;
        if (bActived) {
            rewardedFinishTime = rewardedFinishTime + (Object.keys(this.getFundsByGroupId(groupIdx)).length + 1) * CustomActivityConst.FUNDS_ONEDAY_TIME;
        }
        return [
            bActived,
            rewardedFinishTime
        ];
    }
    public _fundsRedPoint(actId) {
        let [taskData, _] = this._getTaskData(actId);
        if (taskData == null) {
            return false;
        }
        let bFundsSigned = Object.keys(taskData.valueMap_).length > 0;
        let mask = Object.keys(taskData.valueMap_).length >= 0 && taskData.valueMap_[1] || 0;
        let maskBit = bit.tobits(mask);
        if (Object.keys(maskBit).length > 0) {
            for (let key in maskBit) {
                let value = maskBit[key];
                if (value == 0) {
                    return true;
                }
            }
        } else if (Object.keys(maskBit).length == 0 && bFundsSigned) {
            return true;
        }
        return false;
    }
    public c2sCombineTaskQueryTask() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_MJZ2SS_CombineTaskQueryTask, {});
    }
    public _s2cCombineTaskQueryTask(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let finishTime = message['finish_time'];
        let status = message['status'];
        let combineTaskQueryTask = message['tasks'];
        let threeKindomsData = new ActivityThreeKindomsData();
        threeKindomsData.updateFinishTime(finishTime);
        threeKindomsData.updateStatus(status);
        threeKindomsData.updateCombineTaskQueryTask(combineTaskQueryTask);
        this._threeKindomsDataList = threeKindomsData;
    }
    public getThreeKindomsData() {
        if (this._threeKindomsDataList == null) {
            let activityThreeKindomsData = new ActivityThreeKindomsData();
            this._threeKindomsDataList = activityThreeKindomsData;
        }
        return this._threeKindomsDataList;
    }
    public c2sCombineTaskSignUp() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_MJZ2SS_CombineTaskSignUp, { version: G_ConfigManager.getAppVersion() });
    }
    public c2sCombineTaskAward(taskId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_MJZ2SS_CombineTaskAward, { task_id: taskId });
    }
    public getFundsByGroupId(groupId) {
        for (let key in this._fundsDataList) {
            let value = this._fundsDataList[key];
            if (key != null && key == groupId) {
                return value;
            }
        }
        return null;
    }
    public c2sGetCustomActivityFundAward(actId, questId, day) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCustomActivityFundAward, {
            act_id: parseInt(actId),
            quest_id: parseInt(questId),
            day: day
        });
    }
    public _s2cGetCustomActivityFundAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.hasOwnProperty('awards')) {
            G_Prompt.showAwards(message.awards);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_FUNDS_REWARDS, message);
    }
    public checkVipRecommendGift() {
        if (this.isVipRecommendGiftActivityVisible()) {
            let acUnitData = this.getVipRecommendGiftActivity();
            if (acUnitData) {
                let actId = acUnitData.getAct_id();
                this.c2sGetActVipGift(actId);
            }
        }
    }
    public c2sGetActVipGift(actId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetActVipGift, { act_id: actId });
    }
    public _s2cGetActVipGift(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let goods = message['goods'] || {};
        let actId = message['act_id'];
        this._vipRecommendGiftList = {};
        for (let i in goods) {
            let good = goods[i];
            let data = new VipGeneralGoodsData();
            data.updateData(good);
            let id = data.getProduct_id();
            this._vipRecommendGiftList[id] = data;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_GET_VIP_RECOMMEND_GIFT_SUCCESS);
    }
    public getVipRecommendGiftList() {
        let result = [];
        for (let id in this._vipRecommendGiftList) {
            let data = this._vipRecommendGiftList[id];
            result.push(data);
        }
        ArraySort(result, function (a, b) {
            return a.getRmb() < b.getRmb();
        });
        return result;
    }
    public getReturnGiftList() {
        var returnSvr = G_UserData.getBase().getReturnSvr();
        var isReturnServer = G_GameAgent.isLoginReturnServer();
        if (!isReturnServer) {
            return {};
        }
        var list = [];
        var gotGiftIds = returnSvr && returnSvr.getPacks() || {};
        var openDay = G_UserData.getBase().getOpenServerDayNum(0);
       
        var return_charge_award = G_ConfigLoader.getConfig(ConfigNameConst.RETURN_CHARGE_AWARD);
        var return_charge_active =  G_ConfigLoader.getConfig(ConfigNameConst.RETURN_CHARGE_ACTIVE);
        var isGiftGot = function (id) {
            var isGot = 0;
            for (let k in gotGiftIds) {
                var v = gotGiftIds[k];
                if (v == id) {
                    isGot = 1;
                    break;
                }
            }
            return isGot;
        };
        var len = return_charge_active.length();
        var lastConfigInfo = return_charge_active.indexOf(len);
        var maxDay = lastConfigInfo.day;
        var Paramter =G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var back_charge_day = parseInt(Paramter.get(882).content);
        var getAwardDay;
        getAwardDay = function (awardDay) {
            if (awardDay > maxDay) {
                awardDay = (awardDay - maxDay - 1) % (maxDay - back_charge_day + 1) + back_charge_day;
            } else {
                awardDay = awardDay;
            }
            return awardDay;
        };
        var awardDay = getAwardDay(openDay);
        for (var i = 0; i < len; i++) {
            var info:any = {};
            var config = return_charge_active.indexOf(i);
            if (awardDay == config.day) {
                info.giftId = config.id;
                info.isGot = isGiftGot(config.id);
                list.push(info);
            }
        }
        list.sort(function (a, b):number {
            if (a.isGot != b.isGot) {
                return a.isGot - b.isGot;
            }
            return a.giftId - b.giftId;
        });
        return list;
    }
    public getVipRecommendGiftWithId(id) {
        return this._vipRecommendGiftList[id];
    }
    public _s2cBuyVipGift(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let good = message['good'];
        if (good) {
            let id = good['product_id'];
            let data = this.getVipRecommendGiftWithId(id);
            if (data) {
                data.updateData(good);
                let awards = data.getAwards();
                G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_BUY_VIP_RECOMMEND_GIFT_SUCCESS, awards);
            }
        }
    }
    _s2cBuyReturnGift(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var rs = message['rs'];
        if (rs) {
            var returnSvr = G_UserData.getBase().getReturnSvr();
            returnSvr.updateData(rs);
        }
        var awards = message['awards'];
        if (awards) {
            G_SignalManager.dispatch(SignalConst.EVENT_RETURN_BUY_RETURN_GIFT, awards);
        }
    }
    c2sCheckBuyReturnGift(giftId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_CheckDailySeller, { id: giftId });
    }
    _s2cCheckBuyReturnGift(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var giftId = message['id'];
        G_SignalManager.dispatch(SignalConst.EVENT_CHECK_BUY_RETURN_GIFT, giftId);
    }
}
