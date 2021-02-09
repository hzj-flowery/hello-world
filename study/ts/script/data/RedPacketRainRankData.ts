import { BaseData } from './BaseData';

export interface RedPacketRainRankData {
    getUser_id(): number
    setUser_id(data: number): void
    getMoney(): number
    setMoney(data: number): void
    getOffice_level(): number
    setOffice_level(data: number): void
    getName(): string
    setName(data: string): void
    getGuild_name(): string
    setGuild_name(data: string): void
    getBig_red_packet(): number
    setBig_red_packet(data: number): void
    getSmall_red_packet(): number
    setSmall_red_packet(data: number): void
}
var schema = {};
schema['user_id'] = [
    'number',
    0
];
schema['money'] = [
    'number',
    0
];
schema['office_level'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['guild_name'] = [
    'string',
    ''
];
schema['big_red_packet'] = [
    'number',
    0
];
schema['small_red_packet'] = [
    'number',
    0
];

export class RedPacketRainRankData extends BaseData {
    public static schema = schema;
    ctor(properties) {
    }
    clear() {
    }
    reset() {
    }
}