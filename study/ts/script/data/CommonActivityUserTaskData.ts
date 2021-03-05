import { BaseData } from './BaseData';
let schema = {};
schema['act_id'] = [
    'number',
    0
];

schema['quest_id'] = [
    'number',
    0
];

schema['time'] = [
    'number',
    0
];

schema['time2'] = [
    'number',
    0
];

schema['progress'] = [
    'string',
    0
];

schema['award_time'] = [
    'number',
    0
];

schema['award_times'] = [
    'number',
    0
];

schema['progress_second'] = [
    'string',
    0
];

schema['valueMap'] = [
    'object',
    {}
];

export interface CommonActivityUserTaskData {
    getAct_id(): number
    setAct_id(value: number): void
    getLastAct_id(): number
    getQuest_id(): number
    setQuest_id(value: number): void
    getLastQuest_id(): number
    getTime(): number
    setTime(value: number): void
    getLastTime(): number
    getTime2(): number
    setTime2(value: number): void
    getLastTime2(): number
    getProgress(): string
    setProgress(value: string): void
    getLastProgress(): string
    getAward_time(): number
    setAward_time(value: number): void
    getLastAward_time(): number
    getAward_times(): number
    setAward_times(value: number): void
    getLastAward_times(): number
    getProgress_second(): string
    setProgress_second(value: string): void
    getLastProgress_second(): string
    getValueMap(): Object
    setValueMap(value: Object): void
    getLastValueMap(): Object
}
export class CommonActivityUserTaskData extends BaseData {

    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
        let valueList = data['value'] || {};
        let valueMap = this.getValueMap();
        for (let k in valueList) {
            let v = valueList[k];
            valueMap[v.Key] = v.Value;
        }
    }
    public getProgressValue() {
        return Number(this.getProgress()) || 0;
    }
    public getProgressValue2() {
        return Number(this.getProgress_second()) || 0;
    }
    public getValue(key) {
        let valueMap = this.getValueMap();
        return valueMap[key] || 0;
    }
}