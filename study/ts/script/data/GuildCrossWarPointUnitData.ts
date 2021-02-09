import { BaseData } from "./BaseData";
import { G_UserData } from "../init";

export interface GuildCrossWarPointUnitData {
    getKey_point_id(): number
    setKey_point_id(value: number): void
    getLastKey_point_id(): number
    getGuild_id(): number
    setGuild_id(value: number): void
    getLastGuild_id(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getSid(): number
    setSid(value: number): void
    getLastSid(): number
    getSname(): string
    setSname(value: string): void
    getLastSname(): string
    getAction(): number;
    setAction(value: number): void
    getLastAction(): number
}
let schema = {};
schema['key_point_id'] = [
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
schema['sid'] = [
    'number',
    0
];
schema['sname'] = [
    'string',
    ''
];
schema['action'] = [
    'action',
    0
];
export class GuildCrossWarPointUnitData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.setProperties(data);
    }
    public isSelfGuild() {
        return this.getGuild_id() == G_UserData.getGuild().getMyGuildId();
    }
}
