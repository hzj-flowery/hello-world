import { BaseData } from "./BaseData";

export interface GuildDungeonMemberPoint {
    getUser_id(): number
    setUser_id(value: number): void
    getLastUser_id(): number
    getPoint(): number
    setPoint(value: number): void
    getLastPoint(): number
}
let schema = {};
schema['user_id'] = [
    'number',
    0
];
schema['point'] = [
    'number',
    0
];
export class GuildDungeonMemberPoint extends BaseData {
    public static schema = schema;

    constructor() {
        super();
    }
    public clear() {
    }
    public reset() {
    }
    public initData(message) {
        this.setProperties(message);
    }
}
