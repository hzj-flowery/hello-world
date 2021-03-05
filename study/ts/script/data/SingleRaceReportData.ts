import { BaseData } from "./BaseData";
import { SingleRaceConst } from "../const/SingleRaceConst";
import { table } from "../utils/table";

export interface SingleRaceReportData {
    getPosition(): number
    setPosition(value: number): void
    getLastPosition(): number
    getBattle_no(): number
    setBattle_no(value: number): void
    getLastBattle_no(): number
    getAtk_user(): number
    setAtk_user(value: number): void
    getLastAtk_user(): number
    getDef_user(): number
    setDef_user(value: number): void
    getLastDef_user(): number
    getWin_user(): number
    setWin_user(value: number): void
    getLastWin_user(): number
    getFirst_hand(): number
    setFirst_hand(value: number): void
    getLastFirst_hand(): number
    getAtk_power(): number
    setAtk_power(value: number): void
    getLastAtk_power(): number
    getDef_power(): number
    setDef_power(value: number): void
    getLastDef_power(): number
    getAtk_heros(): Object
    setAtk_heros(value: Object): void
    getAtk_heros_otr(): Object
    setAtk_heros_otr(value: Object): void
    getAtk_heros_rtg(): Object
    setAtk_heros_rtg(value: Object): void
    getLastAtk_heros(): Object
    getDef_heros(): Object
    setDef_heros(value: Object): void
    getDef_heros_otr(): Object
    setDef_heros_otr(value: Object): void
    getDef_heros_rtg(): Object
    setDef_heros_rtg(value: Object): void
    getLastDef_heros(): Object
    getReport_id(): number
    setReport_id(value: number): void
    getLastReport_id(): number
    getWinnerSide(): number
    setWinnerSide(value: number): void
    getLastWinnerSide(): number
}
let schema = {};
schema['position'] = [
    'number',
    0
];
schema['battle_no'] = [
    'number',
    0
];
schema['atk_user'] = [
    'number',
    0
];
schema['def_user'] = [
    'number',
    0
];
schema['win_user'] = [
    'number',
    0
];
schema['first_hand'] = [
    'number',
    0
];
schema['atk_power'] = [
    'number',
    0
];
schema['def_power'] = [
    'number',
    0
];
schema['atk_heros'] = [
    'object',
    {}
];
schema['atk_heros_otr'] = [
    'table',
    {}
];
schema['atk_heros_rtg'] = [
    'table',
    {}
];
schema['def_heros'] = [
    'object',
    {}
];
schema['def_heros_otr'] = [
    'table',
    {}
];
schema['def_heros_rtg'] = [
    'table',
    {}
];
schema['report_id'] = [
    'number',
    0
];
schema['winnerSide'] = [
    'number',
    0
];
export class SingleRaceReportData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.setProperties(data);
        let userId1 = this.getAtk_user();
        let userId2 = this.getDef_user();
        let winUserId = this.getWin_user();
        if (winUserId == userId1) {
            this.setWinnerSide(SingleRaceConst.REPORT_SIDE_1);
        } else if (winUserId == userId2) {
            this.setWinnerSide(SingleRaceConst.REPORT_SIDE_2);
        }
    }

    getHeroInfoList() {
        var atkHeroIds = this.getAtk_heros();
        var atkHeroOtrs = this.getAtk_heros_otr();
        var atkHeroRtgs = this.getAtk_heros_rtg();
        var atk = [];
        for (var i in atkHeroIds) {
            var v = atkHeroIds[i];
            var item:any = {};
            item.heroId = atkHeroIds[i];
            item.limitLevel = atkHeroOtrs[i];
            item.limitRedLevel = atkHeroRtgs[i];
            table.insert(atk, item);
        }
        var defHeroIds = this.getDef_heros();
        var defHeroOtrs = this.getDef_heros_otr();
        var defHeroRtgs = this.getDef_heros_rtg();
        var def = [];
        for (i in defHeroIds) {
            var v = defHeroIds[i];
            var item:any = {};
            item.heroId = defHeroIds[i];
            item.limitLevel = defHeroOtrs[i];
            item.limitRedLevel = defHeroRtgs[i];
            table.insert(def, item);
        }
        return [
            atk,
            def
        ];
    }
}
