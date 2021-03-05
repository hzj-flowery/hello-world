import { BaseData } from "./BaseData";

export interface DailyDungeonBaseData {
    getType(): number
    setType(value: number): void
    getLastType(): number
    getRemain_count(): number
    setRemain_count(value: number): void
    getLastRemain_count(): number
    getLast_battle_time(): number
    setLast_battle_time(value: number): void
    getLastLast_battle_time(): number
    getFirst_enter_max_id(): number
    setFirst_enter_max_id(value: number): void
    getLastFirst_enter_max_id(): number
    getMax_id(): number
    setMax_id(value: number): void
    getLastMax_id(): number
}

let schema = {};
schema['type'] = [
    'number',
    0
];
schema['remain_count'] = [
    'number',
    0
];
schema['last_battle_time'] = [
    'number',
    0
];
schema['first_enter_max_id'] = [
    'number',
    0
];
schema['max_id'] = [
    'number',
    0
];
export class DailyDungeonBaseData extends BaseData {
    public static schema = schema;

    public updateData(properties) {
        this.backupProperties();
        this.setProperties(properties);
    }
}
