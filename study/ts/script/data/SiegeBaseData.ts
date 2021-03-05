import { BaseData } from "./BaseData";

export interface SiegeBaseData {
    getUid(): number
    setUid(value: number): void
    getLastUid(): number
    getUser_name(): string
    setUser_name(value: string): void
    getLastUser_name(): string
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getId(): number
    setId(value: number): void
    getLastId(): number
    getEnd_time(): number
    setEnd_time(value: number): void
    getLastEnd_time(): number
    getHp_now(): number
    setHp_now(value: number): void
    getLastHp_now(): number
    getHp_max(): number
    setHp_max(value: number): void
    getLastHp_max(): number
    getKiller_id(): number
    setKiller_id(value: number): void
    getLastKiller_id(): number
    getKiller_name(): string
    setKiller_name(value: string): void
    getLastKiller_name(): string
    getKiller_officer_level(): number
    setKiller_officer_level(value: number): void
    getLastKiller_officer_level(): number
    isPublic(): boolean
    setPublic(value: boolean): void
    isLastPublic(): boolean
    getBoss_level(): number
    setBoss_level(value: number): void
    getLastBoss_level(): number
    isBoxEmpty(): boolean
    setBoxEmpty(value: boolean): void
    isLastBoxEmpty(): boolean
    isNotExist(): boolean
    setNotExist(value: boolean): void
    isLastNotExist(): boolean
}

let schema = {};
schema['uid'] = [
    'number',
    0
];
schema['user_name'] = [
    'string',
    ''
];
schema['officer_level'] = [
    'number',
    0
];
schema['id'] = [
    'number',
    0
];
schema['end_time'] = [
    'number',
    0
];
schema['hp_now'] = [
    'number',
    0
];
schema['hp_max'] = [
    'number',
    0
];
schema['killer_id'] = [
    'number',
    0
];
schema['killer_name'] = [
    'string',
    ''
];
schema['killer_officer_level'] = [
    'number',
    0
];
schema['public'] = [
    'boolean',
    false
];
schema['boss_level'] = [
    'number',
    0
];
schema['boxEmpty'] = [
    'boolean',
    false
];
schema['notExist'] = [
    'boolean',
    false
];
export class SiegeBaseData extends BaseData {
    public static schema = schema;

    public updateData(data) {
        this.setProperties(data);
    }
}
