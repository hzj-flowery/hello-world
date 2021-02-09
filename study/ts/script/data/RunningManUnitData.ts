import { BaseData } from "./BaseData";
import { G_ConfigLoader, G_UserData, G_SignalManager } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { SignalConst } from "../const/SignalConst";

export interface RunningManUnitData {
    getHero_id(): number
    setHero_id(value: number): void
    getLastHero_id(): number
    getUse_time(): number[]
    setUse_time(value: number[]): void
    getLastUse_time(): number[]
    getRoad_num(): number
    setRoad_num(value: number): void
    getLastRoad_num(): number
    getRank(): number
    setRank(value: number): void
    getLastRank(): number
}
let schema = {};
schema['hero_id'] = [
    'number',
    0
];
schema['use_time'] = ['object'];
schema['road_num'] = [
    'number',
    0
];
schema['rank'] = [
    'number',
    0
];
let LINEAR_OFFSET = 0.2;
export class RunningManUnitData extends BaseData {
    public static schema = schema;

        _distance: number;
        _totalDistance: number;
        _totalTime: number;
        _lineInfoList;
    constructor(properties?) {
        super(properties);
        this._distance = 0;
        this._totalDistance = 0;
        this._totalTime = 0;
        this._lineInfoList = null;
    }
    public clear() {
    }
    public reset() {
    }
    public getTotalDistance() {
        if (this._totalDistance == 0) {
            let play_horse_info = G_ConfigLoader.getConfig(ConfigNameConst.PLAY_HORSE_INFO);
            let partNumber = play_horse_info.get(1).part_number;
            let lineSeq = partNumber.split('|');
            for (let i in lineSeq) {
                let value = lineSeq[i];
                this._totalDistance = Number(value) + this._totalDistance;
            }
        }
        return this._totalDistance;
    }
    public _getSeqInfoList() {
        if (this._lineInfoList == null) {
            let lineInfoList = [];
            let play_horse_info = G_ConfigLoader.getConfig(ConfigNameConst.PLAY_HORSE_INFO);
            let partNumber = play_horse_info.get(1).part_number;
            let lineSeq = partNumber.split('|');
            let lineTime = this.getLineTime();
            if (lineSeq.length != lineTime.length) {
                console.assert(false, '!@!!!!!!!!!!!!!!!!');
            }
            let lastLineInfo: any = {
                distance: 0,
                time: 0,
                toSpeed: 0,
                totalTime: 0
            };
            for (let i in lineSeq) {
                let value = lineSeq[i];
                let lineInfo = {
                    distance: lastLineInfo.distance + Number(value),
                    time: lastLineInfo.totalTime + lineTime[i] - LINEAR_OFFSET,
                    seqDistacne: Number(value),
                    seqTime: lineTime[i],
                    accTime: lastLineInfo.totalTime + LINEAR_OFFSET,
                    startTime: lastLineInfo.totalTime,
                    normalSpeed: Number(value) / (lineTime[i] - LINEAR_OFFSET)
                };
                lineInfo = this._buildAccSpeed(lastLineInfo, lineInfo);
                lineInfoList.push(lineInfo);
                lastLineInfo = lineInfo;
            }
            this._lineInfoList = lineInfoList;
        }
        return this._lineInfoList;
    }
    public _buildAccSpeed(lastLineInfo, lineInfo) {
        let toSpeed = lineInfo.distance / lineInfo.time;
        lineInfo.startSpeed = lastLineInfo.toSpeed;
        lineInfo.toSpeed = lineInfo.normalSpeed;
        lineInfo.totalTime = lineInfo.time + LINEAR_OFFSET;
        return lineInfo;
    }
    public _getAccSpeed(lineInfo, time) {
        let retSpeed = 0;
        let needTime = 1;
        let offset = (lineInfo.toSpeed - lineInfo.startSpeed) / needTime;
        retSpeed = offset * (time - lineInfo.startTime) + lineInfo.startSpeed;
        return retSpeed;
    }
    public getMoveSpeed(currTime) {
        let totalTime = currTime;
        let lineInfoList = this._getSeqInfoList();
        let lastValue: any = {};
        lastValue.totalTime = 0;
        lastValue.accTime = 0;
        for (let i in lineInfoList) {
            let value = lineInfoList[i];
            if (totalTime >= value.startTime && totalTime <= value.totalTime) {
                lastValue = value;
                break;
            }
        }
        if (currTime > lastValue.accTime) {
            return lastValue.toSpeed;
        }
        if (currTime < lastValue.accTime) {
            return this._getAccSpeed(lastValue, currTime);
        }
        return null;
    }
    public isRunning() {
        let runningTime = G_UserData.getRunningMan().getRunningTime();
        if (runningTime > 0) {
            if (this._distance >= this.getTotalDistance()) {
                return false;
            }
            return true;
        }
        return false;
    }
    public _procDistanceByTime() {
        let runningTime = G_UserData.getRunningMan().getRunningTime();
        let lastValue: any = {};
        lastValue.totalTime = 0;
        lastValue.accTime = 0;
        if (runningTime >= this.getRunningTime()) {
            this._distance = this.getTotalDistance();
            return;
        }
        let getLastValue = function(runningTime) {
            let lineInfoList = this._getSeqInfoList();
            for (let i in lineInfoList) {
                let value = lineInfoList[i];
                if (runningTime >= value.startTime && runningTime <= value.totalTime) {
                    return value;
                }
            }
            return null;
        }.bind(this);
        lastValue = getLastValue(runningTime);
        if (lastValue == null) {
            this._distance = this.getTotalDistance();
            return;
        }
        let currSeqTime = runningTime - lastValue.startTime;
        let currDist = lastValue.seqDistacne / lastValue.seqTime * currSeqTime;
        let distance = lastValue.distance - lastValue.seqDistacne + currDist;
        this._distance = distance;
        return distance;
    }
    public resumeRunning() {
        this._procDistanceByTime();
    }
    public updateRunning(dt) {
        if (this.isRunning()) {
            this._procDistanceByTime();
            if (this._distance == this.getTotalDistance()) {
                G_SignalManager.dispatch(SignalConst.EVENT_PLAY_HORSE_HERO_RUNNING_END, this.getHero_id());
            }
        }
    }
    public getRunningDistance() {
        return this._distance;
    }
    public getTotoalTime() {
        let retTime = 0;
        let retList = {};
        let timeList = this.getUse_time();
        for (let i in timeList) {
            let value = timeList[i];
            retTime = value + retTime;
        }
        return retTime;
    }
    public getLineTime() {
        let retList = [];
        let timeList = this.getUse_time();
        for (let i in timeList) {
            let value = timeList[i];
            let tempValue = value * 0.1;
            retList.push(tempValue);
        }
        return retList;
    }
    public getRunningTime() {
        if (this._totalTime == 0) {
            let time = 0;
            let timeList = this.getLineTime();
            for (let i in timeList) {
                let value = timeList[i];
                time = value + time;
            }
            this._totalTime = time;
        }
        return this._totalTime;
    }
}
