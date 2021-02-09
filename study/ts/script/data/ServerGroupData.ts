import { BaseData } from "./BaseData";
export interface ServerGroupData {
    getGroupid(): number
    setGroupid(value: number): void
    getLastGroupid(): number
    getGroupname(): string
    setGroupname(value: string): void
    getLastGroupname(): string
    getServers(): string
    setServers(value: string): void
    getLastServers(): string
}
let schema = {};
schema['groupid'] = [
    'number',
    0
];
schema['groupname'] = [
    'string',
    ''
];
schema['servers'] = [
    'string',
    ''
];

export class ServerGroupData extends BaseData {
    public static schema = schema;

    public getServerIds() {
        let strServers = this.getServers();
        let serverIds = strServers.split(',');
        return serverIds;
    }
}