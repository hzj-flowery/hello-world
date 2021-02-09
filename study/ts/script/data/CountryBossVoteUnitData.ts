import { BaseData } from './BaseData';
let schema = {};
schema['boss_id'] = [
    'number',
    0
];

schema['is_kill'] = [
    'boolean',
    false
];

schema['vote'] = [
    'number',
    0
];

export interface CountryBossVoteUnitData {
    getBoss_id(): number
    setBoss_id(value: number): void
    getLastBoss_id(): number
    isIs_kill(): boolean
    setIs_kill(value: boolean): void
    isLastIs_kill(): boolean
    getVote(): number
    setVote(value: number): void
    getLastVote(): number
}
export class CountryBossVoteUnitData extends BaseData {
    public static schema = schema;
}