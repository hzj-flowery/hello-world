import { BaseData } from "./BaseData";

export interface TowerSurpriseData {
    getSurprise_id(): number
    setSurprise_id(value: number): void
    getLastSurprise_id(): number
    isWin(): boolean
    setWin(value: boolean): void
    isLastWin(): boolean
}
let schema = {};
schema['surprise_id'] = [
    'number',
    0
];
schema['win'] = [
    'boolean',
    false
];
export class TowerSurpriseData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
    }
}
