import { BaseData } from "./BaseData";
import { ActivityEquipDataHelper } from "../utils/data/ActivityEquipDataHelper";

export interface CustomActivityRechargeUnitData {
    getAct_type(): number
    setAct_type(value: number): void
    getLastAct_type(): number
    getFree_use(): number
    setFree_use(value: number): void
    getLastFree_use(): number
    getTotal_use(): number
    setTotal_use(value: number): void
    getLastTotal_use(): number
    getLast_draw_time(): number
    setLast_draw_time(value: number): void
    getLastLast_draw_time(): number
    getRecords(): any[]
    setRecords(value: any[]): void
    getLastRecords(): any[]
}
let schema = {};
schema['act_type'] = [
    'number',
    0
];
schema['free_use'] = [
    'number',
    0
];
schema['total_use'] = [
    'number',
    0
];
schema['last_draw_time'] = [
    'number',
    0
];
schema['records'] = [
    'object',
    []
];
export class CustomActivityRechargeUnitData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        let actType = data['act_type'] || 0;
        let freeUse = data['free_use'] || 0;
        let totalUse = data['total_use'] || 0;
        let lastDrawTime = data['last_draw_time'] || 0;
        let records = data['records'] || {};
        this.setAct_type(actType);
        this.setFree_use(freeUse);
        this.setTotal_use(totalUse);
        this.setLast_draw_time(lastDrawTime);
        this.setRecords(records);
        this.resetTime();
    }
    public getRestFreeCount(batch) {
        let info = ActivityEquipDataHelper.getActiveConfig(batch);
        let limitNum = info.day_free1;
        let usedNum = this.getFree_use();
        let restNum = limitNum - usedNum;
        if (restNum < 0) {
            restNum = 0;
        }
        return restNum;
    }
    public getRecordList(restCount, showCount) {
        showCount = showCount || 10;
        let result = [];
        let records = this.getRecords();
        let len = records.length;
        let targetIndex = len - restCount;
        for (let i = targetIndex - showCount + 1; i <= targetIndex; i++) {
            let id = records[i];
            if (id) {
                let info = ActivityEquipDataHelper.getActiveDropConfig(id);
                let unit = {
                    type: info.type,
                    id: info.value,
                    num: info.size
                };
                result.push(unit);
            }
        }
        return result;
    }
}
