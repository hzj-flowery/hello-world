import { BaseData } from "./BaseData";

export interface SingleRaceServerRankData {
    getServer_id(): number
    setServer_id(value: number): void
    getLastServer_id(): number
    getServer_name(): string
    setServer_name(value: string): void
    getLastServer_name(): string
    getSorce(): number
    setSorce(value: number): void
    getLastSorce(): number
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
}
let schema = {};
schema['server_id'] = [
    'number',
    0
];
schema['server_name'] = [
    'string',
    ''
];
schema['sorce'] = [
    'number',
    0
];
schema['rank'] = [
    'number',
    0
];
export class SingleRaceServerRankData extends BaseData {
    public static schema = schema;

    public type: number;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.setProperties(data);
    }
}
