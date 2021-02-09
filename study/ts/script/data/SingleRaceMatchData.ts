import { BaseData } from "./BaseData";

export interface SingleRaceMatchData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getPosition(): number
    setPosition(value: number): void
    getLastPosition(): number
    getAtk_user_support(): number
    setAtk_user_support(value: number): void
    getLastAtk_user_support(): number
    getDef_user_support(): number
    setDef_user_support(value: number): void
    getLastDef_user_support(): number
}
let schema = {};
schema['user_id'] = [
    'number',
    0
];
schema['position'] = [
    'number',
    0
];
schema['atk_user_support'] = [
    'number',
    0
];
schema['def_user_support'] = [
    'number',
    0
];
export class SingleRaceMatchData extends BaseData {

    public static schema = schema;
    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.setProperties(data);
    }
}
