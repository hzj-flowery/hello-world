import { BaseData } from "./BaseData";

export interface HeadFrameItemData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getExpire_time(): number
    setExpire_time(value: number): void
    getLastExpire_time(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    getLimit_level(): number
    setLimit_level(value: number): void
    getLastLimit_level(): number
    getDay(): number
    setDay(value: number): void
    getLastDay(): number
    getColor(): number
    setColor(value: number): void
    getLastColor(): number
    getTime_type(): number
    setTime_type(value: number): void
    getLastTime_type(): number
    getTime_value(): number
    setTime_value(value: number): void
    getLastTime_value(): number
    getDes(): string
    setDes(value: string): void
    getLastDes(): string
    isHave(): boolean
    setHave(value: boolean): void
    isLastHave(): boolean
}
let schema = {};
schema['id'] = [
    'number',
    0
];
schema['expire_time'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    null
];
schema['limit_level'] = [
    'number',
    0
];
schema['day'] = [
    'number',
    0
];
schema['color'] = [
    'number',
    0
];
schema['time_type'] = [
    'number',
    0
];
schema['time_value'] = [
    'number',
    0
];
schema['des'] = [
    'string',
    null
];
schema['have'] = [
    'boolean',
    false
];

export class HeadFrameItemData extends BaseData {
    public static schema = schema;
}