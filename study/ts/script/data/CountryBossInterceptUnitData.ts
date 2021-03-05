import { BaseData } from './BaseData';
let schema = {};
schema['user_id'] = [
    'number',
    0
];

schema['name'] = [
    'string',
    ''
];

schema['power'] = [
    'number',
    0
];

schema['office_level'] = [
    'number',
    0
];

schema['guild_name'] = [
    'string',
    ''
];

schema['base_id'] = [
    'number',
    0
];

schema['hero_base_id'] = [
    'object',
    {}
];

schema['title'] = [
    'number',
    0
];

schema['avatar_base_id'] = [
    'number',
    0
];

export interface CountryBossInterceptUnitData {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getPower(): number
    setPower(value: number): void
    getLastPower(): number
    getOffice_level(): number
    setOffice_level(value: number): void
    getLastOffice_level(): number
    getGuild_name(): string
    setGuild_name(value: string): void
    getLastGuild_name(): string
    getBase_id(): number
    setBase_id(value: number): void
    getLastBase_id(): number
    getHero_base_id(): Object
    setHero_base_id(value: Object): void
    getLastHero_base_id(): Object
    getTitle(): number
    setTitle(value: number): void
    getLastTitle(): number
    getAvatar_base_id(): number
    setAvatar_base_id(value: number): void
    getLastAvatar_base_id(): number
}
export class CountryBossInterceptUnitData extends BaseData {

    public static schema = schema;
}