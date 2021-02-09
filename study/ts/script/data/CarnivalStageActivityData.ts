import { BaseData } from './BaseData';
import { ArraySort } from '../utils/handler';
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['resID'] = [
    'number',
    ''
];
schema['activitys'] = [
    'object',
    []
];
schema['special_id'] = [
    'number',
    0
];

export interface CarnivalStageActivityData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getResID(): number
    setResID(value: number): void
    getLastResID(): number
    getActivitys(): any[]
    setActivitys(value: any[]): void
    getLastActivitys(): any[]
    getSpecial_id(): number
    setSpecial_id(value: number): void
    getLastSpecial_id(): number
}
export class CarnivalStageActivityData extends BaseData {
    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public getVisibleActivitys() {
        let activitys = this.getActivitys();
        let visibleActivitys = [];
        for (let k in activitys) {
            let v = activitys[k];
            if (v.checkActIsVisible()) {
                visibleActivitys.push(v);
            }
        }
        let sortFunc = function (left, right) {
            if (left.getSort() != right.getSort()) {
                return left.getSort() < right.getSort();
            }
            return left.getId() < right.getId();
        };
        ArraySort(visibleActivitys, sortFunc);
        return visibleActivitys;
    }
    public getActivityDataById(id) {
        let activitys = this.getActivitys();
        for (let _ in activitys) {
            let v = activitys[_];
            if (v.getId() == id) {
                return v;
            }
        }
    }
    public insertActivityData(activityData) {
        let activitys = this.getActivitys();
        activitys.push(activityData);
        ArraySort(activitys, function (a, b) {
            if (a.getSort() == b.getSort()) {
                return a.getId() < b.getId();
            } else {
                return a.getSort() < b.getSort();
            }
        });
    }
    public removeActivityData(activityData) {
        let activitys = this.getActivitys();
        for (let k = 0; k < activitys.length; k++) {
            let v = activitys[k];
            if (v.getId() == activityData.getId()) {
                activitys.splice(k, 1);
                break;
            }
        }
    }
    public isHasRedPoint(id) {
        let activitys = this.getActivitys();
        for (let _ in activitys) {
            let v = activitys[_];
            if (v.isHasRedPoint()) {
                return true;
            }
        }
    }
}