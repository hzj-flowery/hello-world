import { BaseData } from './BaseData';
let schema = {};
schema['camp'] = [
    'number',
    0
];

schema['final_status'] = [
    'number',
    0
];

schema['round'] = [
    'number',
    0
];

schema['start_time'] = [
    'number',
    0
];

export interface CampRaceStateData {
    getCamp(): number
    setCamp(value: number): void
    getLastCamp(): number
    getFinal_status(): number
    setFinal_status(value: number): void
    getLastFinal_status(): number
    getRound(): number
    setRound(value: number): void
    getLastRound(): number
    getStart_time(): number
    setStart_time(value: number): void
    getLastStart_time(): number
}
export class CampRaceStateData extends BaseData {

    public static schema = schema;

    public clear() {
    }
    public reset() {
    }
    public updateData(data) {
        this.backupProperties();
        this.setProperties(data);
    }
    public isChangeFinalStatus() {
        let lastFinalStatus = this.getLastFinal_status();
        let curFinalStatus = this.getFinal_status();
        if (lastFinalStatus != curFinalStatus) {
            return true;
        } else {
            return false;
        }
    }
}