import { BaseData } from './BaseData';
import { ArraySort } from '../utils/handler';
import { G_ServerTime, G_ServiceManager, G_SignalManager, G_UserData } from '../init';
import { SignalConst } from '../const/SignalConst';
import { FunctionConst } from '../const/FunctionConst';
import { CustomActivityConst } from '../const/CustomActivityConst';
let schema = {};
schema['id'] = [
    'number',
    0
];

schema['carnival_id'] = [
    'number',
    0
];

schema['term'] = [
    'number',
    0
];

schema['stage'] = [
    'number',
    0
];

schema['act_type'] = [
    'number',
    0
];

schema['quest_type'] = [
    'number',
    0
];

schema['title'] = [
    'string',
    ''
];

schema['desc'] = [
    'string',
    ''
];

schema['title1'] = [
    'string',
    ''
];

schema['desc1'] = [
    'string',
    ''
];

schema['title2'] = [
    'string',
    ''
];

schema['desc2'] = [
    'string',
    ''
];

schema['preview_time'] = [
    'number',
    0
];

schema['start_time'] = [
    'number',
    0
];

schema['end_time'] = [
    'number',
    0
];

schema['award_time'] = [
    'number',
    0
];

schema['sort'] = [
    'number',
    0
];

schema['drop_res_id'] = [
    'number',
    0
];

export interface CarnivalSingleActivityData {
getId(): number
setId(value: number): void
getLastId(): number
getCarnival_id(): number
setCarnival_id(value: number): void
getLastCarnival_id(): number
getTerm(): number
setTerm(value: number): void
getLastTerm(): number
getStage(): number
setStage(value: number): void
getLastStage(): number
getAct_type(): number
setAct_type(value: number): void
getLastAct_type(): number
getQuest_type(): number
setQuest_type(value: number): void
getLastQuest_type(): number
getTitle(): string
setTitle(value: string): void
getLastTitle(): string
getDesc(): string
setDesc(value: string): void
getLastDesc(): string
getTitle1(): string
setTitle1(value: string): void
getLastTitle1(): string
getDesc1(): string
setDesc1(value: string): void
getLastDesc1(): string
getTitle2(): string
setTitle2(value: string): void
getLastTitle2(): string
getDesc2(): string
setDesc2(value: string): void
getLastDesc2(): string
getPreview_time(): number
setPreview_time(value: number): void
getLastPreview_time(): number
getStart_time(): number
setStart_time(value: number): void
getLastStart_time(): number
getEnd_time(): number
setEnd_time(value: number): void
getLastEnd_time(): number
getAward_time(): number
setAward_time(value: number): void
getLastAward_time(): number
getSort(): number
setSort(value: number): void
getLastSort(): number
getDrop_res_id(): number
setDrop_res_id(value: number): void
getLastDrop_res_id(): number
}
export class CarnivalSingleActivityData extends BaseData {
    public static schema = schema;

    public _quests: any[];
    public _state: number

