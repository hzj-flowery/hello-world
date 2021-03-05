import { BaseData } from "./BaseData";

export interface EnemyBattleReportUnitData {
    getFight_time(): number
    setFight_time(value: number): void
    getLastFight_time(): number
    getTar_uid(): number
    setTar_uid(value: number): void
    getLastTar_uid(): number
    getName(): string
    setName(value: string): void
    getLastName(): string
    isWin_type(): boolean
    setWin_type(value: boolean): void
    isLastWin_type(): boolean
    getGrap_value(): number
    setGrap_value(value: number): void
    getLastGrap_value(): number
    getOfficer_level(): number
    setOfficer_level(value: number): void
    getLastOfficer_level(): number
}
let schema = {};
schema['fight_time'] = [
    'number',
    0
];
schema['tar_uid'] = [
    'number',
    0
];
schema['name'] = [
    'string',
    ''
];
schema['win_type'] = [
    'boolean',
    false
];
schema['grap_value'] = [
    'number',
    0
];
schema['officer_level'] = [
    'number',
    0
];
export class EnemyBattleReportUnitData extends BaseData {
    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
}
