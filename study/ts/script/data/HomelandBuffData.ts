import { BaseData } from "./BaseData";
import { HomelandHelp } from "../scene/view/homeland/HomelandHelp";
import { HomelandConst } from "../const/HomelandConst";
import { G_ServerTime } from "../init";

var schema = {};
schema['id'] = [
    'number',
    0
];
schema['baseId'] = [
    'number',
    0
];
schema['pos'] = [
    'number',
    0
];
schema['startTime'] = [
    'number',
    0
];
schema['endTime'] = [
    'number',
    0
];
schema['useCount'] = [
    'number',
    0
];
schema['config'] = [
    'table',
    {}
];

export interface HomelandBuffData {
    getId(): number
    setId(value: number): void
    getBaseid(): number
    setBaseid(value: number): void
    getPos(): number
    setPos(value: number): void
    getStartTime(): number
    setStartTime(value: number): void
    getEndTime(): number
    setEndTime(value: number): void
    getUseCount(): number
    setUseCount(value: number): void
    getConfig(): any
    setConfig(value: any): void
}
export class HomelandBuffData extends BaseData {
    public static schema = schema;
    constructor() {
        super()
    }
    clear() {
    }
    reset() {
    }
    updateData(data) {
        this.setProperties(data);
        var baseId = data.baseId;
        var info = HomelandHelp.getTreeBuffConfig(baseId);
        this.setConfig(info);
    }
    isEffected() {
        var type = this.getConfig().type;
        if (type == HomelandConst.TREE_BUFF_TYPE_1) {
            return true;
        } else if (type == HomelandConst.TREE_BUFF_TYPE_2) {
            return this.getUseCount() >= this.getConfig().times;
        } else if (type == HomelandConst.TREE_BUFF_TYPE_3) {
            var curTime = G_ServerTime.getTime();
            return curTime >= this.getEndTime();
        }
    }
    getRestCount() {
        var userCount = this.getUseCount();
        var totalCount = this.getConfig().times;
        return totalCount - userCount;
    }
}