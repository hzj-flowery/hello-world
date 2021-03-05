import { BaseData } from './BaseData';
let schema = {};
schema['id'] = [
    'number',
    0
];

schema['camp'] = [
    'number',
    0
];

schema['pos1'] = [
    'number',
    0
];

schema['pos2'] = [
    'number',
    0
];

schema['win_pos'] = [
    'number',
    0
];

schema['first_hand'] = [
    'number',
    0
];

schema['left_power'] = [
    'number',
    0
];

schema['left_heros'] = [
    'object',
    {}
];
schema['left_heros_otr'] = [
    'table',
    {}
];
schema['left_heros_rtg'] = [
    'table',
    {}
];

schema['right_power'] = [
    'number',
    0
];

schema['right_heros'] = [
    'object',
    {}
];
schema['right_heros_otr'] = [
    'table',
    {}
];
schema['right_heros_rtg'] = [
    'table',
    {}
];

schema['report_id'] = [
    'number',
    0
];

export interface CampRaceReportData {
    getId(): number
    setId(value: number): void
    getLastId(): number
    getCamp(): number
    setCamp(value: number): void
    getLastCamp(): number
    getPos1(): number
    setPos1(value: number): void
    getLastPos1(): number
    getPos2(): number
    setPos2(value: number): void
    getLastPos2(): number
    getWin_pos(): number
    setWin_pos(value: number): void
    getLastWin_pos(): number
    getFirst_hand(): number
    setFirst_hand(value: number): void
    getLastFirst_hand(): number
    getLeft_power(): number
    setLeft_power(value: number): void
    getLastLeft_power(): number
    getLeft_heros(): Object
    setLeft_heros(value: Object): void
    getLeft_heros_otr(): Object
    setLeft_heros_otr(value: Object): void
    getLeft_heros_rtg(): Object
    setLeft_heros_rtg(value: Object): void
    getLastLeft_heros(): Object
    getRight_power(): number
    setRight_power(value: number): void
    getLastRight_power(): number
    getRight_heros(): Object
    setRight_heros(value: Object): void
    getRight_heros_otr(): Object
    setRight_heros_otr(value: Object): void
    getRight_heros_rtg(): Object
    setRight_heros_rtg(value: Object): void
    getLastRight_heros(): Object
    getReport_id(): number
    setReport_id(value: number): void
    getLastReport_id(): number
}
export class CampRaceReportData extends BaseData {
    public static schema = schema;


    public clear() {
    }
    public reset() {
    }

    getHeroInfoList() {
        var leftHeroIds = this.getLeft_heros();
        var leftHeroOtrs = this.getLeft_heros_otr();
        var leftHeroRtgs = this.getLeft_heros_rtg();
        var left = [];
        for (var i in leftHeroIds) {
            var v = leftHeroIds[i];
            var item: any = {};
            item.heroId = leftHeroIds[i];
            item.limitLevel = leftHeroOtrs[i];
            item.limitRedLevel = leftHeroRtgs[i];
            left.push(item);
        }
        var rightHeroIds = this.getRight_heros();
        var rightHeroOtrs = this.getRight_heros_otr();
        var rightHeroRtgs = this.getRight_heros_rtg();
        var right = [];
        for (i in rightHeroIds) {
            var v = rightHeroIds[i];
            var item:any = {};
            item.heroId = rightHeroIds[i];
            item.limitLevel = rightHeroOtrs[i];
            item.limitRedLevel = rightHeroRtgs[i];
            right.push(item);
        }
        return [
            left,
            right
        ];
    }
}