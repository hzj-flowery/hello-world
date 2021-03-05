import { BaseData } from "./BaseData";

export interface TowerRankBaseData {
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getStar(): number
    setStar(value: number): void
    getLastStar(): number
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getLayer(): number
    setLayer(value: number): void
    getLastLayer(): number
}
let schema = {};
schema['rank'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['star'] = [
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
schema['layer'] = [
    'number',
    0
];
export class TowerRankBaseData extends BaseData {
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
