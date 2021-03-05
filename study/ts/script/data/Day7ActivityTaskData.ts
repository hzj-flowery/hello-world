import { BaseData } from "./BaseData";

export interface Day7ActivityTaskData {
    getTask_type(): number
    setTask_type(value: number): void
    getLastTask_type(): number
    getTask_value(): number
    setTask_value(value: number): void
    getLastTask_value(): number
    getTaskRewards(): Object
    setTaskRewards(value: Object): void
    getLastTaskRewards(): Object
}
let schema = {};
schema['task_type'] = [
    'number',
    0
];
schema['task_value'] = [
    'number',
    0
];
schema['taskRewards'] = [
    'object',
    {}
];
export class Day7ActivityTaskData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
        let taskRewards = data['task_rewards'] || {};
        let newTaskRewards = {};
        for (let k in taskRewards) {
            let v = taskRewards[k];
            newTaskRewards[k] = v;
        }
        this.setTaskRewards(newTaskRewards);
    }
    public hasReceived(taskId) {
        return this.getReceivePrizeCount(taskId) > 0;
    }
    public getReceivePrizeCount(taskId) {
        let taskRewards = this.getTaskRewards();
        let count = 0;
        for (let k in taskRewards) {
            let v = taskRewards[k];
            if (v == taskId) {
                count = count + 1;
            }
        }
        return count;
    }
}
