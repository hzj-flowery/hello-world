import { BaseData } from "./BaseData";

export interface GuildHelpBaseData {
    getHelp_no(): number
    setHelp_no(value: number): void
    getLastHelp_no(): number
    getHelp_id(): number
    setHelp_id(value: number): void
    getLastHelp_id(): number
    getLimit_max(): number
    setLimit_max(value: number): void
    getLastLimit_max(): number
    getAlready_help(): number
    setAlready_help(value: number): void
    getLastAlready_help(): number
    getAlready_get(): number
    setAlready_get(value: number): void
    getLastAlready_get(): number
    getTime(): number
    setTime(value: number): void
    getLastTime(): number
}
let schema = {};
schema['help_no'] = [
    'number',
    0
];
schema['help_id'] = [
    'number',
    0
];
schema['limit_max'] = [
    'number',
    0
];
schema['already_help'] = [
    'number',
    0
];
schema['already_get'] = [
    'number',
    0
];
schema['time'] = [
    'number',
    0
];
export class GuildHelpBaseData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
}
