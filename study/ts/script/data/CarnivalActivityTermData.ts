import { BaseData } from './BaseData';
import { G_ServerTime } from '../init';
let schema = {};
schema['term'] = [
    'number',
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
schema['state'] = [
    'number',
    0
];
schema['stages'] = [
    'object',
    {}
];
schema['carnival_id'] = [
    'number',
    0
];
schema['term_icon'] = [
    'number',
    0
];
schema['term_show_icon'] = [
    'number',
    0
];

export interface CarnivalActivityTermData {
    getTerm(): number
    setTerm(value: number): void
    getLastTerm(): number
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
    getState(): number
    setState(value: number): void
    getLastState(): number
    getStages(): Object
    setStages(value: Object): void
    getLastStages(): Object
    getCarnival_id(): number
    setCarnival_id(value: number): void
    getLastCarnival_id(): number
    getTerm_icon(): number
    setTerm_icon(value: number): void
    getLastTerm_icon(): number
    getTerm_show_icon(): number
    setTerm_show_icon(value: number): void
    getLastTerm_show_icon(): number
}
export class CarnivalActivityTermData extends BaseData {
    public static schema = schema;


    public clear() {
    }
    public reset() {
    }
    public getStageDataById(id) {
        let stages = this.getStages();
        var targetId = id;
        if (stages[1] && stages[1].getSpecial_id() != 0) {
            targetId = targetId + 1;
        }
        for (let _ in stages) {
            let v = stages[_];
            if (v.getId() == targetId) {
                return v;
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