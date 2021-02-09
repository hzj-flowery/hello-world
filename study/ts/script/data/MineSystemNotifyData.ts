import { BaseData } from "./BaseData";

export interface MineSystemNotifyData {
    getSn_type(): number
    setSn_type(value: number): void
    getLastSn_type(): number
    getContent(): Object
    setContent(value: Object): void
    getLastContent(): Object
    getTime(): number
    setTime(value: number): void
    getLastTime(): number
}
let schema = {};
schema['sn_type'] = [
    'number',
    0
];
schema['content'] = [
    'object',
    {}
];
schema['time'] = [
    'number',
    0
];
export class MineSystemNotifyData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
}
