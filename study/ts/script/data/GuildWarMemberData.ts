import { BaseData } from './BaseData';
let schema = {};
schema['user_id'] = [
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
export interface GuildWarMemberData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getUser_name(): string
    setUser_name(value: string): void
    getLastUser_name(): string
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
}
export class GuildWarMemberData extends BaseData {
    public static KEY_KILL = 1;
    public static KEY_ATTACK = 2;
    public static KEY_CONTRIBUTION = 3;
    public static schema = schema;

    public _map;
    constructor() {
        super();
        super()
        this._map = {};
    }
    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
        let map = {};
        let warData = data['war_data'] || {};
        console.log(warData);
        for (let k in warData) {
            let v = warData[k];
            map[v.Key] = v.Value;
        }
        this._map = map;
        console.log(map);
    }
    public getValue(key) {
        return this._map[key] || 0;
    }
}
GuildWarMemberData;
