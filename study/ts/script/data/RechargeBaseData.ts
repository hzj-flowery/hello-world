import { BaseData } from "./BaseData";

export interface RechargeBaseData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    {}
];
export class RechargeBaseData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
}
