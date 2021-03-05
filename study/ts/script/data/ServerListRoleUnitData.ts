import { BaseData } from "./BaseData";

export interface ServerListRoleUnitData {
    getUid(): number
    setUid(value: number): void
    getLastUid(): number
    getUuid(): string
    setUuid(value: string): void
    getLastUuid(): string
    getServer_id(): number
    setServer_id(value: number): void
    getLastServer_id(): number
    getRole_name(): string
    setRole_name(value: string): void
    getLastRole_name(): string
    getRole_lv(): number
    setRole_lv(value: number): void
    getLastRole_lv(): number
    getIp(): string
    setIp(value: string): void
    getLastIp(): string
    getCreate_time(): number
    setCreate_time(value: number): void
    getLastCreate_time(): number
    getUpdate_time(): number
    setUpdate_time(value: number): void
    getLastUpdate_time(): number
}
let schema = {};
schema['uid'] = [
    'number',
    0
];
schema['uuid'] = [
    'string',
    ''
];
schema['server_id'] = [
    'number',
    0
];
schema['role_name'] = [
    'string',
    ''
];
schema['role_lv'] = [
    'number',
    0
];
schema['ip'] = [
    'string',
    ''
];
schema['create_time'] = [
    'number',
    0
];
schema['update_time'] = [
    'number',
    0
];
export class ServerListRoleUnitData extends BaseData {
    public static schema = schema;
}