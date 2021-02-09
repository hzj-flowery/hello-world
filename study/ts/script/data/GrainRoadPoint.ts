import { BaseData } from "./BaseData";


export interface GrainRoadPoint {
    getMine_id(): number
    setMine_id(data: number): void
    getNext_mine_id(): number
    setNext_mine_id(data: number): void
    getEnter_time(): number
    setEnter_time(data: number): void
    getLeave_time(): number
    setLeave_time(data: number): void
    getPre_leave_time(): number
    setPre_leave_time(data: number): void
    getGuild_id(): number
    setGuild_id(data: number): void
    getGuild_name(): number
    setGuild_name(data: number): void
}

var schema = {};
schema['mine_id'] = [
    'number',
    0
];
schema['next_mine_id'] = [
    'number',
    0
];
schema['enter_time'] = [
    'number',
    0
];
schema['leave_time'] = [
    'number',
    0
];
schema['pre_leave_time'] = [
    'number',
    0
];
schema['guild_id'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    0
];
export class GrainRoadPoint extends BaseData {

    public static schema = schema;
    constructor(properties?) {
        super(properties);
    }
    clear() {
    }
    reset() {
    }
    initData(msg) {
        this.setProperties(msg);
    }
    updateData(data) {
    }
    insertData(data) {
    }
    deleteData(data) {
    }
};