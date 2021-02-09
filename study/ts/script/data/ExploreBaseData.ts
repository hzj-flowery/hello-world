import { BaseData } from "./BaseData";
let schema = {};
schema['id'] = [
    'number',
    0
];

schema['map_id'] = [
    'number',
    0
];

schema['foot_index'] = [
    'number',
    0
];

schema['pass_count'] = [
    'number',
    0
];

schema['events'] = [
    'object',
    {}
];

schema['award'] = [
    'object',
    {}
];

schema['roll_nums'] = [
    'object',
    {}
];

schema['configData'] = [
    'object',
    {}
];
export interface ExploreBaseData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getMap_id(): number
    setMap_id(value: number): void
    getLastMap_id(): number
    getFoot_index(): number
    setFoot_index(value: number): void
    getLastFoot_index(): number
    getPass_count(): number
    setPass_count(value: number): void
    getLastPass_count(): number
    getEvents(): any[]
    setEvents(value: any[]): void
    getLastEvents(): any[]
    getAward(): any[]
    setAward(value: any[]): void
    getLastAward(): any[]
    getRoll_nums(): Object
    setRoll_nums(value: Object): void
    getLastRoll_nums(): Object
    getConfigData(): any
    setConfigData(value: any): void
    getLastConfigData(): any
}
export class ExploreBaseData extends BaseData {
    public static schema = schema;

    updateData(data) {
        this.setId(data.id);
        this.setFoot_index(data.foot_index);
        this.setMap_id(data.map_id);
        this.setPass_count(data.pass_count);
        if (data.hasOwnProperty('events')) {
            var list = [];
            for (var i in data.events) {
                var v = data.events[i];
                list.push(v);
            }
            this.setEvents(list);
        }
        if (data.hasOwnProperty('awards')) {
            var awardList = [];
            for (var i in data.awards) {
                var v = data.awards[i];
                var award = {
                    type: v.type,
                    value: v.value,
                    size: v.size
                };
                awardList.push(award);
            }
            this.setAward(awardList);
        }
        else {
            this.setAward([]);
        }
        this.clearRollNum();
        if (data.hasOwnProperty('roll_nums')) {
            var rollList = [];
            for (var i in data.roll_nums) {
                var v = data.roll_nums[i];
                rollList.push(v);
            }
            this.setRoll_nums(rollList);
        }
    }
    clearRollNum() {
        this.setRoll_nums([]);
    }
    isFirstPass() {
        return this.getPass_count() == 2;
    }
}