    constructor (properties?) {
        super(properties);
        this._quests = [];
        this._state = 0;
    }
    public clear () {
    }
    public reset () {
    }
    public getQuestDataById (id) {
        for (let _ in this._quests) {
            let v = this._quests[_];
            if (v.getQuest_id() == id) {
                return v;
            }
        }
    }
    public insertQuestData (questData) {
        this._quests.push(questData);
    }
    public clearQuest () {
        this._quests = [];
    }
    public sortQuests () {
        ArraySort(this._quests, function (a, b) {
            let aCanReceive = a.isQuestCanReceive();
            let bCanReceive = b.isQuestCanReceive();
            if (aCanReceive == bCanReceive) {
                let aHasReceive = a.isQuestHasReceive();
                let bHasReceive = b.isQuestHasReceive();
                if (aHasReceive == bHasReceive) {
                    if (a.getSort_num() == b.getSort_num()) {
                        return a.getQuest_id() < b.getQuest_id();
                    } else {
                        return a.getSort_num() < b.getSort_num();
                    }
                } else {
                    return aHasReceive == false;
                }
            } else {
                return aCanReceive == true;
            }
        });
    }
    public getQuests () {
        return this._quests;
    }
    public isQuestCanShow (questData, questUserData) {
        if (!questData) {
            return false;
        }
        let limitType = questData.getShow_limit_type();
        let limitValue = questData.getShow_limit_value();
        if (limitValue <= 0) {
            return true;
        }
        if (limitType == CustomActivityConst.QUEST_LIMIT_TYPE_RECHARGE) {
            if (!questUserData) {
                return false;
            }
            return questUserData.getValue(CustomActivityConst.USER_QUEST_DATA_K_RECHARGE) >= limitValue;
        }
        return true;
    }
    public getShowQuests () {
        let dataMap = this._quests;
        let dataArr = [];
        for (let k in dataMap) {
            let v = dataMap[k];
            let actTaskData = v.getActUserData();
            let canReceive = v.isQuestCanReceive();
            let hasReceive = v.isQuestHasReceive();
            let reachReceiveCondition = v.isQuestReachReceiveCondition();
            let hasLimit = v.checkQuestReceiveLimit();
            let timeLimit = !this.checkActIsInReceiveTime();
            let canShow = this.isQuestCanShow(v, actTaskData);
            if (canShow) {
                dataArr.push({
                    actUnitData: this,
                    actTaskUnitData: v,
                    canReceive: canReceive,
                    hasReceive: hasReceive,
                    reachReceiveCondition: reachReceiveCondition,
                    hasLimit: hasLimit,
                    timeLimit: timeLimit
                });
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
    public initData (data) {
        this.setProperties(data);
        this._registerClock();
    }
    public _registerClock () {
        let curTime = G_ServerTime.getTime();
        if (this.getAward_time() >= curTime) {
            let clockTime;
            if (this.getPreview_time() > curTime) {
                clockTime = this.getPreview_time();
            } else if (this.getStart_time() > curTime) {
                clockTime = this.getStart_time();
            } else {
                clockTime = this.getAward_time();
            }
           // console.warn('CarnivalSingleActivityData registerClock');
            let tag = 'CARNIVAL_ACTIVITY_DATA_CHANGE_%d'.format(clockTime);
            G_ServiceManager.registerOneAlarmClock(tag, clockTime, function () {
                G_SignalManager.dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE);
            });
        }
    }
    public checkActIsVisible () {
        return this.isActInPreviewTime() || this.checkActIsInRunRewardTime();
    }
    public isInTimeRange (minTime, maxTime) {
        let time = G_ServerTime.getTime();
        return time >= minTime && time < maxTime;
    }
    public isActInPreviewTime () {
        let time = G_ServerTime.getTime();
        let startTime = this.getStart_time();
        let previewTime = this.getPreview_time();
        if (previewTime >= startTime) {
            return false;
        }
        return time >= previewTime && time < startTime;
    }
    public checkActIsInRunRewardTime () {
        let time = G_ServerTime.getTime();
        let startTime = this.getStart_time();
        let endTime = this.getEnd_time();
        let awardTime = this.getAward_time();
        awardTime = endTime > awardTime && endTime || awardTime;
        if (awardTime > time && startTime <= time) {
            return true;
        } else {
            return false;
        }
    }
    public checkActIsInReceiveTime () {
        if (this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL) {
            return this.isInTimeRange(this.getStart_time(), this.getEnd_time());
        } else {
            return this.checkActIsInRunRewardTime();
        }
    }
    public isActValid () {
        let termData = G_UserData.getCarnivalActivity().getTermData(this.getCarnival_id(), this.getTerm());
        if (!termData) {
            return false;
        }
        if (!termData.checkActIsInRunRewardTime()) {
            return false;
        }
        if (!this.checkActIsInRunRewardTime()) {
            return false;
        }
        return true;
    }
    public isHasRedPoint () {
        let termData = G_UserData.getCarnivalActivity().getTermData(this.getCarnival_id(), this.getTerm());
        if (!termData) {
            return false;
        }
        if (!(termData.getState() == CustomActivityConst.STATE_ING || termData.getState() == CustomActivityConst.STATE_AWARD_ING)) {
            return false;
        }
        if (!this.checkActIsInReceiveTime()) {
            return false;
        }
        if (this.getAct_type() == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL) {
            let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_CARNIVAL_ACTIVITY, { actId: this.getId() });
            if (showed) {
                return false;
            }
        }
        for (let _ in this._quests) {
            let v = this._quests[_];
            if (v.isQuestCanReceive()) {
                return true;
            }
        }
        return false;
    }
    public getFunctionId () {
        let buttonId = null;
        if (buttonId == CustomActivityConst.ACT_BUTTON_TYPE_RECEIVE_GRAY) {
            return 0;
        } else if (buttonId == CustomActivityConst.ACT_BUTTON_TYPE_GO_RECHARGE) {
            return FunctionConst.FUNC_RECHARGE;
        }
        return 0;
    }
    public getShow_schedule () {
        return 1;
    }
}