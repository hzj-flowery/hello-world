import { BaseData } from './BaseData';
let schema = {};
schema['rank'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    ''
];
schema['guild_leader_name'] = [
    'string',
    ''
];
schema['guild_leader_office_level'] = [
    'number',
    0
];
export interface ActivityGuildSprintRankUnitData {
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getGuild_leader_name(): string
    setGuild_leader_name(value: string): void
    getLastGuild_leader_name(): string
    getGuild_leader_office_level(): number
    setGuild_leader_office_level(value: number): void
    getLastGuild_leader_office_level(): number
}
export class ActivityGuildSprintRankUnitData extends BaseData {

    public static schema = schema;

    constructor(properties?) {
        super(properties);
        super(properties)
        if (properties) {
            this.initData(properties);
        }
    }
    public clear() {
    }
    public reset() {
    }
    public initData(properties) {
        this.setProperties(properties);
    }
}