import { BaseData } from "./BaseData";
var schema = {};
schema['pos'] = [
    'number',
    0
];
schema['id'] = [
    'number',
    0
];
schema['flag'] = [
    'number',
    0
];
schema['slot'] = [
    'number',
    0
];
export interface BattleResourceUnitData {

    getPos(): number
    setPos(value: number): void
    getLastPos(): number
    getId(): number
    setId(value: number): void
    getLastId(): number
    getFlag(): number
    setFlag(value: number): void
    getLastFlag(): number
    getSlot(): number
    setSlot(value: number): void
    getLastSlot(): number
}

export class BattleResourceUnitData extends BaseData {
    public static schema = schema;
    public clear() {
    }
    public reset() {
    }
    public initData(data) {
        this.setProperties(data);
    }
}