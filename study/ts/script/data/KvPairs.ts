import { BaseData } from './BaseData';
export class KvPairs extends BaseData {
    public _mapData;
    constructor (properties?) {
        super(properties);
        this._mapData = {};
    }
    public clear () {
    }
    public reset () {
    }
    public initData (message) {
        let data = {};
        let parameter = message['parameter'] || {};
        for (let k in parameter) {
            let v = parameter[k];
            let key = v['key'];
            let value = v['value'];
            data[key] = value;
        }
        this._mapData = data;
    }
    public setValue (key, value) {
        this._mapData[key] = String(value);
    }
    public getValue (key) {
        return this._mapData[key];
    }
}