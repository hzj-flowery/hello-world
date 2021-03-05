import { BaseData } from './BaseData';
import { G_UserData } from '../init';
import { CakeActivityDataHelper } from '../utils/data/CakeActivityDataHelper';
let schema = {};
schema['type'] = [
    'number',
    0
];

schema['value'] = [
    'number',
    0
];

schema['reward_id'] = [
    'object',
    {}
];

export interface CakeTaskData {
    getType(): number
    setType(value: number): void
    getLastType(): number
    getValue(): number
    setValue(value: number): void
    getLastValue(): number
    getReward_id(): Object
    setReward_id(value: Object): void
    getLastReward_id(): Object
}
export class CakeTaskData extends BaseData {
    public static schema = schema;
    public _curShowId: number;

    constructor(properties?) {
        super(properties)
        this._curShowId = 0;
    }
    public reset() {
    }
    public clear() {
    }
    public updateData(data) {
        this.setProperties(data);
        this._curShowId = this._findCurShowId();
    }
    public _findCurShowId() {
        let type = this.getType()
        let taskInfo = G_UserData.getCakeActivity().getTaskInfoWithType(type);
        let value = this.getValue();
        for (let i in taskInfo) {
            let info = taskInfo[i];
            if (value < info.times) {
                return info.id;
            } else if (this._isInReward(info.id) == false) {
                return info.id;
            }
        }
        return taskInfo[taskInfo.length -1].id;
    }
    public getCurShowId() {
        if (this._curShowId == 0) {
            this._curShowId = this._findCurShowId();
        }
        return this._curShowId;
    }
    public _isInReward(id) {
        let rewardIds = this.getReward_id();
        for (let i in rewardIds) {
            let rewardId = rewardIds[i];
            if (rewardId == id) {
                return true;
            }
        }
        return false;
    }
    public isFinish() {
        let curShowId = this.getCurShowId();
        if (this._isInReward(curShowId)) {
            return true;
        } else {
            return false;
        }
    }
    isCanReceive() {
        if (G_UserData.getCakeActivity().getActType() == 0) {
            return false;
        }
        var id = this.getCurShowId();
        var info = CakeActivityDataHelper.getCurCakeTaskConfig(id);
        if (this.isFinish() == false && this.getValue() >= info.times) {
            return true;
        } else {
            return false;
        }
    }
}