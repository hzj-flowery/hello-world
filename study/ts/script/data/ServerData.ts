import { BaseData } from "./BaseData";
export interface ServerData {
    getName(): string
    setName(value: string): void
    getLastName(): string
    getStatus(): number
    setStatus(value: number): void
    getLastStatus(): number
    getServer(): number
    setServer(value: number): void
    getLastServer(): number
    getOpentime(): string
    setOpentime(value: string): void
    getLastOpentime(): string
    isHide(): boolean
    setHide(value: boolean): void
    isLastHide(): boolean
}
let schema = {};
schema['name'] = [
    'string',
    ''
];
schema['status'] = [
    'number',
    0
];
schema['server'] = [
    'number',
    0
];
schema['opentime'] = [
    'string',
    ''
];
schema['hide'] = [
    'boolean',
    false
];

export class ServerData extends BaseData {
    public static schema = schema;
}