import { BaseData } from './BaseData';
import { CarnivalActivityTermData } from './CarnivalActivityTermData';
import { CarnivalStageActivityData } from './CarnivalStageActivityData';
import { G_ServerTime, G_ServiceManager, G_SignalManager, G_ConfigLoader } from '../init';
import { SignalConst } from '../const/SignalConst';
import { CustomActivityConst } from '../const/CustomActivityConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { table } from '../utils/table';
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    0
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
schema['main_view'] = [
    'number',
    0
];
schema['icon_left_up'] = [
    'number',
    0
];
schema['icon_left_down'] = [
    'number',
    0
];
schema['icon_right_up'] = [
    'number',
    0
];
schema['icon_right_down'] = [
    'number',
    0
];

export interface CarnivalActivityUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
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
    getMain_view(): number
    setMain_view(value: number): void
    getLastMain_view(): number
    getIcon_left_up(): number
    setIcon_left_up(value: number): void
    getLastIcon_left_up(): number
    getIcon_left_down(): number
    setIcon_left_down(value: number): void
    getLastIcon_left_down(): number
    getIcon_right_up(): number
    setIcon_right_up(value: number): void
    getLastIcon_right_up(): number
    getIcon_right_down(): number
    setIcon_right_down(value: number): void
    getLastIcon_right_down(): number
}
export class CarnivalActivityUnitData extends BaseData {
    public static schema = schema;

    public _terms;
    public _visibleTerms: any[];
    constructor(properties?) {
        super(properties);
        this._terms = [];
        this._visibleTerms = [];
    }
    public initData(message) {
        this.setProperties(message);
        let keyhead1 = [
            'first_',
            'second_',
            'third_'
        ];
        let keyhead2 = [
            'one',
            'two',
            'three',
            'four'
        ];
        function safeSetVaule(dataImp, func, key) {
            let val = message[key];
            if (val) {
                func(val);
            }
        }
        for (let k = 1; k <= keyhead1.length; k++) {
            let v = keyhead1[k - 1];
            let isTermValid = message[v + 'term'];
            if (isTermValid != undefined && isTermValid == 1) {
                let termData = new CarnivalActivityTermData();
                termData.setCarnival_id(this.getId());
                termData.setTerm(k);
                termData.setPreview_time(message[v + 'preview_time']);
                termData.setStart_time(message[v + 'start_time']);
                termData.setEnd_time(message[v + 'end_time']);
                termData.setAward_time(message[v + 'award_time']);
                termData.setTerm_icon(message[v + 'term_icon']);
                termData.setTerm_show_icon(message[v + 'term_show_icon']);
                var stages = [];
                var offset = 0;
                var term_show_icon = termData.getTerm_show_icon();
                if (term_show_icon != 0) {
                    var stageData = new CarnivalStageActivityData();
                    stageData.setId(1);
                    let FestivalResConfog = G_ConfigLoader.getConfig(ConfigNameConst.FESTIVAL_RES);
                    var config = FestivalResConfog.get(termData.getTerm_icon());
                    var functionId = config.icon;
                    var funcInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(functionId);
                    stageData.setName(funcInfo.name);
                    stageData.setResID(111);
                    stageData.setSpecial_id(term_show_icon);
                    table.insert(stages, stageData);
                    offset = 1;
                }
                for (let k1 = 1; k1 <= keyhead2.length; k1++) {
                    let v1 = keyhead2[k1 - 1];
                    let isStageValid = message[v + ('stage_' + v1)];
                    if (isStageValid && isStageValid == 1) {
                        let stageData = new CarnivalStageActivityData();
                        stageData.setId(k1 + offset);
                        stageData.setName(message[v + ('stage_' + (v1 + '_name'))]);
                        stageData.setResID(message[v + ('stage_' + (v1 + '_src'))]);
                        stages.push(stageData);
                    }
                }
                termData.setStages(stages);
                this._terms.push(termData);
            }
        }
        this._registerClock();
        this._refreshVisibleTerm();
    }
    public _registerClock() {
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
            let tag = 'CARNIVAL_CHANGE_%d'.format(this.getId());
            G_ServiceManager.registerOneAlarmClock(tag, clockTime, function () {
                this._refreshVisibleTerm();
                G_SignalManager.dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE);
            });
        }
    }
    public _refreshVisibleTerm() {
        this._visibleTerms = [];
        let curTime = G_ServerTime.getTime();
        for (let k in this._terms) {
            let v = this._terms[k];
            if (v.getAward_time() >= curTime) {
                let clockTime;
                if (v.getPreview_time() > curTime) {
                    clockTime = v.getPreview_time();
                    v.setState(CustomActivityConst.STATE_NOT_START);
                } else if (v.getStart_time() > curTime) {
                    clockTime = v.getStart_time();
                    v.setState(CustomActivityConst.STATE_PREVIEW);
                    this._visibleTerms.push(v);
                } else if (v.getEnd_time() > curTime) {
                    clockTime = v.getEnd_time();
                    v.setState(CustomActivityConst.STATE_ING);
                    this._visibleTerms.push(v);
                } else {
                    clockTime = v.getAward_time();
                    v.setState(CustomActivityConst.STATE_AWARD_ING);
                    this._visibleTerms.push(v);
                }
                let tag = 'CARNIVAL_TERM_DATA_CHANGE_%d_%d'.format(this.getId(), v.getTerm());
                G_ServiceManager.registerOneAlarmClock(tag, clockTime, function () {
                    this._refreshVisibleTerm();
                    G_SignalManager.dispatch(SignalConst.EVENT_CARNIVAL_ACTIVITY_DATA_CHANGE);
                });
            } else {
                v.setState(CustomActivityConst.STATE_AWARD_END);
            }
        }
    }
    public getCurVisibleTermIndexByTermId(termId) {
        let index = 0;
        for (let k = 0; k < this._visibleTerms.length; k++) {
            let v = this._visibleTerms[k];
            if (v.getTerm() == termId) {
                index = k;
                break;
            }
        }
        return index;
    }
    public getVisibleTermList() {
        return this._visibleTerms;
    }
    public getTermDataById(id) {
        for (let k in this._terms) {
            let v = this._terms[k];
            if (v.getTerm() == id) {
                return v;
            }
        }
    }
    public foreach(callBack) {
        for (let k in this._terms) {
            let v = this._terms[k];
            if (callBack) {
                callBack(v);
            }
        }
    }
    public checkActIsVisible() {
        return this.isActInPreviewTime() || this.checkActIsInRunRewardTime();
    }
    public isActInPreviewTime() {
        let time = G_ServerTime.getTime();
        let startTime = this.getStart_time();
        let previewTime = this.getPreview_time();
        if (previewTime >= startTime) {
            return false;
        }
        return time >= previewTime && time < startTime;
    }
    public checkActIsInRunRewardTime() {
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
}
CarnivalActivityUnitData;