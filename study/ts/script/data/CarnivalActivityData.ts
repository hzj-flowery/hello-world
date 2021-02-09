import { BaseData } from './BaseData';
import { G_NetworkManager, G_SignalManager, G_ConfigLoader } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { FunctionConst } from '../const/FunctionConst';
import { ArraySort } from '../utils/handler';
import { CarnivalActivityUnitData } from './CarnivalActivityUnitData';
import { CarnivalSingleActivityData } from './CarnivalSingleActivityData';
import { CommonActivityQuestData } from './CommonActivityQuestData';
import { CustomActivityConst } from '../const/CustomActivityConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { CommonActivityUserTaskData } from './CommonActivityUserTaskData';
import { MessageErrorConst } from '../const/MessageErrorConst';
export class CarnivalActivityData extends BaseData {

    public _signalRecvGetCarnivalActivityAward;
    public _signalRecvGetCarnivalActivityInfo;
    public _signalRecvUpdateCarnivalActivityQuest;
    public _signalRecvUpdateCarnivalActivity;
    public _signalRecvGetUserCarnivalActivityQuest;
    public _signalActivtyDataChange;
    public _data: any[];
    public _userData;
    public _activitys;
    constructor(properties?) {
        super(properties)
        this._signalRecvGetCarnivalActivityAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCarnivalActivityAward, this._s2cGetCarnivalActivityAward.bind(this));
        this._signalRecvGetCarnivalActivityInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetCarnivalActivityInfo, this._s2cGetCarnivalActivityInfo.bind(this));
        this._signalRecvUpdateCarnivalActivityQuest = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCarnivalActivityQuest, this._s2cUpdateCarnivalActivityQuest.bind(this));
        this._signalRecvUpdateCarnivalActivity = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateCarnivalActivity, this._s2cUpdateCarnivalActivity.bind(this));
        this._signalRecvGetUserCarnivalActivityQuest = G_NetworkManager.add(MessageIDConst.ID_S2C_GetUserCarnivalActivityQuest, this._s2cGetUserCarnivalActivityQuest.bind(this));
        this._signalActivtyDataChange = G_SignalManager.add(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE, this._onEventDataChange.bind(this));
        this._data = [];
        this._userData = {};
        this._activitys = {};
    }
    public clear() {
        this._signalRecvGetCarnivalActivityAward.remove();
        this._signalRecvGetCarnivalActivityAward = null;
        this._signalRecvGetCarnivalActivityInfo.remove();
        this._signalRecvGetCarnivalActivityInfo = null;
        this._signalRecvUpdateCarnivalActivityQuest.remove();
        this._signalRecvUpdateCarnivalActivityQuest = null;
        this._signalRecvUpdateCarnivalActivity.remove();
        this._signalRecvUpdateCarnivalActivity = null;
        this._signalRecvGetUserCarnivalActivityQuest.remove();
        this._signalRecvGetUserCarnivalActivityQuest = null;
        this._signalActivtyDataChange.remove();
        this._signalActivtyDataChange = null;
    }
    public reset() {
        this._data = [];
        this._userData = {};
        this._activitys = {};
    }
    public _onEventDataChange() {
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_CARNIVAL_ACTIVITY);
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS,  FunctionConst.FUNC_CARNIVAL_ACTIVITY);
    }
    public _checkRedPointChange() {
        let state = false;
        for (let k in this._activitys) {
            let v = this._activitys[k];
            if (v.isHasRedPoint()) {
                state = true;
                break;
            }
        }
        return state;
    }
    public isTermsHasRedPoint(termIDs) {
        if (!termIDs) {
            return false;
        }
        for (let k in this._activitys) {
            let v = this._activitys[k];
            let key = v.getCarnival_id() + ('_' + v.getTerm());
            if (termIDs[key]) {
                if (v.isHasRedPoint()) {
                    return true;
                }
            }
        }
    }
    public isHasRedPoint() {
        return this._checkRedPointChange();
    }
    public getAllVisibleTermData() {
        let visibleActData = [];
        for (let _ in this._data) {
            let v = this._data[_];
            if (v.checkActIsVisible()) {
                visibleActData.push(v);
            }
        }
        let sortFunc = function (left, right) {
            if (left.getStart_time() != right.getStart_time()) {
                return left.getStart_time() > right.getStart_time();
            }
            return left.getId() < right.getId();
        };
        ArraySort(visibleActData, sortFunc);
        let allTerms = [];
        for (let _ in visibleActData) {
            let v = visibleActData[_];
            let terms = v.getVisibleTermList();
            for (let _ in terms) {
                let j = terms[_];
                allTerms.push(j);
            }
        }
        return allTerms;
    }
    public getUnitDataById(carnival_id) {
        for (let _ in this._data) {
            let v = this._data[_];
            if (v.getId() == carnival_id) {
                return v;
            }
        }
    }
    public getTermData(carnival_id, termId) {
        let termData;
        let unitData = this.getUnitDataById(carnival_id);
        if (unitData) {
            termData = unitData.getTermDataById(termId);
            return termData;
        }
    }
    public _insertActivityDataToStage(activityData) {
        let termData = this.getTermData(activityData.getCarnival_id(), activityData.getTerm());
        if (termData) {
            let stageData = termData.getStageDataById(activityData.getStage());
            if (stageData) {
                stageData.insertActivityData(activityData);
                return;
            }
        }
    }
    public _removeActivityDataFromStage(activityData) {
        let termData = this.getTermData(activityData.getCarnival_id(), activityData.getTerm());
        if (termData) {
            let stageData = termData.getStageDataById(activityData.getStage());
            if (stageData) {
                stageData.removeActivityData(activityData);
                return;
            }
        }
    }
    public getActivityDataById(id) {
        return this._activitys[id];
    }
    public _insertUnitData(data) {
        let unitData = new CarnivalActivityUnitData();
        unitData.initData(data);
        this._data.push(unitData);
    }
    public _insertActivityData(data) {
        let activityData = new CarnivalSingleActivityData();
        activityData.initData(data);
        this._activitys[activityData.getId()] = activityData;
        this._insertActivityDataToStage(activityData);
    }
    public _insertQuestData(data) {
        let questData = new CommonActivityQuestData();
        questData.initData(data);
        questData.setUserDataSource(CustomActivityConst.CUSTOM_QUEST_USER_DATA_SOURCE_CARNIVAL);
        let activityData = this.getActivityDataById(questData.getAct_id());
        if (activityData) {
            activityData.insertQuestData(questData);
        }
    }
    public _insertUserData(data) {
        let actUserTaskData = new CommonActivityUserTaskData();
        actUserTaskData.initData(data);
        this._userData[actUserTaskData.getAct_id() + ('_' + actUserTaskData.getQuest_id())] = actUserTaskData;
    }
    public getActUserData(actId, questId) {
        return this._userData[actId + ('_' + questId)];
    }
    public hasActivityCanVisible() {
        for (let _ in this._data) {
            let v = this._data[_];
            let terms = v.getVisibleTermList();
            if (terms.length > 0) {
                return true;
            }
        }
        return false;
    }
    public getMainMenuIconFunctionId() {
        let FestivalResConfog = G_ConfigLoader.getConfig(ConfigNameConst.FESTIVAL_RES);
        let termDataList = this.getAllVisibleTermData();
        let functionIdList = {};
        for (let k in termDataList) {
            let v = termDataList[k];
            let titleConfig = FestivalResConfog.get(v.getTerm_icon());
            console.assert(titleConfig != null, 'can not find res id');
            functionIdList[titleConfig.icon] = true;
        }
        let functionId = null;
        let count = 0;
        for (let k in functionIdList) {
            let v = functionIdList[k];
            count = count + 1;
            functionId = k;
        }
        if (count != 1) {
            return null;
        }
        return functionId;
    }
    public c2sGetCarnivalActivityAward(act_id, quest_id, award_id, award_num) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCarnivalActivityAward, {
            act_id: act_id,
            quest_id: quest_id,
            award_id: award_id,
            award_num: award_num || 1
        });
        console.log('c2sGetCarnivalActivityAward ', award_num);
    }
    public _s2cGetCarnivalActivityAward(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_CARNIVAL_ACTIVITY_AWARD_SUCCESS, message);
    }
    public c2sGetCarnivalActivityInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetCarnivalActivityInfo, {});
    }
    public _s2cGetCarnivalActivityInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._data = [];
        let carnival = message['carnival'];
        if (carnival) {
            for (let _ in carnival) {
                let v = carnival[_];
                this._insertUnitData(v);
            }
        }
        this._activitys = {};
        let activity = message['activity'];
        if (activity) {
            for (let _ in activity) {
                let v = activity[_];
                this._insertActivityData(v);
            }
        }
        let quest = message['quest'];
        if (quest) {
            for (let _ in quest) {
                let v = quest[_];
                this._insertQuestData(v);
            }
        }
        let user_quest = message['user_quest'];
        if (user_quest) {
            for (let _ in user_quest) {
                let v = user_quest[_];
                this._insertUserData(v);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE);
    }
    public _s2cUpdateCarnivalActivityQuest(id, message) {
        let user_quest = message['user_quest'];
        if (user_quest) {
            for (let _ in user_quest) {
                let v = user_quest[_];
                this._insertUserData(v);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE);
    }
    public _cleanDirtyData(carnivalId) {
        for (let k = 0; k < this._data.length; k++) {
            let v = this._data[k];
            if (v.getId() == carnivalId) {
                this._data.splice(k, 1);
                break;
            }
        }
        for (let k in this._activitys) {
            let v = this._activitys[k];
            if (v.getCarnival_id() == carnivalId) {
                this._activitys[k] = null;
            }
        }
    }
    public _s2cUpdateCarnivalActivity(id, message) {
        let carnival = message['carnival'];
        if (carnival) {
            for (let _ in carnival) {
                let v = carnival[_];
                this._cleanDirtyData(v.id);
                this._insertUnitData(v);
            }
        }
        let activity = message['activity'];
        if (activity) {
            for (let _ in activity) {
                let v = activity[_];
                this._insertActivityData(v);
            }
        }
        let quest = message['quest'];
        if (quest) {
            for (let _ in quest) {
                let v = quest[_];
                this._insertQuestData(v);
            }
        }
        let delete_activity = message['delete_activity'];
        if (delete_activity) {
            for (let k in delete_activity) {
                let v = delete_activity[k];
                let actitivyData = this.getActivityDataById(v);
                if (actitivyData) {
                    this._removeActivityDataFromStage(actitivyData);
                    this._activitys[v] = null;
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE);
    }
    public c2sGetUserCarnivalActivityQuest() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetUserCarnivalActivityQuest, {});
    }
    public _s2cGetUserCarnivalActivityQuest(id, message) {
        let user_quest = message['user_quest'];
        if (user_quest) {
            for (let _ in user_quest) {
                let v = user_quest[_];
                this._insertUserData(v);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE);
    }
}
CarnivalActivityData;