import { BaseData } from './BaseData';
let schema = {};
schema['task_id'] = [
    'number',
    0
];

schema['status'] = [
    'number',
    0
];

schema['param1'] = [
    'number',
    0
];

export interface CombineTaskStatusData {
    getTask_id(): number
    setTask_id(value: number): void
    getLastTask_id(): number
    getStatus(): number
    setStatus(value: number): void
    getLastStatus(): number
    getParam1(): number
    setParam1(value: number): void
    getLastParam1(): number
}
export class CombineTaskStatusData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties)
    }
    public initData(msg) {
        this.setProperties(msg);
    }
}