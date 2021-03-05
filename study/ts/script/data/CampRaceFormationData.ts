import { BaseData } from './BaseData';
import { G_UserData } from '../init';
import { CampRaceFormationBaseData } from './CampRaceFormationBaseData';
import { CampRaceConst } from '../const/CampRaceConst';
let schema = {};
schema['uid'] = [
    'number',
    0
];

schema['base_id'] = [
    'number',
    0
];

schema['name'] = [
    'string',
    0
];

schema['officer_level'] = [
    'number',
    0
];

schema['power'] = [
    'number',
    0
];

schema['rank'] = [
    'number',
    0
];

schema['first_hand'] = [
    'boolean',
    false
];

schema['status'] = [
    'number',
    0
];

schema['win_num'] = [
    'number',
    0
];

schema['per_rank'] = [
    'number',
    0
];

schema['formation'] = [
    'object',
    {}
];

export interface CampRaceFormationData {
getUid(): number
setUid(value: number): void
getLastUid(): number
getBase_id(): number
setBase_id(value: number): void
getLastBase_id(): number
getName(): string
setName(value: string): void
getLastName(): string
getOfficer_level(): number
setOfficer_level(value: number): void
getLastOfficer_level(): number
getPower(): number
setPower(value: number): void
getLastPower(): number
getRank(): number
setRank(value: number): void
getLastRank(): number
isFirst_hand(): boolean
setFirst_hand(value: boolean): void
isLastFirst_hand(): boolean
getStatus(): number
setStatus(value: number): void
getLastStatus(): number
getWin_num(): number
setWin_num(value: number): void
getLastWin_num(): number
getPer_rank(): number
setPer_rank(value: number): void
getLastPer_rank(): number
getFormation(): Object
setFormation(value: Object): void
getLastFormation(): Object
}
export class CampRaceFormationData extends BaseData {

    public static schema = schema;

    public _heroDatas;

    constructor (properties?) {
        super(properties);
        this._heroDatas = {};
    }
    public clear () {
    }
    public reset () {
        this._heroDatas = {};
    }
    public updateData (data) {
        this.setProperties(data);
        this._heroDatas = {};
        for (let i in data.hero_data) {
            let v = data.hero_data[i];
            let baseData = new CampRaceFormationBaseData(v);
            let heroId = baseData.getHero_id();
            this._heroDatas[heroId] = baseData;
        }
    }
    public getPosition (camp) {
        let status = G_UserData.getCampRaceData().getStatus();
        if (status == CampRaceConst.STATE_PLAY_OFF) {
            let pos = G_UserData.getCampRaceData().getPositionByUserId(camp, this.getUid());
            return pos;
        }
        return 0;
    }
    public getHeroDataById (id) {
        let baseData = this._heroDatas[id];
        return baseData;
    }
    public isWin () {
        return this.getWin_num() >= 2;
    }
}
 CampRaceFormationData;