import { BaseData } from "./BaseData";

export interface HonorTitleItemData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getLimitLevel(): number
    setLimitLevel(value: number): void
    getLastLimitLevel(): number
    getDay(): number
    setDay(value: number): void
    getLastDay(): number
    getTimeType(): number
    setTimeType(value: number): void
    getLastTimeType(): number
    getTimeValue(): Object
    setTimeValue(value: Object): void
    getLastTimeValue(): Object
    getName(): string
    setName(value: string): void
    getLastName(): string
    getColour(): string
    setColour(value: string): void
    getLastColour(): string
    getResource(): string
    setResource(value: string): void
    getLastResource(): string
    getDes(): string
    setDes(value: string): void
    getLastDes(): string
    isIsEquip(): boolean
    setIsEquip(value: boolean): void
    isLastIsEquip(): boolean
    getExpireTime(): number
    setExpireTime(value: number): void
    getLastExpireTime(): number

    isIsOn(): boolean
    setIsOn(value: boolean): void
    isLastIsOn(): boolean

    isFresh(): boolean
    setFresh(value: boolean): void
    isLastFresh(): boolean


}

let schema = {};
schema['id'] = [
    'number',
    0
];
schema['limitLevel'] = [
    'number',
    0
];
schema['day'] = [
    'number',
    0
];
schema['timeType'] = [
    'number',
    0
];
schema['timeValue'] = [
    'object',
    {}
];
schema['name'] = [
    'string',
    {}
];
schema['colour'] = [
    'string',
    ''
];
schema['resource'] = [
    'string',
    ''
];
schema['des'] = [
    'string',
    ''
];
schema['isEquip'] = [
    'boolean',
    false
];
schema['expireTime'] = [
    'number',
    0
];
schema['isOn'] = ['boolean'];
schema['fresh'] = ['boolean'];
export class HonorTitleItemData extends BaseData {
    public static schema = schema;

    public init(template) {
        this.setId(template.id);
        this.setLimitLevel(template.limitLevel);
        this.setDay(template.day);
        this.setTimeType(template.timeType);
        this.setTimeValue(template.timeValue);
        this.setName(template.name);
        this.setColour(template.colour);
        this.setResource(template.resource);
        this.setDes(template.des);
        this.setIsEquip(template.isEquip);
        this.setExpireTime(template.expireTime);
        this.setIsOn(template.isOn);
        this.setFresh(template.fresh);
    }
    public updateData(item) {
        this.setIsEquip(item.equip);
        this.setExpireTime(item.expire_time);
        this.setIsOn(item.on);
        this.setFresh(item.fresh);
    }
}
