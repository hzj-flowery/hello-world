import { BaseData } from "./BaseData";
import { G_ConfigLoader, G_UserData } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { Day7ActivityConst } from "../const/Day7ActivityConst";

export interface Day7ActivityTaskUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getConfig(): any
    setConfig(value: any): void
    getLastConfig(): any
    isInited(): boolean
    setInited(value: boolean): void
    isLastInited(): boolean
    getRewards(): Object
    setRewards(value: Object): void
    getLastRewards(): Object
    isHasReach(): boolean
    setHasReach(value: boolean): void
    isLastHasReach(): boolean
    isCanTaken(): boolean
    setCanTaken(value: boolean): void
    isLastCanTaken(): boolean
    isHasReceived(): boolean
    setHasReceived(value: boolean): void
    isLastHasReceived(): boolean
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
schema['inited'] = [
    'boolean',
    false
];
schema['rewards'] = [
    'object',
    {}
];
schema['hasReach'] = [
    'boolean',
    false
];
schema['canTaken'] = [
    'boolean',
    false
];
schema['hasReceived'] = [
    'boolean',
    false
];
export class Day7ActivityTaskUnitData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setId(data.id);
        let SevenDaysTask = G_ConfigLoader.getConfig(ConfigNameConst.SEVEN_DAYS_TASK);
        let cfg = SevenDaysTask.get(data.id);
        console.assert(cfg, 'seven_days_task not find id ' + data.id);
        this.setConfig(cfg);
        this.setInited(true);
        this.setRewards(this._makeRewards());
    }
    public _makeRewards() {
        let cfg = this.getConfig();
        let rewardList = [];
        for (let i = 1; i <= Day7ActivityConst.TASK_REWARD_ITEM_MAX; i += 1) {
            if (cfg['type_' + i] != 0) {
                let reward = {
                    type: cfg['type_' + i],
                    value: cfg['value_' + i],
                    size: cfg['size_' + i]
                };
                rewardList.push(reward);
            }
        }
        return rewardList;
    }
    public isTaskHasReceiveCount(actTaskData) {
        console.assert(this.isInited() == true, 'call isTaskHasReceiveCount when not inited');
        if (!actTaskData) {
            return false;
        }
        let receiveCount = actTaskData.getReceivePrizeCount(this.getId());
        let rewardCount = this.getConfig().reward_count;
        return receiveCount < rewardCount;
    }
    public isTaskHasReceived(actTaskData) {
        console.assert(this.isInited() == true, 'call isTaskHasReceived when not inited');
        if (!actTaskData) {
            return false;
        }
        let receiveCount = actTaskData.getReceivePrizeCount(this.getId());
        return receiveCount > 0;
    }
    public isTaskReachReceiveCondition(actTaskData) {
        console.assert(this.isInited() == true, 'call isTaskReachReceiveCondition when not inited');
        if (!actTaskData) {
            return false;
        }
        let taskValue01 = this.getConfig().task_value_1 || 0;
        let taskValue02 = this.getConfig().task_value_2 || 0;
        if (actTaskData.getTask_type() == Day7ActivityConst.TASK_TYPE_ARENA) {
            return actTaskData.getTask_value() <= taskValue01;
        }
        if (actTaskData.getTask_value() >= taskValue01) {
            return true;
        }
        return false;
    }
    public getDescription() {
        console.assert(this.isInited() == true, 'call isTaskReachReceiveCondition when not inited');
        let taskDes = this.getConfig().task_description;
        let taskValue01 = this.getConfig().task_value_1;
        taskDes = taskDes.format(taskValue01);
        return taskDes;
    }
    public getTaskType() {
        console.assert(this.isInited() == true, 'call getTaskType when not inited');
        return this.getConfig().task_type;
    }
    public getTaskValue(day7ActData) {
        day7ActData = day7ActData || G_UserData.getDay7Activity();
        let actTaskData = day7ActData.getActivityTaskDataByTaskType(this.getTaskType());
        if (!actTaskData) {
            return 0;
        }
        return actTaskData.getTask_value();
    }
}
