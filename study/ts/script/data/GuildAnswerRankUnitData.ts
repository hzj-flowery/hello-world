import { BaseData } from "./BaseData";

export interface GuildAnswerRankUnitData {
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getPoint(): number
    setPoint(value: number): void
    getLastPoint(): number
}
let schema = {};
schema['guild_id'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['rank'] = [
    'number',
    0
];
schema['point'] = [
    'number',
    0
];
export class GuildAnswerRankUnitData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
}
