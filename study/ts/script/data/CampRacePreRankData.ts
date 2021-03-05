import { BaseData } from './BaseData';
import { CampRaceUserData } from './CampRaceUserData';
let schema = {};
schema['camp'] = [
    'number',
    0
];

schema['self_rank'] = [
    'number',
    0
];

schema['self_score'] = [
    'number',
    0
];

export interface CampRacePreRankData {
    getCamp(): number
    setCamp(value: number): void
    getLastCamp(): number
    getSelf_rank(): number
    setSelf_rank(value: number): void
    getLastSelf_rank(): number
    getSelf_score(): number
    setSelf_score(value: number): void
    getLastSelf_score(): number
}
export class CampRacePreRankData extends BaseData {

    public static schema = schema;

        public _rankDatas;
    constructor(properties?) {
        super(properties)
        this._rankDatas = {};
    }
    public clear() {
    }
    public reset() {
        this._rankDatas = [];
    }
    public updateData(data) {
        this.backupProperties();
        this.setProperties(data);
        this._rankDatas = [];
        let ranks = data['ranks'] || {};
        for (let i in ranks) {
            let rank = ranks[i];
            let userData = new CampRaceUserData(rank);
            this._rankDatas.push(userData);
        }
    }
    public getRankDatas() {
        return this._rankDatas;
    }
    public getRankChange() {
        let lastRank = this.getLastSelf_rank();
        let curRank = this.getSelf_rank();
        let change = curRank - lastRank;
        return change;
    }
    public getScoreChange() {
        let lastScore = this.getLastSelf_score();
        let curScore = this.getSelf_score();
        let change = curScore - lastScore;
        return change;
    }
    public isLastWin() {
        let scoreChange = this.getScoreChange();
        return scoreChange > 0;
    }
}