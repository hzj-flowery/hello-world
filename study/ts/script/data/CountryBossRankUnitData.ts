import { BaseData } from './BaseData';
let schema = {};
schema['guild_id'] = [
    'number',
    0
];

schema['hurt_rate'] = [
    'number',
    0
];

schema['guild_name'] = [
    'string',
    0
];

schema['rank'] = [
    'number',
    0
];

export interface CountryBossRankUnitData {
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getHurt_rate(): number
    setHurt_rate(value: number): void
    getLastHurt_rate(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
}
export class CountryBossRankUnitData extends BaseData {
    public static schema = schema;
}