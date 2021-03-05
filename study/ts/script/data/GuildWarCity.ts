import { BaseData } from './BaseData';
let schema = {};
schema['city_id'] = [
    'number',
    0
];
schema['own_guild_id'] = [
    'number',
    0
];
schema['own_guild_name'] = [
    'string',
    ''
];
schema['own_guild_icon'] = [
    'number',
    0
];
schema['is_declare'] = [
    'boolean',
    false
];
schema['declare_guild_num'] = [
    'number',
    0
];
export interface GuildWarCity {
    getCity_id(): number
    setCity_id(value: number): void
    getLastCity_id(): number
    getOwn_guild_id(): number
    setOwn_guild_id(value: number): void
    getLastOwn_guild_id(): number
    getOwn_guild_name(): string
    setOwn_guild_name(value: string): void
    getLastOwn_guild_name(): string
    getOwn_guild_icon(): number
    setOwn_guild_icon(value: number): void
    getLastOwn_guild_icon(): number
    isIs_declare(): boolean
    setIs_declare(value: boolean): void
    isLastIs_declare(): boolean
    getDeclare_guild_num(): number
    setDeclare_guild_num(value: number): void
    getLastDeclare_guild_num(): number
}
export class GuildWarCity extends BaseData {

    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
    }
}
