import { BaseData } from "./BaseData";

export interface GuildTaskUnitData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getPeople(): number
    setPeople(value: number): void
    getLastPeople(): number
    getConfig(): Object
    setConfig(value: Object): void
    getLastConfig(): Object
    getExp(): number
    setExp(value: number): void
    getLastExp(): number
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['people'] = [
    'number',
    0
];
schema['config'] = [
    'object',
    null
];
schema['exp'] = [
    'number',
    0
];
export class GuildTaskUnitData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public initData(config) {
        this.setConfig(config);
        this.setId(config.type);
        this.setPeople(0);
        this.setExp(0);
    }
}
