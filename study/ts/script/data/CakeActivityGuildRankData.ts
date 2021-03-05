import { BaseData } from './BaseData';
let schema = {};
schema['guild_id'] = [
    'number',
    0
];

schema['guild_name'] = [
    'string',
    ''
];

schema['cake_level'] = [
    'number',
    0
];

schema['cake_exp'] = [
    'number',
    0
];

schema['rank'] = [
    'number',
    9999
];

schema['server_id'] = [
    'number',
    0
];

schema['server_name'] = [
    'string',
    ''
];

export interface CakeActivityGuildRankData {
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getCake_level(): number
    setCake_level(value: number): void
    getLastCake_level(): number
    getCake_exp(): number
    setCake_exp(value: number): void
    getLastCake_exp(): number
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
    getServer_id(): number
    setServer_id(value: number): void
    getLastServer_id(): number
    getServer_name(): string
    setServer_name(value: string): void
    getLastServer_name(): string
}
export class CakeActivityGuildRankData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties)
    }
    public reset() {
    }
    public clear() {
    }
    public updateData(data) {
        this.backupProperties();
        this.setProperties(data);
    }
    public getChangeResName() {
        let curRank = this.getRank();
        let lastRank = this.getLastRank();
        if (curRank < lastRank) {
            return 'img_battle_arrow_up';
        } else if (curRank == lastRank) {
            return 'img_battle_arrow_balance';
        } else {
            return 'img_battle_arrow_down';
        }
    }
}