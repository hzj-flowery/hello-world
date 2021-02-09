import { BaseData } from "./BaseData";

export interface TowerBaseData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getStar(): number
    setStar(value: number): void
    getLastStar(): number
    getNow_star(): number
    setNow_star(value: number): void
    getLastNow_star(): number
    isReceive_box(): boolean
    setReceive_box(value: boolean): void
    isLastReceive_box(): boolean
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['star'] = [
    'number',
    0
];
schema['now_star'] = [
    'number',
    0
];
schema['receive_box'] = [
    'boolean',
    false
];
export class TowerBaseData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.backupProperties();
        this.setProperties(data);
    }
}
