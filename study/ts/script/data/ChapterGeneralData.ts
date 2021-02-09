import { BaseData } from "./BaseData";

let schema = {};
schema['id'] = [
    'number',
    0
];
schema['pass'] = [
    'boolean',
    false
];
schema['configData'] = [
    'object',
    0
];

export interface ChapterGeneralData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    isPass(): boolean
    setPass(value: boolean): void
    isLastPass(): boolean
    getConfigData(): any
    setConfigData(value: any): void
    getLastConfigData(): any
}

export class ChapterGeneralData extends BaseData {
    public static schema = schema;
}