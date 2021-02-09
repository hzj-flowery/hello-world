import { BaseData } from "./BaseData";

export interface SilkbagOnTeamUnitData {
    getPos(): number
    setPos(value: number): void
    getLastPos(): number
    getIndex(): number
    setIndex(value: number): void
    getLastIndex(): number
    getSilkbag_id(): number
    setSilkbag_id(value: number): void
    getLastSilkbag_id(): number
}
let schema = {};
schema['pos'] = [
    'number',
    0
];
schema['index'] = [
    'number',
    0
];
schema['silkbag_id'] = [
    'number',
    0
];
export class SilkbagOnTeamUnitData extends BaseData {

    public static schema = schema;
    public updateData(data) {
        this.setProperties(data);
    }
}
