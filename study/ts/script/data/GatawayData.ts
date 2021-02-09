import { BaseData } from "./BaseData";

let schema = {};
schema['ip'] = [
    'string',
    ''
];

schema['port'] = [
    'number',
    0
];

export interface GatewayData {
    getIp(): string
    setIp(value: string): void
    getLastIp(): string
    getPort(): number
    setPort(value: number): void
    getLastPort(): number
}

export class GatewayData extends BaseData {
    public static schema = schema;
}