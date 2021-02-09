import { BaseData } from './BaseData';
let schema = {};
schema['city_id'] = [
    'number',
    0
];
schema['guild_id'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    ''
];
schema['hurt'] = [
    'number',
    0
];
export interface GuildWarRankValue {
    getCity_id(): number
    setCity_id(value: number): void
    getLastCity_id(): number
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getHurt(): number
    setHurt(value: number): void
    getLastHurt(): number

}
export class GuildWarRankValue extends BaseData {

    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
    }
}
