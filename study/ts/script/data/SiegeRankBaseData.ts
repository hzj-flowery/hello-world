import { BaseData } from "./BaseData";

export interface SiegeRankBaseData {
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getHurt(): number
    setHurt(value: number): void
    getLastHurt(): number
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
}
let schema = {};
schema['rank'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['hurt'] = [
    'number',
    0
];
schema['user_id'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
schema['officer_level'] = [
    'number',
    0
];
export class SiegeRankBaseData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
    }
}
