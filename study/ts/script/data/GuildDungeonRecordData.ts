import { BaseData } from "./BaseData";

export interface GuildDungeonRecordData {
    getPlayer_id(): number
    setPlayer_id(value: number): void
    getLastPlayer_id(): number
    getPlayer_name(): string
    setPlayer_name(value: string): void
    getLastPlayer_name(): string
    getPlayer_officer(): number
    setPlayer_officer(value: number): void
    getLastPlayer_officer(): number
    getTarget_rank(): number
    setTarget_rank(value: number): void
    getLastTarget_rank(): number
    getTarget_id(): number
    setTarget_id(value: number): void
    getLastTarget_id(): number
    getTarget_name(): string
    setTarget_name(value: string): void
    getLastTarget_name(): string
    getTarget_officer(): number
    setTarget_officer(value: number): void
    getLastTarget_officer(): number
    isIs_win(): boolean
    setIs_win(value: boolean): void
    isLastIs_win(): boolean
    getReport_id(): number
    setReport_id(value: number): void
    getLastReport_id(): number
    getTime(): number
    setTime(value: number): void
    getLastTime(): number
}
let schema = {};
schema['player_id'] = [
    'number',
    0
];
schema['player_name'] = [
    'string',
    ''
];
schema['player_officer'] = [
    'number',
    0
];
schema['target_rank'] = [
    'number',
    0
];
schema['target_id'] = [
    'number',
    0
];
schema['target_name'] = [
    'string',
    ''
];
schema['target_officer'] = [
    'number',
    0
];
schema['is_win'] = [
    'boolean',
    false
];
schema['report_id'] = [
    'number',
    0
];
schema['time'] = [
    'number',
    0
];
export class GuildDungeonRecordData extends BaseData {
    public static schema = schema;

    constructor() {
        super();
    }
    public clear() {
    }
    public reset() {
    }
    public initData(message) {
        this.setProperties(message);
    }
}
