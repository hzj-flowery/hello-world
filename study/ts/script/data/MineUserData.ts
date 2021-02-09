import { BaseData } from "./BaseData";

export interface MineUserData {
    getUser_id(): number
    setUser_id(data: number): void
    getUser_name(): string
    setUser_name(data: string): void
    getGuild_id(): number
    setGuild_id(data: number): void
    getGuild_name(): string
    setGuild_name(data: string): void
    getArmy_value(): number
    setArmy_value(data: number): void
    getTired_value(): number
    setTired_value(data: number): void
    getOfficer_level(): number
    setOfficer_level(data: number): void
    getBase_id(): number
    setBase_id(data: number): void
    getPower(): number
    setPower(data: number): void
    getGuild_level(): number
    setGuild_level(data: number): void
    getGuild_exp(): number
    setGuild_exp(data: number): void
    getBuff_id(): number
    setBuff_id(data: number): void
    getAvatar_base_id(): number
    setAvatar_base_id(data: number): void
    getGuild_icon(): number
    setGuild_icon(data: number): void
    getTitle(): number
    setTitle(data: number): void
    getPrivilege_time(): number
    setPrivilege_time(data: number): void
    getInfam_value(): number
    setInfam_value(data: number): void
    getRefresh_time(): number
    setRefresh_time(data: number): void
}

var schema = {};
schema['user_id'] = [
    'number',
    0
];
schema['user_name'] = [
    'string',
    ''
];
schema['guild_id'] = [
    'number',
    0
];
schema['guild_name'] = [
    'string',
    ''
];
schema['army_value'] = [
    'number',
    0
];
schema['tired_value'] = [
    'number',
    0
];
schema['officer_level'] = [
    'number',
    0
];
schema['base_id'] = [
    'number',
    0
];
schema['power'] = [
    'number',
    0
];
schema['guild_level'] = [
    'number',
    0
];
schema['guild_exp'] = [
    'number',
    0
];
schema['buff_id'] = [
    'table',
    0
];
schema['avatar_base_id'] = [
    'number',
    0
];
schema['guild_icon'] = [
    'number',
    0
];
schema['title'] = [
    'number',
    0
];
schema['privilege_time'] = [
    'number',
    0
];
schema['infam_value'] = [
    'number',
    0
];
schema['refresh_time'] = [
    'number',
    0
];
export class MineUserData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
        this.setAvatar_base_id(properties["avatar_base_id"]);
        this.setBase_id(properties["base_id"]);
    }
    public clear() {
    }
    public reset() {
    }

    setBase_id(data: number): void {
        this["base_id"] = data;
    }

    getBase_id(): number {
        return this["base_id"];
    }

    setAvatar_base_id(data: number): void {
        this["avatar_base_id"] = data;
    }
    getAvatar_base_id(): number {
        return this["avatar_base_id"];
    }
}
