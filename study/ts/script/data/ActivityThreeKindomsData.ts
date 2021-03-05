import { BaseData } from './BaseData';
import { G_UserData, G_ServerTime } from '../init';
import { TimeLimitActivityConst } from '../const/TimeLimitActivityConst';
import { FunctionConst } from '../const/FunctionConst';
let schema = {};
schema['act_id'] = [
    'number',
    1
];
schema['act_type'] = [
    'number',
    0
];
schema['finish_time'] = [
    'number',
    0
];
schema['title'] = [
    'string',
    ''
];
schema['status'] = [
    'number',
    0
];
schema['combineTaskQueryTask'] = [
    'object',
    {}
];
export interface ActivityThreeKindomsData {
getAct_id(): number
setAct_id(value: number): void
getLastAct_id(): number
getAct_type(): number
setAct_type(value: number): void
getLastAct_type(): number
getFinish_time(): number
setFinish_time(value: number): void
getLastFinish_time(): number
getTitle(): string
setTitle(value: string): void
getLastTitle(): string
getStatus(): number
setStatus(value: number): void
getLastStatus(): number
getCombineTaskQueryTask(): Object
setCombineTaskQueryTask(value: Object): void
getLastCombineTaskQueryTask(): Object
}
export class ActivityThreeKindomsData extends BaseData {
    public static schema = schema;

    constructor (properties?) {
        super(properties);
        if (properties) {
            this.updateData(properties);
        }
    }
    public clear () {
    }
    public reset () {
    }
    public hasRedPoint () {
        let newShowed = !G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_ACTIVITY, {
            actId: TimeLimitActivityConst.ID_TYPE_THREEKINDOMS,
            actType: TimeLimitActivityConst.ID_TYPE_THREEKINDOMS
        });
        return [
            true,
            newShowed,
            this._isShowRedPoint()
        ];
    }
    public updateData (data) {
        this.setProperties(data);
    }
    public isActivityFinish () {
        if (this.getStatus() == 0) {
            return true;
        }
        if (this.getFinish_time() == 0) {
            return false;
        } else {
            return G_ServerTime.getLeftSeconds(this.getFinish_time()) <= 0;
        }
    }
    public updateFinishTime (finishTime) {
        this.setFinish_time(finishTime != null && finishTime || 0);
    }
    public updateStatus (status) {
        this.setStatus(status);
    }
    public updateCombineTaskQueryTask (data) {
        this.setCombineTaskQueryTask(data);
    }
    public _isShowRedPoint () {
        if (this.getCombineTaskQueryTask() == null) {
            return false;
        }
        for (let key in this.getCombineTaskQueryTask()) {
            let value = this.getCombineTaskQueryTask()[key];
            if (value.task_status == 3) {
                return true;
            }
        }
        return false;
    }
}
 ActivityThreeKindomsData;