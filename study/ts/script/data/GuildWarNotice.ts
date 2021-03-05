import { BaseData } from './BaseData';
let schema = {};
schema['guild_name'] = [
    'string',
    ''
];
schema['user_name'] = [
    'string',
    ''
];
schema['point_id'] = [
    'number',
    0
];
schema['id'] = [
    'number',
    0
];
export interface GuildWarNotice {
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getUser_name(): string
    setUser_name(value: string): void
    getLastUser_name(): string
    getPoint_id(): number
    setPoint_id(value: number): void
    getLastPoint_id(): number
    getId(): number
    setId(value: number): void
    getLastId(): number
}
export class GuildWarNotice extends BaseData {
    public static schema = schema;

    public _map;
    public _map2;
    constructor() {
        super()
        this._map = [];
        this._map2 = [];
    }
    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
    }
    public setValue(key, value) {
        this._map.push({
            key: key,
            value: String(value)
        })
        this._map2[key] = String(value);
    }
    public getMap() {
        return this._map;
    }
    public getMap2() {
        return this._map2;
    }
}
GuildWarNotice;
