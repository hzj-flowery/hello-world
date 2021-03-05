import { BaseData } from "./BaseData";

export interface RedPacketRainUnitData {
    getId(): string
    setId(value: string): void
    getLastId(): string
    getRedpacket_type(): string
    setRedpacket_type(value: string): void
    getLastRedpacket_type(): string
    getMoney(): number
    setMoney(value: number): void
    getLastMoney(): number
    isRob(): boolean
    setRob(value: boolean): void
    isLastRob(): boolean
}
let schema = {};
schema['id'] = [
    'string',
    ''
];
schema['redpacket_type'] = [
    'string',
    ''
];
schema['money'] = [
    'number',
    0
];
schema['rob'] = [
    'boolean',
    false
];
export class RedPacketRainUnitData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public isReal() {
        return this.getMoney() > 0;
    }
}
