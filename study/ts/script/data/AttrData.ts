import { BaseData } from "./BaseData";
import { G_UserData } from "../init";
import { AttrRecordUnitData } from "./AttrRecordUnitData";

let schema = {};
schema['curPower'] = [
    'number',
    0
];
schema['lastPower'] = [
    'number',
    0
];
export interface AttrData {
    getCurPower(): number
    setCurPower(value: number): void
    getLastCurPower(): number
    getLastPower(): number
    setLastPower(value: number): void
    getLastLastPower(): number
}
export class AttrData extends BaseData {
    public static schema = schema;
    constructor() {
        super()
        this._recordData = {};
        this._key2Power = {};
    }

    private _recordData;
    private _key2Power;

    reset() {
        this._recordData = {};
        this._key2Power = {};
    }
    clear() {
    }
    createRecordData(id): AttrRecordUnitData {
        var unitData = this.getRecordUnitData(id);
        if (unitData == null) {
            var properties = { id: id };
            unitData = new AttrRecordUnitData();
            unitData.setId(id);
            this._recordData['k_' + id] = unitData;
        }
        return unitData;
    }
    getRecordUnitData(id): AttrRecordUnitData {
        return this._recordData['k_' + id];
    }
    recordPower(value?) {
        value = value || G_UserData.getBase().getPower();
        var curValue = this.getCurPower();
        this.setLastPower(curValue);
        this.setCurPower(value);
    }
    getPowerDiffValue(): number {
        var curPower = this.getCurPower();
        var lastPower = this.getLastPower();
        var diffPower = curPower - lastPower;
        return diffPower;
    }
    recordPowerWithKey(key, value?) {
        console.assert(key, 'recordPowerWithKey, key can not be nil');
        value = value || G_UserData.getBase().getPower();
        var powerInfo = this._key2Power[key] || {};
        var curValue = powerInfo.curPower || 0;
        this._key2Power[key] = powerInfo;
        this._key2Power[key].lastPower = curValue;
        this._key2Power[key].curPower = value;
    }
    getCurPowerWithKey(key): number {
        var powerInfo = this._key2Power[key] || {};
        var curPower = powerInfo.curPower || 0;
        return curPower;
    }
    getPowerDiffValueWithKey(key): number {
        var powerInfo = this._key2Power[key] || {};
        var curPower = powerInfo.curPower || 0;
        var lastPower = powerInfo.lastPower || 0;
        var diffPower = curPower - lastPower;
        return diffPower;
    }
}