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
schema['guild_icon'] = [
    'number',
    0
];
schema['guild_noraml_end_rank'] = [
    'number',
    0
];

export interface GuildCakeData {
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
    getGuild_icon(): number
    setGuild_icon(value: number): void
    getLastGuild_icon(): number
    getGuild_noraml_end_rank(): number
    setGuild_noraml_end_rank(value: number): void
    getLastGuild_noraml_end_rank(): number
}
export class GuildCakeData extends BaseData {
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
    public isLevelUp() {
        let lastLevel = this.getLastCake_level();
        let curLevel = this.getCake_level();
        return curLevel > lastLevel;
    }
}
