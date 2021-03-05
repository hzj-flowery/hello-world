import { BaseData } from "./BaseData";

export interface SiegeGuildRankBaseData {
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getHurt(): number
    setHurt(value: number): void
    getLastHurt(): number
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
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
schema['guild_id'] = [
    'number',
    0
];
export class SiegeGuildRankBaseData extends BaseData {

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
