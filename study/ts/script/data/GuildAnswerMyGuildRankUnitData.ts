import { BaseData } from "./BaseData";

export interface GuildAnswerMyGuildRankUnitData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getPoint(): number
    setPoint(value: number): void
    getLastPoint(): number
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
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
schema['point'] = [
    'number',
    0
];
schema['rank'] = [
    'number',
    0
];
export class GuildAnswerMyGuildRankUnitData extends BaseData {

    public static schema = schema;
    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
}
