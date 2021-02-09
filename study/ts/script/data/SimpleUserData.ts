import { BaseData } from "./BaseData";

export interface SimpleUserData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
    getLeader(): number
    setLeader(value: number): void
    getLastLeader(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
    getTitle(): number
    setTitle(value: number): void
    getLastTitle(): number
    getLevel(): number
    setLevel(value: number): void
    getLastLevel(): number
}
let schema = {};
schema['user_id'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['officer_level'] = [
    'number',
    0
];
schema['leader'] = [
    'number',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['title'] = [
    'number',
    0
];
schema['level'] = [
    'number',
    0
];
export class SimpleUserData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
}
