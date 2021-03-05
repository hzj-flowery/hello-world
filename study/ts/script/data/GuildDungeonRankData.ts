import { BaseData } from "./BaseData";

export interface GuildDungeonRankData {
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getPoint(): number
    setPoint(value: number): void
    getLastPoint(): number
    getNum(): number
    setNum(value: number): void
    getLastNum(): number
}
let schema = {};
schema['guild_id'] = [
    'number',
    0
];
schema['rank'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['point'] = [
    'number',
    0
];
schema['num'] = [
    'number',
    0
];
export class GuildDungeonRankData extends BaseData {
    public static schema = schema;

    constructor() {
        super();
    }
    public clear() {
    }
    public reset() {
    }
    public initData(message) {
        this.setProperties(message);
    }
}
