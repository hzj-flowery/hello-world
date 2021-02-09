import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { handler } from "../utils/handler";

let schema = {};
schema['report'] = [
    'object',
    {}
];

schema['leftName'] = [
    'string',
    ''
];

schema['rightName'] = [
    'string',
    ''
];

schema['leftOfficerLevel'] = [
    'number',
    0
];

schema['rightOfficerLevel'] = [
    'number',
    0
];

schema['leftPower'] = [
    'number',
    0
];

schema['rightPower'] = [
    'number',
    0
];

schema['leftBaseId'] = [
    'number',
    0
];

schema['rightBaseId'] = [
    'number',
    0
];

schema['firstOrder'] = [
    'number',
    0
];

schema['win'] = [
    'boolean',
    false
];
export interface FightReportData {
    getReport(): any
    setReport(value: any): void
    getLastReport(): any
    getLeftName(): string
    setLeftName(value: string): void
    getLastLeftName(): string
    getRightName(): string
    setRightName(value: string): void
    getLastRightName(): string
    getLeftOfficerLevel(): number
    setLeftOfficerLevel(value: number): void
    getLastLeftOfficerLevel(): number
    getRightOfficerLevel(): number
    setRightOfficerLevel(value: number): void
    getLastRightOfficerLevel(): number
    getLeftPower(): number
    setLeftPower(value: number): void
    getLastLeftPower(): number
    getRightPower(): number
    setRightPower(value: number): void
    getLastRightPower(): number
    getLeftBaseId(): number
    setLeftBaseId(value: number): void
    getLastLeftBaseId(): number
    getRightBaseId(): number
    setRightBaseId(value: number): void
    getLastRightBaseId(): number
    getFirstOrder(): number
    setFirstOrder(value: number): void
    getLastFirstOrder(): number
    isWin(): boolean
    setWin(value: boolean): void
    isLastWin(): boolean
}
export class FightReportData extends BaseData {
    public static schema = schema;

    private _listenerGetNormalReport;

    constructor() {
        super()
        this._listenerGetNormalReport = G_NetworkManager.add(MessageIDConst.ID_S2C_GetNormalBattleReport, this._s2cGetNormalBattleReport.bind(this))
    }

    clear() {
        this._listenerGetNormalReport.remove();
        this._listenerGetNormalReport = null;
        this.clearData();
        this.clearFightData();
    }

    public reset() {

    }

    public clearData() {
        this.setReport({});
    }

    public c2sGetNormalBattleReport(reportId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetNormalBattleReport, { report_id: reportId });
    }

    public clearFightData() {
        this.setLeftName("")
        this.setLeftOfficerLevel(0)
        this.setLeftPower(0)
        this.setLeftBaseId(0)

        this.setRightName("")
        this.setRightOfficerLevel(0)
        this.setRightPower(0)
        this.setRightBaseId(0)

        this.setFirstOrder(0)
        this.setWin(false)
    }

    public _setDatas(data) {
        this.setLeftName(data.attack_name)
        this.setLeftOfficerLevel(data.attack_officer_level)
        this.setLeftPower(data.attack_power)
        this.setLeftBaseId(data.attack_base_id)

        this.setRightName(data.defense_name)
        this.setRightOfficerLevel(data.defense_officer_level)
        this.setRightPower(data.defense_power)
        this.setRightBaseId(data.defense_base_id)

        this.setFirstOrder(data.first_order)
        this.setWin(data.is_win)
    }

    private _initReportData(data) {
        let report: any = {};
        report.attack_base_id = data.attack_base_id;
        report.attack_hurt = data.attack_hurt;
        report.attack_name = data.attack_name;
        report.attack_officer_level = data.attack_officer_level;
        report.attack_power = data.attack_power;
        report.defense_base_id = data.defense_base_id;
        report.defense_name = data.defense_name;
        report.defense_officer_level = data.defense_officer_level;
        report.defense_power = data.defense_power;
        report.first_order = data.first_order;
        report.is_win = data.is_win;
        report.max_round_num = data.max_round_num;
        report.pk_type = data.pk_type;
        report.skill_ids = [];
        for (let i = 0; i < data.skill_ids.length; i++) {
            report.skill_ids.push(data.skill_ids[i])
        }
        report.version = data.version;
        report.waves = [];
        for (let i = 0; i < data.waves.length; i++) {
            let wave = data.waves[i];
            let waveTemp: any = {};
            waveTemp.members = wave.members;
            waveTemp.members_final = wave.members_final;
            waveTemp.rounds = [];
            waveTemp.init_buff = wave.init_buff;
            waveTemp.first_order = wave.first_order;
            waveTemp.pets = wave.pets;
            report.waves.push(waveTemp);
        }
        this.setReport(report);
    }

    private _s2cGetNormalBattleReport(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        if (message.is_begin) {
            this._initReportData(message.report);
            this._setDatas(message.report);
        }
        if (message.hasOwnProperty('rounds')) {
            let report = this.getReport();
            for (let i = 0; i < message.rounds.length; i++) {
                var roundData = message.rounds[i];
                report.waves[roundData.wave_index - 1].rounds.push(roundData);
            }
            this.setReport(report);
        }
        if (message.is_end) {
            G_SignalManager.dispatch(SignalConst.EVENT_ENTER_FIGHT_SCENE);
        }
    }
}